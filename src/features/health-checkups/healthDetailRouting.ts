import type { HealthDetailSource } from "./healthDetailTypes";

type DetailQuery = Record<string, string | string[] | undefined>;
type DetailItem = HealthDetailSource & { facilityId: string };
type SourceIdentity = { sourceUrl: string; facilityId: string | number; unitCode?: string; code?: string };

/** A shared slug must never silently pick another centre's price or inclusions. */
export function resolveHealthDetailItem<T extends HealthDetailSource>(items: readonly T[], slug: string, query: DetailQuery): T | undefined {
  const keys = ["item", "unitCode", "code"] as const;
  if (!slug || keys.some(key => query[key] !== undefined && (typeof query[key] !== "string" || !query[key]?.trim()))) return undefined;
  const matches = items.filter(item => (item.slug === slug || item.id === slug)
    && (!query.item || item.id === query.item)
    && (!query.unitCode || item.unitCode === query.unitCode)
    && (!query.code || item.code === query.code));
  return matches.length === 1 ? matches[0] : undefined;
}

/** Invalid source records are ignored instead of breaking the whole detail page. */
export function findHealthDetailSource<T extends SourceIdentity>(sources: readonly T[], item: DetailItem): T | undefined {
  return sources.find(source => {
    if (String(source.unitCode || source.facilityId) !== String(item.unitCode || item.facilityId)) return false;
    if (!item.code) return Boolean(item.sourceUrl && source.sourceUrl === item.sourceUrl);
    if (source.code) return source.code === item.code;
    try { return new URL(source.sourceUrl).searchParams.get("code") === item.code; }
    catch { return false; }
  });
}
