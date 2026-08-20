import { NextRequest, NextResponse } from "next/server";
import https from "https";

const INTERNAL_API_BASE = "https://172.19.1.11:9870";
const SEARCH_PATH = "/api/healthcare-search-projections/data";

// Server-side agent; disables cert verification only for the known internal IP.
// Client-side SSL validation is unaffected.
const internalAgent = new https.Agent({ rejectUnauthorized: false });

function fetchInternal(url: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { agent: internalAgent }, (res) => {
      let body = "";
      res.on("data", (chunk: Buffer) => { body += chunk.toString(); });
      res.on("end", () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(new Error("Invalid JSON from upstream")); }
      });
    });
    req.on("error", reject);
    req.setTimeout(8000, () => {
      req.destroy(new Error("Upstream request timed out"));
    });
    req.end();
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("query") ?? "").trim();
  const cityId = searchParams.get("cityId") ?? "";

  if (!query) {
    return NextResponse.json({ error: "query is required" }, { status: 400 });
  }

  const upstream = new URL(`${INTERNAL_API_BASE}${SEARCH_PATH}`);
  upstream.searchParams.set("query", query);
  upstream.searchParams.set("type", "4"); // always fixed
  if (cityId) upstream.searchParams.set("cityId", cityId);

  try {
    const data = await fetchInternal(upstream.toString());
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upstream error";
    console.error("[search proxy]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
