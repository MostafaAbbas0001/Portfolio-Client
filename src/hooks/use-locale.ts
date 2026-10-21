import { useRouterState } from "@tanstack/react-router";
import {
  LOCALE_META,
  localeFromPathname,
  localeParam,
  localizePath,
  otherLocale,
  stripLocale,
  type Locale,
} from "@/lib/locale";
import { useUiStrings } from "@/hooks/use-ui-strings";

/**
 * The active locale comes from the URL (`/ar/...`), using the last resolved
 * location so the language never switches before the next page has loaded.
 */
export function useLocale() {
  const pathname = useRouterState({
    select: (state) => (state.resolvedLocation ?? state.location).pathname,
  });
  const locale: Locale = localeFromPathname(pathname);
  const alternate = otherLocale(locale);

  return {
    locale,
    dir: LOCALE_META[locale].dir,
    param: localeParam(locale),
    t: useUiStrings(locale),
    localize: (path: string) => localizePath(path, locale),
    alternate,
    alternatePath: localizePath(stripLocale(pathname), alternate),
  };
}
