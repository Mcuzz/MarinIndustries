
const STORE_SHIPPING_KEY = "marin.store.shipping";

export type StoreShippingAddress = {
  recipient: string;
  phone: string;
  street: string;
  exteriorNumber: string;
  interiorNumber: string;
  neighborhood: string;
  zip: string;
  city: string;
  state: string;
  references: string;
};

export function saveStoreShipping(
  address: StoreShippingAddress,
): void {
  if (typeof window === "undefined") return;

  window.sessionStorage.setItem(
    STORE_SHIPPING_KEY,
    JSON.stringify(address),
  );
}

export function loadStoreShipping(): StoreShippingAddress | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.sessionStorage.getItem(STORE_SHIPPING_KEY);

    if (!stored) return null;

    const address: unknown = JSON.parse(stored);

    if (
      typeof address !== "object" ||
      address === null ||
      !("recipient" in address) ||
      !("street" in address) ||
      !("zip" in address) ||
      typeof address.recipient !== "string" ||
      typeof address.street !== "string" ||
      typeof address.zip !== "string"
    ) {
      return null;
    }

    return address as StoreShippingAddress;
  } catch {
    return null;
  }
}

export function clearStoreShipping(): void {
  if (typeof window === "undefined") return;

  window.sessionStorage.removeItem(STORE_SHIPPING_KEY);
}
