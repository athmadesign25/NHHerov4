"use client";

import Image from "next/image";
import { Check, History, LayoutGrid } from "lucide-react";
import HorizontalMediaRail from "@/components/ui/HorizontalMediaRail";
import type { HEALTH_CATEGORIES, HealthCategory } from "../healthCardContent";
import styles from "./HealthListing4.module.css";

const images: Record<Exclude<HealthCategory, "all">, string> = {
  general: "/Health Checkup/Basic health.png",
  women: "/images/packages/package_female.png",
  men: "/Health Checkup/Men's health.png",
  senior: "/Health Checkup/Senior Citizen.png",
  diabetes: "/health-packages/diabetes.png",
  heart: "/health-packages/heart.png",
  thyroid: "/health-packages/thyroid.png",
  vitamins: "/Health Checkup/Master health.png",
  kidney: "/Specialities icons/Nephrology.jpeg",
};

interface Props {
  id: string;
  categories: readonly (typeof HEALTH_CATEGORIES)[number][];
  active: string;
  hasHistory: boolean;
  onChange: (category: string) => void;
}

export default function HealthFocusRail4({ id, categories, active, hasHistory, onChange }: Props) {
  const options = [
    { id: "All", label: "All", image: undefined, Icon: LayoutGrid },
    ...(hasHistory ? [{ id: "booked", label: "Booked before", image: undefined, Icon: History }] : []),
    ...categories.filter(category => category.id !== "all").map(category => ({
      id: category.id, label: category.label, image: images[category.id as Exclude<HealthCategory, "all">], Icon: undefined,
    })),
  ];

  return <section className={styles.focusRail} aria-labelledby={`${id}-heading`}>
    <HorizontalMediaRail id={id} labelledBy={`${id}-heading`} itemLabel="health categories"
      heading={<h2 id={`${id}-heading`}>Explore by health focus</h2>}>
      {options.map(({ id: value, label, image, Icon }) => <button key={value} type="button" className={styles.focusButton}
        aria-pressed={active === value} onClick={() => onChange(active === value ? "All" : value)}>
        <span className={styles.focusImage}>
          {image ? <Image src={image} alt="" fill sizes="96px" draggable={false} /> : Icon && <Icon aria-hidden="true" />}
          {active === value && <span className={styles.focusCheck}><Check aria-hidden="true" /></span>}
        </span>
        <span>{label}</span>
      </button>)}
    </HorizontalMediaRail>
  </section>;
}
