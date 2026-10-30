import { NextRequest, NextResponse } from "next/server";
import { ARTICLES_DIRECTORY_DATA, ArticleItem } from "@/data/articlesDirectoryData";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("query") ?? "").trim().toLowerCase();
    const category = (searchParams.get("category") ?? "").trim().toLowerCase();
    const limit = parseInt(searchParams.get("limit") ?? "48", 10);

    let results = [...ARTICLES_DIRECTORY_DATA];

    if (category && category !== "all") {
      results = results.filter((item) => {
        return item.categorySlug.toLowerCase() === category || item.category.toLowerCase().includes(category);
      });
    }

    if (query) {
      results = results.filter((item) => {
        const fullContent = `${item.title} ${item.category} ${item.author} ${item.summary} ${item.overview} ${item.keyTakeaways.join(" ")}`.toLowerCase();
        return fullContent.includes(query);
      });
    }

    return NextResponse.json({
      success: true,
      total: results.length,
      items: results.slice(0, limit),
    });
  } catch (err: unknown) {
    console.error("[Articles API] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}
