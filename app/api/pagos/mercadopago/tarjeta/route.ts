import { NextResponse } from "next/server";

import {
  cardStatusMessage,
  createCardPayment,
  type CheckoutProPaymentStatus,
} from "@/src/infrastructure/payments/mercadopago-checkout-pro.gateway";
import { isCheckoutError, prepareOnlineOrder } from "@/src/infrastructure/store/online-checkout";
import {
  updateOnlineOrderPayment,
  type OnlineOrderPaymentUpdate,
} from "@/src/infrastructure/store/supabase-online-order.repository";

// POST /api/pagos/mercadopago/tarjeta  — pago con tarjeta sin salir de Marin
// Body: {
//   items: [{ id, cantidad }],
//   shipping: StoreShippingAddress,
//   card: { token, paymentMethodId, paymentTypeId, installments, email }
// }
// Responde: { orderId, status, paymentId, message }
//
// "token" lo genera MercadoPago.js en el navegador. Nunca recibimos el número de tarjeta.

const ORDER_STATUS: Record<Exclude<CheckoutProPaymentStatus, "none">, OnlineOrderPaymentUpdate["status"]> = {
  approved: "pagado",
  pending: "en_proceso",
  rejected: "rechazado",
};

const PAYMENT_TYPES = ["credit_card", "debit_card", "prepaid_card"] as const;

type CardInput = {
  token: string;
  paymentMethodId: string;
  paymentTypeId: (typeof PAYMENT_TYPES)[number];
  installments: number;
  email: string;
};

function parseCard(value: unknown): CardInput | null {
  if (typeof value !== "object" || value === null) return null;
  const raw = value as Record<string, unknown>;

  const token = typeof raw.token === "string" ? raw.token : "";
  const paymentMethodId = typeof raw.paymentMethodId === "string" ? raw.paymentMethodId : "";
  const email = typeof raw.email === "string" ? raw.email.trim() : "";
  const installments = Number(raw.installments);
  const paymentTypeId = PAYMENT_TYPES.find((type) => type === raw.paymentTypeId);

  if (!/^[A-Za-z0-9]{16,64}$/.test(token)) return null;
  if (!/^[a-z_]{2,30}$/.test(paymentMethodId)) return null;
  if (!Number.isInteger(installments) || installments < 1 || installments > 24) return null;
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  if (!paymentTypeId) return null;
  // Débito y prepago siempre se cobran en una sola exhibición.
  if (paymentTypeId !== "credit_card" && installments !== 1) return null;

  return { token, paymentMethodId, paymentTypeId, installments, email };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const card = parseCard((body as Record<string, unknown> | null)?.card);
  if (!card) {
    return NextResponse.json({ error: "Revisa los datos de la tarjeta y el correo." }, { status: 400 });
  }

  const order = await prepareOnlineOrder(body, "tarjeta");
  if (isCheckoutError(order)) {
    return NextResponse.json({ error: order.error }, { status: order.status });
  }

  const result = await createCardPayment({
    orderId: order.orderId,
    amount: order.total,
    token: card.token,
    paymentMethodId: card.paymentMethodId,
    paymentTypeId: card.paymentTypeId,
    installments: card.installments,
    payerEmail: card.email,
    description: `Pedido ${order.orderId} · Marin Industries`,
  });

  if (!result.ok) {
    await updateOnlineOrderPayment(order.orderId, {
      status: "cancelado",
      mpPaymentId: null,
      mpStatus: null,
      mpStatusDetail: "card_payment_error",
    });
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  const payment = result.value;
  if (payment.status !== "none") {
    await updateOnlineOrderPayment(order.orderId, {
      status: ORDER_STATUS[payment.status],
      mpPaymentId: payment.paymentId,
      mpStatus: payment.mpStatus,
      mpStatusDetail: payment.mpStatusDetail,
    });
  }

  return NextResponse.json({
    orderId: order.orderId,
    status: payment.status,
    paymentId: payment.paymentId,
    message: cardStatusMessage(payment.status, payment.mpStatusDetail),
  });
}
