import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { getPageData } from "@/api/siteDataApi";
import { DEFAULT_LANGUAGE, getSection } from "@/lib/siteData";
import { SITE_URL } from "@/lib/seo";
import type { BasicPageContent, ProjectsListContent } from "@/types/siteData";

interface SitemapEntry {
  path: string;
  changefreq?: "weekly" | "monthly" | "yearly";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const projectsPage = await getPageData<BasicPageContent>(DEFAULT_LANGUAGE, "projects");
        const projects =
          getSection<ProjectsListContent>(projectsPage, "projects-list")?.content.items ?? [];
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "monthly", priority: "1.0" },
          { path: "/about", changefreq: "yearly", priority: "0.8" },
          { path: "/projects", changefreq: "monthly", priority: "0.9" },
          { path: "/experience", changefreq: "yearly", priority: "0.8" },
          { path: "/contact", changefreq: "yearly", priority: "0.6" },
          ...projects.map((project) => ({
            path: `/projects/${project.slug}`,
            changefreq: "yearly" as const,
            priority: "0.7",
          })),
        ];

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...entries.map((entry) =>
            [
              `  <url>`,
              `    <loc>${SITE_URL}${entry.path}</loc>`,
              entry.changefreq ? `    <changefreq>${entry.changefreq}</changefreq>` : null,
              entry.priority ? `    <priority>${entry.priority}</priority>` : null,
              `  </url>`,
            ]
              .filter(Boolean)
              .join("\n"),
          ),
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
