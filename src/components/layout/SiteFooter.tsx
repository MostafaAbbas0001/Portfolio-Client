import type { CSSProperties } from "react";
import { resolveApiResourceUrl } from "@/api/siteDataApi";
import { SiteLogo } from "@/components/layout/SiteHeader";
import { ThemeSegmented } from "@/components/layout/ThemeSwitch";
import { SplitHtml } from "@/components/motion/SplitWords";
import { PageLink } from "@/components/ui/LocalLink";
import { ArrowIcon } from "@/components/ui/Icons";
import { isPagePath } from "@/lib/page-routes";
import { useLocale } from "@/hooks/use-locale";
import { getGlobalContent } from "@/lib/siteData";
import type {
  FooterGlobalContent,
  GlobalResponse,
  HeaderGlobalContent,
  SiteGlobalContent,
} from "@/types/siteData";

export function SiteFooter({ globalData }: { globalData: GlobalResponse }) {
  const { t } = useLocale();
  const site = getGlobalContent<SiteGlobalContent>(globalData, "site");
  const header = getGlobalContent<HeaderGlobalContent>(globalData, "header");
  const footer = getGlobalContent<FooterGlobalContent>(globalData, "footer");

  if (!site || !header || !footer) return null;

  return (
    <footer className="relative mt-12 overflow-hidden border-t border-border md:mt-16">
      <div className="stage-light" aria-hidden="true" />

      <div className="shell relative pt-16 pb-10 md:pt-20">
        <p className="kicker" data-reveal="" suppressHydrationWarning>
          {footer.availability}
        </p>
        <SplitHtml
          as="p"
          className="mt-6 max-w-[16ch] title-1"
          html={footer.headline}
          reveal="view"
        />

        <div
          className="mt-10 flex flex-wrap items-center gap-4"
          data-reveal=""
          suppressHydrationWarning
          style={{ "--d": 2 } as CSSProperties}
        >
          <a
            href={`mailto:${site.contactEmail}`}
            className="btn btn-primary min-h-14 px-7 text-base"
            data-magnetic=""
          >
            {footer.emailCta}
            <ArrowIcon />
          </a>
          <p className="meta ms-1">
            {footer.replyText}: <span className="text-foreground">{footer.replyHighlight}</span>
          </p>
        </div>

        <a
          href={`mailto:${site.contactEmail}`}
          dir="ltr"
          className="mt-10 inline-block font-display text-[clamp(1.6rem,1rem+3vw,3.5rem)] font-semibold tracking-tight text-muted-foreground transition-colors duration-300 hover:text-foreground"
          data-reveal=""
          suppressHydrationWarning
          style={{ "--d": 3 } as CSSProperties}
        >
          {site.contactEmail}
        </a>

        <div className="mt-14 grid gap-12 border-t border-border pt-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <PageLink
              to="/"
              aria-label={header.homeAriaLabel}
              className="inline-block rounded-full transition-opacity duration-200 hover:opacity-80"
            >
              <SiteLogo header={header} />
            </PageLink>
            <p className="meta mt-4 max-w-sm">
              {footer.copyright.replace("{year}", String(new Date().getFullYear()))}
            </p>
          </div>

          <div className="md:col-span-3">
            <h2 className="text-sm font-medium text-foreground">{footer.focusLabel}</h2>
            <ul className="mt-4 flex flex-col gap-2.5 text-[0.9375rem] text-muted-foreground">
              {footer.focusAreas.map((area) => (
                <li key={area}>{area}</li>
              ))}
            </ul>
          </div>

          <nav aria-label={t.footerNav} className="md:col-span-4">
            <h2 className="text-sm font-medium text-foreground">{footer.navigationLabel}</h2>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 text-[0.9375rem]">
              {header.navItems.map((item) =>
                isPagePath(item.to) ? (
                  <li key={item.to}>
                    <PageLink
                      to={item.to}
                      className="text-muted-foreground transition-colors duration-200 hover:text-foreground"
                    >
                      {item.label}
                    </PageLink>
                  </li>
                ) : null,
              )}
              {header.externalLinks.map((link) => {
                const href = resolveApiResourceUrl(link.href);
                return (
                  <li key={link.href}>
                    <a
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer me"
                      className="text-muted-foreground transition-colors duration-200 hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8">
          <ThemeSegmented />
          <a href="#main" className="meta link">
            {footer.backToTop}
          </a>
        </div>
      </div>
    </footer>
  );
}
