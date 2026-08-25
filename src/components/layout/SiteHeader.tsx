import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { resolveApiResourceUrl } from "@/api/siteDataApi";
import { useLanguage } from "@/hooks/use-language";
import { getGlobalContent } from "@/lib/siteData";
import type { GlobalResponse, HeaderGlobalContent } from "@/types/siteData";

type KnownRoute = "/" | "/about" | "/projects" | "/experience" | "/contact";

interface LanguageSwitcherProps {
  language: "en" | "ar";
  onSelect: (language: "en" | "ar") => void;
  variant?: "compact" | "mobile";
}

function LanguageSwitcher({ language, onSelect, variant = "compact" }: LanguageSwitcherProps) {
  const isMobile = variant === "mobile";
  const options = [
    { code: "en" as const, label: "English" },
    { code: "ar" as const, label: "العربية" },
  ];

  return (
    <div
      className={
        isMobile
          ? "rounded-[4px] border border-border bg-secondary p-1"
          : "flex items-center rounded-full border border-border bg-secondary/70 p-1"
      }
      aria-label="Language"
      role="group"
    >
      <div className={isMobile ? "grid grid-cols-2 gap-1" : "flex items-center gap-1"}>
        {options.map((option) => {
          const active = language === option.code;
          return (
            <button
              key={option.code}
              type="button"
              onClick={() => onSelect(option.code)}
              aria-pressed={active}
              className={
                isMobile
                  ? `min-h-11 rounded-[3px] px-4 transition-colors duration-[180ms] ${
                      option.code === "ar" ? "text-base" : "text-sm"
                    } ${
                      active
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:bg-background hover:text-foreground"
                    }`
                  : `min-h-8 rounded-full px-3 transition-colors duration-[180ms] ${
                      option.code === "ar" ? "text-sm" : "text-xs"
                    } ${
                      active
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-primary"
                    }`
              }
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SiteHeader({ globalData }: { globalData: GlobalResponse }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { language, setLanguage } = useLanguage();
  const header = getGlobalContent<HeaderGlobalContent>(globalData, "header");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const nodes = panelRef.current.querySelectorAll<HTMLElement>("a, button");
      if (nodes.length === 0) return;
      const first = nodes[0]!;
      const last = nodes[nodes.length - 1]!;

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!header) return null;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/92 backdrop-blur-sm">
        <div className="shell flex h-16 items-center justify-between gap-6 lg:h-24">
          <Link
            to="/"
            className="relative block h-10 w-32 shrink-0 overflow-hidden transition-opacity duration-[180ms] hover:opacity-80 lg:h-12 lg:w-40"
            aria-label={header.homeAriaLabel}
          >
            <img
              src={resolveApiResourceUrl(header.logoUrl)}
              width={1280}
              height={1280}
              alt={header.logoAlt}
              fetchPriority="high"
              decoding="async"
              className="absolute top-1/2 left-1/2 w-32 max-w-none -translate-x-1/2 -translate-y-1/2 object-contain lg:w-40"
            />
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-9 lg:flex">
            {header.navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to as KnownRoute}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "text-foreground [&_span]:opacity-100" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                className={`relative pb-1 transition-colors duration-[180ms] hover:text-primary ${
                  language === "ar" ? "text-base" : "text-sm"
                }`}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 -bottom-1 mx-auto size-1 rounded-full bg-primary opacity-0 transition-opacity duration-[180ms]"
                />
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-6 lg:flex">
            {header.externalLinks.map((link, index) => (
              <a
                key={link.href}
                href={resolveApiResourceUrl(link.href)}
                className={
                  index === header.externalLinks.length - 1
                    ? `rounded-[4px] border border-foreground px-4 py-2 transition-colors duration-[180ms] hover:bg-foreground hover:text-background ${
                        language === "ar" ? "text-base" : "text-sm"
                      }`
                    : `${
                        language === "ar" ? "text-base" : "text-sm"
                      } text-muted-foreground transition-colors duration-[180ms] hover:text-primary`
                }
                rel="noopener noreferrer me"
                target={resolveApiResourceUrl(link.href).startsWith("http") ? "_blank" : undefined}
              >
                {link.label}
              </a>
            ))}
            <LanguageSwitcher language={language} onSelect={setLanguage} />
          </div>

          <button
            ref={buttonRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? header.closeMenuLabel : header.openMenuLabel}
            className={`group flex size-10 shrink-0 items-center justify-center rounded-[4px] border transition-colors duration-[180ms] lg:hidden ${
              open
                ? "border-primary bg-accent text-primary"
                : "border-border bg-background text-foreground hover:border-primary hover:text-primary"
            }`}
          >
            <span aria-hidden="true" className="relative block size-5">
              <span
                className={`absolute left-1/2 top-1/2 block h-px w-[18px] -translate-x-1/2 bg-current transition-transform duration-[180ms] ${
                  open ? "rotate-45" : "-translate-y-[6px]"
                }`}
              />
              <span
                className={`absolute left-1/2 top-1/2 block h-px -translate-x-1/2 bg-current transition-all duration-[180ms] ${
                  open ? "w-0 opacity-0" : "w-3.5 opacity-100"
                }`}
              />
              <span
                className={`absolute left-1/2 top-1/2 block h-px w-[18px] -translate-x-1/2 bg-current transition-transform duration-[180ms] ${
                  open ? "-rotate-45" : "translate-y-[6px]"
                }`}
              />
            </span>
          </button>
        </div>
      </header>

      {open && (
        <div
          id="mobile-menu"
          ref={panelRef}
          className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t border-border bg-background lg:hidden"
        >
          <nav aria-label="Mobile" className="shell flex flex-col py-6">
            {header.navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to as KnownRoute}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "text-primary" }}
                className={`flex items-center justify-between border-b border-border py-4 tracking-tight ${
                  language === "ar" ? "text-[1.75rem]" : "text-2xl"
                }`}
              >
                {item.label}
                <span aria-hidden="true" className="mono-xs text-muted-light">
                  -&gt;
                </span>
              </Link>
            ))}
            <div className="mt-6 flex flex-col gap-4">
              {header.externalLinks.map((link) => (
                <a
                  key={link.href}
                  href={resolveApiResourceUrl(link.href)}
                  rel="noopener noreferrer me"
                  target={
                    resolveApiResourceUrl(link.href).startsWith("http") ? "_blank" : undefined
                  }
                  className="label-mono"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="mt-8">
              <p className="mb-3 label-mono">Language</p>
              <LanguageSwitcher
                language={language}
                variant="mobile"
                onSelect={(nextLanguage) => {
                  setLanguage(nextLanguage);
                  setOpen(false);
                }}
              />
            </div>
            <div className="hidden">
              <button
                type="button"
                onClick={() => {
                  setLanguage("en");
                  setOpen(false);
                }}
                aria-pressed={language === "en"}
                className={`min-h-11 border border-border text-sm ${
                  language === "en" ? "bg-foreground text-background" : "text-foreground"
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => {
                  setLanguage("ar");
                  setOpen(false);
                }}
                aria-pressed={language === "ar"}
                className={`min-h-11 border border-border text-sm ${
                  language === "ar" ? "bg-foreground text-background" : "text-foreground"
                }`}
              >
                العربية
              </button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
