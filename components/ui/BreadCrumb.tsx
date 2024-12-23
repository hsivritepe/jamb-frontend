"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";

interface BreadCrumbItem {
  readonly label: string; // The text label for the breadcrumb
  readonly href: string;  // The base path for that breadcrumb step (e.g. "/packages/details")
}

interface BreadCrumbProps {
  items: ReadonlyArray<BreadCrumbItem>;
}

export default function BreadCrumb({ items }: BreadCrumbProps) {
  /**
   * 1) usePathname gives us the current path, e.g. "/packages/details"
   *    without query string.
   */
  const pathname = usePathname();

  /**
   * 2) useSearchParams gives us the current query parameters (e.g. "packageId=123"),
   *    so we can re-append them to the breadcrumb links and maintain state.
   */
  const searchParams = useSearchParams();

  // If you only need 'packageId', you can do:
  // const packageId = searchParams.get("packageId");

  // If you want to preserve *all* query params (e.g. packageId, refCode, etc.), you can do:
  const queryString = searchParams.toString(); // "packageId=123" or ""

  // We'll build an updated array of breadcrumb items so that each relevant item retains the query params.
  const updatedItems = items.map((item) => {
    // If we have any query params at all, and the item.href starts with "/packages" (the flow you're in),
    // and item.href doesn't already have a "?", then we append the current queryString.
    if (queryString && item.href.startsWith("/packages") && !item.href.includes("?")) {
      return {
        ...item,
        href: `${item.href}?${queryString}`,
      };
    }
    return item;
  });

  /**
   * 3) Determine which breadcrumb step is "active". We compare
   *    the base path of each item (without query) to the current pathname.
   */
  const currentIndex = updatedItems.findIndex((item) => {
    // Strip off anything after "?" to get just the path.
    const baseHref = item.href.split("?")[0];
    return baseHref === pathname; 
  });

  return (
    <nav className="w-full border-b border-gray-200">
      <div className="flex items-center justify-between text-gray-500">
        {updatedItems.map((item, index) => {
          // Compare again (strip query from href):
          const baseHref = item.href.split("?")[0];
          const isActive = pathname === baseHref;
          const isPassed = index <= currentIndex;

          return (
            <div
              key={item.href}
              className={`flex-1 relative ${
                isPassed ? "border-b-2 border-brand -mb-[2px]" : ""
              }`}
            >
              {isPassed ? (
                /**
                 * If the step is current or already passed, we make it clickable.
                 * The active step has distinct styling (text-blue-600).
                 */
                <Link
                  href={item.href}
                  className={`flex items-center justify-center py-4 ${
                    isActive
                      ? "text-blue-600 font-medium"
                      : "text-blue-400"
                  } hover:text-blue-800`}
                >
                  {item.label}
                </Link>
              ) : (
                /**
                 * Future steps (index > currentIndex) are disabled / not yet available.
                 */
                <span className="flex items-center justify-center py-4 text-gray-500 cursor-not-allowed">
                  {item.label}
                </span>
              )}

              {/* Render a chevron icon between steps, except after the last one */}
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