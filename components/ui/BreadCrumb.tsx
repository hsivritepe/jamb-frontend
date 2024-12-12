"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

interface BreadCrumbProps {
  // Define the structure of breadcrumb items
  items: ReadonlyArray<{
    readonly label: string; // Label for the breadcrumb step
    readonly href: string; // URL path for the step
  }>;
}

export default function BreadCrumb({ items }: BreadCrumbProps) {
  const pathname = usePathname(); // Get the current path
  const currentIndex = items.findIndex(
    (item) => item.href === pathname // Find the index of the current step
  );

  return (
    <nav className="w-full border-b border-gray-200">
      <div className="flex items-center justify-between text-gray-500">
        {items.map((item, index) => {
          const isActive = pathname === item.href; // Check if the item is the current page
          const isPassed = index <= currentIndex; // Check if the page is passed or active

          return (
            <div
              key={item.href}
              className={`flex-1 relative ${
                isPassed ? "border-b-2 border-brand -mb-[2px]" : "" // Add a blue bottom border for passed or active steps
              }`}
            >
              {isPassed ? (
                // Render a clickable link for passed and active steps
                <Link
                  href={item.href}
                  className={`flex items-center justify-center py-4 ${
                    isActive
                      ? "text-blue-600 font-medium" // Styling for the current step
                      : "text-blue-400" // Styling for passed steps
                  } hover:text-blue-800`} // Add hover effect
                >
                  {item.label}
                </Link>
              ) : (
                // Render a non-clickable label for upcoming steps
                <span className="flex items-center justify-center py-4 text-gray-500 cursor-not-allowed">
                  {item.label}
                </span>
              )}
              {/* Render a chevron icon between steps */}
              {index < items.length - 1 && (
                <ChevronRight className="w-5 h-5 absolute top-1/2 -translate-y-1/2 -right-3 text-gray-400" />
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
