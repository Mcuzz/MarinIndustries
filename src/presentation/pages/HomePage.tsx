import type { LandingContent } from "@/src/domain/marketing/landing-content.entity";
import { PageShell } from "../components/layout/PageShell";
import { InfoPanel } from "../components/home/InfoPanel";
import { Hero } from "../components/home/Hero";
import { SectionRail } from "../components/home/SectionRail";
import {
  HomeCaseStudies,
  HomeContactSection,
  HomeSuiteCallout,
} from "../components/home/LocalizedHomeSections";

type HomePageProps = {
  content: LandingContent;
};

export function HomePage({ content }: HomePageProps) {
  return (
    <PageShell>
      <main>
        <SectionRail />
        <Hero />
        <HomeSuiteCallout />
        <InfoPanel services={content.services} process={content.process} />
        <HomeCaseStudies studies={content.caseStudies} />
        <HomeContactSection />
      </main>
    </PageShell>
  );
}
