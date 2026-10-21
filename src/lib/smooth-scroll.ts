import Lenis from "lenis";

let instance: Lenis | null = null;

/** The running smooth scroller, if any (none under reduced motion). */
export function getSmoothScroll() {
  return instance;
}

/**
 * Inertia scrolling for mouse wheels and trackpads; touch keeps the native
 * feel. Off when the visitor prefers reduced motion. Returns a cleanup.
 */
export function startSmoothScroll() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  instance = new Lenis({
    autoRaf: true,
    lerp: 0.085,
    // In-page links (skip link, back to top) glide too, clear of the fixed header.
    anchors: { offset: -96 },
  });
  return () => {
    instance?.destroy();
    instance = null;
  };
}

/** Drops any glide in progress so the router can set the scroll position itself. */
export function settleSmoothScroll() {
  instance?.scrollTo(window.scrollY, { immediate: true, force: true });
}
