import { appointmentDates, indiaAppointmentTimestamp, indiaDate } from "@/features/booking/shared/dates";
import sourceItems from "@/data/health-checkups/items.json";
import sourceFacilities from "@/data/health-checkups/active-facilities.json";
import type { HealthDetailSource } from "./healthDetailTypes";

export type FacilityId = string;

export interface HealthFacility {
  id: FacilityId;
  name: string;
  city: string;
  /** Additional city search contexts where the live catalogue lists this unit. */
  serviceCities?: string[];
  address: string;
  distanceKm?: number;
  unitCode?: string;
}

export interface HealthAudience {
  minAge?: number;
  gender?: "male" | "female";
  description: string;
}

export interface HealthItem extends HealthDetailSource {
  id: string;
  name: string;
  kind: "package" | "test";
  description: string;
  price: number;
  facilityId: FacilityId;
  category: string;
  testCount: number;
  inclusions: string[];
  includedTestIds: string[];
  preparation: string;
  reportTime: string;
  image?: string;
  requiresSlot: boolean;
  provenance?: "live-detail" | "live-listing" | "preview";
  retrievedAt?: string;
  /** Explicit catalog eligibility only; never inferred from an item's name. */
  audience?: HealthAudience;
}

/**
 * Frontend preview fixtures, not a live price/availability or clinical API.
 * The 6 Nov 2026 live-flow audit established these four examples:
 * Prestige: Vital Care ₹4,999 with a slot; Aldolase ₹1,200 without a slot.
 * Electronic City: Male Executive ₹5,699 with a slot and HbA1c included;
 * HbA1c alone ₹1,600 without a slot. Remaining catalog contents, distances,
 * prices, counts and reporting estimates are illustrative. Replace the
 * fixture adapter with approved facility data before production release.
 */
const PREVIEW_FACILITIES: HealthFacility[] = [
  {
    id: "prestige",
    unitCode: "6024",
    name: "Narayana Aarogyam, Prestige Tech Park",
    city: "Bangalore",
    address: "Prestige Tech Park, Kadubeesanahalli, Bangalore",
  },
  {
    id: "electronic-city",
    unitCode: "3010",
    name: "Narayana Clinic, Electronic City",
    city: "Bangalore",
    address: "Electronic City, Bangalore",
  },
];

export const FACILITIES: HealthFacility[] = [...new Map([
  ...PREVIEW_FACILITIES,
  ...sourceFacilities,
].map(facility => [facility.id, facility])).values()];

const preparation = "Confirm preparation instructions with the clinic before your visit.";

type TestFixture = Pick<HealthItem, "name" | "description" | "price" | "category" | "testCount" | "inclusions"> & { key: string };

const TEST_FIXTURES: TestFixture[] = [
  { key: "aldolase", name: "Aldolase", description: "A blood test measuring aldolase enzyme levels.", price: 1200, category: "General health", testCount: 1, inclusions: ["Aldolase, serum"] },
  { key: "hba1c", name: "HbA1c", description: "A measure of your average blood glucose over the past few months.", price: 1600, category: "Diabetes", testCount: 1, inclusions: ["Glycated haemoglobin (HbA1c)"] },
  { key: "cbc", name: "Complete Blood Count", description: "An overview of red cells, white cells and platelets.", price: 450, category: "General health", testCount: 24, inclusions: ["Haemoglobin", "Red blood cell indices", "White blood cell count", "Platelet count"] },
  { key: "thyroid", name: "Thyroid Profile", description: "A profile of thyroid hormone levels.", price: 850, category: "Thyroid", testCount: 3, inclusions: ["Triiodothyronine (T3)", "Thyroxine (T4)", "Thyroid-stimulating hormone (TSH)"] },
  { key: "lipid", name: "Lipid Profile", description: "A profile of cholesterol and triglyceride levels.", price: 750, category: "Heart health", testCount: 5, inclusions: ["Total cholesterol", "HDL cholesterol", "LDL cholesterol", "VLDL cholesterol", "Triglycerides"] },
];

function testsFor(facilityId: FacilityId): HealthItem[] {
  return TEST_FIXTURES.map(({ key, ...test }) => ({
    ...test,
    id: `${facilityId}-${key}`,
    kind: "test",
    facilityId,
    includedTestIds: [],
    preparation,
    reportTime: "Within 24 hours",
    requiresSlot: false,
  }));
}

