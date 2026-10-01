import type { HrFeature } from "@/src/domain/hr/hr-feature.entity";
import { ModuleHero } from "../components/ModuleHero";
import { PageShell } from "../components/layout/PageShell";

type HrAccessPageProps = {
  features: HrFeature[];
};

const pad = (n: number) => String(n).padStart(2, "0");

export function HrAccessPage({ features }: HrAccessPageProps) {
  return (
    <PageShell>
      <main>
        <ModuleHero
          eyebrow="Recursos humanos"
          title="Área interna para control de expedientes y aptitudes"
          description="Entrada separada del sitio público. La lógica real deberá conectarse a autenticación y permisos."
        />

        <section data-tone="alt" className="hr-section">
          <div className="section-shell hr-grid">
            {/* Acceso */}
            <div className="qf-card">
              <span className="jo-status">
                <i aria-hidden="true" />
                Acceso restringido
              </span>

              <div>
                <h2 className="qa-title" style={{ marginTop: 0 }}>
                  Acceso autorizado
                </h2>
                <p className="qa-text" style={{ marginBottom: 0 }}>
                  Esta pantalla marca el módulo como privado sin exponer
                  información sensible en la landing.
                </p>
              </div>

              <form className="qf-stack">
                <div>
                  <label htmlFor="hr-email" className="qf-label">
                    Correo institucional
                  </label>
                  <input
                    id="hr-email"
                    type="email"
                    autoComplete="username"
                    placeholder="correo@empresa.com"
                    className="qf-input"
                  />
                </div>

                <div>
                  <label htmlFor="hr-password" className="qf-label">
                    Contraseña
                  </label>
                  <input
                    id="hr-password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Tu contraseña"
                    className="qf-input"
                  />
                </div>

                <button type="button" className="btn btn-primary qf-submit">
                  Entrar
                  <span aria-hidden="true">→</span>
                </button>
              </form>
            </div>

            {/* Funciones del módulo */}
            <div>
              <div className="jo-head">
                <span className="eyebrow">Funciones del módulo</span>
                <p className="jo-count">
                  {pad(features.length)} <span>funciones</span>
                </p>
              </div>

              <div className="hr-features">
                {features.map((feature, i) => (
                  <div key={feature.id} className="hr-feature">
                    <div className="hr-feature-top">
                      <span className="hr-check" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span className="jo-num">{pad(i + 1)}</span>
                    </div>

                    <p className="hr-feature-label">{feature.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}