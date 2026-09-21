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

  const technologyGroups = technologies.groups.map((group) => ({
    ...group,
    items: resolveTechnologyReferences(
      technologyCatalog,
      group.technologyKeys,
      group.technologies ?? group.items,
    ),
  }));

  return (
    <section className="shell py-14 md:py-24">
      <SectionLabel>{about.label}</SectionLabel>
      <TrustedHtml as="h1" className="mt-6 display-lg" html={about.headline} />

      <div className="mt-14 max-w-4xl">
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

      <div className="mt-16 border-b border-border py-6 md:mt-24">
        <h2 className="label-mono">{technologies.label}</h2>

        <div className="mt-6 flex flex-col">
          {technologyGroups.map((group) => (
            <section
              key={group.label}
              className="grid min-w-0 gap-4 border-t border-border py-5 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-8 lg:grid-cols-[14rem_minmax(0,1fr)]"
            >
              <h3 className="text-sm font-medium">{group.label}</h3>

              <ul className="flex min-w-0 flex-wrap gap-x-8 gap-y-3">
                {group.items.map((technology) => (
                  <li
                    key={technology.id ?? technology.key ?? technology.name}
                    className="flex min-w-0 items-center gap-2.5"
                  >
                    {technology.imageUrl ? (
                      <img
                        src={resolveApiResourceUrl(technology.imageUrl)}
                        width={24}
                        height={24}
                        alt={technology.alt ?? `${technology.name} logo`}
                        loading="lazy"
                        className="size-5 shrink-0 object-contain"
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="size-1.5 shrink-0 rounded-full bg-primary"
                      />
                    )}
                    <span className="min-w-0 truncate text-sm text-muted-foreground">
                      {technology.name}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
