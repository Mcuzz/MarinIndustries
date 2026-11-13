// Reglas de precio de la tienda en línea.
// FUENTE ÚNICA: la usan el carrito, todas las páginas del checkout y el servidor que cobra,
// para que el total que ve el cliente sea exactamente el que se cobra (al centavo).

export const STORE_IVA_RATE = 0.16;
export const STORE_SHIPPING_RATE = 0.08;

export const roundMoney = (value: number) => Math.round(value * 100) / 100;

/** Precio unitario con IVA incluido (redondeado por pieza, como se manda a Mercado Pago). */
export const priceWithIva = (price: number) => roundMoney(price * (1 + STORE_IVA_RATE));

/** Envío: 8% del subtotal de productos (sin IVA). */
export const shippingFor = (subtotal: number) => roundMoney(subtotal * STORE_SHIPPING_RATE);

export type StoreTotals = {
  /** Productos sin IVA. */
  subtotal: number;
  iva: number;
  envio: number;
  /** Lo que se cobra: productos con IVA + envío. */
  total: number;
};

/**
 * Totales de un carrito. `precio` es el precio unitario sin IVA.
 * Con `includeShipping: false` (vista del carrito) el total no incluye envío.
 */
export function computeStoreTotals(
  items: { precio: number; cantidad: number }[],
  { includeShipping = true }: { includeShipping?: boolean } = {},
): StoreTotals {
  const subtotal = roundMoney(items.reduce((sum, item) => sum + item.precio * item.cantidad, 0));
  const productsWithIva = roundMoney(
    items.reduce((sum, item) => sum + priceWithIva(item.precio) * item.cantidad, 0),
  );
  const envio = includeShipping ? shippingFor(subtotal) : 0;
  const total = roundMoney(productsWithIva + envio);

  return { subtotal, iva: roundMoney(productsWithIva - subtotal), envio, total };
}
