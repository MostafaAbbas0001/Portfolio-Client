import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { CheckIcon, MonitorIcon, MoonIcon, SunIcon } from "@/components/ui/Icons";
import { useLocale } from "@/hooks/use-locale";
import { useThemePreference } from "@/hooks/use-theme";
import { THEME_PREFERENCES, type ThemePreference } from "@/lib/theme";

const ICONS: Record<ThemePreference, ReactNode> = {
  light: <SunIcon />,
  dark: <MoonIcon />,
  system: <MonitorIcon />,
};

function useThemeLabels() {
  const { t } = useLocale();
  return {
    title: t.theme,
    label: { light: t.themeLight, dark: t.themeDark, system: t.themeSystem } as Record<
      ThemePreference,
      string
    >,
  };
}

/** Moves focus between sibling controls with the arrow keys (Home/End jump to the ends). */
function moveFocus(event: KeyboardEvent<HTMLElement>, selector: string, vertical: boolean) {
  const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(selector));
  const index = items.indexOf(document.activeElement as HTMLElement);
  const rtl = document.documentElement.dir === "rtl";
  const next = vertical ? "ArrowDown" : rtl ? "ArrowLeft" : "ArrowRight";
  const previous = vertical ? "ArrowUp" : rtl ? "ArrowRight" : "ArrowLeft";
  let target = -1;
  if (event.key === next) target = (index + 1) % items.length;
  else if (event.key === previous) target = (index - 1 + items.length) % items.length;
  else if (event.key === "Home") target = 0;
  else if (event.key === "End") target = items.length - 1;
  if (target < 0) return null;
  event.preventDefault();
  items[target]?.focus();
  return items[target] ?? null;
}

/** Header button: shows the saved theme's icon and opens a light / dark / system menu. */
export function ThemeMenu() {
  const [preference, setPreference] = useThemePreference();
  const { title, label } = useThemeLabels();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    rootRef.current?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus();
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (value: ThemePreference) => {
    setPreference(value);
    setOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        className="icon-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={title}
        title={title}
        onClick={() => setOpen((value) => !value)}
      >
        {THEME_PREFERENCES.map((value) => (
          <span key={value} data-pref-icon={value}>
            {ICONS[value]}
          </span>
        ))}
      </button>
      {open && (
        <div
          role="menu"
          aria-label={title}
          className="menu absolute end-0 top-full z-10 mt-3"
          onKeyDown={(event) => moveFocus(event, '[role="menuitemradio"]', true)}
        >
          {THEME_PREFERENCES.map((value) => (
            <button
              key={value}
              type="button"
              role="menuitemradio"
              aria-checked={preference === value}
              className="menu-item"
              onClick={() => choose(value)}
            >
              {ICONS[value]}
              <span className="flex-1">{label[value]}</span>
              {preference === value && <CheckIcon className="text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Light / dark / system as a radio group, for the footer and the mobile menu. */
export function ThemeSegmented({ showLabels = false }: { showLabels?: boolean }) {
  const [preference, setPreference] = useThemePreference();
  const { title, label } = useThemeLabels();

  return (
    <div
      role="radiogroup"
      aria-label={title}
      className="segmented"
      onKeyDown={(event) => {
        const target = moveFocus(event, '[role="radio"]', false);
        const value = target?.dataset["value"] as ThemePreference | undefined;
        if (value) setPreference(value);
      }}
    >
      {THEME_PREFERENCES.map((value) => (
        <button
          key={value}
          type="button"
          role="radio"
          data-value={value}
          aria-checked={preference === value}
          tabIndex={preference === value ? 0 : -1}
          aria-label={showLabels ? undefined : label[value]}
          title={showLabels ? undefined : label[value]}
          onClick={() => setPreference(value)}
        >
          {ICONS[value]}
          {showLabels && <span>{label[value]}</span>}
        </button>
      ))}
    </div>
  );
}
