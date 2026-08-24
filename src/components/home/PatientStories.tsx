"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./PatientStories.module.css";

const initialCards = [
  {
    id: "card-1",
    name: "Sunitha Swami",
    condition: "Knee Replacement Surgery",
    image: "/assets/patient_1.png",
    video: "/0_Vertical_Video_Sofa_720x1280.mp4",
    objectPosition: "center",
    captions: [
      "I suffered from knee pain for 5 years.",
      "The team at Narayana Health changed my life.",
      "Now I can walk pain-free every day!",
    ],
  },
  {
    id: "card-2",
    name: "Karthik R",
    condition: "Neurosurgery",
    image: "/patient_omkar.png",
    video: "/4887321_Young_Cute_1280x720.mp4",
    objectPosition: "center",
    captions: [
      "gave my family a second chance at life",
      "The care was exceptional from diagnosis to recovery.",
      "Every step was handled with utmost precision.",
    ],
  },
  {
    id: "card-3",
    name: "Madhuri Sen",
    condition: "Cardio Surgery",
    image: "/assets/patient_in_2.png",
    video: "/0_Vertical_Video_Phone_720x1280.mp4",
    objectPosition: "center",
    captions: [
      "My cardiac surgery recovery went smoothly.",
      "The doctors were world-class and caring.",
      "Thank you Narayana Health for my health!",
    ],
  },
  {
    id: "card-4",
    name: "Priya & Ramesh Kumar",
    condition: "Cardiac Surgery",
    image: "/assets/patient_in_3.png",
    video: "/0_Man_Person_1280x720.mp4",
    objectPosition: "75% center",
    captions: [
      "Finding the right hospital was critical for us.",
      "Narayana Health gave us complete confidence.",
      "Their advanced facilities are truly world-class.",
    ],
  },
  {
    id: "card-5",
    name: "Anita Desai",
    condition: "Liver Transplant",
    image: "/assets/patient_in_4.png",
    video: "/0_Woman_Smiling_1280x720.mp4",
    objectPosition: "center",
    captions: [
      "The transplant team guided us at every step.",
      "Medical excellence and empathy at its best.",
      "I am enjoying life fully with my family.",
    ],
  },
  {
    id: "card-6",
    name: "Mohammed Al-Farsi",
    condition: "Bone Marrow Transplant",
    image: "/assets/patient_in_1.png",
    video: "/0_Woman_Talking_672x1280.mp4",
    objectPosition: "center",
    captions: [
      "I traveled internationally for my care here.",
      "The patient desk made everything seamless.",
      "Narayana Health is truly extraordinary.",
    ],
  },
];

const CARDS_COUNT = initialCards.length;
const CARD_STEP = 572; // 528px card width + 44px gap

/**
 * Word-by-word Karaoke / Ascending Highlight Caption Component
 */
