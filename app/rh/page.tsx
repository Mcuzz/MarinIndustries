import { container } from "@/src/infrastructure/composition/root-container";
import { HrAccessPage } from "@/src/presentation/pages/HrAccessPage";

export default async function Page() {
  const features = await container.hr.getAccessOverview();

  return <HrAccessPage features={features} />;
}
