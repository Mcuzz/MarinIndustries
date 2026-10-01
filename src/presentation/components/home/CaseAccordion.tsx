"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { CaseStudy } from "@/src/domain/marketing/landing-content.entity";

type CaseAccordionProps = {
  studies: CaseStudy[];
  visuals: ReactNode[];
};

const pad = (n: number) => String(n).padStart(2, "0");

export function CaseAccordion({ studies, visuals }: CaseAccordionProps) {
  const [active, setActive] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const last = studies.length - 1;

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  // Abrir al pasar el mouse (solo desktop con mouse), con pequeña pausa
  const hoverOpen = (i: number) => {
    if (!window.matchMedia("(hover: hover) and (min-width: 901px)").matches) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setActive(i), 110);
  };

  const cancelHover = () => {
    if (timer.current) clearTimeout(timer.current);
  };

  const next = (i: number) => {
    if (i < last) {
      setActive(i + 1);
    } else {
      document
        .getElementById("contacto")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div
      className="ca-track"
      onMouseLeave={cancelHover}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") setActive((a) => Math.min(last, a + 1));
        if (e.key === "ArrowLeft") setActive((a) => Math.max(0, a - 1));
      }}
    >
      {studies.map((s, i) => {
        const isActive = i === active;

        return (
          <article
            key={s.id}
            className="ca-panel"
            data-active={isActive}
            data-next={i === active + 1}
            onMouseEnter={() => hoverOpen(i)}
          >
            {/* Estado cerrado */}
            <button
              type="button"
              className="ca-collapsed"
              aria-expanded={isActive}
              aria-label={`Abrir caso: ${s.tag}, ${s.type}`}
              tabIndex={isActive ? -1 : 0}
              onClick={() => setActive(i)}
            >
              <span className="ca-num">{pad(i + 1)}</span>
              <span className="ca-vtag">
                {s.tag}
                <small>{s.type}</small>
              </span>
              <span className="ca-plus" aria-hidden="true">
                +
              </span>
            </button>

            {/* Estado abierto */}
            <div className="ca-open" inert={!isActive}>
              <div className="ca-open-inner">
                <div className="ca-visual">{visuals[i]}</div>

                <div className="ca-info">
                  <div className="ca-meta">
                    <span className="ca-badge">{s.tag}</span>
                    <span>
                      {s.type} · {s.sector}
                    </span>
                  </div>

                  <h3 className="ca-h3">{s.title}</h3>
                  <p className="ca-copy">{s.copy}</p>

                  <ul className="ca-benefits">
                    {s.benefits.map((b) => (
                      <li key={b}>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {b}
                      </li>
                    ))}
                  </ul>

                  <div className="ca-foot">
                    <button
                      type="button"
                      className="btn btn-primary ca-next"
                      onClick={() => next(i)}
                    >
                      {i < last ? "Siguiente caso" : "Ir a contacto"}
                      <span aria-hidden="true">{i < last ? "→" : "↓"}</span>
                    </button>
                    <span className="ca-count">
                      {pad(i + 1)} / {pad(studies.length)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}