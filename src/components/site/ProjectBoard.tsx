import { useQuery } from "@tanstack/react-query";
import type { CSSProperties, ReactNode } from "react";
import { imageSrcSet, imageUrl } from "@/api/siteDataApi";
import { ArrowIcon, ExternalIcon } from "@/components/ui/Icons";
import { ProjectLink } from "@/components/ui/LocalLink";
import { useLocale } from "@/hooks/use-locale";
import { resolveTechnologyReferences, useTechnologyCatalog } from "@/hooks/use-technologies";
import { projectStatusQuery, type ProjectStatus } from "@/lib/project-status";
import { techMarkProps } from "@/lib/tech-logo";
import type { Project, TechItem } from "@/types/siteData";

type Deployment =
  | { kind: "web"; url: string }
  | { kind: "store"; appStoreUrl?: string | undefined; playStoreUrl?: string | undefined }
  | { kind: "private" };

type StatusState = "pending" | "error" | "ready";

function deploymentOf(project: Project): Deployment {
  const url = project.projectUrl || project.liveUrl;
  if (url && /^https?:\/\//.test(url)) return { kind: "web", url };
  if (project.appStoreUrl || project.playStoreUrl || project.technologyKeys?.includes("flutter")) {
    return { kind: "store", appStoreUrl: project.appStoreUrl, playStoreUrl: project.playStoreUrl };
  }
  return { kind: "private" };
}

function hostOf(url: string) {
  return new URL(url).hostname.replace(/^www\./, "");
}

interface ProjectBoardProps {
  projects: Project[];
  headingLevel?: "h2" | "h3";
}

/** Projects as a ruled index: one full-width row per project, no nested cards. */
export function ProjectBoard({ projects, headingLevel = "h3" }: ProjectBoardProps) {
  const { t } = useLocale();
  const status = useQuery(projectStatusQuery());
  const bySlug = new Map((status.data ?? []).map((item) => [item.slug, item]));
  const statusState: StatusState = status.isPending
    ? "pending"
    : status.isError
      ? "error"
      : "ready";
  const lastChecked = status.data?.length
    ? Math.max(...status.data.map((item) => item.checkedAt))
    : undefined;

  return (
    <div>
      <ul className="border-b border-border">
        {projects.map((project) => (
          <li key={project.slug} data-reveal="stagger" suppressHydrationWarning>
            <ProjectRow
              project={project}
              headingLevel={headingLevel}
              status={bySlug.get(project.slug)}
              statusState={statusState}
            />
          </li>
        ))}
      </ul>
      <p
        className={`meta mt-5 min-h-6 ${status.isPending ? "status-checking" : ""}`}
        aria-live="polite"
      >
        {status.isPending
          ? `${t.statusChecking}…`
          : lastChecked
            ? t.checkedAgo(Math.max(0, Math.floor((Date.now() - lastChecked) / 60000)))
            : null}
      </p>
    </div>
  );
}

function ProjectRow({
  project,
  headingLevel,
  status,
  statusState,
}: {
  project: Project;
  headingLevel: "h2" | "h3";
  status: ProjectStatus | undefined;
  statusState: StatusState;
}) {
  const { t } = useLocale();
  const Heading = headingLevel;
  const catalog = useTechnologyCatalog();
  const technologies = resolveTechnologyReferences(
    catalog,
    project.technologyKeys,
    project.technologies,
  );
  const deployment = deploymentOf(project);
  const view = statusView(deployment, status, statusState, t, false);

  return (
    <article
      data-tilt-scope=""
      className="ruled group relative grid gap-8 py-10 md:grid-cols-12 md:gap-10 md:py-14"
    >
      <div data-stagger="mark" className="flex items-start md:col-span-3 md:justify-center">
        <span className="project-mark" data-tilt="">
          <ProjectLogo project={project} size="xl" />
        </span>
      </div>

      <div className="flex min-w-0 flex-col md:col-span-9">
        <div
          data-stagger=""
          style={{ "--s": 1 } as CSSProperties}
          className="flex items-start justify-between gap-6"
        >
          <Heading className="title-row transition-colors duration-300 group-hover:text-primary">
            <ProjectLink
              slug={project.slug}
              className="outline-none after:absolute after:inset-0 after:z-[1] after:content-[''] focus-visible:underline"
            >
              {project.title}
            </ProjectLink>
          </Heading>
          <span className="arrow-disc" aria-hidden="true">
            <ArrowIcon />
          </span>
        </div>
        <p
          data-stagger=""
          style={{ "--s": 2 } as CSSProperties}
          className="mt-3 line-clamp-3 max-w-[62ch] text-muted-foreground"
        >
          {project.shortDescription}
        </p>

        <dl
          data-stagger=""
          style={{ "--s": 3 } as CSSProperties}
          className="mt-auto grid grid-cols-2 gap-x-8 gap-y-5 pt-8 lg:grid-cols-[auto_minmax(0,1.4fr)_minmax(0,1.2fr)_minmax(0,1.4fr)]"
        >
          {project.year && (
            <Fact label={t.year}>
              <span className="data text-[0.9375rem]">{project.year}</span>
            </Fact>
          )}
          <Fact label={t.category}>{project.category}</Fact>
          <Fact label={t.status}>
            {view.label && <span className={view.tone}>{view.label}</span>}
            {deployment.kind === "web" && (
              <a
                href={deployment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="link relative z-[2] mt-0.5 flex w-fit items-center gap-1.5 text-sm text-muted-foreground"
              >
                <span dir="ltr">{hostOf(deployment.url)}</span>
                <ExternalIcon />
              </a>
            )}
          </Fact>
          {technologies.length > 0 && (
            <Fact label={t.stack}>
              <StackLogos technologies={technologies} />
            </Fact>
          )}
        </dl>
      </div>
    </article>
  );
}

/** A label and value in a spec strip. */
export function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="meta">{label}</dt>
      <dd className="mt-1.5 text-[0.9375rem]">{children}</dd>
    </div>
  );
}

