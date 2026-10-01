import Link from "next/link";
import { ModuleHero } from "../components/ModuleHero";
import { PageShell } from "../components/layout/PageShell";

const pending = [
  "Precios oficiales",
  "Variables de alcance",
  "Criterios administrativos",
  "Flujo de aprobación",
];

export function QuotePage() {
  return (
    <PageShell>
      <main>
        <ModuleHero
          eyebrow="Cotización de proyectos"
          title="Filtro inicial para entender alcance, datos fiscales y necesidades"
          description="Esta página ordena la información que después puede alimentar una cotización automatizada."
        />

        <section data-tone="alt" className="qt-section">
          <div className="section-shell qt-grid">
            <form className="qf-card">
              <div className="qf-group">
                <span className="qf-group-label">01 / Datos del solicitante</span>

                <div className="qf-row">
                  <Field id="nombre" label="Nombre o razón social" placeholder="Nombre del solicitante" />
                  <Field id="rfc" label="RFC" placeholder="RFC para filtro fiscal" />
                  <Field id="correo" label="Correo" placeholder="correo@empresa.com" type="email" />
                  <Field id="telefono" label="Teléfono" placeholder="662 123 4567" type="tel" />
                </div>
              </div>

              <div className="qf-group">
                <span className="qf-group-label">02 / Proyecto</span>

                <div className="qf-stack">
                  <div>
                    <label htmlFor="tipo" className="qf-label">Tipo de proyecto</label>
                    <select id="tipo" className="qf-input" defaultValue="">
                      <option value="" disabled>Selecciona una opción</option>
                      <option>Sitio web</option>
                      <option>Sistema administrativo</option>
                      <option>Inventario / punto de venta</option>
                      <option>Automatización industrial</option>
                      <option>Otro</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="alcance" className="qf-label">Descripción del alcance</label>
                    <textarea
                      id="alcance"
                      rows={5}
                      className="qf-input qf-textarea"
                      placeholder="Describe el problema, usuarios, proceso actual y resultado esperado."
                    />
                  </div>
                </div>
              </div>

              <button type="button" className="btn btn-primary qf-submit">
                Preparar solicitud
                <span aria-hidden="true">→</span>
              </button>
            </form>

            <aside className="qa-card">
              <span className="eyebrow">Pendiente por definir</span>
              <h2 className="qa-title">Reglas para automatizar</h2>

              <p className="qa-text">
                Para convertir esto en cotizador automático se necesitan:
              </p>

              <ul>
                {pending.map((item, i) => (
                  <li key={item} className="pn-row">
                    <span className="pn-row-n">{String(i + 1).padStart(2, "0")}</span>
                    <span className="pn-row-t">{item}</span>
                  </li>
                ))}
              </ul>

              <Link href="/catalogo" className="btn btn-ghost qa-btn">
                Ver catálogo
                <span aria-hidden="true">→</span>
              </Link>
            </aside>
          </div>
        </section>
      </main>
    </PageShell>
  );
}

function Field({
  id,
  label,
  placeholder,
  type = "text",
}: {
  id: string;
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="qf-label">{label}</label>
      <input id={id} type={type} placeholder={placeholder} className="qf-input" />
    </div>
  );
}