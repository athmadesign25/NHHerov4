import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
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
                  style={{ color: "rgba(255, 255, 255, 0.7)", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#ffffff"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)"}
                >
                  {item.label}
                </Link>
              ) : (
                <span style={{ color: "#ffffff" }}>
                  {item.label}
                </span>
              )}
              
              {!isLast && (
                <ChevronRight size={14} style={{ marginLeft: 8, color: "rgba(255, 255, 255, 0.4)" }} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
