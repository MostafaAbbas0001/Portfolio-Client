import { imageUrl } from "@/api/siteDataApi";
import type { TechItem } from "@/types/siteData";
import { techMarkProps } from "@/lib/tech-logo";

/** Technology names with their logos. Logos are decorative: the name is the label. */
export function TechList({ items, className = "" }: { items: TechItem[]; className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-x-6 gap-y-3 ${className}`}>
      {items.map((technology) => (
        <li
          key={technology.id ?? technology.key ?? technology.name}
          className="flex min-w-0 items-center gap-2 text-[0.9375rem]"
        >
          {technology.imageUrl ? (
            <img
              {...techMarkProps(technology)}
              src={imageUrl(technology.imageUrl, 64)}
              width={20}
              height={20}
              alt=""
              loading="lazy"
              decoding="async"
              className="tech-logo size-5 shrink-0 object-contain"
            />
          ) : (
            <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-faint" />
          )}
          <span>{technology.name}</span>
        </li>
      ))}
    </ul>
  );
}
