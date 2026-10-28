import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rootUrl = pathToFileURL(root).href;
registerHooks({
  resolve(specifier, context, nextResolve) {
    const candidate = specifier.startsWith(".") && context.parentURL?.startsWith(rootUrl)
      ? fileURLToPath(new URL(specifier, context.parentURL)) : null;
    if (candidate && existsSync(candidate + ".ts")) return nextResolve(pathToFileURL(candidate + ".ts").href, context);
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.startsWith(rootUrl) && url.endsWith(".ts") && !url.includes("/node_modules/")) {
      return { format: "module", shortCircuit: true, source: ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
      }).outputText };
    }
    return nextLoad(url, context);
  },
});

// Exercise the route's actual pure helper without adding a prohibited custom
// Next page export or loading its unrelated browser-only booking components.
const pagePath = path.join(root, "src/app/doctors/[slug]/book/page.tsx");
const page = ts.createSourceFile(pagePath, readFileSync(pagePath, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const helper = page.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === "bookingDatesForDesign");
assert.ok(helper, "the booking route provides its date-window helper");
const timeUrl = pathToFileURL(path.join(root, "src/features/booking/appointmentTime.ts")).href;
const stateUrl = pathToFileURL(path.join(root, "src/features/booking/useBookingState.ts")).href;
const source = ts.transpileModule(`import { appointmentDates, DESIGN16_BOOKING_DAYS } from ${JSON.stringify(timeUrl)};
import { generateDates } from ${JSON.stringify(stateUrl)};
export ${helper.getText(page)}`, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const { bookingDatesForDesign } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
const { appointmentDates, DESIGN16_BOOKING_DAYS } = await import(timeUrl);
const { generateDates } = await import(stateUrl);

for (const design of ["d16", "d17"]) for (const zone of ["Asia/Kolkata", "UTC", "America/Los_Angeles", "Pacific/Auckland"]) {
  test(`${design} chosen dates survive the booking handoff around India midnight in ${zone}`, () => {
    const previous = process.env.TZ;
    process.env.TZ = zone;
    try {
      for (const [instant, first, last, weekday] of [
        ["2026-10-23T18:29:59.000Z", "2026-10-23", "2026-11-12", "Fri"],
        ["2026-10-23T18:30:00.000Z", "2026-10-24", "2026-11-13", "Sat"],
        ["2026-10-24T12:00:00.000Z", "2026-10-24", "2026-11-13", "Sat"],
      ]) {
        const now = Date.parse(instant);
        const directoryDates = appointmentDates(now, DESIGN16_BOOKING_DAYS);
        const bookingDates = bookingDatesForDesign(design, now);
        assert.equal(bookingDates.length, 21);
        assert.deepEqual(bookingDates.map((date) => date.fullDate), directoryDates);
        assert.deepEqual(bookingDates[0], { fullDate: first, date: first.slice(-2), day: weekday, month: "OCT", hasSlots: true });
        assert.equal(bookingDates.at(-1).fullDate, last);
        assert.equal(bookingDates.at(-1).month, "NOV");
        for (const chosenDate of directoryDates) {
          assert.equal(bookingDates.find((date) => date.fullDate === chosenDate)?.fullDate, chosenDate,
            `selected ${chosenDate} remains valid in ${zone} at ${instant}`);
        }
      }
    } finally {
      if (previous === undefined) delete process.env.TZ;
      else process.env.TZ = previous;
    }
  });
}

test("other booking designs retain their existing local date generation", () => {
  assert.equal(appointmentDates(Date.now()).length, 15);
  for (const design of [null, "d3", "d4", "d5", "d6", "d7", "d15-light"]) {
    assert.deepEqual(bookingDatesForDesign(design), generateDates());
  }
});
