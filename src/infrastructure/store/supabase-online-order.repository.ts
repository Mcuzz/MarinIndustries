import "server-only";

import { fail, ok, type Result } from "@/src/domain/shared/result";
import type { StoreShippingAddress } from "@/src/infrastructure/sales/store-shipping.storage";
import { getSupabaseAdminClient } from "../supabase/admin";

// Pedidos de la tienda en línea → tablas pedidos_tienda / pedidos_tienda_detalles
// (supabase/migrations/20261112_pedidos_tienda.sql).

export type OnlineOrderStatus = "pendiente_pago" | "en_proceso" | "pagado" | "rechazado" | "cancelado";

export type NewOnlineOrder = {
  id: string;
  paymentMethod: "mercadopago" | "tarjeta";
  subtotal: number;
  iva: number;
  envio: number;
  total: number;
  shipping: StoreShippingAddress;
  items: {
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number; // sin IVA
  }[];
};

export type OnlineOrderPaymentUpdate = {
  status: Exclude<OnlineOrderStatus, "pendiente_pago">;
  mpPaymentId: string | null;
  mpStatus: string | null;
  mpStatusDetail: string | null;
};

const TABLE = "pedidos_tienda";
const DETAILS_TABLE = "pedidos_tienda_detalles";

/** false si no hay SUPABASE_SECRET_KEY: el checkout sigue funcionando pero sin guardar pedidos. */
export const isOnlineOrderStorageEnabled = () => getSupabaseAdminClient() !== null;

export async function createOnlineOrder(order: NewOnlineOrder): Promise<Result<true>> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return fail("Supabase no está configurado.");

  const s = order.shipping;
  const { error } = await supabase.from(TABLE).insert({
    id: order.id,
    estado: "pendiente_pago",
    metodo_pago: order.paymentMethod,
    subtotal: order.subtotal,
    iva: order.iva,
    envio: order.envio,
    total: order.total,
    destinatario: s.recipient,
    telefono: s.phone || null,
    calle: s.street,
    numero_exterior: s.exteriorNumber,
    numero_interior: s.interiorNumber || null,
    colonia: s.neighborhood,
    codigo_postal: s.zip,
    ciudad: s.city,
    entidad: s.state,
    referencias: s.references || null,
  });

  if (error) {
    console.error("[pedidos] No se pudo crear el pedido:", error.message);
    return fail("No pudimos registrar tu pedido. Intenta de nuevo.");
  }

  const { error: detailsError } = await supabase.from(DETAILS_TABLE).insert(
    order.items.map((item) => ({
      pedido_id: order.id,
      producto_id: item.productId,
      nombre: item.name,
      cantidad: item.quantity,
      precio_unitario: item.unitPrice,
      total: Math.round(item.unitPrice * item.quantity * 100) / 100,
    })),
  );

  if (detailsError) {
    console.error("[pedidos] No se pudieron guardar los productos del pedido:", detailsError.message);
    await supabase.from(TABLE).delete().eq("id", order.id);
    return fail("No pudimos registrar tu pedido. Intenta de nuevo.");
  }

  return ok(true);
}

export async function setOnlineOrderPreference(orderId: string, preferenceId: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return;

  const { error } = await supabase.from(TABLE).update({ mp_preference_id: preferenceId }).eq("id", orderId);
  if (error) console.error("[pedidos] No se pudo guardar la preferencia:", error.message);
}

/**
 * Actualiza el estado del pago. Un pedido ya "pagado" no se vuelve a modificar,
 * así que es seguro llamarlo muchas veces (consulta periódica y webhook).
 */
export async function updateOnlineOrderPayment(
  orderId: string,
  update: OnlineOrderPaymentUpdate,
): Promise<boolean> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return true; // sin Supabase configurado no hay nada que actualizar

  const { error } = await supabase
    .from(TABLE)
    .update({
      estado: update.status,
      mp_payment_id: update.mpPaymentId,
      mp_status: update.mpStatus,
      mp_status_detail: update.mpStatusDetail,
      ...(update.status === "pagado" ? { pagado_en: new Date().toISOString() } : {}),
    })
    .eq("id", orderId)
    .neq("estado", "pagado");

  if (error) {
    console.error("[pedidos] No se pudo actualizar el pago:", error.message);
    return false;
  }
  return true;
}
