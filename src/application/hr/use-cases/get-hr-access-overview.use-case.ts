import type { HrAccessRepository } from "../ports/hr-access.repository";

export function getHrAccessOverview(repository: HrAccessRepository) {
  return repository.listFeatures();
}
