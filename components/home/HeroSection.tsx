"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
// We'll import a combined array of items (services, rooms, packages).
import { ALL_SEARCH_ITEMS } from "@/constants/searchData";

import { SectionBoxTitle } from "@/components/ui/SectionBoxTitle";
import SearchServices from "@/components/SearchServices";

/**
 * This component renders a hero section that includes:
 * 1) A main heading and some introductory text.
 * 2) A search field (SearchServices) to filter a combined dataset of
 *    all services, rooms, and packages by their titles.
 * 3) A list of matching results displayed below the search field.
 * 4) When a user clicks a result, we navigate them to the relevant page/flow.
 */
export default function HeroSection() {
  // The search query string the user has typed in.
  const [searchQuery, setSearchQuery] = useState("");

  // The current list of search results that match the user's query.
  const [results, setResults] = useState<typeof ALL_SEARCH_ITEMS>([]);

  // Use Next.js's router for navigation on item click
  const router = useRouter();

  /**
   * Whenever `searchQuery` changes, filter `ALL_SEARCH_ITEMS` to those
   * whose `title` contains the query. If `searchQuery` is empty, clear results.
   */
  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      setResults([]);
      return;
    }

    const filtered = ALL_SEARCH_ITEMS.filter((item) =>
      item.title.toLowerCase().includes(query)
    );
    setResults(filtered);
  }, [searchQuery]);

  /**
   * Handle a click on a search result. We'll check the item's type and ID,
   * then navigate to the relevant page. You can modify this logic to align
   * with how your site handles services, rooms, or packages.
   */
  function handleResultClick(item: (typeof ALL_SEARCH_ITEMS)[number]) {
    if (item.type === "service") {
      // Example: Maybe your "Services" flow starts at "/calculate"
      // Then you pass the service ID or name so the user can continue:
      // e.g., navigate them to "/calculate?preSelectedServiceId=xxx"
      router.push(`/calculate?serviceId=${item.id}`);
    } else if (item.type === "room") {
      // Example: Maybe your "Rooms" flow is at "/rooms", and you want to highlight
      // or auto-select a room with ID = item.id
      router.push(`/rooms?selectedRoom=${item.id}`);
    } else if (item.type === "package") {
      // Example: Perhaps your package details page is "/packages/details"
      // pass the packageId in a query param:
      router.push(`/packages/details?packageId=${item.id}`);
    }
  }

  return (
    <section className="pt-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: main heading, subtext, and search field */}
        <div className="bg-white rounded-2xl p-8">
          <div className="flex flex-col justify-between h-full">
            <div>
              {/* Main heading */}
              <SectionBoxTitle>
                Smart Estimates,
                <br />
                Stress-Free Renovations
              </SectionBoxTitle>

              {/* Subtext */}
              <p className="text-gray-600 mb-8">
                Answer a few quick questions to receive accurate quotes,
                and let us handle your entire project.
              </p>
            </div>

            {/* Search input for any item (service, room, or package) */}
            <SearchServices
              value={searchQuery}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.target.value)
              }
              placeholder="Search for any service, room, or package..."
            />

            {/* Show results if there are matches */}
            {results.length > 0 && (
              <div className="mt-4 border border-gray-300 rounded-lg bg-white shadow-sm max-h-60 overflow-auto">
                {results.map((item) => (
                  <div
                    key={`${item.type}_${item.id}`}
                    className="px-4 py-2 border-b last:border-none
                               cursor-pointer hover:bg-blue-50"
                    onClick={() => handleResultClick(item)}
                  >
                    {/* Display the item's type (e.g. "Services", "Rooms", or "Packages") */}
                    <div className="text-sm text-gray-400">
                      {item.type === "service" && "Services"}
                      {item.type === "room" && "Rooms"}
                      {item.type === "package" && "Packages"}
                    </div>

                    {/* Display the item's title */}
                    <div className="font-medium text-gray-800">
                      {item.title}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: an image or any relevant illustration */}
        <div className="bg-white rounded-2xl overflow-hidden">
          <img
            src="/images/hero-service-professional.jpg"
            alt="Professional service provider"
            className="w-[650px] h-[500px] object-cover"
          />
        </div>
      </div>
    </section>
  );
}