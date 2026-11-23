import { getDesign20BookingDoctor } from "@/features/search/design20Directory";
import { Design15DraftStore } from "../design15/serverDraftStore";
import { parseDesign20Draft } from "./model";

/** D20 owns its own recovery store; real-directory IDs never enter the D15/D19 store. */
export class Design20DraftStore extends Design15DraftStore {
  protected resolveDoctor(doctorId: string) { return getDesign20BookingDoctor(doctorId); }
  protected parseDraft(value: unknown, doctorId: string) { return parseDesign20Draft(value, doctorId); }
  get(token: string, doctorId: string) {
    return parseDesign20Draft(super.get(token, doctorId), doctorId);
  }
}

const serverState = globalThis as typeof globalThis & { __nhDesign20DraftStore?: Design20DraftStore };
export const design20DraftStore = serverState.__nhDesign20DraftStore ??= new Design20DraftStore();

/** Upgrade development instances without discarding drafts created before the directory refresh. */
export function restoreDesign20DraftMethods(store: Design20DraftStore): void {
  // Early D20 instances stored a resolver closure as an own property. It shadows
  // the updated prototype and keeps the old directory alive after hot reload.
  if (Object.hasOwn(store, "resolveDoctor")) Reflect.deleteProperty(store, "resolveDoctor");
  if (Object.getPrototypeOf(store) !== Design20DraftStore.prototype) Object.setPrototypeOf(store, Design20DraftStore.prototype);
}
restoreDesign20DraftMethods(design20DraftStore);
