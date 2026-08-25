import { createFileRoute, Link, Navigate, useRouter } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { resolveApiResourceUrl } from "@/api/siteDataApi";
import { useAuth } from "@/hooks/use-auth";
import { useCurrentGlobalData } from "@/hooks/use-site-data";
import { getGlobalContent } from "@/lib/siteData";
import type { HeaderGlobalContent } from "@/types/siteData";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, login } = useAuth();
  const { data: globalData } = useCurrentGlobalData();
  const header = getGlobalContent<HeaderGlobalContent>(globalData, "header");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to="/admin" />;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(email, password);
      await router.navigate({ to: "/admin" });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative isolate flex min-h-screen overflow-hidden bg-[#f4f5f7] px-4 py-6 sm:px-6 sm:py-10">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-50"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(17,24,39,0.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(17,24,39,0.055) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[520px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-3xl"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(circle, rgba(37,99,235,0.1) 0%, rgba(37,99,235,0.035) 42%, transparent 72%)",
        }}
      />

      <div className="mx-auto flex w-full max-w-[1120px] flex-col">
        <header className="flex items-center justify-between gap-5">
          <Link
            to="/"
            className="relative block h-12 w-40 shrink-0 overflow-hidden transition-opacity duration-[180ms] hover:opacity-80"
            aria-label={header?.homeAriaLabel ?? "Return to portfolio"}
          >
            {header?.logoUrl && (
              <img
                src={resolveApiResourceUrl(header.logoUrl)}
                width={1280}
                height={1280}
                alt={header.logoAlt}
                decoding="async"
                className="absolute left-1/2 top-1/2 w-40 max-w-none -translate-x-1/2 -translate-y-1/2 object-contain"
              />
            )}
          </Link>
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Back to site <span aria-hidden="true">&rarr;</span>
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center py-12 sm:py-16">
          <section className="w-full max-w-[440px] border border-border bg-background p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-9">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-primary" aria-hidden="true" />
              <p className="label-mono text-primary">Secure access</p>
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-normal sm:text-4xl">
              Welcome back
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Sign in to manage portfolio content and media.
            </p>

            <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5">
              <label className="flex flex-col gap-2 text-sm font-medium" htmlFor="email">
                Email address
                <input
                  id="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (error) setError(null);
                  }}
                  type="email"
                  autoComplete="email"
                  autoFocus
                  required
                  placeholder="admin@example.com"
                  className="min-h-12 rounded-[4px] border border-border bg-background px-4 text-sm font-normal outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium" htmlFor="password">
                Password
                <input
                  id="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (error) setError(null);
                  }}
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  className="min-h-12 rounded-[4px] border border-border bg-background px-4 text-sm font-normal outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>
              {error && (
                <div
                  role="alert"
                  className="border-l-2 border-destructive bg-destructive/5 px-4 py-3 text-sm text-destructive"
                >
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="mt-1 flex min-h-12 items-center justify-center gap-3 rounded-[4px] bg-foreground px-5 text-sm font-medium text-background transition-colors duration-[180ms] hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting && (
                  <span
                    className="size-4 animate-spin rounded-full border-2 border-background/35 border-t-background"
                    aria-hidden="true"
                  />
                )}
                {submitting ? "Signing in" : "Sign in to dashboard"}
              </button>
            </form>
            <p className="mt-7 border-t border-border pt-5 text-center text-xs leading-5 text-muted-foreground">
              Authorized access only
            </p>
          </section>
        </div>

        <footer className="flex items-center justify-between gap-4 border-t border-border pt-5 text-xs text-muted-foreground">
          <span>Portfolio content console</span>
          <span className="font-mono uppercase tracking-[0.12em]">Admin / Login</span>
        </footer>
      </div>
    </main>
  );
}
