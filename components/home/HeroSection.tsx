"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { ALL_SEARCH_ITEMS } from "@/constants/searchData";
import { SectionBoxTitle } from "@/components/ui/SectionBoxTitle";
import SearchServices from "@/components/SearchServices";
import { setSessionItem } from "@/utils/session";
import { ALL_SERVICES } from "@/constants/services";
import { ALL_CATEGORIES } from "@/constants/categories";
import { useLocation } from "@/context/LocationContext";

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<typeof ALL_SEARCH_ITEMS>([]);
  const router = useRouter();
  const { location } = useLocation();

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
   * When the user clicks a search result:
   * - If it's a service, skip the first two "calculate" pages by setting session data
   *   and going directly to /calculate/details.
   * - If it's a room or package, use existing logic to route.
   */
  function handleResultClick(item: (typeof ALL_SEARCH_ITEMS)[number]) {
    if (item.type === "service") {
      const foundService = ALL_SERVICES.find((svc) => svc.id === item.id);
      if (!foundService) return;

      const foundCategory = ALL_CATEGORIES.find(
        (cat) => cat.title === foundService.category
      );
      if (!foundCategory) return;

      setSessionItem("services_selectedCategories", [foundCategory.id]);
      setSessionItem("services_selectedSections", [foundCategory.section]);
      setSessionItem("selectedServicesWithQuantity", {
        [foundService.id]: foundService.min_quantity ?? 1,
      });

      if (location?.city && location?.state && location?.zip) {
        setSessionItem("address", location.city);
        setSessionItem("stateName", location.state);
        setSessionItem("zip", location.zip);
        setSessionItem(
          "fullAddress",
          [location.city, location.state, location.zip].join(", ")
        );
      }

      router.push("/calculate/details");
    } else if (item.type === "room") {
      router.push(`/rooms?selectedRoom=${item.id}`);
    } else if (item.type === "package") {
      router.push(`/packages/details?packageId=${item.id}`);
    }
  }

  const hasResults = results.length > 0;

  return (
    <section className="py-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="bg-white rounded-2xl p-4 sm:p-8 flex flex-col justify-between text-base">
          <div>
            <SectionBoxTitle>
              Everything for Your Home, Just a Few Clicks Away
            </SectionBoxTitle>
            <p className="text-gray-600 mb-8">
              Get instant, accurate cost estimates to plan your budget, book
              services when you’re ready, and track progress in real time. Our
              platform automatically orders materials and assigns top-rated
              contractors, making the entire process smooth and transparent.
              <br />
              Want regular service? Subscribe for ongoing care.
            </p>
          </div>

          <SearchServices
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
            placeholder="Search for any service"
          />

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
                  <div className="font-medium text-gray-800">{item.title}</div>
                </div>
              ))}
            </div>
          )}
        </div>

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
