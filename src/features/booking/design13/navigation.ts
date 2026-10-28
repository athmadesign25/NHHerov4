import { getDoctorLandingContext } from "@/features/search/doctorLandingPages";
import { bookingUrl, nextSlot, type ConsultationMode, type DoctorListingItem } from "@/features/search/doctorListing";
import type { QuickJourneyDesign } from "@/features/design-preview/journeyDesigns";

const RETURN_ORIGIN = "https://nh-preview.invalid";
const RETURN_KEYS = new Set([
  "q", "search", "query", "location", "city", "cityId", "mode", "sort", "specialties",
  "hospitals", "languages", "genders", "expertise", "availability", "shown", "fee",
]);
const hasUnsafeCharacter = (value: string) => Array.from(value).some((character) =>
  character === "\\" || character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127);

function normalizeReturn(value: string | null | undefined, variant: QuickJourneyDesign): string | null {
  if (!value || value.length > 4096 || !value.startsWith("/") || value.startsWith("//")) return null;
  try {
    const decoded = decodeURIComponent(value);
    if (hasUnsafeCharacter(value) || hasUnsafeCharacter(decoded) || decoded.startsWith("//")) return null;
    const url = new URL(value, RETURN_ORIGIN);
    if (url.origin !== RETURN_ORIGIN ||
      (url.pathname !== "/search/doctors" && !getDoctorLandingContext(url.pathname))) return null;
    const query = new URLSearchParams();
    for (const [key, item] of url.searchParams) {
      if (!RETURN_KEYS.has(key) || item.length > 300 || hasUnsafeCharacter(item)) continue;
      if (key === "shown" && (!/^\d+$/.test(item) || Number(item) < 6 || Number(item) > 1200)) continue;
      if (key === "mode" && item !== "hospital" && item !== "video") continue;
      query.append(key, item);
    }
    query.set("design", variant);
    const anchor = decodeURIComponent(url.hash.slice(1));
    const hash = /^doctor-[A-Za-z0-9._~-]+$/.test(anchor) ? `#${anchor}` : "";
    return `${url.pathname}?${query.toString()}${hash}`;
  } catch {
    return null;
  }
}

/** Only reviewed local directory routes and non-patient filters may be restored. */
export function safeReturnTo(value: string | null | undefined, fallback: string, variant: QuickJourneyDesign = "d13"): string {
  return normalizeReturn(value, variant) ?? normalizeReturn(fallback, variant) ?? `/search/doctors?design=${variant}`;
}

export const doctorReturnId = (doctorId: string) => `doctor-${doctorId}`;

/** Slot intent is explicit; choosing another time never carries a hidden time. */
export function quickBookingHref(
  doctor: DoctorListingItem, mode: ConsultationMode, now: Date, returnTo: string, intent: "slot" | "choose",
  variant: QuickJourneyDesign = "d13",
): string {
  const hasSlot = doctor.modes[mode] === true && Boolean(nextSlot(doctor, mode, now));
  const direct = intent === "slot" && hasSlot;
  const url = new URL(bookingUrl(doctor, mode, direct, now), RETURN_ORIGIN);
  url.searchParams.set("design", variant);
  url.searchParams.set("intent", direct ? "slot" : "choose");
  url.searchParams.set("step", direct ? "checkout" : "appointment");
  const fallback = `/search/doctors?${new URLSearchParams({ design: variant, location: doctor.city, mode })}`;
  url.searchParams.set("returnTo", safeReturnTo(returnTo, fallback, variant));
  return `${url.pathname}?${url.searchParams.toString()}`;
}
