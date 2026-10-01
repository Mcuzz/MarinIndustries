import type { ServiceCatalogRepository } from "@/src/application/catalog/ports/service-catalog.repository";
import type { ServiceOffering } from "@/src/domain/catalog/service-offering.entity";

const serviceCatalog: ServiceOffering[] = [
  {
    id: "website-basic",
    name: "Sitio web informativo",
    price: "Desde $4,500 MXN",
    description: "Landing o sitio basico para presentar servicios, contacto y casos de trabajo."
  },
  {
    id: "inventory-system",
    name: "Sistema de inventario",
    price: "Desde $12,000 MXN",
    description: "Control inicial de productos, existencias, entradas, salidas y reportes basicos."
  },
  {
    id: "point-of-sale",
    name: "Punto de venta",
    price: "Desde $15,000 MXN",
    description: "Registro de ventas, productos, cortes y control operativo para negocios locales."
  },
  {
    id: "process-automation",
    name: "Automatizacion de procesos",
    price: "Cotizacion por alcance",
    description: "Diagnostico, propuesta tecnica y desarrollo segun equipo, proceso y objetivos."
  }
];

export const staticServiceCatalogRepository: ServiceCatalogRepository = {
  async list() {
    return serviceCatalog;
  }
};