export const PREVIEW_ITEMS: HealthItem[] = [
  {
    id: "prestige-vital-care", name: "Vital Care", kind: "package", facilityId: "prestige",
    description: "A comprehensive starting point for your routine health check.", price: 4999,
    category: "General health", testCount: 58,
    inclusions: ["Complete blood count", "Blood glucose", "Lipid profile", "Kidney function", "Liver function", "Physician consultation"],
    includedTestIds: ["prestige-cbc", "prestige-lipid"], preparation, reportTime: "Within 24 hours",
    image: "/Health Checkup/Master health.png", requiresSlot: true,
  },
  {
    id: "prestige-healthy-heart", name: "Healthy Heart Package", kind: "package", facilityId: "prestige",
    description: "Heart-focused screening, with time to discuss your results.", price: 3499,
    category: "Heart health", testCount: 42,
    inclusions: ["Lipid profile", "Complete blood count", "Blood glucose", "ECG", "Physician consultation"],
    includedTestIds: ["prestige-cbc", "prestige-lipid"], preparation, reportTime: "Within 24 hours",
    image: "/healthy-heart-package-2.png", requiresSlot: true,
  },
  {
    id: "prestige-diabetes-care", name: "Diabetes Care Package", kind: "package", facilityId: "prestige",
    description: "Key diabetes checks, brought together in one visit.", price: 2499,
    category: "Diabetes", testCount: 28,
    inclusions: ["HbA1c", "Blood glucose", "Kidney function", "Lipid profile", "Physician consultation"],
    includedTestIds: ["prestige-hba1c", "prestige-lipid"], preparation, reportTime: "Within 24 hours",
    image: "/health-packages/diabetes.png", requiresSlot: true,
  },
  {
    id: "electronic-city-male-executive", name: "Male Executive Health Checkup", kind: "package", facilityId: "electronic-city",
    description: "A broad health review designed for adult men.", price: 5699,
    category: "General health", testCount: 68,
    inclusions: ["Complete blood count", "HbA1c", "Lipid profile", "Thyroid profile", "Kidney function", "Liver function", "ECG", "Physician consultation"],
    includedTestIds: ["electronic-city-cbc", "electronic-city-hba1c", "electronic-city-lipid", "electronic-city-thyroid"],
    preparation, reportTime: "Within 24 hours", image: "/Health Checkup/Men's health.png", requiresSlot: true,
    // 18+ is an illustrative preview rule, NOT a verified live restriction.
    // Replace with approved facility eligibility metadata when integrating the API.
    audience: { minAge: 18, gender: "male", description: "men aged 18+" },
  },
  {
    id: "electronic-city-bone-health", name: "Bone Health Package", kind: "package", facilityId: "electronic-city",
    description: "A focused review of markers relevant to bone health.", price: 2999,
    category: "Bone health", testCount: 18,
    inclusions: ["Vitamin D", "Calcium", "Phosphorus", "Alkaline phosphatase", "Physician consultation"],
    includedTestIds: [], preparation, reportTime: "Within 48 hours",
    image: "/bone-health-package.png", requiresSlot: true,
  },
  {
    id: "electronic-city-basic-health", name: "Essential Health Checkup", kind: "package", facilityId: "electronic-city",
    description: "Everyday health checks in one straightforward package.", price: 1999,
    category: "General health", testCount: 36,
    inclusions: ["Complete blood count", "Blood glucose", "Lipid profile", "Urine routine", "Physician consultation"],
    includedTestIds: ["electronic-city-cbc", "electronic-city-lipid"], preparation, reportTime: "Within 24 hours",
    image: "/Health Checkup/Basic health.png", requiresSlot: true,
  },
  ...testsFor("prestige"),
  ...testsFor("electronic-city"),
];

/** Verified source records are kept separate from the existing stakeholder fixtures.
 * This partial snapshot must not be presented as the complete live catalogue.
 * Full detail payloads are imported only by the server-rendered item route.
 */
export const SOURCE_ITEMS: HealthItem[] = sourceItems.map(item => ({
  ...item,
  kind: item.kind === "test" ? "test" : "package",
  provenance: item.provenance === "live-detail" ? "live-detail" : "live-listing",
}));
// Illustrative prices and clinical content remain available as isolated test
// fixtures. The customer-facing catalogue uses only captured source records.
export const ITEMS: HealthItem[] = SOURCE_ITEMS;

