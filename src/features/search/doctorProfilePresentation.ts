import type { DoctorListingItem } from "./doctorListing";
import { getDoctorProfileContent } from "./doctorProfileContent";
import type { DoctorProfilePreviewContent } from "./doctorProfilePreview";
import { getDoctorProfileVideos, type DoctorProfileVideo } from "./doctorProfileMedia";
import type { CapturedDoctorProfile } from "./doctorProfileSource";

/** Adapt published fields for presentation without manufacturing missing content. */
export function getDoctorProfilePresentation(doctor: DoctorListingItem, source?: CapturedDoctorProfile | null) {
  const base = getDoctorProfileContent(doctor);
  const sourceHospitals = source?.overview.locations.map(location => location.name) ?? [];
  const hospital = sourceHospitals.includes(doctor.hospital) ? doctor.hospital : sourceHospitals[0] ?? doctor.hospital;
  const displayDoctor: DoctorListingItem = source ? {
    ...doctor,
    name: source.name,
    designation: source.overview.designation,
    speciality: source.overview.mainSpecialties.join(" · ") || doctor.speciality,
    degrees: source.overview.qualifications.join("; "),
    hospital,
    hospitals: sourceHospitals,
    // Prefer the portrait published on this doctor's NH profile; never promote
    // the listing's illustrative avatar when the source has no photograph.
    img: source.overview.image || (/\/images\/misc\/doctor_avatar_/.test(doctor.img) ? "" : doctor.img) || "",
    expertise: [...source.overview.mainSpecialties, ...source.overview.subSpecialties],
  } : doctor;
  const qualifications = source?.overview.qualifications ?? base.qualifications;
  const expertise = source ? [...source.overview.mainSpecialties, ...source.overview.subSpecialties] : base.expertise;
  const rawExperience = source ? source.overview.experience ?? "" : base.verifiedExperience ?? "";
  const experience = /^\d+\+?$/.test(rawExperience.trim()) ? `${rawExperience.trim()} years` : rawExperience;
  const languages = source ? source.overview.languages ?? [] : doctor.languages ?? [];
  const faqs = source ? [...source.faqs] : [...base.faqs];
  // Marketing's requested FAQs are factual projections of supplied fields.
  // Existing source questions always take precedence; these are not invented testimonials.
  if (source && !source.faqs.length) {
    if (qualifications.length) faqs.push({ question: `What are ${source.name}’s qualifications?`, answer: `${source.name} holds ${qualifications.join("; ")}.` });
    if (experience) faqs.push({ question: `How much experience does ${source.name} have?`, answer: `${source.name} has ${experience}.` });
    if (expertise.length) faqs.push({ question: `What are ${source.name}’s areas of expertise?`, answer: `The published areas of expertise are ${expertise.join("; ")}.` });
    if (sourceHospitals.length) faqs.push({ question: `Where does ${source.name} consult?`, answer: `${source.name} consults at ${sourceHospitals.join("; ")}.` });
  }
  const content: DoctorProfilePreviewContent = {
    ...base,
    qualifications: [...qualifications],
    expertise: [...expertise],
    hospitals: source ? sourceHospitals : base.hospitals,
    treatments: source?.treatments?.items ?? (source ? [] : base.treatments),
    articles: source?.blogs?.items ?? (source ? [] : base.articles),
    faqs,
    verifiedExperience: experience || null,
    displayExperience: experience,
    displayLanguages: languages,
    sampleFields: [], sampleSections: [], hasSampleContent: !!source?.isSample,
  };
  const sourceVideos: DoctorProfileVideo[] = (source?.videos?.items ?? []).flatMap((video, index) => {
    const id = youtubeId(video.url);
    if (!id) return [];
    return [{ id, title: video.title, thumbnail: video.thumbnail ?? "", speaker: video.speaker || "Narayana Health", location: video.location,
      description: video.description, year: video.date, doctorIds: source?.isSample ? [] : [doctor.id], sourceOrder: index }];
  });
  const media = sourceVideos.length ? { videos: sourceVideos, kind: source?.isSample ? "speciality" as const : "doctor" as const }
    : getDoctorProfileVideos(doctor);
  const linkedVideos = (source?.videos?.items ?? []).filter(video => !youtubeId(video.url));
  return { doctor: displayDoctor, content, media, linkedVideos };
}

export function youtubeId(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    const host = url.hostname.replace(/^www\./, "");
    const id = host === "youtu.be" ? url.pathname.slice(1)
      : ["youtube.com", "youtube-nocookie.com"].includes(host) ? url.searchParams.get("v") ?? url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1] : null;
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  } catch { return null; }
}
