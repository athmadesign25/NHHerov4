import { NextRequest, NextResponse } from "next/server";
import { DIAGNOSTICS_DATA, DiagnosticItem } from "@/data/diagnosticsData";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("query") ?? "").trim().toLowerCase();
    const organ = (searchParams.get("organ") ?? "").trim().toLowerCase();
    const limit = parseInt(searchParams.get("limit") ?? "48", 10);

    let results = [...DIAGNOSTICS_DATA];

    if (organ && organ !== "all") {
      const aliasMap: Record<string, RegExp> = {
        urinary: /kidney|renal|urinary|urine|bladder|urolog/,
        gynaecology: /mammogram|pelvic|ultrasound|cancer|biopsy|blood/,
        endocrine: /thyroid|hba1c|glucose|diabet|hormone|blood/,
        rheumatology: /bone|joint|x-ray|mri|ortho|arthritis/,
        surgery: /endoscop|ct|mri|ultrasound|biopsy|gastro/,
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
        const fullContent = `${item.title} ${item.shortTitle} ${item.modality} ${item.speciality} ${item.summary} ${item.overview} ${item.sampleType}`.toLowerCase();
        return fullContent.includes(query);
      });
    }

    return NextResponse.json({
      success: true,
      total: results.length,
      items: results.slice(0, limit),
    });
  } catch (err: unknown) {
    console.error("[Diagnostics API] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch diagnostics" },
      { status: 500 }
    );
  }
}
