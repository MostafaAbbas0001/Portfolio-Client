import { getApiAssetUrl, imageUrl, isResizableUpload } from "@/api/siteDataApi";
import { LOCALE_META, LOCALES, localizePath, otherLocale, type Locale } from "@/lib/locale";
import type { Project, SeoData, SiteGlobalContent } from "@/types/siteData";

/**
 * Everything a page needs for its <head>. Built in the route loader from CMS
 * data (page `seoData` + the `site` global), so editing content in the admin
 * changes the meta tags without a deploy.
 */
export interface PageSeo {
  locale: Locale;
  url: string;
  alternates: Array<{ hreflang: string; href: string }>;
  siteName: string;
  title: string;
  description: string;
  type: "website" | "article" | "profile";
  /** The share image; absent when neither the page nor the site sets one. */
  image?: { url: string; alt: string } | undefined;
  noindex: boolean;
  verification: { google?: string; bing?: string };
  jsonLd: Array<Record<string, unknown>>;
}

interface PageSeoInput {
  site: SiteGlobalContent;
  locale: Locale;
  /** Route path without the locale prefix, e.g. "/about". */
  path: string;
  seo?: Partial<SeoData> | undefined;
  fallbackTitle: string;
  fallbackDescription: string;
  type?: PageSeo["type"];
  image?: { url: string; alt: string } | undefined;
  noindex?: boolean;
  jsonLd?: Array<Record<string, unknown>>;
}

const DESCRIPTION_LIMIT = 160;

export function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function clampDescription(value: string) {
  const text = stripHtml(value);
  if (text.length <= DESCRIPTION_LIMIT) return text;
  const cut = text.slice(0, DESCRIPTION_LIMIT - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,.;:\-–—]$/, "")}…`;
}

export function siteOrigin(site: SiteGlobalContent) {
  return site.siteUrl.replace(/\/+$/, "");
}

export function absoluteUrl(site: SiteGlobalContent, path: string) {
  return `${siteOrigin(site)}${path === "/" ? "/" : path}`;
}

export function pageUrl(site: SiteGlobalContent, path: string, locale: Locale) {
  return absoluteUrl(site, localizePath(path, locale));
}

/** Uploaded images become absolute API URLs; absolute URLs pass through. */
export function absoluteImage(src: string, width?: 640 | 1280) {
  if (/^https?:\/\//.test(src)) return src;
  if (width && isResizableUpload(src)) return imageUrl(src, width);
  return getApiAssetUrl(src);
}

export function createPageSeo(input: PageSeoInput): PageSeo {
  const { site, locale, path, seo } = input;
  const title = seo?.title?.trim() || `${input.fallbackTitle} — ${site.siteName}`;
  // A description written in the CMS is used exactly as written; only text
  // borrowed from the page body is shortened to snippet length.
  const description = seo?.description?.trim()
    ? stripHtml(seo.description)
    : clampDescription(input.fallbackDescription);
  // Page image, then the page's own picture (e.g. a screenshot), then the
  // site-wide default chosen in the admin (site → share image).
  const imageSource = seo?.ogImage?.trim() || input.image?.url || site.ogImage?.trim();
  const jobTitle = site.personSchema?.["jobTitle"];
  const defaultAlt = typeof jobTitle === "string" ? `${site.siteName}, ${jobTitle}` : site.siteName;

  return {
    locale,
    url: pageUrl(site, path, locale),
    alternates: [
      ...LOCALES.map((code) => ({ hreflang: code, href: pageUrl(site, path, code) })),
      { hreflang: "x-default", href: pageUrl(site, path, "en") },
    ],
    siteName: site.siteName,
    title,
    description,
    type: input.type ?? (seo?.ogType === "article" ? "article" : "website"),
    image: imageSource
      ? {
          url: absoluteImage(imageSource),
          alt: seo?.ogImageAlt?.trim() || input.image?.alt || site.ogImageAlt?.trim() || defaultAlt,
        }
      : undefined,
    noindex: Boolean(seo?.noindex || input.noindex),
    verification: {
      ...(site.googleSiteVerification ? { google: site.googleSiteVerification } : {}),
      ...(site.bingSiteVerification ? { bing: site.bingSiteVerification } : {}),
    },
    jsonLd: input.jsonLd ?? [],
  };
}

type HeadMeta = Record<string, string>;

/** Turns PageSeo into TanStack Router head() output. */
export function buildHead(seo: PageSeo | undefined) {
  if (!seo) return {};
  const meta: HeadMeta[] = [
    { title: seo.title },
    { name: "description", content: seo.description },
    {
      name: "robots",
      content: seo.noindex
        ? "noindex, follow"
        : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    },
    { property: "og:type", content: seo.type },
    { property: "og:site_name", content: seo.siteName },
    { property: "og:title", content: seo.title },
    { property: "og:description", content: seo.description },
    { property: "og:url", content: seo.url },
    { property: "og:locale", content: LOCALE_META[seo.locale].ogLocale },
    {
      property: "og:locale:alternate",
      content: LOCALE_META[otherLocale(seo.locale)].ogLocale,
    },
    ...(seo.image
      ? [
          { property: "og:image", content: seo.image.url },
          { property: "og:image:alt", content: seo.image.alt },
          { name: "twitter:image", content: seo.image.url },
          { name: "twitter:image:alt", content: seo.image.alt },
        ]
      : []),
    { name: "twitter:card", content: seo.image ? "summary_large_image" : "summary" },
    { name: "twitter:title", content: seo.title },
    { name: "twitter:description", content: seo.description },
  ];
  if (seo.verification.google) {
    meta.push({ name: "google-site-verification", content: seo.verification.google });
  }
  if (seo.verification.bing) {
    meta.push({ name: "msvalidate.01", content: seo.verification.bing });
  }

  const links = [
    { rel: "canonical", href: seo.url },
    ...seo.alternates.map((alternate) => ({
      rel: "alternate",
      hrefLang: alternate.hreflang,
      href: alternate.href,
    })),
  ];

  const scripts = seo.jsonLd.length
    ? [
        {
          type: "application/ld+json",
          // "<" is escaped so content can never close the script element.
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": seo.jsonLd,
          }).replace(/</g, "\\u003c"),
        },
      ]
    : [];

  return { meta, links, scripts };
}

/* ---------- Structured data ---------- */

export function personId(site: SiteGlobalContent) {
  return `${siteOrigin(site)}/#person`;
}

