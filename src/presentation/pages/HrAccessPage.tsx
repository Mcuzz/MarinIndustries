"use client";

import type { HrFeature } from "@/src/domain/hr/hr-feature.entity";
import { ModuleHero } from "../components/ModuleHero";
import { PageShell } from "../components/layout/PageShell";
import { useLanguage } from "../i18n/LanguageProvider";

type HrAccessPageProps = {
  features: HrFeature[];
};

const pad = (n: number) => String(n).padStart(2, "0");

export function HrAccessPage({ features }: HrAccessPageProps) {
  const { translations } = useLanguage();
  const t = translations.hr;
  return (
    <PageShell>
      <main>
        <ModuleHero
          eyebrow={t.eyebrow}
          title={t.title}
          description={t.description}
        />

        <section data-tone="alt" className="hr-section">
          <div className="section-shell hr-grid">
            {/* Acceso */}
            <div className="qf-card">
              <span className="jo-status">
                <i aria-hidden="true" />
                {t.restricted}
              </span>

              <div>
                <h2 className="qa-title" style={{ marginTop: 0 }}>
                  {t.authorized}
                </h2>
                <p className="qa-text" style={{ marginBottom: 0 }}>
                  {t.privateDescription}
                </p>
              </div>

              <form className="qf-stack">
                <div>
                  <label htmlFor="hr-email" className="qf-label">
                    {t.email}
                  </label>
                  <input
                    id="hr-email"
                    type="email"
                    autoComplete="username"
                    placeholder={t.emailPlaceholder}
                    className="qf-input"
                  />
                </div>

                <div>
                  <label htmlFor="hr-password" className="qf-label">
                    {t.password}
                  </label>
                  <input
                    id="hr-password"
                    type="password"
                    autoComplete="current-password"
                    placeholder={t.passwordPlaceholder}
                    className="qf-input"
                  />
                </div>

                <button type="button" className="btn btn-primary qf-submit">
                  {t.enter}
                  <span aria-hidden="true">→</span>
                </button>
              </form>
            </div>

            {/* Funciones del módulo */}
            <div>
              <div className="jo-head">
                <span className="eyebrow">{t.features}</span>
                <p className="jo-count">
                  {pad(features.length)} <span>{translations.common.functions}</span>
                </p>
              </div>

              <div className="hr-features">
                {features.map((feature, i) => (
                  <div key={feature.id} className="hr-feature">
                    {(() => {
                      const localized = t.items[feature.id as keyof typeof t.items];
                      return <>
                    <div className="hr-feature-top">
                      <span className="hr-check" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span className="jo-num">{pad(i + 1)}</span>
                    </div>

                    <p className="hr-feature-label">{localized ?? feature.label}</p>
                      </>;
                    })()}
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
