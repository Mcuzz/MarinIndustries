import { container } from "@/src/infrastructure/composition/root-container";
import { CatalogPage } from "@/src/presentation/pages/CatalogPage";

export default async function Page() {
  const catalog = await container.catalog.listServiceCatalog();

  return <CatalogPage catalog={catalog} />;
}
