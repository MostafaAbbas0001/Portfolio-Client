import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { imageUrl } from "@/api/siteDataApi";
import { SplitHtml } from "@/components/motion/SplitWords";
import { HeroOrbit } from "@/components/site/HeroOrbit";
import { ProjectBoard } from "@/components/site/ProjectBoard";
import { SectionIntro } from "@/components/site/SectionIntro";
import { TechMarquee } from "@/components/site/TechMarquee";
import { ArrowIcon } from "@/components/ui/Icons";
import { CmsLink, PageLink } from "@/components/ui/LocalLink";
import { TrustedHtml } from "@/components/ui/TrustedHtml";
import { useGlobalData, usePageData } from "@/hooks/use-site-data";
import { resolveTechnologyReferences, useTechnologyCatalog } from "@/hooks/use-technologies";
import { currentRole, experienceOf, projectsOf, requireSite } from "@/lib/content";
import { localeFromParam } from "@/lib/locale";
import { getProfessionalExperienceDisplay } from "@/lib/professional-experience";
import { experienceLabel } from "@/lib/professional-experience-label";
import {
  buildHead,
  createPageSeo,
  personId,
  personNode,
  stripHtml,
  webPageNode,
  websiteNode,
} from "@/lib/seo";
import { getGlobalContent, getSection } from "@/lib/siteData";
import { countWords } from "@/lib/split-words";
import { useUiStrings } from "@/hooks/use-ui-strings";
import {
  globalDataQuery,
  pageDataQuery,
  professionalExperienceQuery,
  technologiesQuery,
} from "@/queries/siteDataQueries";
import type {
  BasicPageContent,
  ExperiencePreviewContent,
  FeaturedWorkContent,
  FooterGlobalContent,
  HomePageContent,
  Project,
  TechItem,
  TechStripContent,
} from "@/types/siteData";

export const Route = createFileRoute("/{-$locale}/")({
  loader: async ({ context: { queryClient }, params }) => {
    const locale = localeFromParam(params.locale);
    const [home, projectsPage, experiencePage, global, catalog] = await Promise.all([
      queryClient.ensureQueryData(pageDataQuery<HomePageContent>(locale, "home")),
      queryClient.ensureQueryData(pageDataQuery<BasicPageContent>(locale, "projects")),
      queryClient.ensureQueryData(pageDataQuery<BasicPageContent>(locale, "experience")),
      queryClient.ensureQueryData(globalDataQuery(locale)),
      queryClient.ensureQueryData(technologiesQuery()),
      // Rendered on the server so the years of experience are in the HTML.
      queryClient.prefetchQuery(professionalExperienceQuery()),
    ]);

    const site = requireSite(global);
    const content = home.data.content;
    const techStrip = getSection<TechStripContent>(home, "tech-strip")?.content;
    const role = currentRole(experienceOf(experiencePage));
    const seo = createPageSeo({
      site,
      locale,
      path: "/",
      seo: home.data.seoData,
      fallbackTitle: stripHtml(content.label),
      fallbackDescription: content.description,
    });

    return {
      locale,
      projectCount: projectsOf(projectsPage).length,
      seo: {
        ...seo,
        jsonLd: [
          websiteNode(site, locale),
          personNode(site, locale, {
            portrait: content.heroImageUrl,
            knowsAbout: resolveTechnologyReferences(
              catalog,
              techStrip?.technologyKeys,
              techStrip?.technologies ?? techStrip?.items,
            ).map((technology) => technology.name),
            worksFor: role?.company,
            workLocation: role?.location,
          }),
          webPageNode(site, seo, "ProfilePage", {
            mainEntity: { "@id": personId(site) },
            about: { "@id": personId(site) },
          }),
        ],
      },
    };
  },
  head: ({ loaderData }) => buildHead(loaderData?.seo),
  component: HomePage,
});

