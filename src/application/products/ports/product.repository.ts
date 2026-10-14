import type {
  Categoria,
  FiltroProductos,
  Producto,
} from "@/src/domain/products/product.entity";

export interface ProductRepository {
  listarProductos(filtro?: FiltroProductos): Promise<Producto[]>;
  obtenerProductoPorId(id: string): Promise<Producto | null>;
  listarCategorias(): Promise<Categoria[]>;
}
