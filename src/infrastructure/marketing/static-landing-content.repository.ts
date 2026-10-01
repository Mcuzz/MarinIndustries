import type { LandingContent } from "@/src/domain/marketing/landing-content.entity";
import type { LandingContentRepository } from "@/src/application/marketing/ports/landing-content.repository";

const landingContent: LandingContent = {
  services: [
    {
      title: "Proyectos de ingenieria",
      copy: "Soluciones industriales, software, mecatronica y biomedica, pensadas para cada contexto.",
      icon: "01"
    },
    {
      title: "Software y sistemas",
      copy: "Sistemas de gestion, automatizacion y herramientas que mejoran la operacion diaria.",
      icon: "02"
    },
    {
      title: "Aplicaciones moviles",
      copy: "Apps practicas para pedidos, servicios, seguimiento y atencion mas rapida.",
      icon: "03"
    },
    {
      title: "Sitios web",
      copy: "Presencia digital profesional para mostrar servicios, atraer clientes y generar confianza.",
      icon: "04"
    },
    {
      title: "Automatizacion",
      copy: "Simplificacion de procesos repetitivos para ahorrar tiempo y reducir errores.",
      icon: "05"
    },
    {
      title: "Servicios tecnicos",
      copy: "Soporte para equipos y dispositivos en casa, comercio e industria.",
      icon: "06"
    }
  ],
  modules: [
    {
      title: "Convocatorias",
      copy: "Base para publicar vacantes, proyectos disponibles y oportunidades de colaboracion.",
      href: "/convocatorias"
    },
    {
      title: "Catalogo y costos",
      copy: "Servicios y productos con precios estaticos o rangos iniciales mientras se define administracion.",
      href: "/catalogo"
    },
    {
      title: "Cotizacion",
      copy: "Formulario inicial para recopilar necesidades antes de automatizar reglas de precio.",
      href: "/cotizacion"
    },
    {
      title: "Recursos humanos",
      copy: "Entrada separada para expedientes, matriz de aptitudes y control interno autorizado.",
      href: "/rh"
    }
  ],
  process: ["Diagnostico", "Propuesta", "Desarrollo", "Implementacion", "Acompanamiento"],
  caseStudies: [
    {
      id: "yolandas-inventory",
      tag: "Yolanda's",
      sector: "Retail",
      type: "Sistema de inventario",
      title: "Inventario y control de ventas",
      copy: "Panel practico para controlar entradas, salidas, ventas y existencias sin depender de registros dispersos.",
      benefits: ["Control claro del stock", "Menos errores al registrar ventas", "Informacion lista para decidir"],
      visual: "inventory"
    },
    {
      id: "terrazitas-pos",
      tag: "Terrazitas",
      sector: "Restaurante",
      type: "Punto de venta",
      title: "Punto de venta y seguimiento operativo",
      copy: "Interfaz para registrar pedidos, cerrar turnos y dar seguimiento a la operacion sin depender de papel.",
      benefits: ["Atencion mas agil en horas pico", "Menos carga manual al cierre", "Mejor experiencia para el equipo"],
      visual: "pos"
    },
    {
      id: "limon-son-washing",
      tag: "Limon-Son",
      sector: "Produccion",
      type: "Automatizacion industrial",
      title: "Solucion para el lavado de frutas",
      copy: "Solucion de ingenieria para optimizar el lavado, reducir variabilidad y dar control al proceso productivo.",
      benefits: ["Proceso mas practico y repetible", "Mejor control de produccion", "Resultados medibles"],
      visual: "washing"
    }
  ]
};

export const staticLandingContentRepository: LandingContentRepository = {
  async get() {
    return landingContent;
  }
};
