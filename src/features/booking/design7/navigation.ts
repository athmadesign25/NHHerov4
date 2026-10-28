import type { JourneyDesign } from "@/features/design-preview/journeyDesigns";
import type { ConsultationType } from "../types";

/** Return to the same visual journey and consultation mode without patient data. */
export function bookingDirectoryHref(design: JourneyDesign, city: string, mode: ConsultationType): string {
  const params = new URLSearchParams({ design, mode });
  if (city) params.set("location", city);
  return `/search/doctors?${params.toString()}`;
}
