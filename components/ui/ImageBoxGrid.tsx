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
        gap-3 sm:gap-4
      "
    >
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => onSectionClick(item.id)}
          className={`
            relative group w-full cursor-pointer
            overflow-hidden aspect-square
            rounded-xl
            transition-all
            ${
              item.isSelected
                ? "border-4 border-blue-600 shadow-xl scale-102"
                : "border-2 border-transparent"
            }
          `}
        >
          {/* If item is selected, show different badges for mobile vs. tablet/desktop */}
          {item.isSelected && (
            <>
              {/* Mobile (<768px): checkmark in a blue circle */}
              <div
                className="
                  absolute top-2 right-2
                  bg-blue-600 text-white text-xs
                  w-6 h-6
                  rounded-full z-20
                  shadow
                  flex items-center justify-center
                  md:hidden
                "
              >
                ✓
              </div>
              {/* Tablet and desktop (≥768px): "Selected" text badge */}
              <div
                className="
                  absolute top-2 right-2
                  bg-blue-600 text-white text-xs px-2 py-1
                  rounded-full z-20
                  shadow
                  hidden md:block
                "
              >
                Selected
              </div>
            </>
          )}

          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw,
                   (max-width: 1200px) 50vw,
                   33vw"
            className={`
              object-cover
              transition-transform
              ${item.isSelected ? "scale-102" : "group-hover:scale-102"}
            `}
          />

          {/* Title overlay — higher z-index */}
          <div
            className="
              absolute inset-x-0 top-0
              z-10
              p-2 md:p-4
              bg-gradient-to-b from-black/50 to-transparent
            "
          >
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

          {/* Subcategories overlay — lower z-index */}
          {!!item.subcategories?.length && (
            <div
              className={`
                absolute inset-0
                z-0
                bg-black/50
                transition-opacity flex flex-col
                pt-20 sm:pt-24 px-4
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
      ))}
    </div>
  );
}