export type SaleItemType = "producto" | "servicio";

export type CatalogItem = {
  id: string;
  name: string;
  type: SaleItemType;
  unitPrice: number;
  /** null = no maneja inventario (servicios) */
  stock: number | null;
};

export type SaleClient = {
  id: string;
  name: string;
  rfc: string;
};

export type Branch = {
  id: string;
  name: string;
};

export type OrderStatus = "Completado" | "Pendiente" | "Anulado";
export type OrderKind = "Producto" | "Servicio" | "Mixto";

export type SalesOrder = {
  id: string;
  clientName: string;
  rfc: string;
  kind: OrderKind;
  total: number;
  status: OrderStatus;
  paymentMethod?: string;
};

export type SaleTotals = {
  subtotal: number;
  tax: number;
  total: number;
};

export type SaleDraft = SaleTotals & {
  folio: string;
  branch: Branch;
  client: SaleClient;
  item: CatalogItem;
  quantity: number;
  createdAt: string;
};

export const IVA_RATE = 0.16;
export const MAX_SERVICE_QUANTITY = 99;

const round2 = (n: number) => Math.round(n * 100) / 100;

export function computeSaleTotals(unitPrice: number, quantity: number): SaleTotals {
  const safeQty = Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
  const subtotal = round2(unitPrice * safeQty);
  const tax = round2(subtotal * IVA_RATE);
  return { subtotal, tax, total: round2(subtotal + tax) };
}

const mxn = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

export function formatMXN(amount: number): string {
  return mxn.format(amount);
}

export type SaleInput = {
  clientId: string;
  itemId: string;
  quantity: string;
};

export type SaleInputErrors = Partial<Record<keyof SaleInput, string>>;

export function validateSaleInput(
  input: SaleInput,
  item: CatalogItem | undefined,
): SaleInputErrors {
  const errors: SaleInputErrors = {};

  if (!input.clientId) errors.clientId = "Selecciona la empresa o cliente.";
  if (!input.itemId || !item) errors.itemId = "Selecciona un producto o servicio del catálogo.";

  const raw = input.quantity.trim();
  const qty = Number(raw);

  if (!raw) {
    errors.quantity = "Indica la cantidad.";
  } else if (!/^\d+$/.test(raw) || qty < 1) {
    errors.quantity = "La cantidad debe ser un número entero mayor a 0.";
  } else if (item?.stock !== null && item?.stock !== undefined && qty > item.stock) {
    errors.quantity = `Solo hay ${item.stock} pzs en stock.`;
  } else if (item?.stock === null && qty > MAX_SERVICE_QUANTITY) {
    errors.quantity = `Máximo ${MAX_SERVICE_QUANTITY} unidades por servicio.`;
  }

  return errors;
}

export function nextSaleFolio(existing: Pick<SalesOrder, "id">[]): string {
  const max = existing.reduce((acc, order) => {
    const n = Number(order.id.replace(/\D/g, ""));
    return Number.isFinite(n) && n > acc ? n : acc;
  }, 0);
  return `VEN-${String(max + 1).padStart(5, "0")}`;
}
