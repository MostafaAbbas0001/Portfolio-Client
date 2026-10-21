import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, type ReactNode } from "react";
import { getApiAssetUrl, getImageFiles } from "@/api/siteDataApi";
import { JsonEditor } from "@/components/admin/JsonEditor";
import { localizePath, type Locale } from "@/lib/locale";

const PAGE_PATHS: Record<string, string> = {
  home: "/",
  about: "/about",
  projects: "/projects",
  experience: "/experience",
  contact: "/contact",
};

const TITLE_RANGE = [30, 60] as const;
const DESCRIPTION_RANGE = [70, 160] as const;

type SeoFields = {
  title?: string;
  description?: string;
  ogImage?: string;
  ogImageAlt?: string;
  noindex?: boolean;
  [key: string]: unknown;
};

function parse(value: string): SeoFields | null {
  try {
    const parsed = JSON.parse(value || "{}") as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as SeoFields)
      : null;
  } catch {
    return null;
  }
}

function previewImage(src: string | undefined, fallback: string | undefined) {
  const value = src?.trim() || fallback;
  if (!value) return undefined;
  return /^https?:\/\//.test(value) ? value : getApiAssetUrl(value);
}

interface SeoEditorProps {
  value: string;
  onChange: (value: string) => void;
  pageKey: string;
  language: string;
  siteUrl?: string | undefined;
  siteName?: string | undefined;
  defaultImage?: string | undefined;
}

/**
 * Form for a page's seoData. Keys it doesn't know about are kept as they are,
 * and the raw JSON stays available under "Edit as JSON".
 */
