import type { HealthDetailSection, HealthItemDetails, HealthTestGroup } from "./healthDetailTypes";

type SourceRecord = Record<string, unknown>;
const record = (value: unknown): SourceRecord => value !== null && typeof value === "object" && !Array.isArray(value) ? value as SourceRecord : {};
const list = (value: unknown): unknown[] => Array.isArray(value) ? value : value === undefined || value === null ? [] : [value];

/** Render source copy as text, never HTML; retain paragraph and list boundaries. */
export function healthSourceText(value: unknown): string {
  if (typeof value !== "string") return "";
  const entities: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ndash: "–", mdash: "—", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“" };
  return value.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<\s*br\s*\/?\s*>|<\/(?:p|div|li|h[1-6]|tr)>/gi, "\n").replace(/<[^>]*>/g, "")
    .replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (full, entity: string) => {
      if (!entity.startsWith("#")) return entities[entity.toLowerCase()] ?? full;
      const code = entity.toLowerCase().startsWith("#x") ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : full;
    }).replace(/[\t ]+/g, " ").replace(/ *\n */g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function unique(values: string[]): string[] { return [...new Set(values.filter(Boolean))]; }
function paragraphs(value: unknown): string[] {
  if (typeof value === "string") return healthSourceText(value).split(/\n+/).filter(Boolean);
  if (Array.isArray(value)) return unique(value.flatMap(paragraphs));
  if (!value || typeof value !== "object") return [];
  const source = record(value);
  // Strapi block text and common NH descriptive fields, excluding IDs and assets.
  return unique([healthSourceText(source.text), ...paragraphs(source.children), ...paragraphs(source.Description), ...paragraphs(source.description)]);
}
function title(source: SourceRecord): string { return healthSourceText(source.Title ?? source.Name ?? source.title ?? source.name); }
function description(source: SourceRecord): string { return healthSourceText(source.Description ?? source.description); }
function entryText(value: unknown): string {
  if (typeof value === "string") return healthSourceText(value);
  const source = record(value);
  return [title(source), description(source)].filter(Boolean).join(": ");
}
function testGroups(value: unknown, itemLabel: "tests" | "parameters"): HealthTestGroup[] {
  return list(value).map(value => {
    const source = record(value);
    const parameterDetails = list(source.TestList).map(value => {
      if (typeof value === "string") return { name: healthSourceText(value) };
      const entry = record(value);
      const name = title(entry);
      const detail = description(entry);
      return { name: name || detail, ...(name && detail ? { description: detail } : {}) };
    }).filter(entry => entry.name);
    const detail = description(source);
    return { name: title(source), parameters: parameterDetails.map(entry => entry.name), parameterDetails, itemLabel, ...(detail ? { description: detail } : {}) };
  }).filter(group => group.name);
}
function contentSections(value: unknown, fallbackTitle: string): HealthDetailSection[] {
  if (typeof value === "string") return paragraphs(value).length ? [{ title: fallbackTitle, paragraphs: paragraphs(value) }] : [];
  return list(value).flatMap(value => {
    const source = record(value);
    const heading = title(source) || fallbackTitle;
    const body = paragraphs(source.Description ?? source.description);
    const items = unique(list(source.DescriptionList ?? source.items ?? source.List).map(entryText));
    const nested = source.InstructionList ?? source.BasicToDoList;
    const result = body.length || items.length ? [{ title: heading, paragraphs: body, ...(items.length ? { items } : {}) }] : [];
    return [...result, ...list(nested).flatMap(entry => contentSections(entry, heading))];
  });
}

/** Accept the CMS entity, the healthData object, or its public detail response. */
export function normalizeHealthDetails(raw: unknown): HealthItemDetails {
  const root = record(raw);
  const healthData = record(root.healthData ?? raw);
  const cmsData = record(healthData.cmsInfo).data;
  const source = cmsData ? record(list(cmsData)[0]) : healthData;
  const highlighted = testGroups(source.TestHighlights, "tests");
  const profiles = testGroups(source.profile_tests, "parameters");
  const groups = highlighted.length ? highlighted : profiles;
  const highlightedNames = new Set(highlighted.flatMap(group => [group.name, ...group.parameters]).map(name => name.trim().toLocaleLowerCase()));
  const additionalProfiles = highlighted.length ? profiles.filter(group => group.parameters.length || group.description || !highlightedNames.has(group.name.trim().toLocaleLowerCase())) : [];
  const instruction = record(source.HealthCheckupInstruction);
  const instructionGroups = contentSections(instruction.InstructionList, "Before your visit");
  const instructionDescription = description(instruction);
  const instructionTitle = title(instruction);
  if (instructionDescription && instructionDescription.toLowerCase() !== instructionTitle.toLowerCase()) instructionGroups.unshift({ title: instructionTitle || "Before your visit", paragraphs: paragraphs(instructionDescription) });
  const benefits = list(source.KeyFeatures).map(value => {
    if (typeof value === "string") return { description: healthSourceText(value) };
    const entry = record(value);
    const heading = title(entry);
    const detail = description(entry);
    return { ...(heading && detail ? { title: heading } : {}), description: detail || heading };
  }).filter(entry => entry.description);
  const samples = unique(list(source.SampleRequired).map(entryText));
  const sections = [
    ...contentSections(source.BasicToDo, "Before your visit"),
    ...contentSections(source.UnitDescription, "About the centre"),
  ];
  return {
    about: paragraphs(source.AboutTheTest), sampleRequired: samples, testGroups: groups,
    // Flat values remain available to preparation summaries; the page retains headings.
    instructions: instructionGroups.flatMap(group => [...group.paragraphs, ...(group.items ?? [])]),
    ...(healthSourceText(source.Subtitle) ? { subtitle: healthSourceText(source.Subtitle) } : {}),
    ...(benefits.length ? { benefits } : {}),
    ...(instructionGroups.length ? { instructionGroups } : {}),
    ...(additionalProfiles.length ? { profileTestGroups: additionalProfiles } : {}),
    ...(sections.length ? { sections } : {}),
  };
}
