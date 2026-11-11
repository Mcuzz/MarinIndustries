"use client";

import Link from "next/link";
import { ModuleHero } from "../components/ModuleHero";
import { PageShell } from "../components/layout/PageShell";
import { useLanguage } from "../i18n/LanguageProvider";

export function QuotePage() {
  const { translations } = useLanguage();
  const t = translations.quote;
  return (
    <PageShell>
      <main>
        <ModuleHero
          eyebrow={t.eyebrow}
          title={t.title}
          description={t.description}
        />

        <section data-tone="alt" className="qt-section">
          <div className="section-shell qt-grid">
            <form className="qf-card">
              <div className="qf-group">
                <span className="qf-group-label">
                  {t.applicant}
                </span>

                <div className="qf-row">
                  <Field
                    id="nombre"
                    label={t.name}
                    placeholder={t.namePlaceholder}
                  />
                  <Field
                    id="rfc"
                    label="RFC"
                    placeholder={t.taxIdPlaceholder}
                  />
                  <Field
                    id="correo"
                    label={t.email}
                    placeholder="correo@empresa.com"
                    type="email"
                  />
                  <Field
                    id="telefono"
                    label={t.phone}
                    placeholder="662 123 4567"
                    type="tel"
                  />
                </div>
              </div>

              <div className="qf-group">
                <span className="qf-group-label">{t.project}</span>

                <div className="qf-stack">
                  <div>
                    <label htmlFor="tipo" className="qf-label">
                      {t.projectType}
                    </label>
                    <select id="tipo" className="qf-input" defaultValue="">
                      <option value="" disabled>
                        {t.select}
                      </option>
                      {t.projectTypes.map((type, index) => <option key={index} value={index}>{type}</option>)}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="alcance" className="qf-label">
                      {t.scope}
                    </label>
                    <textarea
                      id="alcance"
                      rows={5}
                      className="qf-input qf-textarea"
                      placeholder={t.scopePlaceholder}
                    />
                  </div>
                </div>
              </div>

              <button type="button" className="btn btn-primary qf-submit">
                {t.prepare}
                <span aria-hidden="true">→</span>
              </button>
            </form>

            <aside className="qa-card">
              <span className="eyebrow">{t.pending}</span>
              <h2 className="qa-title">{t.rules}</h2>

              <p className="qa-text">
                {t.requirements}
              </p>

              <ul>
                {t.items.map((item, i) => (
                  <li key={item} className="pn-row">
                    <span className="pn-row-n">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="pn-row-t">{item}</span>
                  </li>
                ))}
              </ul>

              <Link href="/servicios#a-medida" className="btn btn-ghost qa-btn">
                {" "}
                {translations.common.viewCatalog}
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
      <label htmlFor={id} className="qf-label">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        className="qf-input"
      />
    </div>
  );
}
