import { createFileRoute, Link } from "@tanstack/react-router";
import { pageDataQuery } from "@/queries/siteDataQueries";
import { DEFAULT_LANGUAGE, getGlobalContent, getSection } from "@/lib/siteData";
import { pageMeta } from "@/lib/seo";
import { TrustedHtml } from "@/components/ui/TrustedHtml";
import { useCurrentGlobalData, useCurrentPageData } from "@/hooks/use-site-data";
import type { ContactLinksContent, ContactPageContent, SiteGlobalContent } from "@/types/siteData";

export const Route = createFileRoute("/contact")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      pageDataQuery<ContactPageContent>(DEFAULT_LANGUAGE, "contact"),
    ),
  head: ({ loaderData }) => {
    const seo = loaderData?.data.seoData;
    return pageMeta({
      title: seo?.title ?? "Contact",
      description: seo?.description ?? "",
      path: seo?.path ?? "/contact",
      type: seo?.ogType,
    });
  },
  component: ContactPage,
});

function ContactPage() {
  const { data: contactPage } = useCurrentPageData<ContactPageContent>("contact");
  const { data: globalData } = useCurrentGlobalData();
  const contact = contactPage.data.content;
  const site = getGlobalContent<SiteGlobalContent>(globalData, "site");
  const contactLinks = getSection<ContactLinksContent>(contactPage, "contact-links")?.content.items;

  if (!site || !contactLinks) throw new Error("Contact page content is incomplete.");

  return (
    <section className="shell py-12 md:py-20">
      <p className="label-mono">{contact.label}</p>
      <TrustedHtml as="h1" className="mt-5 display-lg" html={contact.headline} />
      {contact.description && (
        <TrustedHtml as="p" className="mt-6 lead" html={contact.description} />
      )}

      <div className="mt-12 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="label-mono">{contact.emailLabel}</p>
          <p className="mt-3 text-xl tracking-tight break-all sm:display-md">
            <a href={`mailto:${site.contactEmail}`} className="link-underline">
              {site.contactEmail}
            </a>
          </p>
          <TrustedHtml
            as="p"
            className="mt-8 body-copy text-muted-foreground"
            html={contact.note}
          />
        </div>
        <div className="lg:col-span-5">
          <p className="label-mono">{contact.elsewhereLabel}</p>
          <ul className="mt-4 flex flex-col">
            {contactLinks.map((item) => (
              <li key={item.href} className="border-t border-border py-4">
                {item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer me"
                    className="link-underline"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link to="/projects" className="link-underline">
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
