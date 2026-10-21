import type { ReactNode } from "react";

/** Top of an inner page: stage light and blueprint grid, clear of the floating header. */
export function PageHero({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate overflow-hidden" data-cursor-glow="">
      <div className="stage-light" aria-hidden="true" />
      <div className="blueprint" aria-hidden="true" />
      <div className="cursor-glow" aria-hidden="true" />
      <div className="shell pt-32 pb-10 md:pt-40 md:pb-14">{children}</div>
    </div>
  );
}
