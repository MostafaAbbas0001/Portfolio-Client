import type { Locale } from "@/lib/locale";
import type { ProfessionalExperienceDisplay } from "@/lib/professional-experience";
import { getUiStrings } from "@/lib/ui-strings";
import type { GlobalResponse } from "@/types/siteData";
export function experienceLabel(
  display: ProfessionalExperienceDisplay,
  locale: Locale,
  global?: GlobalResponse,
) {
  return getUiStrings(locale, global).experienceLabel(display);
}
