import { NextResponse } from "next/server";

import {
  findCheckoutProPayment,
  type CheckoutProPaymentStatus,
} from "@/src/infrastructure/payments/mercadopago-checkout-pro.gateway";
import {
  updateOnlineOrderPayment,
  type OnlineOrderPaymentUpdate,
} from "@/src/infrastructure/store/supabase-online-order.repository";

// GET /api/pagos/mercadopago/estado?pedido=MI-...
// Responde: { status: "approved" | "pending" | "rejected" | "none", paymentId }
//
// La página de Marin lo consulta cada pocos segundos mientras el cliente paga en la ventana
// de Mercado Pago. Es nuestro servidor el que pregunta a MP (funciona en localhost, sin webhook),
// así que la respuesta es confiable y se usa también para actualizar el pedido en Supabase.

const ORDER_ID_PATTERN = /^MI-\d{10,16}-[0-9a-f]{8}$/;

const ORDER_STATUS: Record<Exclude<CheckoutProPaymentStatus, "none">, OnlineOrderPaymentUpdate["status"]> = {
  approved: "pagado",
  pending: "en_proceso",
  rejected: "rechazado",
};

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const orderId = new URL(request.url).searchParams.get("pedido") ?? "";
  if (!ORDER_ID_PATTERN.test(orderId)) {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const result = await findCheckoutProPayment(orderId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  const { status, paymentId, mpStatus, mpStatusDetail } = result.value;
  if (status !== "none") {
    await updateOnlineOrderPayment(orderId, {
      status: ORDER_STATUS[status],
      mpPaymentId: paymentId,
      mpStatus,
      mpStatusDetail,
    });
  }

  return NextResponse.json(
    { status, paymentId },
    { headers: { "Cache-Control": "no-store" } },
  );
}
