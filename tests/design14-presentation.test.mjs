import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rootUrl = pathToFileURL(root).href;
const reactUrl = import.meta.resolve("react");
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "next/link") return { url: "nh-test:link", shortCircuit: true };
    const candidate = specifier.startsWith("@/") ? path.join(root, "src", specifier.slice(2))
      : specifier.startsWith(".") && context.parentURL?.startsWith(rootUrl)
        ? fileURLToPath(new URL(specifier, context.parentURL)) : null;
    if (candidate) for (const extension of [".ts", ".tsx"]) {
      if (existsSync(candidate + extension)) return nextResolve(pathToFileURL(candidate + extension).href, context);
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url === "nh-test:link") return { format: "module", shortCircuit: true, source: `import { createElement } from ${JSON.stringify(reactUrl)}; export default function Link(props) { return createElement("a", props); }` };
    if (url.startsWith(rootUrl) && url.endsWith(".module.css")) return { format: "module", shortCircuit: true, source: "export default new Proxy({}, { get: (_, key) => key });" };
    if (url.startsWith(rootUrl) && /\.tsx?$/.test(url) && !url.includes("/node_modules/")) return {
      format: "module", shortCircuit: true, source: ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
      }).outputText,
    };
    return nextLoad(url, context);
  },
});

const { default: PaymentPreview } = await import("../src/features/booking/design13/PaymentPreview.tsx");
const { default: ConfirmationStep } = await import("../src/features/booking/design7/ConfirmationStep.tsx");
const { default: PatientCheckout } = await import("../src/features/booking/design14/PatientCheckout.tsx");
const { defaultExistingPatients } = await import("../src/features/booking/design14/patients.ts");
const { EMPTY_PATIENT } = await import("../src/features/booking/design7/model.ts");
const noop = () => {};
const paymentProps = { fee: "₹1,200", expired: false, busy: false, failed: false, onSuccess: noop, onFailure: noop, onRetry: noop, onCancel: noop, onExpire: noop };
const doctor = { id: "dr-1", name: "Dr. Example", city: "Bangalore", fee: "₹1,200" };
const selection = { doctorId: doctor.id, mode: "hospital", hospital: "NH Hospital", date: "2026-10-22", time: "10:30 AM" };
const receipt = { ref: "NH7-12345678", selection, payment: "online", status: "confirmed", createdAt: Date.parse("2026-10-22T02:30:00Z") };
const confirmationProps = { doctor, design: "d14", receipt, patientName: "Example Patient", onCancel: noop, onNewPreview: noop };
const render = (component, props) => renderToStaticMarkup(createElement(component, props));
const text = (html) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
const phone = "9000000000";
const savedPatients = defaultExistingPatients(phone);
const checkoutProps = {
  patient: { ...EMPTY_PATIENT, phone }, onChange: noop, verifiedPhone: "", onVerify: noop,
  payment: "online", onPayment: noop, mode: "hospital", fee: "₹1,200", onSubmit: noop,
  expired: false, busy: false, savedPatients, onAddPatient: noop,
};

test("D14 requires matching phone login before rendering saved identities, patient fields or payment", () => {
  for (const verifiedPhone of ["", "9000000001"]) {
    const html = render(PatientCheckout, { ...checkoutProps, patient: savedPatients[0].patient, verifiedPhone });
    assert.match(text(html), /Log in to continue/);
    assert.match(text(html), /Send OTP/);
    const inputs = html.match(/<input\b[^>]*>/g) ?? [];
    assert.equal(inputs.length, 1);
    assert.match(inputs[0], /id="d14-phone"/);
    assert.match(inputs[0], /type="tel"/);
    for (const saved of savedPatients) assert.equal(text(html).includes(saved.patient.name), false);
    assert.doesNotMatch(text(html), /Add patient|How would you like to pay|Pay online|Pay at hospital|Consultation fee/);
  }
});

