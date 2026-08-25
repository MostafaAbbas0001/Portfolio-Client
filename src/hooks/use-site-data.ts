import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { DEFAULT_LANGUAGE } from "@/lib/siteData";
import { globalDataQuery, pageDataQuery } from "@/queries/siteDataQueries";
import { useLanguage } from "@/hooks/use-language";

const rootRoute = getRouteApi("__root__");

export function usePageData<TContent = unknown>(pageKey: string, language = DEFAULT_LANGUAGE) {
  return useSuspenseQuery(pageDataQuery<TContent>(language, pageKey));
}

export function useGlobalData(language = DEFAULT_LANGUAGE) {
  const initialGlobalData = rootRoute.useLoaderData();

  return useSuspenseQuery({
    ...globalDataQuery(language),
    ...(language === DEFAULT_LANGUAGE ? { initialData: initialGlobalData } : {}),
  });
}

export function useCurrentPageData<TContent = unknown>(pageKey: string) {
  const { language } = useLanguage();
  return usePageData<TContent>(pageKey, language);
}

export function useCurrentGlobalData() {
  const { language } = useLanguage();
  return useGlobalData(language);
}
