import type { DoctorListingItem } from "./doctorListing";
import { getCapturedDoctorProfileBySlug, type CapturedDoctorProfile } from "./doctorProfileSource";

const sampleItems = (label: string, count: number) => Array.from({ length: count }, (_, index) => ({
  text: `Sample ${label} ${index + 1} — illustrative content for checking long lists and complete profile layouts.`,
}));
const relatedVideos = [
  ...(getCapturedDoctorProfileBySlug("dr-abhinandan-s-punit")?.videos?.items ?? []),
  ...(getCapturedDoctorProfileBySlug("dr-bagirath-raghuraman")?.videos?.items.slice(0, 1) ?? []),
];
const relatedBlogs = getCapturedDoctorProfileBySlug("dr-aditi-singhvi")?.blogs?.items ?? [];

/** Deliberately fictional fixture. Never include this person in public doctor/booking directories or SEO. */
export const masterDoctor: DoctorListingItem = {
  id: "profile-master", profileSlug: "master-doctor-profile", name: "Dr. Aarav Mehta",
  designation: "Sample clinician — fictional profile", speciality: "Sample speciality",
  degrees: "Sample qualification; Sample advanced qualification; Sample clinical fellowship",
  hospital: "Sample hospital — Central campus", hospitals: ["Sample hospital — Central campus", "Sample clinic — North campus", "Sample clinic — South campus", "Sample hospital — West campus"],
  city: "Bangalore", experience: "20 years (sample)", img: "", fee: "", rating: 0, reviews: 0,
  availability: {}, modes: { hospital: null, video: null },
  languages: ["English", "Hindi", "Kannada"],
  expertise: ["Sample broad speciality", "Sample clinical area", "Sample advanced procedure"],
};

/** All-section layout fixture, with explicit sample text and real related media attributed to its actual authors. */
export const masterProfile: CapturedDoctorProfile = {
  sourceUrl: "", fetchedAt: "", slug: "master-doctor-profile", name: masterDoctor.name, isSample: true,
  overview: {
    image: "", designation: masterDoctor.designation!,
    qualifications: ["Sample undergraduate qualification", "Sample postgraduate qualification", "Sample advanced qualification", "Sample clinical fellowship", "Sample specialist certification", "Sample additional fellowship", "Sample professional diploma", "Sample advanced clinical training"],
    mainSpecialties: ["Sample speciality"], subSpecialties: ["Sample clinical area", "Sample advanced procedure", "Sample multidisciplinary care", "Sample preventive care"],
    locations: masterDoctor.hospitals!.map((name, index) => ({ name, code: `sample-${index + 1}` })),
    experience: "20 (sample)", languages: [...masterDoctor.languages!],
  },
  about: { title: "About", text: "Dr. Aarav Mehta is a fictional clinician created to demonstrate a complete doctor profile. Every career detail, qualification and clinical claim on this master page is illustrative. This profile is not a real healthcare professional and cannot be booked.\n\nThis sample biography shows how a longer introduction can explain a clinician’s approach, interests and current role without overwhelming the initial view. It includes enough text to exercise progressive disclosure, comfortable line lengths and consistent spacing.\n\nThe sections below cover all content types found in the reviewed NH profiles, alongside the marketing additions and a future optional section. Real NH videos and blogs are included only as related media examples and retain their actual speaker or author attribution." },
  treatments: { title: "Treatments", items: Array.from({ length: 44 }, (_, index) => `Sample ${index % 2 ? "procedure" : "condition"} ${index + 1} — a longer clinical term for layout review`) },
  achievements: { title: "Achievements", groups: [
    { title: "Awards & Recognition", items: sampleItems("recognition", 12) },
    { title: "Professional Memberships & Certifications", items: sampleItems("professional membership", 8) },
    { title: "Publications", items: sampleItems("research publication — author, title, journal, year and citation details", 10) },
    { title: "Editorial Contributions", items: sampleItems("editorial contribution", 3) },
  ] },
  videos: { title: "Related NH videos — sample collection", items: relatedVideos.map(item => ({ ...item,
    description: `Related NH media featuring ${item.speaker ?? "the named NH clinician"}. This video does not feature the fictional master-profile doctor.`,
  })) },
  blogs: { title: "Related NH blogs — sample collection", items: relatedBlogs.map(item => ({ ...item })) },
  faqs: [
    { question: "Is Dr. Aarav Mehta a real doctor?", answer: "No. This is a fictional master profile for reviewing the page structure and its interactions. It is not listed in doctor search or available for booking." },
    { question: "What qualifications does this sample profile demonstrate?", answer: "The sample displays a long qualifications list to test wrapping and disclosure. These entries are illustrative, not credentials held by a real clinician." },
    { question: "Which conditions and procedures are shown?", answer: "The treatments section contains 44 clearly marked sample terms to test long lists. They are not medical service claims." },
    { question: "Where does this sample doctor consult?", answer: "Four fictional sample locations are shown to test multi-location layouts. They do not represent actual consultation availability." },
    { question: "Who appears in the videos and writes the blogs?", answer: "The related NH videos and blogs retain the actual speakers and authors supplied by Narayana Health. They are not attributed to the fictional master-profile doctor." },
    { question: "Can this profile accept an appointment request?", answer: "No. It is an internal design fixture with no published fees, live slots or booking capability." },
  ],
  additionalSections: [
    { id: "sample-education", title: "Education & training", paragraphs: ["Sample institutional history, residency, fellowship and advanced training."], items: sampleItems("education or training entry", 6) },
    { id: "sample-past-appointments", title: "Post held in past", paragraphs: [], items: sampleItems("previous clinical appointment", 4) },
    { id: "sample-rare-skills", title: "Rare / unique skills", paragraphs: [], items: sampleItems("specialist skill", 5) },
    { id: "sample-key-procedures", title: "Key procedures performed", paragraphs: [], items: sampleItems("key procedure", 8) },
    { id: "sample-languages", title: "Languages", paragraphs: ["Sample language coverage: English, Hindi and Kannada. These choices demonstrate a multilingual profile and are not claims about a real person."] },
    { id: "sample-research", title: "Research interests", paragraphs: ["Sample research interests explain the kinds of clinical questions and outcomes a clinician studies."], items: sampleItems("research interest", 3) },
    { id: "sample-trials", title: "Clinical trials", paragraphs: ["Sample clinical-trial and investigator history. No trial registration, sponsor or study result is invented."], items: sampleItems("trial participation entry", 3) },
    { id: "sample-presentations", title: "Talks & conference presentations", paragraphs: [], items: sampleItems("invited lecture, conference presentation or poster", 6) },
    { id: "sample-teaching", title: "Teaching & mentorship", paragraphs: [], items: sampleItems("teaching or mentorship role", 4) },
    { id: "sample-milestones", title: "Clinical milestones", paragraphs: ["Sample milestones demonstrate how source-supported service achievements could be presented. No real-world case volume or success rate is claimed."], items: sampleItems("clinical milestone", 3) },
    { id: "sample-news", title: "News & media", paragraphs: ["Sample future content section. No standalone news section was populated in the 20-profile source census."], items: sampleItems("media mention", 3) },
  ],
  hasEnquiry: true,
};
