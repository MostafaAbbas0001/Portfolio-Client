import type { ReactNode } from "react";
import { SplitHtml } from "@/components/motion/SplitWords";

interface SectionIntroProps {
  id: string;
  /** Short context line above the title, e.g. "In production". */
  kicker: ReactNode;
  /** Trusted CMS HTML; a <span class="text-primary"> phrase is set in the brand blue. */
  titleHtml: string;
  note?: ReactNode;
  action?: ReactNode;
  as?: "h1" | "h2";
  /** Reveal the title on load (page titles above the fold) instead of on scroll. */
  split?: boolean;
}

export function SectionIntro({
  id,
  kicker,
  titleHtml,
  note,
  action,
  as = "h2",
  split = false,
}: SectionIntroProps) {
  const titleClass = `mt-4 ${as === "h1" ? "title-1" : "title-2"}`;
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-6">
      <div className="max-w-3xl">
        <p
          className={split ? "kicker fade-up" : "kicker"}
          {...(split ? {} : { "data-reveal": "", suppressHydrationWarning: true })}
        >
          {kicker}
        </p>
        <SplitHtml
          as={as}
          id={id}
          className={titleClass}
          html={titleHtml}
          startIndex={1}
          reveal={split ? "load" : "view"}
        />
        {note && (
          <div
            className="mt-5 lead"
            data-reveal=""
            suppressHydrationWarning
            style={{ "--d": 2 } as React.CSSProperties}
          >
            {note}
          </div>
        )}
      </div>
      {action && (
        <div data-reveal="" suppressHydrationWarning style={{ "--d": 2 } as React.CSSProperties}>
          {action}
        </div>
      )}
    </div>
  );
}
