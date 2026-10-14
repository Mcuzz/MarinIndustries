import type { ProductRepository } from "@/src/application/products/ports/product.repository";
import type {
  Categoria,
  FiltroProductos,
  Producto,
} from "@/src/domain/products/product.entity";
import { createSupabaseBrowserClient } from "../supabase/client";
import { staticProductRepository } from "./static-product.repository";

type ProductoRow = {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number | string;
  existencia: number;
  estado: "activo" | "inactivo" | "agotado";
  oferta: boolean;
  categoria: string;
  categoria_id: string | null;
  imagen_url: string;
  creado_en: string;
  actualizado_en: string;
  producto_imagenes?: {
    id: string;
    url: string;
    alt_texto: string | null;
    orden: number;
    es_portada: boolean;
  }[];
};

type CategoriaRow = {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  creado_en: string;
};

function mapearFilaAProducto(row: ProductoRow): Producto {
  return {
    id: row.id,
    nombre: row.nombre,
    precio: typeof row.precio === "string" ? parseFloat(row.precio) : row.precio,
    descripcion: row.descripcion ?? "",
    existencia: row.existencia ?? 0,
    estado: row.estado ?? "activo",
    oferta: Boolean(row.oferta),
    categoria: row.categoria,
    categoriaId: row.categoria_id ?? undefined,
    imagen: row.imagen_url,
    imagenes: row.producto_imagenes?.map((img) => ({
      id: img.id,
      productoId: row.id,
      url: img.url,
      altTexto: img.alt_texto ?? undefined,
      orden: img.orden,
      esPortada: img.es_portada,
    })),
    creadoEn: row.creado_en,
    actualizadoEn: row.actualizado_en,
  };
}

export class SupabaseProductRepository implements ProductRepository {
  private hasSupabaseCredentials(): boolean {
    const hasUrl = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    );
    const hasKey = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.SUPABASE_PUBLISHABLE_KEY ||
        process.env.SUPABASE_ANON_KEY
    );
    return hasUrl && hasKey;
  }


  async listarProductos(filtro?: FiltroProductos): Promise<Producto[]> {
    if (!this.hasSupabaseCredentials()) {
      return staticProductRepository.listarProductos(filtro);
    }

    try {
      const supabase = createSupabaseBrowserClient();
      let query = supabase
        .from("productos")
        .select("*, producto_imagenes(*)");

      if (filtro?.soloActivos !== false) {
        query = query.eq("estado", "activo");
      }

      if (filtro?.categoria && filtro.categoria !== "Todas") {
        query = query.eq("categoria", filtro.categoria);
      }

      if (filtro?.soloOfertas) {
        query = query.eq("oferta", true);
      }

      if (filtro?.busqueda) {
        const busqueda = `%${filtro.busqueda.trim()}%`;
        query = query.or(`nombre.ilike.${busqueda},descripcion.ilike.${busqueda}`);
      }

      const { data, error } = await query.order("creado_en", { ascending: false });

      if (error || !data) {
        console.warn("Error al consultar Supabase, usando respaldo estático:", error?.message);
        return staticProductRepository.listarProductos(filtro);
      }

      return (data as unknown as ProductoRow[]).map(mapearFilaAProducto);
    } catch (err) {
      console.warn("Excepción al conectar con Supabase:", err);
      return staticProductRepository.listarProductos(filtro);
    }
  }

  async obtenerProductoPorId(id: string): Promise<Producto | null> {
    if (!this.hasSupabaseCredentials()) {
      return staticProductRepository.obtenerProductoPorId(id);
    }

    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("productos")
        .select("*, producto_imagenes(*)")
        .eq("id", id)
        .maybeSingle();

      if (error || !data) {
        return staticProductRepository.obtenerProductoPorId(id);
      }

      return mapearFilaAProducto(data as unknown as ProductoRow);
    } catch {
      return staticProductRepository.obtenerProductoPorId(id);
    }
  }

  async listarCategorias(): Promise<Categoria[]> {
    if (!this.hasSupabaseCredentials()) {
      return staticProductRepository.listarCategorias();
    }

    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("categorias")
        .select("*")
        .order("nombre", { ascending: true });

      if (error || !data) {
        return staticProductRepository.listarCategorias();
      }

      return (data as CategoriaRow[]).map((c) => ({
        id: c.id,
        nombre: c.nombre,
        slug: c.slug,
        descripcion: c.descripcion ?? undefined,
        creadoEn: c.creado_en,
      }));
    } catch {
      return staticProductRepository.listarCategorias();
    }
  }
}

export const supabaseProductRepository = new SupabaseProductRepository();
