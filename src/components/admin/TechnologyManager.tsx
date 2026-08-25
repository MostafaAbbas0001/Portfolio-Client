import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTechnology,
  deleteTechnology,
  resolveApiResourceUrl,
  updateTechnology,
} from "@/api/siteDataApi";
import { technologiesQuery } from "@/queries/siteDataQueries";
import type { TechItem } from "@/types/siteData";

const EMPTY_FORM = { key: "", name: "", imageUrl: "" };

export function TechnologyManager({ token }: { token: string }) {
  const queryClient = useQueryClient();
  const technologiesQueryResult = useQuery(technologiesQuery());
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<TechItem | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const selected = technologiesQueryResult.data?.find((item) => item.id === selectedId);
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (technologiesQueryResult.data ?? []).filter(
      (item) => !query || item.name.toLowerCase().includes(query) || item.key?.includes(query),
    );
  }, [search, technologiesQueryResult.data]);

  useEffect(() => {
    if (!selected) return;
    setForm({ key: selected.key ?? "", name: selected.name, imageUrl: selected.imageUrl ?? "" });
    setMessage(null);
    setError(null);
  }, [selected]);

  function startNew() {
    setSelectedId(null);
    setForm(EMPTY_FORM);
    setMessage(null);
    setError(null);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const input = { key: form.key, name: form.name, imageUrl: form.imageUrl || null };
      const result = selectedId
        ? await updateTechnology(token, selectedId, input)
        : await createTechnology(token, input);
      await queryClient.invalidateQueries({ queryKey: ["technologies"] });
      setSelectedId(result.id ?? null);
      setMessage(selectedId ? "Technology updated." : "Technology created.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save technology.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete?.id) return;
    setSaving(true);
    setError(null);
    try {
      await deleteTechnology(token, pendingDelete.id);
      await queryClient.invalidateQueries({ queryKey: ["technologies"] });
      if (selectedId === pendingDelete.id) startNew();
      setPendingDelete(null);
      setMessage("Technology deleted.");
    } catch (caught) {
      setPendingDelete(null);
      setError(caught instanceof Error ? caught.message : "Could not delete technology.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid min-h-[640px] lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="border-b border-border bg-muted/25 p-4 lg:border-r lg:border-b-0 lg:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="label-mono">Catalog</p>
            <p className="mt-1 text-sm font-semibold">
              {technologiesQueryResult.data?.length ?? 0} technologies
            </p>
          </div>
          <button
            type="button"
            onClick={startNew}
            className="min-h-9 bg-foreground px-3 text-sm font-semibold text-background hover:bg-primary"
          >
            Add new
          </button>
        </div>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search catalog"
          className="mt-5 min-h-10 w-full border border-border bg-background px-3 text-sm outline-none focus:border-primary"
        />
        <div className="mt-4 max-h-[520px] overflow-y-auto border border-border bg-background">
          {filtered.map((technology) => (
            <button
              key={technology.id ?? technology.key}
              type="button"
              onClick={() => setSelectedId(technology.id ?? null)}
              className={`flex min-h-14 w-full items-center gap-3 border-b border-border px-3 text-left last:border-b-0 ${
                selectedId === technology.id ? "bg-foreground text-background" : "hover:bg-muted"
              }`}
            >
              <TechnologyImage technology={technology} size="small" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{technology.name}</span>
                <span className="block truncate font-mono text-[10px] opacity-60">
                  {technology.key}
                </span>
              </span>
            </button>
          ))}
        </div>
      </aside>

      <section className="p-5 md:p-7">
        <div className="flex items-start justify-between gap-5 border-b border-border pb-6">
          <div className="flex items-center gap-4">
            <TechnologyImage
              technology={{ name: form.name || "Technology", imageUrl: form.imageUrl }}
              size="large"
            />
            <div>
              <p className="label-mono">{selectedId ? "Edit technology" : "New technology"}</p>
              <h2 className="mt-2 text-2xl font-semibold">{form.name || "Catalog entry"}</h2>
            </div>
          </div>
          {selected && (
            <button
              type="button"
              onClick={() => setPendingDelete(selected)}
              className="text-sm font-semibold text-destructive"
            >
              Delete
            </button>
          )}
        </div>

        <form onSubmit={save} className="mt-7 grid max-w-2xl gap-5">
          <Field label="Name">
            <input
              required
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="min-h-11 w-full border border-border px-3 outline-none focus:border-primary"
            />
          </Field>
          <Field label="Key" hint="Lowercase letters, numbers, and hyphens. Used by content JSON.">
            <input
              required
              value={form.key}
              onChange={(event) => setForm((current) => ({ ...current, key: event.target.value }))}
              placeholder="react-native"
              className="min-h-11 w-full border border-border px-3 font-mono text-sm outline-none focus:border-primary"
            />
          </Field>
          <Field label="Image URL" hint="Use a path copied from the Media workspace.">
            <input
              value={form.imageUrl}
              onChange={(event) =>
                setForm((current) => ({ ...current, imageUrl: event.target.value }))
              }
              placeholder="/Uploads/images/example.png"
              className="min-h-11 w-full border border-border px-3 font-mono text-sm outline-none focus:border-primary"
            />
          </Field>
          {message && <Notice tone="success">{message}</Notice>}
          {error && <Notice tone="error">{error}</Notice>}
          <div className="flex justify-end border-t border-border pt-5">
            <button
              type="submit"
              disabled={saving}
              className="min-h-11 bg-foreground px-5 text-sm font-semibold text-background hover:bg-primary disabled:opacity-50"
            >
              {saving ? "Saving..." : selectedId ? "Save technology" : "Create technology"}
            </button>
          </div>
        </form>
      </section>

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/35 p-4 backdrop-blur-[2px]">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-technology-title"
            className="w-full max-w-md border border-border bg-background p-6 shadow-[0_24px_80px_rgba(15,23,42,0.2)]"
          >
            <p className="label-mono text-destructive">Delete technology</p>
            <h2 id="delete-technology-title" className="mt-3 text-2xl font-semibold">
              Remove {pendingDelete.name}?
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Deletion is blocked when this key is still used by any page or global content.
            </p>
            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                disabled={saving}
                autoFocus
                className="min-h-11 border border-border px-5 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={saving}
                className="min-h-11 bg-destructive px-5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving ? "Deleting..." : "Delete permanently"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function TechnologyImage({ technology, size }: { technology: TechItem; size: "small" | "large" }) {
  const dimension = size === "small" ? "size-9" : "size-16";
  return (
    <span
      className={`flex ${dimension} shrink-0 items-center justify-center border border-border bg-background`}
    >
      {technology.imageUrl ? (
        <img
          src={resolveApiResourceUrl(technology.imageUrl)}
          alt=""
          className="h-[70%] w-[70%] object-contain"
        />
      ) : (
        <span className="font-mono text-xs text-primary">{technology.name.slice(0, 2)}</span>
      )}
    </span>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      {children}
      {hint && <span className="text-xs font-normal text-muted-foreground">{hint}</span>}
    </label>
  );
}

function Notice({ tone, children }: { tone: "success" | "error"; children: React.ReactNode }) {
  return (
    <p
      role="status"
      className={`border px-3 py-2 text-sm ${
        tone === "error"
          ? "border-destructive/30 bg-destructive/5 text-destructive"
          : "border-primary/30 bg-primary/5 text-primary"
      }`}
    >
      {children}
    </p>
  );
}
