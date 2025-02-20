"use client";

import React from "react";
import Image from "next/image";

interface Item {
  id: string;
  title: string;
  image: string;
  url: string;
  subcategories: string[];
  isSelected: boolean;
}

interface ImageBoxGridProps {
  items: Item[];
  onSectionClick: (sectionId: string) => void;
  showCount?: boolean;
  moreText?: string;
}

/**
 * ImageBoxGrid:
 * - 2 columns on phones (<768px)
 * - 3 columns on tablets (≥768px)
 * - 4 columns on desktops (≥1024px)
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
        grid grid-cols-2
        md:grid-cols-3
        lg:grid-cols-4
        gap-5
      "
    >
      {items.map((item) => (
        <div
          key={item.id}
          className={`
            relative group w-full mx-0
            rounded-xl cursor-pointer
            ${
              item.isSelected
                ? "border-4 border-blue-600 scale-105 shadow-lg"
                : "border-2 border-transparent"
            }
            transition-all
          `}
          onClick={() => onSectionClick(item.id)}
        >
          <div className="relative overflow-hidden rounded-lg aspect-square w-full">
            <Image
              src={item.image}
              alt={item.title}
              fill
              sizes="(max-width: 768px) 100vw,
                     (max-width: 1200px) 50vw,
                     33vw"
              className={`
                object-cover transition-transform
                ${
                  item.isSelected
                    ? "scale-105"
                    : "group-hover:scale-105"
                }
              `}
            />
            <div className="absolute inset-x-0 top-0 p-2 md:p-4 bg-gradient-to-b from-black/50 to-transparent">
              <h3
                className="
                  font-medium text-white
                  text-2xl md:text-3xl xl:text-4xl
                "
                style={{ textShadow: "1px 1px 3px rgba(0, 0, 0, 0.8)" }}
              >
                {item.title}
                {showCount && item.subcategories.length > 0 && (
                  <span className="hidden"> ({item.subcategories.length})</span>
                )}
              </h3>
            </div>

            {item.subcategories && (
              <div
                className={`
                  absolute inset-0 bg-black/50 transition-opacity flex flex-col pt-16 px-4
                  ${
                    item.isSelected
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  }
                `}
              >
                <div
                  className="
                    text-white space-y-2 overflow-hidden
                  "
                  style={{ textShadow: "1px 1px 3px rgba(0, 0, 0, 0.8)" }}
                >
                  {item.subcategories.slice(0, 6).map((sub, idx) => (
                    <div key={idx} className="text-xs md:text-sm line-clamp-1">
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