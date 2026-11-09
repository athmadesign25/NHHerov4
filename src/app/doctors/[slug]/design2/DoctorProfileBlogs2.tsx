"use client";

import BlogArticleCard from "@/components/blog/BlogArticleCard";
import HorizontalMediaRail from "@/components/ui/HorizontalMediaRail";
import type { DoctorProfilePreviewContent } from "@/features/search/doctorProfilePreview";
import ProfileSampleLabel from "./ProfileSampleLabel";
import styles from "./DoctorProfileDesign2.module.css";
import blogStyles from "./DoctorProfileBlogs2.module.css";

export default function DoctorProfileBlogs2({ content, embedded = false }: { content: DoctorProfilePreviewContent; embedded?: boolean }) {
  const { articles, sampleFields } = content;
  if (!articles.length) return null;
  const Heading = embedded ? "h3" : "h2";
  return <section id="profile-blogs" className={`${styles.chapter} ${blogStyles.section} ${embedded ? blogStyles.embedded : ""}`}
    aria-labelledby="profile-blogs-heading">
    <HorizontalMediaRail id="profile-blogs-list" labelledBy="profile-blogs-heading" itemLabel="articles"
      heading={<div className={`${styles.chapterHeading} ${blogStyles.header}`}>
        <Heading id="profile-blogs-heading">Articles<ProfileSampleLabel show={sampleFields.includes("articles")} /></Heading>
      </div>}>
      {articles.map(article => <BlogArticleCard
        key={article.url || article.title}
        title={article.title}
        href={article.url || undefined}
        image={article.thumbnail}
        category={article.category}
        date={article.date}
        author={article.author}
        headingLevel={embedded ? "h4" : "h3"}
        external
        landscape
        sizes="(min-width: 1280px) 530px, (min-width: 768px) calc((100vw - 88px) / 2.25), 80vw"
      />)}
    </HorizontalMediaRail>
  </section>;
}
