import type { DoctorListingItem } from "./doctorListing";

// User-approved synthetic metadata for Design 3's sample directory only.
// These values are not verified clinician attributes and must not enrich API results.
const demoGenders: Record<string, string> = {
  "dr-1": "Male", "dr-ashley": "Male", "dr-2": "Female", "dr-3": "Male", "dr-4": "Female",
  "dr-5": "Male", "dr-6": "Female", "dr-7": "Male", "dr-8": "Male", "dr-9": "Female",
  "dr-10": "Male", "dr-11": "Female", "dr-12": "Male", "dr-13": "Female", "dr-14": "Male",
  "dr-15": "Female", "dr-16": "Male", "dr-17": "Male", "dr-18": "Male", "dr-19": "Male",
  "dr-20": "Male", "dr-21": "Female", "dr-22": "Female", "dr-23": "Female", "dr-24": "Female",
  "dr-25": "Female", "dr-26": "Male", "dr-27": "Male", "dr-28": "Male", "dr-29": "Male",
  "dr-30": "Male", "dr-31": "Female", "dr-32": "Female", "dr-33": "Female", "dr-34": "Female",
};
const demoLanguages = [
  ["English", "Hindi", "Kannada"], ["English", "Tamil", "Telugu"],
  ["English", "Hindi", "Bengali"], ["English", "Kannada", "Malayalam"],
  ["English", "Hindi", "Marathi"], ["English", "Hindi", "Urdu"],
] as const;
const demoExpertise: Record<string, readonly string[]> = {
  Cardiologist: ["Interventional cardiology", "Heart failure"],
  Orthopaedician: ["Joint replacement", "Sports injuries"],
  Oncologist: ["Medical oncology", "Cancer care"],
  Neurologist: ["Stroke care", "Epilepsy"],
  Pediatrician: ["Child development", "General paediatrics"],
  "Cardiac Surgeon": ["Coronary bypass surgery", "Heart valve surgery"],
  "General Surgeon": ["Laparoscopic surgery", "Hernia surgery"],
  "Vascular Surgeon": ["Vascular surgery", "Varicose veins"],
  "Plastic Surgeon": ["Reconstructive surgery", "Hand surgery"],
  Gastroenterologist: ["Digestive health", "Endoscopy"],
  Pulmonologist: ["Asthma care", "Sleep medicine"],
  Endocrinologist: ["Diabetes care", "Thyroid disorders"],
  Nephrologist: ["Kidney care", "Dialysis"],
  Urologist: ["Kidney stones", "Urological surgery"],
  Gynecologist: ["Gynaecology", "Maternal care"],
  "ENT Specialist": ["Sinus care", "Hearing disorders"],
  Dermatologist: ["Clinical dermatology", "Skin allergies"],
};

export function withDesign3DemoMetadata(doctors: readonly DoctorListingItem[]): DoctorListingItem[] {
  return doctors.map((doctor, index) => !Object.hasOwn(demoGenders, doctor.id) ? doctor : {
    ...doctor,
    languages: doctor.languages ?? demoLanguages[index % demoLanguages.length],
    gender: doctor.gender ?? demoGenders[doctor.id],
    expertise: doctor.expertise ?? demoExpertise[doctor.speciality] ?? [],
  });
}
