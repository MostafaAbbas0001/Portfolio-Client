/** CMS paths ("/projects") mapped to their locale-aware route ids. */
export const PAGE_ROUTES = {
  "/": "/{-$locale}",
  "/about": "/{-$locale}/about",
  "/projects": "/{-$locale}/projects",
  "/experience": "/{-$locale}/experience",
  "/contact": "/{-$locale}/contact",
} as const;

export type PagePath = keyof typeof PAGE_ROUTES;

/** CMS links are stored without a locale ("/projects"); this resolves them. */
export function isPagePath(href: string): href is PagePath {
  return Object.prototype.hasOwnProperty.call(PAGE_ROUTES, href);
}
