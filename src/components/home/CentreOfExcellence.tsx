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

const SPECIALITIES = [
  {
    name: "Cardiology & Cardiac Surgery",
    href: "/specialities/cardiology",
    icon: "/Specialities icons/Cardiology.svg",
    img: "/Advance Heart Care.png",
    stats: { treatments: "1,200+", patients: "15,000+", tools: "18+" }
  },
  {
    name: "Cancer Care",
    href: "/specialities/oncology",
    icon: "/Specialities icons/Cancercare.svg",
    img: "/Oncology Institute.png",
    stats: { treatments: "1,050+", patients: "12,000+", tools: "14+" }
  },
  {
    name: "Neurology & Neurosurgery",
    href: "/specialities/neurology",
    icon: "/Specialities icons/Neurology.svg",
    img: "/Brain and Spine.png",
    stats: { treatments: "890+", patients: "9,500+", tools: "16+" }
  },
  {
    name: "Orthopaedics",
    href: "/specialities/orthopaedics",
    icon: "/Specialities icons/Orthopaedics.svg",
    img: "/Bone & Joint.png",
    stats: { treatments: "2,400+", patients: "22,000+", tools: "12+" }
  },
  {
    name: "Nephrology & Transplant",
    href: "/specialities/nephrology",
    icon: "/Specialities icons/Nephrology.svg",
    img: "/specialities-bg.png",
    stats: { treatments: "450+", patients: "6,800+", tools: "8+" }
  },
  {
    name: "Gastroenterology",
    href: "/specialities/gastroenterology",
    icon: "/Specialities icons/Gastro.svg",
    img: "/Digestive Health.png",
    stats: { treatments: "1,500+", patients: "16,500+", tools: "10+" }
  },
  {
    name: "Paediatrics & Neonatology",
    href: "/specialities/paediatrics",
    icon: "/Specialities icons/Paedratic.svg",
    img: "/doctor_patient.png",
    stats: { treatments: "3,100+", patients: "30,000+", tools: "20+" }
  },
  {
    name: "Obstetrics & Gynaecology",
    href: "/specialities/gynaecology",
    icon: "/Specialities icons/Gynaecology.svg",
    img: "/why-choose-nh-bg.png",
    stats: { treatments: "2,800+", patients: "25,000+", tools: "15+" }
  },
  {
    name: "Ophthalmology",
    href: "/specialities/ophthalmology",
    icon: "/Specialities icons/General Medicine.svg",
    img: "/chairman background.png",
    stats: { treatments: "1,600+", patients: "14,000+", tools: "11+" }
  },
  {
    name: "Urology",
    href: "/specialities/urology",
    icon: "/Specialities icons/Urology.svg",
    img: "/pulse_health_insights_banner.png",
    stats: { treatments: "950+", patients: "8,200+", tools: "9+" }
  },
];

function FlipCard({ spec }: { spec: typeof SPECIALITIES[0] }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <Link 
      href={spec.href} 
      aria-label={spec.name} 
      className={styles.flipCardWrapper}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.flipCardInner}>
        
        {/* Front Side */}
        <div className={styles.flipCardFront}>
          <div className={styles.cardImageContainer}>
            <img 
              src={spec.img} 
              alt={spec.name} 
              className={spec.name.includes("Nephrology") || spec.name.includes("Urology") ? `${styles.cardCoverImg} ${styles.imgContain}` : styles.cardCoverImg} 
            />
            <div className={styles.vignetteOverlay} />
          </div>
          
          <div className={styles.frontContent}>
            <div className={styles.specIconBadge}>
              <img alt={spec.name} src={spec.icon} className={styles.specIconImg} />
            </div>
            <h4 className={styles.frontTitle}>{spec.name}</h4>
          </div>
        </div>

        {/* Back Side */}
        <div className={styles.flipCardBack}>
          <video 
            ref={videoRef}
            src="/Doctor patient.mp4" 
            className={styles.backVideo} 
            muted 
            loop 
            playsInline 
          />
          <div className={styles.videoOverlay} />
          
          <div className={styles.backContent}>
            <h4 className={styles.backTitle}>{spec.name}</h4>
            <div className={styles.statsDivider} />
            <div className={styles.statsList}>
              <div className={styles.statItem}>
                <span className={styles.statVal}>{spec.stats.treatments}</span>
                <span className={styles.statLabel}>Successful Treatments</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statVal}>{spec.stats.patients}</span>
                <span className={styles.statLabel}>Patients Cared For</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statVal}>{spec.stats.tools}</span>
                <span className={styles.statLabel}>Advanced Tools</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </Link>
  );
}

