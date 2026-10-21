import type { QueryClient } from "@tanstack/react-query";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import funnelLatin from "@fontsource-variable/funnel-display/files/funnel-display-latin-wght-normal.woff2?url";
import readexLatin from "@fontsource-variable/readex-pro/files/readex-pro-latin-wght-normal.woff2?url";

import appCss from "../styles.css?url";
import { getPublicApiOrigin } from "@/api/siteDataApi";
import { AuthProvider } from "@/components/layout/AuthProvider";
import { MOTION_BOOT_SCRIPT } from "@/lib/motion-boot";
import { THEME_BOOT_SCRIPT, THEME_COLORS } from "@/lib/theme";
import { LOCALE_META, localeFromPathname, localizePath } from "@/lib/locale";
import { getUiStrings } from "@/lib/ui-strings";
import { globalDataQuery } from "@/queries/siteDataQueries";

const apiOrigin = getPublicApiOrigin();

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: async ({ context, location }) => {
    if (/^\/(admin|login)(\/|$)/.test(location.pathname)) return;
    // Error and unknown-page screens need CMS copy even on a direct visit.
    // Prefetch contains failures so bundled error text remains available offline.
    await context.queryClient.prefetchQuery({
      ...globalDataQuery(localeFromPathname(location.pathname)),
      retry: false,
    });
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "color-scheme", content: "dark light" },
      { name: "format-detection", content: "telephone=no" },
    ],
    links: [
      {
        rel: "preload",
        href: funnelLatin,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        href: readexLatin,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      { rel: "stylesheet", href: appCss },
      ...(apiOrigin ? [{ rel: "preconnect", href: apiOrigin }] : []),
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundPage,
  errorComponent: ErrorPage,
});

/** <html lang/dir> are rendered on the server from the URL, so Arabic pages arrive right-to-left. */
function RootShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const locale = localeFromPathname(pathname);
  // The admin screens are designed for the light palette only.
  const admin = /^\/(admin|login)(\/|$)/.test(pathname);

  // suppressHydrationWarning: the boot scripts set class="js", data-theme and
  // data-theme-pref before React hydrates; React never renders those.
  return (
    <html
      lang={locale}
      dir={LOCALE_META[locale].dir}
      {...(admin ? { "data-admin": "" } : {})}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: MOTION_BOOT_SCRIPT }} />
        <HeadContent />
        <meta name="theme-color" content={THEME_COLORS.dark} suppressHydrationWarning />
      </head>
      <body>
        <LogoFilter />
        {!admin && <div className="grain" aria-hidden="true" />}
        {children}
        <Scripts />
      </body>
    </html>
  );
}

/**
 * Recolours the CMS logo for the dark theme (used through --logo-filter): the
 * navy letters (#131821) become the ink colour (#eef2f8) while the logo blue
 * (#0d61fd) stays exact. Each channel is a straight line through those two
 * colours, keyed on the blue channel where they differ most.
 */
function LogoFilter() {
  return (
    <svg aria-hidden="true" width="0" height="0" className="absolute" focusable="false">
      <filter id="logo-on-dark" colorInterpolationFilters="sRGB">
        <feColorMatrix
          type="matrix"
          values="0 0 -1.0225 0 1.0653  0 0 -0.6596 0 1.0344  0 0 0.022 0 0.9702  0 0 0 1 0"
        />
      </filter>
    </svg>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

function useShellStrings() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const locale = localeFromPathname(pathname);
  const router = useRouter();
  const global = router.options.context.queryClient.getQueryData(globalDataQuery(locale).queryKey);
  return { locale, t: getUiStrings(locale, global) };
}

export function NotFoundPage() {
  const { locale, t } = useShellStrings();
  return (
    <main id="main" className="shell flex min-h-[80vh] flex-col justify-center pt-36 pb-20">
      <p className="data text-muted-foreground">404</p>
      <h1 className="mt-4 title-1">{t.notFoundTitle}</h1>
      <p className="mt-4 lead">{t.notFoundBody}</p>
      <p className="mt-8">
        <a href={localizePath("/", locale)} className="btn btn-primary">
          {t.backHome}
        </a>
      </p>
    </main>
  );
}

function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  const { locale, t } = useShellStrings();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="shell flex min-h-[80vh] flex-col justify-center pt-36 pb-20">
      <h1 className="title-1">{t.errorTitle}</h1>
      <p className="mt-4 lead">{t.errorBody}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            void router.invalidate();
            reset();
          }}
          className="btn btn-primary"
        >
          {t.tryAgain}
        </button>
        <a href={localizePath("/", locale)} className="btn btn-quiet">
          {t.backHome}
        </a>
      </div>
    </main>
  );
}
