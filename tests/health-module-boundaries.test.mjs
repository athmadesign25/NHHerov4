import assert from "node:assert/strict";
import test from "node:test";
import { checkSource } from "../scripts/check-booking-health-boundaries.mjs";

const healthFile = "src/features/health-checkups/BoundaryExample.tsx";

test("health screens can reuse explicit booking interfaces and local components", () => {
  assert.deepEqual(checkSource(healthFile, `
    import type { SavedPatient } from "@/features/booking/shared/types";
    import { formatBookingDate } from "@/features/booking/shared/dates";
    import BookingActionBar from "@/features/booking/shared/BookingActionBar";
    import HealthCheckout from "./HealthCheckout";
    import styles from "./HealthCheckout.module.css";
  `), []);
});

test("health screens cannot import private booking components, including relative paths", () => {
  for (const specifier of [
    "@/features/booking/design20/BookingMemberPicker",
    "../booking/design20/BookingMemberPicker",
    "@/features/booking/shared/../design20/BookingMemberPicker",
  ]) {
    assert.equal(checkSource(healthFile, `import Picker from "${specifier}";`).length, 1, specifier);
  }
});

test("route and private stylesheet imports cannot bypass health boundaries", () => {
  for (const specifier of [
    "@/app/search/designs/d20/AppointmentSelector",
    "../../app/search/designs/d20/DefaultDoctorCard.module.css",
    "@/features/booking/design20/BookingSummary.module.css",
  ]) {
    assert.equal(checkSource(healthFile, `import value from "${specifier}";`).length, 1, specifier);
  }
});

test("re-exports, lazy imports and type imports obey the same boundary", () => {
  for (const source of [
    'export { default } from "@/features/booking/design20/BookingMemberPicker";',
    'const picker = import("@/features/booking/design20/BookingMemberPicker");',
    'const picker = require("@/features/booking/design20/BookingMemberPicker");',
    'import picker = require("@/features/booking/design20/BookingMemberPicker");',
    'type Pricing = import("@/features/booking/design20/pricing").Pricing;',
  ]) assert.equal(checkSource(healthFile, source).length, 1, source);
});

test("booking screens and shared booking interfaces cannot depend on health implementation or catalogue", () => {
  for (const filename of [
    "src/features/booking/design20/BoundaryExample.tsx",
    "src/features/booking/shared/BoundaryExample.tsx",
    "src/app/doctors/[slug]/BoundaryExample.tsx",
    "src/app/search/designs/d20/BoundaryExample.tsx",
  ]) {
    for (const specifier of [
      "@/features/health-checkups/HealthCheckout",
      "@/data/health-checkups/source-details.json",
      "@/app/health-checkups/page",
    ]) assert.equal(checkSource(filename, `import value from "${specifier}";`).length, 1, `${filename} -> ${specifier}`);
  }
});

test("booking adapters can still wrap the existing booking implementations", () => {
  assert.deepEqual(checkSource("src/features/booking/shared/BookingMemberPicker.tsx", `
    "use client";
    export { default } from "../design20/BookingMemberPicker";
  `), []);
});

test("health source data cannot import UI or route implementations", () => {
  const filename = "src/data/health-checkups/BoundaryExample.ts";
  assert.equal(checkSource(filename, 'import Checkout from "@/features/health-checkups/HealthCheckout";').length, 1);
  assert.equal(checkSource(filename, 'import Page from "@/app/health-checkups/page";').length, 1);
  assert.deepEqual(checkSource(filename, 'import data from "./source-details.json";'), []);
});

test("shared search and drag controls stay independent of both features and routes", () => {
  for (const filename of [
    "src/components/ui/search-location/BoundaryExample.tsx",
    "src/components/ui/useMouseDragScroll.ts",
  ]) {
    assert.equal(checkSource(filename, 'import value from "@/features/booking/shared/dates";').length, 1);
    assert.equal(checkSource(filename, 'import value from "@/app/search/mockDoctors";').length, 1);
    assert.deepEqual(checkSource(filename, 'import { useRef } from "react"; import { duration } from "@/lib/motion";'), []);
  }
});

test("unrelated modules and similarly named folders are not restricted by booking ownership", () => {
  assert.deepEqual(checkSource("src/components/layout/BookingMemberMenu.tsx", 'import Store from "@/features/booking/design20/memberSelection";'), []);
  assert.deepEqual(checkSource("src/features/health-checkups-examples/Example.tsx", 'import Page from "@/app/health-checkups/page";'), []);
});

test("diagnostics report actual imports with line numbers, not comments or display text", () => {
  assert.deepEqual(checkSource(healthFile, `// import Page from "@/app/health-checkups/page";
const text = 'import Page from "@/app/health-checkups/page";';
import Page from "@/app/health-checkups/page";`), [
    `${healthFile}:3 -> @/app/health-checkups/page`,
  ]);
});
