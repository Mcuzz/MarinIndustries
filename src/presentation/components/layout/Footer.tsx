import Link from "next/link";

const footerLinks = [
  { label: "Convocatorias", href: "/convocatorias" },
  { label: "Catalogo", href: "/catalogo" },
  { label: "Cotizacion", href: "/cotizacion" },
  { label: "Recursos humanos", href: "/rh" }
];

export function Footer() {
  return (
<footer data-tone="base" className="py-8 text-brandText/80">      <div className="section-shell flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <p className="text-brandText">© 2026 Marin Industries. Todos los derechos reservados.</p>
          <p className="text-sm text-brandText/60">Soluciones digitales para negocios locales.</p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-brandAccent">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}