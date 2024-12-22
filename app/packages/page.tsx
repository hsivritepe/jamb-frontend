"use client";

import { useState, useEffect, ChangeEvent } from "react";
import BreadCrumb from "@/components/ui/BreadCrumb";
import SearchServices from "@/components/SearchServices";
import ServicePackages from "@/components/ServicePackages";
import { PACKAGES_STEPS } from "@/constants/navigation";

// Helpers for session storage (same approach as before)
const saveToSession = (key: string, value: any) => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(key, JSON.stringify(value));
  }
};

const loadFromSession = (key: string, defaultValue: any) => {
  if (typeof window === "undefined") return defaultValue;
  const savedValue = sessionStorage.getItem(key);
  try {
    return savedValue ? JSON.parse(savedValue) : defaultValue;
  } catch (error) {
    console.error(`Error parsing sessionStorage for key "${key}"`, error);
    return defaultValue;
  }
};

export default function PackagesPage() {
  // Load any previous search query (optional, if you want to filter packages)
  const [searchQuery, setSearchQuery] = useState<string>(
    loadFromSession("packages_searchQuery", "")
  );

  // Clear out stale session data on initial page load
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Example of removing old data not relevant to Packages
      sessionStorage.removeItem("selectedTime");
      sessionStorage.removeItem("timeCoefficient");
      sessionStorage.removeItem("selectedServicesWithQuantity");

      // If you have other keys from other flows (rooms, emergency, etc.), remove them as needed:
      sessionStorage.removeItem("rooms_selectedServices");
      sessionStorage.removeItem("rooms_selectedServicesWithQuantity");
      sessionStorage.removeItem("emergency_selectedActivities");
      // etc.
    }
  }, []);

  // Keep the search query in session if you actually intend to filter packages
  useEffect(() => {
    saveToSession("packages_searchQuery", searchQuery);
  }, [searchQuery]);

  return (
    <main className="min-h-screen pt-24">
      <div className="container mx-auto">
        {/* Breadcrumb for the packages flow */}
        <BreadCrumb items={PACKAGES_STEPS} />

        {/* Search bar for packages (optional) */}
        <div className="mt-8 mb-4">
          <SearchServices
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
            placeholder="Search for packages..."
          />
        </div>

        {/* The "ServicePackages" component that displays a grid of packages */}
        <ServicePackages />
      </div>
    </main>
  );
}