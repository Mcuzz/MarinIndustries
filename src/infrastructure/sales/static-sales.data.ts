import type {
  Branch,
  CatalogItem,
  SaleClient,
  SalesOrder,
} from "@/src/domain/sales/sale.entity";

// Datos de ejemplo del mockup. Sustituir por repositorios reales (Supabase) más adelante.

export const branches: Branch[] = [
  { id: "central", name: "Sucursal Central" },
  { id: "norte", name: "Sucursal Norte" },
  { id: "industrial", name: "Sucursal Industrial" },
];

export const clients: SaleClient[] = [
  { id: "ino", name: "Industrias del Norte S.A.", rfc: "INO980412KH2" },
  { id: "clo", name: "Comercializadora López", rfc: "CLO120511890" },
  { id: "gtp", name: "Grupo Tecnológico del Pacífico", rfc: "GTP0901019A1" },
  { id: "mostrador", name: "Cliente General (Venta Mostrador)", rfc: "XAXX010101000" },
];

export const catalog: CatalogItem[] = [
  { id: "pos", name: "Sistema POS de Gestión", type: "producto", unitPrice: 3420, stock: 15 },
  { id: "lavado", name: "Módulo Automatizado de Lavado", type: "producto", unitPrice: 8950, stock: 4 },
  { id: "lector", name: "Lector de código de barras", type: "producto", unitPrice: 1250, stock: 32 },
  { id: "consultoria", name: "Servicio de Consultoría Software", type: "servicio", unitPrice: 12500, stock: null },
  { id: "sitio", name: "Desarrollo de sitio web", type: "servicio", unitPrice: 9800, stock: null },
  { id: "soporte", name: "Soporte técnico mensual", type: "servicio", unitPrice: 2400, stock: null },
];

export const seedOrders: SalesOrder[] = [
  { id: "VEN-00241", clientName: "Industrias del Norte S.A.", rfc: "INO980412KH2", kind: "Servicio", total: 12500, status: "Completado" },
  { id: "VEN-00240", clientName: "Comercializadora López", rfc: "CLO120511890", kind: "Producto", total: 3420, status: "Completado" },
  { id: "VEN-00239", clientName: "Grupo Tecnológico del Pacífico", rfc: "GTP0901019A1", kind: "Mixto", total: 18900, status: "Pendiente" },
];

export const baseKpis = {
  salesToday: 45280,
  finishedOrders: 128,
  dispatchedPieces: 342,
  activeServices: 12,
};
