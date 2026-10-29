import { DEFAULT_DOCTOR_DESIGN } from "../design-preview/doctorJourney";

/**
 * Search hub tabs — single source of truth.
 *
 * The /search hub has one tab per content type. Each tab owns a clean,
 * SEO-friendly path segment so any CTA on the site can deep-link straight
 * into the right tab:
 *
 *   /search                  → Doctors (default)
 *   /search/doctors          → Doctors
 *   /search/specialities     → Specialty
 *   /search/health-packages  → Health Packages & Tests
 *   /search/treatments       → Treatments & Procedures
 *   /search/articles         → Articles & Blogs
 *
 * Never hand-write these URLs — always go through `buildSearchUrl()` so a
 * slug rename only ever happens here.
 */

export const SEARCH_TABS = [
  {
    id: "doctors",
    slug: "doctors",
    label: "Doctors",
    countKey: "doctors",
    metaTitle: "Find a Doctor",
    metaDescription:
      "Search Narayana Health's specialist doctors by name, speciality and city. Compare experience, ratings and book an appointment online.",
  },
  {
    id: "hospitals",
    slug: "hospitals",
    label: "Hospitals & Clinics",
    countKey: "hospitals",
    metaTitle: "Hospitals & Clinics",
    metaDescription: "Find Narayana Health hospitals and clinics near you.",
  },
  {
    id: "specialties",
    slug: "specialities",
    label: "Specialty",
    countKey: "specialties",
    metaTitle: "Specialities",
    metaDescription:
      "Explore Narayana Health's medical specialities — cardiology, oncology, neurology, orthopaedics and more — across our hospitals in India.",
  },
  {
    id: "treatments",
    slug: "treatments",
    label: "Treatments & Procedures",
    countKey: "treatments",
    metaTitle: "Treatments & Procedures",
    metaDescription:
      "Learn about treatments and procedures offered at Narayana Health — from robotic surgery to transplants — and find the right specialist.",
  },
  {
    id: "packages_tests",
    slug: "health-packages",
    label: "Health Packages & Tests",
    countKey: "packages_tests",
    metaTitle: "Health Packages & Lab Tests",
    metaDescription:
      "Compare preventive health check-up packages and lab tests at Narayana Health. Transparent pricing, quick reports and home sample collection.",
  },
  {
    id: "articles",
    slug: "articles",
    label: "Articles & Blogs",
    countKey: "articles",
    metaTitle: "Health Articles & Blogs",
    metaDescription:
      "Doctor-written health articles and blogs from Narayana Health on prevention, conditions, treatments and healthy living.",
  },
] as const;

export type SearchTab = (typeof SEARCH_TABS)[number];
export type SearchTabId = SearchTab["id"];
export type SearchTabSlug = SearchTab["slug"];

export const DEFAULT_SEARCH_TAB: SearchTab = SEARCH_TABS[0];

/** Base path of the search hub. */
export const SEARCH_BASE_PATH = "/search";

export function getSearchTabBySlug(slug: string | undefined | null): SearchTab | undefined {
  if (!slug) return undefined;
  const normalised = slug.toLowerCase();
  return SEARCH_TABS.find((t) => t.slug === normalised);
}

export function getSearchTabById(id: string | undefined | null): SearchTab | undefined {
  if (!id) return undefined;
  return SEARCH_TABS.find((t) => t.id === id);
}

/**
 * Resolves the active tab from the optional catch-all route segments.
 * Returns `null` for anything that isn't a known single tab slug so the
 * route can 404 instead of silently rendering the wrong tab.
 */
export function resolveSearchTabFromSegments(segments: string[] | undefined): SearchTab | null {
  if (!segments || segments.length === 0) return DEFAULT_SEARCH_TAB;
  if (segments.length > 1) return null;
  return getSearchTabBySlug(segments[0]) ?? null;
}

/** Reads the active tab from a pathname like `/search/specialities`. */
export function getSearchTabFromPathname(pathname: string | null): SearchTab {
  if (!pathname || !pathname.startsWith(SEARCH_BASE_PATH)) return DEFAULT_SEARCH_TAB;
  const segment = pathname.slice(SEARCH_BASE_PATH.length).split("/").filter(Boolean)[0];
  return getSearchTabBySlug(segment) ?? DEFAULT_SEARCH_TAB;
}

export function getSearchTabPath(tab: SearchTabId | SearchTab = DEFAULT_SEARCH_TAB): string {
  const resolved = typeof tab === "string" ? getSearchTabById(tab) ?? DEFAULT_SEARCH_TAB : tab;
  return `${SEARCH_BASE_PATH}/${resolved.slug}`;
}

export interface BuildSearchUrlOptions {
  /** Tab to open. Defaults to Doctors. */
  tab?: SearchTabId;
  /** Free-text query. */
  q?: string;
  /** City name as understood by the search page (e.g. "Bengaluru"). "All" is omitted. */
  location?: string;
}

/**
 * Builds a deep link into the search hub. Query values are URL-encoded via
 * URLSearchParams, so callers can pass raw user input safely.
 *
 * @example buildSearchUrl({ tab: "specialties", q: "cardiology" })
 *          // → "/search/specialities?q=cardiology"
 */
export function buildSearchUrl({ tab, q, location }: BuildSearchUrlOptions = {}): string {
  const params = new URLSearchParams();
  if (!tab || tab === "doctors") params.set("design", DEFAULT_DOCTOR_DESIGN);
  const trimmedQuery = q?.trim();
  if (trimmedQuery) params.set("q", trimmedQuery);
  if (location && location !== "All") params.set("location", location);
  const qs = params.toString();
  return `${getSearchTabPath(tab)}${qs ? `?${qs}` : ""}`;
}
