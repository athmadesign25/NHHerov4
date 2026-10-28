import { getDoctorLandingContext } from "./doctorLandingPages";
import { isJourneyDesign } from "../design-preview/journeyDesigns";

/** Route context and visible filters must describe the same set of doctors. */
export function doctorListingParams(pathname: string, query: string): URLSearchParams {
  const params = new URLSearchParams(query);
  const context = getDoctorLandingContext(pathname);
  if (context?.speciality) params.set("specialties", context.speciality.label);
  if (context?.city) {
    for (const key of ["location", "city", "cityId"]) params.delete(key);
    params.set("location", context.city.value);
  }
  return params;
}

/** Keep refinements on their landing page; leave it when its defining filters change.
 * Arbitrary/empty combinations remain recoverable search states, not new SEO pages.
 */
export function doctorListingUrl(pathname: string, values: URLSearchParams): string {
  const params = new URLSearchParams(values);
  const requestedDesign = params.get("design") ?? "";
  const design = ["d4", "d5", "d6", "d16", "d17", "d17-lite", "d18", "d19"].includes(requestedDesign) || isJourneyDesign(requestedDesign) ? requestedDesign : "d3";
  const context = getDoctorLandingContext(pathname);
  const specialties = params.getAll("specialties").filter(Boolean);
  const keepsSpeciality = !context?.speciality || (specialties.length === 1 && specialties[0] === context.speciality.label);
  const keepsCity = !context?.city || params.get("location") === context.city.value;
  const keepsContext = Boolean(context && keepsSpeciality && keepsCity);
  if (keepsContext) {
    if (context?.speciality) params.delete("specialties");
    if (context?.city) params.delete("location");
    if (design !== "d3") params.set("design", design);
    else params.delete("design"); // The original landing-page preview is Design 3.
  } else params.set("design", design);
  const query = params.toString();
  return `${keepsContext ? pathname : "/search/doctors"}${query ? `?${query}` : ""}`;
}