export function websiteId(site: SiteGlobalContent) {
  return `${siteOrigin(site)}/#website`;
}

function isHttpUrl(value: unknown): value is string {
  return typeof value === "string" && /^https?:\/\//.test(value);
}

interface PersonExtras {
  portrait?: string | undefined;
  knowsAbout?: string[];
  worksFor?: string | undefined;
  workLocation?: string | undefined;
}

export function personNode(site: SiteGlobalContent, locale: Locale, extras: PersonExtras = {}) {
  const base = site.personSchema ?? {};
  const baseSameAs = Array.isArray(base["sameAs"]) ? base["sameAs"] : [];
  const sameAs = [...new Set([...baseSameAs, site.githubUrl, site.linkedinUrl].filter(isHttpUrl))];
  const name = typeof base["name"] === "string" ? base["name"] : site.siteName;

  return {
    ...base,
    "@type": "Person",
    "@id": personId(site),
    name,
    url: pageUrl(site, "/", locale),
    ...(typeof base["jobTitle"] === "string" ? { jobTitle: base["jobTitle"] } : {}),
    ...(typeof base["description"] === "string" ? { description: base["description"] } : {}),
    ...(extras.portrait ? { image: absoluteImage(extras.portrait, 640) } : {}),
    ...(site.contactEmail ? { email: `mailto:${site.contactEmail}` } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    ...(extras.knowsAbout?.length ? { knowsAbout: extras.knowsAbout } : {}),
    ...(extras.worksFor ? { worksFor: { "@type": "Organization", name: extras.worksFor } } : {}),
    ...(extras.workLocation
      ? { workLocation: { "@type": "Place", name: extras.workLocation } }
      : {}),
  };
}

export function websiteNode(site: SiteGlobalContent, locale: Locale) {
  return {
    ...site.websiteSchema,
    "@type": "WebSite",
    "@id": websiteId(site),
    url: pageUrl(site, "/", locale),
    name: site.siteName,
    inLanguage: locale,
    publisher: { "@id": personId(site) },
  };
}

export function webPageNode(
  site: SiteGlobalContent,
  seo: { url: string; title: string; description: string; locale: Locale },
  type: "WebPage" | "ProfilePage" | "AboutPage" | "CollectionPage" | "ContactPage",
  extra: Record<string, unknown> = {},
) {
  return {
    "@type": type,
    "@id": `${seo.url}#webpage`,
    url: seo.url,
    name: seo.title,
    description: seo.description,
    inLanguage: seo.locale,
    isPartOf: { "@id": websiteId(site) },
    ...extra,
  };
}

export function breadcrumbNode(url: string, items: Array<{ name: string; url: string }>) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function projectNode(
  site: SiteGlobalContent,
  project: Project,
  url: string,
  locale: Locale,
  technologies: string[],
) {
  const image = project.screenshots?.[0]?.url ?? project.logoUrl;
  return {
    "@type": "CreativeWork",
    "@id": `${url}#project`,
    name: project.title,
    headline: project.title,
    description: stripHtml(project.shortDescription),
    abstract: stripHtml(project.description),
    url,
    inLanguage: locale,
    ...(project.year ? { dateCreated: project.year } : {}),
    ...(image ? { image: absoluteImage(image, 1280) } : {}),
    ...(technologies.length ? { keywords: technologies.join(", ") } : {}),
    ...(project.category ? { genre: project.category } : {}),
    creator: { "@id": personId(site) },
    author: { "@id": personId(site) },
    ...(isHttpUrl(project.projectUrl) ? { sameAs: project.projectUrl } : {}),
  };
}
