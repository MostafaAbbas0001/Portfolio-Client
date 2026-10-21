import { Link } from "@tanstack/react-router";
import type { MouseEventHandler, ReactNode } from "react";
import { useLocale } from "@/hooks/use-locale";
import { PAGE_ROUTES, isPagePath, type PagePath } from "@/lib/page-routes";

interface LinkProps {
  className?: string;
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  "aria-label"?: string;
  /** Drifts toward the cursor (handled by the motion script). */
  magnetic?: boolean;
}

function useLocaleParams() {
  const { param } = useLocale();
  return param ? { locale: param } : {};
}

export function PageLink({
  to,
  exact,
  magnetic,
  ...props
}: LinkProps & { to: PagePath; exact?: boolean }) {
  const params = useLocaleParams();
  return (
    <Link
      {...props}
      {...(magnetic ? { "data-magnetic": "" } : {})}
      to={PAGE_ROUTES[to]}
      params={params}
      activeOptions={{ exact: exact ?? to === "/" }}
    />
  );
}

export function ProjectLink({ slug, magnetic, ...props }: LinkProps & { slug: string }) {
  const params = useLocaleParams();
  return (
    <Link
      {...props}
      {...(magnetic ? { "data-magnetic": "" } : {})}
      to="/{-$locale}/projects/$slug"
      params={{ ...params, slug }}
    />
  );
}

/** Renders CMS hrefs: internal pages become router links, anything else a plain anchor. */
export function CmsLink({ href, magnetic, ...props }: LinkProps & { href: string }) {
  if (isPagePath(href)) return <PageLink to={href} magnetic={magnetic ?? false} {...props} />;
  const external = /^https?:\/\//.test(href);
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={props.className}
      onClick={props.onClick}
      aria-label={props["aria-label"]}
      {...(magnetic ? { "data-magnetic": "" } : {})}
    >
      {props.children}
    </a>
  );
}
