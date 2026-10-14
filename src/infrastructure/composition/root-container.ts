import { listServiceCatalog } from "@/src/application/catalog/use-cases/list-service-catalog.use-case";
import { getHrAccessOverview } from "@/src/application/hr/use-cases/get-hr-access-overview.use-case";
import { listJobOpenings } from "@/src/application/jobs/use-cases/list-job-openings.use-case";
import { getLandingContent } from "@/src/application/marketing/use-cases/get-landing-content.use-case";
import { staticServiceCatalogRepository } from "../catalog/static-service-catalog.repository";
import { staticHrAccessRepository } from "../hr/static-hr-access.repository";
import { staticJobOpeningRepository } from "../jobs/static-job-opening.repository";
import { staticLandingContentRepository } from "../marketing/static-landing-content.repository";

import { listCategories } from "@/src/application/products/use-cases/list-categories.use-case";
import { listProducts } from "@/src/application/products/use-cases/list-products.use-case";
import type { FiltroProductos } from "@/src/domain/products/product.entity";
import { supabaseProductRepository } from "../products/supabase-product.repository";

export const container = {
  marketing: {
    getLandingContent: () => getLandingContent(staticLandingContentRepository)
  },
  catalog: {
    listServiceCatalog: () => listServiceCatalog(staticServiceCatalogRepository)
  },
  jobs: {
    listJobOpenings: () => listJobOpenings(staticJobOpeningRepository)
  },
  hr: {
    getAccessOverview: () => getHrAccessOverview(staticHrAccessRepository)
  },
  products: {
    listProducts: (filtro?: FiltroProductos) =>
      listProducts(supabaseProductRepository, filtro),
    listCategories: () => listCategories(supabaseProductRepository),
    getProductById: (id: string) =>
      supabaseProductRepository.obtenerProductoPorId(id),
  }
};

