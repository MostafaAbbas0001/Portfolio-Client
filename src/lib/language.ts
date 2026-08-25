import { DEFAULT_LANGUAGE } from "@/lib/siteData";

export type SupportedLanguage = "en" | "ar";

export const LANGUAGE_STORAGE_KEY = "portfolio-language";
export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ["en", "ar"];

export function normalizeLanguage(value: string | null | undefined): SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(value as SupportedLanguage)
    ? (value as SupportedLanguage)
    : DEFAULT_LANGUAGE;
}