const getCardTransform = (index: number, activeIndex: number, total: number, isMobile: boolean) => {
  let diff = index - activeIndex;
  
  // Wrap around for circular loop
  if (diff < -total / 2) diff += total;
  if (diff > total / 2) diff -= total;
  
  const isFocused = diff === 0;

  if (isMobile) {
    return {
      translateX: isFocused ? 0 : diff > 0 ? 120 : -120,
      scale: isFocused ? 1 : 0.98,
      opacity: isFocused ? 1 : 0,
      zIndex: isFocused ? 10 : 0,
      width: undefined,
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
  let width = 700;

  if (isFocused) {
    translateX = 0;
    opacity = 1;
    zIndex = 10;
    width = 860;
  } else if (isNext) {
    translateX = 880;
    opacity = 0.6;
    zIndex = 6;
    width = 260;
  } else if (isPrev) {
    translateX = -880;
    opacity = 0;
    zIndex = 0;
    width = 260;
  } else {
    translateX = 1400;
    opacity = 0;
    zIndex = 0;
    width = 0;
  }

  return {
    translateX,
    opacity,
    zIndex,
    width,
    isFocused,
    showContent: isFocused || isNext,
    isNext,
    isPrev
  };
};

export default function CentreOfExcellence() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isInView, setIsInView] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [sideContentReady, setSideContentReady] = React.useState(true);
  const isFirstRender = React.useRef(true);

  const moveToIndex = (nextIndex: number) => {
    setSideContentReady(false);
    setActiveIndex(nextIndex);
  };

  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setSideContentReady(false);
  }, [activeIndex]);

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
        <div className={styles.header}>
          <div className="section-eyebrow">CENTRES OF EXCELLENCE</div>
          <h2 className={styles.sectionTitle}>40+ Specialities. World-Class Care.</h2>
          <p className={`section-subtitle ${styles.sectionSubtitle}`}>
            Integrated expertise across tertiary and quaternary care, delivered through one trusted network.
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
              const { translateX, opacity, zIndex, width, isFocused, showContent, isNext, isPrev } = getCardTransform(index, activeIndex, CARDS.length, isMobile);
              const isSideCard = !isFocused && isNext;
              const cardOpacity = opacity;
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
                    opacity: cardOpacity,
                    width: width ?? "100%"
                  }}
                  transition={{
                    type: "tween",
                    duration: 0.78,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  onAnimationComplete={() => {
                    setSideContentReady(true);
                  }}
                  onClick={() => {
                    if (!isFocused) {
                      moveToIndex(index);
                    }
                  }}
                >
                  <div className={`${styles.card} ${isFocused ? styles.cardFocused : ""} ${isSideCard ? styles.cardSide : ""}`}>
                    {/* Left Column: Content — always rendered for CSS transitions */}
                    <motion.div 
                      className={`${styles.cardContent} ${(isNext || isPrev) ? styles.cardContentPreview : ""} ${!showContent || (isSideCard && !sideContentReady) ? styles.cardContentHidden : ""}`}
                      initial={isFocused ? { opacity: 0, y: 14 } : false}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                      <span className={styles.cardCategory}>{card.category}</span>
                      <h3 className={styles.cardTitle}>{card.title}</h3>
                      {isFocused && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
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
                    </motion.div>

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

          <div className={styles.carouselArrows}>
            <button
              type="button"
              className={styles.navBtn}
              onClick={() => moveToIndex((activeIndex - 1 + CARDS.length) % CARDS.length)}
              aria-label="Previous centre"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className={styles.navBtn}
              onClick={() => moveToIndex((activeIndex + 1) % CARDS.length)}
              aria-label="Next centre"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Full width edge-to-edge speciality wall */}
      <div className={styles.specialitiesGridEdgeToEdge}>
        {SPECIALITIES.map((spec) => (
          <FlipCard key={spec.name} spec={spec} />
        ))}
      </div>

      <div className="container">
        <div className={styles.specialitiesCtaWrap}>
          <Link href="/specialities" className={styles.specialitiesCta}>
            View all specialties
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
