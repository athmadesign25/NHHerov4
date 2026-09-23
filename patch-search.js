const fs = require('fs');
const path = './src/components/search/NHSearchExperience/searchData.ts';
let content = fs.readFileSync(path, 'utf8');

// 1. Replace getPredictiveCompletion
const predRegex = /export function getPredictiveCompletion\([\s\S]*?\}[\r\n]*(?=\/\/ ═══════════════════════════════════════════════════════════════════════════════)/;
const newPred = `export async function getPredictiveCompletion(typedText: string): Promise<PredictiveState | null> {
  const clean = typedText.trim();
  if (!clean) return null;
  try {
    const res = await fetch(\`/api/search?query=\${encodeURIComponent(clean)}\`);
    if (!res.ok) throw new Error("API failed");
    const data = await res.json();
    const items = data.inBand || [];
    const firstMatchName = items.length > 0 ? items[0].name : \`\${clean} specialist\`;
    const fullText = clean.length <= firstMatchName.length && firstMatchName.toLowerCase().startsWith(clean.toLowerCase())
      ? firstMatchName
      : \`\${clean} ...\`;
    const suggestions = items.slice(0, 3).map((i: any) => i.name);
    return {
      fullText: fullText,
      suffix: fullText.length > clean.length ? fullText.substring(clean.length) : "",
      suggestions: suggestions.length > 0 ? suggestions : [\`Search for \${clean}\`],
      intent: "general",
      intentLabel: items.length > 0 && items[0].subSpeciality ? items[0].subSpeciality : "Clinical Care",
    };
  } catch (err) {
    console.error("Predictive fetch error", err);
    return null;
  }
}
`;
content = content.replace(predRegex, newPred);

// 2. Replace getSearchResults
const searchRegex = /export async function getSearchResults\([\s\S]*$/;
const newSearch = `export async function getSearchResults(query: string, location: string = "Bangalore"): Promise<SearchResultsData> {
  const clean = query.trim();
  const proximity = getProximityContext(location);
  const baseResults = CARDIOLOGY_RESULTS; // Fallback for doctors since API doesn't return doctors yet
  
  let mappedTreatments = baseResults.treatments;
  let mappedSpecialties = baseResults.relatedSpecialties;
  
  if (clean) {
    try {
      const res = await fetch(\`/api/search?query=\${encodeURIComponent(clean)}\`);
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
    const distNote = proximity.distanceKm ? \` (\${proximity.distanceKm} km)\` : " (within 100 km)";
    tailoredDoctors = baseResults.doctors.map((doc) => ({
      ...doc, city: proximity.nearestHubName || "Bangalore", consultationType: "both" as const,
      hospital: \`\${doc.hospital}\${distNote}\`, distanceNote: \`\${proximity.distanceKm || 38} km away\`,
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
`;
content = content.replace(searchRegex, newSearch);

fs.writeFileSync(path, content);
console.log("Patched searchData.ts successfully");
