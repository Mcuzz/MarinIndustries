import { fail, ok, type Result } from "@/src/domain/shared/result";
import {
  detectCardBrand,
  onlyDigits,
  type CardPaymentForm,
} from "@/src/domain/payments/card-payment";
import type { SaleDraft } from "@/src/domain/sales/sale.entity";

// Pasarela SIMULADA: no envía datos a ningún lado ni cobra nada.
// Tarjetas de prueba:
//   4242 4242 4242 4242  → aprobada
//   4000 0000 0000 0002  → rechazada (fondos insuficientes)

export const TEST_CARD_APPROVED = "4242 4242 4242 4242";
export const TEST_CARD_DECLINED = "4000 0000 0000 0002";

export type CardPaymentReceipt = {
  authorization: string;
  last4: string;
  brand: ReturnType<typeof detectCardBrand>;
  paidAt: string;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function processMockCardPayment(
  _draft: SaleDraft,
  form: CardPaymentForm,
): Promise<Result<CardPaymentReceipt>> {
  await wait(1400);

  const digits = onlyDigits(form.number);

  if (digits === onlyDigits(TEST_CARD_DECLINED)) {
    return fail("El banco rechazó el cargo por fondos insuficientes (simulado). Intenta con otra tarjeta.");
  }

  return ok({
    authorization: String(Math.floor(100000 + Math.random() * 900000)),
    last4: digits.slice(-4),
    brand: detectCardBrand(digits),
    paidAt: new Date().toISOString(),
  });
}
