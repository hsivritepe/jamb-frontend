"use client";

import { useState, useEffect, ChangeEvent } from "react";
import BreadCrumb from "@/components/ui/BreadCrumb";
import SearchServices from "@/components/SearchServices";
import ServicePackages from "@/components/ServicePackages";
import { PACKAGES_STEPS } from "@/constants/navigation";

// Helper function: saves a value to session storage (client-side only).
const saveToSession = (key: string, value: any) => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(key, JSON.stringify(value));
  }
};

// Helper function: loads a value from session storage (client-side only).
// Returns a default if not found or if on the server side.
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
  // State to hold the search query for packages
  // Loaded from session, so if a user refreshes, we keep their previous search
  const [searchQuery, setSearchQuery] = useState<string>(
    loadFromSession("packages_searchQuery", "")
  );

  // useEffect: On first render, remove any old session keys not relevant here,
  // ensuring a "clean slate" for the Packages flow if needed.
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Remove session data from other flows or states that won't be used here
      sessionStorage.removeItem("selectedTime");
      sessionStorage.removeItem("timeCoefficient");
      sessionStorage.removeItem("selectedServicesWithQuantity");

      // For example, if you had these leftover from a "rooms" flow or an "emergency" flow:
      sessionStorage.removeItem("rooms_selectedServices");
      sessionStorage.removeItem("rooms_selectedServicesWithQuantity");
      sessionStorage.removeItem("emergency_selectedActivities");
      // etc. Add or remove what you need for your flows
    }
  }, []);

  // Sync the search query to session storage whenever it changes
  useEffect(() => {
    saveToSession("packages_searchQuery", searchQuery);
  }, [searchQuery]);

  return (
    <main className="min-h-screen pt-24">
      <div className="container mx-auto">
        {/* Breadcrumb for the packages flow */}
        <BreadCrumb items={PACKAGES_STEPS} />

        {/* Optional search bar for filtering displayed packages */}
        <div className="mt-8 mb-4">
          <SearchServices
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
            placeholder="Search for packages..."
          />
        </div>

        {/* Component that displays the grid of packages */}
        <ServicePackages />
      </div>
    </main>
  );
}