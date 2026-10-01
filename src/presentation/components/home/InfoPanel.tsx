"use client";

import type { LandingContent } from "@/src/domain/marketing/landing-content.entity";

type InfoPanelProps = {
  services: LandingContent["services"];
  process: LandingContent["process"];
};

const STEP_COPY = [
  "Analizamos necesidades, procesos y oportunidades.",
  "Definimos solución, alcance y prioridades.",
  "Construimos con enfoque práctico y funcional.",
  "Instalamos, configuramos y capacitamos al equipo.",
  "Damos seguimiento para ajustar y mejorar.",
];

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

const TABS = [
  { id: "servicios", label: "Qué hacemos" },
  { id: "nosotros", label: "Quiénes somos" },
  { id: "proceso", label: "Cómo trabajamos" },
];

export function InfoPanel({ services, process }: InfoPanelProps) {
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
      const i = TABS.findIndex((t) => `#${t.id}` === hash);
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
    setActive(Math.max(0, Math.min(TABS.length - 1, i)));

  return (
<section id="empresa" data-tone="alt" className="pn-section relative">      {TABS.map((t) => (
        <span key={t.id} id={t.id} className="pn-anchor" aria-hidden />
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
          {TABS.map((t, i) => {
            const isActive = i === active;
            const p = layout
              ? isActive
                ? layout.anchor
                : layout.slots[i]
              : { x: 0, y: 0 };
            const s = layout ? (isActive ? 1 : layout.scale) : 1;
            return (
              <span
                key={t.id}
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
                {t.label}
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
                      Proyectos de ingeniería como punto fuerte, acompañando a
                      la industria, negocios locales, granjeros, agrónomos y
                      hogares con soluciones de valor real.
                    </p>
                    <ul>
                      {services.map((s, n) => (
                        <li key={s.title} className="pn-row">
                          <span className="pn-row-n">
                            {String(n + 1).padStart(2, "0")}
                          </span>
                          <span className="pn-row-t">{s.title}</span>
                          <span className="pn-row-d">{s.copy}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <MediaSlot label="IMAGEN / GIF · SERVICIOS" />
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
                      Marin Industries nace de una historia familiar marcada por
                      la determinación de construir algo propio y servir con
                      honestidad a la comunidad. Su nombre honra el legado del
                      abuelo del fundador.
                    </p>
                    <p className="mb-10 max-w-xl text-[var(--brand-text)]">
                      Al ver lo difícil que es para los pequeños negocios
                      adaptarse a la era digital, acompañamos a comercios,
                      emprendedores y familias con herramientas accesibles,
                      útiles y adaptadas a su realidad.
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="card p-6">
                        <span className="eyebrow">01 / MISIÓN</span>
                        <p className="mt-3 text-sm text-[var(--brand-text)]">
                          Llegar a los negocios locales de la región con
                          soluciones tecnológicas inteligentes e innovadoras que
                          faciliten sus servicios.
                        </p>
                      </div>
                      <div className="card p-6">
                        <span className="eyebrow">02 / VISIÓN</span>
                        <p className="mt-3 text-sm text-[var(--brand-text)]">
                          Aplicar tecnología para la sustentabilidad y
                          preservación del ecosistema global, mejorando la
                          calidad de vida de la sociedad.
                        </p>
                      </div>
                    </div>
                  </div>
                  <MediaSlot label="IMAGEN / GIF · EQUIPO" ratio="4 / 5" />
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
                      Cada solución empieza entendiendo tu negocio. Después
                      diseñamos una herramienta útil, realista y escalable.
                    </p>
                    <ul>
                      {process.map((step, n) => (
                        <li key={step} className="pn-row">
                          <span className="pn-row-n">
                            {String(n + 1).padStart(2, "0")}
                          </span>
                          <span className="pn-row-t">{step}</span>
                          <span className="pn-row-d">{STEP_COPY[n] ?? ""}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <MediaSlot label="IMAGEN / GIF · PROCESO" />
                </div>
              </div>
            </div>
          </div>

          {/* Fila de etiquetas: parece decoración, funciona como navegación */}
          <div className="pn-slots" role="tablist" aria-label="Secciones">
            {TABS.map((t, i) => (
              <button
                key={t.id}
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
                  {t.label}
                </span>
              </button>
            ))}
            <span className="pn-counter">
              {String(active + 1).padStart(2, "0")} /{" "}
              {String(TABS.length).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
