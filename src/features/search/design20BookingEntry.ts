import { design17ListingReturnTo } from "./design17Navigation";
import { defaultDoctorListingUrl } from "@/features/design-preview/doctorJourney";
import type { ConsultationMode, DoctorListingItem } from "./doctorListing";

/** Unsupported public IDs recover through discovery without inventing a clinician or booking. */
export function design20DoctorRecoveryUrl(params: Pick<URLSearchParams, "get">): string {
  const values = new URLSearchParams();
  const name = params.get("name")?.trim();
  const city = params.get("city")?.trim() || params.get("location")?.trim();
  if (name) values.set("q", name);
  if (city) values.set("location", city);
  if (params.get("mode") === "video") values.set("mode", "video");
  return defaultDoctorListingUrl(values);
}

/** Public booking actions open the selected doctor's in-card slots before authentication. */
export function design20BookingEntryUrl(
  doctor: Pick<DoctorListingItem, "id" | "hospital" | "city">,
  mode: ConsultationMode,
  date = "",
  returnTo?: string | null,
): string {
  const target = new URL(design17ListingReturnTo(returnTo, "d20"), "https://nh.local");
  if (!returnTo && doctor.city) target.searchParams.set("location", doctor.city);
  target.searchParams.set("booking", doctor.id);
  target.searchParams.set("bookingMode", mode);
  target.searchParams.set("hospital", doctor.hospital);
  target.searchParams.delete("bookingResume");
  if (date) target.searchParams.set("date", date);
  else target.searchParams.delete("date");
  return `${target.pathname}?${target.searchParams}`;
}
