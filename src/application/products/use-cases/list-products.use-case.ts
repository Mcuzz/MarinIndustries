import type {
  FiltroProductos,
  Producto,
} from "@/src/domain/products/product.entity";
import type { ProductRepository } from "../ports/product.repository";

export async function listProducts(
  repo: ProductRepository,
  filtro?: FiltroProductos
): Promise<Producto[]> {
  return repo.listarProductos(filtro);
}
