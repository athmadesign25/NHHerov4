// ─── BOOKING — DOCTOR LOOKUP ─────────────────────────────────────────────────
// Single source for resolving a route slug to a bookable doctor.
// Replace with an API call when the backend is available.

import { searchDoctorsData } from "@/app/search/mockDoctors";
import { allSearchDataDoctors } from "@/components/search/NHSearchExperience/searchData";
import type { BookingDoctorSummary } from "./types";

/** Hand-curated profiles (slug-style ids used by the doctor profile page). */
const FEATURED_DOCTORS: Record<string, BookingDoctorSummary> = {
  "dr-rajiv-menon": {
    id: "dr-rajiv-menon",
    name: "Dr. Rajiv Menon",
    speciality: "Cardiology",
    subSpeciality: "Interventional Cardiology",
    hospital: "NH Bangalore — Mazumdar Shaw",
    city: "Bengaluru",
    locations: [
      { name: "NH Bangalore — Mazumdar Shaw", city: "Bengaluru" },
      { name: "Narayana Health City", city: "Bengaluru" },
    ],
    experienceYears: "22 Years",
    rating: 4.9,
    reviews: 1240,
    img: "/assets/doctor_1.png",
    fee: "₹1,500",
    languages: ["English", "Hindi", "Kannada", "Tamil"],
  },
  "dr-priya-sharma": {
    id: "dr-priya-sharma",
    name: "Dr. Priya Sharma",
    speciality: "Neurology",
    subSpeciality: "Neurointerventional",
    hospital: "NH Kolkata",
    city: "Kolkata",
    locations: [{ name: "NH Kolkata", city: "Kolkata" }],
    experienceYears: "15 Years",
    rating: 4.8,
    reviews: 890,
    img: "/assets/doctor_2.png",
    fee: "₹1,200",
    languages: ["English", "Hindi", "Bengali"],
  },
  "dr-arun-krishnan": {
    id: "dr-arun-krishnan",
    name: "Dr. Arun Krishnan",
    speciality: "Oncology",
    subSpeciality: "Surgical Oncology",
    hospital: "NH Bangalore — Mazumdar Shaw",
    city: "Bengaluru",
    locations: [{ name: "NH Bangalore — Mazumdar Shaw", city: "Bengaluru" }],
    experienceYears: "28 Years",
    rating: 4.9,
    reviews: 2100,
    img: "/assets/doctor_3.png",
    fee: "₹2,000",
    languages: ["English", "Kannada", "Tamil", "Hindi"],
  },
};

type SearchDoctor = (typeof searchDoctorsData)[number];

function getDoctorLocations(primaryHospital: string, city: string) {
  const normCity = (city || "").toLowerCase();
  if (normCity.includes("bangalore") || normCity.includes("bengaluru")) {
    const list = [
      { name: "Narayana Health City, Bangalore", city: "Bangalore" },
      { name: "Mazumdar Shaw Medical Centre, Electronic City", city: "Bangalore" },
      { name: "Narayana Institute of Cardiac Sciences", city: "Bangalore" },
      { name: "Narayana Multispeciality Hospital, HSR Layout", city: "Bangalore" },
      { name: "Narayana Hospital, Whitefield", city: "Bangalore" },
    ];
    if (primaryHospital && !list.some(h => h.name.toLowerCase().includes(primaryHospital.toLowerCase()))) {
      return [{ name: primaryHospital, city: "Bangalore" }, ...list];
    }
    return list;
  }
  if (normCity.includes("kolkata")) {
    return [
      { name: "Rabindranath Tagore International Institute of Cardiac Sciences", city: "Kolkata" },
      { name: "Narayana Superspeciality Hospital, Howrah", city: "Kolkata" },
      { name: "Narayana Multispeciality Hospital, Barasat", city: "Kolkata" },
    ];
  }
  if (normCity.includes("delhi") || normCity.includes("gurugram") || normCity.includes("ncr")) {
    return [
      { name: "Dharamshila Narayana Superspeciality Hospital, Delhi", city: "Delhi" },
      { name: "Narayana Superspeciality Hospital, Gurugram", city: "Gurugram" },
    ];
  }
  return [
    { name: primaryHospital || "Narayana Health City, Bangalore", city: city || "Bangalore" },
    { name: "Mazumdar Shaw Medical Centre, Electronic City", city: city || "Bangalore" },
    { name: "Narayana Multispeciality Hospital, HSR Layout", city: city || "Bangalore" },
    { name: "Narayana Hospital, Whitefield", city: city || "Bangalore" },
  ];
}

