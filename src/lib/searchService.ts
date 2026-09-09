// --- Types ---

export interface ApiDoctor {
  entityId: number;
  entityType: "DOCTOR";
  name: string;
  subSpeciality: string | null;
  hospitalName: string | null;
  metaData: {
    appt_enabled?: boolean;
    walkin_enabled?: boolean;
    vc_enabled?: boolean;
  } | null;
}

export interface ApiEntity {
  entityId: number;
  entityType: "SPECIALITY" | "PROCEDURE" | "TREATMENT" | "BLOG" | "SKILL" | "DEPARTMENT" | string;
  name: string;
  subSpeciality: string | null;
  hospitalName: string | null;
  metaData: Record<string, unknown> | null;
}

export interface RawApiResponse {
  searchMode?: string;
  keyword?: string;
  doctors?: ApiDoctor[];
  specialities?: ApiEntity[];
  subSpecialities?: ApiEntity[];
  procedures?: ApiEntity[];
  treatments?: ApiEntity[];
  blogs?: ApiEntity[];
  skills?: ApiEntity[];
}

// --- Normalized types used by the UI ---

export interface NormalizedDoctor {
  id: number;
  name: string;
  speciality: string;
  hospital: string;
  photo: string;
  apptEnabled: boolean;
  walkinEnabled: boolean;
  vcEnabled: boolean;
  availability: { hospital: string; video: string };
}

export interface NormalizedSpeciality {
  id: number;
  name: string;
  slug: string;
  image: string;
}

export interface NormalizedProcedure {
  id: number;
  name: string;
  speciality: string;
  image: string;
  type: "Procedures";
}

export interface NormalizedTreatment {
  id: number;
  name: string;
  speciality: string;
  image: string;
  type: "Treatments";
}

export interface NormalizedBlog {
  id: number;
  name: string;
  speciality: string;
  image: string;
}

export interface NormalizedSubSpeciality {
  id: number;
  name: string;
  slug: string;
  image: string;
  parentSpeciality: string;
}

export interface NormalizedResults {
  doctors: NormalizedDoctor[];
  specialities: NormalizedSpeciality[];
  subSpecialities: NormalizedSubSpeciality[];
  procedures: NormalizedProcedure[];
  treatments: NormalizedTreatment[];
  blogs: NormalizedBlog[];
}

// --- City ID mapping (confirmed from production city select) ---

export const NH_CITIES: { label: string; value: string; id: number }[] = [
  { label: "Bangalore",  value: "Bangalore",  id: 37 },
  { label: "Guwahati",   value: "Guwahati",   id: 38 },
  { label: "Dharwad",    value: "Dharwad",    id: 39 },
  { label: "Shimoga",    value: "Shimoga",    id: 40 },
  { label: "Ahmedabad",  value: "Ahmedabad",  id: 41 },
  { label: "Jaipur",     value: "Jaipur",     id: 42 },
  { label: "Kolar",      value: "Kolar",      id: 43 },
  { label: "Mumbai",     value: "Mumbai",     id: 44 },
  { label: "Raipur",     value: "Raipur",     id: 45 },
  { label: "Kolkata",    value: "Kolkata",    id: 46 },
  { label: "Davangere",  value: "Davangere",  id: 47 },
  { label: "Barasat",    value: "Barasat",    id: 48 },
  { label: "Jamshedpur", value: "Jamshedpur", id: 49 },
  { label: "Gurugram",   value: "Gurugram",   id: 50 },
  { label: "Howrah",     value: "Howrah",     id: 51 },
  { label: "Delhi",      value: "Delhi",      id: 52 },
  { label: "Mysore",     value: "Mysore",     id: 53 },
  { label: "Katra",      value: "Katra",      id: 54 },
  { label: "Jammu",      value: "Jammu",      id: 55 },
  { label: "Hosur",      value: "Hosur",      id: 56 },
];

const CITY_ID_MAP: Record<string, number> = Object.fromEntries([
  ...NH_CITIES.map((c) => [c.value, c.id]),
  ["Bengaluru", 37], // alias
  ["NCR", 52],       // alias
]);

export function getCityId(cityName: string): number | null {
  if (!cityName || cityName === "All Locations" || cityName === "All") return null;
  return CITY_ID_MAP[cityName] ?? null;
}

// --- Image assets ---

