import { NextResponse } from "next/server";

import { createCheckoutProPreference } from "@/src/infrastructure/payments/mercadopago-checkout-pro.gateway";
import { isCheckoutError, prepareOnlineOrder } from "@/src/infrastructure/store/online-checkout";
import {
  setOnlineOrderPreference,
  updateOnlineOrderPayment,
} from "@/src/infrastructure/store/supabase-online-order.repository";

// POST /api/pagos/mercadopago/preferencia  — pago en el sitio de Mercado Pago (Checkout Pro)
// Body: { items: [{ id, cantidad }], shipping: StoreShippingAddress, popup?: boolean }
// Responde: { initPoint, orderId }

function siteUrlFrom(request: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  return configured || new URL(request.url).origin;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const order = await prepareOnlineOrder(body, "mercadopago");
  if (isCheckoutError(order)) {
    return NextResponse.json({ error: order.error }, { status: order.status });
  }

  const result = await createCheckoutProPreference({
    orderId: order.orderId,
    items: order.chargeItems,
    payerName: order.shipping.recipient,
    siteUrl: siteUrlFrom(request),
    popup: (body as Record<string, unknown>).popup === true,
  });

  if (!result.ok) {
    // No se pudo abrir el pago: el pedido queda cancelado para no dejarlo colgado.
    await updateOnlineOrderPayment(order.orderId, {
      status: "cancelado",
      mpPaymentId: null,
      mpStatus: null,
      mpStatusDetail: "preference_error",
    });
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  await setOnlineOrderPreference(order.orderId, result.value.preferenceId);

  return NextResponse.json({ initPoint: result.value.initPoint, orderId: order.orderId });
}
