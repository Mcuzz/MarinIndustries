"use client";

import Link from "next/link";
import { useLanguage } from "../../i18n/LanguageProvider";

const footerLinks = [
  { label: "Convocatorias", href: "/convocatorias" },
  { label: "Servicios", href: "/servicios" },
  { label: "Cotizacion", href: "/cotizacion" },
  { label: "Recursos humanos", href: "/rh" },
];

const socialLinks = [
  {
    nameKey: "footerSocialInstagram",
    href: "https://www.instagram.com/marinindustriesmx/",
    label: "Instagram",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-5 w-5"
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r=".8" fill="currentColor" />
      </svg>
    ),
  },
  {
    nameKey: "footerSocialTikTok",
    href: "https://www.tiktok.com/@marin.industries.mx",
    label: "TikTok",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className="h-5 w-5"
      >
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.3V2h-3.56v13.67a2.9 2.9 0 0 1-2.9 2.9 2.9 2.9 0 1 1 2.9-2.9c0-.2-.02-.4-.06-.6v-3.63a6.48 6.48 0 0 0-2.84-.65A6.47 6.47 0 1 0 15.82 17V9.62a8.35 8.35 0 0 0 4.88 1.57V7.63a4.84 4.84 0 0 1-1.11-.94Z" />
      </svg>
    ),
  },
  {
    nameKey: "footerSocialFacebook",
    href: "https://www.facebook.com/share/19wWTGUKNt/?mibextid=wwXIfr",
    label: "Facebook",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className="h-5 w-5"
      >
        <path d="M13.5 21v-8.2h2.76l.41-3.2H13.5V7.56c0-.93.26-1.56 1.59-1.56h1.7V3.14c-.3-.04-1.34-.14-2.55-.14-2.52 0-4.24 1.54-4.24 4.37V9.6H7.15v3.2H10V21h3.5Z" />
      </svg>
    ),
  },
];

export function Footer() {
  const { translations } = useLanguage();

  return (
    <footer
      data-tone="base"
      className="border-t border-brandText/10 py-10 text-brandText/80"
    >
      <div className="section-shell">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_auto_auto] md:items-start">
          {/* Información institucional */}
          <div className="max-w-sm">
            <p className="text-sm leading-relaxed text-brandText/60">
              {translations.common.footerDescription}
            </p>
          </div>

          {/* Navegación del sitio */}
          <nav
            aria-label="Navegación del pie de página"
            className="flex flex-col gap-3 text-sm"
          >
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-brandAccent"
              >
                {
                  translations.header.navigation[
                    link.href === "/convocatorias"
                      ? "announcements"
                      : link.href === "/servicios"
                        ? "services"
                        : link.href === "/rh"
                          ? "humanResources"
                          : "quotation"
                  ]
                }
              </Link>
            ))}
          </nav>

          {/* Redes sociales */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold tracking-wide text-brandText">
              {translations.common.footerSocialTitle}
            </h3>

            <p className="max-w-xs text-xs leading-relaxed text-brandText/60">
              {translations.common.footerSocialDescription}
            </p>

            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={
                    translations.common[
                      social.nameKey as keyof typeof translations.common
                    ]
                  }
                  title={
                    translations.common[
                      social.nameKey as keyof typeof translations.common
                    ]
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-brandText/15 text-brandText/70 transition-all duration-200 hover:border-brandAccent hover:bg-brandAccent hover:text-white"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Derechos reservados */}
        <div className="mt-8 border-t border-brandText/10 pt-5">
          <p className="text-xs text-brandText/50">
            {translations.common.footerRights}
          </p>
        </div>
      </div>
    </footer>
  );
}
