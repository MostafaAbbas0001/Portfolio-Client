import { useEffect, useRef, useState } from "react";
import { resolveApiResourceUrl } from "@/api/siteDataApi";
import { useLanguage } from "@/hooks/use-language";
import type { ReactNode } from "react";

const portraitFade =
  "linear-gradient(to bottom, black 0%, black 88%, rgba(0,0,0,0.9) 94%, transparent 100%)";

interface HeroPortraitProps {
  imageUrl: string;
  imageAlt: string;
  messages: string[];
  overlay?: ReactNode;
}

export function HeroPortrait({ imageUrl, imageAlt, messages, overlay }: HeroPortraitProps) {
  const { direction } = useLanguage();
  const isRtl = direction === "rtl";
  const imageRef = useRef<HTMLImageElement>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [hasLoaderPlayed, setHasLoaderPlayed] = useState(false);
  const [renderStage, setRenderStage] = useState(0);
  const resolvedImageUrl = resolveApiResourceUrl(imageUrl);

  useEffect(() => {
    setIsImageLoaded(false);
    if (imageRef.current?.complete) setIsImageLoaded(true);
  }, [imageUrl]);

  useEffect(() => {
    setHasLoaderPlayed(false);
    setRenderStage(0);

    const stageTimers = [
      window.setTimeout(() => setRenderStage(1), 1250),
      window.setTimeout(() => setRenderStage(2), 2900),
      window.setTimeout(() => setRenderStage(3), 4300),
    ];
    const completionTimer = window.setTimeout(() => setHasLoaderPlayed(true), 5000);

    return () => {
      stageTimers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(completionTimer);
    };
  }, [imageUrl]);

  const shouldShowLoader = !isImageLoaded || !hasLoaderPlayed;
  const renderStages = isRtl
    ? ["ترميز المصدر", "معالجة البنية", "تحسين التفاصيل", "تحميل سنوات الخبرة"]
    : ["Encoding source", "Resolving structure", "Refining detail", "Loaded experience years"];

  return (
    <div className="relative isolate mx-auto aspect-[6/5] w-full max-w-[640px] bg-transparent">
      {overlay && (
        <div
          className={`pointer-events-none absolute top-[2%] z-20 scale-[0.78] sm:scale-90 lg:scale-100 ${
            isRtl ? "right-[2%] origin-top-right" : "left-[2%] origin-top-left"
          }`}
        >
          <div key={resolvedImageUrl} className="hero-experience-render">
            {overlay}
          </div>
        </div>
      )}

      <div
        aria-hidden="true"
        className="absolute inset-[7%] -z-10 bg-[radial-gradient(ellipse_at_50%_42%,rgba(18,103,243,0.12)_0%,rgba(18,103,243,0.055)_34%,rgba(18,103,243,0.018)_54%,transparent_74%)]"
      />

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
        aria-hidden={shouldShowLoader}
        className={`absolute top-[40%] z-0 flex w-[47%] flex-col gap-1 ${
          isRtl ? "left-[1%]" : "right-[1%]"
        }`}
      >
        {messages.map((message, index) => (
          <li
            key={`${message}-${index}`}
            className={`hero-circuit-message min-h-7 ${
              shouldShowLoader ? "" : "hero-circuit-message--visible"
            }`}
            style={{
              animationDelay: `${index * 280}ms`,
            }}
          >
            <div
              className={`hero-circuit-message__content flex items-center gap-2 ${
                isRtl ? "flex-row-reverse" : ""
              }`}
              style={{
                animationDelay: `-${index * 1.7}s`,
                animationDuration: `${8.5 + (index % 3) * 1.2}s`,
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
            </div>
          </li>
        ))}
      </ul>

      <div
        role="status"
        aria-label={`${renderStages[renderStage]}, portrait loading`}
        className={`hero-ai-loader absolute inset-x-0 bottom-[2%] z-10 h-[94%] overflow-hidden transition-opacity duration-500 ${
          shouldShowLoader ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{
          maskImage: portraitFade,
          WebkitMaskImage: portraitFade,
        }}
      >
        <img aria-hidden="true" src={resolvedImageUrl} alt="" className="hero-ai-loader__preview" />
        <img aria-hidden="true" src={resolvedImageUrl} alt="" className="hero-ai-loader__detail" />
        <span aria-hidden="true" className="hero-ai-loader__sampling" />

        <span className="hero-ai-loader__readout">
          <span className="hero-ai-loader__meta">
            <span>Portrait synthesis</span>
            <span>0{renderStage + 1} / 04</span>
          </span>
          <span className="hero-ai-loader__track" aria-hidden="true">
            <span />
          </span>
          <span className="hero-ai-loader__phase">{renderStages[renderStage]}</span>
        </span>
      </div>

      <img
        ref={imageRef}
        src={resolvedImageUrl}
        width={1450}
        height={1086}
        alt={imageAlt}
        fetchPriority="high"
        decoding="async"
        onLoad={() => setIsImageLoaded(true)}
        sizes="(min-width: 1024px) 46vw, 92vw"
        className={`absolute inset-x-0 bottom-[2%] z-10 mx-auto block h-auto w-[94%] object-contain object-bottom transition-opacity duration-700 ${
          shouldShowLoader ? "opacity-0" : "opacity-100"
        }`}
        style={{
          maskImage: portraitFade,
          WebkitMaskImage: portraitFade,
        }}
      />
    </div>
  );
}
