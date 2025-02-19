"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { ALL_SEARCH_ITEMS } from "@/constants/searchData";
import { SectionBoxTitle } from "@/components/ui/SectionBoxTitle";
import SearchServices from "@/components/SearchServices";

// New imports to set session data and locate the matching service/category
import { setSessionItem } from "@/utils/session";
import { ALL_SERVICES } from "@/constants/services";
import { ALL_CATEGORIES } from "@/constants/categories";
import { useLocation } from "@/context/LocationContext";

/**
 * HeroSection component provides:
 *  - A heading
 *  - A description
 *  - A search input for services
 *  - A filtered list of results (services, rooms, packages)
 *  - On clicking a service, it will skip the first two "calculate" pages
 *    and directly set the session data for the chosen service,
 *    then redirect the user to "/calculate/details".
 */
export default function HeroSection() {
  // State for the search input
  const [searchQuery, setSearchQuery] = useState("");

  // Filtered results shown in the autocomplete dropdown
  const [results, setResults] = useState<typeof ALL_SEARCH_ITEMS>([]);

  // Access the router for navigation
  const router = useRouter();

  // Optional: useLocation if you want to prefill address from user's geo
  const { location } = useLocation();

  // Filter items as the user types
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
   * Handle user clicks on a search result item.
   * For "service" type, we will skip the first two pages entirely:
   *  1) we find the corresponding service in ALL_SERVICES,
   *  2) find its category in ALL_CATEGORIES,
   *  3) set the necessary session storage items,
   *  4) then push directly to "/calculate/details".
   */
  function handleResultClick(item: (typeof ALL_SEARCH_ITEMS)[number]) {
    // If the user clicked on a service...
    if (item.type === "service") {
      // Find the actual service in ALL_SERVICES by its ID
      const foundService = ALL_SERVICES.find((svc) => svc.id === item.id);
      if (!foundService) return;

      // Match the service's "category" against ALL_CATEGORIES title
      // For example, if foundService.category === "Smoke Detector"
      // we want the object where title === "Smoke Detector".
      const foundCategory = ALL_CATEGORIES.find(
        (cat) => cat.title === foundService.category
      );
      if (!foundCategory) return;

      // Prepare session data so the third page will see we have a category chosen
      setSessionItem("services_selectedCategories", [foundCategory.id]);
      setSessionItem("services_selectedSections", [foundCategory.section]);
      setSessionItem("selectedServicesWithQuantity", {
        [foundService.id]: foundService.min_quantity ?? 1,
      });

      // Optionally, prefill address if location is available
      if (location?.city && location?.state && location?.zip) {
        setSessionItem("address", location.city);
        setSessionItem("stateName", location.state);
        setSessionItem("zip", location.zip);
        setSessionItem(
          "fullAddress",
          [location.city, location.state, location.zip].join(", ")
        );
      } else {
        // Fallback: at least ensure it's not empty
        // setSessionItem("address", "Some City");
      }

      // Now, push directly to the third page
      router.push("/calculate/details");
    }
    // If the user clicked on a "room", use the existing logic
    else if (item.type === "room") {
      router.push(`/rooms?selectedRoom=${item.id}`);
    }
    // If the user clicked on a "package", use the existing logic
    else if (item.type === "package") {
      router.push(`/packages/details?packageId=${item.id}`);
    }
  }

  // If we have results, we slightly scale the right-side image
  const hasResults = results.length > 0;

  return (
    <section className="pt-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left column with title, description, and search */}
        <div className="bg-white rounded-2xl p-4 sm:p-8 flex flex-col justify-between text-base">
          <div>
            <SectionBoxTitle>
              Smart Estimates,
              <br />
              Stress-Free Renovations
            </SectionBoxTitle>
            <p className="text-gray-600 mb-8">
              Answer a few quick questions to receive accurate quotes,
              and let us handle your entire project.
            </p>
          </div>

          {/* Reusable search component */}
          <SearchServices
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
            placeholder="Search for any service"
          />

          {/* Autocomplete results dropdown */}
          {results.length > 0 && (
            <div className="mt-4 border border-gray-300 rounded-lg bg-white shadow-sm max-h-60 overflow-auto">
              {results.map((item) => (
                <div
                  key={`${item.type}_${item.id}`}
                  className="px-4 py-2 border-b last:border-none cursor-pointer hover:bg-blue-50"
                  onClick={() => handleResultClick(item)}
                >
                  <div className="text-sm text-gray-400">
                    {item.type === "service" && "Services"}
                    {item.type === "room" && "Rooms"}
                    {item.type === "package" && "Packages"}
                  </div>
                  <div className="font-medium text-gray-800">
                    {item.title}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column: An image that scales if there are results */}
        <div className="hidden md:flex bg-white rounded-2xl overflow-hidden min-h-[500px]">
          <img
            src="/images/hero-service-professional.jpg"
            alt="Professional service provider"
            className={
              "object-cover w-full h-full transform transition-transform duration-500 " +
              (hasResults ? "scale-105" : "scale-100")
            }
          />
        </div>
      </div>
    </section>
  );
}