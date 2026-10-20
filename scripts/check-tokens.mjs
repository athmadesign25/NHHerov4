#!/usr/bin/env node
/**
 * Design-token guard.
 *
 * Finds raw values in the styles — colours, font sizes, durations,
 * easings — and tells you which token to use instead. It is not a
 * formatter and it does not rewrite anything; it reports, and fails the
 * build only where there is genuinely no argument.
 *
 * The grading is the point:
 *
 *   EXACT   the literal IS a token's value, written out longhand.
 *           There is no case for this, so in a stylesheet it fails.
 *   NEAR    close enough to a token that the difference is invisible
 *           (ΔRGB ≤ 10, a font size within 1px, a duration within 15%).
 *           Warned, with the token named — almost always drift worth
 *           collapsing, but occasionally deliberate.
 *   NEW     nothing in the system is close. Printed, never failed. These
 *           are the real exceptions — the Pulse AI accent spectrum, a
 *           brand asset's own palette — and the point of listing them is
 *           so a reviewer sees them rather than so the author is blocked.
 *
 * Anything genuinely outside the system takes an opt-out comment on the
 * same line or the line above, with a reason:
 *
 *   color: #8b5cf6;            /* token-ok: Pulse AI accent spectrum * /
 *
 * Tokens added to globals.css are listed separately. Adding one is
 * allowed; adding one silently is what this prevents.
 *
 * Usage:
 *   node scripts/check-tokens.mjs                 # files changed vs main
 *   node scripts/check-tokens.mjs --all           # the whole of src/
 *   node scripts/check-tokens.mjs --base <ref>    # compare against another ref
 */

import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const GLOBALS = "src/app/globals.css";
const args = process.argv.slice(2);
const CAP = args.includes("--full") ? Infinity : 20;
const ALL = args.includes("--all");
const BASE = (() => {
  const i = args.indexOf("--base");
  return i >= 0 ? args[i + 1] : "nahidremote/main";
})();

/* ── reading the system ──────────────────────────────────────────────── */

const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "");
const hexToRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (r, g, b) =>
  "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");

function readTokens(css) {
  const s = stripComments(css);
  const channels = new Map(); // hex -> token base that has an -rgb variant
  const colours = new Map(); // hex -> token name
  const indirect = new Map(); // --white -> white-rgb

  for (const [, n, r, g, b] of s.matchAll(
    /--([\w-]+)-rgb:\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g,
  )) {
    const hex = toHex(+r, +g, +b);
    if (!channels.has(hex)) channels.set(hex, n);
    if (!colours.has(hex)) colours.set(hex, n);
  }
  for (const [, n, v] of s.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\b/g)) {
    if (!colours.has(v.toLowerCase())) colours.set(v.toLowerCase(), n);
  }
  for (const [, n, t] of s.matchAll(/--([\w-]+):\s*rgb\(var\(--([\w-]+)-rgb\)\)/g)) {
    indirect.set(n, t);
  }

  const fontSizes = [...s.matchAll(/--(font-size-[\w-]+):\s*(\d+)px/g)].map(
    ([, n, v]) => ({ name: n, px: +v }),
  );
  const durations = [...s.matchAll(/--(duration-[\w-]+):\s*([\d.]+)(m?s)/g)].map(
    ([, n, v, u]) => ({ name: n, ms: +v * (u === "ms" ? 1 : 1000) }),
  );
  const easings = new Map(
    [...s.matchAll(/--(ease-[\w-]+):\s*(cubic-bezier\([^)]*\))/g)].map(([, n, v]) => [
      v.replace(/\s+/g, ""),
      n,
    ]),
  );
  const names = new Set([...s.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));

  return { channels, colours, indirect, fontSizes, durations, easings, names };
}

/* ── matching a literal to the system ────────────────────────────────── */

function nearestColour(hex, tokens) {
  const target = hexToRgb(hex);
  let best = null;
  for (const [h, name] of tokens.colours) {
    const d = Math.hypot(...hexToRgb(h).map((c, i) => c - target[i]));
    if (!best || d < best.d) best = { d, name, hex: h };
  }
  return best;
}

/* ── the scanner ─────────────────────────────────────────────────────── */

const EXEMPT = /token-ok\s*:/;

