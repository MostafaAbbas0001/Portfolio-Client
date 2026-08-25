import { createFileRoute, Link } from "@tanstack/react-router";
import { resolveApiResourceUrl } from "@/api/siteDataApi";
import { pageDataQuery } from "@/queries/siteDataQueries";
import { DEFAULT_LANGUAGE, getSection } from "@/lib/siteData";
import { pageMeta } from "@/lib/seo";
import { TrustedHtml } from "@/components/ui/TrustedHtml";
import { useLanguage } from "@/hooks/use-language";
import { useCurrentPageData } from "@/hooks/use-site-data";
import { resolveTechnologyReferences, useTechnologyCatalog } from "@/hooks/use-technologies";
import type {
  BasicPageContent,
  ExperienceListContent,
  ProjectsListContent,
} from "@/types/siteData";

export const Route = createFileRoute("/experience")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        pageDataQuery<BasicPageContent>(DEFAULT_LANGUAGE, "experience"),
      ),
      context.queryClient.ensureQueryData(
        pageDataQuery<BasicPageContent>(DEFAULT_LANGUAGE, "projects"),
      ),
    ]);
  },
  head: () =>
    pageMeta({
      title: "Experience",
      description: "Professional history",
      path: "/experience",
    }),
  component: ExperiencePage,
});

function ExperiencePage() {
  const { direction } = useLanguage();
  const { data: experiencePage } = useCurrentPageData<BasicPageContent>("experience");
  const { data: projectsPage } = useCurrentPageData<BasicPageContent>("projects");
  const page = experiencePage.data.content;
  const experienceContent = getSection<ExperienceListContent>(
    experiencePage,
    "experience-list",
  )?.content;
  const projects =
    getSection<ProjectsListContent>(projectsPage, "projects-list")?.content.items ?? [];
  const technologyCatalog = useTechnologyCatalog();

  if (!experienceContent) throw new Error("Experience page content is missing experience-list.");

  const isRtl = direction === "rtl";

  return (
    <section className="shell py-12 md:py-20">
      <p className="label-mono">{page.label}</p>
      <TrustedHtml as="h1" className="mt-5 display-lg" html={page.headline} />
      {page.description && <TrustedHtml as="p" className="mt-6 lead" html={page.description} />}

      <ol
        className={`mt-14 flex flex-col border-border ${
          isRtl ? "border-r pr-6 md:pr-10" : "border-l pl-6 md:pl-10"
        }`}
      >
        {experienceContent.items.map((job) => {
          const related = job.relatedProjectSlug
            ? projects.find((project) => project.slug === job.relatedProjectSlug)
            : undefined;
          return (
            <li key={`${job.company}-${job.period}`} className="relative pb-14 last:pb-0">
              <span
                aria-hidden="true"
                className={`absolute top-2 size-2 rounded-full bg-primary ${
                  isRtl ? "-right-[1.9rem] md:-right-[2.9rem]" : "-left-[1.9rem] md:-left-[2.9rem]"
                }`}
              />
              <p className="label-mono">{job.period}</p>
              <div className="mt-3 flex items-start gap-4">
                {job.companyLogoUrl && (
                  <img
                    src={resolveApiResourceUrl(job.companyLogoUrl)}
                    width={72}
                    height={72}
                    alt={`${job.company} logo`}
                    loading="lazy"
                    className="mt-1 size-18 shrink-0 rounded-full border border-border bg-background object-cover shadow-sm"
                  />
                )}
                <div className="min-w-0">
                  <h2 className="display-md">{job.role}</h2>
                  <p className="mt-2 text-base font-medium">
                    {job.company} / <span className="text-muted-foreground">{job.location}</span>
                  </p>
                </div>
              </div>
              <TrustedHtml
                as="p"
                className="mt-4 body-copy text-muted-foreground"
                html={job.description}
              />

              <h3 className="mt-6 label-mono">{experienceContent.labels.responsibilities}</h3>
              <ul className="mt-3 flex flex-col gap-2">
                {job.responsibilities.map((responsibility) => (
                  <TrustedHtml
                    key={responsibility}
                    as="li"
                    className="body-copy text-muted-foreground"
                    html={`- ${responsibility}`}
                  />
                ))}
              </ul>

              <h3 className="mt-6 label-mono">{experienceContent.labels.technologies}</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {resolveTechnologyReferences(
                  technologyCatalog,
                  job.technologyKeys,
                  job.technologies,
                ).map((technology) => (
                  <li
                    key={technology.id ?? technology.key ?? technology.name}
                    className="flex min-h-8 items-center gap-2 border border-border px-2.5 py-1 font-mono text-xs"
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
                  </li>
                ))}
              </ul>

              {job.skills && job.skills.length > 0 && (
                <>
                  <h3 className="mt-6 label-mono">
                    {experienceContent.labels.skills ?? "Professional skills"}
                  </h3>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <li
                        key={skill}
                        className="border border-border px-2.5 py-1 font-mono text-xs text-muted-foreground"
                      >
                        {skill}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {related && (
                <p className="mt-6">
                  <Link
                    to="/projects/$slug"
                    params={{ slug: related.slug }}
                    className="label-mono link-underline"
                  >
                    {experienceContent.labels.relatedProject.replace("{title}", related.title)}{" "}
                    {isRtl ? "<-" : "-&gt;"}
                  </Link>
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
