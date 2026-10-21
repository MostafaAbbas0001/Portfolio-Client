import { useQuery } from "@tanstack/react-query";
import type { Locale } from "@/lib/locale";
import { getUiStrings } from "@/lib/ui-strings";
import { globalDataQuery } from "@/queries/siteDataQueries";
export function useUiStrings(locale: Locale) {
  const { data } = useQuery(globalDataQuery(locale));
  return getUiStrings(locale, data);
}
