import type { Metadata } from "next";
import { SalesPage } from "@/src/presentation/pages/SalesPage";

export const metadata: Metadata = {
  title: "Ventas | Marin Industries",
};

export default function Page() {
  return <SalesPage />;
}
