"use client";

import Link from "next/link";
import type { ServiceOffering } from "@/src/domain/catalog/service-offering.entity";
import { ModuleHero } from "../components/ModuleHero";
import { PageShell } from "../components/layout/PageShell";
import { useLanguage } from "../i18n/LanguageProvider";

const pad = (n: number) => String(n).padStart(2, "0");
type CatalogPageProps = {
  catalog: ServiceOffering[];
};

export function CatalogPage({ catalog }: CatalogPageProps) {
  const { translations } = useLanguage();
  const t = translations.catalog;
  const common = translations.common;
  return (
    <PageShell>
      <main>
        <ModuleHero
          eyebrow={t.eyebrow}
          title={t.title}
          description={t.description}
        />

        <section data-tone="alt" className="cg-section">
          <div className="section-shell">
            <div className="jo-head">
              <div>
                <span className="eyebrow">{t.section}</span>
              </div>

              <p className="jo-count">
                {pad(catalog.length)} <span>{common.services}</span>
              </p>
            </div>

            {catalog.length === 0 ? (
              <p className="jo-empty">
                {t.empty}
              </p>
            ) : (
              <div className="cg-grid">
                {catalog.map((item, i) => (
                  <article key={item.id} className="cg-card">
                    {(() => {
                      const localized = t.items[item.id as keyof typeof t.items];
                      return <>
                    <div className="cg-top">
                      <span className="cg-num">{pad(i + 1)}</span>
                      <span className="cg-label">{t.item}</span>
                    </div>

                    <h2 className="cg-name">{localized?.name ?? item.name}</h2>

                    <div className="cg-price">
                      <small>{common.price}</small>
                      <p>{item.price}</p>
                    </div>

                    <p className="cg-desc">{localized?.description ?? item.description}</p>

                    <Link href="/cotizacion" className="btn btn-primary cg-btn">
                      {common.requestQuote}
                      <span aria-hidden="true">→</span>
                    </Link>
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
