import Link from "next/link";
import { PageShell } from "../components/layout/PageShell";
import type { ServiceOffering } from "@/src/domain/catalog/service-offering.entity";

const services = [
  {
    number: "01",
    category: "OPERATIONS MANAGEMENT",
    name: "Administrador de Inventario",
    title: "Control total de tu inventario.",
    description:
      "Administra tus productos, existencias y movimientos desde una plataforma centralizada. Mantén el control de tus recursos y toma decisiones con información organizada.",
    features: [
      "Registro y organización de productos",
      "Control de entradas y salidas",
      "Seguimiento de existencias",
      "Historial de movimientos",
      "Reportes de inventario",
    ],
    tags: ["Inventario", "Operaciones", "Gestión"],
  },
  {
    number: "02",
    category: "Administración de Ventas",
    name: "Punto de venta (POS)",
    title: "Simplifica cada operación de venta.",
    description:
      "Gestiona las transacciones de tu negocio, organiza tus ventas y centraliza la información de tus operaciones comerciales.",
    features: [
      "Registro de ventas",
      "Administración de productos",
      "Control de transacciones",
      "Seguimiento de operaciones",
      "Reportes comerciales",
    ],
    tags: ["Ventas", "POS", "Comercio"],
  },
  {
    number: "03",
    category: "GESTIÓN DE CLIENTES",
    name: "Customer Relationship Management",
    title: "Construye mejores relaciones comerciales.",
    description:
      "Centraliza la información de tus clientes, organiza oportunidades comerciales y facilita el seguimiento de cada interacción.",
    features: [
      "Registro de clientes",
      "Historial de interacciones",
      "Seguimiento de oportunidades",
      "Organización de contactos",
      "Gestión de relaciones comerciales",
    ],
    tags: ["CRM", "Clientes", "Seguimiento"],
  },
];
const pad = (n: number) => String(n).padStart(2, "0");

type ServiceSuitePageProps = {
  catalog: ServiceOffering[];
};

export function ServiceSuitePage({ catalog }: ServiceSuitePageProps) {
  return (
    <PageShell>
      <main className="suite-page">
        {/* HERO */}
        <section className="suite-hero">
          <div className="section-shell">
            <div className="suite-hero-top">
              <span className="eyebrow">
                MARIN INDUSTRIES / DIGITAL PRODUCTS
              </span>
              <span className="suite-index">SERVICE SUITE · 2026</span>
            </div>

            <div className="suite-hero-content">
              <div>
                <span className="suite-overline">
                  SOFTWARE / SOLUTIONS / MANAGEMENT
                </span>

                <h1>
                  Technology
                  <br />
                  for better
                  <br />
                  <span>operations.</span>
                </h1>
              </div>

              <div className="suite-hero-description">
                <span className="suite-description-index">01 — 03</span>

                <p>
                  Herramientas digitales diseñadas para simplificar procesos,
                  organizar operaciones y ayudar a los negocios a crecer.
                </p>

                <Link href="#servicios" className="suite-link">
                  EXPLORAR SERVICIOS <span>↓</span>
                </Link>
              </div>
            </div>

            <div className="suite-hero-bottom">
              <span>MARIN INDUSTRIES</span>
              <span>DIGITAL SERVICE CATALOG</span>
              <span>SONORA, MX</span>
            </div>
          </div>
        </section>

        {/* SERVICIOS */}
        <section id="suite" className="suite-services">
          {" "}
          <div className="section-shell">
            <div className="suite-section-heading">
              <div>
                <span className="eyebrow">01 / AVAILABLE SERVICES</span>
                <h2>Explora nuestras soluciones.</h2>
              </div>

              <span className="suite-counter">03 PRODUCTS</span>
            </div>

            <div className="suite-service-list">
              {services.map((service) => (
                <article className="suite-service-card" key={service.number}>
                  <div className="suite-service-number">{service.number}</div>

                  <div className="suite-service-main">
                    <span className="suite-category">{service.category}</span>

                    <h3>{service.name}</h3>

                    <h4>{service.title}</h4>

                    <p>{service.description}</p>

                    <div className="suite-tags">
                      {service.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div className="suite-service-details">
                    <div className="suite-subscription-heading">
                      <span>AVAILABLE SUBSCRIPTIONS</span>
                      <span>02 OPTIONS</span>
                    </div>

                    <div className="suite-subscription-options">
                      <article className="suite-subscription-option">
                        <span className="suite-plan-index">01 / MONTHLY</span>
                        <h4>Mensual</h4>
                        <p>Suscripción con renovación mensual.</p>
                        <strong>Precio por definir</strong>
                      </article>

                      <article className="suite-subscription-option">
                        <span className="suite-plan-index">02 / YEARLY</span>
                        <h4>Anual</h4>
                        <p>Suscripción con renovación anual.</p>
                        <strong>Precio por definir</strong>
                      </article>
                    </div>

                    <Link href="/#contacto" className="suite-service-link">
                      SOLICITAR INFORMACIÓN <span>↗</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* SERVICIOS A MEDIDA */}
        <section id="a-medida" data-tone="alt" className="cg-section">
          <div className="section-shell">
            <div className="suite-section-heading">
              <div>
                <span className="eyebrow">02 / CUSTOM SOLUTIONS</span>
                <h2>¿Necesitas algo más a la medida?</h2>
                <p className="suite-custom-intro">
                  Desarrollamos soluciones de software e ingeniería adaptadas a
                  los procesos, objetivos y necesidades de cada organización.
                </p>
              </div>

              <span className="suite-counter">CUSTOM DEVELOPMENT</span>
            </div>

            <div className="jo-head">
              <div>
                <span className="eyebrow">DESARROLLO Y SERVICIOS</span>
              </div>

              <p className="jo-count">
                {pad(catalog.length)} <span>servicios</span>
              </p>
            </div>

            {catalog.length === 0 ? (
              <p className="jo-empty">
                Por ahora no hay servicios disponibles en el catálogo.
              </p>
            ) : (
              <div className="cg-grid">
                {catalog.map((item, i) => (
                  <article key={item.id} className="cg-card">
                    <div className="cg-top">
                      <span className="cg-num">{pad(i + 1)}</span>
                      <span className="cg-label">CUSTOM SERVICE</span>
                    </div>

                    <h3 className="cg-name">{item.name}</h3>

                    <div className="cg-price">
                      <small>Precio base</small>
                      <p>{item.price}</p>
                    </div>

                    <p className="cg-desc">{item.description}</p>

                    <Link href="/cotizacion" className="btn btn-primary cg-btn">
                      Solicitar cotización
                      <span aria-hidden="true">→</span>
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="suite-contact">
          <div className="section-shell suite-contact-content">
            <span className="eyebrow">03 / GET STARTED</span>

            <h2>
              Tu siguiente paso
              <br />
              comienza aquí.
            </h2>

            <p>
              Cuéntanos qué necesita tu negocio. Nuestro equipo puede ayudarte a
              identificar la solución adecuada para tu operación.
            </p>

            <Link href="/#contacto" className="suite-contact-button">
              HABLAR CON NUESTRO EQUIPO <span>↗</span>
            </Link>

            <span className="suite-contact-footer">
              MARIN INDUSTRIES · DIGITAL SOLUTIONS
            </span>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
