import type { HealthDesign } from "./healthDesigns";

/** Master detail schema. Captured source content and labelled demo enrichment stay separate. */
export interface HealthTestGroup {
  name: string;
  parameters: string[];
  description?: string;
  parameterDetails?: { name: string; description?: string }[];
  itemLabel?: "tests" | "parameters";
}

export interface HealthDetailSection {
  title: string;
  paragraphs: string[];
  items?: string[];
}

export interface HealthItemDetails {
  contentType?: "imaging" | "service";
  /** Internal editorial provenance; demo routes remain noindex until approval. */
  editorial?: {
    status: "researched-demo";
    reviewedAt: string;
    profile: string;
    sources: string[];
    draftFields: string[];
  };
  about: string[];
  sampleRequired: string[];
  testGroups: HealthTestGroup[];
  instructions: string[];
  subtitle?: string;
  benefits?: { title?: string; description: string }[];
  instructionGroups?: HealthDetailSection[];
  profileTestGroups?: HealthTestGroup[];
  sections?: HealthDetailSection[];
}

export interface HealthDetailSource {
  id: string;
  slug?: string;
  sourceUrl?: string;
  unitCode?: string;
  code?: string;
  details?: HealthItemDetails;
}

export function healthItemDetailHref(item: HealthDetailSource, design?: HealthDesign): string {
  const query = new URLSearchParams();
  if (design) query.set("design", design);
  if (item.unitCode) query.set("unitCode", item.unitCode);
  if (item.code) query.set("code", item.code);
  // An explicit ID disambiguates facility-specific records with the same slug.
  query.set("item", item.id);
  return `/health-checkups/${encodeURIComponent(item.slug || item.id)}?${query}`;
}
