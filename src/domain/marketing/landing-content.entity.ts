export type ServiceSummary = {
  title: string;
  copy: string;
  icon: string;
};

export type ModuleSummary = {
  title: string;
  copy: string;
  href: string;
};

export type CaseStudy = {
  id: string;
  tag: string;
  sector: string;
  type: string;
  title: string;
  copy: string;
  benefits: string[];
  visual: "inventory" | "pos" | "washing";
};

export type LandingContent = {
  services: ServiceSummary[];
  modules: ModuleSummary[];
  process: string[];
  caseStudies: CaseStudy[];
};
