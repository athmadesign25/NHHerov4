"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import type { DoctorProfilePreviewContent } from "@/features/search/doctorProfilePreview";
import { duration, ease } from "@/lib/motion";
import ProfileSampleLabel from "./ProfileSampleLabel";
import styles from "./DoctorProfileDesign2.module.css";
import blogStyles from "./DoctorProfileBlogs2.module.css";

const PREVIEW_COUNT = 3;
type BlogArticle = DoctorProfilePreviewContent["articles"][number];

function BlogPreview({ article, embedded }: { article: BlogArticle; embedded: boolean }) {
  const [failed, setFailed] = useState(false);
  const Heading = embedded ? "h4" : "h3";
  return <>
    {article.thumbnail && !failed && <span className={blogStyles.thumbnail}>
      <Image src={article.thumbnail} alt="" fill
        sizes="(min-width: 1340px) 392px, (min-width: 1024px) calc((100vw - 144px) / 3), (min-width: 768px) calc((100vw - 88px) / 2), 96px"
        loading="lazy" onError={() => setFailed(true)} />
    </span>}
    <div className={blogStyles.copy}>
      <Heading className={blogStyles.titleRow}>
        <span className={blogStyles.title}>{article.title}</span>
        {article.url && <ArrowUpRight className={blogStyles.arrow} size={16} aria-hidden />}
      </Heading>
      {(article.author || article.date || article.category) && <span className={blogStyles.metadata}>
        {article.author && <span>By {article.author}</span>}
        {article.date && <span>{article.date}</span>}
        {article.category && <span>{article.category}</span>}
      </span>}
    </div>
  </>;
}

export default function DoctorProfileBlogs2({ content, embedded = false }: { content: DoctorProfilePreviewContent; embedded?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const reducedMotion = useReducedMotion();
  const { articles, sampleFields } = content;
  if (!articles.length) return null;

  const visibleArticles = expanded ? articles : articles.slice(0, PREVIEW_COUNT);
  const transition = { duration: reducedMotion ? 0 : duration.moderate, ease: ease.out };

  const Heading = embedded ? "h3" : "h2";
  return <motion.section id="profile-blogs" className={`${styles.chapter} ${blogStyles.section} ${embedded ? blogStyles.embedded : ""}`}
    aria-labelledby="profile-blogs-heading" layout={!reducedMotion} transition={transition}>
    <motion.header className={`${styles.chapterHeading} ${blogStyles.header}`}
      layout={reducedMotion ? false : "position"} transition={transition}>
      <div>
        <Heading id="profile-blogs-heading">Articles<ProfileSampleLabel show={sampleFields.includes("articles")} /></Heading>
      </div>
      {articles.length > PREVIEW_COUNT && <button type="button" className={blogStyles.toggle}
        aria-expanded={expanded} aria-controls="profile-blogs-list" onClick={() => setExpanded(value => !value)}>
        <span>{expanded ? "Show fewer blogs" : `View all ${articles.length} blogs`}</span>
        <ChevronDown size={16} aria-hidden />
      </button>}
    </motion.header>
    <motion.ul id="profile-blogs-list" className={blogStyles.list} layout={!reducedMotion} transition={transition}>
      <AnimatePresence initial={false} mode="popLayout">
        {visibleArticles.map(article => <motion.li key={article.url || article.title}
          layout={reducedMotion ? false : "position"}
          initial={reducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={transition}>
          {article.url ? <a className={blogStyles.entry} data-has-thumbnail={Boolean(article.thumbnail)}
            href={article.url} target="_blank" rel="noopener noreferrer">
            <BlogPreview article={article} embedded={embedded} />
            <span className={styles.srOnly}> (opens in a new tab)</span>
          </a> : <div className={blogStyles.entry} data-has-thumbnail={Boolean(article.thumbnail)}>
            <BlogPreview article={article} embedded={embedded} />
          </div>}
        </motion.li>)}
      </AnimatePresence>
    </motion.ul>
  </motion.section>;
}