function KaraokeCaption({
  captions,
  isPlaying,
}: {
  captions: string[];
  isPlaying: boolean;
}) {
  const [lineIndex, setLineIndex] = useState(0);
  const [activeWordIndex, setActiveWordIndex] = useState(0);

  const currentSentence = captions[lineIndex] || "";
  const words = currentSentence.split(" ");

  // Word-by-word ascending timer
  useEffect(() => {
    if (!isPlaying) {
      setLineIndex(0);
      setActiveWordIndex(0);
      return;
    }

    const wordInterval = setInterval(() => {
      setActiveWordIndex((prev) => {
        if (prev < words.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 280);

    return () => clearInterval(wordInterval);
  }, [isPlaying, lineIndex, words.length]);

  // Sentence cycle timer
  useEffect(() => {
    if (!isPlaying) return;

    const sentenceDuration = words.length * 280 + 1400;

    const sentenceTimer = setTimeout(() => {
      setLineIndex((prevLine) => (prevLine + 1) % captions.length);
      setActiveWordIndex(0);
    }, sentenceDuration);

    return () => clearTimeout(sentenceTimer);
  }, [isPlaying, lineIndex, words.length, captions.length]);

  if (!isPlaying || !currentSentence) return null;

  return (
    <div className={styles.captionContainer}>
      <div className={styles.captionBox}>
        {words.map((word, wIdx) => {
          const isHighlighted = wIdx <= activeWordIndex;
          return (
            <span
              key={`${lineIndex}-${wIdx}`}
              style={{
                color: isHighlighted ? "#212121" : "#A3A3A3",
                fontWeight: 600,
                transition: "color 0.18s ease-in-out",
                marginRight: wIdx === words.length - 1 ? "0px" : "6px",
                display: "inline-block",
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function StoryCard({
  card,
  cardRealIndex,
  isActive,
  isMuted,
  onToggleMute,
  onMouseEnter,
  onMouseLeave,
}: {
  card: (typeof initialCards)[0];
  cardRealIndex: number;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    if (isActive) {
      vid.muted = isMuted;
      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay policy fallback
        });
      }
    } else {
      vid.pause();
    }
  }, [isActive, isMuted]);

  return (
    <article
      className={styles.card}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Inactive Card Slight Dark Dimming Overlay */}
      <div
        className={`${styles.cardInactiveOverlay} ${
          !isActive ? styles.showOverlay : ""
        }`}
      />

      {/* Top Left Mute/Unmute Button */}
      <button
        type="button"
        className={styles.muteBtn}
        onClick={(e) => {
          e.stopPropagation();
          onToggleMute();
        }}
        aria-label={isMuted ? "Unmute video" : "Mute video"}
      >
        {isMuted ? (
          /* Muted SVG */
          <svg
            width="44"
            height="44"
            viewBox="0 0 44 44"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="44" height="44" rx="22" fill="white" />
            <g clipPath={`url(#clip0_494_7831_${cardRealIndex})`}>
              <path
                d="M11 23.8592V20.1452C11 19.6148 11.2107 19.1061 11.5858 18.731C11.9609 18.3559 12.4696 18.1452 13 18.1452H15.9C16.0955 18.1452 16.2867 18.0878 16.45 17.9802L22.45 14.0242C22.6008 13.9249 22.7756 13.8683 22.9559 13.8603C23.1362 13.8524 23.3154 13.8934 23.4743 13.979C23.6332 14.0646 23.766 14.1916 23.8585 14.3466C23.9511 14.5016 24 14.6787 24 14.8592V29.1452C24 29.3257 23.9511 29.5029 23.8585 29.6578C23.766 29.8128 23.6332 29.9398 23.4743 30.0254C23.3154 30.111 23.1362 30.152 22.9559 30.1441C22.7756 30.1361 22.6008 30.0795 22.45 29.9802L16.45 26.0242C16.2867 25.9166 16.0955 25.8593 15.9 25.8592H13C12.4696 25.8592 11.9609 25.6485 11.5858 25.2734C11.2107 24.8984 11 24.3896 11 23.8592Z"
                stroke="#212121"
                strokeWidth="1.5"
              />
              <path
                d="M32.3262 18.7266C32.4677 18.7266 32.6031 18.7828 32.7031 18.8828C32.803 18.9829 32.8594 19.1184 32.8594 19.2598C32.8592 19.401 32.803 19.5368 32.7031 19.6367L30.748 21.5918L32.7051 23.5488C32.805 23.6489 32.8613 23.7844 32.8613 23.9258C32.8613 24.0671 32.805 24.2027 32.7051 24.3027C32.6051 24.4027 32.4695 24.459 32.3281 24.459C32.1867 24.459 32.0512 24.4027 31.9512 24.3027L29.9941 22.3457L28.041 24.3027C27.9412 24.4025 27.8052 24.4588 27.6641 24.459C27.5226 24.459 27.3852 24.4027 27.2852 24.3027C27.1855 24.2028 27.129 24.067 27.1289 23.9258C27.1289 23.7846 27.1856 23.6488 27.2852 23.5488L29.2402 21.5918L27.2852 19.6367C27.1853 19.5368 27.1291 19.401 27.1289 19.2598C27.1289 19.1183 27.1852 18.9829 27.2852 18.8828C27.3852 18.7828 27.5206 18.7266 27.6621 18.7266C27.8034 18.7267 27.9392 18.7829 28.0391 18.8828L29.9922 20.8359L31.9492 18.8828C32.0492 18.7828 32.1847 18.7266 32.3262 18.7266Z"
                fill="#212121"
              />
            </g>
            <defs>
              <clipPath id={`clip0_494_7831_${cardRealIndex}`}>
                <rect
                  width="24"
                  height="24"
                  fill="white"
                  transform="translate(10 10)"
                />
              </clipPath>
            </defs>
          </svg>
        ) : (
          /* Unmuted SVG */
          <div className={styles.unmutedSvgWrap}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <g clipPath={`url(#clip0_494_7847_${cardRealIndex})`}>
                <path
                  d="M0.996094 13.8592V10.1452C0.996094 9.61478 1.20681 9.10607 1.58188 8.731C1.95695 8.35592 2.46566 8.14521 2.99609 8.14521H5.89609C6.09162 8.14516 6.28283 8.0878 6.44609 7.98021L12.4461 4.02421C12.5968 3.92493 12.7717 3.86831 12.952 3.86035C13.1323 3.85239 13.3114 3.89339 13.4704 3.979C13.6293 4.0646 13.7621 4.19163 13.8546 4.3466C13.9472 4.50157 13.9961 4.6787 13.9961 4.85921V19.1452C13.9961 19.3257 13.9472 19.5029 13.8546 19.6578C13.7621 19.8128 13.6293 19.9398 13.4704 20.0254C13.3114 20.111 13.1323 20.152 12.952 20.1441C12.7717 20.1361 12.5968 20.0795 12.4461 19.9802L6.44609 16.0242C6.28283 15.9166 6.09162 15.8593 5.89609 15.8592H2.99609C2.46566 15.8592 1.95695 15.6485 1.58188 15.2734C1.20681 14.8984 0.996094 14.3896 0.996094 13.8592Z"
                  stroke="#212121"
                  strokeWidth="1.5"
                />
                <path
                  d="M17.5 7.5C17.5 7.5 19 9 19 11.5C19 14 17.5 15.5 17.5 15.5M20.5 4.5C20.5 4.5 23 7 23 11.5C23 16 20.5 18.5 20.5 18.5"
                  stroke="#212121"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
              <defs>
                <clipPath id={`clip0_494_7847_${cardRealIndex}`}>
                  <rect width="24" height="24" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
        )}
      </button>

      {/* Video element */}
      <video
        ref={videoRef}
        src={card.video}
        poster={card.image}
        playsInline
        loop
        muted={isMuted}
        className={styles.cardVideo}
        style={{ objectPosition: card.objectPosition }}
      />

      {/* Bottom Rectangular Overlay Gradient */}
      <div className={styles.bottomOverlay} />

      {/* Ascending Karaoke Word Highlight Captions */}
      <KaraokeCaption captions={card.captions} isPlaying={isActive} />

      {/* Text Info Unit */}
      <div className={styles.textUnit}>
        <h3 className={styles.patientName}>{card.name}</h3>
        <p className={styles.patientSubtext}>{card.condition}</p>
      </div>
    </article>
  );
}

export default function PatientStories() {
  const sectionRef = useRef<HTMLElement>(null);

  // Scroll animation: entry scale (0.782 -> 1.0) & exit scale (1.0 -> 0.90 / 10% shrink when scrolling past)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const rawScale = useTransform(
    scrollYProgress,
    [0, 0.28, 0.65, 1.0],
    [0.782, 1.0, 1.0, 0.90]
  );
  const rawBorderRadius = useTransform(
    scrollYProgress,
    [0, 0.28, 0.65, 1.0],
    [24, 0, 0, 16]
  );

  const scale = useSpring(rawScale, { stiffness: 140, damping: 28, restDelta: 0.001 });
  const borderRadius = useSpring(rawBorderRadius, { stiffness: 180, damping: 26, restDelta: 0.01 });

  // Continuous integer representing the virtual step index (0 at start)
  const [slideIndex, setSlideIndex] = useState(0);
  const [hoveredRealIndex, setHoveredRealIndex] = useState<number | null>(null);

  // Mute state preserved for each of the 6 cards (default muted = true)
  const [mutedStates, setMutedStates] = useState<boolean[]>([
    true,
    true,
    true,
    true,
    true,
    true,
  ]);

  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (realIndex: number) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setHoveredRealIndex(realIndex);
    }, 180);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setHoveredRealIndex(null);
    }, 100);
  };

  const toggleMute = (realIndex: number) => {
    setMutedStates((prev) => {
      const next = [...prev];
      next[realIndex] = !next[realIndex];
      return next;
    });
  };

  // Center card is 2nd card in visible 3-card window (slideIndex + 1)
  const centerRealIndex = (((slideIndex + 1) % CARDS_COUNT) + CARDS_COUNT) % CARDS_COUNT;

  // Active playing card index (hovered card overrides center card; center card is active when no card is hovered)
  const activePlayingRealIndex =
    hoveredRealIndex !== null ? hoveredRealIndex : centerRealIndex;

  // Pre-render virtual relative slots around slideIndex from (slideIndex - 4) to (slideIndex + 5)
  const visibleSlots: Array<{ step: number; realIndex: number; leftPx: number }> = [];
  for (let s = slideIndex - 4; s <= slideIndex + 5; s++) {
    const realIndex = ((s % CARDS_COUNT) + CARDS_COUNT) % CARDS_COUNT;
    const leftPx = 54 + s * CARD_STEP;
    visibleSlots.push({ step: s, realIndex, leftPx });
  }

  return (
    <section ref={sectionRef} className={styles.sectionWrap}>
      <motion.div
        className={`section ${styles.section}`}
        id="patient-stories"
        style={{
          scale,
          borderRadius,
          transformOrigin: "top center",
          willChange: "transform, border-radius",
        }}
      >
        {/* Header Container */}
        <div className={`container ${styles.headerContainer}`}>
          <motion.div
            className={styles.header}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
          >
            <div className={styles.eyebrowWrap}>
              <div
                className={`section-eyebrow ${styles.eyebrowText}`}
                style={{ marginBottom: 0 }}
              >
                PATIENT STORIES
              </div>
              <div className={styles.eyebrowDash} />
            </div>
            <h2 className={`section-title ${styles.sectionTitle}`}>
              Lives Changed, Stories Told
            </h2>
            <p className={styles.sectionSubtitle}>
              Real patients. Real outcomes. Thousands of life-changing stories.
            </p>
          </motion.div>
        </div>

        {/* Carousel Outer Container */}
        <div className={styles.carouselOuter}>
          {/* Sliding Track Viewport */}
          <div className={styles.trackViewport}>
            {/* Edge Fade & Gaussian Blur Overlays restricted strictly to carousel card height (676px) */}
            <div className={styles.edgeOverlayLeft} />
            <div className={styles.edgeOverlayRight} />

            <div
              className={styles.track}
              style={{
                transform: `translateX(calc(-${slideIndex * CARD_STEP}px))`,
              }}
            >
              {visibleSlots.map(({ step, realIndex, leftPx }) => {
                const card = initialCards[realIndex];
                const isActive = activePlayingRealIndex === realIndex;
                const isMuted = mutedStates[realIndex];

                return (
                  <div
                    key={`slot-${step}`}
                    style={{ position: "absolute", left: `${leftPx}px`, top: 0 }}
                  >
                    <StoryCard
                      card={card}
                      cardRealIndex={realIndex}
                      isActive={isActive}
                      isMuted={isMuted}
                      onToggleMute={() => toggleMute(realIndex)}
                      onMouseEnter={() => handleMouseEnter(realIndex)}
                      onMouseLeave={handleMouseLeave}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Glass Navigation Arrows at Bottom Center */}
          <div className={styles.arrowsWrapper}>
            {/* Left Arrow: moves card on right side to center (shifts track left) */}
            <button
              type="button"
              className={styles.arrowBtn}
              onClick={() => setSlideIndex((prev) => prev + 1)}
              aria-label="Move right card to center"
            >
              <ChevronLeft size={24} strokeWidth={2} />
            </button>

            {/* Right Arrow: moves card on left side to center (shifts track right) */}
            <button
              type="button"
              className={styles.arrowBtn}
              onClick={() => setSlideIndex((prev) => prev - 1)}
              aria-label="Move left card to center"
            >
              <ChevronRight size={24} strokeWidth={2} />
            </button>
          </div>

          {/* Secondary Outlined CTA Button */}
          <div className={styles.ctaWrapper}>
            <a href="#view-stories" className={styles.secondaryCtaBtn}>
              View More Stories
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
