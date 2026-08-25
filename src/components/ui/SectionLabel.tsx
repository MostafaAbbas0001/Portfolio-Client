interface SectionLabelProps {
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

export function SectionLabel({ children, dot = true, className = "" }: SectionLabelProps) {
  return (
    <p className={`label-mono flex items-center gap-2.5 ${className}`}>
      {dot && <span aria-hidden="true" className="size-1.5 shrink-0 bg-primary" />}
      {children}
    </p>
  );
}
