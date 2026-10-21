import { useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { resolveApiResourceUrl } from "@/api/siteDataApi";
import { ArrowIcon, MenuIcon } from "@/components/ui/Icons";
import { CmsLink, PageLink } from "@/components/ui/LocalLink";
import { ThemeMenu, ThemeSegmented } from "@/components/layout/ThemeSwitch";
import { isPagePath, type PagePath } from "@/lib/page-routes";
import { useLocale } from "@/hooks/use-locale";
import { getSmoothScroll } from "@/lib/smooth-scroll";
import { getGlobalContent } from "@/lib/siteData";
import type { GlobalResponse, HeaderGlobalContent } from "@/types/siteData";

/**
 * The logo uploaded in the CMS. On the dark theme it uses "logoDarkUrl" when
 * the CMS has one; otherwise the same image is recoloured (see LogoFilter in
 * __root.tsx) so its navy letters turn light.
 */
export function SiteLogo({ header }: { header: HeaderGlobalContent }) {
  const image = (src: string, props: Record<string, string>) => (
    <img
      src={resolveApiResourceUrl(src)}
      width={1280}
      height={1280}
      alt={header.logoAlt}
      fetchPriority="high"
      decoding="async"
      {...props}
    />
  );

  return (
    <span className="site-logo">
      {header.logoDarkUrl ? (
        <>
          {image(header.logoUrl, { "data-variant": "light" })}
          {image(header.logoDarkUrl, { "data-variant": "dark" })}
        </>
      ) : (
        image(header.logoUrl, { "data-recolor": "" })
      )}
    </span>
  );
}

/** A real link to the same page in the other language, so crawlers can follow it. */
function LanguageLink({
  className = "",
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const { alternate, alternatePath, t } = useLocale();
  return (
    <a
      href={alternatePath}
      hrefLang={alternate}
      lang={alternate}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
        event.preventDefault();
        onNavigate?.();
        void router.navigate({ href: alternatePath });
      }}
      className={className}
    >
      {alternate === "ar" ? t.languageArabic : t.languageEnglish}
    </a>
  );
}

export function SiteHeader({ globalData }: { globalData: GlobalResponse }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { t } = useLocale();
  const header = getGlobalContent<HeaderGlobalContent>(globalData, "header");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const nodes = panelRef.current.querySelectorAll<HTMLElement>("a, button");
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    getSmoothScroll()?.stop();
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      getSmoothScroll()?.start();
    };
  }, [open]);

  if (!header) return null;

  const navItems = header.navItems.filter((item) => isPagePath(item.to));
  const close = () => setOpen(false);
  const resume = header.externalLinks[header.externalLinks.length - 1];
  const social = header.externalLinks.slice(0, -1);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-5 md:pt-4">
        <div
          className="nav-bar glass-blur mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-4 rounded-full border px-3 ps-5 transition-[background-color,border-color,box-shadow] duration-500"
          {...(scrolled || open ? { "data-solid": "" } : {})}
        >
          <PageLink
            to="/"
            aria-label={header.homeAriaLabel}
            className="rounded-sm transition-opacity duration-200 hover:opacity-80"
          >
            <SiteLogo header={header} />
          </PageLink>

          <nav aria-label={t.primaryNav} className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <PageLink
                key={item.to}
                to={item.to as PagePath}
                className="rounded-full px-4 py-2 text-[0.9375rem] text-muted-foreground transition-colors duration-200 hover:text-foreground aria-[current=page]:bg-accent aria-[current=page]:text-primary"
              >
                {item.label}
              </PageLink>
            ))}
          </nav>

          <div className="hidden items-center gap-0.5 lg:flex">
            {social.map((link) => (
              <a
                key={link.href}
                href={resolveApiResourceUrl(link.href)}
                target="_blank"
                rel="noopener noreferrer me"
                className="rounded-full px-3 py-2 text-[0.9375rem] text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            {resume && (
              <a
                href={resolveApiResourceUrl(resume.href)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full px-3 py-2 text-[0.9375rem] text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                {resume.label}
              </a>
            )}
            <LanguageLink className="rounded-full px-3 py-2 text-[0.9375rem] text-muted-foreground transition-colors duration-200 hover:text-foreground" />
            <ThemeMenu />
            <PageLink to="/contact" className="btn btn-primary ms-2 min-h-11 px-5 text-sm">
              {t.letsTalk}
              <ArrowIcon />
            </PageLink>
          </div>

          <button
            ref={buttonRef}
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? header.closeMenuLabel : header.openMenuLabel}
            className="flex size-11 items-center justify-center rounded-full border border-line-strong text-foreground lg:hidden"
          >
            <MenuIcon open={open} />
          </button>
        </div>
      </header>

      {open && (
        <div
          id="mobile-menu"
          ref={panelRef}
          data-lenis-prevent=""
          className="nav-overlay fixed inset-0 z-40 overflow-y-auto pt-24 pb-12 backdrop-blur-xl lg:hidden"
        >
          <nav aria-label={t.menu} className="shell flex flex-col">
            {navItems.map((item, index) => (
              <PageLink
                key={item.to}
                to={item.to as PagePath}
                onClick={close}
                className="border-b border-border py-5 font-display text-4xl font-semibold tracking-tight text-muted-foreground aria-[current=page]:text-primary"
              >
                <span style={{ "--d": index } as CSSProperties} className="fade-up inline-block">
                  {item.label}
                </span>
              </PageLink>
            ))}
            <div className="mt-8 flex flex-wrap gap-2">
              {header.externalLinks.map((link) => (
                <CmsLink
                  key={link.href}
                  href={resolveApiResourceUrl(link.href)}
                  onClick={close}
                  className="btn btn-quiet min-h-11 px-4 text-sm"
                >
                  {link.label}
                </CmsLink>
              ))}
              <LanguageLink onNavigate={close} className="btn btn-quiet min-h-11 px-4 text-sm" />
            </div>
            <div className="mt-8">
              <ThemeSegmented showLabels />
            </div>
            <PageLink to="/contact" onClick={close} className="btn btn-primary mt-8 self-start">
              {t.letsTalk}
              <ArrowIcon />
            </PageLink>
          </nav>
        </div>
      )}
    </>
  );
}
