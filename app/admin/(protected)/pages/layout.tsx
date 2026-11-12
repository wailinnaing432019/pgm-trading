import { PageTabs, type PageTabProgress } from "@/components/admin/page-tabs";
import {
  getAdminChecklist,
  getAdminMilestones,
  getAdminOffices,
  getAdminSections,
  getAdminServices,
  getAdminSupplySteps,
  getAdminValues,
  getAllStats,
} from "@/lib/queries";

function countDone(flags: boolean[]): PageTabProgress {
  return {
    done: flags.filter(Boolean).length,
    total: flags.length,
  };
}

export default async function AdminPagesLayout({ children }: { children: React.ReactNode }) {
  const [
    homeSections,
    aboutSections,
    servicesSections,
    contactSections,
    sharedSections,
    stats,
    steps,
    values,
    milestones,
    certifications,
    services,
    capabilities,
    offices,
  ] = await Promise.all([
    getAdminSections("home"),
    getAdminSections("about"),
    getAdminSections("services"),
    getAdminSections("contact"),
    getAdminSections("shared"),
    getAllStats(),
    getAdminSupplySteps(),
    getAdminValues(),
    getAdminMilestones(),
    getAdminChecklist("certifications"),
    getAdminServices(),
    getAdminChecklist("capabilities"),
    getAdminOffices(),
  ]);

  const progress: Record<string, PageTabProgress> = {
    home: countDone([
      Boolean(homeSections.hero),
      stats.length > 0,
      Boolean(homeSections.story),
      Boolean(homeSections.storyQuote),
      Boolean(homeSections.servicesHeading),
      Boolean(homeSections.productHeading),
      Boolean(homeSections.supplyChain),
      steps.length > 0,
      Boolean(homeSections.newsHeading),
      Boolean(homeSections.cta),
    ]),
    about: countDone([
      Boolean(aboutSections.hero),
      Boolean(aboutSections.story),
      Boolean(aboutSections.mission),
      Boolean(aboutSections.vision),
      Boolean(aboutSections.valuesHeading),
      values.length > 0,
      Boolean(aboutSections.milestonesHeading),
      milestones.length > 0,
      Boolean(aboutSections.certificationsHeading),
      certifications.length > 0,
    ]),
    services: countDone([
      Boolean(servicesSections.hero),
      Boolean(servicesSections.servicesHeading),
      services.length > 0,
      Boolean(servicesSections.capabilitiesHeading),
      capabilities.length > 0,
      Boolean(servicesSections.quote),
    ]),
    contact: countDone([
      Boolean(contactSections.hero),
      offices.length > 0,
      Boolean(contactSections.trust),
    ]),
    brand: countDone([true, Boolean(sharedSections.newsletter)]),
  };

  return <PageTabs progress={progress}>{children}</PageTabs>;
}
