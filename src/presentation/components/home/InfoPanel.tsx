"use client";

import type { LandingContent } from "@/src/domain/marketing/landing-content.entity";
import { useLanguage } from "../../i18n/LanguageProvider";

type InfoPanelProps = {
  services: LandingContent["services"];
  process: LandingContent["process"];
};

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

const TAB_IDS = ["servicios", "nosotros", "proceso"] as const;
const TAB_KEYS = ["services", "company", "process"] as const;

export function InfoPanel({ services, process }: InfoPanelProps) {
  const { translations } = useLanguage();
  const t = translations.home.infoPanel;
  type Pt = { x: number; y: number };
  type Layout = { anchor: Pt; slots: Pt[]; scale: number };

  function MediaSlot({
    label,
    ratio = "4 / 3",
  }: {
    label: string;
    ratio?: string;
  }) {
    return (
      <div className="media-slot" style={{ aspectRatio: ratio }}>
        <span>{label}</span>
      </div>
    );
  }

  const [active, setActive] = useState(0);
  const [layout, setLayout] = useState<Layout | null>(null);
  const [animate, setAnimate] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const slotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const touchX = useRef<number | null>(null);

  const measure = useCallback(() => {
    const stage = stageRef.current;
    const anchor = anchorRef.current;
    const firstLabel = labelRefs.current[0];
    if (!stage || !anchor || !firstLabel) return;

    const st = stage.getBoundingClientRect();
    const an = anchor.getBoundingClientRect();
    const bigPx = parseFloat(getComputedStyle(firstLabel).fontSize);
    const smallPx = parseFloat(getComputedStyle(slotRefs.current[0]!).fontSize);

    setLayout({
      anchor: { x: an.left - st.left, y: an.top - st.top },
      slots: slotRefs.current.map((el) => {
        const r = el!.getBoundingClientRect();
        return { x: r.left - st.left, y: r.top - st.top };
      }),
      scale: smallPx / bigPx,
    });
  }, []);

  useLayoutEffect(() => {
    measure();
    const raf = requestAnimationFrame(() => setAnimate(true));
    document.fonts?.ready.then(measure);
    const ro = new ResizeObserver(measure);
    if (stageRef.current) ro.observe(stageRef.current);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  // Los links del navbar (#servicios, #nosotros, #proceso) abren la pestaña correcta
  useEffect(() => {
    const openFromHash = (hash: string) => {
      const i = TAB_IDS.findIndex((id) => `#${id}` === hash);
      if (i >= 0) setActive(i);
    };

    // Al cargar la página con un hash (ej. /#nosotros)
    openFromHash(window.location.hash);

    // Al hacer clic en cualquier link a /#servicios, /#nosotros, /#proceso
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a");
      if (!a) return;
      const url = new URL(a.href, window.location.origin);
      if (url.pathname === "/") openFromHash(url.hash);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const go = (i: number) =>
    setActive(Math.max(0, Math.min(TAB_IDS.length - 1, i)));

  return (
    <section id="empresa" data-tone="alt" className="pn-section relative">      {TAB_IDS.map((id) => (
        <span key={id} id={id} className="pn-anchor" aria-hidden />
      ))}

      <div
        className="section-shell"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(active + 1);
          if (e.key === "ArrowLeft") go(active - 1);
        }}
      >
        <div ref={stageRef} className="pn-stage">
          {/* Punto de anclaje del título (invisible, solo para medir) */}
          <div
            ref={anchorRef}
            className="pn-anchor-title pn-title-size"
            aria-hidden
          />

          {/* Etiquetas/títulos flotantes: son el mismo elemento en ambos estados */}
          {TAB_IDS.map((id, i) => {
            const isActive = i === active;
            const p = layout
              ? isActive
                ? layout.anchor
                : layout.slots[i]
              : { x: 0, y: 0 };
            const s = layout ? (isActive ? 1 : layout.scale) : 1;
            return (
              <span
                key={id}
                ref={(el) => {
                  labelRefs.current[i] = el;
                }}
                aria-hidden
                className="pn-label pn-title-size"
                data-active={isActive}
                data-animate={animate}
                style={{
                  transform: `translate(${p.x}px, ${p.y}px) scale(${s})`,
                  opacity: layout ? undefined : 0,
                }}
              >
                {t.tabs[TAB_KEYS[i]]}
              </span>
            );
          })}

          {/* Carrusel */}
          <div
            className="pn-viewport"
            onPointerDown={(e) => {
              if (e.pointerType !== "mouse") touchX.current = e.clientX;
            }}
            onPointerUp={(e) => {
              if (touchX.current === null) return;
              const dx = e.clientX - touchX.current;
              touchX.current = null;
              if (Math.abs(dx) > 50) go(active + (dx < 0 ? 1 : -1));
            }}
          >
            <div
              className="pn-track"
              style={{ transform: `translateX(-${active * 100}%)` }}
            >
              {/* 1 · Qué hacemos */}
              <div
                className="pn-slide"
                role="tabpanel"
                data-active={active === 0}
                inert={active !== 0}
              >
                <div className="pn-body grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
                  <div>
                    <p className="mb-8 max-w-xl text-[var(--brand-text)]">
                      {t.services.intro}
                    </p>
                    <ul>
                      {services.map((s, n) => {
                        const localized = t.services.items[s.icon as keyof typeof t.services.items];
                        return <li key={s.icon} className="pn-row">
                          <span className="pn-row-n">
                            {String(n + 1).padStart(2, "0")}
                          </span>
                          <span className="pn-row-t">{localized?.title ?? s.title}</span>
                          <span className="pn-row-d">{localized?.copy ?? s.copy}</span>
                        </li>
                      })}
                    </ul>
                  </div>
                  <MediaSlot label={t.media.services} />
                </div>
              </div>

              {/* 2 · Quiénes somos */}
              <div
                className="pn-slide"
                role="tabpanel"
                data-active={active === 1}
                inert={active !== 1}
              >
                <div className="pn-body grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
                  <div>
                    <p className="mb-5 max-w-xl text-[var(--brand-text)]">
                      {t.company.story}
                    </p>
                    <p className="mb-10 max-w-xl text-[var(--brand-text)]">
                      {t.company.purpose}
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="card p-6">
                        <span className="eyebrow">{t.company.missionLabel}</span>
                        <p className="mt-3 text-sm text-[var(--brand-text)]">
                          {t.company.mission}
                        </p>
                      </div>
                      <div className="card p-6">
                        <span className="eyebrow">{t.company.visionLabel}</span>
                        <p className="mt-3 text-sm text-[var(--brand-text)]">
                          {t.company.vision}
                        </p>
                      </div>
                    </div>
                  </div>
                  <MediaSlot label={t.media.company} ratio="4 / 5" />
                </div>
              </div>

              {/* 3 · Cómo trabajamos */}
              <div
                className="pn-slide"
                role="tabpanel"
                data-active={active === 2}
                inert={active !== 2}
              >
                <div className="pn-body grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
                  <div>
                    <p className="mb-8 max-w-xl text-[var(--brand-text)]">
                      {t.process.intro}
                    </p>
                    <ul>
                      {process.map((step, n) => {
                        const localized = t.process.steps[String(n + 1).padStart(2, "0") as keyof typeof t.process.steps];
                        return <li key={step} className="pn-row">
                          <span className="pn-row-n">
                            {String(n + 1).padStart(2, "0")}
                          </span>
                          <span className="pn-row-t">{localized?.title ?? step}</span>
                          <span className="pn-row-d">{localized?.description ?? ""}</span>
                        </li>
                      })}
                    </ul>
                  </div>
                  <MediaSlot label={t.media.process} />
                </div>
              </div>
            </div>
          </div>

          {/* Fila de etiquetas: parece decoración, funciona como navegación */}
          <div className="pn-slots" role="tablist" aria-label={translations.common.sections}>
            {TAB_IDS.map((id, i) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={i === active}
                onClick={() => go(i)}
                className="pn-slot"
                data-active={i === active}
              >
                <span
                  ref={(el) => {
                    slotRefs.current[i] = el;
                  }}
                  className="pn-slot-text"
                >
                  {t.tabs[TAB_KEYS[i]]}
                </span>
              </button>
            ))}
            <span className="pn-counter">
              {String(active + 1).padStart(2, "0")} /{" "}
              {String(TAB_IDS.length).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
