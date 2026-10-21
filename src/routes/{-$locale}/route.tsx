import { Outlet, createFileRoute, notFound, redirect, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import readexArabic from "@fontsource-variable/readex-pro/files/readex-pro-arabic-wght-normal.woff2?url";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { useGlobalData } from "@/hooks/use-site-data";
import { localeFromParam } from "@/lib/locale";
import { settleSmoothScroll, startSmoothScroll } from "@/lib/smooth-scroll";
import { getGlobalContent } from "@/lib/siteData";
import type { SiteGlobalContent } from "@/types/siteData";
import { getUiStrings } from "@/lib/ui-strings";
import { globalDataQuery, technologiesQuery } from "@/queries/siteDataQueries";
import { NotFoundPage } from "../__root";
import { resolveApiResourceUrl } from "@/api/siteDataApi";

export const Route = createFileRoute("/{-$locale}")({
  beforeLoad: ({ params, location }) => {
    if (params.locale === undefined || params.locale === "ar") return;
    // English is served without a prefix; keep one canonical URL per page.
    if (params.locale === "en") {
      throw redirect({
        href: location.href.replace(/^\/en(?=\/|\?|#|$)/, "") || "/",
        statusCode: 301,
      });
    }
    throw notFound();
  },
  loader: async ({ context, params }) => {
    const locale = localeFromParam(params.locale);
    const [global] = await Promise.all([
      context.queryClient.ensureQueryData(globalDataQuery(locale)),
      context.queryClient.ensureQueryData(technologiesQuery()),
    ]);
    const site = getGlobalContent<SiteGlobalContent>(global, "site");
    return { locale, siteName: site?.siteName, faviconUrl: site?.faviconUrl };
  },
  // Pages override the title; this one only shows on pages that fail to load.
  head: ({ loaderData }) => ({
    meta: loaderData?.siteName ? [{ title: loaderData.siteName }] : [],
    links: [
      { rel: "icon", href: resolveApiResourceUrl(loaderData?.faviconUrl || "/favicon.ico") },
      ...(loaderData?.locale === "ar"
        ? [
            {
              rel: "preload",
              href: readexArabic,
              as: "font",
              type: "font/woff2",
              crossOrigin: "anonymous" as const,
            },
          ]
        : []),
    ],
  }),
  component: PublicLayout,
  notFoundComponent: NotFoundPage,
});

function PublicLayout() {
  const { locale } = Route.useLoaderData();
  const { data: globalData } = useGlobalData(locale);
  const router = useRouter();

  useEffect(() => {
    const stop = startSmoothScroll();
    const unsubscribe = router.subscribe("onBeforeNavigate", settleSmoothScroll);
    return () => {
      unsubscribe();
      stop();
    };
  }, [router]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-3 focus:z-[60] focus:rounded-md focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
      >
        {getUiStrings(locale, globalData).skipToContent}
      </a>
      <SiteHeader globalData={globalData} />
      <main id="main" tabIndex={-1} className="outline-none">
        <Outlet />
      </main>
      <SiteFooter globalData={globalData} />
    </>
  );
}
