import { getGlobalContent, getSection } from "@/lib/siteData";
import type {
  ExperienceEntry,
  ExperienceListContent,
  GlobalResponse,
  HeaderGlobalContent,
  PageResponse,
  Project,
  ProjectsListContent,
  SiteGlobalContent,
} from "@/types/siteData";

export function projectsOf(page: PageResponse | undefined): Project[] {
  return getSection<ProjectsListContent>(page, "projects-list")?.content.items ?? [];
}

export function experienceOf(page: PageResponse | undefined): ExperienceEntry[] {
  return getSection<ExperienceListContent>(page, "experience-list")?.content.items ?? [];
}

/** The role whose period is still open ("Feb 2026 – Present"). */
export function currentRole(items: ExperienceEntry[]) {
  return items.find((item) => /present|الآن/i.test(item.period));
}

export function requireSite(global: GlobalResponse): SiteGlobalContent {
  const site = getGlobalContent<SiteGlobalContent>(global, "site");
  if (!site) throw new Error("The site settings are missing from the CMS.");
  return site;
}

/** Navigation label the CMS uses for a page, for breadcrumbs. */
export function navLabel(global: GlobalResponse, path: string, fallback: string) {
  const header = getGlobalContent<HeaderGlobalContent>(global, "header");
  return header?.navItems.find((item) => item.to === path)?.label ?? fallback;
}