/** Technologies actually used in shipped projects, most used first. */
function shippedStack(catalog: TechItem[], projects: Project[], featured: TechItem[]) {
  const counts = new Map<string, number>();
  for (const project of projects) {
    for (const key of project.technologyKeys ?? []) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const byKey = new Map(catalog.map((technology) => [technology.key, technology]));
  const ranked = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .flatMap(([key]) => (byKey.has(key) ? [byKey.get(key) as TechItem] : []));
  const seen = new Set<string>();
  return [...featured, ...ranked].filter((technology) => {
    const id = technology.key ?? technology.name;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function HomePage() {
  const { locale, projectCount } = Route.useLoaderData();
  const t = useUiStrings(locale);
  const { data: homePage } = usePageData<HomePageContent>("home", locale);
  const { data: projectsPage } = usePageData<BasicPageContent>("projects", locale);
  const { data: experiencePage } = usePageData<BasicPageContent>("experience", locale);
  const { data: global } = useGlobalData(locale);
  const catalog = useTechnologyCatalog();
  const professional = useQuery(professionalExperienceQuery());

  const home = homePage.data.content;
  const site = requireSite(global);
  const footer = getGlobalContent<FooterGlobalContent>(global, "footer");
  const featuredWork = getSection<FeaturedWorkContent>(homePage, "featured-work")?.content;
  const experiencePreview = getSection<ExperiencePreviewContent>(
    homePage,
    "experience-preview",
  )?.content;
  const techStrip = getSection<TechStripContent>(homePage, "tech-strip")?.content;
  if (!featuredWork || !experiencePreview || !techStrip) {
    throw new Error("Home page content is missing required sections.");
  }

  const projects = projectsOf(projectsPage);
  const featured = featuredWork.projectSlugs.length
    ? featuredWork.projectSlugs.flatMap((slug) => projects.filter((item) => item.slug === slug))
    : projects.filter((project) => project.featured);
  const jobs = experienceOf(experiencePage).slice(0, experiencePreview.count || 2);
  const stripTech = resolveTechnologyReferences(
    catalog,
    techStrip.technologyKeys,
    techStrip.technologies ?? techStrip.items,
  );
  const stack = shippedStack(catalog, projects, stripTech);
  // Technologies used in a project count as shipped.
  const projectKeys = new Set(projects.flatMap((project) => project.technologyKeys ?? []));
  const shippedCount = stack.filter(
    (technology) => technology.key && projectKeys.has(technology.key),
  ).length;

  let years: { value: number; prefix: string; suffix: string; label: string } | null = null;
  if (professional.data) {
    try {
      const display = getProfessionalExperienceDisplay(professional.data.startDate);
      years = {
        value: display.years,
        prefix: display.qualifier === "approaching" ? "~" : "",
        suffix: display.qualifier === "over" ? "+" : "",
        label: experienceLabel(display, locale, global),
      };
    } catch {
      years = null;
    }
  }

  const nameWords = countWords(site.siteName);

  return (
    <>
      <section
        aria-labelledby="hero-title"
        className="relative isolate overflow-hidden"
        data-cursor-glow=""
      >
        <div className="stage-light" aria-hidden="true" />
        <div className="blueprint" aria-hidden="true" />
        <div className="cursor-glow" aria-hidden="true" />

        {/* The portrait centres on the headline block; the stats get their own row
            below, so the photo lines up with what is on screen. */}
        <div className="shell grid min-h-[100svh] content-center items-center gap-x-6 gap-y-12 pt-28 pb-24 lg:grid-cols-12 lg:pt-24">
          <div className="hero-copy relative z-10 lg:col-span-7">
            {footer?.availability && (
              <p className="kicker fade-up" style={{ "--d": 0 } as CSSProperties}>
                {footer.availability}
              </p>
            )}
            <h1 id="hero-title" className="mt-5">
              <span
                className="fade-up block font-display text-xl font-medium tracking-tight md:text-2xl"
                style={{ "--d": 1 } as CSSProperties}
              >
                {site.siteName}
                <span className="text-muted-foreground">, {stripHtml(home.label)}</span>
              </span>
              <SplitHtml
                as="span"
                className="mt-5 block display"
                html={home.headline}
                startIndex={nameWords}
              />
            </h1>
            <TrustedHtml
              as="p"
              className="fade-up mt-8 lead"
              style={{ "--d": 5 } as CSSProperties}
              html={home.description}
            />
            <div
              className="fade-up mt-10 flex flex-wrap gap-3"
              style={{ "--d": 6 } as CSSProperties}
            >
              <CmsLink href={home.primaryCta.href} className="btn btn-primary" magnetic>
                {home.primaryCta.label}
                <ArrowIcon />
              </CmsLink>
              <CmsLink href={home.secondaryCta.href} className="btn btn-quiet" magnetic>
                {home.secondaryCta.label}
              </CmsLink>
            </div>
          </div>

          <div className="hero-visual relative lg:col-span-5">
            <HeroOrbit
              portrait={home.heroImageUrl}
              alt={home.heroImageAlt}
              technologies={stripTech}
            />
          </div>

          <div className="hero-copy lg:col-span-7">
            <dl
              className="fade-up grid max-w-xl grid-cols-3 gap-6 border-t border-border pt-7"
              style={{ "--d": 7 } as CSSProperties}
            >
              {years && (
                <Stat
                  value={years.value}
                  prefix={years.prefix}
                  suffix={years.suffix}
                  label={t.yearsOfExperience}
                  spoken={years.label}
                />
              )}
              <Stat value={projectCount} label={t.productionSystems} />
              <Stat value={shippedCount} label={t.technologiesShipped} />
            </dl>
          </div>
        </div>

        <div
          className="pointer-events-none absolute inset-x-0 bottom-6 hidden justify-center md:flex"
          aria-hidden="true"
        >
          <span className="meta flex flex-col items-center gap-3 text-xs">
            {t.scroll}
            <span className="scroll-cue" />
          </span>
        </div>
      </section>

      <TechMarquee items={stack} label={techStrip.label} />

      <section aria-labelledby="work-title" className="shell py-12 md:py-16">
        <SectionIntro
          id="work-title"
          kicker={t.inProduction}
          titleHtml={featuredWork.headline}
          note={t.inProductionNote}
          action={
            <PageLink to="/projects" className="btn btn-quiet" magnetic>
              {featuredWork.linkLabel}
              <ArrowIcon />
            </PageLink>
          }
        />
        <div className="mt-10">
          <ProjectBoard projects={featured} />
        </div>
      </section>

      <section aria-labelledby="experience-title" className="shell py-12 md:py-16">
        <SectionIntro
          id="experience-title"
          kicker={t.career}
          titleHtml={experiencePreview.headline}
          action={
            <PageLink to="/experience" className="btn btn-quiet" magnetic>
              {experiencePreview.linkLabel}
              <ArrowIcon />
            </PageLink>
          }
        />
        <ol data-timeline="" className="relative mt-10 ps-8 md:ps-12" suppressHydrationWarning>
          <span className="timeline-track" aria-hidden="true">
            <span />
          </span>
          {jobs.map((job, index) => (
            <li
              key={`${job.company}-${job.period}`}
              className="relative pb-14 last:pb-0"
              data-reveal=""
              suppressHydrationWarning
              style={{ "--d": index } as CSSProperties}
            >
              <span
                aria-hidden="true"
                className="absolute top-[0.45rem] -start-[calc(2rem+5.5px)] size-3 rounded-full border-2 border-background bg-brand md:-start-[calc(3rem+5.5px)]"
              />
              <article className="grid gap-4 md:grid-cols-[12rem_minmax(0,1fr)] md:gap-10">
                <p className="data pt-0.5 text-muted-foreground">{job.period}</p>
                <div className="flex items-start gap-4">
                  {job.companyLogoUrl && (
                    <img
                      src={imageUrl(job.companyLogoUrl, 128)}
                      width={48}
                      height={48}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="size-12 shrink-0 rounded-full border border-border bg-white object-cover"
                    />
                  )}
                  <div className="min-w-0">
                    <h3 className="title-3">{job.role}</h3>
                    <p className="meta mt-1 flex flex-wrap gap-x-4">
                      <span className="text-foreground">{job.company}</span>
                      <span>{job.location}</span>
                    </p>
                    <TrustedHtml
                      as="p"
                      className="mt-3 line-clamp-3 max-w-[68ch] text-muted-foreground"
                      html={job.description}
                    />
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}

function Stat({
  value,
  label,
  prefix = "",
  suffix = "",
  spoken,
}: {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  spoken?: string;
}) {
  return (
    <div className="flex flex-col-reverse gap-1">
      <dt className="meta">{label}</dt>
      <dd className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
        <span className="sr-only">{spoken ?? `${prefix}${value}${suffix}`}</span>
        <span aria-hidden="true" className="flex items-baseline rtl:justify-end" dir="ltr">
          {prefix && <span className="text-primary">{prefix}</span>}
          <span className="count" style={{ "--to": value } as CSSProperties} />
          {suffix && <span className="text-primary">{suffix}</span>}
        </span>
      </dd>
    </div>
  );
}
