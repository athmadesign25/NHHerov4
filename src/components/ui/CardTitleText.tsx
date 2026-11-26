import React from "react";

const TRAILING_STOP_WORDS = new Set([
  "&",
  "and",
  "or",
  "for",
  "of",
  "in",
  "to",
  "with",
  "a",
  "an",
  "the",
  "-",
  "–",
]);

/**
 * Splits a medium-length card title into two lines shaped so the top line
 * finishes slightly before the full row width (about one word short) while the
 * second line runs comfortably across the row.
 */
export function splitBalancedCardTitle(title: string): [string, string] | null {
  const clean = title.trim().replace(/\s+/g, " ");
  if (clean.length < 28 || clean.length > 64) {
    return null;
  }

  const colonIdx = clean.indexOf(": ");
  if (colonIdx !== -1) {
    const part1 = clean.slice(0, colonIdx + 1).trim();
    const part2 = clean.slice(colonIdx + 2).trim();
    if (
      part1.length >= 16 &&
      part1.length <= 29 &&
      part2.length <= 33 &&
      part1.length <= part2.length + 2
    ) {
      return [part1, part2];
    }
  }

  const words = clean.split(" ");
  if (words.length < 4 || clean.length > 62) {
    return null;
  }

  let best: [string, string] | null = null;
  let bestLen = -1;

  for (let i = 2; i < words.length; i += 1) {
    const l1 = words.slice(0, i).join(" ");
    const l2 = words.slice(i).join(" ");
    const lastWord = words[i - 1]?.toLowerCase() ?? "";

    if (l1.length < 15 || l1.length > 28) continue;
    if (l2.length > 33) continue;
    if (l1.length > l2.length) continue;

    // Prefer clean breaks that don't leave a dangling conjunction/preposition at the end of line 1
    const score = l1.length - (TRAILING_STOP_WORDS.has(lastWord) ? 6 : 0);
    if (score > bestLen) {
      bestLen = score;
      best = [l1, l2];
    }
  }

  return best;
}

/**
 * Combines distinct summary/overview/clinical sentences cleanly without duplicating
 * identical text so hover reading shows 5–7 rich lines of helpful context.
 */
export function buildCardHoverReading(parts: Array<string | undefined | null>): string {
  const seen = new Set<string>();
  const cleanParts: string[] = [];

  for (const raw of parts) {
    if (!raw) continue;
    const trimmed = raw.trim().replace(/\s+/g, " ");
    if (!trimmed) continue;
    const norm = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (!norm || seen.has(norm)) continue;

    const alreadyContained = cleanParts.some((existing) =>
      existing.toLowerCase().replace(/[^a-z0-9]+/g, " ").includes(norm)
    );
    if (alreadyContained) continue;

    seen.add(norm);
    const punctuated = /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
    cleanParts.push(punctuated);
  }

  return cleanParts.join(" ");
}

export function CardTitleText({ title }: { title: string }) {
  const split = splitBalancedCardTitle(title);
  if (!split) {
    return <>{title}</>;
  }

  return (
    <>
      {split[0]}
      <br />
      {split[1]}
    </>
  );
}
