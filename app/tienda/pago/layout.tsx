// Estilos del checkout (métodos de pago, formulario de tarjeta, alertas).
// Son los mismos que usa la demo de /ventas; sin este import las páginas de pago
// de la tienda salen sin estilo al abrirlas directamente.
import "../../ventas/ventas.css";

export default function TiendaPagoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