const SPECIALITY_IMAGE_MAP: Record<string, string> = {
  "Cardiac Sciences": "/Specialities icons/Cardiology.svg",
  "Cardiology": "/Specialities icons/Cardiology.svg",
  "Cardiac Surgery": "/Specialities icons/Cardiology.svg",
  "Neurology": "/Specialities icons/Neurology.svg",
  "Neuro Surgery": "/Specialities icons/Neurology.svg",
  "Neurosurgery": "/Specialities icons/Neurology.svg",
  "Oncology": "/Specialities icons/Cancercare.svg",
  "Cancer Care": "/Specialities icons/Cancercare.svg",
  "Cancer Sciences": "/Specialities icons/Cancercare.svg",
  "Orthopaedics": "/Specialities icons/Orthopaedics.svg",
  "Orthopedics": "/Specialities icons/Orthopaedics.svg",
  "Orthopaedic Sciences": "/Specialities icons/Orthopaedics.svg",
  "Paediatrics": "/Specialities icons/Paedratic.svg",
  "Pediatrics": "/Specialities icons/Paedratic.svg",
  "Gastroenterology": "/Specialities icons/Gastro.svg",
  "Gastro Sciences": "/Specialities icons/Gastro.svg",
  "Ophthalmology": "/Specialities icons/General Medicine.svg",
  "ENT": "/Specialities icons/Lab test default icon.svg",
  "Gynecology": "/Specialities icons/Gynaecology.svg",
  "Gynaecology": "/Specialities icons/Gynaecology.svg",
  "Obstetrics": "/Specialities icons/Gynaecology.svg",
  "Dermatology": "/Specialities icons/Diabetology.svg",
  "Urology": "/Specialities icons/Urology.svg",
  "Pulmonology": "/Specialities icons/Pulmonology.svg",
  "Respiratory Medicine": "/Specialities icons/Pulmonology.svg",
  "Dental Care": "/Specialities icons/Dental.svg",
  "Dentistry": "/Specialities icons/Dental.svg",
  "Nephrology": "/Specialities icons/Nephrology.jpeg",
  "Renal Sciences": "/Specialities icons/Nephrology.jpeg",
  "Transplants": "/Specialities icons/Nephrology.jpeg",
  "Liver Transplant": "/Specialities icons/Nephrology.jpeg",
  "General Surgery": "/Specialities icons/Neurology.jpeg",
  "General Medicine": "/Specialities icons/General Medicine.svg",
  "Vascular Surgery": "/Specialities icons/Cardiology.jpeg",
  "Endocrinology": "/Specialities icons/Diabetology.svg",
  "Diabetology": "/Specialities icons/Diabetology.svg",
  "Haematology": "/Specialities icons/Cancercare.svg",
  "Bone Marrow Transplant": "/Specialities icons/Cancer Care.jpeg",
  "Kidney Transplant": "/Specialities icons/Nephrology.jpeg",
  "Kidney Stone": "/Specialities icons/Nephrology.jpeg",
};
const DEFAULT_SPECIALITY_IMAGE = "/Specialities icons/Cardiology.jpeg";

