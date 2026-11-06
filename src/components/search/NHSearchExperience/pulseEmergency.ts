/** A local demo safeguard for the chest-pain conversation, not a diagnosis. */
export const NH_EMERGENCY_PHONE = "18003090309";
export const NH_EMERGENCY_PHONE_LABEL = "1800 309 0309";

export interface PulseEmergencyResponse {
  introText: string;
  narrative: string;
}

const chestPain = /\bchest\s+(?:pain|pressure|tightness|discomfort)\b|\bpain\s+(?:in|on|around)\s+(?:(?:my|the|your)\s+)?chest\b/i;
const otherPain = /\b(?:headache|migraine|(?:knee|back|stomach|tooth|ear)\s+pain)\b/i;
const severity = /\b(?:severe|unbearable|intense|excruciating|crushing|worsening|worse|stronger)\b|\b(?:really|very|too|so)\s+(?:high|bad|painful)\b|\bpain\b.{0,30}\b(?:high|increased|too\s+much)\b|\b(?:can['’]?t|cannot)\s+(?:bear|breathe|stand\s+(?:it|the\s+pain))\b/i;

function normalize(text: string): string {
  return text.toLowerCase().replace(/[’]/g, "'").replace(/\s+/g, " ").trim();
}

function hasCurrentChestPain(text: string): boolean {
  return chestPain.test(text) && !/\b(?:no|without|den(?:y|ies))\s+(?:any\s+)?chest\s+(?:pain|pressure|tightness|discomfort)\b|\bchest\s+pain\s+(?:is\s+)?(?:gone|resolved)\b/.test(text);
}

export function getPulseEmergencyResponse(
  prompt: string,
  conversation: readonly string[] = [],
): PulseEmergencyResponse | null {
  const current = normalize(prompt);
  // An explicit update that the pain has stopped must not inherit an older symptom.
  if (/\b(?:no\s+(?:more\s+)?(?:chest\s+)?pain|pain\s+(?:has\s+(?:gone|stopped)|is\s+(?:gone|resolved)))\b/.test(current)) return null;

  const positive = current.replace(/\b(?:not|isn't|isnt)\s+(?:(?:really|very|as|getting)\s+)?(?:severe|intense|unbearable|worse|worsening|high|bad)\b/g, "");
  if (!severity.test(positive)) return null;

  let chestContext = hasCurrentChestPain(current);
  if (!chestContext && !otherPain.test(current) && /\b(?:pain|it|this|breathe)\b/.test(current)) {
    // Follow-ups such as “the pain is really high now” refer to the latest symptom.
    for (const previous of [...conversation].reverse()) {
      const text = normalize(previous);
      if (chestPain.test(text)) {
        chestContext = hasCurrentChestPain(text);
        break;
      }
      if (otherPain.test(text)) break;
    }
  }
  if (!chestContext) return null;

  return {
    introText: "Please seek emergency care now.",
    narrative: "You mentioned that the chest pain is severe or getting worse. This could be a medical emergency. Call for emergency help now; do not wait for a doctor’s appointment or drive yourself. Narayana Health’s 24/7 emergency team can help you access emergency care.",
  };
}
