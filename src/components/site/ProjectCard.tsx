import { Link } from "@tanstack/react-router";
import { getApiAssetUrl, resolveApiResourceUrl } from "@/api/siteDataApi";
import { useResolvedTechnologies } from "@/hooks/use-technologies";
import type { Project } from "@/types/siteData";

interface ProjectCardProps {
  project: Project;
  index: number;
  headingLevel?: "h2" | "h3";
}

export function ProjectCard({ project, index, headingLevel = "h2" }: ProjectCardProps) {
  const Heading = headingLevel;
  const reversed = index % 2 === 1;
  const number = String(index + 1).padStart(2, "0");
  const technologies = useResolvedTechnologies(project.technologyKeys, project.technologies);

  return (
    <article className="grid gap-6 lg:grid-cols-12 lg:items-center lg:gap-12">
      <figure
        className={`group order-1 hidden w-full lg:col-span-4 lg:block lg:max-w-56 ${
          reversed ? "lg:order-1 lg:justify-self-start" : "lg:order-2 lg:justify-self-end"
        }`}
      >
        <div className="transition-transform duration-[180ms] group-hover:-translate-y-1">
          <ProjectLogo project={project} />
        </div>
        {!project.logoUrl && (
          <figcaption className="mt-4 hidden label-mono lg:block">{project.title}</figcaption>
        )}
      </figure>

      <div className={`order-2 lg:col-span-8 ${reversed ? "lg:order-2" : "lg:order-1"}`}>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span aria-hidden="true" className="font-mono text-2xl text-primary">
            {number}
          </span>
          <p className="label-mono">
            {project.category} · {project.year}
          </p>
        </div>
        <div className="mt-4 flex items-center gap-4 sm:gap-5 lg:mt-4 lg:block">
          <div className="w-20 shrink-0 lg:hidden">
            <ProjectLogo project={project} />
          </div>
          <Heading className="min-w-0 flex-1 display-md">{project.title}</Heading>
        </div>
        <p className="mt-4 body-copy text-muted-foreground">{project.shortDescription}</p>

        <ul className="mt-6 flex flex-wrap gap-2">
          {technologies.map((technology) => (
            <li
              key={technology.id ?? technology.key ?? technology.name}
              className="flex min-h-8 items-center gap-2 rounded-[3px] border border-border px-2.5 py-1 mono-xs"
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

        <p className="mt-5 mono-xs text-muted-foreground">Role: {project.role}</p>

        <p className="mt-7">
          <Link
            to="/projects/$slug"
            params={{ slug: project.slug }}
            className="label-mono arrow-move text-foreground link-underline"
          >
            View case study <span className="arrow">-&gt;</span>
          </Link>
        </p>
      </div>
    </article>
  );
}

function ProjectLogo({ project }: { project: Project }) {
  const initials = project.title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  const logoUrl = project.logoUrl ? getApiAssetUrl(project.logoUrl) : null;

  return (
    <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-full border border-border bg-muted shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={`${project.title} logo`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex size-24 items-center justify-center rounded-full border border-border bg-background font-mono text-2xl font-semibold text-primary"
        >
          {initials}
        </span>
      )}
    </div>
  );
}
