/**
 * ═════════════════════════════════════════════════════════════════════════════════
 * NARAYANA HEALTH SEARCH DATA & PREDICTIVE INTELLIGENCE CONFIG
 * ═════════════════════════════════════════════════════════════════════════════════
 *
 * DEVELOPER HANDOFF INSTRUCTIONS:
 * 
 * 1. DEMO SEARCH SCENARIOS:
 *    - Scenario 1 (Cardiology):
 *      User types: 'c' → 'ch' → 'chest' → 'chest pain'
 *      Predictive completion: "I have chest pain and need a doctor"
 *      Results: Cardiologists in Bangalore + cardiac procedures & articles
 *
 *    - Scenario 2 (Orthopaedics):
 *      User types: 'k' → 'kn' → 'knee' → 'knee pain'
 *      Predictive completion: "I have knee pain and need an orthopaedic doctor"
 *      Results: Recommended Orthopaedic Doctors in Bangalore + joint care
 *
 * 2. API INTEGRATION POINT:
 *    - For live predictive completion: Replace `getPredictiveCompletion()` with a call
 *      to your autocomplete / query suggestion service.
 *    - For search results: Replace `getSearchResults()` with a call to your live
 *      healthcare search backend (OpenSearch / Elasticsearch / Pulse AI API).
 */

export interface DoctorCardData {
  id: string;
  name: string;
  speciality: string;
  expertise?: string;
  hospital: string;
  experience: string;
  image: string;
  city: string;
  availableToday?: boolean;
  consultationType?: "in-person" | "video" | "both";
  distanceNote?: string;
}

export interface TreatmentItemData {
  id: string;
  title: string;
  subtitle: string;
  iconType: "heart" | "activity" | "angiography" | "stethoscope" | "joint" | "xray";
}

export interface ArticleItemData {
  id: string;
  title: string;
  readTime: string;
  category: string;
  iconType: "document" | "emergency" | "article";
}

export type ProximityTier = "local" | "expanded100km" | "videoOnly";

export interface ProximityContext {
  tier: ProximityTier;
  locationName: string;
  contextMessage: string;
  nearestHubName?: string;
  distanceKm?: number;
}

export interface SearchResultsData {
  categoryTitle: string;
  proximityTier: ProximityTier;
  proximityMessage: string;
  matchCountText: string;
  pulseRecommendationText: string;
  doctors: DoctorCardData[];
  relatedSpecialties: string[];
  treatments: TreatmentItemData[];
  articles: ArticleItemData[];
}

export interface PredictiveState {
  /** The full suggested completion sentence */
  fullText: string;
  /** Suffix remaining after the user's typed text (for inline ghost styling) */
  suffix: string;
  /** List of alternative sentence / query predictions */
  suggestions: string[];
  /** Inferred healthcare intent */
  intent: "cardiology" | "orthopaedics" | "general";
  intentLabel: string;
}

// Direct NH Hospital Hubs (State A: Local Options Available)
export const NH_LOCAL_HUBS = [
  "Bangalore",
  "Delhi NCR",
  "Kolkata",
  "Mumbai",
  "Jaipur",
  "Ahmedabad",
  "Mysore",
  "Guwahati",
  "Shimoga",
];

// Hub coordinates for geolocation distance calculations
export const NH_HUB_COORDINATES: Record<string, { lat: number; lon: number }> = {
  "Bangalore": { lat: 12.9716, lon: 77.5946 },
  "Delhi NCR": { lat: 28.6139, lon: 77.2090 },
  "Kolkata": { lat: 22.5726, lon: 88.3639 },
  "Mumbai": { lat: 19.0760, lon: 72.8777 },
  "Jaipur": { lat: 26.9124, lon: 75.7873 },
  "Ahmedabad": { lat: 23.0225, lon: 72.5714 },
  "Mysore": { lat: 12.2958, lon: 76.6394 },
  "Guwahati": { lat: 26.1445, lon: 91.7362 },
  "Shimoga": { lat: 13.9299, lon: 75.5681 },
};