// Comprehensive JPEG map — covers every speciality/sub-speciality name returned by the API.
// Each name maps to the closest available real photo from the Specialities icons folder.
const SPECIALITY_JPEG_MAP: Record<string, string> = {
  // ── Cardiology & Cardiac ──────────────────────────────────────────────────
  "Cardiac Sciences": "/Specialities icons/Cardiology.jpeg",
  "Cardiac Surgery": "/Specialities icons/Cardiology.jpeg",
  "Cardiology": "/Specialities icons/Cardiology.jpeg",
  "Thoracic & Vascular Surgery": "/Specialities icons/Cardiology.jpeg",
  "Vascular & Endovascular Surgery": "/Specialities icons/Cardiology.jpeg",
  "Vascular Surgery": "/Specialities icons/Cardiology.jpeg",
  "Interventional Cardiology": "/Specialities icons/Cardiology.jpeg",

  // ── Oncology / Cancer ─────────────────────────────────────────────────────
  "Cancer Care": "/Specialities icons/Cancer Care.jpeg",
  "Cancer Sciences": "/Specialities icons/Cancer Care.jpeg",
  "Haematology Oncology": "/Specialities icons/Cancer Care.jpeg",
  "Haematology": "/Specialities icons/Cancer Care.jpeg",
  "Medical Oncology": "/Specialities icons/Cancer Care.jpeg",
  "Oncology": "/Specialities icons/Cancer Care.jpeg",
  "Oncology/Cancer Care": "/Specialities icons/Cancer Care.jpeg",
  "Surgical Oncology": "/Specialities icons/Cancer Care.jpeg",
  "Bone Marrow Transplant": "/Specialities icons/Cancer Care.jpeg",
  "Paediatric Haematology & Oncology": "/Specialities icons/Cancer Care.jpeg",
  // Paediatrics mapped to Cancer Care (SRCC branding similarity)
  "Developmental Paediatrics": "/Specialities icons/Cancer Care.jpeg",
  "Paediatric Medicine": "/Specialities icons/Cancer Care.jpeg",
  "Paediatric Surgery": "/Specialities icons/Cancer Care.jpeg",
  "Paediatrics": "/Specialities icons/Cancer Care.jpeg",
  "Paediatrics/Children's Health": "/Specialities icons/Cancer Care.jpeg",
  "Pediatrics": "/Specialities icons/Cancer Care.jpeg",
  "Pediatric Cardiology": "/Specialities icons/Cancer Care.jpeg",
  "Neonatology": "/Specialities icons/Cancer Care.jpeg",
  // Obstetrics / Gynecology
  "Obstetrics & Gynaecology": "/Specialities icons/Cancer Care.jpeg",
  "Gynecology": "/Specialities icons/Cancer Care.jpeg",
  "Gynaecology": "/Specialities icons/Cancer Care.jpeg",

  // ── Neurology / Brain ─────────────────────────────────────────────────────
  "Cranio-Maxillo Facial Surgery": "/Specialities icons/Neurology.jpeg",
  "Neuro Sciences": "/Specialities icons/Neurology.jpeg",
  "Neuro Surgery": "/Specialities icons/Neurology.jpeg",
  "Neurology": "/Specialities icons/Neurology.jpeg",
  "Neurosurgery": "/Specialities icons/Neurology.jpeg",
  "Psychiatry": "/Specialities icons/Neurology.jpeg",
  "Medicine Specialties": "/Specialities icons/Neurology.jpeg",
  "Other Clinical Specialties": "/Specialities icons/Neurology.jpeg",
  "General Medicine": "/Specialities icons/Neurology.jpeg",
  "Internal Medicine": "/Specialities icons/Neurology.jpeg",
  "Critical Care Medicine": "/Specialities icons/Neurology.jpeg",
  "Emergency Medicine": "/Specialities icons/Neurology.jpeg",
  "Genetics": "/Specialities icons/Neurology.jpeg",
  "Endocrinology": "/Specialities icons/Neurology.jpeg",
  "Diabetology": "/Specialities icons/Neurology.jpeg",
  "Rheumatology": "/Specialities icons/Neurology.jpeg",
  "Immunology": "/Specialities icons/Neurology.jpeg",
  "ENT": "/Specialities icons/Neurology.jpeg",
  "Ophthalmology": "/Specialities icons/Neurology.jpeg",
  "Dermatology": "/Specialities icons/Neurology.jpeg",

  // ── Orthopaedics / Musculoskeletal ────────────────────────────────────────
  "General Surgery": "/Specialities icons/Orthopedics.jpeg",
  "Orthopaedic Sciences": "/Specialities icons/Orthopedics.jpeg",
  "Orthopaedic Surgery": "/Specialities icons/Orthopedics.jpeg",
  "Orthopaedics": "/Specialities icons/Orthopedics.jpeg",
  "Orthopedics": "/Specialities icons/Orthopedics.jpeg",
  "Plastic Surgery": "/Specialities icons/Orthopedics.jpeg",
  "Reconstructive Surgery": "/Specialities icons/Orthopedics.jpeg",
  "Spine Surgery": "/Specialities icons/Orthopedics.jpeg",
  "Sports Medicine": "/Specialities icons/Orthopedics.jpeg",
  "Surgical Specialities": "/Specialities icons/Orthopedics.jpeg",

  // ── Nephrology / Renal ────────────────────────────────────────────────────
  "Nephrology": "/Specialities icons/Nephrology.jpeg",
  "Renal Sciences": "/Specialities icons/Nephrology.jpeg",
  "Transplants": "/Specialities icons/Nephrology.jpeg",
  "Kidney Transplant": "/Specialities icons/Nephrology.jpeg",
  "Liver Transplant": "/Specialities icons/Nephrology.jpeg",
  "Urology": "/Specialities icons/Nephrology.jpeg",
  "Pulmonology": "/Specialities icons/Nephrology.jpeg",
  "Respiratory Medicine": "/Specialities icons/Nephrology.jpeg",
  "Dentistry": "/Specialities icons/Nephrology.jpeg",
  "Dental Care": "/Specialities icons/Nephrology.jpeg",

  // ── Gastroenterology ─────────────────────────────────────────────────────
  "Gastro Sciences": "/Specialities icons/Gastroenterology.jpeg",
  "Gastroenterology": "/Specialities icons/Gastroenterology.jpeg",
  "Hepatology & Liver Transplant Hepatology": "/Specialities icons/Gastroenterology.jpeg",
  "Hepatology": "/Specialities icons/Gastroenterology.jpeg",
  "Medical Gastroenterology": "/Specialities icons/Gastroenterology.jpeg",
  "Surgical Gastroenterology": "/Specialities icons/Gastroenterology.jpeg",
};

