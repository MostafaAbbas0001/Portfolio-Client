import { useSuspenseQuery } from "@tanstack/react-query";
import { useLocale } from "@/hooks/use-locale";
import type { Locale } from "@/lib/locale";
import { globalDataQuery, pageDataQuery } from "@/queries/siteDataQueries";

export function usePageData<TContent = unknown>(pageKey: string, locale: Locale) {
  return useSuspenseQuery(pageDataQuery<TContent>(locale, pageKey));
}

export function useGlobalData(locale: Locale) {
  return useSuspenseQuery(globalDataQuery(locale));
}

/** Page content in the language of the current URL. */
export function useCurrentPageData<TContent = unknown>(pageKey: string) {
  const { locale } = useLocale();
  return usePageData<TContent>(pageKey, locale);
}

/** Global content (site, header, footer) in the language of the current URL. */
export function useCurrentGlobalData() {
  const { locale } = useLocale();
  return useGlobalData(locale);
}
