export const SITE_URL = "https://www.mostafaabbas.dev";
export const SITE_NAME = "Mostafa Abbas";
export const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

const GITHUB_URL = "https://github.com/mostafaabbas";
const LINKEDIN_URL = "https://www.linkedin.com/in/mostafaabbas";

export function canonical(path: string) {
  return `${SITE_URL}${path === "/" ? "/" : path}`;
}

interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article" | undefined;
  image?: string;
}

export function pageMeta({
  title,
  description,
  path,
  type = "website",
  image = OG_IMAGE,
}: PageMetaInput) {
  const url = canonical(path);
  return {
    meta: [
      { title },
      { name: "robots", content: "index, follow" },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: type },
      { property: "og:url", content: url },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:locale", content: "en_US" },
      { property: "og:image", content: image },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

export const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Mostafa Abbas",
  url: SITE_URL,
  jobTitle: "Full-Stack Developer & Software Engineer",
  description:
    "Full-Stack Developer and Software Engineer building maintainable web applications and business systems.",
  sameAs: [GITHUB_URL, LINKEDIN_URL],
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
};
