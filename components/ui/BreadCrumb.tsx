"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";

interface BreadCrumbItem {
  readonly label: string; // Text label
  readonly href: string;  // Base path
}

interface BreadCrumbProps {
  items: ReadonlyArray<BreadCrumbItem>;
}

/**
 * BreadCrumb component:
 * - On phones (<768px), arrows are removed entirely (no ChevronRight).
 * - On tablets/desktops (≥768px), arrows remain as before (absolute positioned).
 * - We still do "..." to shorten the chain on mobile if needed,
 *   and highlight/underline for passed items.
 */
export default function BreadCrumb({ items }: BreadCrumbProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Detect if screen is phone (<768px)
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize(); // initial check on mount

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // For potential query params, not used here
  const updatedItems = items.map((item) => item);

  // Determine "current" step
  const currentIndex = updatedItems.findIndex((item) => {
    const baseHref = item.href.split("?")[0];
    return baseHref === pathname;
  });

  // Some paths require clearing sessionStorage on click
  const pathsToClear = ["/calculate", "/emergency", "/rooms", "/packages"];

  function handleBreadcrumbClick(
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) {
    e.preventDefault();
    sessionStorage.clear();
    router.push(href);
  }

  // getMobileItems(): shorten chain for mobile if necessary
  function getMobileItems(all: BreadCrumbItem[], currIndex: number) {
    const length = all.length;
    if (length <= 3) return all;

    const firstItem = all[0];
    const lastItem = all[length - 1];
    const currentItem = all[currIndex] ?? lastItem;

    if (currIndex <= 0) {
      // user on first
      if (length === 2) return all;
      return [firstItem, { label: "...", href: "#" }, lastItem];
    }
    if (currIndex >= length - 1) {
      // user on last
      if (length === 2) return all;
      return [firstItem, { label: "...", href: "#" }, lastItem];
    }
    if (currIndex === 1 && length > 3) {
      return [firstItem, currentItem, { label: "...", href: "#" }, lastItem];
    }
    if (currIndex === length - 2 && length > 3) {
      return [firstItem, { label: "...", href: "#" }, currentItem, lastItem];
    }
    return [
      firstItem,
      { label: "...", href: "#" },
      currentItem,
      { label: "...", href: "#" },
      lastItem,
    ];
  }

  // Decide mobile vs. desktop array
  const displayItems = isMobile
    ? getMobileItems(updatedItems, currentIndex)
    : updatedItems;

  return (
    <nav className="w-full border-b border-gray-200">
      <div className="flex items-center justify-between text-gray-500">
        {displayItems.map((item, index) => {
          const baseHref = item.href.split("?")[0];
          const isActive = pathname === baseHref;
          const isPassed = index <= currentIndex;
          const isPlaceholder = item.label === "...";
          const shouldClearStorage = pathsToClear.includes(item.href);

          return (
            <div
              key={index}
              className={`flex-1 relative ${
                isPassed ? "border-b-2 border-brand -mb-[2px]" : ""
              }`}
            >
              {/**
               * If "..." => placeholder,
               * else if passed => link or anchor with onClick (if clear storage),
               * else => disabled span
               */}
              {isPlaceholder ? (
                <span className="flex items-center justify-center py-4 text-gray-400">
                  ...
                </span>
              ) : isPassed ? (
                shouldClearStorage ? (
                  <a
                    href={item.href}
                    className={`flex items-center justify-center py-4 ${
                      isActive ? "text-blue-600 font-medium" : "text-blue-400"
                    } hover:text-blue-800`}
                    onClick={(e) => handleBreadcrumbClick(e, item.href)}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center justify-center py-4 ${
                      isActive ? "text-blue-600 font-medium" : "text-blue-400"
                    } hover:text-blue-800`}
                  >
                    {item.label}
                  </Link>
                )
              ) : (
                <span className="flex items-center justify-center py-4 text-gray-500 cursor-not-allowed">
                  {item.label}
                </span>
              )}

              {/**
               * If not the last item & not mobile => show arrow
               * For <768px, no arrow
               */}
              {index < displayItems.length - 1 && !isMobile && (
                <ChevronRight className="w-5 h-5 absolute top-1/2 -translate-y-1/2 -right-2 text-gray-400" />
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}