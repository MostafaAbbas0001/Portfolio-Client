import { Link } from "@tanstack/react-router";
import { resolveApiResourceUrl } from "@/api/siteDataApi";
import { TrustedHtml } from "@/components/ui/TrustedHtml";
import { getGlobalContent } from "@/lib/siteData";
import { useResolvedTechnologies } from "@/hooks/use-technologies";
import type {
  FooterGlobalContent,
  GlobalResponse,
  HeaderGlobalContent,
  SiteGlobalContent,
} from "@/types/siteData";

type KnownRoute = "/" | "/about" | "/projects" | "/experience" | "/contact";

export function SiteFooter({ globalData }: { globalData: GlobalResponse }) {
  const site = getGlobalContent<SiteGlobalContent>(globalData, "site");
  const header = getGlobalContent<HeaderGlobalContent>(globalData, "header");
  const footer = getGlobalContent<FooterGlobalContent>(globalData, "footer");
  const technologies = useResolvedTechnologies(
    footer?.heroTechnologyKeys,
    footer?.heroTechnologies,
  );

  if (!site || !header || !footer) return null;

  return (
    <footer className="mt-24 bg-footer text-background dark-grid">
      <div className="shell grid gap-12 py-16 md:py-24 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-6">
          <p className="label-mono flex items-center gap-2.5 text-background/60">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-primary" />
            {footer.availability}
          </p>
          <TrustedHtml as="p" className="mt-6 display-md text-background" html={footer.headline} />
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <a
              href={`mailto:${site.contactEmail}`}
              className="arrow-move inline-flex min-h-11 items-center rounded-[4px] border border-background/40 px-5 text-sm text-background transition-colors duration-[180ms] hover:bg-background hover:text-foreground"
            >
              {footer.emailCta} <span className="arrow ml-2">-&gt;</span>
            </a>
            <p className="mono-xs text-background/55">
              {footer.replyText} <span className="text-primary">{footer.replyHighlight}</span>
            </p>
          </div>
        </div>

        <div className="lg:col-span-3">
          <p className="label-mono text-background/45">{footer.focusLabel}</p>
          <ul className="mt-5 flex flex-col gap-2.5">
            {footer.focusAreas.map((focusArea) => (
              <li key={focusArea} className="flex items-center gap-2.5 text-sm text-background/75">
                <span aria-hidden="true" className="size-1 rounded-full bg-primary" />
                {focusArea}
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Footer" className="lg:col-span-3">
          <p className="label-mono text-background/45">{footer.navigationLabel}</p>
          <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-3 lg:grid-cols-2">
            {header.navItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to as KnownRoute}
                  className="text-sm text-background/75 transition-colors duration-[180ms] hover:text-primary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {header.externalLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={resolveApiResourceUrl(link.href)}
                  target={
                    resolveApiResourceUrl(link.href).startsWith("http") ? "_blank" : undefined
                  }
                  rel="noopener noreferrer me"
                  className="text-sm text-background/75 transition-colors duration-[180ms] hover:text-primary"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-background/12">
        <div className="shell grid gap-4 py-6 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:gap-10">
          <p className="label-mono text-background/45">
            {footer.copyright.replace("{year}", String(new Date().getFullYear()))}
          </p>
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 lg:justify-center">
            {technologies.map((tech) => (
              <li key={tech.name} className="mono-xs flex items-center gap-1.5 text-background/55">
                <span aria-hidden="true" className="size-1 rounded-full bg-primary" />
                {tech.name}
              </li>
            ))}
          </ul>
          <a
            href="#main"
            className="label-mono text-background/60 transition-colors duration-[180ms] hover:text-primary lg:justify-self-end"
          >
            {footer.backToTop}
          </a>
        </div>
      </div>
    </footer>
  );
}
