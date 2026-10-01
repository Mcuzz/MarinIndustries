import type { HrFeature } from "@/src/domain/hr/hr-feature.entity";

export interface HrAccessRepository {
  listFeatures(): Promise<HrFeature[]>;
}
