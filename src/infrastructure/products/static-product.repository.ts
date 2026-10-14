import type { ProductRepository } from "@/src/application/products/ports/product.repository";
import type {
  Categoria,
  FiltroProductos,
  Producto,
} from "@/src/domain/products/product.entity";

export const categoriasEstaticas: Categoria[] = [
  { id: "a0000000-0000-0000-0000-000000000001", nombre: "Herramientas", slug: "herramientas", descripcion: "Herramientas técnicas y de precisión" },
  { id: "a0000000-0000-0000-0000-000000000002", nombre: "Seguridad", slug: "seguridad", descripcion: "Equipo de protección y seguridad industrial" },
  { id: "a0000000-0000-0000-0000-000000000003", nombre: "Accesorios", slug: "accesorios", descripcion: "Accesorios de instalación y repuestos" },
  { id: "a0000000-0000-0000-0000-000000000004", nombre: "Consumibles", slug: "consumibles", descripcion: "Materiales y consumibles para operaciones técnicas" },
];

export const productosEstaticos: Producto[] = [
  {
    id: "P001",
    nombre: "Herramienta de precisión",
    precio: 850,
    descripcion:
      "Herramienta de precisión para trabajos de mantenimiento y operaciones técnicas.",
    existencia: 12,
    estado: "activo",
    imagen:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSbFAOO6BmRCf20_t6KPqwIHTrJWJ56Zjz-j35sYvC6bN-bdwwPxooQBSm&s=10",
    categoria: "Herramientas",
    categoriaId: "a0000000-0000-0000-0000-000000000001",
    oferta: true,
  },
  {
    id: "P002",
    nombre: "Equipo de protección",
    precio: 420,
    descripcion:
      "Equipo de protección para actividades de trabajo industrial.",
    existencia: 20,
    estado: "activo",
    imagen:
      "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=900&q=80",
    categoria: "Seguridad",
    categoriaId: "a0000000-0000-0000-0000-000000000002",
    oferta: false,
  },
  {
    id: "P003",
    nombre: "Accesorios industriales",
    precio: 630,
    descripcion:
      "Accesorios para tareas generales de instalación y mantenimiento.",
    existencia: 8,
    estado: "activo",
    imagen:
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=80",
    categoria: "Accesorios",
    categoriaId: "a0000000-0000-0000-0000-000000000003",
    oferta: false,
  },
  {
    id: "P004",
    nombre: "Kit de mantenimiento",
    precio: 1250,
    descripcion:
      "Conjunto de herramientas para trabajos de revisión y mantenimiento.",
    existencia: 5,
    estado: "activo",
    imagen:
      "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=900&q=80",
    categoria: "Herramientas",
    categoriaId: "a0000000-0000-0000-0000-000000000001",
    oferta: false,
  },
  {
    id: "P005",
    nombre: "Consumibles técnicos",
    precio: 280,
    descripcion:
      "Materiales de consumo para actividades de mantenimiento.",
    existencia: 30,
    estado: "activo",
    imagen:
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=900&q=80",
    categoria: "Consumibles",
    categoriaId: "a0000000-0000-0000-0000-000000000004",
    oferta: false,
  },
];

export const staticProductRepository: ProductRepository = {
  async listarProductos(filtro?: FiltroProductos): Promise<Producto[]> {
    let items = [...productosEstaticos];

    if (filtro?.soloActivos) {
      items = items.filter((p) => p.estado === "activo");
    }

    if (filtro?.categoria && filtro.categoria !== "Todas") {
      items = items.filter((p) => p.categoria.toLowerCase() === filtro.categoria?.toLowerCase());
    }

    if (filtro?.soloOfertas) {
      items = items.filter((p) => p.oferta === true);
    }

    if (filtro?.busqueda) {
      const q = filtro.busqueda.trim().toLowerCase();
      items = items.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          p.descripcion.toLowerCase().includes(q)
      );
    }

    return items;
  },

  async obtenerProductoPorId(id: string): Promise<Producto | null> {
    return productosEstaticos.find((p) => p.id === id) ?? null;
  },

  async listarCategorias(): Promise<Categoria[]> {
    return categoriasEstaticas;
  },
};
