import { createFileRoute, Link } from "@tanstack/react-router";
import { resolveApiResourceUrl } from "@/api/siteDataApi";
import { pageDataQuery } from "@/queries/siteDataQueries";
import { DEFAULT_LANGUAGE, getSection } from "@/lib/siteData";
import { pageMeta } from "@/lib/seo";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { TrustedHtml } from "@/components/ui/TrustedHtml";
import { useCurrentPageData } from "@/hooks/use-site-data";
import { resolveTechnologyReferences, useTechnologyCatalog } from "@/hooks/use-technologies";
import type { AboutPageContent, TechnologiesContent } from "@/types/siteData";

export const Route = createFileRoute("/about")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(pageDataQuery<AboutPageContent>(DEFAULT_LANGUAGE, "about")),
  head: ({ loaderData }) => {
    const seo = loaderData?.data.seoData;
    return pageMeta({
      title: seo?.title ?? "About",
      description: seo?.description ?? "",
      path: seo?.path ?? "/about",
      type: seo?.ogType,
    });
  },
  component: AboutPage,
});

function AboutPage() {
  const { data: aboutPage } = useCurrentPageData<AboutPageContent>("about");
  const about = aboutPage.data.content;
  const technologies = getSection<TechnologiesContent>(aboutPage, "technologies")?.content;
  const technologyCatalog = useTechnologyCatalog();

  if (!technologies) throw new Error("About page content is missing technologies.");

  return (
    <section className="shell py-14 md:py-24">
      <SectionLabel>{about.label}</SectionLabel>
      <TrustedHtml as="h1" className="mt-6 display-lg" html={about.headline} />

      <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <TrustedHtml as="p" className="lead" html={about.intro} />
          <div className="mt-8 flex flex-col gap-5 body-copy text-muted-foreground">
            {about.paragraphs.map((paragraph) => (
              <TrustedHtml key={paragraph} as="p" html={paragraph} />
            ))}
          </div>
          <p className="mt-9">
            <Link to="/experience" className="label-mono arrow-move text-foreground link-underline">
              {about.experienceLinkLabel} <span className="arrow">-&gt;</span>
            </Link>
          </p>
        </div>

        <div className="lg:col-span-5">
          <h2 className="label-mono">{technologies.label}</h2>
          <dl className="mt-6 flex flex-col">
            {technologies.groups.map((group) => (
              <div key={group.label} className="border-t border-border py-5">
                <dt className="text-sm">{group.label}</dt>
                <dd className="mt-3">
                  <ul className="grid grid-cols-2 gap-x-5 gap-y-3">
                    {resolveTechnologyReferences(
                      technologyCatalog,
                      group.technologyKeys,
                      group.technologies ?? group.items,
                    ).map((technology) => (
                      <li
                        key={technology.id ?? technology.key ?? technology.name}
                        className="mono-xs flex min-w-0 items-center gap-2.5 text-muted-foreground"
                      >
                        {technology.imageUrl ? (
                          <img
                            src={resolveApiResourceUrl(technology.imageUrl)}
                            width={28}
                            height={28}
                            alt={technology.alt ?? `${technology.name} logo`}
                            loading="lazy"
                            className="size-6 shrink-0 object-contain"
                          />
                        ) : null}
                        <span className="min-w-0">{technology.name}</span>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
