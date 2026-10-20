"use client";

/**
 * L1 banner iteration — the centred modal banner, on the landing page.
 *
 * It lives on its own route rather than on `/` so the landing page stays
 * what it actually is. The prototype's trigger and control panel come
 * with it; when this is CMS-driven, only <MarketingDrawer config={…} />
 * remains and the route goes away.
 */

import HomeComposition from "@/components/layout/HomeComposition";
import MarketingDrawerLab from "@/components/marketing/MarketingDrawer";

export default function L1BannerPage() {
  return (
    <HomeComposition>
      <MarketingDrawerLab />
    </HomeComposition>
  );
}