test("D14 verified login presents two existing patients and Add patient without a detail form or premature payment", () => {
  const html = render(PatientCheckout, { ...checkoutProps, verifiedPhone: phone });
  assert.match(text(html), /Who is this appointment for/);
  assert.match(text(html), /Add patient/);
  for (const saved of savedPatients) assert.equal(text(html).includes(saved.patient.name), true);
  const inputs = html.match(/<input\b[^>]*>/g) ?? [];
  assert.equal(inputs.length, 2);
  for (const input of inputs) {
    assert.match(input, /type="radio"/);
    assert.match(input, /name="d14-patient"/);
    assert.doesNotMatch(input, /checked=/);
  }
  assert.doesNotMatch(text(html), /How would you like to pay|Pay online|Pay at hospital|Consultation fee/);
  assert.doesNotMatch(html, /id="d14-new-/);
});

for (const mode of ["hospital", "video"]) test(`D14 selected patient reveals only the supported ${mode} payment choices`, () => {
  const selected = savedPatients[1];
  const html = render(PatientCheckout, { ...checkoutProps, patient: selected.patient, verifiedPhone: phone, mode });
  const inputs = html.match(/<input\b[^>]*>/g) ?? [];
  const selectedPatients = inputs.filter((input) => /name="d14-patient"/.test(input) && /checked=""/.test(input));
  assert.equal(selectedPatients.length, 1);
  assert.match(selectedPatients[0], new RegExp(`value="${selected.id}"`));
  assert.match(text(html), /How would you like to pay/);
  assert.match(text(html), /Pay online/);
  assert.match(text(html), /Consultation fee/);
  assert.match(text(html), /Pay ₹1,200 &amp; book/);
  const payments = inputs.filter((input) => /name="d14-payment"/.test(input));
  assert.equal(payments.length, mode === "hospital" ? 2 : 1);
  if (mode === "hospital") assert.match(text(html), /Pay at hospital/);
  else assert.doesNotMatch(text(html), /Pay at hospital/);
  assert.doesNotMatch(html, /id="d14-new-/);
});

test("D14 payment offers masked methods and a fee CTA without exposing scenario controls or financial inputs", () => {
  const html = render(PaymentPreview, { ...paymentProps, variant: "d14" });
  assert.match(text(html), /UPI/);
  assert.match(text(html), /Card/);
  assert.match(text(html), /a••••@okaxis/);
  assert.match(text(html), /Pay ₹1,200/);
  assert.doesNotMatch(text(html), /demo|preview|simulate|scenario|sample/i);
  assert.doesNotMatch(html, /<input|<textarea|<details/);
});

test("D14 recovery avoids asserting a charge result and expiry disables retry", () => {
  const retry = render(PaymentPreview, { ...paymentProps, variant: "d14", failed: true });
  assert.match(text(retry), /Retry payment/);
  assert.doesNotMatch(text(retry), /nothing was charged|refund|demo|preview|simulate/i);
  const expired = render(PaymentPreview, { ...paymentProps, variant: "d14", failed: true, expired: true });
  assert.match(text(expired), /hold has ended/);
  assert.match(expired, /<button[^>]*disabled=""[^>]*>Retry payment/);
});

for (const payment of ["online", "hospital"]) test(`D14 ${payment} confirmation shows booking details and omits rejected extra actions`, () => {
  const html = render(ConfirmationStep, { ...confirmationProps, receipt: { ...receipt, payment } });
  assert.match(text(html), /Appointment confirmed/);
  assert.match(text(html), /Booking reference/);
  assert.match(text(html), payment === "online" ? /Payment successful/ : /Pay at hospital/);
  assert.match(text(html), /Cancel appointment/);
  assert.match(html, /design=d14/);
  assert.doesNotMatch(text(html), /demo|preview|simulate|calendar|start a new|SMS|email/i);
});

test("D14 cancelled receipt does not claim that an online payment was refunded", () => {
  const html = render(ConfirmationStep, { ...confirmationProps, receipt: { ...receipt, status: "cancelled" } });
  assert.match(text(html), /Appointment cancelled/);
  assert.match(text(html), /Paid online/);
  assert.match(text(html), /Contact our care team for cancellation and refund information/);
  assert.doesNotMatch(text(html), /reversed|refunded|refund successful|demo|preview|SMS|email/i);
});

test("D13 keeps its explicit gateway scenarios and preview receipt actions", () => {
  const payment = render(PaymentPreview, paymentProps);
  assert.match(text(payment), /Demo gateway/);
  assert.match(text(payment), /Preview scenarios/);
  assert.match(text(payment), /Simulate payment failure/);
  const confirmation = render(ConfirmationStep, { ...confirmationProps, design: "d13" });
  assert.match(text(confirmation), /DESIGN 13 · PREVIEW COMPLETE/);
  assert.match(text(confirmation), /Save preview to calendar/);
  assert.match(text(confirmation), /Start a new preview/);
  assert.match(text(confirmation), /No real appointment is reserved/);
});
