import { motionValue } from "framer-motion";

// How far the hero search composer is through its trip into the floating
// quick-actions bar: 0 while it is still in the hero, 1 once it has been
// absorbed. The bar reads this to open its own third slot in step with the
// composer's arrival, which is what makes the two read as one movement
// rather than a thing fading out over another thing fading in.
//
// A module-level motion value rather than context or an event: the two
// components sit in different trees, and this has to update per frame
// without re-rendering either of them.
export const searchDockProgress = motionValue(0);
