import type { LandingContent } from "@/src/domain/marketing/landing-content.entity";

export interface LandingContentRepository {
  get(): Promise<LandingContent>;
}
