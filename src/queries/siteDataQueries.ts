import { queryOptions } from "@tanstack/react-query";
import { getPageData, getGlobalData, getTechnologies } from "@/api/siteDataApi";
import type { PageResponse } from "@/types/siteData";

const siteDataKeys = {
  page: (language: string, pageKey: string) => ["page-data", language, pageKey] as const,
  global: (language: string) => ["global-data", language] as const,
  technologies: ["technologies"] as const,
};

export function pageDataQuery<TContent = unknown>(language: string, pageKey: string) {
  return queryOptions<PageResponse<TContent>>({
    queryKey: siteDataKeys.page(language, pageKey),
    queryFn: () => getPageData<TContent>(language, pageKey),
    staleTime: 1000 * 60 * 5,
  });
}

export function globalDataQuery(language: string) {
  return queryOptions({
    queryKey: siteDataKeys.global(language),
    queryFn: () => getGlobalData(language),
    staleTime: 1000 * 60 * 10,
  });
}

export function technologiesQuery() {
  return queryOptions({
    queryKey: siteDataKeys.technologies,
    queryFn: getTechnologies,
    staleTime: 1000 * 60 * 30,
  });
}
