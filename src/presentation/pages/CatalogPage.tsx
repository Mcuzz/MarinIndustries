import Link from "next/link";
import type { ServiceOffering } from "@/src/domain/catalog/service-offering.entity";
import { ModuleHero } from "../components/ModuleHero";
import { PageShell } from "../components/layout/PageShell";

const pad = (n: number) => String(n).padStart(2, "0");
type CatalogPageProps = {
  catalog: ServiceOffering[];
};

export function CatalogPage({ catalog }: CatalogPageProps) {
  return (
    <PageShell>
      <main>
        <ModuleHero
          eyebrow="Catalogo y costos"
          title="Servicios con costos base para iniciar conversaciones"
          description="Version estatica para mostrar rangos y ordenar expectativas mientras administracion define reglas de actualizacion."
        />

        <section data-tone="alt" className="cg-section">
          <div className="section-shell">
            <div className="jo-head">
              <div>
                <span className="eyebrow">Servicios</span>
              </div>

              <p className="jo-count">
                {pad(catalog.length)} <span>servicios</span>
              </p>
            </div>

            {catalog.length === 0 ? (
              <p className="jo-empty">
                Por ahora no hay servicios en el catálogo.
              </p>
            ) : (
              <div className="cg-grid">
                {catalog.map((item, i) => (
                  <article key={item.id} className="cg-card">
                    <div className="cg-top">
                      <span className="cg-num">{pad(i + 1)}</span>
                      <span className="cg-label">Servicio</span>
                    </div>

                    <h2 className="cg-name">{item.name}</h2>

                    <div className="cg-price">
                      <small>Precio</small>
                      <p>{item.price}</p>
                    </div>

                    <p className="cg-desc">{item.description}</p>

                    <Link href="/cotizacion" className="btn btn-primary cg-btn">
                      Solicitar cotización
                      <span aria-hidden="true">→</span>
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </PageShell>
  );
}
