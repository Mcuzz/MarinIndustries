"use client";

import { loadMercadoPago } from "@mercadopago/sdk-js";

// Tipos mínimos de MercadoPago.js v2 (el SDK oficial no los incluye).
// Docs: https://www.mercadopago.com.mx/developers/es/docs/checkout-api/integration-configuration/card/integrate-via-core-methods

export type MpFieldType = "cardNumber" | "expirationDate" | "securityCode";

export type MpFieldStyle = Partial<{
  height: string;
  padding: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  color: string;
  placeholderColor: string;
}>;

export type MpFieldEventMap = {
  binChange: { bin: string | null };
  validityChange: { field: MpFieldType; errorMessages: { message: string; cause: string }[] };
  focus: { field: MpFieldType };
  blur: { field: MpFieldType };
  ready: { field: MpFieldType };
  error: unknown;
};

export interface MpField {
  mount(containerId: string): MpField;
  unmount(): void;
  update(options: { settings?: unknown; placeholder?: string }): void;
  on<E extends keyof MpFieldEventMap>(event: E, handler: (data: MpFieldEventMap[E]) => void): MpField;
}

export type MpPaymentMethod = {
  id: string; // visa, master, amex, debvisa, debmaster...
  name: string; // "Visa", "Mastercard"...
  payment_type_id: "credit_card" | "debit_card" | "prepaid_card" | string;
  secure_thumbnail?: string;
  thumbnail?: string;
  issuer?: { id: number; name: string };
  settings?: { card_number?: unknown; security_code?: { length: number } }[];
};

export type MpPayerCost = {
  installments: number;
  recommended_message: string;
  installment_rate: number;
  total_amount: number;
};

export interface MercadoPagoInstance {
  fields: {
    create(type: MpFieldType, options?: { placeholder?: string; style?: MpFieldStyle }): MpField;
    createCardToken(data: { cardholderName: string }): Promise<{ id: string; last_four_digits?: string }>;
  };
  getPaymentMethods(data: { bin: string }): Promise<{ results: MpPaymentMethod[] }>;
  getIssuers(data: { paymentMethodId: string; bin: string }): Promise<{ id: number; name: string }[]>;
  getInstallments(data: {
    amount: string;
    bin: string;
    paymentTypeId?: string;
  }): Promise<{ payer_costs: MpPayerCost[]; issuer?: { id: number } }[]>;
}

declare global {
  interface Window {
    MercadoPago?: new (publicKey: string, options?: { locale?: string }) => MercadoPagoInstance;
  }
}

let instance: Promise<MercadoPagoInstance> | null = null;

/** Carga MercadoPago.js (una sola vez) y crea la instancia con la Public Key. */
export function getMercadoPago(): Promise<MercadoPagoInstance> {
  if (!instance) {
    instance = (async () => {
      const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
      if (!publicKey) throw new Error("Falta NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY.");
      await loadMercadoPago();
      if (!window.MercadoPago) throw new Error("No se pudo cargar MercadoPago.js.");
      return new window.MercadoPago(publicKey, { locale: "es-MX" });
    })();
    instance.catch(() => {
      instance = null; // permitir reintentar si falló la carga
    });
  }
  return instance;
}

/** Nombre amigable de la marca. */
export function brandLabel(method: MpPaymentMethod | null): string {
  if (!method) return "";
  const known: Record<string, string> = {
    visa: "Visa",
    debvisa: "Visa",
    master: "Mastercard",
    debmaster: "Mastercard",
    amex: "American Express",
    carnet: "Carnet",
    debcarnet: "Carnet",
  };
  return known[method.id] ?? method.name;
}

export function cardTypeLabel(method: MpPaymentMethod | null): string {
  if (!method) return "";
  if (method.payment_type_id === "credit_card") return "Crédito";
  if (method.payment_type_id === "debit_card") return "Débito";
  if (method.payment_type_id === "prepaid_card") return "Prepago";
  return "";
}
