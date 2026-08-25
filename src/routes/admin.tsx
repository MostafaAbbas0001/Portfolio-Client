import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useRef, useState, type ReactNode } from "react";
import { ContentEditor } from "@/components/admin/ContentEditor";
import { MediaManager } from "@/components/admin/MediaManager";
import { TechnologyManager } from "@/components/admin/TechnologyManager";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

const AREA_META = {
  content: {
    title: "Content editor",
    description:
      "Manage the page, section, SEO, and global JSON used by the public site in English and Arabic.",
  },
  media: {
    title: "Media library",
    description:
      "Upload images, copy API-backed file paths, remove old assets, and replace the public resume PDF.",
  },
  technologies: {
    title: "Technology catalog",
    description:
      "Manage the stable technology keys, display names, and image paths referenced by site content.",
  },
};

type AdminArea = keyof typeof AREA_META;

function AdminPage() {
  const { token, user, loading, isAuthenticated, logout } = useAuth();
  const [activeArea, setActiveArea] = useState<AdminArea>("content");
  const [visitedAreas, setVisitedAreas] = useState(() => new Set(["content"]));
  const scrollPositions = useRef<Record<AdminArea, number>>({
    content: 0,
    technologies: 0,
    media: 0,
  });
  const activeMeta = AREA_META[activeArea];

  function switchArea(nextArea: AdminArea) {
    if (nextArea === activeArea) return;
    scrollPositions.current[activeArea] = window.scrollY;
    setVisitedAreas((current) => new Set(current).add(nextArea));
    setActiveArea(nextArea);
    window.requestAnimationFrame(() => window.scrollTo({ top: scrollPositions.current[nextArea] }));
  }

  if (loading) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-muted px-6">
        <div className="border border-border bg-background p-8 shadow-sm">
          <p className="label-mono">Checking session</p>
          <h1 className="mt-3 text-2xl font-medium">Opening admin</h1>
        </div>
      </section>
    );
  }

  if (!isAuthenticated || !token) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen bg-[#f4f5f7] text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-[1500px] items-center justify-between gap-5 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <Link to="/" className="font-mono text-sm font-semibold text-primary">
              &lt;MA /&gt;
            </Link>
            <span className="h-5 w-px bg-border" aria-hidden="true" />
            <div className="min-w-0">
              <span className="block truncate text-sm font-semibold">Site administration</span>
              <span className="hidden text-xs text-muted-foreground sm:block">
                Portfolio content console
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden max-w-56 truncate border border-border bg-muted px-3 py-1.5 text-xs text-muted-foreground sm:block">
              {user?.email}
            </span>
            <button
              type="button"
              onClick={logout}
              className="min-h-9 border border-border bg-background px-3 text-sm font-medium transition-colors hover:border-foreground"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] items-start gap-5 px-4 py-5 sm:px-6 sm:py-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8 lg:px-8 lg:py-8">
        <aside className="border border-border bg-background p-4 shadow-sm lg:sticky lg:top-20 lg:z-10 lg:p-5">
          <div className="mb-5 hidden lg:block">
            <p className="label-mono">Workspace</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Edit live API content and assets.
            </p>
          </div>
          <nav className="grid grid-cols-3 gap-2 lg:grid-cols-1" aria-label="Admin areas">
            <AdminNavButton
              active={activeArea === "content"}
              eyebrow="JSON"
              icon="[]"
              onClick={() => switchArea("content")}
            >
              Content
            </AdminNavButton>
            <AdminNavButton
              active={activeArea === "technologies"}
              eyebrow="Catalog"
              icon="T"
              onClick={() => switchArea("technologies")}
            >
              Technologies
            </AdminNavButton>
            <AdminNavButton
              active={activeArea === "media"}
              eyebrow="Files"
              icon="+"
              onClick={() => switchArea("media")}
            >
              Media
            </AdminNavButton>
          </nav>
          <Link
            to="/"
            className="mt-6 hidden border-t border-border pt-6 text-sm font-medium text-muted-foreground transition-colors hover:text-primary lg:block"
          >
            View public site
          </Link>
        </aside>

        <main className="min-w-0">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 border border-border bg-background p-5 shadow-sm md:p-6">
              <div className="max-w-2xl">
                <p className="label-mono">Admin / {activeArea}</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-normal md:text-4xl">
                  {activeMeta.title}
                </h1>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {activeMeta.description}
                </p>
              </div>
            </div>

            <section className="border border-border bg-background shadow-sm">
              <div className={activeArea === "content" ? "block" : "hidden"}>
                <ContentEditor token={token} />
              </div>
              {visitedAreas.has("media") && (
                <div className={activeArea === "media" ? "block" : "hidden"}>
                  <MediaManager token={token} />
                </div>
              )}
              {visitedAreas.has("technologies") && (
                <div className={activeArea === "technologies" ? "block" : "hidden"}>
                  <TechnologyManager token={token} />
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function AdminNavButton({
  active,
  eyebrow,
  icon,
  onClick,
  children,
}: {
  active: boolean;
  eyebrow: string;
  icon: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex min-h-16 items-center gap-3 border px-4 text-left transition-colors ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-background text-foreground hover:border-foreground"
      }`}
    >
      <span
        className={`flex size-9 shrink-0 items-center justify-center border font-mono text-xs ${
          active ? "border-background/35" : "border-border bg-muted text-primary"
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span
          className={`block text-[10px] uppercase tracking-[0.18em] ${
            active ? "text-background/55" : "text-muted-foreground"
          }`}
        >
          {eyebrow}
        </span>
        <span className="mt-1 block text-sm font-semibold">{children}</span>
      </span>
    </button>
  );
}
