"use client";

/**
 * L2 banner iteration.
 *
 * The same landing page as `/`, with the top band in place of the L1
 * drawer prototype — so the two can be compared without one of them
 * carrying a floating toggle the other does not have. There is no control
 * panel here: the band has nothing to configure yet.
 */

import HomeComposition from "@/components/layout/HomeComposition";
import AnnouncementBand from "@/components/marketing/AnnouncementBand/AnnouncementBand";
import styles from "./L2banner.module.css";

export default function L2BannerPage() {
  return (
    /* The wrapper is what gets the rounded top on a phone, so the band
       behind shows through the corners. Desktop ignores it entirely. */
    <div className={styles.canvas}>
      {/* Two elements, not one: the outer carries the band's colour and
          the inner carries the radius, so the corner notch has something
          to reveal. On a single element the rounded top sat inside the
          padding, which is behind the fixed band and therefore invisible. */}
      <div className={styles.inner}>
        <HomeComposition />
      </div>
      <AnnouncementBand />
    </div>
  );
}
