import type { HealthItem } from "./catalog";

const normalize = (value: string) => value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();

/** Only name a city once a centre has actually been chosen. Search covers both types. */
export function healthListingHeading(city?: string, kind?: "package" | "test"): string {
  const location = city?.trim().replace(/\s+/g, " ");
  if (!location) return "Health checkups & tests";
  const subject = kind === "package" ? "Health packages" : kind === "test" ? "Lab tests" : "Checkups & tests";
  return `${subject} in ${location}`;
}

/** Search names, published abbreviations and verified coverage across both item types. */
export function matchesHealthQuery(item: HealthItem, query: string): boolean {
  const tokens = normalize(query).split(/\s+/).filter(Boolean);
  const words = normalize([item.name, item.description, ...item.inclusions].join(" ")).split(/\s+/);
  return tokens.every(token => words.some(word => word.startsWith(token)));
}

export function healthComparisonFacts(item: HealthItem): Record<string, string> {
  return {
    "Package overview": item.audience?.description || item.description || "Not listed",
    "Coverage highlights": item.inclusions.length ? item.inclusions.join(" · ") : "Not listed",
    "Preparation": item.preparation || "Not listed",
    "Report availability": item.reportTime || "Not listed",
  };
}
