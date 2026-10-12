import { PageShell } from "@/src/presentation/components/layout/PageShell";
import { GridProductos } from "@/src/presentation/components/sales/GridProductos";

export default function TiendaPage() {
  return (
    <PageShell>
      <main>
        <GridProductos />
      </main>
    </PageShell>
  );
}
