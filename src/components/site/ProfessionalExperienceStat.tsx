import { useQuery } from "@tanstack/react-query";
import {
  getProfessionalExperienceDisplay,
  type ProfessionalExperienceDisplay,
} from "@/lib/professional-experience";
import { useLanguage } from "@/hooks/use-language";
import { professionalExperienceQuery } from "@/queries/siteDataQueries";

export function ProfessionalExperienceStat() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const { data, isPending, isError } = useQuery(professionalExperienceQuery());

  if (isPending) {
    return (
      <div
        className="mt-5 flex min-h-20 items-center gap-2"
        role="status"
        aria-label={isArabic ? "جارٍ حساب الخبرة" : "Calculating experience"}
      >
        <span className="h-16 w-16 animate-pulse bg-accent" aria-hidden="true" />
        <span className="h-12 w-28 animate-pulse bg-muted" aria-hidden="true" />
      </div>
    );
  }

  if (isError || !data) return <ExperienceUnavailable isArabic={isArabic} />;

  try {
    return (
      <ExperienceGraphic
        display={getProfessionalExperienceDisplay(data.startDate)}
        isArabic={isArabic}
      />
    );
  } catch {
    return <ExperienceUnavailable isArabic={isArabic} />;
  }
}

function ExperienceGraphic({
  display,
  isArabic,
}: {
  display: ProfessionalExperienceDisplay;
  isArabic: boolean;
}) {
  const yearUnit = isArabic
    ? display.years === 1
      ? "سنة"
      : display.years === 2
        ? "سنتان"
        : display.years >= 3 && display.years <= 10
          ? "سنوات"
          : "سنة"
    : display.years === 1
      ? "Year"
      : "Years";
  const qualifier =
    display.qualifier === "exact"
      ? null
      : display.qualifier === "over"
        ? isArabic
          ? "أكثر من"
          : "Over"
        : isArabic
          ? "أقترب من"
          : "Approaching";
  const localizedLabel = `${qualifier ? `${qualifier} ` : ""}${display.years} ${yearUnit} ${
    isArabic ? "من الخبرة" : "of Experience"
  }`;
  const displayedYears = isArabic
    ? new Intl.NumberFormat("ar-LB", { useGrouping: false }).format(display.years)
    : display.years;

  return (
    <div
      className="mt-5 flex min-h-20 items-center gap-2"
      dir={isArabic ? "rtl" : "ltr"}
      role="status"
      aria-live="polite"
      aria-label={isArabic ? localizedLabel : display.label}
    >
      <span
        className="min-w-[3.75rem] font-sans text-[5rem] font-medium leading-[0.8] tracking-[-0.07em] text-primary tabular-nums"
        aria-hidden="true"
      >
        {displayedYears}
      </span>
      <span
        className={`flex flex-col ${isArabic ? "font-sans text-right" : "uppercase"}`}
        aria-hidden="true"
      >
        {qualifier && <span className="label-mono leading-none">{qualifier}</span>}
        <span className="mt-1 font-sans text-xl font-medium leading-none tracking-tight">
          {yearUnit}
        </span>
        <span className="mt-1 label-mono leading-none">
          {isArabic ? "من الخبرة" : "of experience"}
        </span>
      </span>
    </div>
  );
}

function ExperienceUnavailable({ isArabic }: { isArabic: boolean }) {
  return (
    <p
      className="mt-5 min-h-20 label-mono text-muted-foreground"
      dir={isArabic ? "rtl" : "ltr"}
      role="status"
    >
      {isArabic ? "تفاصيل الخبرة غير متاحة" : "Experience details unavailable"}
    </p>
  );
}
