import { createFileRoute, notFound } from "@tanstack/react-router";
import type { CSSProperties, ReactNode } from "react";
import { imageSrcSet, imageUrl } from "@/api/siteDataApi";
import { SplitWords } from "@/components/motion/SplitWords";
import { PageHero } from "@/components/site/PageHero";
import { Fact, ProjectDeployment, ProjectLogo } from "@/components/site/ProjectBoard";
import { TechList } from "@/components/site/TechList";
import { ArrowIcon, CheckIcon } from "@/components/ui/Icons";
import { ProjectLink } from "@/components/ui/LocalLink";
import { usePageData } from "@/hooks/use-site-data";
import { resolveTechnologyReferences, useTechnologyCatalog } from "@/hooks/use-technologies";
import { navLabel, projectsOf, requireSite } from "@/lib/content";
import { localeFromParam } from "@/lib/locale";
import {
  breadcrumbNode,
  buildHead,
  createPageSeo,
  pageUrl,
  projectNode,
  webPageNode,
} from "@/lib/seo";
import { getUiStrings } from "@/lib/ui-strings";
import { useUiStrings } from "@/hooks/use-ui-strings";
import { globalDataQuery, pageDataQuery, technologiesQuery } from "@/queries/siteDataQueries";
import type { BasicPageContent } from "@/types/siteData";

export const Route = createFileRoute("/{-$locale}/projects/$slug")({
  loader: async ({ context: { queryClient }, params }) => {
    const locale = localeFromParam(params.locale);
    const [page, global, catalog] = await Promise.all([
      queryClient.ensureQueryData(pageDataQuery<BasicPageContent>(locale, "projects")),
      queryClient.ensureQueryData(globalDataQuery(locale)),
      queryClient.ensureQueryData(technologiesQuery()),
    ]);
    const project = projectsOf(page).find((item) => item.slug === params.slug);
    if (!project) throw notFound();

    const site = requireSite(global);
    const t = getUiStrings(locale, global);
    const path = `/projects/${project.slug}`;
    const screenshot = project.screenshots?.[0];
    const seo = createPageSeo({
      site,
      locale,
      path,
      seo: project.seo,
      fallbackTitle: project.title,
      fallbackDescription: project.shortDescription,
      type: "article",
      image: screenshot ? { url: screenshot.url, alt: screenshot.alt ?? project.title } : undefined,
    });
    const technologies = resolveTechnologyReferences(
      catalog,
      project.technologyKeys,
      project.technologies,
    ).map((technology) => technology.name);

    return {
      locale,
      slug: project.slug,
      seo: {
        ...seo,
        jsonLd: [
          projectNode(site, project, seo.url, locale, technologies),
          webPageNode(site, seo, "WebPage", {
            mainEntity: { "@id": `${seo.url}#project` },
            breadcrumb: { "@id": `${seo.url}#breadcrumb` },
          }),
          breadcrumbNode(seo.url, [
            { name: t.home, url: pageUrl(site, "/", locale) },
            {
              name: navLabel(global, "/projects", t.projects),
              url: pageUrl(site, "/projects", locale),
            },
            { name: project.title, url: seo.url },
          ]),
        ],
      },
    };
  },
  head: ({ loaderData }) => buildHead(loaderData?.seo),
  component: ProjectPage,
});

