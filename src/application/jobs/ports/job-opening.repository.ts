import type { JobOpening } from "@/src/domain/jobs/job-opening.entity";

export interface JobOpeningRepository {
  list(): Promise<JobOpening[]>;
}
