import { NextRequest, NextResponse } from "next/server";
import { HOSPITALS_DIRECTORY_DATA, HospitalDirectoryItem } from "@/data/hospitalsDirectoryData";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("query") ?? "").trim().toLowerCase();
    const city = (searchParams.get("city") ?? "").trim().toLowerCase();
    const limit = parseInt(searchParams.get("limit") ?? "48", 10);

    let results = [...HOSPITALS_DIRECTORY_DATA];

    if (city && city !== "all") {
      results = results.filter((item) => {
        return item.city.toLowerCase() === city || item.state.toLowerCase() === city;
      });
    }

    if (query) {
      results = results.filter((item) => {
        const fullContent = `${item.name} ${item.city} ${item.state} ${item.type} ${item.address} ${item.keySpecialities.join(" ")}`.toLowerCase();
        return fullContent.includes(query);
      });
    }

    return NextResponse.json({
      success: true,
      total: results.length,
      items: results.slice(0, limit),
    });
  } catch (err: unknown) {
    console.error("[Hospitals API] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch hospitals" },
      { status: 500 }
    );
  }
}