function ProjectPage() {
  const { locale, slug } = Route.useLoaderData();
  const t = useUiStrings(locale);
  const { data: projectsPage } = usePageData<BasicPageContent>("projects", locale);
  const catalog = useTechnologyCatalog();
  const projects = projectsOf(projectsPage);
  const index = projects.findIndex((item) => item.slug === slug);
  const project = projects[index];
  if (!project) throw notFound();

  const next = projects.length > 1 ? projects[(index + 1) % projects.length] : undefined;
  const technologies = resolveTechnologyReferences(
    catalog,
    project.technologyKeys,
    project.technologies,
  );
  const screenshots = project.screenshots ?? [];

  return (
    <article>
      <PageHero>
        <header className="max-w-4xl">
          <div className="fade-up" style={{ "--d": 0 } as CSSProperties}>
            <ProjectLogo project={project} size="lg" priority />
          </div>
          <SplitWords as="h1" text={project.title} className="mt-8 title-1" startIndex={1} />
          <p className="fade-up mt-8 lead max-w-[62ch]" style={{ "--d": 4 } as CSSProperties}>
            {project.shortDescription}
          </p>
        </header>
      </PageHero>

      <div className="shell">
        <section
          aria-labelledby="glance-title"
          className="fade-up border-y border-border"
          style={{ "--d": 5 } as CSSProperties}
        >
          <h2 id="glance-title" className="sr-only">
            {t.atAGlance}
          </h2>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-6 py-8 lg:grid-cols-4">
            <Fact label={t.role}>{project.role}</Fact>
            {project.year && (
              <Fact label={t.year}>
                <span className="data text-[0.9375rem]">{project.year}</span>
              </Fact>
            )}
            <Fact label={t.category}>{project.category}</Fact>
            <Fact label={t.status}>
              <ProjectDeployment project={project} />
            </Fact>
          </dl>
          {technologies.length > 0 && (
            <dl className="border-t border-border py-8">
              <Fact label={t.stack}>
                <TechList className="mt-2" items={technologies} />
              </Fact>
            </dl>
          )}
        </section>

        {screenshots.length > 0 && (
          <section aria-label={t.screenshots} className="mt-12 grid gap-5 sm:grid-cols-2">
            {screenshots.map((shot, shotIndex) => (
              <figure
                key={shot.url}
                data-reveal=""
                suppressHydrationWarning
                className={`overflow-hidden rounded-[20px] border border-border bg-surface ${shotIndex === 0 ? "sm:col-span-2" : ""}`}
              >
                <img
                  src={imageUrl(shot.url, 1280)}
                  srcSet={imageSrcSet(shot.url, [640, 960, 1280, 1600])}
                  sizes="(min-width: 1320px) 1200px, 100vw"
                  alt={shot.alt ?? ""}
                  loading={shotIndex === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className="block h-auto w-full"
                />
                {shot.caption && (
                  <figcaption className="meta border-t border-border px-5 py-3">
                    {shot.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </section>
        )}

        <div className="mt-12 border-b border-border">
          <CaseSection id="overview" title={t.overview}>
            <p>{project.description}</p>
          </CaseSection>
          <CaseSection id="problem" title={t.problem}>
            <p>{project.problem}</p>
          </CaseSection>
          <CaseSection id="solution" title={t.solution}>
            <p>{project.solution}</p>
          </CaseSection>
          {project.contributions.length > 0 && (
            <CaseSection id="contribution" title={t.contribution}>
              <CheckList items={project.contributions} />
            </CaseSection>
          )}
          {project.engineeringDecisions.length > 0 && (
            <CaseSection id="decisions" title={t.decisions}>
              <CheckList items={project.engineeringDecisions} />
            </CaseSection>
          )}
          <CaseSection id="challenges" title={t.challenges}>
            <p>{project.challenges}</p>
          </CaseSection>
          <CaseSection id="outcome" title={t.outcome}>
            <p>{project.outcome}</p>
          </CaseSection>
        </div>
      </div>

      {next && (
        <nav aria-label={t.nextProject} className="shell mt-16">
          <div
            data-reveal=""
            suppressHydrationWarning
            className="ruled group relative flex items-end justify-between gap-8 border-b border-border py-10 md:py-12"
          >
            <div className="min-w-0">
              <p className="meta">{t.nextProject}</p>
              <ProjectLink
                slug={next.slug}
                className="mt-4 block title-1 transition-colors duration-300 outline-none group-hover:text-primary after:absolute after:inset-0 after:content-[''] focus-visible:underline"
              >
                {next.title}
              </ProjectLink>
            </div>
            <span className="arrow-disc size-16" aria-hidden="true">
              <ArrowIcon className="size-5" />
            </span>
          </div>
        </nav>
      )}
    </article>
  );
}

/** One part of the case study: heading pinned on the start side, text beside it. */
function CaseSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section
      aria-labelledby={`${id}-title`}
      data-reveal=""
      suppressHydrationWarning
      className="hairline grid gap-4 py-10 first:pt-0 first:before:hidden lg:grid-cols-12 lg:gap-10 lg:py-12"
    >
      <h2 id={`${id}-title`} className="title-3 lg:sticky lg:top-28 lg:col-span-4 lg:self-start">
        {title}
      </h2>
      <div className="body-copy text-muted-foreground lg:col-span-8">{children}</div>
    </section>
  );
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-3.5">
      {items.map((item) => (
        <li key={item} className="flex gap-3.5 text-foreground/90">
          <CheckIcon className="mt-1.5 text-primary" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
