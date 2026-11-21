export {
  detectCardBrand,
  onlyDigits,
  type CardPaymentForm,
} from "@/src/domain/payments/card-payment";

export {
  processMockCardPayment,
  TEST_CARD_APPROVED,
  TEST_CARD_DECLINED,
} from "@/src/infrastructure/payments/mock-card-payment.gateway";

export type { CardPaymentReceipt } from "@/src/infrastructure/payments/mock-card-payment.gateway";