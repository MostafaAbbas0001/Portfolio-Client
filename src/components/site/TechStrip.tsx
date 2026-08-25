import { Link } from "@tanstack/react-router";
import { resolveApiResourceUrl } from "@/api/siteDataApi";
import { useLanguage } from "@/hooks/use-language";
import { useResolvedTechnologies } from "@/hooks/use-technologies";
import type { TechStripContent } from "@/types/siteData";

interface TechStripProps {
  techStrip: TechStripContent;
}

export function TechStrip({ techStrip }: TechStripProps) {
  const { direction } = useLanguage();
  const isRtl = direction === "rtl";
  const technologies = useResolvedTechnologies(
    techStrip.technologyKeys,
    techStrip.technologies ?? techStrip.items,
  );

  return (
    <div className="rule-top py-8">
      <div className="grid gap-5 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:gap-10">
        <p className="label-mono">{techStrip.label}</p>
        <ul
          className={`flex flex-wrap items-center gap-x-5 gap-y-2 ${isRtl ? "lg:justify-end" : ""}`}
        >
          {technologies.map((tech) => (
            <li
              key={tech.id ?? tech.key ?? tech.name}
              className="mono-xs flex items-center gap-2 text-foreground"
            >
              {tech.imageUrl ? (
                <img
                  src={resolveApiResourceUrl(tech.imageUrl)}
                  width={24}
                  height={24}
                  alt={tech.alt ?? `${tech.name} logo`}
                  loading="lazy"
                  className="size-5 shrink-0 object-contain"
                />
              ) : (
                <span aria-hidden="true" className="size-1 rounded-full bg-primary" />
              )}
              <span>{tech.name}</span>
            </li>
          ))}
        </ul>
        <Link to="/about" className="label-mono arrow-move hover:text-primary lg:justify-self-end">
          {isRtl ? (
            <>
              <span className="arrow">&lt;-</span> {techStrip.linkLabel}
            </>
          ) : (
            <>
              {techStrip.linkLabel} <span className="arrow">-&gt;</span>
            </>
          )}
        </Link>
      </div>
    </div>
  );
}
