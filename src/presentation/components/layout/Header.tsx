"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  { label: "Convocatorias", href: "/convocatorias" },
  { label: "Servicios", href: "/servicios" },
  { label: "Cotización", href: "/cotizacion" },
  { label: "Recursos humanos", href: "/rh" },
  { label: "Productos", href: "/tienda" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-brandLine bg-brandBg">
      <div className="section-shell flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-4">
          <div className="h-10 w-10 overflow-hidden">
            <img
              src="/assets/logo.png"
              alt="Marin Industries Logo"
              className="h-full w-full object-cover"
            />
          </div>

          <span className="text-sm font-semibold tracking-tight text-brandDark">
            MARIN INDUSTRIES
          </span>
        </Link>

        <div className="flex items-center gap-4 lg:gap-6">
          <nav className="hidden items-center gap-8 text-sm font-medium lg:flex">
            {navItems.map((item) => {
              const esTienda = item.label === "Productos";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  target={esTienda ? "_blank" : undefined}
                  rel={esTienda ? "noopener noreferrer" : undefined}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`transition hover:text-brandAccent ${
                    isActive(item.href) ? "text-brandAccent" : "text-brandText"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <ThemeToggle />

          <button
            type="button"
            className="lg:hidden"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Abrir menú"
            aria-expanded={open}
          >
            <span className="block h-0.5 w-7 bg-brandDark" />
            <span className="mt-1.5 block h-0.5 w-7 bg-brandDark" />
            <span className="mt-1.5 block h-0.5 w-7 bg-brandDark" />
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-brandLine bg-brandBg px-6 py-4 lg:hidden">
          <nav className="flex flex-col gap-4 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`transition hover:text-brandAccent ${
                  isActive(item.href) ? "text-brandAccent" : "text-brandText"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
