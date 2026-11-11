import sourceData from "./doctorProfileSourceData.json";
import type { DoctorListingItem } from "./doctorListing";

export interface CapturedProfileTextItem { text: string; link?: string }
export interface CapturedProfileAdditionalSection {
  id: string;
  title: string;
  paragraphs: readonly string[];
  items?: readonly CapturedProfileTextItem[];
}

/** Published source content only. Booking previews and source rating placeholders are excluded. */
export interface CapturedDoctorProfile {
  sourceUrl: string;
  fetchedAt: string;
  slug: string;
  sourceId?: number;
  sourceDoctorCode?: string;
  name: string;
  isSample?: boolean;
  overview: {
    image: string;
    designation: string;
    qualifications: readonly string[];
    mainSpecialties: readonly string[];
    subSpecialties: readonly string[];
    locations: readonly { name: string; id?: number; code?: string }[];
    experience?: string;
    contact?: string;
    languages?: readonly string[];
  };
  about: { title: string; text: string } | null;
  treatments: { title: string; items: readonly string[] } | null;
  achievements: { title: string; groups: readonly { title: string; items: readonly CapturedProfileTextItem[] }[] } | null;
  videos: { title: string; items: readonly {
    title: string; url: string; thumbnail?: string; description?: string; date?: string; speaker?: string; location?: string;
  }[] } | null;
  blogs: { title: string; items: readonly {
    title: string; url: string; thumbnail?: string; alt?: string; author?: string; date?: string; category?: string; categoryUrl?: string;
  }[] } | null;
  faqs: readonly { question: string; answer: string }[];
  additionalSections: readonly CapturedProfileAdditionalSection[];
  hasEnquiry: boolean;
}

/** URLs remain data, never HTML. Reject executable schemes and network-relative links. */
export function safeDoctorProfileLink(value: unknown): string | undefined {
  if (typeof value !== "string" || !value || /[\u0000-\u001f\u007f]/.test(value)) return undefined;
  const text = value.trim();
  if (/^\/(?:assets|images)\/[a-zA-Z0-9_./-]+$/.test(text) && !text.split("/").includes("..")) return text;
  try {
    const url = new URL(text);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) return undefined;
    return text;
  } catch { return undefined; }
}

function safeProfile(profile: CapturedDoctorProfile): CapturedDoctorProfile {
  const safeItem = (item: CapturedProfileTextItem): CapturedProfileTextItem => ({ text: item.text,
    ...(safeDoctorProfileLink(item.link) ? { link: safeDoctorProfileLink(item.link) } : {}),
  });
  return {
    ...profile,
    sourceUrl: safeDoctorProfileLink(profile.sourceUrl) ?? "",
    overview: { ...profile.overview, image: safeDoctorProfileLink(profile.overview.image) ?? "" },
    achievements: profile.achievements ? { ...profile.achievements,
      groups: profile.achievements.groups.map(group => ({ ...group, items: group.items.map(safeItem) })),
    } : null,
    videos: profile.videos ? { ...profile.videos, items: profile.videos.items.map(item => ({ ...item,
      url: safeDoctorProfileLink(item.url) ?? "", thumbnail: safeDoctorProfileLink(item.thumbnail),
    })) } : null,
    blogs: profile.blogs ? { ...profile.blogs, items: profile.blogs.items.map(item => ({ ...item,
      url: safeDoctorProfileLink(item.url) ?? "", thumbnail: safeDoctorProfileLink(item.thumbnail), categoryUrl: safeDoctorProfileLink(item.categoryUrl),
    })) } : null,
    additionalSections: profile.additionalSections.map(section => ({ ...section, items: section.items?.map(safeItem) })),
  };
}

export const capturedDoctorProfiles: readonly CapturedDoctorProfile[] = sourceData.map(safeProfile);
const profilesBySlug = new Map(capturedDoctorProfiles.map(profile => [profile.slug, profile]));
const nameKey = (name: string) => name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
  .toLowerCase().replace(/^dr[.\s-]*/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const profilesByName = new Map(capturedDoctorProfiles.map(profile => [nameKey(profile.name), profile]));

export function getCapturedDoctorProfileBySlug(slug: string): CapturedDoctorProfile | null {
  return profilesBySlug.get(slug.toLowerCase().trim().replace(/^d20-/, "")) ?? null;
}

/** Require matching identity; a coincidental name from another city must not inherit this biography. */
export function getCapturedDoctorProfile(doctor: DoctorListingItem): CapturedDoctorProfile | null {
  const candidates = [doctor.profileSlug, doctor.id].filter((value): value is string => Boolean(value));
  for (const candidate of candidates) {
    const profile = getCapturedDoctorProfileBySlug(candidate);
    if (profile && nameKey(profile.name) === nameKey(doctor.name)) return profile;
  }
  if (doctor.city && !/^(bangalore|bengaluru)$/i.test(doctor.city.trim())) return null;
  return profilesByName.get(nameKey(doctor.name)) ?? null;
}

/** Source-only route fallback: no synthetic fee, slots, ratings, languages or consultation offers. */
export function capturedProfileToDoctor(profile: CapturedDoctorProfile): DoctorListingItem {
  const { overview } = profile;
  return {
    id: `captured-${profile.sourceId ?? profile.slug}`,
    profileSlug: profile.slug,
    name: profile.name,
    speciality: overview.mainSpecialties.join(", "),
    designation: overview.designation,
    degrees: overview.qualifications.join(", "),
    hospital: overview.locations[0]?.name ?? "",
    hospitals: overview.locations.map(location => location.name),
    city: "Bangalore",
    experience: overview.experience ? `${overview.experience} years` : "",
    img: overview.image,
    fee: "", rating: 0, reviews: 0, availability: {},
    modes: { hospital: null, video: null },
    expertise: [...overview.mainSpecialties, ...overview.subSpecialties],
    ...(overview.languages ? { languages: [...overview.languages] } : {}),
  };
}

const handledSourceKeys = new Set(["doctorOverview", "doctorAbout", "doctorTreatments", "doctorAchivements", "doctorVideos", "doctorBlogs", "doctorFaqData", "enquirySectionData"]);
const record = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);

/** Preserve future published, titled doctor sections without promoting SEO/config metadata into UI. */
export function extractAdditionalProfileSections(source: Record<string, unknown>): CapturedProfileAdditionalSection[] {
  return Object.entries(source).flatMap(([key, value]) => {
    if (handledSourceKeys.has(key) || !/^doctor[A-Z]/.test(key) || /meta|seo|schema|config|tracking/i.test(key)
      || !record(value) || typeof value.title !== "string" || !value.title.trim()) return [];
    const paragraphs = [value.text, value.description, value.full_description,
      ...(Array.isArray(value.paragraphs) ? value.paragraphs : [])].filter((text): text is string => typeof text === "string" && Boolean(text.trim()));
    const rawItems = Array.isArray(value.items) ? value.items : Array.isArray(value.list) ? value.list : [];
    const items = rawItems.flatMap((item): CapturedProfileTextItem[] => {
      if (typeof item === "string" && item.trim()) return [{ text: item }];
      if (!record(item) || typeof item.text !== "string" || !item.text.trim()) return [];
      const link = safeDoctorProfileLink(item.link);
      return [{ text: item.text, ...(link ? { link } : {}) }];
    });
    if (!paragraphs.length && !items.length) return [];
    return [{ id: key.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase(), title: value.title,
      paragraphs, ...(items.length ? { items } : {}) }];
  });
}