// Satellite regions within 100 km of an NH hub (State B: Expanded 100 km Search)
export const NH_EXPANDED_100KM_CITIES: Record<string, { nearestHub: string; distanceKm: number }> = {
  "Hosur": { nearestHub: "Bangalore", distanceKm: 38 },
  "Tumkur": { nearestHub: "Bangalore", distanceKm: 70 },
  "Mandya": { nearestHub: "Mysore", distanceKm: 45 },
  "Kolar": { nearestHub: "Bangalore", distanceKm: 65 },
  "Howrah": { nearestHub: "Kolkata", distanceKm: 12 },
  "Alwar": { nearestHub: "Jaipur", distanceKm: 98 },
  "Sonipat": { nearestHub: "Delhi NCR", distanceKm: 48 },
  "Faridabad": { nearestHub: "Delhi NCR", distanceKm: 32 },
  "Noida": { nearestHub: "Delhi NCR", distanceKm: 28 },
  "Gurgaon": { nearestHub: "Delhi NCR", distanceKm: 30 },
};

// Cities where no NH in-person hospital exists within 100 km (State C: Video Consultations Only)
export const NH_VIDEO_ONLY_CITIES = [
  "Pune",
  "Hyderabad",
  "Chennai",
  "Goa",
  "Patna",
  "Srinagar",
  "Kochi",
  "Indore",
  "Lucknow",
  "Chandigarh",
  "Bhopal",
];

// All selectable cities for manual selection & autocomplete
export const NH_ALL_CITIES = [
  ...NH_LOCAL_HUBS,
  "Hosur",
  "Tumkur",
  "Mandya",
  "Pune",
  "Hyderabad",
  "Chennai",
  "Goa",
  "Kochi",
  "Patna",
  "Srinagar",
  "Lucknow",
  "Chandigarh",
];

export const NH_LOCATIONS = NH_LOCAL_HUBS;

/**
 * Calculates Haversine distance in kilometers between two geographic coordinates.
 */
export function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Determines closest NH hub from geographic coordinates.
 */
export function findClosestNHHub(lat: number, lon: number): { hub: string; distanceKm: number } {
  let closestHub = "Bangalore";
  let minDistance = Infinity;

  for (const [hub, coords] of Object.entries(NH_HUB_COORDINATES)) {
    const dist = calculateHaversineKm(lat, lon, coords.lat, coords.lon);
    if (dist < minDistance) {
      minDistance = dist;
      closestHub = hub;
    }
  }

  return { hub: closestHub, distanceKm: minDistance };
}

/**
 * Computes proximity context (State A, State B, or State C) based on selected location.
 */
export function getProximityContext(location: string): ProximityContext {
  const clean = location.trim();

  // 1. Check if direct local hub (State A)
  const isDirectHub = NH_LOCAL_HUBS.some(
    (hub) => hub.toLowerCase() === clean.toLowerCase()
  );
  if (isDirectHub) {
    return {
      tier: "local",
      locationName: clean,
      contextMessage: `Showing care near ${clean}`,
    };
  }

  // 2. Check if satellite city within 100 km (State B)
  const expandedMatch = Object.entries(NH_EXPANDED_100KM_CITIES).find(
    ([city]) => city.toLowerCase() === clean.toLowerCase()
  );
  if (expandedMatch) {
    return {
      tier: "expanded100km",
      locationName: clean,
      nearestHubName: expandedMatch[1].nearestHub,
      distanceKm: expandedMatch[1].distanceKm,
      contextMessage: "No nearby availability · Showing options within 100 km",
    };
  }

  // Handle explicit "within 100km" indicator
  if (clean.toLowerCase().includes("100 km") || clean.toLowerCase().includes("within 100")) {
    return {
      tier: "expanded100km",
      locationName: clean,
      contextMessage: "No nearby availability · Showing options within 100 km",
    };
  }

  // 3. Distance > 100 km or remote city (State C: Video Only)
  return {
    tier: "videoOnly",
    locationName: clean,
    contextMessage: "No in-person care available within 100 km · Showing video consultations",
  };
}

