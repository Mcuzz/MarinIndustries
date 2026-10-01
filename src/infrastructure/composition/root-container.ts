import { listServiceCatalog } from "@/src/application/catalog/use-cases/list-service-catalog.use-case";
import { getHrAccessOverview } from "@/src/application/hr/use-cases/get-hr-access-overview.use-case";
import { listJobOpenings } from "@/src/application/jobs/use-cases/list-job-openings.use-case";
import { getLandingContent } from "@/src/application/marketing/use-cases/get-landing-content.use-case";
import { staticServiceCatalogRepository } from "../catalog/static-service-catalog.repository";
import { staticHrAccessRepository } from "../hr/static-hr-access.repository";
import { staticJobOpeningRepository } from "../jobs/static-job-opening.repository";
import { staticLandingContentRepository } from "../marketing/static-landing-content.repository";

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
  }
};
