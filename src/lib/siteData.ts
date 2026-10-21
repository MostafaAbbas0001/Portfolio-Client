import type { GlobalResponse, PageResponse, SectionContent } from "@/types/siteData";

export const DEFAULT_LANGUAGE = "en";

export function getSection<TContent>(
  page: PageResponse | undefined,
  key: string,
): SectionContent<TContent> | undefined {
  return page?.data.sections.find((section) => section.key === key) as
    SectionContent<TContent> | undefined;
}

export function getGlobalContent<TContent>(
  globalData: GlobalResponse | undefined,
  key: string,
): TContent | undefined {
  return globalData?.data.find((item) => item.key === key)?.content as TContent | undefined;
}
