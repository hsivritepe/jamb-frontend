"use client";

export const dynamic = "force-dynamic";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

/**
 * Represents a single breadcrumb item.
 */
interface BreadCrumbItem {
  readonly label: string;
  readonly href: string;
}

interface BreadCrumbProps {
  items: ReadonlyArray<BreadCrumbItem>;
}

/**
 * Preserves auth token and profile data, 
 * and clears other session keys.
 */
function preserveAuthAndClearOthers() {
  const authToken = sessionStorage.getItem("authToken");
  const profileData = sessionStorage.getItem("profileData");
  sessionStorage.clear();
  if (authToken) sessionStorage.setItem("authToken", authToken);
  if (profileData) sessionStorage.setItem("profileData", profileData);
}

/**
 * BreadCrumb component:
 * - On mobile (<768px), shows fewer items with "..." if there are many.
 * - On desktop (≥768px), displays the full chain.
 * - Some paths trigger session clearing except auth info.
 */
export default function BreadCrumb({ items }: BreadCrumbProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const updatedItems = items.map((item) => item);
  const currentIndex = updatedItems.findIndex((item) => {
    const baseHref = item.href.split("?")[0];
    return baseHref === pathname;
  });

  const pathsToClear = ["/calculate", "/emergency", "/rooms", "/packages"];

  function handleBreadcrumbClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    e.preventDefault();
    preserveAuthAndClearOthers();
    router.push(href);
  }

  function getMobileItems(all: BreadCrumbItem[], currIndex: number) {
    if (all.length <= 3) return all;
    const firstItem = all[0];
    const lastItem = all[all.length - 1];
    const currentItem = all[currIndex] ?? lastItem;
    if (currIndex <= 0) {
      if (all.length === 2) return all;
      return [firstItem, { label: "...", href: "#" }, lastItem];
    }
    if (currIndex >= all.length - 1) {
      if (all.length === 2) return all;
      return [firstItem, { label: "...", href: "#" }, lastItem];
    }
    if (currIndex === 1 && all.length > 3) {
      return [firstItem, currentItem, { label: "...", href: "#" }, lastItem];
    }
    if (currIndex === all.length - 2 && all.length > 3) {
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