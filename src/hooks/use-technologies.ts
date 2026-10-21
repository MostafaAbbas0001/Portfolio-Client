import { useSuspenseQuery } from "@tanstack/react-query";
import { technologiesQuery } from "@/queries/siteDataQueries";
import type { TechItem } from "@/types/siteData";

export function resolveTechnologyReferences(
  catalog: TechItem[],
  keys: string[] | undefined,
  legacy: Array<TechItem | string> | undefined,
) {
  if (keys?.length) {
    const byKey = new Map(catalog.map((technology) => [technology.key, technology]));
    return keys.flatMap((key) => {
      const technology = byKey.get(key);
      return technology ? [technology] : [];
    });
  }

  return (legacy ?? []).map((technology) => {
    if (typeof technology !== "string") return technology;
    return catalog.find((item) => item.name === technology) ?? { name: technology };
  });
}

export function useTechnologyCatalog() {
  return useSuspenseQuery(technologiesQuery()).data;
}

export function useResolvedTechnologies(
  keys: string[] | undefined,
  legacy?: Array<TechItem | string>,
) {
  return resolveTechnologyReferences(useTechnologyCatalog(), keys, legacy);
}
