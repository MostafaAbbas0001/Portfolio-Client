import { createElement, type HTMLAttributes } from "react";

type TrustedHtmlTag = "h1" | "h2" | "h3" | "p" | "span" | "div" | "li";

interface TrustedHtmlProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  as?: TrustedHtmlTag;
  html: string;
}

export function TrustedHtml({ as = "span", html, ...props }: TrustedHtmlProps) {
  return createElement(as, {
    ...props,
    dangerouslySetInnerHTML: { __html: html },
  });
}