// Deterministic pool of male/female doctor photos keyed by entityId
const MALE_DOCTOR_PHOTOS = [
  "/assets/doctor_1.png",
  "/assets/doctor_2.png",
  "/assets/doctor_3.png",
  "/images/misc/doctor_avatar_male_v2.png",
];
const FEMALE_DOCTOR_PHOTOS = [
  "/images/misc/doctor_avatar_female_v2.png",
  "/assets/doctor_1.png",
];

function getDoctorPhotoById(doctorName: string, entityId: number): string {
  const gender = inferGender(doctorName);
  const pool = gender === "female" ? FEMALE_DOCTOR_PHOTOS : MALE_DOCTOR_PHOTOS;
  return pool[entityId % pool.length];
}

const PROCEDURE_IMAGES = [
  "/images/procedures/procedure_surgery.png",
  "/images/procedures/procedure_cardiology.png",
  "/images/procedures/procedure_mri.png",
];

const BLOG_IMAGES = [
  "/images/articles/blog_heart_health.png",
  "/images/articles/blog_migraine.png",
  "/images/articles/blog_cancer_care.png",
  "/images/articles/blog_joints_bones.png",
];

// --- Doctor gender heuristic ---

const FEMALE_FIRST_NAMES = new Set([
  "aditi", "aishwarya", "akanksha", "alice", "aliya", "amala", "amisha", "amira", "amita", "amulya",
  "ananya", "anjali", "anjana", "anusha", "anushka", "aparna", "apoorva", "arati", "arathi", "archana",
  "arshiya", "arthi", "aruna", "asha", "ashwini", "bhavana", "bhavna", "bindu", "charu", "chitra",
  "daisy", "deepa", "devika", "divya", "fatima", "geeta", "geetha", "harini", "heena", "hema",
  "indira", "indu", "ishita", "jhanvi", "jyothi", "jyotsna", "kamala", "kanika", "kavita", "kavitha",
  "kavya", "kirti", "komal", "kriti", "lakshmi", "lata", "lavanya", "leela", "madhuri", "mala",
  "manju", "manjula", "manisha", "meera", "meghna", "mitali", "monal", "namrata", "natasha", "nidhi",
  "nimisha", "nirmala", "nisha", "nita", "neha", "padma", "padmaja", "palak", "pallavi", "parvathi",
  "payal", "pooja", "prachi", "pragya", "pranita", "preeti", "prerana", "priti", "priya",
  "radha", "ranjana", "rashmi", "ratna", "rekha", "renuka", "revathi", "rita", "ritu", "rohini",
  "rupali", "sahana", "sakshi", "sangeeta", "sanjana", "sarika", "sarita", "seema", "shefali",
  "shilpa", "shobha", "shuchi", "shweta", "siddhi", "simran", "sita", "smita", "smriti", "sneha",
  "sonal", "sonia", "sonya", "srividya", "sucheta", "suchitra", "sudha", "sulekha", "suman",
  "sumati", "sunayana", "sunidhi", "sunita", "surbhi", "surekha", "sushma", "swapna", "swati",
  "sweta", "tanvi", "tanvika", "tara", "taruna", "trupti", "tulika", "uma", "urvashi", "usha",
  "vandana", "vani", "vaishali", "vasudha", "vedika", "vibha", "vidya", "vidushi", "vijaya",
  "vimala", "vini", "vrinda", "yamini", "yashodha", "yogita", "zara", "zeenat",
  "nalini", "nita", "rani", "asha", "maya", "laxmi", "puja", "savita", "veena", "mamta",
  "sulochana", "meerakumari", "mythili", "thangam", "sukanya", "pushpa",
]);

export function inferGender(doctorName: string | null | undefined): "male" | "female" {
  if (!doctorName) return "male";
  const firstName = doctorName
    .replace(/^Dr\.\s*/i, "")
    .split(" ")[0]
    .toLowerCase();
  return FEMALE_FIRST_NAMES.has(firstName) ? "female" : "male";
}


