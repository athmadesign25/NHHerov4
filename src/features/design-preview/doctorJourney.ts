import { DEFAULT_DOCTOR_DESIGN, DESIGN_SCOPES } from "./designVariants";

export { DEFAULT_DOCTOR_DESIGN };

/** Older designs are available only through an explicit development preview. */
export function resolveDoctorDesign(requested: string | null | undefined, previewEnabled: boolean): string {
  if (previewEnabled && requested && DESIGN_SCOPES["search-top"].variants.some(
    variant => variant.id === requested && !("disabled" in variant && variant.disabled),
  )) return requested;
  return DEFAULT_DOCTOR_DESIGN;
}

/** Normalize older directory aliases without losing a user's search context. */
export function defaultDoctorListingUrl(values: URLSearchParams): string {
  const params = new URLSearchParams(values);
  params.set("design", DEFAULT_DOCTOR_DESIGN);
  if (!params.has("location") && params.has("city")) params.set("location", params.get("city")!);
  if (!params.has("specialties") && params.has("speciality")) params.set("specialties", params.get("speciality")!);
  params.delete("city");
  params.delete("speciality");
  params.delete("tab");
  return `/search/doctors?${params}`;
}
