"use client";

import type { JobOpening } from "@/src/domain/jobs/job-opening.entity";
import { ModuleHero } from "../components/ModuleHero";
import { PageShell } from "../components/layout/PageShell";
import { LogoutButton } from "../components/auth/LogoutButton";
import { useLanguage } from "../i18n/LanguageProvider";

type JobOpeningsPageProps = {
  openings: JobOpening[];
};

const pad = (n: number) => String(n).padStart(2, "0");

export function JobOpeningsPage({ openings }: JobOpeningsPageProps) {
  const { translations } = useLanguage();
  const t = translations.jobs;
  return (
    <PageShell>
      <main>
        <ModuleHero
          eyebrow={t.eyebrow}
          title={t.title}
          description={t.description}
        >
          <LogoutButton />
        </ModuleHero>

        <section data-tone="alt" className="jo-section">
          <div className="section-shell">
            <div className="jo-head">
              <div>
                <span className="eyebrow">{t.publications}</span>
                <h2 className="jo-title">{t.initial}</h2>
              </div>

              <p className="jo-count">
                {pad(openings.length)} <span>{translations.common.vacancies}</span>
              </p>
            </div>

            {openings.length === 0 ? (
              <p className="jo-empty">{t.empty}</p>
            ) : (
              <div className="jo-grid">
                {openings.map((opening, i) => (
                  <article key={opening.id} className="jo-card">
                    {(() => {
                      const localized = t.items[opening.id as keyof typeof t.items];
                      return <>
                    <div className="jo-top">
                      <span className="jo-num">{pad(i + 1)}</span>
                      <span className="jo-status">
                        <i aria-hidden="true" />
                        {localized?.status ?? opening.status}
                      </span>
                    </div>

                    <span className="jo-area">{localized?.area ?? opening.area}</span>

                    <h3 className="jo-h3">{localized?.title ?? opening.title}</h3>
                    <p className="jo-desc">{localized?.description ?? opening.description}</p>

                    <button type="button" className="btn btn-ghost jo-btn">
                      {t.requestInfo}
                      <span aria-hidden="true">→</span>
                    </button>
                      </>;
                    })()}
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
