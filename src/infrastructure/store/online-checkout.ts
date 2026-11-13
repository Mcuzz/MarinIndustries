import "server-only";

import { container } from "@/src/infrastructure/composition/root-container";
import type { CheckoutProItem } from "@/src/infrastructure/payments/mercadopago-checkout-pro.gateway";
import type { StoreShippingAddress } from "@/src/infrastructure/sales/store-shipping.storage";
import { computeStoreTotals, priceWithIva } from "@/src/domain/store/store-pricing";
import {
  createOnlineOrder,
  isOnlineOrderStorageEnabled,
  type NewOnlineOrder,
} from "./supabase-online-order.repository";

// Lógica común de los dos pagos de la tienda (Checkout Pro y tarjeta):
//   1. Validar carrito y dirección que manda el navegador.
//   2. Recalcular precios con el catálogo del servidor (nadie puede alterar el monto).
//   3. Registrar el pedido en Supabase como "pendiente_pago".

const MAX_ITEMS = 50;
const MAX_QUANTITY = 99;

export type CheckoutError = { error: string; status: number };

export type PreparedOrder = {
  orderId: string;
  /** Partidas tal como se cobran (precio con IVA + envío). */
  chargeItems: CheckoutProItem[];
  /** Lo que se cobra: suma exacta de chargeItems. */
  total: number;
  shipping: StoreShippingAddress;
};

type RequestItem = { id: string; cantidad: number };

function parseItems(value: unknown): RequestItem[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_ITEMS) return null;

  const items: RequestItem[] = [];
  for (const raw of value) {
    if (typeof raw !== "object" || raw === null) return null;
    const { id, cantidad } = raw as Record<string, unknown>;
    if (typeof id !== "string" || id.length === 0 || id.length > 100) return null;
    if (!Number.isInteger(cantidad) || (cantidad as number) < 1 || (cantidad as number) > MAX_QUANTITY) {
      return null;
    }
    items.push({ id, cantidad: cantidad as number });
  }
  return items;
}

// Mismas reglas que el formulario de envío (ShippingForm).
type FieldRule = { max: number; required: boolean; pattern?: RegExp };
const SHIPPING_FIELDS: Record<keyof StoreShippingAddress, FieldRule> = {
  recipient: { max: 100, required: true },
  phone: { max: 10, required: true, pattern: /^\d{10}$/ },
  street: { max: 120, required: true },
  exteriorNumber: { max: 15, required: true },
  interiorNumber: { max: 15, required: false },
  neighborhood: { max: 100, required: true },
  zip: { max: 5, required: true, pattern: /^\d{5}$/ },
  city: { max: 100, required: true },
  state: { max: 100, required: true },
  references: { max: 300, required: false },
};

function parseShipping(value: unknown): StoreShippingAddress | null {
  if (typeof value !== "object" || value === null) return null;
  const raw = value as Record<string, unknown>;
  const result = {} as StoreShippingAddress;

  for (const [field, rule] of Object.entries(SHIPPING_FIELDS) as [keyof StoreShippingAddress, FieldRule][]) {
    const fieldValue = typeof raw[field] === "string" ? (raw[field] as string).trim() : "";
    if (rule.required && !fieldValue) return null;
    if (fieldValue.length > rule.max) return null;
    if (fieldValue && rule.pattern && !rule.pattern.test(fieldValue)) return null;
    result[field] = fieldValue;
  }
  return result;
}

function newOrderId() {
  return `MI-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
}

/**
 * Valida el cuerpo { items, shipping }, calcula importes y registra el pedido.
 * Devuelve el pedido listo para cobrar o un error con su código HTTP.
 */
export async function prepareOnlineOrder(
  body: unknown,
  paymentMethod: NewOnlineOrder["paymentMethod"],
): Promise<PreparedOrder | CheckoutError> {
  const { items: rawItems, shipping: rawShipping } = (body ?? {}) as Record<string, unknown>;

  const requested = parseItems(rawItems);
  if (!requested) return { error: "El carrito no es válido.", status: 400 };

  const shipping = parseShipping(rawShipping);
  if (!shipping) return { error: "Revisa los datos de envío.", status: 400 };

  const chargeItems: CheckoutProItem[] = [];
  const orderItems: NewOnlineOrder["items"] = [];

  for (const { id, cantidad } of requested) {
    const product = await container.products.getProductById(id);
    if (!product || product.estado !== "activo") {
      return { error: "Uno de los productos ya no está disponible. Revisa tu carrito.", status: 409 };
    }
    if (product.existencia < cantidad) {
      return {
        error:
          product.existencia > 0
            ? `Solo quedan ${product.existencia} piezas de "${product.nombre}". Ajusta la cantidad en tu carrito.`
            : `"${product.nombre}" se agotó. Quítalo de tu carrito para continuar.`,
        status: 409,
      };
    }

    orderItems.push({ productId: product.id, name: product.nombre, quantity: cantidad, unitPrice: product.precio });
    chargeItems.push({
      id: product.id,
      title: product.nombre.slice(0, 250),
      quantity: cantidad,
      unitPrice: priceWithIva(product.precio),
    });
  }

  // Misma función que usan las páginas: el total mostrado y el cobrado coinciden al centavo.
  const { subtotal, iva, envio, total } = computeStoreTotals(
    orderItems.map((item) => ({ precio: item.unitPrice, cantidad: item.quantity })),
  );
  if (envio > 0) {
    chargeItems.push({ id: "envio", title: "Envío", quantity: 1, unitPrice: envio });
  }

  const orderId = newOrderId();

  if (isOnlineOrderStorageEnabled()) {
    const saved = await createOnlineOrder({ id: orderId, paymentMethod, subtotal, iva, envio, total, shipping, items: orderItems });
    if (!saved.ok) return { error: saved.error, status: 500 };
  } else {
    console.warn(`[pedidos] SUPABASE_SECRET_KEY no configurada: el pedido ${orderId} no se guardará.`);
  }

  return { orderId, chargeItems, total, shipping };
}

export const isCheckoutError = (value: PreparedOrder | CheckoutError): value is CheckoutError =>
  "error" in value;
