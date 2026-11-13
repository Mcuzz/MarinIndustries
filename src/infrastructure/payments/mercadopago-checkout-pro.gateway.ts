import "server-only";

import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import { fail, ok, type Result } from "@/src/domain/shared/result";

// Conector con Mercado Pago Checkout Pro.
// SOLO SERVIDOR: usa MERCADOPAGO_ACCESS_TOKEN, que nunca debe llegar al navegador.

export type CheckoutProItem = {
  id: string;
  title: string;
  quantity: number;
  unitPrice: number;
};

export type CheckoutProRequest = {
  orderId: string;
  items: CheckoutProItem[];
  payerName?: string;
  siteUrl: string;
  /** true cuando el checkout se abre en una ventana emergente (la página de regreso se cierra sola). */
  popup?: boolean;
};

/**
 * Minutos que dura abierta la liga de pago. Después Mercado Pago ya no acepta pagos
 * con ella y el pedido se cancela en Supabase (ver 20261112_cancelar_pedidos_abandonados.sql,
 * que usa un margen mayor para no cancelar pagos que se estén procesando).
 */
export const CHECKOUT_EXPIRATION_MINUTES = 30;

export type CheckoutProPreference = {
  preferenceId: string;
  initPoint: string;
};

function getClient(): MercadoPagoConfig | null {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken || accessToken.startsWith("pega_aqui") || accessToken.startsWith("tu_")) {
    return null;
  }
  return new MercadoPagoConfig({ accessToken, options: { timeout: 10000 } });
}

export async function createCheckoutProPreference(
  request: CheckoutProRequest,
): Promise<Result<CheckoutProPreference>> {
  const client = getClient();
  if (!client) {
    return fail("Mercado Pago no está configurado (falta MERCADOPAGO_ACCESS_TOKEN).");
  }

  const returnUrl = `${request.siteUrl}/tienda/pago/confirmacion${request.popup ? "?ventana=1" : ""}`;
  // Mercado Pago rechaza auto_return con URLs locales (http://localhost).
  const canAutoReturn = request.siteUrl.startsWith("https://");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CHECKOUT_EXPIRATION_MINUTES * 60_000);

  try {
    const preference = await new Preference(client).create({
      body: {
        external_reference: request.orderId,
        items: request.items.map((item) => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          currency_id: "MXN",
        })),
        payer: request.payerName ? { name: request.payerName } : undefined,
        back_urls: {
          success: returnUrl,
          failure: returnUrl,
          pending: returnUrl,
        },
        auto_return: canAutoReturn ? "approved" : undefined,
        statement_descriptor: "MARIN INDUSTRIES",
        expires: true,
        expiration_date_from: now.toISOString(),
        expiration_date_to: expiresAt.toISOString(),
      },
      requestOptions: { idempotencyKey: request.orderId },
    });

    if (!preference.id || !preference.init_point) {
      return fail("Mercado Pago no devolvió la liga de pago.");
    }

    return ok({ preferenceId: preference.id, initPoint: preference.init_point });
  } catch (error) {
    console.error("[mercadopago] Error al crear la preferencia:", error);
    return fail("No pudimos conectar con Mercado Pago. Intenta de nuevo en unos minutos.");
  }
}

export type CheckoutProPaymentStatus = "approved" | "pending" | "rejected" | "none";

export type CheckoutProPaymentLookup = {
  status: CheckoutProPaymentStatus;
  paymentId: string | null;
  /** Estado y detalle tal cual los da Mercado Pago (ej. "approved" / "accredited"). */
  mpStatus: string | null;
  mpStatusDetail: string | null;
};

const PENDING_STATUSES = new Set(["pending", "in_process", "authorized", "in_mediation"]);
const REJECTED_STATUSES = new Set(["rejected", "cancelled", "refunded", "charged_back"]);

/**
 * Consulta a Mercado Pago los pagos de un pedido (por external_reference).
 * Un mismo pedido puede tener varios intentos (p. ej. una tarjeta rechazada y luego otra aprobada):
 * gana el aprobado, luego el pendiente y al final el rechazado.
 */
export async function findCheckoutProPayment(
  orderId: string,
): Promise<Result<CheckoutProPaymentLookup>> {
  const client = getClient();
  if (!client) {
    return fail("Mercado Pago no está configurado (falta MERCADOPAGO_ACCESS_TOKEN).");
  }

  try {
    const search = await new Payment(client).search({
      options: { external_reference: orderId, sort: "date_created", criteria: "desc", limit: 20 },
    });
    const payments = search.results ?? [];

    const pick = (match: (status: string) => boolean) =>
      payments.find((payment) => payment.status && match(payment.status));

    const describe = (status: CheckoutProPaymentStatus, payment: (typeof payments)[number]) =>
      ok({
        status,
        paymentId: String(payment.id),
        mpStatus: payment.status ?? null,
        mpStatusDetail: payment.status_detail ?? null,
      });

    const approved = pick((status) => status === "approved");
    if (approved) return describe("approved", approved);

    const pending = pick((status) => PENDING_STATUSES.has(status));
    if (pending) return describe("pending", pending);

    const rejected = pick((status) => REJECTED_STATUSES.has(status));
    if (rejected) return describe("rejected", rejected);

    return ok({ status: "none", paymentId: null, mpStatus: null, mpStatusDetail: null });
  } catch (error) {
    console.error("[mercadopago] Error al consultar el pago:", error);
    return fail("No pudimos consultar el estado del pago.");
  }
}

