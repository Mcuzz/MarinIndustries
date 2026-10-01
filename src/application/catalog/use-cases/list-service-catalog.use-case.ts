import type { ServiceCatalogRepository } from "../ports/service-catalog.repository";

export function listServiceCatalog(repository: ServiceCatalogRepository) {
  return repository.list();
}
