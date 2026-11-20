import { NextRequest, NextResponse } from "next/server";
import { TREATMENTS_PROCEDURES_DATA, TreatmentProcedureItem } from "@/data/treatmentsProceduresData";

// Helper to determine organ category from procedure metadata
function getProcedureOrgan(item: TreatmentProcedureItem): string {
  const text = `${item.title} ${item.shortTitle} ${item.speciality} ${item.summary} ${item.overview}`.toLowerCase();
  
  if (/heart|cardiac|coronary|valve|aortic|bypass|angioplasty|arrhythmia|pacemaker|ecmo|cabg|vascular/.test(text)) {
    return "heart";
  }
  if (/brain|neuro|spine|dbs|stroke|seizure|epilepsy|aneurysm|skull|craniotomy|parkinson/.test(text)) {
    return "brain";
  }
  if (/kidney|renal|dialysis|nephro|urinary|bladder|prostate|lithotripsy|kidney transplant/.test(text)) {
    return "kidney";
  }
  if (/liver|hepato|cirrhosis|biliary|gallbladder|cholecyst|liver transplant/.test(text)) {
    return "liver";
  }
  if (/lung|pulmonary|pulmon|respiratory|broncho|thoracic|pneumo/.test(text)) {
    return "lungs";
  }
  if (/bone|joint|knee|hip|ortho|arthro|fracture|ligament|tendon|spine|scoliosis/.test(text)) {
    return "bones";
  }
  if (/stomach|gastro|colon|bowel|endoscopy|intestine|hernia|bariatric|digestive|appendix/.test(text)) {
    return "stomach";
  }
  if (/cancer|onco|chemo|radiation|tumor|tumour|biopsy|lymphoma|leukemia|sarcoma/.test(text)) {
    return "cancer";
  }
  if (/eye|cornea|cataract|retina|glaucoma|lasik|ophthalm/.test(text)) {
    return "eyes";
  }
  if (/paediatric|pediatric|child|neonatal|infant|congenital/.test(text)) {
    return "paediatric";
  }
  return "other";
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("query") ?? "").trim().toLowerCase();
    const organ = (searchParams.get("organ") ?? "").trim().toLowerCase();
    const limit = parseInt(searchParams.get("limit") ?? "40", 10);

    let results = [...TREATMENTS_PROCEDURES_DATA];

    // Filter by organ category if requested
    if (organ && organ !== "all") {
      results = results.filter((item) => {
        const itemOrgan = getProcedureOrgan(item);
        if (itemOrgan === organ) return true;
        // Also check if organ keyword is anywhere in the procedure metadata
        const fullContent = `${item.title} ${item.shortTitle} ${item.speciality} ${item.summary} ${item.overview}`.toLowerCase();
        return fullContent.includes(organ);
      });
    }

    // Filter by search query if requested
    if (query) {
      results = results.filter((item) => {
        const titleMatch = item.title.toLowerCase().includes(query);
        const shortTitleMatch = item.shortTitle.toLowerCase().includes(query);
        const summaryMatch = item.summary.toLowerCase().includes(query);
        const specMatch = item.speciality.toLowerCase().includes(query);
        const overviewMatch = item.overview.toLowerCase().includes(query);
        return titleMatch || shortTitleMatch || summaryMatch || specMatch || overviewMatch;
      });
    }

    const paginated = results.slice(0, limit);

    return NextResponse.json({
      success: true,
      total: results.length,
      count: paginated.length,
      query: query || null,
      organ: organ || null,
      items: paginated,
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("[api/treatments]", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error fetching treatments",
    }, { status: 500 });
  }
}
