interface CalendarDate {
  year: number;
  month: number;
  day: number;
}

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function parseDateOnly(value: string): CalendarDate {
  const match = DATE_ONLY_PATTERN.exec(value);
  if (!match) throw new Error("Professional start date must use YYYY-MM-DD format.");

  const date = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };

  if (
    date.month < 1 ||
    date.month > 12 ||
    date.day < 1 ||
    date.day > daysInMonth(date.year, date.month)
  ) {
    throw new Error("Professional start date is not a valid calendar date.");
  }

  return date;
}

function compareDates(left: CalendarDate, right: CalendarDate) {
  return left.year - right.year || left.month - right.month || left.day - right.day;
}

function addYears(date: CalendarDate, years: number): CalendarDate {
  const year = date.year + years;
  return {
    year,
    month: date.month,
    day: Math.min(date.day, daysInMonth(year, date.month)),
  };
}

function addMonths(date: CalendarDate, months: number): CalendarDate {
  const zeroBasedMonth = date.month - 1 + months;
  const year = date.year + Math.floor(zeroBasedMonth / 12);
  const month = (zeroBasedMonth % 12) + 1;
  return {
    year,
    month,
    day: Math.min(date.day, daysInMonth(year, month)),
  };
}

function yearLabel(years: number) {
  return `${years} ${years === 1 ? "Year" : "Years"} of Experience`;
}

export interface ProfessionalExperienceDisplay {
  years: number;
  qualifier: "exact" | "over" | "approaching";
  label: string;
}

export function getProfessionalExperienceDisplay(
  startDate: string,
  today = new Date(),
): ProfessionalExperienceDisplay {
  const start = parseDateOnly(startDate);
  const current: CalendarDate = {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate(),
  };

  if (compareDates(start, current) > 0) {
    throw new Error("Professional start date cannot be in the future.");
  }

  let completedYears = current.year - start.year;
  let anniversary = addYears(start, completedYears);

  if (compareDates(current, anniversary) < 0) {
    completedYears -= 1;
    anniversary = addYears(start, completedYears);
  }

  if (compareDates(current, anniversary) === 0) {
    return {
      years: completedYears,
      qualifier: "exact",
      label: yearLabel(completedYears),
    };
  }

  const sixMonthThreshold = addMonths(anniversary, 6);
  if (compareDates(current, sixMonthThreshold) >= 0) {
    const years = completedYears + 1;
    return {
      years,
      qualifier: "approaching",
      label: `Approaching ${yearLabel(years)}`,
    };
  }

  return {
    years: completedYears,
    qualifier: "over",
    label: `Over ${yearLabel(completedYears)}`,
  };
}

export function getProfessionalExperienceLabel(startDate: string, today = new Date()) {
  return getProfessionalExperienceDisplay(startDate, today).label;
}
