export interface LanguageSummary {
  id: number;
  name: string;
  code: string;
  direction: string;
  flag: string;
  isDefault: boolean;
}

export interface SectionContent<TContent = unknown> {
  id: number;
  pageId: number;
  key: string;
  content: TContent;
}

export interface PageContent<TContent = unknown> {
  id: number;
  key: string;
  slug: string;
  content: TContent;
  seoData?: SeoData | undefined;
  sections: SectionContent[];
}

export interface PageResponse<TContent = unknown> {
  language: LanguageSummary;
  data: PageContent<TContent>;
}

export interface GlobalContent<TContent = unknown> {
  id: number;
  key: string;
  content: TContent;
}

export interface GlobalResponse {
  language: LanguageSummary;
  data: GlobalContent[];
}

export interface SeoData {
  title: string;
  description: string;
  path: string;
  ogType?: "website" | "article";
}

export interface CtaLink {
  label: string;
  href: string;
}

export interface NavLink {
  to: string;
  label: string;
}

export interface ExternalLink {
  href: string;
  label: string;
}

export interface TechItem {
  id?: number;
  key?: string;
  name: string;
  imageUrl?: string;
  alt?: string;
}

export interface TechGroup {
  label: string;
  technologyKeys?: string[];
  technologyIds?: number[];
  technologies?: TechItem[];
  items?: TechItem[];
}

export interface Project {
  slug: string;
  title: string;
  logoUrl?: string;
  shortDescription: string;
  description: string;
  year: string;
  role: string;
  category: string;
  technologyKeys?: string[];
  technologyIds?: number[];
  technologies?: Array<TechItem | string>;
  problem: string;
  solution: string;
  contributions: string[];
  engineeringDecisions: string[];
  challenges: string;
  outcome: string;
  projectUrl?: string;
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
}

export interface ExperienceEntry {
  role: string;
  company: string;
  companyLogoUrl?: string;
  period: string;
  location: string;
  description: string;
  responsibilities: string[];
  skills?: string[];
  technologyKeys?: string[];
  technologyIds?: number[];
  technologies?: Array<TechItem | string>;
  relatedProjectSlug?: string;
}

export interface HomePageContent {
  label: string;
  headline: string;
  description: string;
  heroImageUrl: string;
  heroImageAlt: string;
  heroCircuitMessages: string[];
  heroCircuitMessage?: string;
  primaryCta: CtaLink;
  secondaryCta: CtaLink;
}

export interface BasicPageContent {
  label: string;
  headline: string;
  description?: string;
}

export interface AboutPageContent extends BasicPageContent {
  intro: string;
  paragraphs: string[];
  experienceLinkLabel: string;
}

export interface ContactPageContent extends BasicPageContent {
  emailLabel: string;
  elsewhereLabel: string;
  note: string;
}

export interface TechStripContent {
  label: string;
  linkLabel: string;
  technologyKeys?: string[];
  technologyIds?: number[];
  technologies?: TechItem[];
  items?: TechItem[];
}

export interface FeaturedWorkContent {
  label: string;
  headline: string;
  linkLabel: string;
  projectSlugs: string[];
}

export interface ExperiencePreviewContent {
  headline: string;
  linkLabel: string;
  count: number;
}

export interface ProjectsListContent {
  items: Project[];
}

export interface ExperienceListContent {
  labels: {
    responsibilities: string;
    technologies: string;
    skills?: string;
    relatedProject: string;
  };
  items: ExperienceEntry[];
}

export interface TechnologiesContent {
  label: string;
  groups: TechGroup[];
}

export interface ContactLinksContent {
  items: Array<{
    label: string;
    href: string;
    external: boolean;
  }>;
}

export interface SiteGlobalContent {
  siteUrl: string;
  siteName: string;
  contactEmail: string;
  githubUrl: string;
  linkedinUrl: string;
  ogImage: string;
  personSchema: Record<string, unknown>;
  websiteSchema: Record<string, unknown>;
}

export interface HeaderGlobalContent {
  logoUrl: string;
  logoAlt: string;
  homeAriaLabel: string;
  openMenuLabel: string;
  closeMenuLabel: string;
  navItems: NavLink[];
  externalLinks: ExternalLink[];
}

export interface FooterGlobalContent {
  availability: string;
  headline: string;
  emailCta: string;
  replyText: string;
  replyHighlight: string;
  focusLabel: string;
  focusAreas: string[];
  navigationLabel: string;
  copyright: string;
  backToTop: string;
  heroTechnologyKeys?: string[];
  heroTechnologyIds?: number[];
  heroTechnologies?: TechItem[];
}
