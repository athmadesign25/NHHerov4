export type AuthIdentity = { method: "mobile" | "email"; value: string };

/** Contact validation for this in-memory presentation flow, not authentication. */
export function normalizeAuthIdentity(method: AuthIdentity["method"], value: string): AuthIdentity | null {
  if (method === "mobile") {
    let phone = value.trim().replace(/[\s()-]/g, "");
    if (phone.startsWith("+91")) phone = phone.slice(3);
    else if (phone.length === 12 && phone.startsWith("91")) phone = phone.slice(2);
    return /^[6-9]\d{9}$/.test(phone) ? { method, value: phone } : null;
  }

  if (method !== "email") return null;
  const email = value.trim();
  if (email.length > 160 || /[\s\u0000-\u001f\u007f]/.test(email)) return null;
  const parts = email.split("@");
  if (parts.length !== 2) return null;
  const [local, domain] = parts;
  if (!local || local.length > 64 || local.startsWith(".") || local.endsWith(".") || local.includes("..")) return null;
  if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local)) return null;
  const labels = domain.split(".");
  if (labels.length < 2 || labels.some((label) => !/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/.test(label))) return null;
  if (!/^[a-zA-Z]{2,63}$/.test(labels.at(-1) ?? "")) return null;
  return { method, value: `${local}@${domain.toLowerCase()}` };
}

export function authContactError(method: AuthIdentity["method"], value: string): string | null {
  if (!value.trim()) return method === "mobile" ? "Enter your mobile number." : "Enter your email address.";
  if (normalizeAuthIdentity(method, value)) return null;
  return method === "mobile" ? "Enter a valid 10-digit Indian mobile number." : "Enter a valid email address, such as name@example.com.";
}

/** Fixed verification is intentionally limited to the local design journey. */
export function isValidVerificationCode(code: string): boolean {
  return code === "123456";
}
