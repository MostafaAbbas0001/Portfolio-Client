import { useEffect, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { updateGlobalData, updatePageData } from "@/api/siteDataApi";
import { JsonEditor } from "@/components/admin/JsonEditor";
import { globalDataQuery, pageDataQuery } from "@/queries/siteDataQueries";

const PAGE_OPTIONS = [
  { key: "home", label: "Home" },
  { key: "about", label: "About" },
  { key: "projects", label: "Projects" },
  { key: "experience", label: "Experience" },
  { key: "contact", label: "Contact" },
];

const LANGUAGE_OPTIONS = [
  { code: "en", label: "English" },
  { code: "ar", label: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629" },
];

type EditorMode = "pages" | "globals";

function formatJson(value: unknown) {
  return JSON.stringify(value ?? {}, null, 2);
}

function parseJson(value: string, label: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    throw new Error(`${label} contains invalid JSON.`);
  }
}

export function ContentEditor({ token }: { token: string }) {
  const [mode, setMode] = useState<EditorMode>("pages");
  const [language, setLanguage] = useState("en");

  return (
    <div>
      <div className="border-b border-border bg-muted/45 p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold">Editing source</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Pick the content scope and language before changing JSON.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <SegmentedControl label="Content type">
              {(["pages", "globals"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMode(value)}
                  className={`min-h-9 px-4 text-sm font-medium capitalize transition-colors ${
                    mode === value
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-background hover:text-foreground"
                  }`}
                >
                  {value}
                </button>
              ))}
            </SegmentedControl>

            <SegmentedControl label="Content language">
              {LANGUAGE_OPTIONS.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => setLanguage(option.code)}
                  className={`min-h-9 px-4 text-sm font-medium transition-colors ${
                    language === option.code
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-background hover:text-foreground"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </SegmentedControl>
          </div>
        </div>
      </div>

      {mode === "pages" ? (
        <PageEditor token={token} language={language} />
      ) : (
        <GlobalEditor token={token} language={language} />
      )}
    </div>
  );
}

function PageEditor({ token, language }: { token: string; language: string }) {
  const queryClient = useQueryClient();
  const [pageKey, setPageKey] = useState("home");
  const [content, setContent] = useState("");
  const [seoData, setSeoData] = useState("");
  const [sections, setSections] = useState<Record<number, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const pageQuery = useQuery(pageDataQuery(language, pageKey));

  useEffect(() => {
    if (!pageQuery.data) return;
    setContent(formatJson(pageQuery.data.data.content));
    setSeoData(formatJson(pageQuery.data.data.seoData));
    setSections(
      Object.fromEntries(
        pageQuery.data.data.sections.map((section) => [section.id, formatJson(section.content)]),
      ),
    );
    setMessage(null);
    setError(null);
  }, [pageQuery.data]);

  async function savePage() {
    if (!pageQuery.data) return;
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      await updatePageData(token, language, pageQuery.data.data.id, {
        content: parseJson(content, "Page content"),
        seoData: parseJson(seoData, "SEO data"),
        sections: pageQuery.data.data.sections.map((section) => ({
          id: section.id,
          content: parseJson(sections[section.id] ?? "{}", `Section ${section.key}`),
        })),
      });
      await queryClient.invalidateQueries({ queryKey: ["page-data", language, pageKey] });
      setMessage("Page and sections saved.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save this page.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <label className="w-full max-w-xs text-sm font-medium">
          Page
          <select
            value={pageKey}
            onChange={(event) => setPageKey(event.target.value)}
            className="mt-2 min-h-11 w-full border border-border bg-background px-3 outline-none transition-colors focus:border-primary"
          >
            {PAGE_OPTIONS.map((page) => (
              <option key={page.key} value={page.key}>
                {page.label}
              </option>
            ))}
          </select>
        </label>
        <SaveButton saving={saving} disabled={!pageQuery.data} onClick={savePage} />
      </div>

      {pageQuery.isLoading && <LoadingNotice>Loading page data...</LoadingNotice>}
      {pageQuery.isError && <Notice type="error">Could not load this page.</Notice>}

      {pageQuery.data && (
        <div className="mt-8 grid gap-8">
          <EditorSummary
            items={[
              ["Language", language.toUpperCase()],
              ["Page", pageKey],
              ["Sections", String(pageQuery.data.data.sections.length)],
            ]}
          />
          <JsonEditor
            label="Page content"
            description="The headline, description, labels, and links used at the top of this page."
            value={content}
            onChange={setContent}
          />
          <JsonEditor label="SEO data" value={seoData} onChange={setSeoData} minHeight="min-h-52" />

          {pageQuery.data.data.sections.map((section) => (
            <JsonEditor
              key={section.id}
              label={`Section: ${section.key}`}
              description={`Section ID ${section.id}`}
              value={sections[section.id] ?? ""}
              onChange={(value) => setSections((current) => ({ ...current, [section.id]: value }))}
            />
          ))}

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
            <div className="min-w-0">
              {message && <Notice type="success">{message}</Notice>}
              {error && <Notice type="error">{error}</Notice>}
            </div>
            <SaveButton saving={saving} disabled={!pageQuery.data} onClick={savePage} />
          </div>
        </div>
      )}
    </div>
  );
}

function GlobalEditor({ token, language }: { token: string; language: string }) {
  const queryClient = useQueryClient();
  const globalsQuery = useQuery(globalDataQuery(language));
  const [globalKey, setGlobalKey] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const selectedGlobal = globalsQuery.data?.data.find((item) => item.key === globalKey);

  useEffect(() => {
    const items = globalsQuery.data?.data;
    if (!items?.length) return;
    setGlobalKey((current) =>
      items.some((item) => item.key === current) ? current : (items[0]?.key ?? ""),
    );
  }, [globalsQuery.data]);

  useEffect(() => {
    if (!selectedGlobal) return;
    setContent(formatJson(selectedGlobal.content));
    setMessage(null);
    setError(null);
  }, [selectedGlobal]);

  async function saveGlobal() {
    if (!globalKey) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await updateGlobalData(token, language, globalKey, parseJson(content, "Global content"));
      await queryClient.invalidateQueries({ queryKey: ["global-data", language] });
      setMessage(`${globalKey} saved.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save global content.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <label className="w-full max-w-xs text-sm font-medium">
          Global area
          <select
            value={globalKey}
            onChange={(event) => setGlobalKey(event.target.value)}
            className="mt-2 min-h-11 w-full border border-border bg-background px-3 capitalize outline-none transition-colors focus:border-primary"
          >
            {globalsQuery.data?.data.map((item) => (
              <option key={item.id} value={item.key}>
                {item.key}
              </option>
            ))}
          </select>
        </label>
        <SaveButton saving={saving} disabled={!selectedGlobal} onClick={saveGlobal} />
      </div>

      {globalsQuery.isLoading && <LoadingNotice>Loading global data...</LoadingNotice>}
      {globalsQuery.isError && <Notice type="error">Could not load global data.</Notice>}
      {selectedGlobal && (
        <div className="mt-8 grid gap-8">
          <EditorSummary
            items={[
              ["Language", language.toUpperCase()],
              ["Global", selectedGlobal.key],
              ["Record ID", String(selectedGlobal.id)],
            ]}
          />
          <JsonEditor
            label={`${selectedGlobal.key} content`}
            description="Shared content used across every page in this language."
            value={content}
            onChange={setContent}
            minHeight="min-h-[34rem]"
          />
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
            <div className="min-w-0">
              {message && <Notice type="success">{message}</Notice>}
              {error && <Notice type="error">{error}</Notice>}
            </div>
            <SaveButton saving={saving} disabled={!selectedGlobal} onClick={saveGlobal} />
          </div>
        </div>
      )}
    </div>
  );
}

function SaveButton({
  saving,
  disabled,
  onClick,
}: {
  saving: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving || disabled}
      className="min-h-11 bg-foreground px-5 text-sm font-semibold text-background transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
    >
      {saving ? "Saving..." : "Save changes"}
    </button>
  );
}

function Notice({ type, children }: { type: "success" | "error"; children: ReactNode }) {
  return (
    <p
      className={`border px-3 py-2 text-sm ${
        type === "error"
          ? "border-destructive/30 bg-destructive/5 text-destructive"
          : "border-primary/30 bg-primary/5 text-primary"
      }`}
      role="status"
    >
      {children}
    </p>
  );
}

function LoadingNotice({ children }: { children: ReactNode }) {
  return <p className="mt-10 text-sm text-muted-foreground">{children}</p>;
}

function SegmentedControl({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border border-border bg-background p-1" aria-label={label}>
      {children}
    </div>
  );
}

function EditorSummary({ items }: { items: Array<[string, string]> }) {
  return (
    <dl className="grid border border-border bg-muted/35 sm:grid-cols-3">
      {items.map(([label, value]) => (
        <div
          key={label}
          className="border-b border-border px-4 py-3 last:border-b-0 sm:border-r sm:border-b-0 sm:last:border-r-0"
        >
          <dt className="label-mono">{label}</dt>
          <dd className="mt-1 truncate text-sm font-semibold capitalize">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
