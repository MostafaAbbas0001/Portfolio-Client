import { resolveApiResourceUrl } from "@/api/siteDataApi";
import { useLanguage } from "@/hooks/use-language";

const portraitFade =
  "linear-gradient(to bottom, black 0%, black 88%, rgba(0,0,0,0.9) 94%, transparent 100%)";

interface HeroPortraitProps {
  imageUrl: string;
  imageAlt: string;
  messages: string[];
}

export function HeroPortrait({ imageUrl, imageAlt, messages }: HeroPortraitProps) {
  const { direction } = useLanguage();
  const isRtl = direction === "rtl";

  return (
    <div className="relative isolate mx-auto aspect-[6/5] w-full max-w-[640px] bg-transparent">
      <div
        aria-hidden="true"
        className="absolute inset-[7%] -z-10 bg-[radial-gradient(ellipse_at_50%_42%,rgba(18,103,243,0.12)_0%,rgba(18,103,243,0.055)_34%,rgba(18,103,243,0.018)_54%,transparent_74%)]"
      />

      <div
        aria-hidden="true"
        className={`absolute top-[12%] z-0 h-[9%] w-[10%] opacity-55 ${
          isRtl ? "right-[5%]" : "left-[5%]"
        }`}
      >
        <span className={`absolute top-0 h-px w-full bg-primary ${isRtl ? "right-0" : "left-0"}`} />
        <span className={`absolute top-0 h-full w-px bg-primary ${isRtl ? "right-0" : "left-0"}`} />
      </div>

      <div
        aria-hidden="true"
        className={`absolute top-[23%] z-0 h-[7%] w-[8%] opacity-40 ${
          isRtl ? "left-[3%]" : "right-[3%]"
        }`}
      >
        <span className={`absolute top-0 h-px w-full bg-primary ${isRtl ? "left-0" : "right-0"}`} />
        <span className={`absolute top-0 h-full w-px bg-primary ${isRtl ? "left-0" : "right-0"}`} />
      </div>

      <div
        aria-hidden="true"
        className={`absolute bottom-[16%] z-0 h-[8%] w-[12%] opacity-45 ${
          isRtl ? "right-[4%]" : "left-[4%]"
        }`}
      >
        <span
          className={`absolute bottom-0 h-px w-full bg-primary ${isRtl ? "right-0" : "left-0"}`}
        />
        <span
          className={`absolute bottom-0 h-full w-px bg-primary ${isRtl ? "right-0" : "left-0"}`}
        />
      </div>

      <ul
        dir="ltr"
        className={`absolute top-[40%] z-0 flex w-[47%] flex-col gap-1 ${
          isRtl ? "left-[1%]" : "right-[1%]"
        }`}
      >
        {messages.map((message, index) => (
          <li
            key={`${message}-${index}`}
            className={`hero-circuit-message flex min-h-7 items-center gap-2 ${
              isRtl ? "flex-row-reverse" : ""
            }`}
            style={{
              animationDelay: `-${index * 1.35}s`,
              animationDuration: `${7.5 + (index % 3) * 1.4}s`,
            }}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 100 32"
              className={`h-auto shrink-0 overflow-visible text-primary opacity-55 ${
                isRtl ? "-scale-x-100" : ""
              }`}
              style={{ width: `${52 - (index % 3) * 6}%` }}
            >
              <path
                d="M2 6 H45 L59 20 H87"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
              <circle cx="93" cy="20" r="2" fill="currentColor" />
            </svg>
            <span
              dir={isRtl ? "rtl" : "ltr"}
              className={`min-w-0 whitespace-nowrap font-mono text-[0.54rem] leading-snug tracking-[0.08em] uppercase text-muted-foreground sm:text-[0.6rem] ${
                isRtl ? "text-right font-sans tracking-normal normal-case" : ""
              }`}
            >
              {message}
            </span>
          </li>
        ))}
      </ul>

      <img
        src={resolveApiResourceUrl(imageUrl)}
        width={1450}
        height={1086}
        alt={imageAlt}
        fetchPriority="high"
        decoding="async"
        sizes="(min-width: 1024px) 46vw, 92vw"
        className="absolute inset-x-0 bottom-[2%] z-10 mx-auto block h-auto w-[94%] object-contain object-bottom"
        style={{
          maskImage: portraitFade,
          WebkitMaskImage: portraitFade,
        }}
      />
    </div>
  );
}
