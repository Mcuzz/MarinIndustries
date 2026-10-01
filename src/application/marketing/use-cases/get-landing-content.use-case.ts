import type { LandingContentRepository } from "../ports/landing-content.repository";

export function getLandingContent(repository: LandingContentRepository) {
  return repository.get();
}
