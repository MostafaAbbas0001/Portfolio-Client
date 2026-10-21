import { createFileRoute } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { SplitHtml } from "@/components/motion/SplitWords";
import { PageHero } from "@/components/site/PageHero";
import { SectionIntro } from "@/components/site/SectionIntro";
import { TechList } from "@/components/site/TechList";
import { ArrowIcon } from "@/components/ui/Icons";
import { PageLink } from "@/components/ui/LocalLink";
import { TrustedHtml } from "@/components/ui/TrustedHtml";
import { usePageData } from "@/hooks/use-site-data";
import { resolveTechnologyReferences, useTechnologyCatalog } from "@/hooks/use-technologies";
import { currentRole, experienceOf, navLabel, requireSite } from "@/lib/content";
import { localeFromParam } from "@/lib/locale";
import {
  breadcrumbNode,
  buildHead,
  createPageSeo,
  pageUrl,
  personId,
  personNode,
  stripHtml,
  webPageNode,
} from "@/lib/seo";
import { getSection } from "@/lib/siteData";
import { getUiStrings } from "@/lib/ui-strings";
import { useUiStrings } from "@/hooks/use-ui-strings";
import { globalDataQuery, pageDataQuery, technologiesQuery } from "@/queries/siteDataQueries";
import type {
  AboutPageContent,
  BasicPageContent,
  HomePageContent,
  TechnologiesContent,
} from "@/types/siteData";

export const Route = createFileRoute("/{-$locale}/about")({
  loader: async ({ context: { queryClient }, params }) => {
    const locale = localeFromParam(params.locale);
    const [about, home, experience, global, catalog] = await Promise.all([
      queryClient.ensureQueryData(pageDataQuery<AboutPageContent>(locale, "about")),
      queryClient.ensureQueryData(pageDataQuery<HomePageContent>(locale, "home")),
      queryClient.ensureQueryData(pageDataQuery<BasicPageContent>(locale, "experience")),
      queryClient.ensureQueryData(globalDataQuery(locale)),
      queryClient.ensureQueryData(technologiesQuery()),
    ]);

    const site = requireSite(global);
    const content = about.data.content;
    const groups = getSection<TechnologiesContent>(about, "technologies")?.content.groups ?? [];
    const skills = groups.flatMap((group) =>
      resolveTechnologyReferences(catalog, group.technologyKeys, group.technologies ?? group.items),
    );
    const role = currentRole(experienceOf(experience));
    const seo = createPageSeo({
      site,
      locale,
      path: "/about",
      seo: about.data.seoData,
      fallbackTitle: stripHtml(content.label),
      fallbackDescription: content.intro,
    });

    return {
      locale,
      seo: {
        ...seo,
        jsonLd: [
          personNode(site, locale, {
            portrait: home.data.content.heroImageUrl,
            knowsAbout: [...new Set(skills.map((technology) => technology.name))],
            worksFor: role?.company,
            workLocation: role?.location,
          }),
          webPageNode(site, seo, "AboutPage", {
            mainEntity: { "@id": personId(site) },
            breadcrumb: { "@id": `${seo.url}#breadcrumb` },
          }),
          breadcrumbNode(seo.url, [
            { name: getUiStrings(locale, global).home, url: pageUrl(site, "/", locale) },
            { name: navLabel(global, "/about", stripHtml(content.label)), url: seo.url },
          ]),
        ],
      },
    };
  },
  head: ({ loaderData }) => buildHead(loaderData?.seo),
  component: AboutPage,
});

function AboutPage() {
  const { locale } = Route.useLoaderData();
  const t = useUiStrings(locale);
  const { data: aboutPage } = usePageData<AboutPageContent>("about", locale);
  const catalog = useTechnologyCatalog();
  const about = aboutPage.data.content;
  const technologies = getSection<TechnologiesContent>(aboutPage, "technologies")?.content;
  const groups = (technologies?.groups ?? []).map((group) =>
    resolveTechnologyReferences(catalog, group.technologyKeys, group.technologies ?? group.items),
  );

  return (
    <article>
      <PageHero>
        <div className="max-w-4xl">
          <p className="kicker fade-up" style={{ "--d": 0 } as CSSProperties}>
            {stripHtml(about.label)}
          </p>
          <SplitHtml as="h1" className="mt-4 title-1" html={about.headline} startIndex={1} />
          <TrustedHtml
            as="p"
            className="fade-up mt-8 lead text-foreground/90"
            style={{ "--d": 4 } as CSSProperties}
            html={about.intro}
          />
          <p className="fade-up mt-10" style={{ "--d": 5 } as CSSProperties}>
            <PageLink to="/experience" className="btn btn-quiet" magnetic>
              {about.experienceLinkLabel}
              <ArrowIcon />
            </PageLink>
          </p>
        </div>
      </PageHero>

      <section className="shell grid gap-x-10 gap-y-8 md:grid-cols-3">
        {about.paragraphs.map((paragraph, index) => (
          <TrustedHtml
            key={paragraph}
            as="p"
            data-reveal=""
            suppressHydrationWarning
            style={{ "--d": index } as CSSProperties}
            className="hairline pt-6 text-muted-foreground"
            html={paragraph}
          />
        ))}
      </section>

      {technologies && (
        <section aria-labelledby="technologies-title" className="shell mt-16 md:mt-20">
          <SectionIntro id="technologies-title" kicker={t.stack} titleHtml={technologies.label} />
          <div className="mt-10 border-b border-border">
            {technologies.groups.map((group, index) => (
              <section
                key={group.label}
                data-reveal=""
                suppressHydrationWarning
                className="hairline grid gap-5 py-8 md:grid-cols-12 md:gap-10"
              >
                <h3 className="title-3 md:col-span-4">{group.label}</h3>
                <TechList className="md:col-span-8 md:pt-1" items={groups[index] ?? []} />
              </section>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
