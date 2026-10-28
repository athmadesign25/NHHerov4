import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SearchResultsView from "../SearchResultsView";
import {
  SEARCH_TABS,
  getSearchTabPath,
  resolveSearchTabFromSegments,
} from "@/features/search/searchTabs";

/**
 * Search hub route — /search and /search/[tab].
 *
 * Thin server wrapper: validates the tab slug (unknown → 404), emits
 * per-tab SEO metadata, and renders the shared client view. The view reads
 * the active tab from the pathname, so tab switches can update the URL via
 * history.pushState without remounting or refetching.
 */

interface SearchRouteProps {
  params: Promise<{ tab?: string[] }>;
}

export async function generateMetadata({ params }: SearchRouteProps): Promise<Metadata> {
  const { tab: segments } = await params;
  const tab = resolveSearchTabFromSegments(segments);
  if (!tab) return {};

  const title = `${tab.metaTitle} | Narayana Health`;
  return {
    title,
    description: tab.metaDescription,
    // Doctor search includes preview fixtures and arbitrary user refinements.
    // Approved, verified landing pages own future indexable directory content.
    robots: tab.id === "doctors" ? { index: false, follow: true } : undefined,
    alternates: { canonical: getSearchTabPath(tab) },
    openGraph: { title, description: tab.metaDescription, url: getSearchTabPath(tab) },
  };
}

export function generateStaticParams() {
  return [{ tab: [] as string[] }, ...SEARCH_TABS.map((t) => ({ tab: [t.slug] as string[] }))];
}

export default async function SearchRoute({ params }: SearchRouteProps) {
  const { tab: segments } = await params;
  if (!resolveSearchTabFromSegments(segments)) notFound();
  return <SearchResultsView />;
}
