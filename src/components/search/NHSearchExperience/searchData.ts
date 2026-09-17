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

export interface SearchResultsData {
  categoryTitle: string;
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

export const NH_LOCATIONS = [
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

  // ── SCENARIO A: CARDIOLOGY ('c' -> 'ch' -> 'chest' -> 'chest pain') ──
  if (clean === "c") {
    const target = "cardiologist near me";
    return {
      fullText: target,
      suffix: computePredictionSuffix(target, typedText),
      suggestions: [
        "chest pain and need a doctor",
        "cardiology consultation near me",
      ],
      intent: "cardiology",
      intentLabel: "Cardiology",
    };
  }

  if (clean === "ch") {
    const target = "chest pain and need a doctor";
    return {
      fullText: target,
      suffix: computePredictionSuffix(target, typedText),
      suggestions: [
        "cardiologist near me",
        "chest pain specialist in Bangalore",
      ],
      intent: "cardiology",
      intentLabel: "Cardiology",
    };
  }

  if (clean === "chest") {
    const target = "chest pain and I need a doctor";
    return {
      fullText: target,
      suffix: computePredictionSuffix(target, typedText),
      suggestions: [
        "chest pain and need a cardiologist",
        "chest pain clinic in Bangalore",
      ],
      intent: "cardiology",
      intentLabel: "Cardiology",
    };
  }

  if (clean === "chest pain" || clean.startsWith("chest p")) {
    const target = "chest pain and need a cardiologist";
    return {
      fullText: target,
      suffix: computePredictionSuffix(target, typedText),
      suggestions: [
        "I have chest pain and need a doctor",
        "chest pain doctor near me",
      ],
      intent: "cardiology",
      intentLabel: "Cardiology",
    };
  }

  if (clean.startsWith("i have chest") || clean.startsWith("i need a cardio") || clean.includes("chest pain and need a doctor")) {
    const target = "I have chest pain and need a doctor";
    return {
      fullText: target,
      suffix: computePredictionSuffix(target, typedText),
      suggestions: [
        "cardiologist near me",
        "cardiology consultation in Bangalore",
      ],
      intent: "cardiology",
      intentLabel: "Cardiology",
    };
  }

  if (clean.startsWith("cardio") || clean.startsWith("heart")) {
    const target = "cardiologist near me";
    return {
      fullText: target,
      suffix: computePredictionSuffix(target, typedText),
      suggestions: [
        "I have chest pain and need a doctor",
        "cardiology consultation near me",
      ],
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
  categoryTitle: "Recommended doctors in Bangalore",
  matchCountText: "24 doctors match your search",
  pulseRecommendationText: "Want a more personalised recommendation?",
  doctors: [
    {
      id: "doc-devi-shetty",
      name: "Dr. Devi Prasad Shetty",
      speciality: "Cardiologist",
      hospital: "Narayana Health City",
      experience: "35+ years experience",
      image: "/assets/doctor_1.png",
      city: "Bangalore",
      availableToday: true,
    },
    {
      id: "doc-bagirath",
      name: "Dr. Bagirath Raghuraman",
      speciality: "Cardiologist",
      hospital: "Narayana Health City",
      experience: "22 years experience",
      image: "/assets/doctor_2.png",
      city: "Bangalore",
      availableToday: true,
    },
    {
      id: "doc-ananya",
      name: "Dr. Ananya Rao",
      speciality: "Cardiologist",
      hospital: "Narayana Multispeciality Hospital",
      experience: "14 years experience",
      image: "/assets/doctor_avatar_female.png",
      city: "Bangalore",
      availableToday: true,
    },
    {
      id: "doc-vivek",
      name: "Dr. Vivek Menon",
      speciality: "Interventional Cardiologist",
      hospital: "Mazumdar Shaw Medical Center",
      experience: "18 years experience",
      image: "/assets/doctor_3.png",
      city: "Bangalore",
      availableToday: true,
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
  categoryTitle: "Recommended Orthopaedic Doctors in Bangalore",
  matchCountText: "16 doctors match your search",
  pulseRecommendationText: "Get customise recommendation with Pulse ai",
  doctors: [
    {
      id: "doc-prakash",
      name: "Dr. Prakash Gupta",
      speciality: "Orthopaedic Surgeon",
      hospital: "Narayana Multispeciality Hospital",
      experience: "16 years experience",
      image: "/assets/doctor_2.png",
      city: "Bangalore",
      availableToday: true,
    },
    {
      id: "doc-rohan",
      name: "Dr. Rohan Varma",
      speciality: "Sports Medicine Specialist",
      hospital: "Narayana Health City",
      experience: "13 years experience",
      image: "/assets/doctor_avatar_male.png",
      city: "Bangalore",
      availableToday: true,
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
    },
    {
      id: "doc-meera",
      name: "Dr. Meera Nambiar",
      speciality: "Orthopaedic Consultant",
      hospital: "Narayana Multispeciality Hospital",
      experience: "11 years experience",
      image: "/assets/doctor_avatar_female.png",
      city: "Bangalore",
      availableToday: true,
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
 * Returns structured search results based on query & location.
 */
export async function getSearchResults(
  query: string,
  location: string = "Bangalore"
): Promise<SearchResultsData> {
  const clean = query.toLowerCase();

  // If query is related to knee / orthopaedics / bone / joint
  if (
    clean.includes("knee") ||
    clean.includes("ortho") ||
    clean.includes("joint") ||
    clean.includes("bone") ||
    clean.startsWith("k")
  ) {
    return {
      ...ORTHOPAEDICS_RESULTS,
      categoryTitle: `Recommended Orthopaedic Doctors in ${location}`,
    };
  }

  // Default to cardiology results
  return {
    ...CARDIOLOGY_RESULTS,
    categoryTitle: `Recommended doctors in ${location}`,
  };
}
