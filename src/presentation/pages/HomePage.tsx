import Link from "next/link";
import type {
  LandingContent,
  CaseStudy,
} from "@/src/domain/marketing/landing-content.entity";
import { ContactForm } from "../components/forms/ContactForm";
import { PageShell } from "../components/layout/PageShell";
import { InfoPanel } from "../components/home/InfoPanel";
import { Hero } from "../components/home/Hero";
import { CaseAccordion } from "../components/home/CaseAccordion";
import SalesPreview from "../components/home/SalesPreview";
import { SectionRail } from "../components/home/SectionRail";

type HomePageProps = {
  content: LandingContent;
};

function MockDots() {
  return (
    <div className="mock-dots">
      <span />
      <span />
      <span />
    </div>
  );
}

function CaseStudies({ studies }: { studies: CaseStudy[] }) {
  const visuals = studies.map((study) =>
    study.visual === "pos" ? (
      <SalesPreview key={study.id} />
    ) : (
      <div key={study.id} className="media-slot">
        <span>IMAGEN / GIF · {study.tag.toUpperCase()}</span>
      </div>
    ),
  );

  return (
    <section id="casos" data-tone="base" className="ca-section">
      {" "}
      <div className="section-shell ca-shell">
        <div className="ca-head">
          <span className="eyebrow">Casos de éxito</span>
          <h2 className="ca-title">
            Ejemplos de soluciones que mejoran la operación diaria
          </h2>
        </div>

        <CaseAccordion studies={studies} visuals={visuals} />


      </div>
    </section>
  );
}

export function HomePage({ content }: HomePageProps) {
  return (
    <PageShell>
      <main>
        <SectionRail />
        <Hero />
        <div className="suite-home-cta">
          <div>
            <span className="eyebrow">MARIN INDUSTRIES / SERVICE SUITE</span>
            <h3>¿Buscas una solución para tu negocio?</h3>
            <p>
              Explora nuestras herramientas digitales y encuentra la solución
              que mejor se adapte a tus operaciones.
            </p>
          </div>

          <Link href="/servicios#suite" className="suite-home-button">
            ADQUIERE NUESTROS SERVICIOS
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <InfoPanel services={content.services} process={content.process} />
        <CaseStudies studies={content.caseStudies} />

        <section id="contacto" data-tone="deep" className="ct-section">
          {" "}
          <div className="section-shell ct-grid">
            <div>
              <span className="eyebrow">Contacto</span>

              <h2 className="ct-title">
                Digitaliza tu negocio con una solución hecha a tu medida.
              </h2>

              <p className="ct-lead">
                Cuéntanos qué necesitas y te responderemos para iniciar la
                propuesta.
              </p>
            </div>

            <div className="card ct-panel">
              <h3 className="ct-h3">Iniciar una conversación</h3>

              <p className="ct-sub">
                Comparte el contexto de tu negocio y el tipo de solución que
                buscas.
              </p>

              <ContactForm />
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
