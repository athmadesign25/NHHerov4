import { presentationDoctorName } from "@/features/design-preview/presentationCopy";

interface ProfileIdentity { id: string; name: string; city?: string; profileSlug?: string }

/** A public URL names the clinician, while internal IDs keep booking records stable. */
export function doctorNameSlug(name: string): string {
  const value = presentationDoctorName(name).normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/^dr[.\s-]*/i, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return value ? `dr-${value}` : "";
}

export function doctorProfileSlug(doctor: ProfileIdentity): string {
  return doctor.profileSlug || doctorNameSlug(doctor.name) || doctor.id;
}

export function doctorProfilePath(doctor: ProfileIdentity): string {
  return `/doctors/${encodeURIComponent(doctorProfileSlug(doctor))}`;
}

/** Homonyms use city, then stable ID only when city still cannot distinguish them. */
export function withDoctorProfileSlugs<T extends ProfileIdentity>(doctors: readonly T[]): (T & { profileSlug: string })[] {
  const base = (doctor: T) => doctorNameSlug(doctor.name) || doctor.id;
  const counts = new Map<string, number>();
  for (const doctor of doctors) counts.set(base(doctor), (counts.get(base(doctor)) ?? 0) + 1);
  const candidates = doctors.map(doctor => {
    const city = doctor.city?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return counts.get(base(doctor))! > 1 && city ? `${base(doctor)}-${city}` : base(doctor);
  });
  const candidateCounts = new Map<string, number>();
  for (const slug of candidates) candidateCounts.set(slug, (candidateCounts.get(slug) ?? 0) + 1);
  return doctors.map((doctor, index) => ({ ...doctor,
    profileSlug: candidateCounts.get(candidates[index])! > 1 ? `${candidates[index]}-${doctor.id}` : candidates[index],
  }));
}

/** Preserve multi-value queries and booking intent when a legacy link is canonicalised. */
export function doctorProfileQuery(values: Record<string, string | string[] | undefined>): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (Array.isArray(value)) value.forEach(item => params.append(key, item));
    else if (value !== undefined) params.set(key, value);
  }
  return params;
}
