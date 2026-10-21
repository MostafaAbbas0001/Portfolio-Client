import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { getGlobalData, getPageData } from "@/api/siteDataApi";
import { projectsOf, requireSite } from "@/lib/content";
import { LOCALES } from "@/lib/locale";
import { pageUrl } from "@/lib/seo";
import { DEFAULT_LANGUAGE } from "@/lib/siteData";
import type { BasicPageContent } from "@/types/siteData";

const STATIC_PATHS = ["/", "/about", "/projects", "/experience", "/contact"];

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Every page in both languages. Each <url> lists its language alternates so
 * search engines index /about and /ar/about as translations of each other.
 */
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const [global, projectsPage] = await Promise.all([
          getGlobalData(DEFAULT_LANGUAGE),
          getPageData<BasicPageContent>(DEFAULT_LANGUAGE, "projects"),
        ]);
        const site = requireSite(global);
        const paths = [
          ...STATIC_PATHS,
          ...projectsOf(projectsPage).map((project) => `/projects/${project.slug}`),
        ];

        const urls = paths.flatMap((path) =>
          LOCALES.map((locale) => {
            const alternates = [
              ...LOCALES.map(
                (code) =>
                  `    <xhtml:link rel="alternate" hreflang="${code}" href="${escapeXml(pageUrl(site, path, code))}"/>`,
              ),
              `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(pageUrl(site, path, "en"))}"/>`,
            ];
            return [
              "  <url>",
              `    <loc>${escapeXml(pageUrl(site, path, locale))}</loc>`,
              ...alternates,
              "  </url>",
            ].join("\n");
          }),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
