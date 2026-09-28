import { NextResponse } from "next/server";
import https from "https";

const INTERNAL_API_BASE = "https://172.19.1.11:9870";
const CITIES_PATH = "/api/healthcare-search-projections/city";
const UPSTREAM_TIMEOUT_MS = 5000;

const internalAgent = new https.Agent({
  rejectUnauthorized: false,
  keepAlive: true,
  maxSockets: 10,
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

export async function GET(request: Request) {
  const upstream = new URL(`${INTERNAL_API_BASE}${CITIES_PATH}`);

  try {
    const data = await fetchInternal(upstream.toString(), request.signal);
    return NextResponse.json(data, {
      headers: { 
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400"
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upstream error";
    console.error("[cities proxy]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
