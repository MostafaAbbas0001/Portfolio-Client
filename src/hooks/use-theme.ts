import { useSyncExternalStore } from "react";
import { readThemePreference, setThemePreference, type ThemePreference } from "@/lib/theme";

/** Re-renders whenever the boot script or another switch changes the saved theme. */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme-pref"],
  });
  return () => observer.disconnect();
}

export function useThemePreference(): [ThemePreference, (preference: ThemePreference) => void] {
  const preference = useSyncExternalStore(subscribe, readThemePreference, () => "system" as const);
  return [preference, setThemePreference];
}
