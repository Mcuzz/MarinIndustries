"use client";

import Link from "next/link";
import { PageShell } from "../components/layout/PageShell";
import type { ServiceOffering } from "@/src/domain/catalog/service-offering.entity";
import { useLanguage } from "../i18n/LanguageProvider";

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
  const { translations } = useLanguage();
  const t = translations.suite;
  const common = translations.common;
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
                  <span className="suite-overline">{t.heroOverline}</span>

                <h1>
                  {t.heroTitle[0]}
                  <br />
                  {t.heroTitle[1]}
                  <br />
                  <span>{t.heroTitle[2]}</span>
                </h1>
              </div>

              <div className="suite-hero-description">
                <span className="suite-description-index">01 — 03</span>

                <p>
                  {t.description}
                </p>

                <Link href="#servicios" className="suite-link">
                  {t.explore} <span>↓</span>
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
                <span className="eyebrow">{t.sectionLabel}</span>
                <h2>{t.available}</h2>
              </div>

              <span className="suite-counter">{t.productCount}</span>
            </div>

            <div className="suite-service-list">
              {t.products.map((service, serviceIndex) => (
                <article className="suite-service-card" key={serviceIndex}>
                  <div className="suite-service-number">{pad(serviceIndex + 1)}</div>

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
                      <span>{t.subscriptions}</span>
                      <span>02 OPTIONS</span>
                    </div>

                    <div className="suite-subscription-options">
                      <article className="suite-subscription-option">
                        <span className="suite-plan-index">01 / MONTHLY</span>
                        <h4>{t.monthly}</h4>
                        <p>{t.monthlyDescription}</p>
                        <strong>{t.priceTbd}</strong>
                      </article>

                      <article className="suite-subscription-option">
                        <span className="suite-plan-index">02 / YEARLY</span>
                        <h4>{t.yearly}</h4>
                        <p>{t.yearlyDescription}</p>
                        <strong>{t.priceTbd}</strong>
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
                <h2>{t.customTitle}</h2>
                <p className="suite-custom-intro">
                  {t.customIntro}
                </p>
              </div>

              <span className="suite-counter">CUSTOM DEVELOPMENT</span>
            </div>

            <div className="jo-head">
              <div>
                <span className="eyebrow">{t.customServices}</span>
              </div>

              <p className="jo-count">
                {pad(catalog.length)} <span>{t.serviceCount}</span>
              </p>
            </div>

            {catalog.length === 0 ? (
              <p className="jo-empty">
                {common.noServices}
              </p>
            ) : (
              <div className="cg-grid">
              {catalog.map((item, i) => {
                const localized = translations.catalog.items[item.id as keyof typeof translations.catalog.items];
                return <article key={item.id} className="cg-card">
                    <div className="cg-top">
                      <span className="cg-num">{pad(i + 1)}</span>
                      <span className="cg-label">{t.customService}</span>
                    </div>

                    <h3 className="cg-name">{localized?.name ?? item.name}</h3>

                    <div className="cg-price">
                      <small>{common.basePrice}</small>
                      <p>{item.price}</p>
                    </div>

                    <p className="cg-desc">{localized?.description ?? item.description}</p>

                    <Link href="/cotizacion" className="btn btn-primary cg-btn">
                      {common.requestQuote}
                      <span aria-hidden="true">→</span>
                    </Link>
                  </article>;
              })}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="suite-contact">
          <div className="section-shell suite-contact-content">
            <span className="eyebrow">03 / GET STARTED</span>

            <h2>
              {t.contactTitle}
            </h2>

            <p>
              {t.contactDescription}
            </p>

            <Link href="/#contacto" className="suite-contact-button">
              {t.contactAction} <span>↗</span>
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
