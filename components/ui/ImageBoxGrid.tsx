'use client';

import React from 'react';
import Image from 'next/image';

interface Item {
  id: string;
  title: string;
  image: string;
  url: string;
  subcategories: string[];
}

interface ImageBoxGridProps {
  items: Item[];
  showCount?: boolean;
  moreText?: string; // Prop to customize "more" text
}

export function ImageBoxGrid({
  items,
  showCount = true,
  moreText = 'categories', // Default value for "more" text
}: ImageBoxGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {items.map((item) => (
        <div
          key={item.id}
          className="relative group w-full max-w-[300px] mx-auto"
        >
          <div className="relative overflow-hidden rounded-xl aspect-square w-full">
            {/* Service image */}
            <Image
              src={item.image}
              alt={item.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform group-hover:scale-110"
            />

            {/* Title overlay */}
            <div className="absolute inset-x-0 top-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
              <h3
                className="font-medium text-white text-2xl"
                style={{
                  textShadow: '1px 1px 3px rgba(0, 0, 0, 0.8)',
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
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col pt-16 px-4">
                <div
                  className="text-white space-y-2 overflow-hidden"
                  style={{
                    textShadow: '1px 1px 3px rgba(0, 0, 0, 0.8)',
                  }}
                >
                  {item.subcategories.slice(0, 7).map((sub, idx) => (
                    <div key={idx} className="text-sm line-clamp-1">
                      {sub}
                    </div>
                  ))}
                  {item.subcategories.length > 7 && (
                    <div className="text-sm">
                      more {item.subcategories.length - 7} {moreText} →
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