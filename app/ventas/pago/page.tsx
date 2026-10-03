import type { Metadata } from "next";
import { PaymentMethodPage } from "@/src/presentation/pages/PaymentMethodPage";

export const metadata: Metadata = {
  title: "Método de pago | Marin Industries",
};

export default function Page() {
  return <PaymentMethodPage />;
}
