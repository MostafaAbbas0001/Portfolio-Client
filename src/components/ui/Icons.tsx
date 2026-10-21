interface IconProps {
  className?: string;
}

const base = {
  width: 16,
  height: 16,
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

/** Points in the reading direction; mirrors automatically in RTL. */
export function ArrowIcon({ className = "" }: IconProps) {
  return (
    <svg {...base} className={`shrink-0 rtl:-scale-x-100 ${className}`}>
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

export function ExternalIcon({ className = "" }: IconProps) {
  return (
    <svg {...base} className={`shrink-0 rtl:-scale-x-100 ${className}`}>
      <path d="M6 3.5H3.5v9h9V10M9 3.5h3.5V7M12.5 3.5 7 9" />
    </svg>
  );
}

export function CheckIcon({ className = "" }: IconProps) {
  return (
    <svg {...base} className={`shrink-0 ${className}`}>
      <path d="M3 8.5 6.5 12 13 4.5" />
    </svg>
  );
}

export function SunIcon({ className = "" }: IconProps) {
  return (
    <svg {...base} className={`shrink-0 ${className}`}>
      <circle cx="8" cy="8" r="2.75" />
      <path d="M8 1.5v1.25M8 13.25v1.25M1.5 8h1.25M13.25 8h1.25M3.4 3.4l.9.9M11.7 11.7l.9.9M3.4 12.6l.9-.9M11.7 4.3l.9-.9" />
    </svg>
  );
}

export function MoonIcon({ className = "" }: IconProps) {
  return (
    <svg {...base} className={`shrink-0 ${className}`}>
      <path d="M13.5 9.6A5.75 5.75 0 0 1 6.4 2.5a5.75 5.75 0 1 0 7.1 7.1Z" />
    </svg>
  );
}

export function MonitorIcon({ className = "" }: IconProps) {
  return (
    <svg {...base} className={`shrink-0 ${className}`}>
      <rect x="1.75" y="2.5" width="12.5" height="8.5" rx="1.5" />
      <path d="M5.5 14h5M8 11v3" />
    </svg>
  );
}

export function MenuIcon({ open, className = "" }: IconProps & { open: boolean }) {
  return (
    <svg {...base} width={20} height={20} viewBox="0 0 20 20" className={`shrink-0 ${className}`}>
      {open ? <path d="M5 5l10 10M15 5 5 15" /> : <path d="M3.5 6.5h13M3.5 13.5h13" />}
    </svg>
  );
}
