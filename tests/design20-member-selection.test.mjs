import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
registerHooks({
  resolve(specifier, context, nextResolve) {
    const candidate = specifier.startsWith("@/") ? path.join(root, "src", specifier.slice(2))
      : specifier.startsWith(".") && context.parentURL?.startsWith(pathToFileURL(root).href)
        ? fileURLToPath(new URL(specifier, context.parentURL)) : null;
    if (candidate && existsSync(candidate + ".ts")) return nextResolve(pathToFileURL(candidate + ".ts").href, context);
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.startsWith(pathToFileURL(root).href) && url.endsWith(".ts") && !url.includes("/node_modules/")) {
      return { format: "module", shortCircuit: true, source: ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
      }).outputText };
    }
    return nextLoad(url, context);
  },
});

const { design20WithBookingMember } = await import("../src/features/booking/design20/model.ts");
const { getBookingMemberSelection, chooseBookingMember, rememberBookingMembers, resetBookingMemberSelection, protectConfirmedBookingMember } = await import("../src/features/booking/design20/memberSelection.ts");
const { design17Patients } = await import("../src/features/booking/design17/patients.ts");
const { defaultSponsorshipForPatient } = await import("../src/features/booking/design20/pricing.ts");
const identity = { method: "email", value: "member@example.test" };
const patients = design17Patients(identity);
const draft = { version: 1, doctorId: "dr-1", identity, patients, selectedPatientId: "existing-self", sponsorshipId: "one-health-lite", selection: { doctorId: "dr-1", mode: "hospital", hospital: "Hospital A", date: "2026-11-04", time: "10:30 AM" }, stage: "appointment", payment: "online", failureHold: null, receipt: null };
test("navbar member preference reaches booking and updates only member-linked benefits", () => {
 resetBookingMemberSelection(); chooseBookingMember("existing-child");
 const next = design20WithBookingMember(draft, getBookingMemberSelection());
 assert.equal(next.selectedPatientId, "existing-child");
 assert.equal(next.sponsorshipId, defaultSponsorshipForPatient(patients.find(p=>p.id==="existing-child")));
 assert.equal(next.selection, draft.selection); assert.equal(next.payment,draft.payment);
 assert.equal(draft.selectedPatientId,"existing-self");
 assert.equal(design20WithBookingMember(next,getBookingMemberSelection()),next);
});
test("no explicit preference preserves restored choice and unknown members cannot be selected", () => {
 resetBookingMemberSelection(); chooseBookingMember("unknown");
 assert.equal(getBookingMemberSelection().selectedId,null);
 assert.equal(design20WithBookingMember(draft,getBookingMemberSelection()),draft);
});
test("new members are shared across doctors without sharing account contact details", () => {
 resetBookingMemberSelection();
 const member={id:"new-member",patient:{name:"Family member",age:"42",gender:"female",relation:"other",phone:"9876543210",email:identity.value}};
 rememberBookingMembers([...patients,member],member.id);
 const next=design20WithBookingMember(draft,getBookingMemberSelection());
 assert.equal(next.selectedPatientId,member.id); assert.equal(next.sponsorshipId,null);
 assert.equal(next.patients.find(p=>p.id===member.id).patient.email,identity.value);
 assert.equal(next.patients.find(p=>p.id===member.id).patient.phone,"");
 assert.equal(getBookingMemberSelection().members.some(p=>"phone" in p||"email" in p),false);
 resetBookingMemberSelection(); assert.equal(getBookingMemberSelection().selectedId,null);
 assert.equal(getBookingMemberSelection().members.some(p=>p.id===member.id),false);
});
test("member switching never changes anonymous drafts or completed receipts",()=>{
 chooseBookingMember("existing-parent");
 const anonymous={...draft,identity:null};const completed={...draft,receipt:{ref:"confirmed"}};
 assert.equal(design20WithBookingMember(anonymous,getBookingMemberSelection()),anonymous);
 assert.equal(design20WithBookingMember(completed,getBookingMemberSelection()),completed);
 resetBookingMemberSelection();
});
test("confirmation protects the selected patient until leaving the receipt", () => {
 resetBookingMemberSelection(); chooseBookingMember("existing-spouse");
 const leave = protectConfirmedBookingMember();
 rememberBookingMembers(patients);
 chooseBookingMember("existing-child");
 assert.equal(getBookingMemberSelection().selectedId,"existing-spouse");
 assert.equal(getBookingMemberSelection().confirmed,true);
 leave(); chooseBookingMember("existing-child");
 assert.equal(getBookingMemberSelection().selectedId,"existing-child");
 resetBookingMemberSelection();
});