function getSpecialityImage(specialityName: string): string {
  if (!specialityName) return DEFAULT_SPECIALITY_IMAGE;
  // Exact match
  if (SPECIALITY_JPEG_MAP[specialityName]) return SPECIALITY_JPEG_MAP[specialityName];
  // Case-insensitive keyword match
  const lower = specialityName.toLowerCase();
  for (const [key, img] of Object.entries(SPECIALITY_JPEG_MAP)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) return img;
  }
  // Keyword-based fallback to the most relevant JPEG
  if (/cardio|cardiac|vascular|heart/.test(lower)) return "/Specialities icons/Cardiology.jpeg";
  if (/cancer|onco|tumou?r|haema|hema|blood/.test(lower)) return "/Specialities icons/Cancer Care.jpeg";
  if (/neuro|brain|spine|psych|mental|cranio/.test(lower)) return "/Specialities icons/Neurology.jpeg";
  if (/ortho|bone|joint|fracture|muscle|plastic|reconstruct/.test(lower)) return "/Specialities icons/Orthopedics.jpeg";
  if (/gastro|liver|digest|hepato|bowel|colon/.test(lower)) return "/Specialities icons/Gastroenterology.jpeg";
  if (/kidney|renal|nephr|urol|pulmon|lung|respirat|transplant/.test(lower)) return "/Specialities icons/Nephrology.jpeg";
  return DEFAULT_SPECIALITY_IMAGE;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/** Strip the trailing " (X.X km)" from hospitalName */
function stripDistance(hospitalName: string | null): string {
  if (!hospitalName) return "";
  return hospitalName.replace(/\s*\(\d+\.?\d*\s*km\)/i, "").trim();
}

// --- Normalization ---

export function normalizeSearchResponse(raw: RawApiResponse): NormalizedResults {
  const doctors: NormalizedDoctor[] = (raw.doctors ?? []).map((d) => ({
    id: d.entityId,
    name: d.name,
    speciality: d.subSpeciality ?? "",
    hospital: stripDistance(d.hospitalName),
    photo: getDoctorPhotoById(d.name, d.entityId),
    apptEnabled: d.metaData?.appt_enabled ?? false,
    walkinEnabled: d.metaData?.walkin_enabled ?? false,
    vcEnabled: d.metaData?.vc_enabled ?? false,
    availability: {
      hospital: "Today 05:30 PM",
      video: "Today 05:30 PM",
    },
  }));

  const specialities: NormalizedSpeciality[] = (raw.specialities ?? []).map((s) => ({
    id: s.entityId,
    name: s.name,
    slug: slugify(s.name),
    image: getSpecialityImage(s.name),
  }));

  const subSpecialities: NormalizedSubSpeciality[] = (raw.subSpecialities ?? []).map((s) => ({
    id: s.entityId,
    name: s.name,
    slug: slugify(s.name),
    image: getSpecialityImage(s.name),
    parentSpeciality: s.subSpeciality ?? "",
  }));

/** Strip SEO page-title suffixes like ": procedure, Recovery & Cost" appended by the CMS */
function cleanEntityName(name: string | null | undefined): string {
  if (!name) return "";
  return name.split(":")[0].trim();
}

  const procedures: NormalizedProcedure[] = (raw.procedures ?? []).map((p, i) => ({
    id: p.entityId,
    name: cleanEntityName(p.name),
    speciality: p.subSpeciality?.split(",")[0].trim() ?? "",
    image: PROCEDURE_IMAGES[i % PROCEDURE_IMAGES.length],
    type: "Procedures" as const,
  }));

  const treatments: NormalizedTreatment[] = (raw.treatments ?? []).map((t, i) => ({
    id: t.entityId,
    name: cleanEntityName(t.name),
    speciality: t.subSpeciality?.split(",")[0].trim() ?? "",
    image: PROCEDURE_IMAGES[i % PROCEDURE_IMAGES.length],
    type: "Treatments" as const,
  }));

  const blogs: NormalizedBlog[] = (raw.blogs ?? []).map((b, i) => ({
    id: b.entityId,
    name: b.name,
    speciality: b.subSpeciality ?? "",
    image: BLOG_IMAGES[i % BLOG_IMAGES.length],
  }));

  return { doctors, specialities, subSpecialities, procedures, treatments, blogs };
}

// --- API caller (calls internal Next.js proxy to avoid browser CORS/SSL issues) ---

export async function searchHealthcare(
  query: string,
  cityId: number | null,
  signal?: AbortSignal
): Promise<NormalizedResults> {
  const url = new URL("/api/search", window.location.origin);
  url.searchParams.set("query", query.trim());
  if (cityId !== null) url.searchParams.set("cityId", String(cityId));

  const res = await fetch(url.toString(), { signal });
  if (!res.ok) throw new Error(`Search API error: ${res.status}`);

  const raw: RawApiResponse = await res.json();
  return normalizeSearchResponse(raw);
}
