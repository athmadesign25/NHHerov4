import capturedContent from "@/data/health-checkups/card-content.json";
import type { HealthItem } from "./catalog";
import type { HealthTestGroup } from "./healthDetailTypes";

interface CardContent { originalPrice?: number; catalogueName?: string; testGroups?: HealthTestGroup[] }
const content: Record<string, CardContent> = capturedContent as Record<string, CardContent>;

export function healthCardContent(item: HealthItem) {
  const source = content[item.id];
  const originalPrice = item.originalPrice ?? source?.originalPrice;
  const groups = item.includedTests ?? source?.testGroups ?? (item.kind === "test" ? [{ name: item.name, parameters: [] }] : []);
  return {
    originalPrice: originalPrice !== undefined && Number.isFinite(originalPrice) && originalPrice > item.price ? originalPrice : undefined,
    groups,
    testCount: groups.length || undefined,
    catalogueName: source?.catalogueName ?? item.name,
  };
}

export const HEALTH_CATEGORIES = [
  { id: "all", label: "All", tone: "mint" },
  { id: "general", label: "General health", tone: "mint" },
  { id: "women", label: "Women’s health", tone: "rose" },
  { id: "men", label: "Men’s health", tone: "violet" },
  { id: "senior", label: "Senior care", tone: "amber" },
  { id: "diabetes", label: "Diabetes", tone: "amber" },
  { id: "heart", label: "Heart health", tone: "rose" },
  { id: "thyroid", label: "Thyroid", tone: "violet" },
  { id: "vitamins", label: "Vitamins", tone: "amber" },
  { id: "kidney", label: "Kidney health", tone: "mint" },
] as const;
export type HealthCategory = typeof HEALTH_CATEGORIES[number]["id"];

/** Discovery labels only, never used to infer age/gender eligibility. */
export function healthCategories(item: HealthItem): HealthCategory[] {
  const name = `${healthCardContent(item).catalogueName} ${item.name}`.toLowerCase();
  const ids: HealthCategory[] = [];
  if (/\bfemale\b|\bwom[ae]n\b|maternal|pregnancy|antenatal/.test(name)) ids.push("women");
  if (/\bmale\b|\bmen\b/.test(name)) ids.push("men");
  if (/senior|elderly|geriatric/.test(name)) ids.push("senior");
  if (/diabet|hba1c|glucose|glycosylated/.test(name)) ids.push("diabetes");
  if (/cardiac|heart|lipid|apolipoprotein|cholesterol/.test(name)) ids.push("heart");
  if (/thyroid|\btsh\b/.test(name)) ids.push("thyroid");
  if (/vitamin/.test(name)) ids.push("vitamins");
  if (/kidney|renal|creatinine|urea/.test(name)) ids.push("kidney");
  if (item.kind === "package" && !ids.length) ids.push("general");
  return ids;
}

export function healthCardTone(item: HealthItem) {
  const category = healthCategories(item)[0];
  if (category) return HEALTH_CATEGORIES.find(value => value.id === category)?.tone ?? "mint";
  const index = [...item.id].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 4;
  return ["mint", "rose", "violet", "amber"][index];
}
