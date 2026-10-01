import { container } from "@/src/infrastructure/composition/root-container";
import { HomePage } from "@/src/presentation/pages/HomePage";

export default async function Page() {
  const content = await container.marketing.getLandingContent();

  return <HomePage content={content} />;
}
