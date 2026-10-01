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

        <CaseAccordion
          studies={studies}
          visuals={studies.map((study) => (
            <div key={study.id} className="media-slot">
              <span>IMAGEN / GIF · {study.tag.toUpperCase()}</span>
            </div>
          ))}
        />
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
        <InfoPanel services={content.services} process={content.process} />
        <CaseStudies studies={content.caseStudies} />

        <section data-tone="alt" className="border-b border-brandLine bg-brandBg py-20">
          {" "}
          <div className="section-shell">
            <div className="mb-12 max-w-3xl">
              <span className="eyebrow">Nuevos modulos</span>

              <h2 className="mt-3 text-3xl font-bold text-brandDark md:text-4xl">
                Base preparada para crecer mas alla de la landing.
              </h2>

              <p className="mt-4 text-brandText">
                Estas areas dejan listo el camino para las solicitudes recibidas
                sin prometer todavia un sistema completo que requiere reglas y
                permisos.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {content.modules.map((module) => (
                <Link
                  key={module.href}
                  href={module.href}
                  className="group card p-6 transition hover:-translate-y-1 hover:border-brandAccent"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-xl font-bold text-brandDark">
                      {module.title}
                    </h3>

                    <span
                      aria-hidden="true"
                      className="shrink-0 text-3xl font-light leading-none text-brandText transition-all duration-300 group-hover:translate-x-2 group-hover:text-brandAccent"
                    >
                      →
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-brandText">
                    {module.copy}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

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
