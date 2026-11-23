import { ITEMS, addCartItem, getCartItems, type FacilityId, type HealthItem } from "./catalog";

type DetailAddition =
  | { status: "confirm-facility"; facilityId: FacilityId; ids: string[] }
  | { status: "blocked"; facilityId: FacilityId; ids: string[]; message: string }
  | { status: "ready"; facilityId: FacilityId; ids: string[]; message: string };

/** Detail-page Add is idempotent. Existing cart rules also apply on deep links. */
export function planHealthDetailAddition(ids: readonly string[], facilityId: FacilityId, item: HealthItem, catalog: readonly HealthItem[] = ITEMS): DetailAddition {
  const currentIds = getCartItems(ids, facilityId, catalog).map(entry => entry.id);
  if (!Number.isFinite(item.price) || item.price < 0) {
    return { status: "blocked", facilityId, ids: currentIds, message: "A price isn’t listed for this item. Please choose another option." };
  }
  if (item.facilityId !== facilityId && currentIds.length) {
    return { status: "confirm-facility", facilityId: item.facilityId, ids: currentIds };
  }
  const next = addCartItem(currentIds, item, item.facilityId, catalog);
  return {
    status: "ready", facilityId: item.facilityId, ids: next.ids,
    message: next.message ?? (currentIds.includes(item.id) ? `${item.name} is already in your selection.` : `${item.name} added to your selection.`),
  };
}
