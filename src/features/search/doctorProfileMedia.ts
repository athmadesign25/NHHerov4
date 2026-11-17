import type { DoctorListingItem } from "./doctorListing";

export interface DoctorProfileVideo {
  id: string;
  title: string;
  thumbnail: string;
  year?: string;
  speaker: string;
  location?: string;
  description?: string;
  doctorIds: readonly string[];
}

/** Official Narayana Health uploads checked 4 November 2026.
 * YouTube IDs are also the source identifiers: https://www.youtube.com/watch?v={id}.
 * Keep doctor attribution separate from speciality relevance.
 */
const videos = {
  heartDay: { id: "UtahdIgEOww", title: "Message from Dr. Devi Shetty | World Heart Day", thumbnail: "/assets/doctor-profile-videos/devi-world-heart-day.jpg", year: "2022", speaker: "Dr. Devi Shetty", doctorIds: ["dr-1"] },
  heartHealth: { id: "FUMohmy_cqs", title: "How to Keep Your Heart Healthy: Insights from Dr. Devi Shetty", thumbnail: "/assets/doctor-profile-videos/devi-heart-health.jpg", year: "2015", speaker: "Dr. Devi Shetty", doctorIds: ["dr-1"] },
  heartPanel: { id: "JQvqsjQx3tE", title: "Heart Diseases: Treatment & Prevention", thumbnail: "/assets/doctor-profile-videos/JQvqsjQx3tE.jpg", year: "2015", speaker: "Dr. Devi Shetty & expert panel", doctorIds: ["dr-1"] },
  bloodPressure: { id: "ai-WD7atMco", title: "World Hypertension Day: Blood Pressure Monitoring", thumbnail: "/assets/doctor-profile-videos/ai-WD7atMco.jpg", year: "2023", speaker: "Dr. Devi Shetty", doctorIds: ["dr-1"] },
  nursesDay: { id: "KZsR3_fjUTc", title: "A Message for International Nurses Day", thumbnail: "/assets/doctor-profile-videos/KZsR3_fjUTc.jpg", year: "2022", speaker: "Dr. Devi Shetty", doctorIds: ["dr-1"] },
  paediatricSurgery: { id: "lHW7pZy-iTg", title: "Guide to Pediatric Surgery", thumbnail: "/assets/doctor-profile-videos/paediatric-surgery-guide.jpg", year: "2024", speaker: "Dr. Subhadeep Das & Dr. Goutam Chakraborty", doctorIds: [] },
  hipReplacement: { id: "pgqTchwyNfY", title: "Direct Anterior Hip Replacement by Dr. Abhinandan S Punit", thumbnail: "/assets/doctor-profile-videos/abhinandan-hip-replacement.jpg", year: "2024", speaker: "Dr. Abhinandan S Punit", doctorIds: ["d20-dr-abhinandan-s-punit"] },
  // Listed on NH's Abhinandan profile. Its source omits upload dates, so do not
  // manufacture years. Patient stories are labelled separately from doctor talks.
  orthopaedicPatientStory: { id: "gVdT54jU1jQ", title: "Dr Abhinandan S Punit | Orthopedic Surgeon |Review | Md Maksud Alli khan", thumbnail: "/assets/doctor-profile-videos/gVdT54jU1jQ.jpg", speaker: "Patient story · Narayana Health", doctorIds: ["d20-dr-abhinandan-s-punit"] },
  hipReplacementPatientStory: { id: "hPTVUtx7PjM", title: "Successful Hip Replacement by Dr Abhinandan S Punit | Patient Success Story", thumbnail: "/assets/doctor-profile-videos/hPTVUtx7PjM.jpg", speaker: "Patient story · Narayana Health", doctorIds: ["d20-dr-abhinandan-s-punit"] },
  roboticKneeReplacement: { id: "b554qQdqH10", title: "Robotic Knee Replacement: Transforming Orthopaedics with Dr Abhinandan S Punit", thumbnail: "/assets/doctor-profile-videos/b554qQdqH10.jpg", speaker: "Dr. Abhinandan S Punit", doctorIds: ["d20-dr-abhinandan-s-punit"] },
  anteriorHipPatientStory: { id: "02MA_32TQuU", title: "Patient Success Story | Direct Anterior Hip Replacement", thumbnail: "/assets/doctor-profile-videos/02MA_32TQuU.jpg", speaker: "Patient story · Narayana Health", doctorIds: ["d20-dr-abhinandan-s-punit"] },
  arthritis: { id: "sw2Y3p19gMA", title: "What is Arthritis? | Dr. Abhinandan S Punit", thumbnail: "/assets/doctor-profile-videos/sw2Y3p19gMA.jpg", speaker: "Dr. Abhinandan S Punit", doctorIds: ["d20-dr-abhinandan-s-punit"] },
  digestiveCare: { id: "mk-yoTsYfZs", title: "Specialized Digestive Care by Narayana Health", thumbnail: "/assets/doctor-profile-videos/digestive-care.jpg", year: "2024", speaker: "Narayana Health", doctorIds: [] },
  brainCare: { id: "FGkuPwqC3KU", title: "Best Brain Care — Taking Care with Narayana Health", thumbnail: "/assets/doctor-profile-videos/brain-care.jpg", year: "2025", speaker: "Narayana Health", doctorIds: [] },
} satisfies Record<string, DoctorProfileVideo>;

type VideoKey = keyof typeof videos;

/** Exact clinical matches prevent paediatric cardiac or neuro-surgery profiles
 * inheriting an unrelated general paediatric surgery clip.
 */
const specialityVideos: Readonly<Record<string, readonly VideoKey[]>> = {
  "adult cardiology": ["heartHealth", "heartDay"],
  cardiologist: ["heartHealth", "heartDay"],
  cardiology: ["heartHealth", "heartDay"],
  "adult cardiac surgery": ["heartHealth", "heartDay"],
  "cardiac surgeon": ["heartHealth", "heartDay"],
  "heart failure & transplantation medicine": ["heartHealth"],
  "paediatric & congenital heart surgery": ["heartHealth"],
  "paediatric surgery": ["paediatricSurgery"],
  "paediatric surgeon": ["paediatricSurgery"],
  "orthopaedic surgery": ["hipReplacement"],
  orthopaedician: ["hipReplacement"],
  "orthopaedics & joint replacement": ["hipReplacement"],
  "medical gastroenterology": ["digestiveCare"],
  "surgical gastroenterology": ["digestiveCare"],
  gastroenterologist: ["digestiveCare"],
  "gastrointestinal oncology": ["digestiveCare"],
  neurology: ["brainCare"],
  neurologist: ["brainCare"],
  neurosurgery: ["brainCare"],
  "interventional neurology": ["brainCare"],
};

export function getDoctorProfileVideos(doctor: Pick<DoctorListingItem, "id" | "speciality">): {
  videos: readonly DoctorProfileVideo[];
  kind: "doctor" | "speciality";
} {
  const own = (Object.values(videos) as DoctorProfileVideo[]).filter(video => video.doctorIds.includes(doctor.id));
  if (own.length) return { videos: own, kind: "doctor" };
  const keys = doctor.speciality.toLowerCase().split(/\s*[,|/]\s*/)
    .flatMap(speciality => specialityVideos[speciality.trim()] ?? []);
  return { videos: [...new Set(keys)].slice(0, 2).map(key => videos[key]), kind: "speciality" };
}

export function hasDoctorProfileVideos(doctor: Pick<DoctorListingItem, "id" | "speciality">): boolean {
  return getDoctorProfileVideos(doctor).videos.length > 0;
}
