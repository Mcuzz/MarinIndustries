
import type {
  StoreOrderDraft,
  StoreOrderItem,
} from "@/src/domain/store/store-order";

export const STORE_CART_KEY = "marin.store.cart";
export const STORE_CHECKOUT_KEY = "marin.store.checkout";

export type StoreCheckoutItem = StoreOrderItem;
export type StoreCheckoutDraft = StoreOrderDraft;

function isValidItem(value: unknown): value is StoreOrderItem {
  if (typeof value !== "object" || value === null) return false;

  const item = value as Record<string, unknown>;

  return (
    typeof item.id === "string" &&
    item.id.length > 0 &&
    typeof item.nombre === "string" &&
    Number.isFinite(item.precio) &&
    (item.precio as number) >= 0 &&
    Number.isInteger(item.cantidad) &&
    (item.cantidad as number) > 0
  );
}

function isValidDraft(value: unknown): value is StoreOrderDraft {
  if (typeof value !== "object" || value === null) return false;

  const draft = value as Record<string, unknown>;

  return (
    Array.isArray(draft.items) &&
    draft.items.length > 0 &&
    draft.items.every(isValidItem) &&
    Number.isFinite(draft.subtotal) &&
    (draft.subtotal as number) >= 0 &&
    Number.isFinite(draft.iva) &&
    (draft.iva as number) >= 0 &&
    Number.isFinite(draft.total) &&
    (draft.total as number) >= 0
  );
}

export function saveStoreCheckout(draft: StoreCheckoutDraft): void {
  if (typeof window === "undefined") return;

  window.sessionStorage.setItem(
    STORE_CHECKOUT_KEY,
    JSON.stringify(draft),
  );
}

export function loadStoreCheckout(): StoreCheckoutDraft | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.sessionStorage.getItem(STORE_CHECKOUT_KEY);

    if (!stored) return null;

    const parsed: unknown = JSON.parse(stored);

    return isValidDraft(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function clearStoreCheckout(): void {
  if (typeof window === "undefined") return;

  window.sessionStorage.removeItem(STORE_CHECKOUT_KEY);
}
