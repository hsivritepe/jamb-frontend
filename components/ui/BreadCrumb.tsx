"use client";

export const dynamic = "force-dynamic";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";

/**
 * Represents one breadcrumb step.
 */
interface BreadCrumbItem {
  readonly label: string;
  readonly href: string;
}

interface BreadCrumbProps {
  items: ReadonlyArray<BreadCrumbItem>;
}

/**
 * A small helper that preserves user auth 
 * and clears other session keys.
 */
function preserveAuthAndClearOthers() {
  // Keep these keys
  const authToken = sessionStorage.getItem("authToken");
  const profileData = sessionStorage.getItem("profileData");

  // Clear everything
  sessionStorage.clear();

  // Restore those we want to keep
  if (authToken) {
    sessionStorage.setItem("authToken", authToken);
  }
  if (profileData) {
    sessionStorage.setItem("profileData", profileData);
  }
}

/**
 * BreadCrumb component:
 * - On phones (<768px), we remove the arrow icon (ChevronRight).
 * - On tablets/desktops (≥768px), we keep the arrow.
 * - We also do "..." to shorten the chain on mobile if needed.
 * - If a breadcrumb link is in the "pathsToClear" array, we 
 *   selectively clear sessionStorage except the auth token.
 */
export default function BreadCrumb({ items }: BreadCrumbProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if screen is phone (<768px)
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize(); // run once
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Possibly we transform items or use searchParams
  const updatedItems = items.map((item) => item);

  // Find current index
  const currentIndex = updatedItems.findIndex((item) => {
    // Base path ignoring query
    const baseHref = item.href.split("?")[0];
    return baseHref === pathname;
  });

  // If user clicks on these top-level pages => clear session data
  const pathsToClear = ["/calculate", "/emergency", "/rooms", "/packages"];

  /**
   * If user clicks on a breadcrumb that is in `pathsToClear`, 
   * we preserve auth but remove everything else from sessionStorage.
   */
  function handleBreadcrumbClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    e.preventDefault();
    preserveAuthAndClearOthers();
    router.push(href);
  }

  /**
   * On mobile, we shorten the breadcrumb chain with "..." 
   * if there are many items.
   */
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
    // More complicated case => show first, "...", current, "...", last
    return [
      firstItem,
      { label: "...", href: "#" },
      currentItem,
      { label: "...", href: "#" },
      lastItem,
    ];
  }

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
          const shouldClearStorage = pathsToClear.includes(baseHref);

          return (
            <div
              key={index}
              className={`flex-1 relative ${
                isPassed ? "border-b-2 border-brand -mb-[2px]" : ""
              }`}
            >
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