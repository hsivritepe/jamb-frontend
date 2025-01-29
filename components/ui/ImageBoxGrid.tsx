"use client";

import React from "react";
import Image from "next/image";

interface Item {
  id: string;
  title: string;
  image: string;
  url: string;
  subcategories: string[];
  isSelected: boolean; // New prop for selection state
}

interface ImageBoxGridProps {
  items: Item[];
  onSectionClick: (sectionId: string) => void; // Callback for section click
  showCount?: boolean;
  moreText?: string; // Prop to customize "more" text
}

/**
 * ImageBoxGrid:
 * - For phone (<768px):
 *   1) 2 columns (instead of 1).
 *   2) Remove side margins (mx-0), no max width.
 *   3) Smaller fonts in the card: text-xl => phone, text-2xl => md.
 *   4) Subcategories: text-xs => phone, text-sm => md.
 */
export function ImageBoxGrid({
  items,
  onSectionClick,
  showCount = true,
  moreText = "categories",
}: ImageBoxGridProps) {
  return (
    <div
      className="
        /* 2 columns on phone (<768px), 
           3 columns from md: (≥768px), 
           4 columns from lg: (≥1024px) */
        grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3
      "
    >
      {items.map((item) => (
        <div
          key={item.id}
          className={`
            relative group w-full mx-0 /* no side margins on phone */
            rounded-xl cursor-pointer
            ${
              item.isSelected
                ? "border-4 border-blue-600 scale-105 shadow-lg"
                : "border-2 border-transparent"
            }
            transition-all
          `}
          onClick={() => onSectionClick(item.id)} // Handle click
        >
          <div className="relative overflow-hidden rounded-lg aspect-square w-full">
            {/* Service image */}
            <Image
              src={item.image}
              alt={item.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={`
                object-cover transition-transform
                ${item.isSelected ? "scale-110" : "group-hover:scale-105"}
              `}
            />

            {/* Title overlay */}
            <div className="absolute inset-x-0 top-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
              {/**
               * text-xl on phones (<768px), 
               * text-2xl from md: up
               */}
              <h3
                className="
                  font-medium text-white
                  text-xl md:text-2xl
                "
                style={{
                  textShadow: "1px 1px 3px rgba(0, 0, 0, 0.8)",
                }}
              >
                {item.title}
                {showCount &&
                  item.subcategories.length > 0 &&
                  ` (${item.subcategories.length})`}
              </h3>
            </div>

            {/* Subcategories on hover */}
            {item.subcategories && (
              <div
                className={`
                  absolute inset-0 bg-black/50 transition-opacity flex flex-col pt-16 px-4
                  ${item.isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                `}
              >
                <div
                  className="
                    text-white space-y-2 overflow-hidden
                  "
                  style={{
                    textShadow: "1px 1px 3px rgba(0, 0, 0, 0.8)",
                  }}
                >
                  {/**
                   * text-xs on phones, text-sm on md:
                   */}
                  {item.subcategories.slice(0, 6).map((sub, idx) => (
                    <div
                      key={idx}
                      className="text-xs md:text-sm line-clamp-1"
                    >
                      {sub}
                    </div>
                  ))}
                  {item.subcategories.length > 6 && (
                    <div className="text-xs md:text-sm">
                      more {item.subcategories.length - 6} {moreText} →
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}