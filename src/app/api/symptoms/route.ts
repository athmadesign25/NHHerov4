import { NextRequest, NextResponse } from "next/server";
import { SYMPTOMS_DATA, SymptomItem } from "@/data/symptomsData";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("query") ?? "").trim().toLowerCase();
    const organ = (searchParams.get("organ") ?? "").trim().toLowerCase();
    const limit = parseInt(searchParams.get("limit") ?? "48", 10);

    let results = [...SYMPTOMS_DATA];

    if (organ && organ !== "all") {
      const aliasMap: Record<string, RegExp> = {
        urinary: /kidney|renal|urinary|bladder|urolog/,
        gynaecology: /pelvic|bleeding|abdominal|lump|fatigue/,
        endocrine: /fatigue|weight|thirst|thyroid|diabet/,
        rheumatology: /joint|bone|stiffness|pain|swelling|ortho/,
        surgery: /abdominal|stomach|lump|pain|gastro/,
      };
      const matched = results.filter((item) => {
        if (item.organ === organ) return true;
        const fullContent = `${item.title} ${item.shortTitle} ${item.speciality} ${item.summary} ${item.overview}`.toLowerCase();
        if (aliasMap[organ] && aliasMap[organ].test(fullContent)) return true;
        return fullContent.includes(organ);
      });
      if (matched.length > 0) results = matched;
    }

    if (query) {
      results = results.filter((item) => {
        const fullContent = `${item.title} ${item.shortTitle} ${item.speciality} ${item.summary} ${item.overview} ${item.commonCauses.join(" ")} ${item.relatedConditions.join(" ")}`.toLowerCase();
        return fullContent.includes(query);
      });
    }

    return NextResponse.json({
      success: true,
      total: results.length,
      items: results.slice(0, limit),
    });
  } catch (err: unknown) {
    console.error("[Symptoms API] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch symptoms" },
      { status: 500 }
    );
  }
}