/**
 * Helper to compute the exact inline suffix remaining after typedText,
 * cleanly handling spaces so no double-spaces or alignment jumps occur.
 */
function computePredictionSuffix(targetPhrase: string, rawTyped: string): string {
  const lowerTarget = targetPhrase.toLowerCase();
  const lowerRaw = rawTyped.toLowerCase();

  if (lowerTarget.startsWith(lowerRaw)) {
    return targetPhrase.slice(rawTyped.length);
  }

  const clean = rawTyped.trim().toLowerCase();
  if (lowerTarget.startsWith(clean)) {
    let rem = targetPhrase.slice(clean.length);
    if (rawTyped.endsWith(" ") && rem.startsWith(" ")) {
      rem = rem.slice(1);
    }
    return rem;
  }

  return "";
}

/**
 * Live predictive sentence completion logic (Scenario A: Cardiology & Scenario B: Orthopaedics).
 * Completes the user's sentence/thought instead of asking a question.
 *
 * Visual format:
 * typedText + suffix = fullText
 * e.g. "c" + "ardiologist near me" => "cardiologist near me"
 *      "chest" + " pain and I need a doctor" => "chest pain and I need a doctor"
 *      "k" + "nee pain" => "knee pain"
 *      "knee" + " pain — find an orthopaedic doctor" => "knee pain — find an orthopaedic doctor"
 */
export async function getPredictiveCompletion(typedText: string): Promise<PredictiveState | null> {
  const clean = typedText.trim();
  if (!clean) return null;
  try {
    const res = await fetch(`/api/search?query=${encodeURIComponent(clean)}`);
    if (!res.ok) throw new Error("API failed");
    const data = await res.json();
    const items = data.inBand || [];
    const firstMatchName = items.length > 0 ? items[0].name : `${clean} specialist`;
    const fullText = clean.length <= firstMatchName.length && firstMatchName.toLowerCase().startsWith(clean.toLowerCase())
      ? firstMatchName
      : `${clean} ...`;
    const suggestions = items.slice(0, 3).map((i: any) => i.name);
    return {
      fullText: fullText,
      suffix: fullText.length > clean.length ? fullText.substring(clean.length) : "",
      suggestions: suggestions.length > 0 ? suggestions : [`Search for ${clean}`],
      intent: "general",
      intentLabel: items.length > 0 && items[0].subSpeciality ? items[0].subSpeciality : "Clinical Care",
    };
  } catch (err) {
    console.error("Predictive fetch error", err);
    return null;
  }
}
// ═══════════════════════════════════════════════════════════════════════════════
// RESULTS DATASETS FOR BOTH DEMO SCENARIOS
// ═══════════════════════════════════════════════════════════════════════════════

