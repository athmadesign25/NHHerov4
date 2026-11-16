import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FACILITIES, ITEMS } from "@/features/health-checkups/catalog";
import sourceDetails from "@/data/health-checkups/source-details.json";
import { normalizeHealthDetails } from "@/features/health-checkups/normalizeHealthDetails";
import { findHealthDetailSource, resolveHealthDetailItem } from "@/features/health-checkups/healthDetailRouting";
import { withHealthDemoContent } from "@/features/health-checkups/content/withHealthDemoContent";
import HealthDetail from "@/features/health-checkups/HealthDetail";
import { resolveHealthDesign } from "@/features/health-checkups/healthDesigns";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function resolveItem({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  return resolveHealthDetailItem(ITEMS, slug, query);
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const item = await resolveItem(props);
  const facility = item && FACILITIES.find(entry => entry.id === item.facilityId);
  return {
    title: item ? `${item.name}${facility ? ` in ${facility.city}` : ""} | Narayana Health` : "Health Checkup | Narayana Health",
    description: item && facility ? `Explore ${item.name} at ${facility.name}. View available ${item.kind === "test" ? "test" : "package"} information, preparation instructions and centre-specific booking details.` : "View health checkup details, included tests and preparation instructions at Narayana Health.",
    // Source content and prices are awaiting approval; keep this design preview out of search.
    robots: { index: false, follow: false },
  };
}

export default async function HealthDetailPage(props: Props) {
  const item = await resolveItem(props);
  if (!item) notFound();
  const facility = FACILITIES.find(entry => entry.id === item.facilityId);
  if (!facility) notFound();
  const source = findHealthDetailSource(sourceDetails, item);
  const detailItem = withHealthDemoContent(source ? { ...item, details: normalizeHealthDetails(source.detailsData) } : item);
  const query = await props.searchParams;
  const relatedPackages = item.kind === "test" ? ITEMS.filter(entry => entry.kind === "package" && entry.facilityId === facility.id && entry.includedTestIds.includes(item.id)) : [];
  return <HealthDetail item={detailItem} facility={facility} design={resolveHealthDesign(query.design)} relatedPackages={relatedPackages} />;
}
