import { indiaDate } from "@/features/booking/appointmentTime";
import { readDesign16Date } from "./design16Refinements";
import { design17ListingReturnTo, type Design17Variant } from "./design17Navigation";
import { bookingUrl, nextSlot, type ConsultationMode, type DoctorListingItem } from "./doctorListing";

/** Carry the displayed appointment day into booking without selecting a time. */
export function design17BookingUrl(doctor: DoctorListingItem, mode: ConsultationMode, chosenDate = "", now = new Date(), design: Design17Variant = "d17", returnTo?: string): string {
  const slot = nextSlot(doctor, mode, now);
  const date = readDesign16Date(chosenDate, now) || (slot ? readDesign16Date(indiaDate(slot), now) : "");
  const params = new URLSearchParams({ design, returnTo: design17ListingReturnTo(returnTo, design) });
  if (date) params.set("date", date);
  return `${bookingUrl(doctor, mode, false, now)}&${params}`;
}
