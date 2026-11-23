import { NH_CITIES } from "@/lib/searchService";
import type { DoctorListingItem } from "./doctorListing";
import { CITY_CONSULTATION_LANGUAGES } from "./cityLanguages";

/** Explicitly fictional fixtures, used only by Design 3's local directory. */
export const DESIGN3_EMPTY_CITY = "Hosur";
// Stable variation keeps refreshes and booking links predictable during reviews.
const cityCounts: Record<string, number> = {
  Guwahati: 5, Dharwad: 2, Shimoga: 1, Ahmedabad: 6, Jaipur: 5, Kolar: 1,
  Mumbai: 6, Raipur: 3, Kolkata: 6, Davangere: 2, Barasat: 1, Jamshedpur: 4,
  Gurugram: 5, Howrah: 3, Delhi: 6, Mysore: 4, Katra: 1, Jammu: 2,
};
const hospitalCounts: Record<string, number> = {
  Guwahati: 3, Dharwad: 3, Shimoga: 2, Ahmedabad: 4, Jaipur: 3, Kolar: 2,
  Mumbai: 4, Raipur: 2, Kolkata: 4, Davangere: 2, Barasat: 2, Jamshedpur: 3,
  Gurugram: 4, Howrah: 3, Delhi: 4, Mysore: 3, Katra: 2, Jammu: 2,
};
const hospitalNames = ["Central", "Riverside", "Northside", "Southside"];
const profiles = [
  { name: "Dr. Ananya Rao (Preview)", speciality: "Cardiologist", degrees: "MBBS, MD", gender: "Female", expertise: ["Heart failure"], img: "/assets/doctor_2.png" },
  { name: "Dr. Rohan Mehta (Preview)", speciality: "Orthopaedician", degrees: "MBBS, MS", gender: "Male", expertise: ["Joint replacement"], img: "/assets/doctor_1.png" },
  { name: "Dr. Karan Sen (Preview)", speciality: "Neurologist", degrees: "MBBS, MD, DM", gender: "Male", expertise: ["Stroke care"], img: "/assets/doctor_3.png" },
  { name: "Dr. Meera Shah (Preview)", speciality: "Pediatrician", degrees: "MBBS, MD", gender: "Female", expertise: ["Child development"], img: "/assets/doctor_2.png" },
  { name: "Dr. Arjun Nair (Preview)", speciality: "General Surgeon", degrees: "MBBS, MS", gender: "Male", expertise: ["Laparoscopic surgery"], img: "/assets/doctor_1.png" },
  { name: "Dr. Vikram Das (Preview)", speciality: "Pulmonologist", degrees: "MBBS, MD", gender: "Male", expertise: ["Asthma care"], img: "/assets/doctor_3.png" },
];

// Bangalore retains its existing directory. Hosur deliberately exercises the
// empty state; neither this exclusion nor these fixtures apply to API results.
export const design3CityDoctors: DoctorListingItem[] = NH_CITIES
  .filter(({ value }) => value !== "Bangalore" && value !== DESIGN3_EMPTY_CITY)
  .flatMap(({ id, value: city }) => {
    const hospitals = hospitalNames.slice(0, hospitalCounts[city] ?? 2)
      .map((name) => `Narayana ${name} Hospital, ${city}`);
    return profiles.slice(0, cityCounts[city] ?? 1).map((profile, index) => ({
    ...profile,
    id: `d3-preview-${id}-${index + 1}`,
    city,
    hospital: hospitals[index % hospitals.length],
    // Exercise one to four affiliations without losing any city's hospital
    // filters. A city with one doctor keeps its complete hospital pool.
    hospitals: Array.from(
      { length: (cityCounts[city] ?? 1) === 1 ? hospitals.length : Math.min(hospitals.length, index % 4 + 1) },
      (_, offset) => hospitals[(index + offset) % hospitals.length],
    ),
    experience: ["12 Years", "15 Years", "10 Years"][index % 3],
    fee: ["₹1,000", "₹1,200", "₹900"][index % 3],
    rating: 0,
    reviews: 0,
    // Explicit fictional directory data only; never enrich live doctors by their city.
    languages: [...new Set(["English", "Hindi", CITY_CONSULTATION_LANGUAGES[city]].filter(Boolean))],
    availability: {
      hospital: index === 1 ? "Tomorrow, 10:30 AM" : "Today, 11:30 AM",
      video: index === 0 ? "Today, 04:00 PM" : "Tomorrow, 02:00 PM",
    },
    modes: { hospital: true, video: true },
    }));
  });

export function getDesign3CityDoctor(id: string) {
  return design3CityDoctors.find((doctor) => doctor.id === id);
}
