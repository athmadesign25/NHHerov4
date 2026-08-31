import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import styles from '@/components/home/HeroSearchFirst.module.css';

export const STAT_GROUPS = [
  [
    { value: 5000, suffix: "+", label: "Robotic Surgeries\nPerformed" },
    { value: 550000, suffix: "+", label: "Cardiac Consults\nAnnually" },
    { value: 33000, suffix: "+", label: "Image Guided\nProcedures" },
    { value: 8000, suffix: "+", label: "Solid Organ\nTransplants" }
  ],
  [
    { value: 80000, suffix: "+", label: "Chemotherapy Sessions\nAnnually" },
    { value: 15000, suffix: "+", label: "Joint Replacements\nPerformed" },
    { value: 2000, suffix: "+", label: "Bone Marrow\nTransplants" },
    { value: 120000, suffix: "+", label: "Dialysis Sessions\nAnnually" }
  ]
];

function CountingNumber({ value, suffix = "", duration = 2 }: { value: number, suffix?: string, duration?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    const num = Math.round(latest);
    if (num >= 100000) {
      return (num / 100000).toLocaleString('en-IN', { maximumFractionDigits: 1 }) + 'L' + suffix;
    } else if (num >= 1000) {
      return (num / 1000).toLocaleString('en-IN', { maximumFractionDigits: 1 }) + 'K' + suffix;
    }
    return num.toLocaleString('en-IN') + suffix;
  });

  useEffect(() => {
    if (isInView) {
      const animation = animate(count, value, { duration, ease: "easeOut" });
      return animation.stop;
    }
  }, [isInView, value, count, duration]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

interface StatCarouselProps {
  isOpen: boolean;
}

export default function StatCarousel({ isOpen }: StatCarouselProps) {
  const [currentStatGroup, setCurrentStatGroup] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStatGroup(prev => (prev + 1) % STAT_GROUPS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
      animate={isOpen ? { opacity: 0, y: 20, filter: "blur(8px)", pointerEvents: "none" } : { opacity: 1, y: 0, filter: "blur(0px)", pointerEvents: "auto" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={styles.metricsRow}
    >
      {STAT_GROUPS[currentStatGroup].map((stat, i) => (
        <div className={styles.metricItem} key={i}>
          <AnimatePresence mode="wait">
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25, delay: i * 0.05, ease: "easeOut" }}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <div className={styles.metricValue}>
                <CountingNumber value={stat.value} suffix={stat.suffix} />
              </div>
              <div className={styles.metricLabel}>
                {stat.label.split('\n').map((line, idx) => (
                  <React.Fragment key={idx}>
                    {line}
                    {idx !== stat.label.split('\n').length - 1 && <br/>}
                  </React.Fragment>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      ))}
    </motion.div>
  );
}
