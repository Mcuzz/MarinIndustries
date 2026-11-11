"use client";

import Link from "next/link";
import type { CaseStudy } from "@/src/domain/marketing/landing-content.entity";
import { CaseAccordion } from "./CaseAccordion";
import SalesPreview from "./SalesPreview";
import { ContactForm } from "../forms/ContactForm";
import { useLanguage } from "../../i18n/LanguageProvider";

export function HomeSuiteCallout() {
  const { translations } = useLanguage();
  const t = translations.home.suite;
  return (
    <div className="suite-home-cta">
      <div>
        <span className="eyebrow">{t.eyebrow}</span>
        <h3>{t.title}</h3>
        <p>{t.description}</p>
      </div>
      <Link href="/servicios#suite" className="suite-home-button">
        {t.action}<span aria-hidden="true">↗</span>
      </Link>
    </div>
  );
}

export function HomeCaseStudies({ studies }: { studies: CaseStudy[] }) {
  const { translations } = useLanguage();
  const t = translations.home.caseStudies;
  const visuals = studies.map((study) =>
    study.visual === "pos" ? (
      <SalesPreview key={study.id} />
    ) : (
      <div key={study.id} className="media-slot">
        <span>{t.mediaPlaceholder} · {study.tag.toUpperCase()}</span>
      </div>
    ),
  );
  return (
    <section id="casos" data-tone="base" className="ca-section">
      <div className="section-shell ca-shell">
        <div className="ca-head">
          <span className="eyebrow">{t.eyebrow}</span>
          <h2 className="ca-title">{t.title}</h2>
        </div>
        <CaseAccordion studies={studies} visuals={visuals} />
      </div>
    </section>
  );
}

export function HomeContactSection() {
  const { translations } = useLanguage();
  const t = translations.home.contact;
  return (
    <section id="contacto" data-tone="deep" className="ct-section">
      <div className="section-shell ct-grid">
        <div>
          <span className="eyebrow">{t.eyebrow}</span>
          <h2 className="ct-title">{t.title}</h2>
          <p className="ct-lead">{t.description}</p>
        </div>
        <div className="card ct-panel">
          <h3 className="ct-h3">{t.cardTitle}</h3>
          <p className="ct-sub">{t.cardDescription}</p>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
