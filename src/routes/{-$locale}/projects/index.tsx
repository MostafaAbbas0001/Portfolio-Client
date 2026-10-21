import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { ProjectBoard } from "@/components/site/ProjectBoard";
import { SectionIntro } from "@/components/site/SectionIntro";
import { TrustedHtml } from "@/components/ui/TrustedHtml";
import { usePageData } from "@/hooks/use-site-data";
import { navLabel, projectsOf, requireSite } from "@/lib/content";
import { localeFromParam } from "@/lib/locale";
import {
  breadcrumbNode,
  buildHead,
  createPageSeo,
  pageUrl,
  stripHtml,
  webPageNode,
} from "@/lib/seo";
import { getUiStrings } from "@/lib/ui-strings";
import { useUiStrings } from "@/hooks/use-ui-strings";
import { globalDataQuery, pageDataQuery } from "@/queries/siteDataQueries";
import type { BasicPageContent } from "@/types/siteData";

export const Route = createFileRoute("/{-$locale}/projects/")({
  loader: async ({ context: { queryClient }, params }) => {
    const locale = localeFromParam(params.locale);
    const [page, global] = await Promise.all([
      queryClient.ensureQueryData(pageDataQuery<BasicPageContent>(locale, "projects")),
      queryClient.ensureQueryData(globalDataQuery(locale)),
    ]);
    const site = requireSite(global);
    const content = page.data.content;
    const seo = createPageSeo({
      site,
      locale,
      path: "/projects",
      seo: page.data.seoData,
      fallbackTitle: stripHtml(content.label),
      fallbackDescription: content.description ?? content.headline,
    });

    return {
      locale,
      seo: {
        ...seo,
        jsonLd: [
          webPageNode(site, seo, "CollectionPage", {
            breadcrumb: { "@id": `${seo.url}#breadcrumb` },
            mainEntity: {
              "@type": "ItemList",
              itemListElement: projectsOf(page).map((project, index) => ({
                "@type": "ListItem",
                position: index + 1,
                url: pageUrl(site, `/projects/${project.slug}`, locale),
                name: project.title,
              })),
            },
          }),
          breadcrumbNode(seo.url, [
            { name: getUiStrings(locale, global).home, url: pageUrl(site, "/", locale) },
            {
              name: navLabel(global, "/projects", getUiStrings(locale, global).projects),
              url: seo.url,
            },
          ]),
        ],
      },
    };
  },
  head: ({ loaderData }) => buildHead(loaderData?.seo),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { locale } = Route.useLoaderData();
  const t = useUiStrings(locale);
  const { data: projectsPage } = usePageData<BasicPageContent>("projects", locale);
  const page = projectsPage.data.content;

  return (
    <>
      <PageHero>
        <div>
          <SectionIntro
            as="h1"
            split
            id="projects-title"
            kicker={t.inProduction}
            titleHtml={page.headline}
            note={
              page.description ? (
                <TrustedHtml as="span" html={page.description} />
              ) : (
                t.inProductionNote
              )
            }
          />
        </div>
      </PageHero>
      <section aria-labelledby="projects-title" className="shell">
        <ProjectBoard projects={projectsOf(projectsPage)} headingLevel="h2" />
      </section>
    </>
  );
}
