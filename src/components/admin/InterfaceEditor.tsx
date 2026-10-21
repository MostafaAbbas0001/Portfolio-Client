type TextFields = { [key: string]: string | TextFields };

/** Each translated message is plain text; templates retain their named placeholders. */
export function InterfaceEditor({
  value,
  onChange,
  language,
}: {
  value: string;
  onChange: (value: string) => void;
  language: string;
}) {
  let fields: TextFields;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    fields = parsed as TextFields;
  } catch {
    return null;
  }

  function update(path: string[], value: string) {
    const next = structuredClone(fields);
    let parent = next;
    for (const key of path.slice(0, -1)) parent = parent[key] as TextFields;
    parent[path[path.length - 1]!] = value;
    onChange(JSON.stringify(next, null, 2));
  }

  function render(items: TextFields, path: string[] = []) {
    return Object.entries(items).map(([key, value]) => {
      const nextPath = [...path, key];
      const label = key.replace(/([a-z])([A-Z])/g, "$1 $2");
      if (typeof value === "string") {
        return (
          <label key={key} className="grid content-start gap-2 text-sm font-medium">
            <span className="capitalize">{label}</span>
            <textarea
              rows={value.length > 90 ? 3 : 2}
              dir={language === "ar" ? "rtl" : "ltr"}
              value={value}
              onChange={(event) => update(nextPath, event.target.value)}
              className="min-h-11 w-full border border-border bg-background px-3 py-2 font-normal focus:border-primary"
            />
          </label>
        );
      }
      if (!value || typeof value !== "object" || Array.isArray(value)) return null;
      return (
        <fieldset
          key={key}
          className="grid gap-4 border border-border p-4 sm:col-span-2 sm:grid-cols-2"
        >
          <legend className="px-2 text-sm font-semibold capitalize">{label} — plural forms</legend>
          {render(value, nextPath)}
        </fieldset>
      );
    });
  }

  return (
    <section className="grid gap-5">
      <div>
        <h2 className="text-lg font-semibold">Interface text</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Buttons, accessibility labels, status messages, error pages, and experience wording. Keep
          placeholders such as {"{count}"}, {"{ms}"}, and {"{years}"} in messages that use them.
          Plural forms are chosen automatically for each language.
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">{render(fields)}</div>
    </section>
  );
}
