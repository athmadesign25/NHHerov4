"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import styles from "./TrustStatsStrip.module.css";

const stats = [
  { id: "stat-patients", value: 2500000, display: "2.5M+", label: "Patients Treated", suffix: "" },
  { id: "stat-international", value: 64000, display: "64K+", label: "International Patients", suffix: "" },
  { id: "stat-nationalities", value: 78, display: "78", label: "Nationalities Served", suffix: "+" },
  { id: "stat-specialities", value: 30, display: "30+", label: "Medical Specialities", suffix: "+" },
  { id: "stat-hospitals", value: 24, display: "24", label: "Hospitals Pan-India", suffix: "+" },
];

function CountUp({ target, display, inView }: { target: number; display: string; inView: boolean }) {
  const [count, setCount] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!inView || startedRef.current) return;
    startedRef.current = true;

    const duration = 2000;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
      else setCount(target);
    };

    requestAnimationFrame(tick);
  }, [inView, target]);

  // For large numbers show abbreviated display value when done
  if (count >= target) return <>{display}</>;

  if (target >= 1000000) {
    return <>{(count / 1000000).toFixed(1)}M+</>;
  }
  if (target >= 1000) {
    return <>{Math.floor(count / 1000)}K+</>;
  }
  return <>{count}+</>;
}

export default function TrustStatsStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section className={styles.section} ref={ref} id="trust-stats">
      <div className={styles.bgShape} />
      <div className="container">
        <div className={styles.inner}>
          {stats.map((stat, i) => (
            <motion.div
              key={stat.id}
              className={styles.statItem}
              id={stat.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <div className={styles.statNumber}>
                <CountUp target={stat.value} display={stat.display} inView={inView} />
              </div>
              <div className={styles.statLabel}>{stat.label}</div>
              {i < stats.length - 1 && <div className={styles.divider} />}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
