import type { Metadata } from "next";
import "./globals.css";
import "./ventas/ventas.css";

export const metadata: Metadata = {
  title: "Marin Industries | Soluciones digitales para negocios locales",
  description:
    "Soluciones de ingenieria, tecnologia, automatizacion y soporte tecnico para negocios locales e industria.",
  icons: {
    icon: "/assets/logo.png"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              try {
                const saved = localStorage.getItem("marin-theme");
                const dark = saved ? saved === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
                document.documentElement.classList.toggle("dark", dark);
              } catch (_) {}
            })();`
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
