import { searchDoctorsData } from "@/app/search/mockDoctors";
import { presentationDoctorName } from "@/features/design-preview/presentationCopy";
import { indiaClock, indiaDate } from "@/features/booking/appointmentTime";
import { design3CityDoctors } from "./design3CityDoctors";
import { withDesign3DemoMetadata } from "./design3DoctorMetadata";
import { getDesign16HospitalPreview } from "./design16HospitalPreview";
import { design17ListingReturnTo, type Design17Variant } from "./design17Navigation";
import { doctorHospitals, fromDirectoryDoctor, nextSlot, withSelectedDoctorHospital, type ConsultationMode, type DoctorListingItem } from "./doctorListing";

const directory = [...withDesign3DemoMetadata(searchDoctorsData.map(fromDirectoryDoctor)), ...design3CityDoctors];
type ProfileParams = Pick<URLSearchParams, "get">;

/** Validate the affiliation and resolve its own city instead of the doctor's primary city. */
export function selectDesign17ProfileHospital(doctor: DoctorListingItem, hospital: string): DoctorListingItem {
  const selected = withSelectedDoctorHospital(doctor, [hospital]);
  const practice = doctor.practiceLocations?.find(location => location.hospital === selected.hospital);
  return { ...selected, ...practice, city: getDesign16HospitalPreview(selected.hospital)?.city ?? practice?.city ?? selected.city };
}

/** Related choices retain the selected consultation mode and exclude unsupported bookings. */
export function getDesign17RelatedDoctors(id: string, mode: ConsultationMode, name = ""): DoctorListingItem[] {
  const currentName = presentationDoctorName(name).trim().toLocaleLowerCase();
  return directory
    .filter(doctor => doctor.id !== id && presentationDoctorName(doctor.name).trim().toLocaleLowerCase() !== currentName && doctor.modes[mode] === true)
    .slice(0, 8)
    .map(doctor => ({ ...selectDesign17ProfileHospital(doctor, doctor.hospital), name: presentationDoctorName(doctor.name) }));
}

/** Only advertise a supplied future slot in the selected consultation mode. */
export function design17ProfileAvailability(doctor: DoctorListingItem, mode: ConsultationMode, now = new Date()): string {
  const slot = nextSlot(doctor, mode, now);
  if (!slot) return "Check availability";
  const day = indiaDate(slot) === indiaDate(now) ? "Today" : indiaDate(slot) === indiaDate(now, 1) ? "Tomorrow"
    : slot.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
  return `${day}, ${indiaClock(slot)}`;
}

export function design17ProfileUrl(doctor: DoctorListingItem, mode: ConsultationMode, date = "", live = false, design: Design17Variant = "d17", returnTo?: string) {
  const params = new URLSearchParams({ design, mode, hospital: doctor.hospital, returnTo: design17ListingReturnTo(returnTo, design) });
  if (date) params.set("date", date);
  if (live) {
    // API search results have no profile-detail endpoint; retain only supplied public details.
    params.set("source", "search");
    for (const key of ["name", "speciality", "degrees", "city", "experience", "img", "fee"] as const) params.set(key, doctor[key]);
  }
  return `/doctors/${encodeURIComponent(doctor.id)}?${params}`;
}

export function getDesign17ProfileDoctor(id: string, params: ProfileParams): DoctorListingItem | null {
  const source = params.get("source") === "search" ? null : directory.find(doctor => doctor.id === id);
  if (source) {
    return { ...selectDesign17ProfileHospital(source, params.get("hospital") ?? ""), name: presentationDoctorName(source.name) };
  }
  const name = params.get("name");
  if (!name) return null;
  return {
    id, name, speciality: params.get("speciality") ?? "", degrees: params.get("degrees") ?? "",
    hospital: params.get("hospital") ?? "", city: params.get("city") ?? "",
    experience: params.get("experience") ?? "", img: params.get("img") ?? "", fee: params.get("fee") ?? "",
    rating: 0, reviews: 0, availability: {}, modes: { hospital: null, video: null },
  };
}

/** Adapt the listing's supplied details to the existing full profile layout. */
export function design17ProfileDetails(doctor: DoctorListingItem) {
  return {
    name: doctor.name, speciality: doctor.speciality, subSpeciality: doctor.degrees,
    hospital: doctor.hospital, city: doctor.city,
    locations: doctorHospitals(doctor).map(name => ({ name, city: getDesign16HospitalPreview(name)?.city ?? doctor.practiceLocations?.find(location => location.hospital === name)?.city ?? doctor.city })),
    experienceYears: doctor.experience, rating: doctor.rating, reviews: doctor.reviews,
    img: doctor.img || "/images/misc/doctor_avatar_male_v2.png", fee: doctor.fee, about: "",
    specialities: [{ name: doctor.speciality, subtext: doctor.designation ?? "" }],
    languages: (doctor.languages ?? []).map(name => ({ name, script: "" })),
    education: doctor.degrees ? [{ title: doctor.degrees, institution: "" }] : [],
    experience: doctor.designation ? [{ role: doctor.designation, hospital: doctor.hospital }] : [],
    awards: [] as { title: string; subtitle: string }[], expertise: [...(doctor.expertise ?? [])],
  };
}
