import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FACILITIES, ITEMS } from "@/features/health-checkups/catalog";
import sourceDetails from "@/data/health-checkups/source-details.json";
import { normalizeHealthDetails } from "@/features/health-checkups/normalizeHealthDetails";
import { findHealthDetailSource, resolveHealthDetailItem } from "@/features/health-checkups/healthDetailRouting";
import HealthDetail from "@/features/health-checkups/HealthDetail";

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
  return {
    title: item ? `${item.name} | Narayana Health` : "Health Checkup | Narayana Health",
    description: item?.description || "View health checkup details, included tests and preparation instructions at Narayana Health.",
    robots: { index: false, follow: false },
  };
}

export default async function HealthDetailPage(props: Props) {
  const item = await resolveItem(props);
  if (!item) notFound();
  const facility = FACILITIES.find(entry => entry.id === item.facilityId);
  if (!facility) notFound();
  const source = findHealthDetailSource(sourceDetails, item);
  const detailItem = source ? { ...item, details: normalizeHealthDetails(source.detailsData) } : item;
  const query = await props.searchParams;
  return <HealthDetail item={detailItem} facility={facility} design={query.design === "1" ? "1" : "2"} />;
}
