interface JsonEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
  minHeight?: string;
}

export function JsonEditor({
  label,
  value,
  onChange,
  description,
  minHeight = "min-h-72",
}: JsonEditorProps) {
  const lineCount = value ? value.split("\n").length : 1;

  return (
    <label className="block overflow-hidden border border-border bg-background">
      <span className="flex flex-wrap items-start justify-between gap-3 border-b border-border bg-muted/35 px-4 py-3">
        <span className="min-w-0">
          <span className="block text-sm font-semibold">{label}</span>
          {description && (
            <span className="mt-1 block text-xs text-muted-foreground">{description}</span>
          )}
        </span>
        <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          {lineCount} lines
        </span>
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        dir="auto"
        spellCheck={false}
        className={`w-full resize-y border-0 bg-[#fbfbfc] p-4 font-mono text-[13px] leading-6 outline-none transition-colors focus:bg-background ${minHeight}`}
      />
    </label>
  );
}
