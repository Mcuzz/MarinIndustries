import type { SaleDraft, SalesOrder } from "@/src/domain/sales/sale.entity";

// Persistencia temporal en sessionStorage para el flujo mock venta → pago.
// Se pierde al cerrar la pestaña; cambiar por la base de datos cuando exista backend.

const DRAFT_KEY = "marin.sales.draft";
const COMPLETED_KEY = "marin.sales.completed";

function read<T>(key: string): T | null {
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* almacenamiento no disponible: el flujo sigue en memoria */
  }
}

export const saveSaleDraft = (draft: SaleDraft) => write(DRAFT_KEY, draft);
export const loadSaleDraft = () => read<SaleDraft>(DRAFT_KEY);

export function clearSaleDraft() {
  try {
    window.sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    /* noop */
  }
}

export const loadCompletedOrders = () => read<SalesOrder[]>(COMPLETED_KEY) ?? [];

export function saveCompletedOrder(order: SalesOrder) {
  const current = loadCompletedOrders().filter((o) => o.id !== order.id);
  write(COMPLETED_KEY, [order, ...current]);
}
