/**
 * The collapsed banner's mark.
 *
 * Two renderings of the same megaphone. `currentColor` is the default,
 * so the toast and the island tile each tint it from their own context —
 * the artwork arrived with a literal #000000, which would have been
 * black in both.
 *
 * `gradient` is the mobile toast's version, where the mark sits on a
 * deep blue plate and is lit from the top left. The gradient is part of
 * the artwork rather than a UI colour, so it is not tokenised.
 *
 * The gradient id comes from useId rather than a module counter. Two of
 * these on one page sharing an id would have the second silently reuse
 * the first one's fill, and a counter incremented during render is both
 * a render side effect and wrong under SSR, where the server and client
 * would disagree on the number.
 */

import { useId } from "react";

export default function AnnouncementIcon({
  size = 32,
  gradient = false,
}: {
  size?: number;
  gradient?: boolean;
}) {
  const id = `announcement-grad-${useId()}`;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 15 15"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <path
        d="M11.1027 3.99771H8.89351C8.73198 3.98827 5.91715 3.79011 3.23666 1.54202C3.10722 1.43331 2.94944 1.36379 2.78186 1.34164C2.61428 1.31949 2.44386 1.34562 2.29062 1.41697C2.13738 1.48832 2.00768 1.60191 1.91676 1.74441C1.82584 1.88692 1.77747 2.05241 1.77734 2.22144V11.1028C1.77737 11.2719 1.82566 11.4374 1.91653 11.58C2.00741 11.7226 2.13711 11.8363 2.29037 11.9077C2.44363 11.9791 2.61409 12.0053 2.78172 11.9831C2.94935 11.961 3.10718 11.8915 3.23666 11.7827C5.33321 10.0242 7.5108 9.52023 8.43834 9.37924V11.14C8.43815 11.2863 8.47413 11.4304 8.54309 11.5595C8.61204 11.6886 8.71182 11.7987 8.83356 11.8799L9.44415 12.2868C9.56217 12.3655 9.69734 12.4149 9.83835 12.4307C9.97936 12.4465 10.1221 12.4282 10.2546 12.3775C10.3871 12.3268 10.5056 12.2451 10.6 12.1392C10.6945 12.0333 10.7622 11.9063 10.7974 11.7689L11.4508 9.30652C12.1262 9.22355 12.7442 8.8853 13.1782 8.36117C13.6121 7.83703 13.8291 7.16672 13.7846 6.48771C13.7401 5.80869 13.4374 5.17245 12.9388 4.70945C12.4401 4.24645 11.7832 3.9918 11.1027 3.99771ZM9.93706 11.5407V11.5468L9.32647 11.14V9.3265H10.5255L9.93706 11.5407ZM11.1027 8.43837H9.32647V4.88584H11.1027C11.5738 4.88584 12.0256 5.07298 12.3587 5.4061C12.6919 5.73921 12.879 6.19101 12.879 6.66211C12.879 7.1332 12.6919 7.585 12.3587 7.91811C12.0256 8.25123 11.5738 8.43837 11.1027 8.43837Z"
        fill={gradient ? `url(#${id})` : "currentColor"}
      />
      {gradient && (
        <defs>
          <linearGradient
            id={id}
            x1="4.60547"
            y1="3.83398"
            x2="8.10547"
            y2="12.334"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" />
            <stop offset="1" stopColor="#70AEFF" />
          </linearGradient>
        </defs>
      )}
    </svg>
  );
}
