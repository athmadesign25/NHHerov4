import type { DoctorListingItem } from "./doctorListing";

interface FeaturedClinicalSource {
  profileUrl: string;
  designation: string;
  specialties: readonly string[];
  navigationAliases: readonly string[];
  qualifications: string;
  expertise: readonly string[];
  hospitals: readonly string[];
}

/** Official profile details checked on 28 October 2026; scoped to D20's restored cards. */
export const design20FeaturedClinicalSource: Readonly<Record<string, FeaturedClinicalSource>> = {
  "dr-1": {
    profileUrl: "https://www.narayanahealth.org/c/bangalore/cardiac-surgery-adult/dr-devi-prasad-shetty",
    designation: "Founder & Chairman",
    specialties: ["Paediatric & Congenital Heart Surgery", "Adult Cardiac Surgery"],
    navigationAliases: ["Cardiac Surgeon"],
    qualifications: "MBBS, MS (General Surgery), FRCS (Cardiac Thoracic Surgery)",
    expertise: ["Paediatric & Congenital Heart Surgery", "Adult Cardiac Surgery"],
    hospitals: ["Narayana Institute of Cardiac Sciences, Bangalore"],
  },
  "dr-ashley": {
    profileUrl: "https://www.narayanahealth.org/c/bangalore/paediatric-surgery/dr-ashley-lucien-joseph-d-cruz",
    designation: "Senior Consultant",
    specialties: ["Paediatric Surgery"],
    navigationAliases: ["Paediatric Surgeon"],
    qualifications: "MBBS, MS (General Surgery), MCh (Paediatric Surgery)",
    expertise: ["Paediatric Surgery", "Robotic Surgery", "Paediatric Airway Surgery", "Paediatric Urology & Kidney Transplant"],
    hospitals: ["Mazumdar Shaw Medical Centre, Bangalore", "Narayana Multispeciality Hospital, HSR Bangalore"],
  },
};

/** Preserve identity, portrait and interaction-preview values without carrying synthetic clinical claims. */
export function withDesign20FeaturedClinicalMetadata(doctor: DoctorListingItem): DoctorListingItem {
  const source = design20FeaturedClinicalSource[doctor.id];
  if (!source) return doctor;
  return {
    ...doctor,
    designation: source.designation,
    speciality: source.specialties.join(", "),
    specialityAliases: source.navigationAliases,
    degrees: source.qualifications,
    expertise: source.expertise,
    hospital: source.hospitals[0],
    hospitals: source.hospitals,
    hospitalCount: source.hospitals.length > 1 ? `+${source.hospitals.length - 1}` : "",
    practiceLocations: undefined,
    experience: "",
    languages: [],
    gender: undefined,
    rating: 0,
    reviews: 0,
  };
}
