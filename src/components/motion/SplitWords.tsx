import { createElement, type CSSProperties, type ReactNode } from "react";
import { splitWordsHtml } from "@/lib/split-words";

type Tag = "h1" | "h2" | "h3" | "span" | "p";

/** Plain-text headline whose words rise into place on load. */
export function SplitWords({
  text,
  as = "span",
  className = "",
  startIndex = 0,
  id,
}: {
  text: string;
  as?: Tag;
  className?: string;
  startIndex?: number;
  id?: string;
}) {
  const words = text.split(/\s+/).filter(Boolean);
  const children: ReactNode[] = [];
  words.forEach((word, index) => {
    if (index > 0) children.push(" ");
    children.push(
      <span
        key={`${word}-${index}`}
        className="w"
        style={{ "--i": startIndex + index } as CSSProperties}
      >
        <span>{word}</span>
      </span>,
    );
  });
  return createElement(as, { className: `words ${className}`, ...(id ? { id } : {}) }, children);
}

/**
 * Trusted CMS headline HTML with the same word reveal. With reveal="view" the
 * words wait until the headline scrolls into view (for headlines below the fold).
 */
export function SplitHtml({
  html,
  as = "span",
  className = "",
  startIndex = 0,
  id,
  reveal = "load",
}: {
  html: string;
  as?: Tag;
  className?: string;
  startIndex?: number;
  id?: string;
  reveal?: "load" | "view";
}) {
  return createElement(as, {
    className: `words cms-heading ${reveal === "view" ? "words-view" : ""} ${className}`,
    ...(id ? { id } : {}),
    ...(reveal === "view" ? { "data-reveal": "", suppressHydrationWarning: true } : {}),
    dangerouslySetInnerHTML: { __html: splitWordsHtml(html, startIndex) },
  });
}
