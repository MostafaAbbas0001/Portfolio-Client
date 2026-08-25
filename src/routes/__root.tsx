import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { LanguageProvider } from "@/components/layout/LanguageProvider";
import { AuthProvider } from "@/components/layout/AuthProvider";
import { useCurrentGlobalData } from "@/hooks/use-site-data";
import { SITE_NAME } from "@/lib/seo";
import { DEFAULT_LANGUAGE } from "@/lib/siteData";
import { globalDataQuery, technologiesQuery } from "@/queries/siteDataQueries";

function NotFoundComponent() {
  return (
    <div className="shell flex min-h-[60vh] flex-col justify-center py-20">
      <p className="label-mono">404 / Page not found</p>
      <h1 className="mt-5 display-lg">Looks like this route doesn&apos;t exist.</h1>
      <p className="mt-8">
        <Link to="/" className="label-mono link-underline">
          Back home →
        </Link>
      </p>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="shell flex min-h-[60vh] flex-col justify-center py-20">
      <p className="label-mono">Error</p>
      <h1 className="mt-5 display-md">This page didn&apos;t load.</h1>
      <p className="mt-4 body-copy text-muted-foreground">
        Something went wrong on our end. You can try again or head back home.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="inline-flex min-h-11 items-center bg-foreground px-6 text-sm font-medium text-background"
        >
          Try again
        </button>
        <a
          href="/"
          className="inline-flex min-h-11 items-center border border-foreground px-6 text-sm font-medium"
        >
          Go home
        </a>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: async ({ context }) => {
    const [globalData] = await Promise.all([
      context.queryClient.ensureQueryData(globalDataQuery(DEFAULT_LANGUAGE)),
      context.queryClient.ensureQueryData(technologiesQuery()),
    ]);
    return globalData;
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Mostafa Abbas — Full-Stack Developer & Software Engineer" },
      {
        name: "description",
        content:
          "Mostafa Abbas is a Full-Stack Developer and Software Engineer building maintainable web applications, business systems and reliable software solutions.",
      },
      { name: "author", content: SITE_NAME },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:locale", content: "en_US" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist:wght@400;500&family=Geist+Mono:wght@400&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <RootLayout pathname={pathname} />
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function RootLayout({ pathname }: { pathname: string }) {
  if (pathname === "/admin" || pathname === "/login") {
    return <Outlet />;
  }

  return <PublicSiteLayout pathname={pathname} />;
}

function PublicSiteLayout({ pathname }: { pathname: string }) {
  const { data: globalData } = useCurrentGlobalData();

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
      >
        Skip to content
      </a>
      <SiteHeader globalData={globalData} />
      <main id="main">
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <div key={pathname} className="rise">
          <Outlet />
        </div>
      </main>
      <SiteFooter globalData={globalData} />
    </>
  );
}
