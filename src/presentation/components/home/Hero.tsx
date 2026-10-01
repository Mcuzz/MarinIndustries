import Link from "next/link";

export function Hero() {
  return (
    <section
      id="inicio"
      data-tone="base"
      className="hero-section relative flex min-h-screen flex-col items-center justify-center px-6 pb-24 pt-28 text-center"
    >
      {/* Fondo opcional: video. Descomenta y pon tu archivo en /public/assets/ */}
      {/*
      <video
        className="hero-video"
        src="/assets/hero.mp4"
        poster="/assets/hero-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden
      />
      <div className="hero-veil" aria-hidden />
      */}

      {/* Cuadrícula técnica */}
      <div className="hero-grid" aria-hidden />

      <div className="relative z-10 flex flex-col items-center">
        <span className="eyebrow mb-6">
          ALIADO TECNOLÓGICO PARA NEGOCIOS LOCALES E INDUSTRIA
        </span>

        <h1 className="h1 max-w-4xl text-[2rem] leading-[1.06] text-[var(--brand-dark)] sm:text-4xl md:text-5xl lg:text-6xl">
          Soluciones de ingeniería, tecnología y soporte técnico para crecer con
          confianza.
        </h1>

        <p className="mt-6 max-w-xl text-base text-[var(--brand-text)] md:text-lg">
          Acompañamos a negocios, industrias y hogares con proyectos de
          ingeniería, software, mecatrónica, biomédica y servicios técnicos
          hechos a la medida.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/#contacto" className="btn btn-primary">
            Solicitar una propuesta
          </Link>
          <Link href="/#servicios" className="btn btn-ghost">
            Ver servicios
          </Link>
        </div>
      </div>

      <Link
        href="/#servicios"
        aria-label="Bajar a la siguiente sección"
        className="hero-arrow absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-[var(--brand-dark)]"
      >
        <svg width="28" height="40" viewBox="0 0 28 40" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M14 2v34M3 25l11 11 11-11" />
        </svg>
      </Link>
    </section>
  );
}