import { createFileRoute } from "@tanstack/react-router";
import { pageDataQuery } from "@/queries/siteDataQueries";
import { DEFAULT_LANGUAGE, getSection } from "@/lib/siteData";
import { pageMeta } from "@/lib/seo";
import { ProjectCard } from "@/components/site/ProjectCard";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { TrustedHtml } from "@/components/ui/TrustedHtml";
import { useCurrentPageData } from "@/hooks/use-site-data";
import type { BasicPageContent, ProjectsListContent } from "@/types/siteData";

export const Route = createFileRoute("/projects/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      pageDataQuery<BasicPageContent>(DEFAULT_LANGUAGE, "projects"),
    ),
  head: ({ loaderData }) => {
    const seo = loaderData?.data.seoData;
    return pageMeta({
      title: seo?.title ?? "Projects",
      description: seo?.description ?? "",
      path: seo?.path ?? "/projects",
      type: seo?.ogType,
    });
  },
  component: ProjectsPage,
});

function ProjectsPage() {
  const { data: projectsPage } = useCurrentPageData<BasicPageContent>("projects");
  const page = projectsPage.data.content;
  const projects = getSection<ProjectsListContent>(projectsPage, "projects-list")?.content.items;

  if (!projects) throw new Error("Projects page content is missing projects-list.");

  return (
    <section className="shell py-14 md:py-24">
      <SectionLabel>{page.label}</SectionLabel>
      <TrustedHtml as="h1" className="mt-6 display-lg" html={page.headline} />
      {page.description && <TrustedHtml as="p" className="mt-7 lead" html={page.description} />}

      <div className="mt-12 flex flex-col gap-12 md:mt-20 md:gap-20">
        {projects.map((project, i) => (
          <div key={project.slug} className={i > 0 ? "border-t border-border pt-12 md:pt-20" : ""}>
            <ProjectCard project={project} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}
