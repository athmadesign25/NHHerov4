import { DEFAULT_DOCTOR_DESIGN } from "@/features/design-preview/doctorJourney";
import { getDesign20DirectoryDoctor } from "@/features/search/design20Directory";
import { doctorProfilePath } from "@/features/search/doctorProfileUrl";
import { buildSearchUrl } from "@/features/search/searchTabs";

/** The source uses this short name for the existing paediatric surgeon profile. */
const sourceDoctorIds: Readonly<Record<string, string>> = {
  "Dr. Ashley D'Cruz": "dr-ashley",
};

/** Resolve known clinicians to their current profile; never guess a profile from a name. */
export function procedureDoctorBookingHref(name: string): string {
  const doctor = getDesign20DirectoryDoctor(sourceDoctorIds[name] ?? name);
  if (!doctor) return buildSearchUrl({ q: name });

  const params = new URLSearchParams({
    design: DEFAULT_DOCTOR_DESIGN,
    mode: doctor.modes.hospital ? "hospital" : "video",
    hospital: doctor.hospital,
    returnTo: buildSearchUrl({ q: doctor.name, location: doctor.city }),
    booking: doctor.id,
    bookingResume: "1",
  });
  return `${doctorProfilePath(doctor)}?${params}`;
}
