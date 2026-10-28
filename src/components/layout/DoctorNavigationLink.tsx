"use client";

import { Suspense, type ComponentProps } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { design17DoctorNavigationHref } from "@/features/search/design17Navigation";

type Props = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

function ContextualLink({ href, ...props }: Props) {
  const pathname = usePathname();
  const params = useSearchParams();
  return <Link {...props} href={design17DoctorNavigationHref(href, pathname, new URLSearchParams(params.toString()))} />;
}

/** Isolate query-dependent navigation so the rest of the navbar stays prerendered. */
export default function DoctorNavigationLink(props: Props) {
  return <Suspense fallback={<Link {...props} />}><ContextualLink {...props} /></Suspense>;
}
