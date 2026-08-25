import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getApiAssetUrl, resolveApiResourceUrl } from "@/api/siteDataApi";
import { pageDataQuery, technologiesQuery } from "@/queries/siteDataQueries";
import { DEFAULT_LANGUAGE, getSection } from "@/lib/siteData";
import { canonical, pageMeta, SITE_NAME } from "@/lib/seo";
import { useCurrentPageData } from "@/hooks/use-site-data";
import { resolveTechnologyReferences, useResolvedTechnologies } from "@/hooks/use-technologies";
import type { BasicPageContent, Project, ProjectsListContent } from "@/types/siteData";

export const Route = createFileRoute("/projects/$slug")({
  loader: async ({ context, params }) => {
    const projectsPage = await context.queryClient.ensureQueryData(
      pageDataQuery<BasicPageContent>(DEFAULT_LANGUAGE, "projects"),
    );
    const projects =
      getSection<ProjectsListContent>(projectsPage, "projects-list")?.content.items ?? [];
    const project = projects.find((item) => item.slug === params.slug);
    const technologyCatalog = await context.queryClient.ensureQueryData(technologiesQuery());

    if (!project) throw notFound();

    return { project, projects, technologyCatalog };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return { meta: [{ title: "Project unavailable" }, { name: "robots", content: "noindex" }] };
    }

    const { project, technologyCatalog } = loaderData;
    const title = `${project.title} - Mostafa Abbas`;

    return {
      ...pageMeta({
        title,
        description: project.shortDescription,
        path: `/projects/${params.slug}`,
        type: "article",
      }),
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            name: project.title,
            description: project.shortDescription,
            url: canonical(`/projects/${params.slug}`),
            dateCreated: project.year,
            keywords: resolveTechnologyReferences(
              technologyCatalog,
              project.technologyKeys,
              project.technologies,
            )
              .map((technology) => technology.name)
              .join(", "),
            author: { "@type": "Person", name: SITE_NAME },
          }),
        },
      ],
    };
  },
  component: ProjectPage,
});

function ProjectPage() {
  const { project: fallbackProject } = Route.useLoaderData();
  const { slug } = Route.useParams();
  const { data: projectsPage } = useCurrentPageData<BasicPageContent>("projects");
  const projects =
    getSection<ProjectsListContent>(projectsPage, "projects-list")?.content.items ?? [];
  const project = projects.find((item) => item.slug === slug) ?? fallbackProject;
  const index = projects.findIndex((item: Project) => item.slug === project.slug);
  const next = projects[(index + 1) % projects.length] ?? projects[0] ?? project;
  const projectImageUrl = project.logoUrl ? getApiAssetUrl(project.logoUrl) : null;
  const projectUrl = project.projectUrl || project.liveUrl;
  const technologies = useResolvedTechnologies(project.technologyKeys, project.technologies);

  return (
    <article className="shell py-12 md:py-20">
      <p className="label-mono">
        <Link to="/projects" className="link-underline">
          Projects
        </Link>{" "}
        / {project.category}
      </p>
      <div className="mt-5 flex items-center gap-5 md:gap-7">
        {projectImageUrl &&
          (projectUrl ? (
            <a
              href={projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${project.title}`}
              className="group relative block size-24 shrink-0 overflow-hidden rounded-full border border-border bg-muted shadow-[0_14px_35px_rgba(15,23,42,0.08)] transition-transform duration-[180ms] hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary md:size-32"
            >
              <img
                src={projectImageUrl}
                alt={`${project.title} logo`}
                decoding="async"
                className="h-full w-full object-cover"
              />
            </a>
          ) : (
            <div className="size-24 shrink-0 overflow-hidden rounded-full border border-border bg-muted shadow-[0_14px_35px_rgba(15,23,42,0.08)] md:size-32">
              <img
                src={projectImageUrl}
                alt={`${project.title} logo`}
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        <div className="min-w-0">
          <h1 className="text-3xl font-medium leading-tight tracking-normal md:text-5xl">
            {project.title}
          </h1>
          {projectUrl && (
            <a
              href={projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block label-mono link-underline"
            >
              Visit project <span aria-hidden="true">-&gt;</span>
            </a>
          )}
        </div>
      </div>
      <p className="mt-6 lead">{project.description}</p>

      <dl className="mt-10 grid grid-cols-2 gap-6 border-y border-border py-6 md:grid-cols-4">
        <div>
          <dt className="label-mono">Year</dt>
          <dd className="mt-2 text-sm">{project.year}</dd>
        </div>
        <div>
          <dt className="label-mono">Role</dt>
          <dd className="mt-2 text-sm">{project.role}</dd>
        </div>
        <div>
          <dt className="label-mono">Category</dt>
          <dd className="mt-2 text-sm">{project.category}</dd>
        </div>
        <div>
          <dt className="label-mono">Stack</dt>
          <dd className="mt-3 flex flex-wrap gap-2">
            {technologies.map((technology) => (
              <span
                key={technology.id ?? technology.key ?? technology.name}
                className="inline-flex min-h-8 items-center gap-2 border border-border px-2.5 py-1 text-xs"
              >
                {technology.imageUrl && (
                  <img
                    src={resolveApiResourceUrl(technology.imageUrl)}
                    width={18}
                    height={18}
                    alt=""
                    loading="lazy"
                    className="size-4 shrink-0 object-contain"
                  />
                )}
                {technology.name}
              </span>
            ))}
          </dd>
        </div>
      </dl>

      <div className="mt-14 grid gap-12 lg:grid-cols-12">
        <div className="flex flex-col gap-10 lg:col-span-7">
          <section aria-labelledby="problem-heading">
            <h2 id="problem-heading" className="display-md">
              The problem
            </h2>
            <p className="mt-4 body-copy text-muted-foreground">{project.problem}</p>
          </section>
          <section aria-labelledby="solution-heading">
            <h2 id="solution-heading" className="display-md">
              The solution
            </h2>
            <p className="mt-4 body-copy text-muted-foreground">{project.solution}</p>
          </section>
          <section aria-labelledby="challenges-heading">
            <h2 id="challenges-heading" className="display-md">
              Challenges
            </h2>
            <p className="mt-4 body-copy text-muted-foreground">{project.challenges}</p>
          </section>
          <section aria-labelledby="outcome-heading">
            <h2 id="outcome-heading" className="display-md">
              Outcome
            </h2>
            <p className="mt-4 body-copy text-muted-foreground">{project.outcome}</p>
          </section>
        </div>

        <aside className="flex flex-col gap-10 lg:col-span-5">
          <section aria-labelledby="contrib-heading">
            <h2 id="contrib-heading" className="label-mono">
              My contribution
            </h2>
            <ul className="mt-4 flex flex-col gap-3">
              {project.contributions.map((contribution) => (
                <li
                  key={contribution}
                  className="border-t border-border pt-3 text-sm leading-relaxed"
                >
                  {contribution}
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="decisions-heading">
            <h2 id="decisions-heading" className="label-mono">
              Engineering decisions
            </h2>
            <ul className="mt-4 flex flex-col gap-3">
              {project.engineeringDecisions.map((decision) => (
                <li key={decision} className="border-t border-border pt-3 text-sm leading-relaxed">
                  {decision}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      <nav aria-label="Project navigation" className="mt-16 border-t border-border pt-6">
        <p className="label-mono">Next project</p>
        <p className="mt-3">
          <Link
            to="/projects/$slug"
            params={{ slug: next.slug }}
            className="display-md link-underline"
          >
            {next.title} -&gt;
          </Link>
        </p>
      </nav>
    </article>
  );
}
