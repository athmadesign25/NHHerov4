import { searchDoctorsData } from "@/app/search/mockDoctors";
import { allSearchDataDoctors } from "@/components/search/NHSearchExperience/searchData";
import { getBookingDoctor } from "@/features/booking/doctors";
import type { BookingDoctorSummary } from "@/features/booking/types";
import { getCityId } from "@/lib/searchService";
import { presentationDoctorName } from "@/features/design-preview/presentationCopy";
import { design3CityDoctors } from "./design3CityDoctors";
import { withDesign3DemoMetadata } from "./design3DoctorMetadata";
import { selectDesign17ProfileHospital } from "./design17Profile";
import { design20DirectorySource } from "./design20DirectoryData";
import { withDesign20FeaturedClinicalMetadata } from "./design20FeaturedClinicalMetadata";
import { design20PreviewPortrait } from "./design20PreviewPortrait";
import { fromDirectoryDoctor, type ConsultationMode, type DoctorListingItem } from "./doctorListing";

/** These are interaction-preview values, not information from the official directory. */
export const DESIGN20_SIMULATED_BOOKING = Object.freeze({
  fee: "₹1,500",
  modes: Object.freeze({ hospital: true, video: true }),
  availability: Object.freeze({ hospital: "Today, 09:00 AM", video: "Today, 10:00 AM" }),
});

/** Preserve established specialty entry URLs while showing the official department names. */
const specialtyNavigationTerms: Readonly<Record<string, readonly string[]>> = {
  "Adult Cardiology": ["Cardiologist"], "Paediatric Cardiology": ["Cardiologist"],
  "Heart Failure & Transplantation Medicine": ["Cardiologist"],
  "Orthopaedic Surgery": ["Orthopaedician"], "Interventional Neurology": ["Neurologist"],
  "Medical Gastroenterology": ["Gastroenterologist"], "Paediatric Medicine": ["Pediatrician"],
  "Paediatric & Congenital Heart Surgery": ["Cardiac Surgeon"],
  "Paediatric Nephrology": ["Nephrologist"], "Plastic Surgery": ["Plastic Surgeon"],
  "Breast Oncology & Oncoplastic Surgery": ["Oncologist"], "Gynaecologic Oncology": ["Oncologist", "Gynecologist"],
  "Gynaecology": ["Gynecologist"], "Obstetrics & Gynaecology": ["Gynecologist"],
  "Dermatology": ["Dermatologist"], "Pulmonology": ["Pulmonologist"], "Urology": ["Urologist"],
  "Endocrinology": ["Endocrinologist"], "E.N.T": ["ENT Specialist"],
};

/** Public clinical details stay separate from the clearly documented booking simulation. */
export const design20BangaloreDoctors: DoctorListingItem[] = design20DirectorySource.doctors.map((doctor, index) => ({
  id: `d20-${doctor.id}`, name: doctor.name, designation: doctor.designation,
  speciality: doctor.specialties.join(", "), degrees: doctor.qualifications,
  specialityAliases: [...new Set(doctor.specialties.flatMap(specialty => specialtyNavigationTerms[specialty] ?? []))],
  hospital: doctor.hospitals[0], hospitals: doctor.hospitals, city: "Bangalore",
  experience: doctor.experienceLabel ?? "", img: design20PreviewPortrait(doctor.id, doctor.imagePath, index),
  languages: doctor.languages ?? [], expertise: doctor.expertise,
  rating: 0, reviews: 0,
  fee: DESIGN20_SIMULATED_BOOKING.fee,
  modes: { ...DESIGN20_SIMULATED_BOOKING.modes },
  availability: { ...DESIGN20_SIMULATED_BOOKING.availability },
}));

const bangaloreIds = new Set(design20BangaloreDoctors.map(doctor => doctor.id));
const legacyDirectory = [...withDesign3DemoMetadata(searchDoctorsData.map(fromDirectoryDoctor)), ...design3CityDoctors];

/** Keep the previous first row ahead of the verified sample, as requested for this preview. */
const featuredPreviewDoctors = ["dr-1", "dr-ashley", "dr-3"].flatMap(id => {
  const doctor = legacyDirectory.find(entry => entry.id === id);
  return doctor ? [withDesign20FeaturedClinicalMetadata(doctor)] : [];
});
/** Stakeholder-preview experience only; never written into the verified source records. */
function withPreviewExperience(doctor: DoctorListingItem): DoctorListingItem {
  if (/\d+\+?\s*(?:years?|yrs?)\b/i.test(doctor.experience)) return doctor;
  const seed = [...doctor.id].reduce((value, character) => value + character.charCodeAt(0), 0);
  return { ...doctor, experience: `${12 + seed % 24} years experience` };
}

const previewLocations = new Map([
  ["dr-3", design20BangaloreDoctors.find(doctor => doctor.id === "d20-dr-abhinandan-s-punit")],
  ["d20-dr-abhinandan-s-punit", featuredPreviewDoctors.find(doctor => doctor.id === "dr-3")],
]);

