import { createFileRoute, Link } from "@tanstack/react-router";
import { resolveApiResourceUrl } from "@/api/siteDataApi";
import { pageDataQuery } from "@/queries/siteDataQueries";
import { DEFAULT_LANGUAGE, getSection } from "@/lib/siteData";
import { pageMeta, personSchema, websiteSchema } from "@/lib/seo";
import { TechStrip } from "@/components/site/TechStrip";
import { ProjectCard } from "@/components/site/ProjectCard";
import { HeroPortrait } from "@/components/site/HeroPortrait";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { TrustedHtml } from "@/components/ui/TrustedHtml";
import { useCurrentPageData } from "@/hooks/use-site-data";
import type {
  BasicPageContent,
  ExperienceListContent,
  ExperiencePreviewContent,
  FeaturedWorkContent,
  HomePageContent,
  ProjectsListContent,
  TechStripContent,
} from "@/types/siteData";

type KnownRoute = "/" | "/about" | "/projects" | "/experience" | "/contact";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(pageDataQuery<HomePageContent>(DEFAULT_LANGUAGE, "home")),
      context.queryClient.ensureQueryData(
        pageDataQuery<BasicPageContent>(DEFAULT_LANGUAGE, "projects"),
      ),
      context.queryClient.ensureQueryData(
        pageDataQuery<BasicPageContent>(DEFAULT_LANGUAGE, "experience"),
      ),
    ]);
  },
  head: () => {
    return {
      ...pageMeta({
        title: "Mostafa Abbas - Full-Stack Developer & Software Engineer",
        description:
          "Mostafa Abbas is a Full-Stack Developer and Software Engineer building maintainable web applications, business systems and reliable software solutions.",
        path: "/",
      }),
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(personSchema) },
        { type: "application/ld+json", children: JSON.stringify(websiteSchema) },
      ],
    };
  },
  component: HomePage,
});

function HomePage() {
  const { data: homePage } = useCurrentPageData<HomePageContent>("home");
  const { data: projectsPage } = useCurrentPageData<BasicPageContent>("projects");
  const { data: experiencePage } = useCurrentPageData<BasicPageContent>("experience");

  const home = homePage.data.content;
  const techStrip = getSection<TechStripContent>(homePage, "tech-strip")?.content;
  const featuredWork = getSection<FeaturedWorkContent>(homePage, "featured-work")?.content;
  const experiencePreview = getSection<ExperiencePreviewContent>(
    homePage,
    "experience-preview",
  )?.content;
  const projects =
    getSection<ProjectsListContent>(projectsPage, "projects-list")?.content.items ?? [];
  const experience =
    getSection<ExperienceListContent>(experiencePage, "experience-list")?.content.items ?? [];
  const heroCircuitMessages =
    home.heroCircuitMessages ?? (home.heroCircuitMessage ? [home.heroCircuitMessage] : []);
  const featuredProjects = featuredWork
    ? featuredWork.projectSlugs
        .map((slug) => projects.find((project) => project.slug === slug))
        .filter((project): project is NonNullable<typeof project> => Boolean(project))
    : projects.filter((project) => project.featured);
  const experienceItems = experience.slice(0, experiencePreview?.count ?? 2);

  if (!techStrip || !featuredWork || !experiencePreview) {
    throw new Error("Home page content is missing required sections.");
  }

  return (
    <>
      <section className="tech-grid" aria-labelledby="hero-heading">
        <div className="shell grid items-start gap-12 pt-10 pb-16 md:pt-20 md:pb-24 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.92fr)] lg:gap-14 xl:gap-20">
          <div className="rise min-w-0 lg:max-w-[720px]">
            <div>
              <SectionLabel>{home.label}</SectionLabel>
              <TrustedHtml
                as="h1"
                id="hero-heading"
                className="mt-7 display-xl"
                html={home.headline}
              />
              <div className="relative mx-auto mt-8 w-full max-w-[600px] min-w-0 md:mt-10 lg:hidden">
                <HeroPortrait
                  imageUrl={home.heroImageUrl}
                  imageAlt={home.heroImageAlt}
                  messages={heroCircuitMessages}
                />
              </div>
            </div>
            <TrustedHtml as="p" className="mt-8 lead" html={home.description} />
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to={home.primaryCta.href as KnownRoute}
                className="arrow-move inline-flex min-h-11 items-center justify-center rounded-[4px] bg-foreground px-6 text-sm text-background transition-colors duration-[180ms] hover:bg-primary"
              >
                {home.primaryCta.label} <span className="arrow ml-2">-&gt;</span>
              </Link>
              <Link
                to={home.secondaryCta.href as KnownRoute}
                className="arrow-move inline-flex min-h-11 items-center justify-center rounded-[4px] border border-foreground px-6 text-sm transition-colors duration-[180ms] hover:bg-secondary"
              >
                {home.secondaryCta.label} <span className="arrow ml-2">-&gt;</span>
              </Link>
            </div>
          </div>

          <div className="rise relative hidden w-full max-w-[640px] min-w-0 justify-self-end overflow-hidden lg:block lg:overflow-visible">
            <HeroPortrait
              imageUrl={home.heroImageUrl}
              imageAlt={home.heroImageAlt}
              messages={heroCircuitMessages}
            />
          </div>
        </div>

        <div className="shell">
          <TechStrip techStrip={techStrip} />
        </div>
      </section>

      <section className="shell py-16 md:py-28" aria-labelledby="work-heading">
        <div className="grid gap-6 border-b border-border pb-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <SectionLabel>{featuredWork.label}</SectionLabel>
            <TrustedHtml
              as="h2"
              id="work-heading"
              className="mt-5 display-lg"
              html={featuredWork.headline}
            />
          </div>
          <Link
            to="/projects"
            className="label-mono arrow-move text-foreground lg:justify-self-end"
          >
            {featuredWork.linkLabel} <span className="arrow">-&gt;</span>
          </Link>
        </div>

        <div className="mt-12 flex flex-col gap-12 md:gap-20">
          {featuredProjects.map((project, i) => (
            <div
              key={project.slug}
              className={i > 0 ? "border-t border-border pt-12 md:pt-20" : ""}
            >
              <ProjectCard project={project} index={i} headingLevel="h3" />
            </div>
          ))}
        </div>
      </section>

      <section className="shell pb-20 md:pb-28" aria-labelledby="experience-heading">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
          <TrustedHtml
            as="h2"
            id="experience-heading"
            className="display-md"
            html={experiencePreview.headline}
          />
          <Link to="/experience" className="label-mono arrow-move text-foreground">
            {experiencePreview.linkLabel} <span className="arrow">-&gt;</span>
          </Link>
        </div>
        <ul className="flex flex-col">
          {experienceItems.map((job) => (
            <li
              key={`${job.company}-${job.period}`}
              className="grid gap-2 border-b border-border py-7 md:grid-cols-12 md:gap-8"
            >
              <p className="label-mono md:col-span-3">{job.period}</p>
              <div className="flex items-start gap-4 md:col-span-9">
                {job.companyLogoUrl && (
                  <img
                    src={resolveApiResourceUrl(job.companyLogoUrl)}
                    width={56}
                    height={56}
                    alt={`${job.company} logo`}
                    loading="lazy"
                    className="size-14 shrink-0 rounded-full border border-border bg-background object-cover shadow-sm"
                  />
                )}
                <div className="min-w-0">
                  <h3 className="text-xl tracking-tight">
                    {job.role} - {job.company}
                  </h3>
                <TrustedHtml
                  as="p"
                  className="mt-2 body-copy text-muted-foreground"
                  html={job.description}
                />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
