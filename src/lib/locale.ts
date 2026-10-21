export type Locale = "en" | "ar";

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALES: Locale[] = ["en", "ar"];

export const LOCALE_META: Record<
  Locale,
  { dir: "ltr" | "rtl"; ogLocale: string; label: string; numberLocale: string }
> = {
  en: { dir: "ltr", ogLocale: "en_US", label: "English", numberLocale: "en-US" },
  ar: { dir: "rtl", ogLocale: "ar_LB", label: "العربية", numberLocale: "ar-LB" },
};

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "ar";
}

/** English lives at the root (`/about`); every other locale is prefixed (`/ar/about`). */
export function localeFromParam(param: string | undefined): Locale {
  return param === "ar" ? "ar" : DEFAULT_LOCALE;
}

export function localeParam(locale: Locale): string | undefined {
  return locale === DEFAULT_LOCALE ? undefined : locale;
}

export function localeFromPathname(pathname: string): Locale {
  return /^\/ar(\/|$)/.test(pathname) ? "ar" : DEFAULT_LOCALE;
}

export function stripLocale(pathname: string): string {
  const stripped = pathname.replace(/^\/(ar|en)(?=\/|$)/, "");
  return stripped === "" ? "/" : stripped;
}

export function localizePath(path: string, locale: Locale): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

export function otherLocale(locale: Locale): Locale {
  return locale === "ar" ? "en" : "ar";
}
