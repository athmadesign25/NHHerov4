"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./CentreOfExcellence.module.css";
import Link from "next/link";
import advanceHeartCareImg from "../../../public/Advance Heart Care.jpg";
import oncologyInstituteImg from "../../../public/Oncology Institute.jpg";
import brainAndSpineImg from "../../../public/Brain and Spine.jpg";
import boneAndJointImg from "../../../public/Bone & Joint.jpg";
import digestiveHealthImg from "../../../public/Digestive Health.png";

const CARDS = [
  {
    id: "card-cardiac",
    category: "Cardiac Science",
    title: "Advanced Heart Care",
    desc: "Comprehensive cardiology services including complex adult and pediatric heart surgeries, heart transplants, and interventional cardiology with cutting-edge technology.",
    img: advanceHeartCareImg,
    link: "/specialities/cardiology",
  },
  {
    id: "card-cancer",
    category: "Cancer Care",
    title: "Oncology Institute",
    desc: "A multidisciplinary approach to cancer treatment offering medical, surgical, and radiation oncology with precise diagnostics and personalized care plans.",
    img: oncologyInstituteImg,
    link: "/specialities/oncology",
  },
  {
    id: "card-neuro",
    category: "Neurosciences",
    title: "Brain & Spine",
    desc: "Advanced treatment for neurological disorders including stroke management, brain tumor surgery, epilepsy treatment, and minimally invasive spine surgeries.",
    img: brainAndSpineImg,
    link: "/specialities/neurology",
  },
  {
    id: "card-ortho",
    category: "Orthopedics",
    title: "Bone & Joint Health",
    desc: "Expert care for musculoskeletal conditions with advanced joint replacements, sports medicine, and comprehensive rehabilitation programs.",
    img: boneAndJointImg,
    link: "/specialities/orthopedics",
  },
  {
    id: "card-gastro",
    category: "Gastro Sciences",
    title: "Digestive Health",
    desc: "Expert care for digestive and liver conditions involving advanced endoscopy, GI surgeries, and liver transplant procedures in highly specialized units.",
    img: digestiveHealthImg,
    link: "/specialities/gastroenterology",
  }
];

const getCardTransform = (index: number, activeIndex: number, total: number, isMobile: boolean) => {
  let diff = index - activeIndex;
  
  // Wrap around for circular loop
  if (diff < -total / 2) diff += total;
  if (diff > total / 2) diff -= total;
  
  const isFocused = diff === 0;

  if (isMobile) {
    return {
      translateX: isFocused ? 0 : diff > 0 ? 80 : -80,
      translateZ: 0,
      rotateY: 0,
      scale: isFocused ? 1 : 0.96,
      opacity: isFocused ? 1 : 0,
      zIndex: isFocused ? 10 : 0,
      width: undefined, // Let CSS handle mobile layout
      isFocused,
      showContent: isFocused,
      isNext: false
    };
  }

  const isNext = diff === 1;
  const isPrev = diff === -1;
  let translateX = 0;
  let opacity = 0;
  let zIndex = 0;
  let width = 900;

  if (isFocused) {
    translateX = -160; // Shift left
    opacity = 1;
    zIndex = 10;
    width = 900;
  } else if (isNext) {
    translateX = 445; // Position preview card to the right of active card
    opacity = 0.85; // Slight preview fade
    zIndex = 5;
    width = 270; // 1/4th relative size preview card
  } else if (isPrev) {
    // Previous card — collapses to 0 width in place while fading out
    translateX = -160;
    opacity = 0;
    zIndex = 4;
    width = 0; // Collapse to nothing
  } else if (diff < -1) {
    translateX = -900;
    opacity = 0;
    zIndex = 0;
    width = 0;
  } else {
    translateX = 900;
    opacity = 0;
    zIndex = 0;
    width = 270;
  }

  return {
    translateX,
    opacity,
    zIndex,
    width,
    isFocused,
    showContent: isFocused || isNext,
    isNext
  };
};

export default function CentreOfExcellence() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isInView, setIsInView] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Autoplay carousel every 5 seconds only when in view
  React.useEffect(() => {
    if (!isInView) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % CARDS.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isInView]);

  const handleDragEnd = (event: any, info: any) => {
    const threshold = 50;
    if (info.offset.x < -threshold) {
      setActiveIndex((prev) => (prev + 1) % CARDS.length);
    } else if (info.offset.x > threshold) {
      setActiveIndex((prev) => (prev - 1 + CARDS.length) % CARDS.length);
    }
  };

  return (
    <section ref={sectionRef} className={styles.section} id="centre-of-excellence">
      <div className="container">
        {/* Section Header */}
        <div className={styles.header}>
          <div className="section-eyebrow" style={{ color: "var(--color-primary, #034EA2)" }}>CENTRES OF EXCELLENCE</div>
          <h2 className={styles.sectionTitle}>World-Class Clinical Specialties</h2>
          <p className={styles.sectionSubtitle}>
            Experience clinical excellence through our specialized institutes, equipped with the latest medical advancements and led by global experts.
          </p>
        </div>

        {/* Carousel */}
        <div className={styles.carouselWrapper}>
          <motion.div 
            className={styles.carousel} 
            role="group" 
            aria-label="Centres of Excellence Carousel"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            style={{ cursor: "grab" }}
            whileTap={{ cursor: "grabbing" }}
          >
            {CARDS.map((card, index) => {
              const { translateX, opacity, zIndex, width, isFocused, showContent, isNext } = getCardTransform(index, activeIndex, CARDS.length, isMobile);
              return (
                <motion.div 
                  key={card.id}
                  className={styles.slide}
                  style={{ 
                    zIndex, 
                    position: "absolute",
                    cursor: isFocused ? "grab" : "pointer"
                  }}
                  animate={{
                    x: translateX,
                    opacity: opacity,
                    width: width ?? "100%"
                  }}
                  transition={{
                    type: "tween",
                    duration: 0.7,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                  onClick={() => {
                    if (!isFocused) {
                      setActiveIndex(index);
                    }
                  }}
                >
                  <div className={`${styles.card} ${isFocused ? styles.cardFocused : ""}`}>
                    {/* Left Column: Content — always rendered for CSS transitions */}
                    <div 
                      className={`${styles.cardContent} ${isNext ? styles.cardContentPreview : ""} ${!showContent ? styles.cardContentHidden : ""}`}
                    >
                      <span className={styles.cardCategory}>{card.category}</span>
                      <h3 className={styles.cardTitle}>{card.title}</h3>
                      {isFocused && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                        >
                          <p className={styles.cardDesc}>{card.desc}</p>
                          <div>
                            {/* Prevent drag gesture from interrupting link clicking */}
                            <Link href={card.link} className={styles.cardCta} onPointerDown={(e) => e.stopPropagation()}>
                              Know more
                              <ChevronRight size={16} />
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Right Column: Image */}
                    <div className={styles.cardImgWrap}>
                      <Image
                        src={card.img}
                        alt={card.title}
                        fill
                        priority={index === 0}
                        className={styles.cardImg}
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      <div className={styles.cardOverlay} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
  
          {/* Indicator Dots */}
          <div className={styles.dotsContainer}>
            {CARDS.map((_, index) => (
              <button
                key={index}
                className={`${styles.dot} ${activeIndex === index ? styles.activeDot : ""}`}
                onClick={() => {
                  setActiveIndex(index);
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
