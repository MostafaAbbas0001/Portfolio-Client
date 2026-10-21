import { createFileRoute } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { SplitHtml } from "@/components/motion/SplitWords";
import { PageHero } from "@/components/site/PageHero";
import { ArrowIcon, ExternalIcon } from "@/components/ui/Icons";
import { CmsLink } from "@/components/ui/LocalLink";
import { TrustedHtml } from "@/components/ui/TrustedHtml";
import { useGlobalData, usePageData } from "@/hooks/use-site-data";
import { navLabel, requireSite } from "@/lib/content";
import { localeFromParam } from "@/lib/locale";
import {
  breadcrumbNode,
  buildHead,
  createPageSeo,
  pageUrl,
  personId,
  stripHtml,
  webPageNode,
} from "@/lib/seo";
import { getGlobalContent, getSection } from "@/lib/siteData";
import { getUiStrings } from "@/lib/ui-strings";
import { useUiStrings } from "@/hooks/use-ui-strings";
import { globalDataQuery, pageDataQuery } from "@/queries/siteDataQueries";
import type {
  ContactLinksContent,
  ContactPageContent,
  FooterGlobalContent,
} from "@/types/siteData";

export const Route = createFileRoute("/{-$locale}/contact")({
  loader: async ({ context: { queryClient }, params }) => {
    const locale = localeFromParam(params.locale);
    const [page, global] = await Promise.all([
      queryClient.ensureQueryData(pageDataQuery<ContactPageContent>(locale, "contact")),
      queryClient.ensureQueryData(globalDataQuery(locale)),
    ]);
    const site = requireSite(global);
    const content = page.data.content;
    const seo = createPageSeo({
      site,
      locale,
      path: "/contact",
      seo: page.data.seoData,
      fallbackTitle: stripHtml(content.label),
      fallbackDescription: content.description ?? content.note,
    });

    return {
      locale,
      seo: {
        ...seo,
        jsonLd: [
          webPageNode(site, seo, "ContactPage", {
            about: { "@id": personId(site) },
            breadcrumb: { "@id": `${seo.url}#breadcrumb` },
          }),
          breadcrumbNode(seo.url, [
            { name: getUiStrings(locale, global).home, url: pageUrl(site, "/", locale) },
            { name: navLabel(global, "/contact", stripHtml(content.label)), url: seo.url },
          ]),
        ],
      },
    };
  },
  head: ({ loaderData }) => buildHead(loaderData?.seo),
  component: ContactPage,
});

function ContactPage() {
  const { locale } = Route.useLoaderData();
  const t = useUiStrings(locale);
  const { data: contactPage } = usePageData<ContactPageContent>("contact", locale);
  const { data: global } = useGlobalData(locale);
  const contact = contactPage.data.content;
  const site = requireSite(global);
  const footer = getGlobalContent<FooterGlobalContent>(global, "footer");
  const links = getSection<ContactLinksContent>(contactPage, "contact-links")?.content.items ?? [];

  return (
    <>
      <PageHero>
        {footer?.availability && (
          <p className="kicker fade-up" style={{ "--d": 0 } as CSSProperties}>
            {footer.availability}
          </p>
        )}
        <SplitHtml
          as="h1"
          className="mt-4 max-w-[16ch] title-1"
          html={contact.headline}
          startIndex={1}
        />
        {contact.description && (
          <TrustedHtml
            as="p"
            className="fade-up mt-8 lead"
            style={{ "--d": 4 } as CSSProperties}
            html={contact.description}
          />
        )}
      </PageHero>

      <section className="shell">
        <div
          data-reveal="stagger"
          suppressHydrationWarning
          className="hairline grid gap-14 pt-12 lg:grid-cols-12 lg:gap-0"
        >
          <div data-reveal="" suppressHydrationWarning className="lg:col-span-7 lg:pe-14">
            <h2 className="meta">{contact.emailLabel}</h2>
            <a
              href={`mailto:${site.contactEmail}`}
              dir="ltr"
              className="mt-4 block break-all font-display text-[clamp(1.5rem,0.8rem+2.3vw,2.75rem)] font-semibold leading-tight tracking-tight text-foreground transition-colors duration-300 hover:text-primary"
            >
              {site.contactEmail}
            </a>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href={`mailto:${site.contactEmail}`} className="btn btn-primary" data-magnetic="">
                {footer?.emailCta ?? t.emailMe}
                <ArrowIcon />
              </a>
            </div>
            {footer && (
              <p className="meta mt-6">
                {footer.replyText}: <span className="text-foreground">{footer.replyHighlight}</span>
              </p>
            )}
            <TrustedHtml
              as="p"
              className="mt-10 body-copy text-muted-foreground"
              html={contact.note}
            />
          </div>

          <div
            data-reveal=""
            suppressHydrationWarning
            style={{ "--d": 1 } as CSSProperties}
            className="lg:col-span-5 lg:border-s lg:border-border lg:ps-14"
          >
            <h2 className="meta">{contact.elsewhereLabel}</h2>
            <ul className="mt-5 border-b border-border">
              {links.map((item) => (
                <li key={item.href} className="ruled">
                  <CmsLink
                    href={item.href}
                    className="group flex min-h-16 items-center justify-between gap-4 py-5 transition-colors duration-300 hover:text-primary"
                  >
                    <span>{item.label}</span>
                    <span className="text-muted-foreground transition-[translate,color] duration-300 group-hover:translate-x-1 group-hover:text-primary rtl:group-hover:-translate-x-1">
                      {item.external ? <ExternalIcon /> : <ArrowIcon />}
                    </span>
                  </CmsLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
