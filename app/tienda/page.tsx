import { container } from "@/src/infrastructure/composition/root-container";
import { PageShell } from "@/src/presentation/components/layout/PageShell";
import { GridProductos } from "@/src/presentation/components/sales/GridProductos";

export const dynamic = "force-dynamic";

export default async function TiendaPage() {
  const productos = await container.products.listProducts({ soloActivos: true });

  return (
    <PageShell>
      <main>
        <GridProductos productosInicialesProp={productos} />
      </main>
    </PageShell>
  );
}
