import Link from "next/link";

export function Hero() {
  return (
    <section id="inicio" data-tone="base" className="hero-section home-hero">
      <div className="hero-grid" aria-hidden="true" />

      <div className="section-shell home-hero-shell">
        <div className="home-hero-top">
          <span className="eyebrow">MARIN INDUSTRIES / INGENIERÍA Y TECNOLOGÍA</span>
          <span className="home-hero-index">SONORA, MX · 2026</span>
        </div>

        <div className="home-hero-content">
          <div className="home-hero-heading">
            <span className="home-hero-overline">
              INGENIERÍA / AUTOMATIZACIÓN / SOPORTE
            </span>
            <h1 className="home-hero-title">
              Ingeniería
              <br />
              y tecnología
              <br />
              <span>para crecer.</span>
            </h1>
          </div>

          <div className="home-hero-description">
            <span className="home-hero-description-index">01 / MARIN INDUSTRIES</span>
            <p>
              Soluciones de software, mecatrónica, biomédica y soporte técnico
              para negocios, industrias y hogares.
            </p>
            <div className="home-hero-actions">
              <Link href="/#contacto" className="home-hero-link">
                SOLICITAR UNA PROPUESTA <span aria-hidden="true">↗</span>
              </Link>
              <Link href="/#servicios" className="home-hero-link home-hero-link--secondary">
                EXPLORAR SERVICIOS <span aria-hidden="true">↓</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="home-hero-bottom" aria-label="Información de Marin Industries">
          <span>MARIN INDUSTRIES</span>
          <span>INGENIERÍA · TECNOLOGÍA · SERVICIO</span>
          <span>SONORA, MX</span>
        </div>
      </div>
    </section>
  );
}
