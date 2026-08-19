import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  theme?: "light" | "dark";
}

export default function Breadcrumbs({ items, theme = "dark" }: BreadcrumbsProps) {
  const isDark = theme === "dark";
  const inactiveColor = isDark ? "rgba(255, 255, 255, 0.7)" : "var(--color-text-secondary)";
  const activeColor = isDark ? "#ffffff" : "var(--color-text)";
  const arrowColor = isDark ? "rgba(255, 255, 255, 0.4)" : "var(--color-border)";

  return (
    <nav aria-label="Breadcrumb" style={{ marginBottom: 16 }}>
      <ol style={{ display: "flex", alignItems: "center", listStyle: "none", padding: 0, margin: 0, gap: 8 }}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={index} style={{ display: "flex", alignItems: "center", fontSize: 13, fontWeight: 500 }}>
              {item.href && !isLast ? (
                <Link 
                  href={item.href} 
                  style={{ color: inactiveColor, textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = activeColor}
                  onMouseLeave={(e) => e.currentTarget.style.color = inactiveColor}
                >
                  {item.label}
                </Link>
              ) : (
                <span style={{ color: activeColor }}>
                  {item.label}
                </span>
              )}
              
              {!isLast && (
                <ChevronRight size={14} style={{ marginLeft: 8, color: arrowColor }} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