export function SeoEditor({
  value,
  onChange,
  pageKey,
  language,
  siteUrl,
  siteName,
  defaultImage,
}: SeoEditorProps) {
  const [rawMode, setRawMode] = useState(false);
  const fields = useMemo(() => parse(value), [value]);
  const imagesQuery = useQuery({ queryKey: ["admin-images"], queryFn: getImageFiles });

  const locale: Locale = language === "ar" ? "ar" : "en";
  const url = `${(siteUrl ?? "").replace(/\/+$/, "")}${localizePath(PAGE_PATHS[pageKey] ?? "/", locale)}`;
  const dir = locale === "ar" ? "rtl" : "ltr";

  function update(patch: Partial<SeoFields>) {
    const next: SeoFields = { ...(fields ?? {}), ...patch };
    for (const key of Object.keys(patch)) {
      if (next[key] === "" || next[key] === false) delete next[key];
    }
    onChange(JSON.stringify(next, null, 2));
  }

  if (rawMode || !fields) {
    return (
      <div className="grid gap-3">
        {!fields && (
          <p className="border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            The SEO JSON is not valid. Fix it below to use the form again.
          </p>
        )}
        <JsonEditor label="SEO data" value={value} onChange={onChange} minHeight="min-h-52" />
        {fields && (
          <button
            type="button"
            onClick={() => setRawMode(false)}
            className="justify-self-start text-sm font-medium text-primary"
          >
            Back to the form
          </button>
        )}
      </div>
    );
  }

  const title = fields.title ?? "";
  const description = fields.description ?? "";
  const image = previewImage(fields.ogImage, defaultImage);

  return (
    <section className="border border-border bg-background" aria-labelledby="seo-editor-title">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border bg-muted/35 px-4 py-3">
        <div>
          <h2 id="seo-editor-title" className="text-sm font-semibold">
            Search &amp; sharing
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            What Google shows for this page and what appears when the link is shared.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRawMode(true)}
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          Edit as JSON
        </button>
      </div>

      <div className="grid gap-8 p-4 md:p-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,25rem)]">
        <div className="grid content-start gap-5">
          <Field
            id="seo-title"
            label="Page title"
            hint="Shown as the blue link in Google and as the tab title."
            count={title.length}
            range={TITLE_RANGE}
          >
            <input
              id="seo-title"
              aria-describedby="seo-title-hint"
              value={title}
              dir={dir}
              onChange={(event) => update({ title: event.target.value })}
              className="min-h-11 w-full border border-border bg-background px-3 outline-none focus:border-primary"
            />
          </Field>

          <Field
            id="seo-description"
            label="Description"
            hint="The summary under the title in search results and share cards."
            count={description.length}
            range={DESCRIPTION_RANGE}
          >
            <textarea
              id="seo-description"
              aria-describedby="seo-description-hint"
              value={description}
              dir={dir}
              rows={3}
              onChange={(event) => update({ description: event.target.value })}
              className="w-full resize-y border border-border bg-background px-3 py-2 leading-6 outline-none focus:border-primary"
            />
          </Field>

          <Field
            id="seo-image"
            label="Share image"
            hint="1200 × 630 px works on every network. Leave empty to use the site's default image."
          >
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,14rem)]">
              <input
                id="seo-image"
                aria-describedby="seo-image-hint"
                value={fields.ogImage ?? ""}
                placeholder="/Uploads/images/… or https://…"
                onChange={(event) => update({ ogImage: event.target.value })}
                className="min-h-11 w-full border border-border bg-background px-3 font-mono text-sm outline-none focus:border-primary"
              />
              <select
                value=""
                onChange={(event) =>
                  event.target.value && update({ ogImage: `/Uploads/images/${event.target.value}` })
                }
                className="min-h-11 w-full border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                aria-label="Choose an uploaded image"
              >
                <option value="">Choose from media…</option>
                {imagesQuery.data?.map((fileName) => (
                  <option key={fileName} value={fileName}>
                    {fileName}
                  </option>
                ))}
              </select>
            </div>
          </Field>

          <Field
            id="seo-image-alt"
            label="Share image description"
            hint="Read aloud by screen readers on social networks."
          >
            <input
              id="seo-image-alt"
              aria-describedby="seo-image-alt-hint"
              value={fields.ogImageAlt ?? ""}
              dir={dir}
              onChange={(event) => update({ ogImageAlt: event.target.value })}
              className="min-h-11 w-full border border-border bg-background px-3 outline-none focus:border-primary"
            />
          </Field>

          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={Boolean(fields.noindex)}
              onChange={(event) => update({ noindex: event.target.checked })}
              className="mt-0.5 size-4 accent-[var(--color-primary)]"
            />
            <span>
              <span className="font-medium">Hide this page from search engines</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Adds a noindex tag. Links on the page are still followed.
              </span>
            </span>
          </label>
        </div>

        <div className="grid content-start gap-5">
          <div>
            <p className="label-mono">Google result</p>
            <div className="mt-2 border border-border bg-white p-4 text-[#202124]" dir={dir}>
              <p className="truncate text-xs text-[#4d5156]">
                {siteName}{" "}
                <span className="text-[#70757a]">› {url.replace(/^https?:\/\//, "")}</span>
              </p>
              <p className="mt-1 line-clamp-1 text-lg leading-snug text-[#1a0dab]">
                {title || "Untitled page"}
              </p>
              <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#4d5156]">
                {description || "Add a description to control this text."}
              </p>
            </div>
          </div>

          <div>
            <p className="label-mono">Share card</p>
            <div
              className="mt-2 overflow-hidden border border-border bg-white text-[#1d2129]"
              dir={dir}
            >
              <div className="aspect-[1200/630] bg-[#eef0f3]">
                {image && (
                  <img src={image} alt="" className="h-full w-full object-cover" loading="lazy" />
                )}
              </div>
              <div className="border-t border-border p-3">
                <p className="truncate text-[11px] uppercase text-[#65676b]" dir="ltr">
                  {url.replace(/^https?:\/\//, "").split("/")[0]}
                </p>
                <p className="mt-0.5 line-clamp-2 text-sm font-semibold">
                  {title || "Untitled page"}
                </p>
                <p className="mt-0.5 line-clamp-1 text-xs text-[#65676b]">{description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  hint,
  count,
  range,
  children,
}: {
  id: string;
  label: string;
  hint: string;
  count?: number;
  range?: readonly [number, number];
  children: ReactNode;
}) {
  const outOfRange =
    range && count !== undefined && count > 0 && (count < range[0] || count > range[1]);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {range && count !== undefined && (
          <span
            className={`font-mono text-xs ${outOfRange ? "text-warn" : "text-muted-foreground"}`}
            aria-live="polite"
          >
            {count} / {range[0]}–{range[1]}
          </span>
        )}
      </div>
      <div className="mt-2">{children}</div>
      <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted-foreground">
        {hint}
      </p>
    </div>
  );
}
