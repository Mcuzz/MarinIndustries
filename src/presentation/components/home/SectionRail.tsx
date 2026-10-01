"use client";

import { useEffect, useRef, useState } from "react";

const SECTIONS = [
  { id: "inicio", label: "Inicio" },
  { id: "empresa", label: "Empresa" },
  { id: "casos", label: "Casos" },
  { id: "contacto", label: "Contacto" },
];

export function SectionRail() {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // Scroll-spy: la sección activa es la última cuyo borde superior ya pasó el 40% de la pantalla
  useEffect(() => {
    let raf = 0;

    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.4;
      let current = 0;

      SECTIONS.forEach((s, i) => {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= line) current = i;
      });

      setActive(current);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Menú móvil: cerrar con Escape o al tocar fuera
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDown = (e: PointerEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);

    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const goTo = (id: string) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    setOpen(false);
  };

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div ref={boxRef}>
      {/* Desktop: riel de marcas */}
      <nav className="rail" aria-label="Secciones de la página">
        {SECTIONS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className="rail-item"
            data-active={i === active}
            aria-label={s.label}
            aria-current={i === active ? "true" : undefined}
            onClick={() => goTo(s.id)}
          >
            <span className="rail-label">{s.label}</span>
            <span className="rail-tick" />
          </button>
        ))}
      </nav>

      {/* Celular: botón índice */}
      <div className="rail-m">
        <button
          type="button"
          className="rail-m-btn"
          aria-expanded={open}
          aria-label="Ir a una sección"
          onClick={() => setOpen((o) => !o)}
        >
          {pad(active + 1)}
          <span>/{pad(SECTIONS.length)}</span>
        </button>

        <div className="rail-m-menu" data-open={open} inert={!open}>
          {SECTIONS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className="rail-m-item"
              data-active={i === active}
              onClick={() => goTo(s.id)}
            >
              <small>{pad(i + 1)}</small>
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}