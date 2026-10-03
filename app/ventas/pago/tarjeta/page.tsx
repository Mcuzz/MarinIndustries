import type { Metadata } from "next";
import { CardPaymentPage } from "@/src/presentation/pages/CardPaymentPage";

export const metadata: Metadata = {
  title: "Pago con tarjeta | Marin Industries",
};

export default function Page() {
  return <CardPaymentPage />;
}