export const design20Directory = [
  ...featuredPreviewDoctors,
  ...design20BangaloreDoctors,
  ...legacyDirectory.filter(doctor => getCityId(doctor.city) !== getCityId("Bangalore")),
].map(withPreviewExperience).map(doctor => {
  // Requested preview-only location swap; keep source clinical data and all other fields intact.
  const locationSource = previewLocations.get(doctor.id);
  if (!locationSource) return doctor;
  const hospitals = [...(locationSource.hospitals ?? [locationSource.hospital])];
  return { ...doctor, hospital: locationSource.hospital, hospitals,
    hospitalCount: hospitals.length > 1 ? `+${hospitals.length - 1}` : "" };
});
export const design20SearchableIds = new Set(design20Directory.map(doctor => doctor.id));

const doctorNameKey = (name: string) => name.toLowerCase().replace(/^dr[.\s-]*/i, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const featuredLegacySlugs = new Set(["dr-rajiv-menon", "dr-priya-sharma", "dr-arun-krishnan"]);

/** Older public profile URLs keep their clinician identity when entering the current journey. */
export function getDesign20DirectoryDoctor(id: string, requestedName?: string | null): DoctorListingItem | null {
  const direct = design20Directory.find(doctor => doctor.id === id);
  if (direct) return direct;
  const key = doctorNameKey(id);
  const named = design20Directory.find(doctor => doctorNameKey(doctor.name) === key);
  if (named) return named;
  const legacy = legacyDirectory.find(doctor => doctor.id === id || doctorNameKey(doctor.name) === key);
  const search = allSearchDataDoctors.find(doctor => (doctor.id === id || doctorNameKey(doctor.name) === key || `d20-search-${doctorNameKey(doctor.name)}` === id)
    && (!requestedName || doctorNameKey(doctor.name) === doctorNameKey(requestedName)));
  const name = legacy?.name ?? search?.name;
  const canonical = name ? design20Directory.find(doctor => doctorNameKey(doctor.name) === doctorNameKey(name)) : null;
  if (canonical) return canonical;
  if (legacy) return legacy;
  if (search) return {
    id: `d20-search-${doctorNameKey(search.name)}`, name: search.name, speciality: search.speciality, degrees: "",
    hospital: search.hospital, hospitals: [search.hospital], city: search.city,
    experience: search.experience, img: search.image, expertise: search.expertise ? [search.expertise] : [],
    rating: 0, reviews: 0, fee: DESIGN20_SIMULATED_BOOKING.fee,
    modes: { hospital: search.consultationType !== "video", video: search.consultationType === "both" || search.consultationType === "video" },
    availability: { ...DESIGN20_SIMULATED_BOOKING.availability },
  };
  if (!featuredLegacySlugs.has(id)) return null;
  // Only these existing hand-curated records may use the older registry; never its synthetic fallback.
  const featured = getBookingDoctor(id);
  return {
    id: featured.id, name: featured.name, speciality: featured.speciality, degrees: featured.subSpeciality,
    hospital: featured.hospital, hospitals: featured.locations?.map(location => location.name), city: featured.city,
    experience: featured.experienceYears, img: featured.img, fee: featured.fee, languages: featured.languages,
    rating: featured.rating, reviews: featured.reviews,
    modes: { ...DESIGN20_SIMULATED_BOOKING.modes }, availability: { ...DESIGN20_SIMULATED_BOOKING.availability },
  };
}

export function getDesign20VerifiedDoctor(id: string): DoctorListingItem | null {
  return bangaloreIds.has(id) ? design20BangaloreDoctors.find(doctor => doctor.id === id) ?? null : null;
}

export function getDesign20ProfileDoctor(id: string, params: Pick<URLSearchParams, "get">): DoctorListingItem | null {
  const source = getDesign20DirectoryDoctor(id, params.get("name"));
  return source ? { ...selectDesign17ProfileHospital(source, params.get("hospital") ?? ""), name: presentationDoctorName(source.name) } : null;
}

export function getDesign20BookingDoctor(id: string, name?: string | null): BookingDoctorSummary | null {
  const doctor = getDesign20DirectoryDoctor(id, name);
  if (!doctor) return null;
  return {
    id: doctor.id, name: presentationDoctorName(doctor.name), speciality: doctor.speciality,
    subSpeciality: doctor.degrees, hospital: doctor.hospital, city: doctor.city,
    locations: [...new Set([doctor.hospital, ...(doctor.hospitals ?? [])])].map(name => ({ name, city: doctor.city })),
    experienceYears: doctor.experience, rating: doctor.rating, reviews: doctor.reviews,
    img: doctor.img, fee: doctor.fee, languages: [...(doctor.languages ?? [])],
  };
}

export function getDesign20RelatedDoctors(id: string, mode: ConsultationMode): DoctorListingItem[] {
  const currentId = getDesign20DirectoryDoctor(id)?.id ?? id;
  return design20Directory.filter(doctor => doctor.id !== currentId && doctor.modes[mode] === true).slice(0, 8);
}
