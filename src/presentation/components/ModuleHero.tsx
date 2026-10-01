import type { ReactNode } from "react";

type ModuleHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export function ModuleHero({
  eyebrow,
  title,
  description,
  children,
}: ModuleHeroProps) {
  return (
    <section data-tone="base" className="mh-section">
      <div className="hero-grid" aria-hidden />

      <div className="section-shell mh-inner">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="h1 mh-title">{title}</h1>
          <p className="mh-desc">{description}</p>
        </div>

        {children ? <div className="mh-actions">{children}</div> : null}
      </div>
    </section>
  );
}