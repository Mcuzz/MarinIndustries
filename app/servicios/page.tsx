import type { Metadata } from "next";
import { container } from "@/src/infrastructure/composition/root-container";
import { ServiceSuitePage } from "@/src/presentation/pages/ServiceSuitePage";

export const metadata: Metadata = {
  title: "Servicios | Marin Industries",
  description:
    "Explora las soluciones digitales y servicios personalizados de Marin Industries.",
};

export default async function ServiciosPage() {
  const catalog = await container.catalog.listServiceCatalog();

  return <ServiceSuitePage catalog={catalog} />;
}