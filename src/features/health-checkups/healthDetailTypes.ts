/** Source-authored content only. Empty sections are omitted by the master page. */
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

export function healthItemDetailHref(item: HealthDetailSource, design?: "1" | "2"): string {
  const query = new URLSearchParams();
  if (design) query.set("design", design);
  if (item.unitCode) query.set("unitCode", item.unitCode);
  if (item.code) query.set("code", item.code);
  // An explicit ID disambiguates facility-specific records with the same slug.
  query.set("item", item.id);
  return `/health-checkups/${encodeURIComponent(item.slug || item.id)}?${query}`;
}
