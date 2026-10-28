import { PREVIEW_DRAFT_MAX_BYTES, PREVIEW_TOKEN_HEADER, validPreviewDoctorId, validPreviewToken } from "@/features/booking/design13/draft";
import { previewDraftApiEnabled, previewDraftStore, sameOriginPreviewRequest } from "@/features/booking/design13/serverDraftStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store, max-age=0", Pragma: "no-cache", "X-Content-Type-Options": "nosniff" };
const reply = (body: unknown, status = 200) => Response.json(body, { status, headers });

function credentials(request: Request): { token: string; doctorId: string } | Response {
  if (!previewDraftApiEnabled()) return reply({ error: "Preview recovery is unavailable." }, 404);
  if (!sameOriginPreviewRequest(request)) return reply({ error: "Request not permitted." }, 403);
  const token = request.headers.get(PREVIEW_TOKEN_HEADER) ?? "";
  const doctorId = new URL(request.url).searchParams.get("doctorId") ?? "";
  if (!validPreviewToken(token) || !validPreviewDoctorId(doctorId)) return reply({ error: "Invalid preview request." }, 400);
  return { token, doctorId };
}

async function readLimitedJson(request: Request): Promise<unknown> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) throw new Error("type");
  const length = request.headers.get("content-length");
  if (length && (!/^\d+$/.test(length) || Number(length) > PREVIEW_DRAFT_MAX_BYTES)) throw new Error("size");
  if (!request.body) throw new Error("body");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      size += next.value.byteLength;
      if (size > PREVIEW_DRAFT_MAX_BYTES) { await reader.cancel(); throw new Error("size"); }
      chunks.push(next.value);
    }
  } finally { reader.releaseLock(); }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(body)) as unknown;
}

export async function GET(request: Request) {
  const access = credentials(request);
  if (access instanceof Response) return access;
  return reply({ draft: previewDraftStore.get(access.token, access.doctorId) });
}

export async function POST(request: Request) {
  const access = credentials(request);
  if (access instanceof Response) return access;
  let value: unknown;
  try { value = await readLimitedJson(request); }
  catch { return reply({ error: "Invalid or oversized preview draft." }, 400); }
  const result = previewDraftStore.put(access.token, access.doctorId, value);
  if (result === "invalid") return reply({ error: "Invalid preview draft." }, 400);
  if (result === "full") return reply({ error: "Preview recovery is temporarily unavailable." }, 503);
  return reply({ saved: true });
}

export async function DELETE(request: Request) {
  const access = credentials(request);
  if (access instanceof Response) return access;
  previewDraftStore.delete(access.token, access.doctorId);
  return reply({ cleared: true });
}
