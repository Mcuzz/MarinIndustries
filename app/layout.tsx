import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}