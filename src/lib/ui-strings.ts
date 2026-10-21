import en from "@/lib/locales/en.json";
import ar from "@/lib/locales/ar.json";
import type { Locale } from "@/lib/locale";
import type { ProfessionalExperienceDisplay } from "@/lib/professional-experience";
import { getGlobalContent } from "@/lib/siteData";
import type { GlobalResponse } from "@/types/siteData";

/** Defaults keep error screens usable if the content API is unavailable. */
export const UI_DEFAULTS = { en, ar };
export type InterfaceContent = typeof en;

function mergeContent<T extends Record<string, unknown>>(defaults: T, value: unknown): T {
  const overrides = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return Object.fromEntries(
    Object.entries(defaults).map(([key, fallback]) => [
      key,
      typeof fallback === "string"
        ? typeof overrides[key] === "string"
          ? overrides[key]
          : fallback
        : mergeContent(fallback as Record<string, unknown>, overrides[key]),
    ]),
  ) as T;
}

export function getInterfaceContent(locale: Locale, global?: GlobalResponse): InterfaceContent {
  return mergeContent(UI_DEFAULTS[locale], getGlobalContent(global, "interface"));
}

export function formatTemplate(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => String(values[key] ?? match));
}

/** Plain JSON templates are editable in Admin > Content > Globals > interface. */
export function getUiStrings(locale: Locale, global?: GlobalResponse) {
  const content = getInterfaceContent(locale, global);
  const plural = (forms: InterfaceContent["systemsShipped"], count: number) =>
    formatTemplate(forms[new Intl.PluralRules(locale).select(count)], { count });
  return {
    ...content,
    statusLiveDetail: (ms: number) => formatTemplate(content.statusLiveDetail, { ms }),
    moreTechnologies: (count: number) => formatTemplate(content.moreTechnologies, { count }),
    checkedAgo: (minutes: number) =>
      minutes < 1 ? content.checkedNow : plural(content.checkedAgo, minutes),
    systemsShipped: (count: number) => plural(content.systemsShipped, count),
    experienceLabel: ({ years, qualifier }: ProfessionalExperienceDisplay) => {
      const template =
        qualifier === "over"
          ? content.experienceOver
          : qualifier === "approaching"
            ? content.experienceApproaching
            : content.experienceExact;
      const label = formatTemplate(template, { years: plural(content.experienceYears, years) });
      return locale === "en" ? label.charAt(0).toUpperCase() + label.slice(1) : label;
    },
  };
}
