"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX, Quote } from "lucide-react";
import styles from "./PatientStories.module.css";
import TextSweepEffect from "@/components/ui/TextSweepEffect";

const initialCards = [
  {
    id: "card-1",
    name: "Sunitha Swami",
    condition: "Knee Replacement Surgery",
    overview: "Exceptional cardiac care and seamless recovery guidance from the expert doctors.",
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
    overview: "The compassionate care and precision treatment gave our family a second chance at life.",
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
    overview: "World-class healthcare facility with a dedicated and caring surgical team.",
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
    overview: "Finding the right hospital was critical for us, and Narayana Health gave us full confidence.",
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
    overview: "Medical excellence and empathy at its best throughout our transplant journey.",
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
    overview: "International patient care desk made our medical travel and treatment completely seamless.",
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
    <motion.div
      className={styles.captionContainer}
      initial={{ opacity: 0, filter: "blur(14px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
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
    </motion.div>
  );
}

function StoryCard({
  card,
  cardRealIndex,
  isActive,
  isHovered,
  isMuted,
  onToggleMute,
  onMouseEnter,
  onMouseLeave,
}: {
  card: (typeof initialCards)[0];
  cardRealIndex: number;
  isActive: boolean;
  isHovered: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showShimmer, setShowShimmer] = useState(false);

  // A card becoming active by default (centered, on entering the section)
  // doesn't jump straight to its video — it keeps showing the overview like
  // any other card for a few seconds first. A card becoming active because
  // it's hovered skips that delay entirely and plays right away, since a
  // hover is a deliberate request for that card's attention, not a passive
  // scroll-by. If it stops being active before the delay is up, the timer
  // is cancelled and it never shows the video at all.
  const [showVideo, setShowVideo] = useState(false);
  useEffect(() => {
    if (!isActive) {
      setShowVideo(false);
      return;
    }
    if (isHovered) {
      setShowVideo(true);
      return;
    }
    const timer = setTimeout(() => setShowVideo(true), 3500);
    return () => clearTimeout(timer);
  }, [isActive, isHovered]);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    if (showVideo) {
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
  }, [showVideo, isMuted]);

  // Shimmer sweep bridges the overview-blur-out -> caption-blur-in handoff
  useEffect(() => {
    if (!showVideo) return;
    setShowShimmer(true);
    const timer = setTimeout(() => setShowShimmer(false), 700);
    return () => clearTimeout(timer);
  }, [showVideo]);

  return (
    <article
      className={styles.card}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
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

      {/* Video element — no poster: the inactive/static state is the video's
          own paused first frame acting as its thumbnail, not a separate
          static image asset. */}
      <video
        ref={videoRef}
        src={card.video}
        playsInline
        loop
        muted={isMuted}
        preload="metadata"
        className={styles.cardVideo}
        style={{ objectPosition: card.objectPosition }}
      />

      {/* Bottom Rectangular Overlay Gradient */}
      <div className={styles.bottomOverlay} />

      {/* Dark wash behind the overview unit — same reach/intensity as
          bottomOverlay, just inverted vertically, since the overview no
          longer has its own glass panel to lean on for contrast. */}
      <div className={styles.topOverlay} />

      {/* Shimmer sweep: bridges the overview-card blur-out and caption blur-in */}
      {showShimmer && <div className={styles.cardShimmerSweep} />}

      {/* Ascending Karaoke Word Highlight Captions (only once the video has
          actually started, matching the delayed handoff below) */}
      <KaraokeCaption captions={card.captions} isPlaying={showVideo} />

      {/* Overview unit: bare text/icon (no glass panel), top-aligned with
          the mute button, left-aligned with the bottom text unit. Shows
          until the video actually starts (including through the delay on a
          freshly-active card), not just while inactive. */}
      <AnimatePresence>
        {!showVideo && (
          <motion.div
            className={styles.overviewBoxTop}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6, filter: "blur(14px)" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <svg
              width="30"
              height="26"
              viewBox="0 0 30 27"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={styles.overviewQuoteIcon}
            >
              <path
                d="M7.31369 0C5.58723 0.0106787 4.0236 0.495302 2.67403 1.60267C1.17249 2.81709 0.221802 4.58402 0.0362537 6.50626C-0.0142404 7.03065 0.00121999 7.53165 0.0101591 8.05725C0.0901284 12.699 0.667793 17.8595 3.71097 21.5785C6.38016 24.8406 10.384 26.138 14.4281 26.5074C14.4007 25.8493 14.4224 25.0462 14.4226 24.378C14.4274 23.6362 14.4259 22.8945 14.418 22.1531C14.0601 22.0497 13.441 21.9895 13.052 21.9204C8.61229 21.1316 6.1417 18.575 5.21855 14.1507C5.86676 14.2707 6.37387 14.4268 7.05422 14.4387C10.9524 14.5067 14.3481 11.3845 14.4269 7.42204C14.4805 5.49502 13.7659 3.62572 12.4403 2.22602C11.1049 0.818198 9.25397 0.0145443 7.31369 0Z"
                fill={`url(#patientCardQuoteA_${cardRealIndex})`}
                fillOpacity="0.55"
              />
              <path
                d="M22.9383 0C21.2436 0.00401054 19.8262 0.424514 18.4499 1.45083C16.9874 2.5414 15.9458 4.26507 15.676 6.07164C15.5266 7.07194 15.5855 8.18196 15.6238 9.19499C15.7794 13.3111 16.4365 17.7993 18.9744 21.176C21.0819 23.9802 24.1714 25.4791 27.5469 26.1676C28.4029 26.3423 29.1633 26.4037 30.0059 26.5216C29.9648 25.9881 29.9932 25.0778 29.993 24.5168C29.9976 23.7258 29.9966 22.9348 29.99 22.1441C29.6032 22.0556 29.0897 22.0119 28.6799 21.9295C27.2612 21.6439 25.9801 21.2598 24.7489 20.4857C22.3601 18.9842 21.4334 16.7765 20.8015 14.1555C21.2119 14.2319 21.5891 14.3327 22.0075 14.3814C26.1367 14.8615 29.9245 11.6192 30.0055 7.40343C30.0557 5.42252 29.3005 3.50591 27.9124 2.09176C26.6492 0.798895 24.7415 0.0183615 22.9383 0Z"
                fill={`url(#patientCardQuoteB_${cardRealIndex})`}
                fillOpacity="0.55"
              />
              <defs>
                <linearGradient id={`patientCardQuoteA_${cardRealIndex}`} x1="7.21521" y1="0" x2="7.21521" y2="26.5074" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ADD6FF" />
                  <stop offset="1" stopColor="#8FB4D9" />
                </linearGradient>
                <linearGradient id={`patientCardQuoteB_${cardRealIndex}`} x1="22.7936" y1="0" x2="22.7936" y2="26.5216" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ADD6FF" />
                  <stop offset="1" stopColor="#8FB4D9" />
                </linearGradient>
              </defs>
            </svg>
            <p className={styles.overviewText}>{card.overview}</p>
          </motion.div>
        )}
      </AnimatePresence>

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

  const [centerIndex, setCenterIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [hoveredRealIndex, setHoveredRealIndex] = useState<number | null>(null);

  const [mutedStates, setMutedStates] = useState<boolean[]>([
    true, true, true, true, true, true,
  ]);

  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (realIndex: number) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setHoveredRealIndex(realIndex);
    }, 1000);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setHoveredRealIndex(null);
    }, 120);
  };

  const toggleMute = (realIndex: number) => {
    setMutedStates((prev) => {
      const next = [...prev];
      next[realIndex] = !next[realIndex];
      return next;
    });
  };

  const goNext = () => {
    setDirection(1);
    setCenterIndex((prev) => (prev + 1) % CARDS_COUNT);
  };
  const goPrev = () => {
    setDirection(-1);
    setCenterIndex((prev) => (prev - 1 + CARDS_COUNT) % CARDS_COUNT);
  };

  const NUM_SLOTS = 5;
  const slots = Array.from({ length: NUM_SLOTS }, (_, slotPos) => {
    const offset = slotPos - 2;
    const realIndex = ((centerIndex + offset) % CARDS_COUNT + CARDS_COUNT) % CARDS_COUNT;
    return { slotPos, realIndex };
  });

  return (
    <section ref={sectionRef} className={styles.sectionWrap} data-nav-theme="dark">
      <div className={styles.section} id="patient-stories">
        {/* Header Container */}
        <div className={`container ${styles.headerContainer}`}>
          <div id="patient-stories-title-unit" className={styles.header}>
            <motion.div
              className={styles.eyebrowWrap}
              initial={{ opacity: 0, filter: "blur(14px)", y: 18 }}
              whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.0 }}
            >
              <div
                className={`section-eyebrow ${styles.eyebrowText}`}
                style={{ marginBottom: 0 }}
              >
                PATIENT STORIES
              </div>
              <div className={styles.eyebrowDash} />
            </motion.div>

            <h2 className={`section-title ${styles.sectionTitle}`}>
              <TextSweepEffect words={["Lives Changed, Stories Told"]} sweepMs={1200} finalColor="#FFFFFF" />
            </h2>

            <motion.p
              className={styles.sectionSubtitle}
              initial={{ opacity: 0, filter: "blur(16px)", y: -24 }}
              whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.45 }}
            >
              Real patients. Real outcomes. Thousands of life-changing stories.
            </motion.p>
          </div>
        </div>

        {/* Carousel Outer Container */}
        <motion.div
          className={styles.carouselOuter}
          initial={{ opacity: 0, filter: "blur(20px)" }}
          whileInView={{ opacity: 1, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1], delay: 0.68 }}
        >
          {/* Sliding Track Viewport */}
          <div className={styles.trackViewport}>
            <div className={styles.track}>
              {slots.map(({ slotPos, realIndex }) => {
                const card = initialCards[realIndex];
                const isCenterSlot = slotPos === 2;
                const isActive =
                  hoveredRealIndex !== null
                    ? realIndex === hoveredRealIndex
                    : isCenterSlot;
                const isHovered = realIndex === hoveredRealIndex;
                const isMuted = mutedStates[realIndex];
                const slideOffsetEnter = direction * 48;
                const slideOffsetExit = direction * -48;

                return (
                  <div
                    key={`slot-${slotPos}`}
                    style={{
                      position: "absolute",
                      left: `${slotPos * CARD_STEP}px`,
                      top: 0,
                    }}
                  >
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.div
                        key={`card-${realIndex}`}
                        initial={{
                          opacity: 0,
                          filter: "blur(8px)",
                          x: slideOffsetEnter,
                          scale: 0.97,
                        }}
                        animate={{
                          opacity: 1,
                          filter: "blur(0px)",
                          x: 0,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                          filter: "blur(8px)",
                          x: slideOffsetExit,
                          scale: 0.97,
                        }}
                        transition={{
                          duration: 0.55,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        <StoryCard
                          card={card}
                          cardRealIndex={realIndex}
                          isActive={isActive}
                          isHovered={isHovered}
                          isMuted={isMuted}
                          onToggleMute={() => toggleMute(realIndex)}
                          onMouseEnter={() => handleMouseEnter(realIndex)}
                          onMouseLeave={handleMouseLeave}
                        />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dark edge fades — same solid color as the section's own
              background, so the carousel's outer edges blend seamlessly into
              it on both sides — with the nav arrows sitting on top of them,
              symmetric and edge-hugging on both sides. */}
          <div className={`${styles.edgeFade} ${styles.edgeFadeLeft}`} aria-hidden />
          <div className={`${styles.edgeFade} ${styles.edgeFadeRight}`} aria-hidden />

          <button
            type="button"
            className={`${styles.arrowBtn} ${styles.arrowBtnLeft}`}
            onClick={goPrev}
            aria-label="Previous story"
          >
            <ChevronLeft size={22} strokeWidth={2} />
          </button>

          <button
            type="button"
            className={`${styles.arrowBtn} ${styles.arrowBtnRight}`}
            onClick={goNext}
            aria-label="Next story"
          >
            <ChevronRight size={22} strokeWidth={2} />
          </button>

          {/* Secondary Outlined CTA Button */}
          <div className={styles.ctaWrapper}>
            <a href="#view-stories" className={styles.secondaryCtaBtn}>
              View More Stories
            </a>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