export const CARDIOLOGY_RESULTS: SearchResultsData = {
  categoryTitle: "Recommended doctors",
  proximityTier: "local",
  proximityMessage: "Showing care near Bangalore",
  matchCountText: "Showing care near Bangalore",
  pulseRecommendationText: "Want a more personalised recommendation?",
  doctors: [
    {
      id: "doc-devi-shetty",
      name: "Dr. Devi Prasad Shetty",
      speciality: "Cardiologist",
      hospital: "Narayana Health City",
      experience: "35+ years experience",
      image: "/doctors/doc_devi_shetty.jpg",
      city: "Bangalore",
      availableToday: true,
      consultationType: "both",
    },
    {
      id: "doc-bagirath",
      name: "Dr. Bagirath Raghuraman",
      speciality: "Cardiologist",
      hospital: "Narayana Health City",
      experience: "22 years experience",
      image: "/doctors/doc_bagirath.jpg",
      city: "Bangalore",
      availableToday: true,
      consultationType: "both",
    },
    {
      id: "doc-ananya",
      name: "Dr. Ananya Rao",
      speciality: "Cardiologist",
      hospital: "Narayana Multispeciality Hospital",
      experience: "14 years experience",
      image: "/doctors/doc_ananya.jpg",
      city: "Bangalore",
      availableToday: true,
      consultationType: "both",
    },
    {
      id: "doc-vivek",
      name: "Dr. Vivek Menon",
      speciality: "Interventional Cardiologist",
      hospital: "Mazumdar Shaw Medical Center",
      experience: "18 years experience",
      image: "/doctors/doc_vivek.jpg",
      city: "Bangalore",
      availableToday: true,
      consultationType: "both",
    },
  ],
  relatedSpecialties: [
    "Cardiology",
    "Cardiac consultation",
    "ECG",
    "Chest pain clinic",
    "Preventive heart check",
  ],
  treatments: [
    {
      id: "t-1",
      title: "Cardiac consultation",
      subtitle: "Specialist assessment",
      iconType: "heart",
    },
    {
      id: "t-2",
      title: "ECG · Electrocardiogram",
      subtitle: "Heart rhythm test",
      iconType: "activity",
    },
    {
      id: "t-3",
      title: "Coronary angiography",
      subtitle: "Diagnostic procedure",
      iconType: "angiography",
    },
  ],
  articles: [
    {
      id: "a-1",
      title: "Understanding Chest Pain",
      readTime: "7 min read",
      category: "Cardiac health",
      iconType: "document",
    },
    {
      id: "a-2",
      title: "When is chest pain an emergency?",
      readTime: "5 min read",
      category: "Emergency care",
      iconType: "emergency",
    },
    {
      id: "a-3",
      title: "Chest pain: causes and diagnosis",
      readTime: "6 min read",
      category: "Cardiology",
      iconType: "article",
    },
  ],
};

export const ORTHOPAEDICS_RESULTS: SearchResultsData = {
  categoryTitle: "Recommended orthopaedic doctors",
  proximityTier: "local",
  proximityMessage: "Showing care near Bangalore",
  matchCountText: "Showing care near Bangalore",
  pulseRecommendationText: "Get customise recommendation with Pulse ai",
  doctors: [
    {
      id: "doc-prakash",
      name: "Dr. Prakash Gupta",
      speciality: "Orthopaedic Surgeon",
      hospital: "Narayana Multispeciality Hospital",
      experience: "16 years experience",
      image: "/assets/doctor_1.png",
      city: "Bangalore",
      availableToday: true,
      consultationType: "both",
    },
    {
      id: "doc-rohan",
      name: "Dr. Rohan Varma",
      speciality: "Sports Medicine Specialist",
      hospital: "Narayana Health City",
      experience: "13 years experience",
      image: "/doctors/doc_vivek.jpg",
      city: "Bangalore",
      availableToday: true,
      consultationType: "both",
    },
    {
      id: "doc-sanjay",
      name: "Dr. Sanjay Rao",
      speciality: "Robotic Joint Specialist",
      hospital: "Narayana Health City",
      experience: "22+ years experience",
      image: "/assets/doctor_3.png",
      city: "Bangalore",
      availableToday: true,
      consultationType: "both",
    },
    {
      id: "doc-meera",
      name: "Dr. Meera Nambiar",
      speciality: "Orthopaedic Consultant",
      hospital: "Narayana Multispeciality Hospital",
      experience: "11 years experience",
      image: "/assets/doctor_2.png",
      city: "Bangalore",
      availableToday: true,
      consultationType: "both",
    },
  ],
  relatedSpecialties: [
    "Orthopaedics",
    "Joint Replacement",
    "Knee Arthroscopy",
    "Knee Clinic",
    "Sports Medicine",
    "Physiotherapy & Rehab",
  ],
  treatments: [
    {
      id: "t-ortho-1",
      title: "Orthopaedic consultation",
      subtitle: "Specialist joint & bone assessment",
      iconType: "joint",
    },
    {
      id: "t-ortho-2",
      title: "Knee pain assessment",
      subtitle: "Comprehensive clinical evaluation",
      iconType: "stethoscope",
    },
    {
      id: "t-ortho-3",
      title: "Knee replacement surgery",
      subtitle: "Advanced robotic-assisted procedure",
      iconType: "joint",
    },
    {
      id: "t-ortho-4",
      title: "Digital X-ray & Knee MRI",
      subtitle: "High resolution joint imaging",
      iconType: "xray",
    },
  ],
  articles: [
    {
      id: "a-ortho-1",
      title: "Understanding knee pain: causes & home care",
      readTime: "6 min read",
      category: "Joint health",
      iconType: "document",
    },
    {
      id: "a-ortho-2",
      title: "When to see an orthopaedic doctor for knee pain",
      readTime: "5 min read",
      category: "Orthopaedics",
      iconType: "emergency",
    },
    {
      id: "a-ortho-3",
      title: "Robotic knee replacement: modern surgical recovery",
      readTime: "8 min read",
      category: "Joint Care",
      iconType: "article",
    },
  ],
};

