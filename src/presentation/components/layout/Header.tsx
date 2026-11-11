"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { useLanguage } from "../../i18n/LanguageProvider";

const navItems = [
  { label: "announcements", href: "/convocatorias" },
  { label: "services", href: "/servicios" },
  { label: "quotation", href: "/cotizacion" },
  { label: "humanResources", href: "/rh" },
  { label: "products", href: "/tienda" },
] as const;

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { language, setLanguage, translations } = useLanguage();

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
              const esTienda = item.label === "products";

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
                  {translations.header.navigation[item.label]}
                </Link>
              );
            })}
          </nav>

          <ThemeToggle />
          <div
            className="flex items-center gap-1 rounded-md border border-brandLine p-1"
            aria-label={translations.language.select}
          >
            <button
              type="button"
              onClick={() => setLanguage("es")}
              aria-pressed={language === "es"}
              className={`rounded px-2 py-1 text-xs font-semibold transition ${
                language === "es"
                  ? "bg-brandAccent text-brandDark"
                  : "text-brandText hover:text-brandAccent"
              }`}
            >
              ES
            </button>

            <button
              type="button"
              onClick={() => setLanguage("en")}
              aria-pressed={language === "en"}
              className={`rounded px-2 py-1 text-xs font-semibold transition ${
                language === "en"
                  ? "bg-brandAccent text-brandDark"
                  : "text-brandText hover:text-brandAccent"
              }`}
            >
              EN
            </button>
          </div>

          <button
            type="button"
            className="lg:hidden"
            onClick={() => setOpen((prev) => !prev)}
            aria-label={
              open
                ? translations.header.closeMenu
                : translations.header.openMenu
            }
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
                {translations.header.navigation[item.label]}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
