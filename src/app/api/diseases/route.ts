import { NextRequest, NextResponse } from "next/server";
import { DISEASES_DATA, DiseaseItem } from "@/data/diseasesData";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("query") ?? "").trim().toLowerCase();
    const organ = (searchParams.get("organ") ?? "").trim().toLowerCase();
    const limit = parseInt(searchParams.get("limit") ?? "48", 10);

    let results = [...DISEASES_DATA];

    if (organ && organ !== "all") {
      results = results.filter((item) => {
        if (item.organ === organ) return true;
        const fullContent = `${item.title} ${item.shortTitle} ${item.speciality} ${item.summary} ${item.overview}`.toLowerCase();
        return fullContent.includes(organ);
      });
    }

    if (query) {
      results = results.filter((item) => {
        const fullContent = `${item.title} ${item.shortTitle} ${item.speciality} ${item.summary} ${item.overview} ${item.symptoms.join(" ")} ${item.treatments.join(" ")}`.toLowerCase();
        return fullContent.includes(query);
      });
    }

    return NextResponse.json({
      success: true,
      total: results.length,
      items: results.slice(0, limit),
    });
  } catch (err: unknown) {
    console.error("[Diseases API] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch diseases" },
      { status: 500 }
    );
  }
}
