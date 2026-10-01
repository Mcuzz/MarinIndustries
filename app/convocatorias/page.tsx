import { redirect } from "next/navigation";
import { container } from "@/src/infrastructure/composition/root-container";
import { createSupabaseServerClient } from "@/src/infrastructure/supabase/server";
import { JobOpeningsPage } from "@/src/presentation/pages/JobOpeningsPage";

export default async function Page() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const openings = await container.jobs.listJobOpenings();

  return <JobOpeningsPage openings={openings} />;
}