import type { CSSProperties } from "react";
import { imageUrl } from "@/api/siteDataApi";
import type { TechItem } from "@/types/siteData";
import { techMarkProps } from "@/lib/tech-logo";

/** Two rows of the stack drifting in opposite directions, between two hairlines. */
export function TechMarquee({ items, label }: { items: TechItem[]; label: string }) {
  if (!items.length) return null;
  const half = Math.ceil(items.length / 2);
  const rows = [items.slice(0, half), items.slice(half)].filter((row) => row.length);

  return (
    <section aria-label={label} className="shell">
      <ul className="sr-only">
        {items.map((technology) => (
          <li key={technology.key ?? technology.name}>{technology.name}</li>
        ))}
      </ul>
      <div className="flex flex-col gap-1 border-y border-border py-6" aria-hidden="true">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="marquee">
            <div
              className="marquee-track"
              {...(rowIndex % 2 ? { "data-reverse": "" } : {})}
              style={{ "--marquee-duration": `${36 + row.length * 3}s` } as CSSProperties}
            >
              {[...row, ...row].map((technology, index) => (
                <span
                  key={`${technology.key ?? technology.name}-${index}`}
                  className="flex items-center gap-3 px-6 py-2.5 text-[0.9375rem] whitespace-nowrap text-muted-foreground"
                >
                  {technology.imageUrl && (
                    <img
                      {...techMarkProps(technology)}
                      src={imageUrl(technology.imageUrl, 64)}
                      alt=""
                      width={24}
                      height={24}
                      loading="lazy"
                      decoding="async"
                      className="tech-logo size-6 object-contain"
                    />
                  )}
                  {technology.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