/** Stack as a row of brand logos; each logo's alt text is the technology name. */
function StackLogos({ technologies }: { technologies: TechItem[] }) {
  const { t } = useLocale();
  const withLogo = technologies.filter((technology) => technology.imageUrl);
  const shown = withLogo.slice(0, 6);
  const hidden = technologies.length - shown.length;
  return (
    <ul className="flex flex-wrap items-center gap-2.5 pt-0.5">
      {shown.map((technology) => (
        <li key={technology.key ?? technology.name} title={technology.name}>
          <img
            {...techMarkProps(technology)}
            src={imageUrl(technology.imageUrl ?? "", 64)}
            alt={technology.name}
            width={22}
            height={22}
            loading="lazy"
            decoding="async"
            className="tech-logo size-[22px] object-contain"
          />
        </li>
      ))}
      {hidden > 0 && <li className="meta">{t.moreTechnologies(hidden)}</li>}
    </ul>
  );
}

/**
 * Plain-text deployment status; colour only marks a site as online or down.
 * When the check can't run, there is no label and only the site link shows.
 */
function statusView(
  deployment: Deployment,
  status: ProjectStatus | undefined,
  statusState: StatusState,
  t: ReturnType<typeof useLocale>["t"],
  detailed: boolean,
) {
  if (deployment.kind === "private") return { label: t.privateDeployment, tone: "" };
  if (deployment.kind === "store") return { label: t.appStores, tone: "" };
  if (statusState === "pending") return { label: t.statusChecking, tone: "status-checking" };
  if (statusState === "error" || !status) return { label: "", tone: "" };
  if (!status.up) return { label: t.statusDown, tone: "text-warn" };
  return {
    label: detailed && status.ms !== null ? t.statusLiveDetail(status.ms) : t.statusLive,
    tone: "text-live",
  };
}

/** Live status and links for one project, used in the case study sidebar. */
export function ProjectDeployment({ project }: { project: Project }) {
  const { t } = useLocale();
  const status = useQuery(projectStatusQuery());
  const deployment = deploymentOf(project);
  const statusState: StatusState = status.isPending
    ? "pending"
    : status.isError
      ? "error"
      : "ready";
  const view = statusView(
    deployment,
    status.data?.find((item) => item.slug === project.slug),
    statusState,
    t,
    true,
  );

  return (
    <div className="flex flex-col gap-2">
      {view.label && <p className={view.tone}>{view.label}</p>}
      {deployment.kind === "web" && (
        <a
          href={deployment.url}
          target="_blank"
          rel="noopener noreferrer"
          className="link inline-flex items-center gap-1.5 text-sm"
        >
          <span dir="ltr">{hostOf(deployment.url)}</span>
          <ExternalIcon />
        </a>
      )}
      {deployment.kind === "store" &&
        [
          deployment.appStoreUrl ? { href: deployment.appStoreUrl, label: t.appleAppStore } : null,
          deployment.playStoreUrl ? { href: deployment.playStoreUrl, label: t.googlePlay } : null,
        ]
          .filter((item): item is { href: string; label: string } => item !== null)
          .map((store) => (
            <a
              key={store.href}
              href={store.href}
              target="_blank"
              rel="noopener noreferrer"
              className="link inline-flex items-center gap-1.5 text-sm"
            >
              {store.label}
              <ExternalIcon />
            </a>
          ))}
    </div>
  );
}

export function ProjectLogo({
  project,
  size = "md",
  priority = false,
}: {
  project: Project;
  size?: "md" | "lg" | "xl";
  /** Load immediately (the case study header) instead of lazily. */
  priority?: boolean;
}) {
  const dimension =
    size === "xl"
      ? "size-28 md:size-36 lg:size-40"
      : size === "lg"
        ? "size-24 md:size-28"
        : "size-16";
  const pixels = size === "xl" ? 160 : size === "lg" ? 112 : 64;
  const initials = project.title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <div className="relative shrink-0">
      <div
        className={`${dimension} relative overflow-hidden rounded-full border border-border bg-white shadow-[var(--float-shadow)]`}
        style={{ viewTransitionName: `project-${project.slug}` } as CSSProperties}
      >
        {project.logoUrl ? (
          <img
            src={imageUrl(project.logoUrl, pixels > 64 ? 256 : 128)}
            srcSet={imageSrcSet(project.logoUrl, pixels > 64 ? [256, 384] : [128, 256])}
            sizes={`${pixels}px`}
            width={pixels}
            height={pixels}
            alt=""
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className={`flex h-full w-full items-center justify-center bg-surface font-display font-semibold ${pixels > 100 ? "text-3xl" : "text-lg"} text-foreground`}
          >
            {initials}
          </span>
        )}
      </div>
    </div>
  );
}
