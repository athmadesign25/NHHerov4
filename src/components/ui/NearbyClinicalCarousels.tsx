"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight, Eye, EyeOff } from "lucide-react";
import { HospitalCard } from "@/components/ui/HospitalCarousel";
import carouselStyles from "@/components/ui/HospitalCarousel.module.css";
import { HospitalItem } from "@/data/hospitalsData";
import styles from "./NearbyClinicalCarousels.module.css";

export interface SpecialistCarouselItem {
  name: string;
  designation?: string;
  speciality?: string;
  experience: string;
  hospital: string;
  image: string;
}

export interface NearbySpecialistsCarouselProps {
  id?: string;
  title?: string;
  subtitle?: string;
  doctors: SpecialistCarouselItem[];
  specialityFilter?: string;
  actionLabel?: string;
  defaultVisible?: boolean;
}

export function NearbySpecialistsCarousel({
  id = "specialists",
  title = "Consult Senior Specialists",
  subtitle = "Our senior surgeons and clinical specialists bring decades of experience, board certifications, and high procedural success rates.",
  doctors,
  specialityFilter = "",
  actionLabel = "Book",
  defaultVisible = true,
}: NearbySpecialistsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(defaultVisible);

  const handleScroll = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    const scrollAmount = Math.max(track.clientWidth * 0.68, 280);
    track.scrollBy({ left: direction * scrollAmount, behavior: "smooth" });
  };

  if (!isVisible) {
    return (
      <section id={id} className={styles.carouselSection}>
        <div className={styles.collapsedNoticeBar}>
          <span>Nearby Specialists section hidden (Stakeholder review toggle)</span>
          <button
            type="button"
            className={styles.stakeholderToggleBtn}
            onClick={() => setIsVisible(true)}
          >
            <Eye size={13} />
            <span>Show Doctors Section</span>
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id={id} className={styles.carouselSection}>
      <div className={styles.headerRow}>
        <div className={styles.headerTextCol}>
          <h2 className={styles.sectionTitle}>{title}</h2>
          <p className={styles.sectionSubtitle}>{subtitle}</p>
        </div>

        <div className={styles.controlsCol}>
          <button
            type="button"
            className={styles.stakeholderToggleBtn}
            onClick={() => setIsVisible(false)}
            title="Toggle Doctors Section visibility for stakeholder review"
          >
            <EyeOff size={13} />
            <span>Hide Section</span>
          </button>

          <div className={styles.arrowsGroup}>
            <button
              type="button"
              className={styles.navArrowBtn}
              onClick={() => handleScroll(-1)}
              aria-label="Previous specialists"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className={styles.navArrowBtn}
              onClick={() => handleScroll(1)}
              aria-label="Next specialists"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <div ref={trackRef} className={styles.carouselTrack}>
        {doctors.map((doc, idx) => (
          <div key={`${doc.name}-${idx}`} className={styles.carouselSlide}>
            <div className={styles.doctorCard}>
              <Image
                src={doc.image || "/doctors/doc_vivek.jpg"}
                alt={doc.name}
                fill
                sizes="(max-width: 640px) 80vw, 300px"
                className={styles.doctorImage}
              />
              <div className={styles.doctorSoftScrim} />
              <div className={styles.doctorOverlayContent}>
                <div className={styles.doctorBottomFlex}>
                  <div className={styles.doctorTextCol}>
                    <h3 className={styles.doctorName} title={doc.name}>
                      {doc.name}
                    </h3>
                    <div className={styles.doctorSpec}>
                      {doc.speciality || doc.designation || specialityFilter}
                    </div>
                    <div className={styles.doctorExp}>{doc.experience}</div>
                    <div className={styles.doctorHosp} title={doc.hospital}>
                      {doc.hospital}
                    </div>
                  </div>

                  <Link
                    href={
                      specialityFilter
                        ? `/doctors?speciality=${encodeURIComponent(specialityFilter)}`
                        : `/doctors?search=${encodeURIComponent(doc.name)}`
                    }
                    className={styles.bookBtn}
                  >
                    {actionLabel}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footerLinkRow}>
        <Link
          href={
            specialityFilter
              ? `/doctors?speciality=${encodeURIComponent(specialityFilter)}`
              : "/doctors"
          }
          className={styles.viewAllTextLink}
        >
          <span>View All Doctors</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}

export interface NearbyCareCentresCarouselProps {
  id?: string;
  title?: string;
  subtitle?: string;
  hospitals: HospitalItem[];
}

export function NearbyCareCentresCarousel({
  id = "hospitals",
  title = "Nearby Care Centres & Hospitals",
  subtitle = "Explore our multiple tertiary hospitals and specialized clinics across Bangalore and the Narayana Health network.",
  hospitals,
}: NearbyCareCentresCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    const scrollAmount = Math.max(track.clientWidth * 0.68, 280);
    track.scrollBy({ left: direction * scrollAmount, behavior: "smooth" });
  };

  return (
    <section id={id} className={styles.carouselSection}>
      <div className={styles.headerRow}>
        <div className={styles.headerTextCol}>
          <h2 className={styles.sectionTitle}>{title}</h2>
          <p className={styles.sectionSubtitle}>{subtitle}</p>
        </div>

        <div className={styles.controlsCol}>
          <span className={styles.unitCountBadge}>
            {hospitals.length} Units Available
          </span>
          <div className={styles.arrowsGroup}>
            <button
              type="button"
              className={styles.navArrowBtn}
              onClick={() => handleScroll(-1)}
              aria-label="Previous care centres"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className={styles.navArrowBtn}
              onClick={() => handleScroll(1)}
              aria-label="Next care centres"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <div ref={trackRef} className={styles.carouselTrack}>
        {hospitals.map((hosp, idx) => (
          <div key={hosp.id || idx} className={styles.carouselSlide}>
            <HospitalCard
              hosp={hosp}
              cardIndex={idx}
              isLight
              className={carouselStyles.cardCompact}
            />
          </div>
        ))}
      </div>

      <div className={styles.footerLinkRow}>
        <Link href="/hospitals/narayana-health-city-bangalore" className={styles.viewAllTextLink}>
          <span>Explore All Care Centres</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}
