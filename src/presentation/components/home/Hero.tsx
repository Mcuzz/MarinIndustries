"use client";
import Link from "next/link";
import { useLanguage } from "../../i18n/LanguageProvider";

export function Hero() {
  const { translations } = useLanguage();
  const t = translations.home.hero;
  return (
    <section id="inicio" data-tone="base" className="hero-section home-hero">
      <div className="hero-grid" aria-hidden="true" />

      <div className="section-shell home-hero-shell">
        <div className="home-hero-top">
          <span className="eyebrow">{t.eyebrow}</span>
          <span className="home-hero-index">{t.index}</span>
        </div>

        <div className="home-hero-content">
          <div className="home-hero-heading">
            <span className="home-hero-overline">{t.overline}</span>
          
              <h1 className="home-hero-title">
                {t.title.line1}
                <br />
                {t.title.line2}
                <br />
                <span>{t.title.line3}</span>
              </h1>
            
          </div>

          <div className="home-hero-description">
            <span className="home-hero-description-index">
              01 / MARIN INDUSTRIES
            </span>
            <p>{t.description}</p>
            <div className="home-hero-actions">
              <Link href="/#contacto" className="home-hero-link">
                {t.primaryAction} <span aria-hidden="true">↗</span>
              </Link>
              <Link
                href="/#servicios"
                className="home-hero-link home-hero-link--secondary"
              >
                {t.secondaryAction} <span aria-hidden="true">↓</span>
              </Link>
            </div>
          </div>
        </div>

        <div
          className="home-hero-bottom"
          aria-label="Información de Marin Industries"
        >
          <span>MARIN INDUSTRIES</span>
          <span>INGENIERÍA · TECNOLOGÍA · SERVICIO</span>
          <span>SONORA, MX</span>
        </div>
      </div>
    </section>
  );
}
