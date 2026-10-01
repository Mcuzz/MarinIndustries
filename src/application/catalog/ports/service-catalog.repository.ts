import type { ServiceOffering } from "@/src/domain/catalog/service-offering.entity";

export interface ServiceCatalogRepository {
  list(): Promise<ServiceOffering[]>;
}
