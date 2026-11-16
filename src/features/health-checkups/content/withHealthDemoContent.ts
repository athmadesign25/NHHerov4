import type { HealthItem } from "../catalog";
import type { HealthItemDetails } from "../healthDetailTypes";
import { generalPreparation, generalPreparationSource, RESEARCH_PROFILES } from "./researchedProfiles";

const hasText = (values?: readonly string[]) => Boolean(values?.some(value => value.trim()));
const normalized = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "");
export function researchProfileFor(item: Pick<HealthItem, "name" | "kind">) {
  return item.kind === "test" ? RESEARCH_PROFILES.find(profile => profile.match.test(normalized(item.name))) : undefined;
}

/**
 * Server route adapter for stakeholder previews only. Source/API fields always win.
 * Deliberately never generates prices, turnaround claims, eligibility, test counts,
 * package contents or membership relationships. Remove this adapter for release.
 */
export function withHealthDemoContent(item: HealthItem): HealthItem {
  const existing = item.details;
  const profile = researchProfileFor(item);
  const packageAbout = item.inclusions.length
    ? "This health package brings together the listed investigations in one booking at your chosen centre. Review the included tests with your clinician to understand whether the package suits your needs."
    : "This health checkup brings together investigations offered by your chosen centre. Confirm the included tests and any consultations with the centre before booking.";
  const draftAbout = item.kind === "package" ? packageAbout : profile?.about
    ?? `${item.name} is a specialised investigation offered by this centre. The requesting clinician uses it to answer a specific clinical question; confirm the exact test and sample requirements before booking.`;
  const packagePreparation = [
    "Confirm the package’s preparation instructions with the centre before your visit, including whether any included tests require fasting.",
    "Bring relevant previous reports and a list of your medicines. Follow any specific instructions for sample collection or appointments.",
  ];
  const draftInstructions = item.kind === "package" ? packagePreparation : profile?.preparation.length ? profile.preparation : generalPreparation;
  const about = hasText(existing?.about) ? existing!.about : item.description.trim() ? [item.description.trim()] : [draftAbout];
  const hasInstructionGroups = existing?.instructionGroups?.some(group => hasText(group.paragraphs) || hasText(group.items));
  const instructions = hasText(existing?.instructions) ? existing!.instructions : hasInstructionGroups ? []
    : item.preparation.trim() ? [item.preparation.trim()] : draftInstructions;
  const addedAbout = !hasText(existing?.about) && !item.description.trim();
  const addedInstructions = !hasText(existing?.instructions) && !hasInstructionGroups && !item.preparation.trim();
  const addedSample = !hasText(existing?.sampleRequired) && Boolean(profile?.sample);
  const usesDraft = addedAbout || addedInstructions || addedSample;
  const details: HealthItemDetails = {
    ...existing,
    about,
    instructions,
    sampleRequired: hasText(existing?.sampleRequired) ? existing!.sampleRequired : profile?.sample ? [profile.sample] : [],
    testGroups: existing?.testGroups ?? item.includedTests ?? [],
    contentType: profile?.type ?? existing?.contentType,
    ...(usesDraft ? { editorial: {
      status: "researched-demo" as const,
      reviewedAt: "2026-11-13",
      profile: profile?.id ?? (item.kind === "package" ? "health-package" : "specialist-investigation"),
      sources: [...new Set([...(profile?.sources ?? []), generalPreparationSource])],
      draftFields: [...(addedAbout ? ["about"] : []), ...(addedInstructions ? ["instructions"] : []), ...(addedSample ? ["sampleRequired"] : [])],
    } } : {}),
  };
  return { ...item, details };
}
