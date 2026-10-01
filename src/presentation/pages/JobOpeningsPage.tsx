import type { JobOpening } from "@/src/domain/jobs/job-opening.entity";
import { ModuleHero } from "../components/ModuleHero";
import { PageShell } from "../components/layout/PageShell";
import { LogoutButton } from "../components/auth/LogoutButton";

type JobOpeningsPageProps = {
  openings: JobOpening[];
};

const pad = (n: number) => String(n).padStart(2, "0");

export function JobOpeningsPage({ openings }: JobOpeningsPageProps) {
  return (
    <PageShell>
      <main>
        <ModuleHero
          eyebrow="Sistema de convocatoria"
          title="Vacantes y oportunidades de colaboración"
          description="Primera versión para mostrar oportunidades disponibles mientras se definen formularios, filtros y flujo administrativo."
        >
          <LogoutButton />
        </ModuleHero>

        <section data-tone="alt" className="jo-section">
          <div className="section-shell">
            <div className="jo-head">
              <div>
                <span className="eyebrow">Publicaciones</span>
                <h2 className="jo-title">Convocatorias iniciales</h2>
              </div>

              <p className="jo-count">
                {pad(openings.length)} <span>vacantes</span>
              </p>
            </div>

            {openings.length === 0 ? (
              <p className="jo-empty">Por ahora no hay convocatorias abiertas.</p>
            ) : (
              <div className="jo-grid">
                {openings.map((opening, i) => (
                  <article key={opening.id} className="jo-card">
                    <div className="jo-top">
                      <span className="jo-num">{pad(i + 1)}</span>
                      <span className="jo-status">
                        <i aria-hidden="true" />
                        {opening.status}
                      </span>
                    </div>

                    <span className="jo-area">{opening.area}</span>

                    <h3 className="jo-h3">{opening.title}</h3>
                    <p className="jo-desc">{opening.description}</p>

                    <button type="button" className="btn btn-ghost jo-btn">
                      Solicitar información
                      <span aria-hidden="true">→</span>
                    </button>
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