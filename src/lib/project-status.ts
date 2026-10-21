import { createServerFn } from "@tanstack/react-start";
import { getPageData } from "@/api/siteDataApi";
import { DEFAULT_LANGUAGE, getSection } from "@/lib/siteData";
import type { BasicPageContent, ProjectsListContent } from "@/types/siteData";

export interface ProjectStatus {
  slug: string;
  url: string;
  up: boolean;
  ms: number | null;
  checkedAt: number;
}

const CACHE_MS = 5 * 60 * 1000;
const TIMEOUT_MS = 5000;
const cache = new Map<string, ProjectStatus>();
// The last project list read from the CMS, so a moment when the API is down
// or restarting doesn't stop the checks.
let knownTargets: { slug: string; url: string }[] | null = null;

// GET rather than HEAD: some production servers answer HEAD with a 500 even
// when the site is up (triplehbroker.com does). The body is cancelled unread.
async function probe(url: string) {
  const started = performance.now();
  const response = await fetch(url, {
    method: "GET",
    redirect: "follow",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { "user-agent": "mostafaabbas.dev uptime check" },
  });
  // Only the response headers matter; don't download the page.
  await response.body?.cancel();
  return { status: response.status, ms: Math.round(performance.now() - started) };
}

async function check(slug: string, url: string): Promise<ProjectStatus> {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.checkedAt < CACHE_MS) return { ...cached, slug };

  let result: ProjectStatus;
  try {
    const response = await probe(url);
    // Any answer below 500 means the server is up, even if it refuses bots.
    result = { slug, url, up: response.status < 500, ms: response.ms, checkedAt: Date.now() };
  } catch {
    result = { slug, url, up: false, ms: null, checkedAt: Date.now() };
  }
  cache.set(url, result);
  return result;
}

/**
 * Checks the public URLs of the projects in the CMS. Takes no input: only
 * URLs from the project list are ever requested.
 */
async function readTargets() {
  try {
    const page = await getPageData<BasicPageContent>(DEFAULT_LANGUAGE, "projects");
    const projects = getSection<ProjectsListContent>(page, "projects-list")?.content.items ?? [];
    knownTargets = projects.flatMap((project) => {
      const url = project.projectUrl || project.liveUrl;
      return url && /^https?:\/\//.test(url) ? [{ slug: project.slug, url }] : [];
    });
  } catch (error) {
    if (!knownTargets) throw error;
  }
  return knownTargets;
}

export const getProjectStatuses = createServerFn({ method: "GET" }).handler(async () => {
  const targets = await readTargets();
  return Promise.all(targets.map((target) => check(target.slug, target.url)));
});

export function projectStatusQuery() {
  return {
    queryKey: ["project-status"] as const,
    queryFn: () => getProjectStatuses(),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  };
}
