import { NextResponse } from "next/server";
import { InvalidWebhookSignatureError, WebhookSignatureValidator } from "mercadopago";

import {
  lookupOrder,
  lookupPayment,
  type CheckoutProPaymentStatus,
} from "@/src/infrastructure/payments/mercadopago-checkout-pro.gateway";
import {
  updateOnlineOrderPayment,
  type OnlineOrderPaymentUpdate,
} from "@/src/infrastructure/store/supabase-online-order.repository";

// POST /api/pagos/mercadopago/webhook
//
// Mercado Pago avisa aquí cuando cambia un pago, aunque el cliente ya haya cerrado la página.
// Se configura en Tus integraciones → [app] → Webhooks, con los eventos:
//   - "Pagos" (payment)       → pagos de Checkout Pro (la ventana de Mercado Pago)
//   - "Order (Mercado Pago)"  → pagos con tarjeta dentro de Marin (Orders API)
//
// Seguridad:
//   1. Se valida la firma x-signature con MERCADOPAGO_WEBHOOK_SECRET.
//   2. Aunque la firma sea válida, NO se confía en el contenido del aviso: el estado real
//      se vuelve a consultar a Mercado Pago con nuestro token.
//
// Respuestas: 200 = recibido (MP deja de reintentar) · 401 = firma inválida ·
// 500 = error temporal (MP reintenta más tarde).

export const dynamic = "force-dynamic";

const ORDER_ID_PATTERN = /^MI-\d{10,16}-[0-9a-f]{8}$/;

const ORDER_STATUS: Record<Exclude<CheckoutProPaymentStatus, "none">, OnlineOrderPaymentUpdate["status"]> = {
  approved: "pagado",
  pending: "en_proceso",
  rejected: "rechazado",
};

type Notification = {
  type?: string;
  topic?: string;
  action?: string;
  data?: { id?: string | number };
};

/** MP firma el data.id en minúsculas cuando es alfanumérico; se prueba tal cual y en minúsculas. */
function isValidSignature(request: Request, dataId: string | null, secret: string): boolean {
  const options = {
    xSignature: request.headers.get("x-signature"),
    xRequestId: request.headers.get("x-request-id"),
    secret,
    toleranceSeconds: 60 * 60 * 24, // MP reintenta durante horas: tolerancia amplia contra repeticiones viejas
  };
  const candidates = dataId && dataId !== dataId.toLowerCase() ? [dataId, dataId.toLowerCase()] : [dataId];

  for (const candidate of candidates) {
    try {
      WebhookSignatureValidator.validate({ ...options, dataId: candidate });
      return true;
    } catch (error) {
      if (!(error instanceof InvalidWebhookSignatureError)) throw error;
    }
  }
  return false;
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const body = ((await request.json().catch(() => ({}))) ?? {}) as Notification;

  const topic = body.type ?? body.topic ?? url.searchParams.get("type") ?? url.searchParams.get("topic") ?? "";
  const dataId = url.searchParams.get("data.id") ?? (body.data?.id != null ? String(body.data.id) : null);

  // 1. Firma
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (secret && !secret.startsWith("pega_aqui") && !secret.startsWith("tu_")) {
    if (!isValidSignature(request, url.searchParams.get("data.id") ?? dataId, secret)) {
      console.warn("[webhook] Firma inválida", { topic, dataId, requestId: request.headers.get("x-request-id") });
      return NextResponse.json({ error: "Firma inválida." }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === "production") {
    console.error("[webhook] Falta MERCADOPAGO_WEBHOOK_SECRET: se rechaza el aviso.");
    return NextResponse.json({ error: "Webhook no configurado." }, { status: 500 });
  } else {
    console.warn("[webhook] MERCADOPAGO_WEBHOOK_SECRET no configurada: se acepta el aviso sin validar firma (solo desarrollo).");
  }

  if (!dataId) {
    return NextResponse.json({ received: true, ignored: "sin data.id" });
  }

  // 2. Consultar el estado real a Mercado Pago
  const lookup =
    topic === "payment"
      ? await lookupPayment(dataId)
      : topic === "order" || topic === "orders"
        ? await lookupOrder(dataId)
        : null;

  if (!lookup) {
    // Otros eventos (merchant_order, etc.) no nos interesan.
    return NextResponse.json({ received: true, ignored: topic || "sin tipo" });
  }
  if (!lookup.ok) {
    return NextResponse.json({ error: lookup.error }, { status: 500 }); // MP reintentará
  }

  const { orderId, status, paymentId, mpStatus, mpStatusDetail } = lookup.value;
  if (!orderId || !ORDER_ID_PATTERN.test(orderId) || status === "none") {
    // Pago que no es de la tienda (p. ej. pruebas manuales) o sin estado definitivo.
    return NextResponse.json({ received: true, ignored: "no es un pedido de la tienda" });
  }

  // 3. Actualizar el pedido (un pedido ya "pagado" nunca se modifica; el trigger descuenta existencia)
  const saved = await updateOnlineOrderPayment(orderId, {
    status: ORDER_STATUS[status],
    mpPaymentId: paymentId,
    mpStatus,
    mpStatusDetail,
  });
  if (!saved) {
    return NextResponse.json({ error: "No se pudo actualizar el pedido." }, { status: 500 }); // MP reintentará
  }

  console.info(`[webhook] ${topic} ${dataId} → pedido ${orderId}: ${ORDER_STATUS[status]}`);
  return NextResponse.json({ received: true });
}