// ---------------------------------------------------------------------------
// Pago con tarjeta dentro de Marin (Checkout API vía Orders API: POST /v1/orders).
// El navegador captura la tarjeta en campos seguros de Mercado Pago (iframes) y nos manda
// solo un TOKEN de un solo uso: el número de tarjeta nunca pasa por nuestro servidor.
//
// Nota: se usa /v1/orders y no /v1/payments porque Mercado Pago ya marca /v1/payments como
// "legacy" y responde 401 "Unauthorized use of live credentials" con las credenciales nuevas.
// Se llama con fetch (no con el SDK) para poder leer el motivo de rechazo de la respuesta 402.
// ---------------------------------------------------------------------------

const ORDERS_URL = "https://api.mercadopago.com/v1/orders";

export type CardPaymentRequest = {
  orderId: string;
  amount: number;
  token: string;
  paymentMethodId: string; // visa, master, amex, debvisa...
  paymentTypeId: "credit_card" | "debit_card" | "prepaid_card";
  installments: number;
  payerEmail: string;
  description: string;
};

export type CardPaymentResult = {
  status: CheckoutProPaymentStatus;
  paymentId: string | null;
  mpStatus: string | null;
  mpStatusDetail: string | null;
};

type OrdersPayment = { id?: string; status?: string; status_detail?: string };
type OrdersResponse = {
  id?: string;
  status?: string;
  status_detail?: string;
  transactions?: { payments?: OrdersPayment[] };
  errors?: { code?: string; message?: string; details?: string[] }[];
  message?: string;
};

export async function createCardPayment(request: CardPaymentRequest): Promise<Result<CardPaymentResult>> {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!getClient() || !accessToken) {
    return fail("Mercado Pago no está configurado (falta MERCADOPAGO_ACCESS_TOKEN).");
  }

  const amount = request.amount.toFixed(2);

  let response: Response;
  let data: OrdersResponse;
  try {
    response = await fetch(ORDERS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        // Si la petición se repite (doble clic, reintento de red) MP no cobra dos veces.
        "X-Idempotency-Key": request.orderId,
      },
      body: JSON.stringify({
        type: "online",
        processing_mode: "automatic",
        total_amount: amount,
        external_reference: request.orderId,
        description: request.description,
        payer: { email: request.payerEmail },
        transactions: {
          payments: [
            {
              amount,
              payment_method: {
                id: request.paymentMethodId,
                type: request.paymentTypeId,
                token: request.token,
                installments: request.installments,
              },
            },
          ],
        },
      }),
      signal: AbortSignal.timeout(20000),
    });
    data = (await response.json().catch(() => ({}))) as OrdersResponse;
  } catch (error) {
    console.error("[mercadopago] Error de red al cobrar con tarjeta:", error);
    return fail("No pudimos conectar con Mercado Pago. Intenta de nuevo en unos minutos.");
  }

  // Aprobado o pendiente: 201 con el detalle del pago.
  if (response.ok) {
    const payment = data.transactions?.payments?.[0];
    const orderStatus = data.status ?? null;
    const status: CheckoutProPaymentStatus =
      orderStatus === "processed"
        ? "approved"
        : orderStatus === "processing" || orderStatus === "action_required"
          ? "pending"
          : "rejected";

    return ok({
      status,
      paymentId: payment?.id ?? null,
      mpStatus: orderStatus,
      mpStatusDetail: payment?.status_detail ?? data.status_detail ?? null,
    });
  }

  // Rechazado por el banco: 402 con "errors[].details" = ["PAY01...: rejected_by_issuer"].
  if (response.status === 402) {
    const detailLine = data.errors?.flatMap((e) => e.details ?? [])[0] ?? "";
    const separator = detailLine.indexOf(":");
    const paymentId = separator > 0 ? detailLine.slice(0, separator).trim() : null;
    const reason = (separator > 0 ? detailLine.slice(separator + 1) : detailLine).trim();

    return ok({
      status: "rejected",
      paymentId,
      mpStatus: "failed",
      mpStatusDetail: reason || null,
    });
  }

  console.error("[mercadopago] Error al cobrar con tarjeta:", response.status, JSON.stringify(data).slice(0, 500));
  const base = "No pudimos procesar la tarjeta. Revisa los datos e intenta de nuevo.";
  // En desarrollo se muestra el motivo real de Mercado Pago para poder diagnosticar.
  if (process.env.NODE_ENV !== "production") {
    const detail = data.errors?.[0]?.message ?? data.message;
    return fail(detail ? `${base} [Mercado Pago ${response.status}: ${detail}]` : base);
  }
  return fail(base);
}

