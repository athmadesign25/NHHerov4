import type { DoctorListingItem } from "@/features/search/doctorListing";

export type FeeFilter = "any" | "under1000" | "1000to1500" | "above1500";

export const FEE_OPTIONS: readonly { value: FeeFilter; label: string }[] = [
  { value: "any", label: "Any fee" },
  { value: "under1000", label: "Below ₹1,000" },
  { value: "1000to1500", label: "₹1,000–₹1,500" },
  { value: "above1500", label: "Above ₹1,500" },
];

export function readFeeFilter(value: string | null | undefined): FeeFilter {
  return FEE_OPTIONS.find((option) => option.value === value)?.value ?? "any";
}

/** Only an explicit numeric price is known; missing or descriptive fees stay unknown. */
function numericFee(value: string): number | null {
  const text = value.trim().replace(/^(?:₹|INR|Rs\.?)\s*/i, "").replaceAll(",", "");
  if (!/^\d+(?:\.\d{1,2})?$/.test(text)) return null;
  const amount = Number(text);
  return Number.isFinite(amount) ? amount : null;
}

/** The middle band includes both boundaries; "any" also keeps unknown fees. */
export function filterByFee(doctors: readonly DoctorListingItem[], fee: FeeFilter): DoctorListingItem[] {
  if (fee === "any") return [...doctors];
  return doctors.filter((doctor) => {
    const amount = numericFee(doctor.fee);
    if (amount === null) return false;
    if (fee === "under1000") return amount < 1000;
    if (fee === "1000to1500") return amount >= 1000 && amount <= 1500;
    return amount > 1500;
  });
}