const itemById = new Map(ITEMS.map(item => [item.id, item]));

export function money(value: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2, minimumFractionDigits: Number.isInteger(value) ? 0 : 2 }).format(value);
}

/** Resolve known IDs, keep one facility/package, and never charge a covered test twice. */
export function getCartItems(ids: readonly string[], facilityId: FacilityId, catalog: readonly HealthItem[] = ITEMS): HealthItem[] {
  const lookup = catalog === ITEMS ? itemById : new Map(catalog.map(item => [item.id, item]));
  const known = [...new Set(ids)].map(id => lookup.get(id)).filter((item): item is HealthItem => !!item && item.facilityId === facilityId);
  const selectedPackage = known.find(item => item.kind === "package");
  const covered = new Set(selectedPackage?.includedTestIds ?? []);
  return known.filter(item => item.kind === "package" ? item.id === selectedPackage?.id : !covered.has(item.id));
}

export function addCartItem(ids: readonly string[], item: HealthItem, facilityId: FacilityId, catalog: readonly HealthItem[] = ITEMS): { ids: string[]; message?: string } {
  const current = getCartItems(ids, facilityId, catalog);
  const next = catalog === ITEMS ? itemById.get(item.id) : catalog.find(entry => entry.id === item.id);
  if (!next || next.facilityId !== facilityId) return { ids: current.map(entry => entry.id), message: "This item is not available at the selected hospital." };
  if (current.some(entry => entry.id === next.id)) return { ids: current.map(entry => entry.id) };
  const selectedPackage = current.find(entry => entry.kind === "package");
  if (next.kind === "package" && selectedPackage) {
    return { ids: current.map(entry => entry.id), message: "You can choose one package per booking. Remove your selected package to choose another." };
  }
  if (selectedPackage?.includedTestIds.includes(next.id)) {
    return { ids: current.map(entry => entry.id), message: `${next.name} is already included in ${selectedPackage.name}.` };
  }
  const removed = next.kind === "package" ? current.filter(entry => next.includedTestIds.includes(entry.id)) : [];
  const nextIds = [...current.filter(entry => !next.includedTestIds.includes(entry.id)).map(entry => entry.id), next.id];
  return {
    ids: nextIds,
    ...(removed.length ? { message: `${removed.map(entry => entry.name).join(" and ")} ${removed.length === 1 ? "is" : "are"} included in this package and won't be charged separately.` } : {}),
  };
}

export function cartTotal(items: readonly HealthItem[]): number {
  return items.reduce((total, item) => total + Math.round(item.price * 100), 0) / 100;
}

export function cartRequiresSlot(items: readonly HealthItem[]): boolean {
  return items.some(item => item.requiresSlot);
}

/** Enforce explicit catalog criteria, without making clinical eligibility assumptions. */
export function healthEligibilityMessage(items: readonly HealthItem[], member?: { age?: string | number; gender?: string } | null): string | null {
  for (const item of items) {
    const audience = item.audience;
    if (!audience) continue;
    const ageText = String(member?.age ?? "").trim();
    const age = /^\d+$/.test(ageText) ? Number(ageText) : Number.NaN;
    if ((audience.minAge !== undefined && !Number.isFinite(age)) || (audience.gender && !member?.gender?.trim())) {
      return "Add this member’s age and gender to check package eligibility.";
    }
    if ((audience.minAge !== undefined && age < audience.minAge) || (audience.gender && member?.gender !== audience.gender)) {
      return `${item.name} is listed for ${audience.description}. Choose another package or member.`;
    }
  }
  return null;
}

export function healthDateKey(now: Date = new Date()): string {
  return indiaDate(now);
}

export function healthDates(count = 14, now: Date = new Date()): string[] {
  return appointmentDates(now.getTime(), Math.max(0, Math.min(90, Math.floor(count))));
}

/** Demo availability; canonical India timestamps protect against browser timezone drift. */
export function getHealthSlots(date: string, now: Date = new Date()): string[] {
  return Array.from({ length: 10 }, (_, index) => {
    const hour = 8 + Math.floor(index / 2);
    return `${String(hour % 12 || 12).padStart(2, "0")}:${index % 2 ? "30" : "00"} ${hour < 12 ? "AM" : "PM"}`;
  }).filter(time => {
    const timestamp = indiaAppointmentTimestamp(date, time);
    return timestamp !== null && timestamp > now.getTime();
  });
}
