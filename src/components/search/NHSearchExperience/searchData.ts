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

import { searchHealthcare, getCityId, NormalizedResults } from "@/lib/searchService";

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
export function getPredictiveCompletion(typedText: string): PredictiveState | null {
  const clean = typedText.trim().toLowerCase();
  if (!clean) return null;

  // ── SCENARIO A: CARDIOLOGY ('c' -> 'ch' -> 'chest' -> 'chest pain' -> 'cardio' -> 'cardiologist near me') ──
  const cardiologySuggestions = [
    "cardiologist near me",
    "chest pain and need a doctor",
    "cardiology consultation in Bangalore",
    "chest pain specialist near me",
  ];

  if (clean === "c") {
    const target = "cardiologist near me";
    return {
      fullText: target,
      suffix: computePredictionSuffix(target, typedText),
      suggestions: cardiologySuggestions,
      intent: "cardiology",
      intentLabel: "Cardiology",
    };
  }

  if (clean === "ch") {
    const target = "chest pain and need a doctor";
    return {
      fullText: target,
      suffix: computePredictionSuffix(target, typedText),
      suggestions: cardiologySuggestions,
      intent: "cardiology",
      intentLabel: "Cardiology",
    };
  }

  if (clean === "chest") {
    const target = "chest pain and I need a doctor";
    return {
      fullText: target,
      suffix: computePredictionSuffix(target, typedText),
      suggestions: cardiologySuggestions,
      intent: "cardiology",
      intentLabel: "Cardiology",
    };
  }

  if (clean === "chest pain" || clean.startsWith("chest p")) {
    const target = "chest pain and need a cardiologist";
    return {
      fullText: target,
      suffix: computePredictionSuffix(target, typedText),
      suggestions: cardiologySuggestions,
      intent: "cardiology",
      intentLabel: "Cardiology",
    };
  }

  if (clean.startsWith("i have chest") || clean.startsWith("i need a cardio") || clean.includes("chest pain and need a doctor")) {
    const target = "I have chest pain and need a doctor";
    return {
      fullText: target,
      suffix: computePredictionSuffix(target, typedText),
      suggestions: cardiologySuggestions,
      intent: "cardiology",
      intentLabel: "Cardiology",
    };
  }

  if (clean.startsWith("cardio") || clean.startsWith("heart")) {
    const target = "cardiologist near me";
    return {
      fullText: target,
      suffix: computePredictionSuffix(target, typedText),
      suggestions: cardiologySuggestions,
      intent: "cardiology",
      intentLabel: "Cardiology",
    };
  }

  // ── SCENARIO B: ORTHOPAEDICS ('k' -> 'kn' -> 'knee' -> 'knee pain') ──
  if (clean === "k") {
    const target = "knee pain";
    return {
      fullText: target,
      suffix: computePredictionSuffix(target, typedText),
      suggestions: [
        "knee pain — find an orthopaedic doctor",
        "knee specialist near me",
      ],
      intent: "orthopaedics",
      intentLabel: "Orthopaedics",
    };
  }

  if (clean === "kn") {
    const target = "knee pain and need a specialist";
    return {
      fullText: target,
      suffix: computePredictionSuffix(target, typedText),
      suggestions: [
        "knee pain — find an orthopaedic doctor",
        "knee replacement consultation",
      ],
      intent: "orthopaedics",
      intentLabel: "Orthopaedics",
    };
  }

  if (clean === "knee") {
    const target = "knee pain — find an orthopaedic doctor";
    return {
      fullText: target,
      suffix: computePredictionSuffix(target, typedText),
      suggestions: [
        "I have knee pain and need an orthopaedic doctor",
        "knee doctor near me",
      ],
      intent: "orthopaedics",
      intentLabel: "Orthopaedics",
    };
  }

  if (clean === "knee pain" || clean.startsWith("knee p")) {
    const target = "I have knee pain and need an orthopaedic doctor";
    return {
      fullText: target,
      suffix: computePredictionSuffix(target, typedText),
      suggestions: [
        "knee pain — find an orthopaedic doctor",
        "knee replacement surgeon in Bangalore",
      ],
      intent: "orthopaedics",
      intentLabel: "Orthopaedics",
    };
  }

  if (clean.startsWith("i have knee") || clean.startsWith("i need an ortho") || clean.includes("knee pain and need an orthopaedic")) {
    const target = "I have knee pain and need an orthopaedic doctor";
    return {
      fullText: target,
      suffix: computePredictionSuffix(target, typedText),
      suggestions: [
        "knee pain — find an orthopaedic doctor",
        "orthopaedic consultation in Bangalore",
      ],
      intent: "orthopaedics",
      intentLabel: "Orthopaedics",
    };
  }

  if (clean.startsWith("ortho") || clean.startsWith("joint") || clean.startsWith("bone")) {
    const target = "orthopaedic doctor for knee and joint pain";
    return {
      fullText: target,
      suffix: computePredictionSuffix(target, typedText),
      suggestions: [
        "I have knee pain and need an orthopaedic doctor",
        "joint replacement surgeon near me",
      ],
      intent: "orthopaedics",
      intentLabel: "Orthopaedics",
    };
  }

  // ── GENERAL FALLBACK PREDICTION ──
  return {
    fullText: `${typedText} specialist consultation near you`,
    suffix: " specialist consultation near you",
    suggestions: [
      `${typedText} doctor in Bangalore`,
    ],
    intent: "general",
    intentLabel: "Clinical Care",
  };
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
    {
      id: "t-4",
      title: "Echocardiography (ECHO)",
      subtitle: "Heart ultrasound & imaging",
      iconType: "activity",
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
    {
      id: "a-4",
      title: "Cardiac rehabilitation: roadmap to recovery",
      readTime: "5 min read",
      category: "Rehabilitation",
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
    {
      id: "a-ortho-4",
      title: "Physiotherapy & rehabilitation for joint mobility",
      readTime: "5 min read",
      category: "Rehabilitation",
      iconType: "article",
    },
  ],
};

/**
 * Maps normalized live healthcare API search results to the SearchResultsData format.
 */
export function mapApiResultsToSearchData(
  apiResults: NormalizedResults,
  query: string,
  location: string = "Bangalore"
): SearchResultsData {
  const proximity = getProximityContext(location);
  const cleanQ = query.trim().toLowerCase();

  // 1. Category Title:
  let categoryTitle = "Recommended doctors";
  if (apiResults.specialities.length > 0) {
    categoryTitle = `Recommended ${apiResults.specialities[0].name} doctors`;
  } else if (apiResults.doctors.length > 0 && apiResults.doctors[0].speciality) {
    categoryTitle = `Recommended ${apiResults.doctors[0].speciality} doctors`;
  } else if (query.trim()) {
    categoryTitle = `Recommended doctors for "${query.trim()}"`;
  }

  // 2. Map Doctors:
  const rawDocs = apiResults.doctors;
  const mappedDocs: DoctorCardData[] = rawDocs.map((doc) => {
    // Specific well-known doctor images
    let docImg = doc.photo;
    if (doc.name.toLowerCase().includes("devi prasad shetty")) {
      docImg = "/doctors/doc_devi_shetty.jpg";
    } else if (doc.name.toLowerCase().includes("bagirath")) {
      docImg = "/doctors/doc_bagirath.jpg";
    }

    // Specific well-known experiences or generated
    let exp = "15+ years experience";
    if (doc.name.toLowerCase().includes("devi prasad shetty")) {
      exp = "35+ years experience";
    } else if (doc.name.toLowerCase().includes("bagirath")) {
      exp = "22 years experience";
    } else {
      const expYears = 10 + ((doc.id * 7) % 18);
      exp = `${expYears} years experience`;
    }

    let consultType: "in-person" | "video" | "both" = "both";
    if (proximity.tier === "videoOnly") {
      consultType = "video";
    } else if (doc.vcEnabled && (doc.apptEnabled || doc.walkinEnabled)) {
      consultType = "both";
    } else if (doc.vcEnabled) {
      consultType = "video";
    } else {
      consultType = "in-person";
    }

    let hospital = doc.hospital || `Narayana Health, ${location}`;
    if (proximity.tier === "expanded100km") {
      hospital = `${hospital} (${proximity.distanceKm || 38} km)`;
    } else if (proximity.tier === "videoOnly") {
      hospital = "Narayana Telehealth · Online Video Consult";
    }

    return {
      id: `doc-${doc.id}`,
      name: doc.name,
      speciality: doc.speciality || (apiResults.specialities[0]?.name ?? "Specialist"),
      hospital,
      experience: exp,
      image: docImg,
      city: proximity.tier === "videoOnly" ? "Narayana Telehealth" : location,
      availableToday: doc.apptEnabled || doc.walkinEnabled || true,
      consultationType: consultType,
      distanceNote: proximity.tier === "expanded100km" ? `${proximity.distanceKm || 38} km away` : undefined,
    };
  });

  // Ensure we have at least 4 doctor cards so the 2x2 grid is balanced
  if (mappedDocs.length > 0 && mappedDocs.length < 4) {
    const fallbackList = cleanQ.includes("knee") || cleanQ.includes("ortho") 
      ? ORTHOPAEDICS_RESULTS.doctors 
      : CARDIOLOGY_RESULTS.doctors;
    for (const fb of fallbackList) {
      if (mappedDocs.length >= 4) break;
      if (!mappedDocs.some((d) => d.name === fb.name)) {
        mappedDocs.push({
          ...fb,
          city: location,
        });
      }
    }
  }

  // 3. Map Treatments & Procedures (Show 4 items):
  let mappedTreatments: TreatmentItemData[] = [];
  const combinedTreatments = [...apiResults.procedures, ...apiResults.treatments];
  if (combinedTreatments.length > 0) {
    mappedTreatments = combinedTreatments.slice(0, 4).map((item, idx) => {
      let iconType: TreatmentItemData["iconType"] = "stethoscope";
      const nameL = item.name.toLowerCase();
      if (nameL.includes("heart") || nameL.includes("cardiac") || nameL.includes("ecg") || nameL.includes("bypass")) {
        iconType = "heart";
      } else if (nameL.includes("angio") || nameL.includes("stent") || nameL.includes("vessel")) {
        iconType = "angiography";
      } else if (nameL.includes("knee") || nameL.includes("joint") || nameL.includes("bone") || nameL.includes("arthro")) {
        iconType = "joint";
      } else if (nameL.includes("xray") || nameL.includes("mri") || nameL.includes("scan") || nameL.includes("ct")) {
        iconType = "xray";
      } else if (idx % 2 === 1) {
        iconType = "activity";
      }

      return {
        id: `t-api-${item.id}`,
        title: item.name,
        subtitle: item.speciality ? `${item.speciality} Procedure` : "Specialist assessment & care",
        iconType,
      };
    });
  } else {
    const fallbackTreatments = cleanQ.includes("knee") || cleanQ.includes("ortho")
      ? ORTHOPAEDICS_RESULTS.treatments
      : CARDIOLOGY_RESULTS.treatments;
    mappedTreatments = fallbackTreatments.slice(0, 4);
  }

  // 4. Map Articles & Blogs (Show 4 items):
  let mappedArticles: ArticleItemData[] = [];
  if (apiResults.blogs.length > 0) {
    mappedArticles = apiResults.blogs.slice(0, 4).map((blog, idx) => {
      let iconType: ArticleItemData["iconType"] = "document";
      if (idx === 1) iconType = "emergency";
      else if (idx === 2) iconType = "article";

      return {
        id: `a-api-${blog.id}`,
        title: blog.name,
        readTime: `${5 + (idx % 3)} min read`,
        category: blog.speciality || "Clinical Advisory",
        iconType,
      };
    });
  } else {
    const fallbackArticles = cleanQ.includes("knee") || cleanQ.includes("ortho")
      ? ORTHOPAEDICS_RESULTS.articles
      : CARDIOLOGY_RESULTS.articles;
    mappedArticles = fallbackArticles.slice(0, 4);
  }

  // 5. Related Specialties (Show up to 8 items for up to 3 clean rows):
  const specSet = new Set<string>();
  apiResults.specialities.forEach((s) => specSet.add(s.name));
  apiResults.subSpecialities.forEach((s) => specSet.add(s.name));
  if (specSet.size === 0) {
    if (cleanQ.includes("knee") || cleanQ.includes("ortho")) {
      ORTHOPAEDICS_RESULTS.relatedSpecialties.forEach((s) => specSet.add(s));
    } else {
      CARDIOLOGY_RESULTS.relatedSpecialties.forEach((s) => specSet.add(s));
    }
  }

  return {
    categoryTitle,
    proximityTier: proximity.tier,
    proximityMessage: proximity.contextMessage,
    matchCountText: proximity.contextMessage,
    pulseRecommendationText: "Want a more personalised recommendation?",
    doctors: mappedDocs,
    relatedSpecialties: Array.from(specSet).slice(0, 8),
    treatments: mappedTreatments,
    articles: mappedArticles,
  };
}

/**
 * Returns structured search results dynamically based on query & location proximity logic.
 * Queries live upstream Healthcare API first, falling back to simulation datasets seamlessly.
 */
export async function getSearchResults(
  query: string,
  location: string = "Bangalore"
): Promise<SearchResultsData> {
  const clean = query.toLowerCase().trim();
  const proximity = getProximityContext(location);

  // 1. Attempt to query live healthcare search API
  try {
    const cityId = getCityId(location);
    const apiResults = await searchHealthcare(query, cityId);

    if (
      apiResults &&
      (apiResults.doctors.length > 0 ||
        apiResults.specialities.length > 0 ||
        apiResults.procedures.length > 0 ||
        apiResults.treatments.length > 0)
    ) {
      return mapApiResultsToSearchData(apiResults, query, location);
    }
  } catch (err) {
    console.warn("Live search API returned error, gracefully falling back to simulation data:", err);
  }

  // 2. Curated Simulation Fallback
  const isOrtho =
    clean.includes("knee") ||
    clean.includes("ortho") ||
    clean.includes("joint") ||
    clean.includes("bone") ||
    clean.startsWith("k");

  const baseResults = isOrtho ? ORTHOPAEDICS_RESULTS : CARDIOLOGY_RESULTS;
  const categoryTitle = isOrtho ? "Recommended orthopaedic doctors" : "Recommended doctors";

  let tailoredDoctors: DoctorCardData[] = [];

  if (proximity.tier === "local") {
    tailoredDoctors = baseResults.doctors.map((doc) => ({
      ...doc,
      city: location,
      consultationType: "both" as const,
      hospital: doc.hospital,
    }));
  } else if (proximity.tier === "expanded100km") {
    const distNote = proximity.distanceKm ? ` (${proximity.distanceKm} km)` : " (within 100 km)";
    tailoredDoctors = baseResults.doctors.map((doc) => ({
      ...doc,
      city: proximity.nearestHubName || "Bangalore",
      consultationType: "both" as const,
      hospital: `${doc.hospital}${distNote}`,
      distanceNote: `${proximity.distanceKm || 38} km away`,
    }));
  } else {
    tailoredDoctors = baseResults.doctors.map((doc) => ({
      ...doc,
      city: "Narayana Telehealth",
      consultationType: "video" as const,
      hospital: "Narayana Telehealth · Online Video Consult",
    }));
  }

  return {
    ...baseResults,
    categoryTitle,
    proximityTier: proximity.tier,
    proximityMessage: proximity.contextMessage,
    matchCountText: proximity.contextMessage,
    doctors: tailoredDoctors,
  };
}

/**
 * Live predictive intelligence querying the upstream search API.
 * Proposes complete sentences and natural suggestion queries true to user input.
 */
export async function fetchLiveApiPredictions(
  query: string,
  location: string = "Bangalore",
  signal?: AbortSignal
): Promise<PredictiveState | null> {
  const clean = query.trim();
  if (!clean || clean.length < 1) return null;

  try {
    const cityId = getCityId(location);
    const apiRes = await searchHealthcare(clean, cityId, signal);

    if (!apiRes) return null;

    const matchedDoctor = apiRes.doctors[0];
    const matchedSpeciality = apiRes.specialities[0] || apiRes.subSpecialities[0];
    const matchedProcedure = apiRes.procedures[0] || apiRes.treatments[0];

    if (!matchedDoctor && !matchedSpeciality && !matchedProcedure) {
      return null;
    }

    const suggestions: string[] = [];

    if (matchedDoctor) {
      suggestions.push(`${matchedDoctor.name} - ${matchedDoctor.speciality || "Specialist"}`);
      suggestions.push(`Book appointment with ${matchedDoctor.name}`);
    }

    if (matchedSpeciality) {
      suggestions.push(`${matchedSpeciality.name} doctor near me`);
      suggestions.push(`Top ${matchedSpeciality.name} specialists in ${location}`);
    }

    if (matchedProcedure) {
      suggestions.push(`${matchedProcedure.name} consultation in ${location}`);
    }

    if (apiRes.doctors.length > 1 && suggestions.length < 4) {
      const doc2 = apiRes.doctors[1];
      suggestions.push(`${doc2.name} - ${doc2.speciality || "Doctor"}`);
    }

    if (apiRes.specialities.length > 1 && suggestions.length < 4) {
      suggestions.push(`${apiRes.specialities[1].name} clinic in ${location}`);
    }

    const uniqueSuggestions = Array.from(new Set(suggestions)).slice(0, 4);

    let target = "";
    const lowerClean = clean.toLowerCase();

    if (lowerClean.startsWith("dr") && matchedDoctor) {
      target = `${matchedDoctor.name} consultation in ${location}`;
    } else if (matchedSpeciality && matchedSpeciality.name.toLowerCase().startsWith(lowerClean)) {
      target = `${matchedSpeciality.name} specialist in ${location}`;
    } else if (matchedSpeciality) {
      target = `I need a consultation for ${matchedSpeciality.name} in ${location}`;
    } else if (matchedDoctor) {
      target = `Consult ${matchedDoctor.name} in ${location}`;
    } else if (matchedProcedure) {
      target = `${matchedProcedure.name} procedure in ${location}`;
    } else {
      target = `${clean} specialist consultation in ${location}`;
    }

    const suffix = computePredictionSuffix(target, clean);

    let intent: "cardiology" | "orthopaedics" | "general" = "general";
    let intentLabel = "Clinical Care";

    const combinedName = (matchedSpeciality?.name || matchedDoctor?.speciality || "").toLowerCase();
    if (combinedName.includes("cardio") || combinedName.includes("heart")) {
      intent = "cardiology";
      intentLabel = "Cardiology";
    } else if (combinedName.includes("ortho") || combinedName.includes("joint") || combinedName.includes("knee")) {
      intent = "orthopaedics";
      intentLabel = "Orthopaedics";
    } else if (matchedSpeciality?.name) {
      intent = "general";
      intentLabel = matchedSpeciality.name;
    }

    return {
      fullText: target,
      suffix,
      suggestions: uniqueSuggestions,
      intent,
      intentLabel,
    };
  } catch {
    return null;
  }
}