/** Search-listing doctors use ids like "dr-1" … "dr-50". */
function fromSearchDoctor(d: SearchDoctor): BookingDoctorSummary {
  return {
    id: d.id,
    name: d.name,
    speciality: d.speciality,
    subSpeciality: "",
    hospital: d.hospital,
    city: d.city,
    locations: getDoctorLocations(d.hospital, d.city),
    experienceYears: d.experience,
    rating: d.rating,
    reviews: d.reviews,
    img: d.img,
    fee: d.fee,
  };
}

/**
 * Resolves a route slug to the doctor being booked.
 * Checks featured profiles, mockDoctors, spotlight search data, and dynamically
 * synthesizes a profile from the slug so the booking flow never hits a 404.
 */
export function getBookingDoctor(slug: string): BookingDoctorSummary {
  if (Object.prototype.hasOwnProperty.call(FEATURED_DOCTORS, slug)) {
    return FEATURED_DOCTORS[slug];
  }

  const match = searchDoctorsData.find(
    (d) =>
      d.id === slug ||
      d.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").includes(slug.replace(/^dr-/, "")) ||
      slug.includes(d.id)
  );
  if (match) return fromSearchDoctor(match);

  const searchMatch = allSearchDataDoctors.find(
    (d) =>
      d.id === slug ||
      d.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").includes(slug.replace(/^dr-/, "")) ||
      slug.includes(d.id)
  );
  if (searchMatch) {
    return {
      id: slug,
      name: searchMatch.name,
      speciality: searchMatch.speciality,
      subSpeciality: searchMatch.expertise || searchMatch.speciality,
      hospital: searchMatch.hospital,
      city: searchMatch.city,
      locations: getDoctorLocations(searchMatch.hospital, searchMatch.city),
      experienceYears: searchMatch.experience,
      rating: 4.8,
      reviews: 320,
      img: searchMatch.image,
      fee: "₹1,200",
      languages: ["English", "Hindi"],
    };
  }

  // Universal dynamic fallback — formats slug (e.g., "dr-colin-john" -> "Dr. Colin John")
  const formattedName = slug
    .replace(/^dr-?/i, "")
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    id: slug,
    name: formattedName ? `Dr. ${formattedName}` : "Dr. Aditi Singhvi",
    speciality: "Cardiology",
    subSpeciality: "Senior Consultant",
    hospital: "Narayana Health City, Bangalore",
    city: "Bengaluru",
    locations: getDoctorLocations("Narayana Health City, Bangalore", "Bengaluru"),
    experienceYears: "18+ Years",
    rating: 4.9,
    reviews: 580,
    img: "/assets/doctor_1.png",
    fee: "₹1,200",
    languages: ["English", "Hindi"],
  };
}

/** Design 3 only: never resolve an ID by substring or synthesize a clinician. */
export function getDesign3BookingDoctor(id: string): BookingDoctorSummary | null {
  const doctor = searchDoctorsData.find((item) => item.id === id);
  if (!doctor) return null;
  return {
    ...fromSearchDoctor(doctor),
    locations: [...new Set([doctor.hospital, ...("hospitals" in doctor ? doctor.hospitals ?? [] : [])])]
      .filter(Boolean).map((name) => ({ name, city: doctor.city })),
  };
}
