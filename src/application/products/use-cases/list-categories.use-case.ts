import type { Categoria } from "@/src/domain/products/product.entity";
import type { ProductRepository } from "../ports/product.repository";

export async function listCategories(
  repo: ProductRepository
): Promise<Categoria[]> {
  return repo.listarCategorias();
}
