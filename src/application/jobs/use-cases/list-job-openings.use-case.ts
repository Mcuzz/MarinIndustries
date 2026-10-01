import type { JobOpeningRepository } from "../ports/job-opening.repository";

export function listJobOpenings(repository: JobOpeningRepository) {
  return repository.list();
}