function scan(file, tokens) {
  const raw = readFileSync(path.join(ROOT, file), "utf8");
  const lines = raw.split("\n");
  const isCss = file.endsWith(".css");
  const findings = [];

  // Blank out comment bodies so commentary is never flagged, replacing
  // them with whitespace of the same shape. Deleting them outright
  // shifts every line after a block comment, which makes the reported
  // line numbers wrong and makes the token-ok lookup read the wrong row.
  const masked = raw
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .split("\n");

  // A token-ok comment covers its own line, the line under it, and the
  // rest of the rule it introduces. Authors write it above the selector,
  // not above each declaration, and a marker that does not cover the
  // block it obviously refers to just trains people to repeat it.
  const exemptLines = new Set();
  lines.forEach((l, i) => {
    if (!EXEMPT.test(l)) return;
    exemptLines.add(i);
    exemptLines.add(i + 1);
    for (let j = i + 1; j < lines.length; j++) {
      exemptLines.add(j);
      if (lines[j].includes("}")) break;      // end of the rule
      if (j - i > 60) break;                  // runaway guard
    }
  });
  const exemptAt = (i) => exemptLines.has(i);

  masked.forEach((line, i) => {
    if (!line.trim() || exemptAt(i)) return;
    const at = { file, line: i + 1, text: lines[i].trim().slice(0, 72) };

    const colours = [
      ...[...line.matchAll(/#[0-9a-fA-F]{6}\b/g)].map((m) => ({ hex: m[0].toLowerCase(), alpha: false })),
      ...[...line.matchAll(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g)].map((m) => ({
        hex: toHex(+m[1], +m[2], +m[3]),
        alpha: true,
      })),
    ];
    for (const { hex, alpha } of colours) {
      const best = nearestColour(hex, tokens);
      if (!best) continue;
      // An rgba() literal can only become a token if that token has an
      // -rgb channel to compose against. Plain hex tokens cannot be used
      // at opacity, so there is nothing for the author to do — saying
      // "use var(--pink-500)" there would be advice that does not work.
      const composable = !alpha || tokens.channels.has(best.hex);
      if (best.d === 0 && !composable) {
        findings.push({
          ...at,
          grade: "CHANNEL",
          what: `rgba(${hexToRgb(hex).join(", ")}, …)`,
          note: `matches --${best.name}, which has no --${best.name}-rgb channel`,
        });
      } else if (best.d === 0) {
        findings.push({ ...at, grade: "EXACT", what: hex, fix: `var(--${best.name})` });
      } else if (best.d <= 10 && !composable) {
        findings.push({ ...at, grade: "CHANNEL", what: `rgba(${hexToRgb(hex).join(", ")}, …)`,
          note: `near --${best.name} (ΔRGB ${best.d.toFixed(1)}), which has no channel variant` });
      } else if (best.d <= 10) {
        findings.push({
          ...at,
          grade: "NEAR",
          what: hex,
          fix: `var(--${best.name})`,
          note: `ΔRGB ${best.d.toFixed(1)}`,
        });
      } else {
        findings.push({ ...at, grade: "NEW", what: hex, note: `nearest --${best.name}, ΔRGB ${best.d.toFixed(0)}` });
      }
    }

    if (isCss) {
      for (const m of line.matchAll(/font-size:\s*(\d+(?:\.\d+)?)px/g)) {
        const px = +m[1];
        const hit = tokens.fontSizes.find((f) => f.px === px);
        const up = tokens.fontSizes.filter((f) => f.px >= px).sort((a, b) => a.px - b.px)[0];
        if (hit) findings.push({ ...at, grade: "EXACT", what: `${px}px`, fix: `var(--${hit.name})` });
        else if (up && up.px - px <= 1)
          findings.push({ ...at, grade: "NEAR", what: `${px}px`, fix: `var(--${up.name})`, note: `+${(up.px - px).toFixed(1)}px` });
        else
          findings.push({ ...at, grade: "NEW", what: `${px}px`, note: up ? `nearest step ${up.px}px` : "above the scale" });
      }

      for (const m of line.matchAll(/(?<![\w.-])(\d+(?:\.\d+)?)(ms|s)\b/g)) {
        const ms = +m[1] * (m[2] === "ms" ? 1 : 1000);
        if (ms > 600) continue; // the ramp is for transitions, not ambient loops
        const near = tokens.durations.reduce((a, b) =>
          Math.abs(b.ms - ms) < Math.abs(a.ms - ms) ? b : a,
        );
        const d = Math.abs(near.ms - ms);
        if (d === 0) findings.push({ ...at, grade: "EXACT", what: `${m[1]}${m[2]}`, fix: `var(--${near.name})` });
        else if (d <= Math.max(25, 0.15 * ms))
          findings.push({ ...at, grade: "NEAR", what: `${m[1]}${m[2]}`, fix: `var(--${near.name})`, note: `Δ${d}ms` });
      }

      for (const m of line.matchAll(/cubic-bezier\([^)]*\)/g)) {
        const name = tokens.easings.get(m[0].replace(/\s+/g, ""));
        if (name) findings.push({ ...at, grade: "EXACT", what: m[0], fix: `var(--${name})` });
      }
    }
  });

  return findings;
}

/* ── which files ─────────────────────────────────────────────────────── */

function targets() {
  if (ALL) {
    return execSync(`git ls-files 'src/**/*.module.css' 'src/**/*.tsx'`, { cwd: ROOT })
      .toString().trim().split("\n").filter(Boolean);
  }
  let base = BASE;
  try {
    execSync(`git rev-parse --verify ${base}`, { cwd: ROOT, stdio: "ignore" });
  } catch {
    console.error(`  (no ref ${base} — falling back to --all)\n`);
    return targets.call(null, (process.argv.push("--all"), undefined));
  }
  // Committed work AND the working tree. Looking only at `base...HEAD`
  // meant the check passed silently on everything you had not committed
  // yet, which is the state you are in when you would actually run it.
  const sets = [
    `git diff --name-only ${base}...HEAD`,
    "git diff --name-only HEAD",      // unstaged
    "git diff --name-only --cached",  // staged
    "git ls-files --others --exclude-standard", // new, untracked
  ];
  const seen = new Set();
  for (const cmd of sets) {
    for (const f of execSync(cmd, { cwd: ROOT }).toString().trim().split("\n")) {
      if (f && /\.(module\.css|tsx)$/.test(f) && existsSync(path.join(ROOT, f))) seen.add(f);
    }
  }
  return [...seen];
}

/* ── new tokens since the base ───────────────────────────────────────── */

function newTokens(tokens) {
  try {
    const before = readTokens(
      execSync(`git show ${BASE}:${GLOBALS}`, { cwd: ROOT }).toString(),
    );
    return [...tokens.names].filter((n) => !before.names.has(n));
  } catch {
    return null;
  }
}

/* ── report ──────────────────────────────────────────────────────────── */

const C = { red: "\x1b[31m", yellow: "\x1b[33m", dim: "\x1b[2m", bold: "\x1b[1m", off: "\x1b[0m" };

const tokens = readTokens(readFileSync(path.join(ROOT, GLOBALS), "utf8"));
const files = targets();
const all = files.flatMap((f) => scan(f, tokens));

const errors = all.filter((f) => f.grade === "EXACT" && f.file.endsWith(".css"));
const channel = all.filter((f) => f.grade === "CHANNEL");
const warns = all.filter((f) => f.grade === "NEAR" || (f.grade === "EXACT" && !f.file.endsWith(".css")));
const fresh = all.filter((f) => f.grade === "NEW");

const show = (list, colour, heading) => {
  if (!list.length) return;
  console.log(`\n${colour}${C.bold}${heading}${C.off}`);
  const byFile = new Map();
  for (const f of list) (byFile.get(f.file) ?? byFile.set(f.file, []).get(f.file)).push(f);
  for (const [file, items] of byFile) {
    console.log(`  ${C.dim}${file}${C.off}`);
    for (const f of items.slice(0, CAP)) {
      const fix = f.fix ? ` → ${C.bold}${f.fix}${C.off}` : "";
      const note = f.note ? ` ${C.dim}(${f.note})${C.off}` : "";
      console.log(`    ${String(f.line).padStart(5)}  ${f.what}${fix}${note}`);
    }
    if (items.length > CAP) console.log(`    ${C.dim}… ${items.length - CAP} more${C.off}`);
  }
};

console.log(`${C.bold}Design-token check${C.off} ${C.dim}— ${files.length} file(s) vs ${BASE}${C.off}`);

show(errors, C.red, `✗ ${errors.length} literal(s) that are exactly a token`);
show(warns, C.yellow, `! ${warns.length} close to a token`);
show(fresh, C.dim, `· ${fresh.length} with no close token — check these are deliberate`);
show(channel, C.dim, `· ${channel.length} used at opacity where the token has no -rgb channel`);
if (channel.length) {
  console.log(`  ${C.dim}Nothing to change in the component. Either give that token an${C.off}`);
  console.log(`  ${C.dim}-rgb channel in globals.css so it composes, or leave the literal.${C.off}`);
}

const added = newTokens(tokens);
if (added === null) console.log(`\n${C.dim}· could not read ${GLOBALS} at ${BASE}; skipped the new-token check${C.off}`);
else if (added.length) {
  console.log(`\n${C.yellow}${C.bold}· ${added.length} new token(s) in ${GLOBALS}${C.off}`);
  for (const n of added) console.log(`    ${n}`);
  console.log(`  ${C.dim}Adding one is fine. Say why in the PR — a token that duplicates${C.off}`);
  console.log(`  ${C.dim}an existing value at a slightly different number is how a${C.off}`);
  console.log(`  ${C.dim}system stops being one.${C.off}`);
}

if (errors.length) {
  console.log(`\n${C.red}Failed.${C.off} Those values already have names. Use them, or mark the`);
  console.log(`line ${C.bold}/* token-ok: why */${C.off} if it genuinely cannot be a token —`);
  console.log(`shader props, SVG attributes and Framer animate props cannot resolve var().`);
  process.exit(1);
}
console.log(`\n${errors.length ? "" : "OK — nothing that already has a name is written out longhand."}`);
