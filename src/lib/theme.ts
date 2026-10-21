export type ThemePreference = "light" | "dark" | "system";

export const THEME_PREFERENCES: readonly ThemePreference[] = ["light", "dark", "system"];

/** Browser chrome colour (theme-color) for each theme; matches --ground in styles.css. */
export const THEME_COLORS = { light: "#f6f8fb", dark: "#0d1118" } as const;

const STORAGE_KEY = "theme";

/**
 * Inlined in <head> so the page paints in the right theme on the first frame.
 * Sets <html data-theme="light|dark"> (what the CSS reads) and
 * data-theme-pref="light|dark|system" (the visitor's choice), follows the
 * system setting while the choice is "system", and keeps tabs in sync.
 * window.__applyTheme(pref?) re-applies; the theme switch calls it.
 */
export const THEME_BOOT_SCRIPT = `(function(){
var d=document.documentElement,k=${JSON.stringify(STORAGE_KEY)},mem=null;
var mq=window.matchMedia?matchMedia("(prefers-color-scheme: light)"):null;
function read(){var v=mem;try{v=localStorage.getItem(k)||mem}catch(e){}return v==="light"||v==="dark"?v:"system"}
function apply(p){if(p)mem=p;p=p||read();var t=p==="system"?(mq&&mq.matches?"light":"dark"):p;
d.setAttribute("data-theme",t);d.setAttribute("data-theme-pref",p);
var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",t==="light"?${JSON.stringify(THEME_COLORS.light)}:${JSON.stringify(THEME_COLORS.dark)})}
apply();window.__applyTheme=apply;
if(mq){var f=function(){if(read()==="system")apply()};if(mq.addEventListener)mq.addEventListener("change",f);else if(mq.addListener)mq.addListener(f)}
addEventListener("storage",function(e){if(e.key===k)apply()});
document.addEventListener("DOMContentLoaded",function(){apply()});
})();`;

type ThemeWindow = Window & { __applyTheme?: (preference?: ThemePreference) => void };

export function readThemePreference(): ThemePreference {
  if (typeof document === "undefined") return "system";
  const value = document.documentElement.getAttribute("data-theme-pref");
  return value === "light" || value === "dark" ? value : "system";
}

/** Saves the visitor's choice and cross-fades the page into it. */
export function setThemePreference(preference: ThemePreference) {
  try {
    if (preference === "system") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // Storage blocked (private mode): the choice still applies to this page.
  }

  const apply = () => (window as ThemeWindow).__applyTheme?.(preference);
  const root = document.documentElement;
  const doc = document as Document & {
    startViewTransition?: (update: () => void) => { finished: Promise<void> };
  };
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  if (!doc.startViewTransition || reduce) {
    apply();
    return;
  }
  root.setAttribute("data-theme-switching", "");
  doc
    .startViewTransition(apply)
    .finished.catch(() => {})
    .finally(() => root.removeAttribute("data-theme-switching"));
}
