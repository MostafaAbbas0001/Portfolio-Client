import type { TechItem } from "@/types/siteData";

/**
 * Technologies whose logo is drawn in black or near-black, so it would vanish
 * on the dark theme. Their logo is inverted there (see .tech-logo in
 * styles.css); every other logo keeps its own brand colours in both themes.
 * Add a technology's key here when its new logo is dark.
 */
const DARK_MARKS = new Set(["nextjs", "mysql", "sql-server", "postgis", "iis"]);

/** Spread onto a technology logo <img className="tech-logo …">. */
export function techMarkProps(technology: Pick<TechItem, "key">) {
  return technology.key && DARK_MARKS.has(technology.key) ? { "data-mark": "dark" } : {};
}