/**
 * Returns structured search results dynamically based on query & location proximity logic:
 * - State A (Local): Hospitals & doctors available near the selected location.
 * - State B (Expanded 100 km): In-person hospital options within 100 km + video consults.
 * - State C (Video Only): No in-person care within 100 km; surfaces video consult options.
 */
export async function getSearchResults(query: string, location: string = "Bangalore"): Promise<SearchResultsData> {
  const clean = query.trim();
  const proximity = getProximityContext(location);
  const baseResults = CARDIOLOGY_RESULTS; // Fallback for doctors since API doesn't return doctors yet
  
  let mappedTreatments = baseResults.treatments;
  let mappedSpecialties = baseResults.relatedSpecialties;
  
  if (clean) {
    try {
      const res = await fetch(`/api/search?query=${encodeURIComponent(clean)}`);
      if (res.ok) {
        const data = await res.json();
        const items = data.inBand || [];
        if (items.length > 0) {
          mappedTreatments = items.map((item: any) => ({
            id: String(item.id || item.entityId),
            title: item.name,
            subtitle: item.subSpeciality || item.entityType,
            iconType: "activity"
          })).slice(0, 4);
          
          mappedSpecialties = data.specialities 
            ? data.specialities.map((s: any) => s.name)
            : items.slice(0, 4).map((i: any) => i.name);
        }
      }
    } catch (err) {
      console.error("Search fetch error", err);
    }
  }

  let tailoredDoctors: DoctorCardData[] = [];
  if (proximity.tier === "local") {
    tailoredDoctors = baseResults.doctors.map((doc) => ({
      ...doc, city: location, consultationType: "both" as const, hospital: doc.hospital,
    }));
  } else if (proximity.tier === "expanded100km") {
    const distNote = proximity.distanceKm ? ` (${proximity.distanceKm} km)` : " (within 100 km)";
    tailoredDoctors = baseResults.doctors.map((doc) => ({
      ...doc, city: proximity.nearestHubName || "Bangalore", consultationType: "both" as const,
      hospital: `${doc.hospital}${distNote}`, distanceNote: `${proximity.distanceKm || 38} km away`,
    }));
  } else {
    tailoredDoctors = baseResults.doctors.map((doc) => ({
      ...doc, city: "Narayana Telehealth", consultationType: "video" as const, hospital: "Narayana Telehealth · Online Video Consult",
    }));
  }

  return {
    ...baseResults,
    categoryTitle: "Recommended doctors",
    proximityTier: proximity.tier,
    proximityMessage: proximity.contextMessage,
    matchCountText: proximity.contextMessage,
    doctors: tailoredDoctors,
    treatments: mappedTreatments,
    relatedSpecialties: mappedSpecialties,
  };
}
