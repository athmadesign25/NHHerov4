// ─── BOOKING — DOCTOR LOOKUP ─────────────────────────────────────────────────
// Single source for resolving a route slug to a bookable doctor.
// Replace with an API call when the backend is available.

import { searchDoctorsData } from "@/app/search/mockDoctors";
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

/** Search-listing doctors use ids like "dr-1" … "dr-50". */
function fromSearchDoctor(d: SearchDoctor): BookingDoctorSummary {
  return {
    id: d.id,
    name: d.name,
    speciality: d.speciality,
    subSpeciality: "",
    hospital: d.hospital,
    city: d.city,
    locations: [{ name: d.hospital, city: d.city }],
    experienceYears: d.experience,
    rating: d.rating,
    reviews: d.reviews,
    img: d.img,
    fee: d.fee,
  };
}

/**
 * Resolves a route slug to the doctor being booked.
 * Returns `null` for unknown slugs so the caller can 404 instead of
 * silently booking a different doctor.
 */
export function getBookingDoctor(slug: string): BookingDoctorSummary | null {
  if (Object.prototype.hasOwnProperty.call(FEATURED_DOCTORS, slug)) {
    return FEATURED_DOCTORS[slug];
  }
  const match = searchDoctorsData.find((d) => d.id === slug);
  return match ? fromSearchDoctor(match) : null;
}
