import { indiaDate } from "@/features/booking/appointmentTime";

export type DoctorNavEntry = "specialty" | "location" | "condition" | "sunday" | "today";

const specialtyFacets: Record<string, string> = {
  Cardiologists: "Cardiologist", Neurologists: "Neurologist", Orthopedists: "Orthopaedician",
  "Orthopedic Surgeons": "Orthopaedic Surgery", Endocrinologists: "Endocrinologist",
  Rheumatologists: "Rheumatology", Urologists: "Urologist", Gastroenterologists: "Gastroenterologist",
  Pulmonologists: "Pulmonologist", Dermatologists: "Dermatologist", Oncologists: "Oncologist",
  Psychiatrists: "Psychiatry", Gynecologists: "Gynecologist", Ophthalmologists: "Ophthalmology",
  Nephrologists: "Nephrologist", "Cardiac Surgeons": "Cardiac Surgeon", Pediatricians: "Pediatrician",
  "General Surgeons": "General Surgeon", "ENT Specialists": "ENT Specialist", "Plastic Surgeons": "Plastic Surgeon",
  "Vascular Surgeons": "Vascular Surgeon", Neurosurgeons: "Neurosurgery", "Radiation Oncologists": "Radiation Oncology",
  "Medical Oncologists": "Medical Oncology", "Transplant Specialists": "Transplant Surgery",
  "Internal Medicine Specialists": "General Medicine",
};

export function doctorNavUrl(entry?: DoctorNavEntry, value?: string, now = new Date()): string {
  const params = new URLSearchParams({ design: "d20" });
  if (entry === "specialty" && value) params.set("specialties", specialtyFacets[value] ?? value);
  if (entry === "location" && value) params.set("location", value);
  if (entry === "today") params.set("availability", "today");
  if (entry === "sunday") {
    const date = new Date(`${indiaDate(now)}T00:00:00+05:30`);
    const day = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", weekday: "short" }).format(now);
    const untilSunday = (7 - ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(day)) % 7;
    date.setTime(date.getTime() + untilSunday * 86400000);
    params.set("appointmentDate", indiaDate(date));
  }
  return `/search/doctors?${params}`;
}
