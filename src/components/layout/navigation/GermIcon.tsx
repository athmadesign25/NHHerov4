import { createLucideIcon } from "lucide-react";

// Supplied Lucide artwork; Germ is absent from the installed icon package.
const GermIcon = createLucideIcon("Germ", [
  ["path", { d: "m11 2 .925 1.848", key: "ray-1" }],
  ["path", { d: "M13 15h.01", key: "dot-1" }],
  ["path", { d: "m16 21-1-2.472", key: "ray-2" }],
  ["path", { d: "m19 2-1 1.804", key: "ray-3" }],
  ["path", { d: "m2 19 2.746-1.373", key: "ray-4" }],
  ["path", { d: "m22 16-2.474-2.13", key: "ray-5" }],
  ["path", { d: "m22 5-1.804 1", key: "ray-6" }],
  ["path", { d: "m3 10 2 2", key: "ray-7" }],
  ["path", { d: "M9 16h.01", key: "dot-2" }],
  ["path", { d: "M9 20v2", key: "ray-8" }],
  ["path", { d: "M9.33 7.035c-.51 1.478-1.786 2.93-3.09 3.794A5 5 0 009 20a12.1 12.1 0 0011.902-9.916A6 6 0 009.33 7.035", key: "body" }],
  ["circle", { cx: "15", cy: "9", r: "2", key: "center" }],
]);

export default GermIcon;
