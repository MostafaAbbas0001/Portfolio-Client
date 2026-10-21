import type { CSSProperties } from "react";
import { imageSrcSet, imageUrl } from "@/api/siteDataApi";
import { techMarkProps } from "@/lib/tech-logo";
import type { TechItem } from "@/types/siteData";

interface HeroOrbitProps {
  portrait: string;
  alt: string;
  technologies: TechItem[];
}

// Fade the photo out at the sides and bottom so it dissolves into the light.
const PORTRAIT_MASK: CSSProperties = {
  maskImage:
    "linear-gradient(to bottom, #000 60%, transparent 97%), linear-gradient(to right, transparent 2%, #000 24%, #000 76%, transparent 98%)",
  WebkitMaskImage:
    "linear-gradient(to bottom, #000 60%, transparent 97%), linear-gradient(to right, transparent 2%, #000 24%, #000 76%, transparent 98%)",
  maskComposite: "intersect",
  WebkitMaskComposite: "source-in",
};

/** Portrait lit from behind, with the stack orbiting it on two tilted rings. */
export function HeroOrbit({ portrait, alt, technologies }: HeroOrbitProps) {
  const withLogo = technologies.filter((technology) => technology.imageUrl);
  const inner = withLogo.slice(0, 5);
  const outer = withLogo.slice(5, 12);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[600px] [container-type:inline-size]">
      <div className="orbit-stage absolute inset-0">
        <div className="orbit-backlight" aria-hidden="true" />

        <OrbitRing items={outer} size="100cqw" tilt="80deg" lean="5deg" duration="64s" reverse />
        <OrbitRing items={inner} size="74cqw" tilt="77deg" lean="-6deg" duration="44s" />

        <div className="absolute inset-x-0 bottom-0 top-[6%]">
          <img
            src={imageUrl(portrait, 960)}
            srcSet={imageSrcSet(portrait, [480, 640, 960, 1280])}
            sizes="(min-width: 1024px) 44vw, 92vw"
            width={1448}
            height={1086}
            alt={alt}
            fetchPriority="high"
            decoding="async"
            className="portrait-in absolute inset-0 h-full w-full object-cover object-bottom"
            style={PORTRAIT_MASK}
          />
        </div>
      </div>
    </div>
  );
}

function OrbitRing({
  items,
  size,
  tilt,
  lean,
  duration,
  reverse = false,
}: {
  items: TechItem[];
  size: string;
  tilt: string;
  lean: string;
  duration: string;
  reverse?: boolean;
}) {
  if (!items.length) return null;
  const style = {
    "--size": size,
    "--tilt": tilt,
    "--lean": lean,
    "--dur": duration,
    "--dir": reverse ? "reverse" : "normal",
  } as CSSProperties;

  return (
    <div className="orbit-ring" style={style} aria-hidden="true">
      <div className="orbit-spin">
        {items.map((technology, index) => (
          <div
            key={technology.key ?? technology.name}
            className="orbit-item"
            style={{ "--angle": `${(360 / items.length) * index}deg` } as CSSProperties}
          >
            <div className="orbit-face">
              <span>
                <img
                  {...techMarkProps(technology)}
                  src={imageUrl(technology.imageUrl ?? "", 64)}
                  alt=""
                  width={22}
                  height={22}
                  loading="lazy"
                  decoding="async"
                  className="tech-logo size-[22px] object-contain"
                />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
