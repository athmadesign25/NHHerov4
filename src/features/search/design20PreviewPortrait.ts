/**
 * Presentation-only portraits reused from Design 19 at the user's request.
 * The original official portraits remain in design20DirectoryData; these
 * illustrative images must not be treated as verified clinician photographs.
 */
const previewPortraits = [
  "/images/misc/doctor_avatar_female_v2.png",
  "/images/misc/doctor_avatar_male_v2.png",
] as const;

export function design20PreviewPortrait(id: string, original: string | undefined, index: number): string {
  // Keep missing-image states and all existing full-bleed profile photos intact.
  if (!original || original.includes("-profile.")) return original ?? "";
  // This clinician also has the earlier, larger portrait in Design 19.
  if (id === "dr-bagirath-raghuraman") return "/doctors/doc_bagirath.jpg";
  return previewPortraits[index % previewPortraits.length];
}
