"use client";

export const dynamic = "force-dynamic";
import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { ALL_SEARCH_ITEMS } from "@/constants/searchData";
import { SectionBoxTitle } from "@/components/ui/SectionBoxTitle";
import SearchServices from "@/components/SearchServices";


export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<typeof ALL_SEARCH_ITEMS>([]);
  const router = useRouter();

  // Filter items as the user types in the search input
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

  // Handle clicks on a search result
  function handleResultClick(item: (typeof ALL_SEARCH_ITEMS)[number]) {
    if (item.type === "service") {
      router.push(`/calculate?serviceId=${item.id}`);
    } else if (item.type === "room") {
      router.push(`/rooms?selectedRoom=${item.id}`);
    } else if (item.type === "package") {
      router.push(`/packages/details?packageId=${item.id}`);
    }
  }

  // If we have results, we'll slightly scale the image
  const hasResults = results.length > 0;

  return (
    <section className="pt-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left column */}
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
                  className="px-4 py-2 border-b last:border-none
                             cursor-pointer hover:bg-blue-50"
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

        {/* Right column (hidden on phones, visible from 768px+) */}
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