/** Mensaje para el cliente según el motivo que da Mercado Pago (Orders API o Payments API). */
export function cardStatusMessage(status: CheckoutProPaymentStatus, detail: string | null): string {
  if (status === "approved") return "Pago aprobado.";
  if (status === "pending") {
    return detail?.includes("challenge")
      ? "Tu banco necesita una verificación adicional. Intenta de nuevo o usa otra tarjeta."
      : "Tu pago está en revisión. Te avisaremos por correo cuando se acredite.";
  }

  const d = (detail ?? "").toLowerCase();
  const rules: [string[], string][] = [
    [["insufficient"], "La tarjeta no tiene fondos suficientes."],
    [["security_code"], "Revisa el código de seguridad (CVV)."],
    [["date", "expir"], "Revisa la fecha de vencimiento."],
    [["card_number"], "Revisa el número de la tarjeta."],
    [["call_for_authorize", "authorize"], "Tu banco pide que autorices el pago. Llámales y vuelve a intentarlo."],
    [["disabled"], "La tarjeta está inactiva. Actívala con tu banco o usa otra."],
    [["duplicated"], "Ya hiciste un pago por este monto. Si necesitas volver a pagar, usa otra tarjeta."],
    [["high_risk", "fraud", "blacklist"], "El pago fue rechazado por seguridad. Usa otra tarjeta o paga con Mercado Pago."],
    [["installments"], "La tarjeta no acepta esa cantidad de meses."],
    [["max_attempts"], "Llegaste al límite de intentos. Usa otra tarjeta."],
    [["bad_filled", "card_data"], "Revisa los datos de la tarjeta."],
  ];
  const match = rules.find(([keys]) => keys.some((key) => d.includes(key)));
  return match ? match[1] : "Tu banco rechazó el pago. Intenta con otra tarjeta.";
}

// ---------------------------------------------------------------------------
// Consultas para el webhook: el aviso de Mercado Pago solo trae un id; el estado real
// SIEMPRE se vuelve a pedir a Mercado Pago con nuestro token (nunca se confía en el aviso).
// ---------------------------------------------------------------------------

export type MercadoPagoLookup = {
  /** Nuestro número de pedido (MI-...), que mandamos como external_reference. */
  orderId: string | null;
  status: CheckoutProPaymentStatus;
  paymentId: string | null;
  mpStatus: string | null;
  mpStatusDetail: string | null;
};

/** Pagos de Checkout Pro (topic "payment"). */
export async function lookupPayment(paymentId: string): Promise<Result<MercadoPagoLookup>> {
  const client = getClient();
  if (!client) return fail("Mercado Pago no está configurado.");

  try {
    const payment = await new Payment(client).get({ id: paymentId });
    const mpStatus = payment.status ?? null;
    const status: CheckoutProPaymentStatus =
      mpStatus === "approved"
        ? "approved"
        : mpStatus && PENDING_STATUSES.has(mpStatus)
          ? "pending"
          : mpStatus && REJECTED_STATUSES.has(mpStatus)
            ? "rejected"
            : "none";

    return ok({
      orderId: payment.external_reference ?? null,
      status,
      paymentId: payment.id ? String(payment.id) : paymentId,
      mpStatus,
      mpStatusDetail: payment.status_detail ?? null,
    });
  } catch (error) {
    // Pago inexistente (p. ej. aviso de prueba del panel): no tiene caso que MP reintente.
    if ((error as { name?: string } | null)?.name === "MPNotFoundError") {
      return ok({ orderId: null, status: "none", paymentId, mpStatus: null, mpStatusDetail: null });
    }
    console.error("[mercadopago] No se pudo consultar el pago", paymentId, error);
    return fail("No se pudo consultar el pago.");
  }
}

/** Órdenes de la Orders API, usadas por el pago con tarjeta (topic "order"). */
export async function lookupOrder(mpOrderId: string): Promise<Result<MercadoPagoLookup>> {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!getClient() || !accessToken) return fail("Mercado Pago no está configurado.");

  try {
    const response = await fetch(`${ORDERS_URL}/${encodeURIComponent(mpOrderId)}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(15000),
    });
    if (response.status === 404) {
      return ok({ orderId: null, status: "none", paymentId: null, mpStatus: null, mpStatusDetail: null });
    }
    if (!response.ok) return fail(`Mercado Pago respondió ${response.status} al consultar la orden.`);

    const order = (await response.json()) as OrdersResponse & { external_reference?: string };
    const payment = order.transactions?.payments?.[0];
    const mpStatus = order.status ?? null;
    const status: CheckoutProPaymentStatus =
      mpStatus === "processed"
        ? "approved"
        : mpStatus === "processing" || mpStatus === "action_required"
          ? "pending"
          : mpStatus === "failed" || mpStatus === "canceled" || mpStatus === "expired"
            ? "rejected"
            : "none";

    return ok({
      orderId: order.external_reference ?? null,
      status,
      paymentId: payment?.id ?? null,
      mpStatus,
      mpStatusDetail: payment?.status_detail ?? order.status_detail ?? null,
    });
  } catch (error) {
    console.error("[mercadopago] No se pudo consultar la orden", mpOrderId, error);
    return fail("No se pudo consultar la orden.");
  }
}
