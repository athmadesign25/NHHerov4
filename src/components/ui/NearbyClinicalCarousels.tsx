"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HospitalCard } from "@/components/ui/HospitalCarousel";
import carouselStyles from "@/components/ui/HospitalCarousel.module.css";
import { HospitalItem } from "@/data/hospitalsData";
import { useCarouselPeekHint } from "@/lib/useCarouselPeekHint";
import styles from "./NearbyClinicalCarousels.module.css";

function useCarouselShowingCount(total: number, trackRef: React.RefObject<HTMLDivElement | null>) {
  const [shownCount, setShownCount] = useState(() => Math.min(3, total));

  const syncVisibleCount = useCallback(() => {
    const track = trackRef.current;
    if (!track || total === 0) {
      setShownCount(0);
      return;
    }
    const slides = track.children;
    if (!slides || slides.length === 0) return;
    const firstSlide = slides[0] as HTMLElement;
    const step = firstSlide.offsetWidth + 18;
    const visibleSlots = Math.max(1, Math.floor((track.clientWidth + 18) / Math.max(step, 1)));
    const scrolledSlides = step > 0 ? Math.round(track.scrollLeft / step) : 0;
    const nextShown = Math.min(total, Math.max(visibleSlots, scrolledSlides + visibleSlots));
    setShownCount(nextShown);
  }, [total, trackRef]);

  useEffect(() => {
    syncVisibleCount();
    window.addEventListener("resize", syncVisibleCount, { passive: true });
    return () => window.removeEventListener("resize", syncVisibleCount);
  }, [syncVisibleCount]);

  return { shownCount, syncVisibleCount };
}

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
}: NearbySpecialistsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const { shownCount, syncVisibleCount } = useCarouselShowingCount(doctors.length, trackRef);
  useCarouselPeekHint(trackRef, doctors.length);

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
          {doctors.length > 0 && (
            <span className={styles.resultsCountText}>
              Showing <strong>{shownCount}</strong> of <strong>{doctors.length}</strong>
            </span>
          )}

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

      <div ref={trackRef} className={styles.carouselTrack} onScroll={syncVisibleCount}>
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
  const { shownCount, syncVisibleCount } = useCarouselShowingCount(hospitals.length, trackRef);
  useCarouselPeekHint(trackRef, hospitals.length);

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
          {hospitals.length > 0 && (
            <span className={styles.resultsCountText}>
              Showing <strong>{shownCount}</strong> of <strong>{hospitals.length}</strong>
            </span>
          )}
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

      <div ref={trackRef} className={styles.carouselTrack} onScroll={syncVisibleCount}>
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
        </Link>
      </div>
    </section>
  );
}
