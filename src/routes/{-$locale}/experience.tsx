import { createFileRoute } from "@tanstack/react-router";
import { imageUrl } from "@/api/siteDataApi";
import { PageHero } from "@/components/site/PageHero";
import { SectionIntro } from "@/components/site/SectionIntro";
import { ArrowIcon, CheckIcon } from "@/components/ui/Icons";
import { ProjectLink } from "@/components/ui/LocalLink";
import { TechList } from "@/components/site/TechList";
import { TrustedHtml } from "@/components/ui/TrustedHtml";
import { usePageData } from "@/hooks/use-site-data";
import { resolveTechnologyReferences, useTechnologyCatalog } from "@/hooks/use-technologies";
import { navLabel, projectsOf, requireSite } from "@/lib/content";
import { localeFromParam } from "@/lib/locale";
import {
  breadcrumbNode,
  buildHead,
  createPageSeo,
  pageUrl,
  personId,
  stripHtml,
  webPageNode,
} from "@/lib/seo";
import { getSection } from "@/lib/siteData";
import { getUiStrings } from "@/lib/ui-strings";
import { useUiStrings } from "@/hooks/use-ui-strings";
import { globalDataQuery, pageDataQuery, technologiesQuery } from "@/queries/siteDataQueries";
import type { BasicPageContent, ExperienceListContent } from "@/types/siteData";

export const Route = createFileRoute("/{-$locale}/experience")({
  loader: async ({ context: { queryClient }, params }) => {
    const locale = localeFromParam(params.locale);
    const [page, global] = await Promise.all([
      queryClient.ensureQueryData(pageDataQuery<BasicPageContent>(locale, "experience")),
      queryClient.ensureQueryData(globalDataQuery(locale)),
      queryClient.ensureQueryData(pageDataQuery<BasicPageContent>(locale, "projects")),
      queryClient.ensureQueryData(technologiesQuery()),
    ]);
    const site = requireSite(global);
    const content = page.data.content;
    const seo = createPageSeo({
      site,
      locale,
      path: "/experience",
      seo: page.data.seoData,
      fallbackTitle: stripHtml(content.label),
      fallbackDescription: content.description ?? content.headline,
    });

    return {
      locale,
      seo: {
        ...seo,
        jsonLd: [
          webPageNode(site, seo, "WebPage", {
            about: { "@id": personId(site) },
            breadcrumb: { "@id": `${seo.url}#breadcrumb` },
          }),
          breadcrumbNode(seo.url, [
            { name: getUiStrings(locale, global).home, url: pageUrl(site, "/", locale) },
            { name: navLabel(global, "/experience", stripHtml(content.label)), url: seo.url },
          ]),
        ],
      },
    };
  },
  head: ({ loaderData }) => buildHead(loaderData?.seo),
  component: ExperiencePage,
});

function ExperiencePage() {
  const { locale } = Route.useLoaderData();
  const t = useUiStrings(locale);
  const { data: experiencePage } = usePageData<BasicPageContent>("experience", locale);
  const { data: projectsPage } = usePageData<BasicPageContent>("projects", locale);
  const catalog = useTechnologyCatalog();
  const page = experiencePage.data.content;
  const list = getSection<ExperienceListContent>(experiencePage, "experience-list")?.content;
  const projects = projectsOf(projectsPage);

  if (!list) throw new Error("Experience page content is missing experience-list.");

  return (
    <>
      <PageHero>
        <div>
          <SectionIntro
            as="h1"
            split
            id="experience-title"
            kicker={t.career}
            titleHtml={page.headline}
            note={page.description ? <TrustedHtml as="span" html={page.description} /> : undefined}
          />
        </div>
      </PageHero>

      <section aria-labelledby="experience-title" className="shell">
        <ol data-timeline="" className="relative ps-8 md:ps-12" suppressHydrationWarning>
          <span className="timeline-track" aria-hidden="true">
            <span />
          </span>
          {list.items.map((job) => {
            const related = job.relatedProjectSlug
              ? projects.find((project) => project.slug === job.relatedProjectSlug)
              : undefined;
            const technologies = resolveTechnologyReferences(
              catalog,
              job.technologyKeys,
              job.technologies,
            );
            return (
              <li
                key={`${job.company}-${job.period}`}
                className="relative pb-16 last:pb-0"
                data-reveal=""
                suppressHydrationWarning
              >
                <span
                  aria-hidden="true"
                  className="absolute top-[1.3rem] -start-[calc(2rem+5.5px)] size-3 rounded-full border-2 border-background bg-brand md:-start-[calc(3rem+5.5px)]"
                />
                <article>
                  <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-3">
                    <div className="flex items-start gap-4">
                      {job.companyLogoUrl && (
                        <img
                          src={imageUrl(job.companyLogoUrl, 128)}
                          width={56}
                          height={56}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="size-14 shrink-0 rounded-full border border-border bg-white object-cover"
                        />
                      )}
                      <div className="min-w-0">
                        <h2 className="title-2">{job.role}</h2>
                        <p className="meta mt-2 flex flex-wrap gap-x-4">
                          <span className="text-foreground">{job.company}</span>
                          <span>{job.location}</span>
                        </p>
                      </div>
                    </div>
                    <p className="data shrink-0 pt-3 text-muted-foreground">{job.period}</p>
                  </div>

                  <TrustedHtml
                    as="p"
                    className="mt-7 body-copy text-muted-foreground"
                    html={job.description}
                  />

                  <div className="hairline mt-10 grid gap-10 pt-8 lg:grid-cols-12">
                    <div className="lg:col-span-7">
                      <h3 className="text-[0.9375rem] font-medium">
                        {list.labels.responsibilities}
                      </h3>
                      <ul className="mt-4 grid gap-3">
                        {job.responsibilities.map((item) => (
                          <li key={item} className="flex gap-3 text-foreground/90">
                            <CheckIcon className="mt-1.5 text-primary" />
                            <TrustedHtml as="span" html={item} />
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-col gap-9 lg:col-span-5">
                      {technologies.length > 0 && (
                        <div>
                          <h3 className="text-[0.9375rem] font-medium">
                            {list.labels.technologies}
                          </h3>
                          <TechList className="mt-4" items={technologies} />
                        </div>
                      )}
                      {job.skills && job.skills.length > 0 && (
                        <div>
                          <h3 className="text-[0.9375rem] font-medium">{list.labels.skills}</h3>
                          <p className="mt-4 text-muted-foreground">
                            {job.skills.join(locale === "ar" ? "، " : ", ")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {related && (
                    <p className="mt-10">
                      <ProjectLink slug={related.slug} className="btn btn-quiet" magnetic>
                        {list.labels.relatedProject.replace("{title}", related.title)}
                        <ArrowIcon />
                      </ProjectLink>
                    </p>
                  )}
                </article>
              </li>
            );
          })}
        </ol>
      </section>
    </>
  );
}
