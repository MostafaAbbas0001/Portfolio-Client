import { useQuery } from "@tanstack/react-query";
import { getApiAssetUrl, getImageFiles } from "@/api/siteDataApi";

type Json = Record<string, unknown>;

function parse(value: string): Json | null {
  try {
    const parsed = JSON.parse(value || "{}") as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Json) : null;
  } catch {
    return null;
  }
}

function preview(src: string) {
  if (!src) return undefined;
  return /^https?:\/\//.test(src) ? src : getApiAssetUrl(src);
}

/**
 * The site's default share image (what a link shows on LinkedIn, WhatsApp, X…
 * when the page has no image of its own). Edits "ogImage" and "ogImageAlt" in
 * the site JSON below it; upload the image in Media first.
 */
export function ShareImagePicker({
  value,
  onChange,
  language,
}: {
  value: string;
  onChange: (value: string) => void;
  language: string;
}) {
  const imagesQuery = useQuery({ queryKey: ["admin-images"], queryFn: getImageFiles });
  const fields = parse(value);
  if (!fields) return null;

  const image = typeof fields["ogImage"] === "string" ? fields["ogImage"] : "";
  const alt = typeof fields["ogImageAlt"] === "string" ? fields["ogImageAlt"] : "";
  const update = (patch: Json) => onChange(JSON.stringify({ ...fields, ...patch }, null, 2));
  const src = preview(image);

  return (
    <section className="border border-border bg-background" aria-labelledby="share-image-title">
      <div className="border-b border-border bg-muted/35 px-4 py-3">
        <h2 id="share-image-title" className="text-sm font-semibold">
          Default share image
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Shown when any page of the site is shared, unless that page sets its own. Use 1200 × 630
          px. Set it for each language.
        </p>
      </div>
      <div className="grid gap-6 p-4 md:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div className="grid content-start gap-4">
          <label className="grid gap-2 text-sm font-medium">
            Image
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,14rem)]">
              <input
                value={image}
                placeholder="/Uploads/images/…"
                onChange={(event) => update({ ogImage: event.target.value })}
                className="min-h-11 w-full border border-border bg-background px-3 font-mono text-sm font-normal outline-none focus:border-primary"
              />
              <select
                value=""
                onChange={(event) =>
                  event.target.value && update({ ogImage: `/Uploads/images/${event.target.value}` })
                }
                className="min-h-11 w-full border border-border bg-background px-3 text-sm font-normal outline-none focus:border-primary"
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
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Image description
            <input
              value={alt}
              dir={language === "ar" ? "rtl" : "ltr"}
              placeholder="e.g. Mostafa Abbas, Full-Stack Software Engineer"
              onChange={(event) => update({ ogImageAlt: event.target.value })}
              className="min-h-11 w-full border border-border bg-background px-3 font-normal outline-none focus:border-primary"
            />
          </label>
        </div>
        <div className="aspect-[1200/630] overflow-hidden border border-border bg-muted">
          {src ? (
            <img src={src} alt="" className="h-full w-full object-cover" />
          ) : (
            <p className="grid h-full place-items-center px-6 text-center text-sm text-muted-foreground">
              No default image. Shared links will show text only.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
