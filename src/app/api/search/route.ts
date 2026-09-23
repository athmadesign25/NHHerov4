import { NextRequest, NextResponse } from "next/server";
import https from "https";

const INTERNAL_API_BASE = "https://172.19.1.11:9870";
const SEARCH_PATH = "/api/healthcare-search-projections/data";
// Upstream lives on a private IP — only reachable from inside the corporate
// network/VPN. Deployed environments (e.g. Vercel) cannot route to it at all,
// so requests there will always fail; keep the timeout short so the caller's
// UI can fall back to cached/simulated results quickly instead of hanging.
const UPSTREAM_TIMEOUT_MS = 5000;

// Server-side agent; disables cert verification only for the known internal IP.
// Client-side SSL validation is unaffected.
// keepAlive reuses the TCP+TLS connection across requests instead of paying a
// fresh handshake on every keystroke — this is the main source of the ~1s+
// per-request latency seen when typing quickly.
const internalAgent = new https.Agent({
  rejectUnauthorized: false,
  keepAlive: true,
  maxSockets: 20,
  keepAliveMsecs: 30000,
});

function fetchInternal(url: string, signal: AbortSignal): Promise<unknown> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new Error("Request aborted"));
      return;
    }

    const req = https.request(url, { agent: internalAgent }, (res) => {
      let body = "";
      res.on("data", (chunk: Buffer) => { body += chunk.toString(); });
      res.on("end", () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(new Error("Invalid JSON from upstream")); }
      });
    });

    const onAbort = () => req.destroy(new Error("Request aborted"));
    signal.addEventListener("abort", onAbort, { once: true });

    req.on("error", (err) => {
      signal.removeEventListener("abort", onAbort);
      reject(err);
    });
    req.on("close", () => signal.removeEventListener("abort", onAbort));
    req.setTimeout(UPSTREAM_TIMEOUT_MS, () => {
      req.destroy(new Error("Upstream request timed out"));
    });
    req.end();
  });
}

interface RawEntity {
  entityId?: number;
  entityType?: string;
  name?: string;
  subSpeciality?: string | null;
  hospitalName?: string | null;
  metaData?: Record<string, unknown> | null;
}

// Upstream sends ~15 extra bookkeeping fields per entity (rankingScore,
// searchText, matchedRank, anchorIds, ...) that the UI never reads. Stripping
// them here cuts payload size roughly in half, shrinking transfer + JSON
// parse time on every keystroke.
function pickEntityFields(entity: RawEntity) {
  return {
    entityId: entity.entityId,
    entityType: entity.entityType,
    name: entity.name,
    subSpeciality: entity.subSpeciality ?? null,
    hospitalName: entity.hospitalName ?? null,
    metaData: entity.metaData ?? null,
  };
}

function trimResponse(data: unknown) {
  if (!data || typeof data !== "object") return data;
  const raw = data as Record<string, unknown>;
  const arrayKeys = ["doctors", "specialities", "subSpecialities", "procedures", "treatments", "blogs", "skills"];
  const trimmed: Record<string, unknown> = {};
  for (const key of arrayKeys) {
    const list = raw[key];
    if (Array.isArray(list)) {
      trimmed[key] = list.map((item) => pickEntityFields(item as RawEntity));
    }
  }
  return trimmed;
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

  // Cancel the upstream request as soon as the client disconnects/aborts
  // (e.g. a new keystroke superseded this one), instead of letting it hang
  // for the full timeout and pile up dangling sockets.
  try {
    const data = await fetchInternal(upstream.toString(), request.signal);
    return NextResponse.json(trimResponse(data), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upstream error";
    console.error("[search proxy]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
