"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";

interface BreadCrumbItem {
  readonly label: string; // The text label for the breadcrumb
  readonly href: string;  // The base path for that breadcrumb step
}

interface BreadCrumbProps {
  items: ReadonlyArray<BreadCrumbItem>;
}

export default function BreadCrumb({ items }: BreadCrumbProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Build query string if needed
  const queryString = searchParams.toString(); 

  // If you need to append query params, do it here (currently not appending):
  const updatedItems = items.map((item) => item);

  // Find which step is current
  const currentIndex = updatedItems.findIndex((item) => {
    const baseHref = item.href.split("?")[0];
    return baseHref === pathname;
  });

  // The set of paths where we want sessionStorage cleared
  const pathsToClear = ["/calculate", "/emergency", "/rooms", "/packages"];

  // Handler to clear sessionStorage if the item is in pathsToClear
  function handleBreadcrumbClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    e.preventDefault();
    sessionStorage.clear();  // 1) Clear sessionStorage
    router.push(href);       // 2) Navigate
  }

  return (
    <nav className="w-full border-b border-gray-200">
      <div className="flex items-center justify-between text-gray-500">
        {updatedItems.map((item, index) => {
          const baseHref = item.href.split("?")[0];
          const isActive = pathname === baseHref;
          const isPassed = index <= currentIndex;

          // Decide if we clear storage on click
          const shouldClearStorage = pathsToClear.includes(item.href);

          return (
            <div
              key={item.href}
              className={`flex-1 relative ${isPassed ? "border-b-2 border-brand -mb-[2px]" : ""}`}
            >
              {isPassed ? (
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

              {index < updatedItems.length - 1 && (
                <ChevronRight className="w-5 h-5 absolute top-1/2 -translate-y-1/2 -right-3 text-gray-400" />
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}