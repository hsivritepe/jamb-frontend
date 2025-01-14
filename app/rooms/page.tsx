"use client";

import { useState, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import BreadCrumb from "@/components/ui/BreadCrumb";
import SearchServices from "@/components/SearchServices";
import RoomsGrid from "@/components/home/RoomMakeovers";
import { ROOMS_STEPS } from "@/constants/navigation";

// saveToSession: Save data to sessionStorage as JSON (client-side only)
const saveToSession = (key: string, value: any) => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(key, JSON.stringify(value));
  }
};

// loadFromSession: Safely load data from sessionStorage, parse JSON
// If an error or server-side, return defaultValue
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

export default function Rooms() {
  const router = useRouter();

  // Load previous search query from session if available
  const [searchQuery, setSearchQuery] = useState<string>(
    loadFromSession("rooms_searchQuery", "")
  );

  // On page load, clear previous calculation data to ensure a fresh start
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Clear previously selected time and coefficient from old estimates
      sessionStorage.removeItem("selectedTime");
      sessionStorage.removeItem("timeCoefficient");

      // Clear previously selected services from old estimates
      sessionStorage.removeItem("selectedServicesWithQuantity");
      sessionStorage.removeItem("services_selectedCategories");
      sessionStorage.removeItem("rooms_selectedServices");
      sessionStorage.removeItem("rooms_selectedServicesWithQuantity");
      // Remove or add other keys as needed to ensure a clean slate
    }
  }, []);

  // Save search query to session whenever it changes
  useEffect(() => {
    saveToSession("rooms_searchQuery", searchQuery);
  }, [searchQuery]);

  return (
    <main className="min-h-screen pt-24">
      <div className="container mx-auto">
        {/* Breadcrumb for the rooms flow */}
        <BreadCrumb items={ROOMS_STEPS} />

        {/* Search bar for rooms */}
        <div className="mt-8 mb-4">
          <SearchServices
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
            placeholder="Search for rooms..."
          />
        </div>

        {/* RoomsGrid component handles displaying and selecting rooms */}
        <RoomsGrid
          title="Select a room"
          subtitle="Specify the Required Services on the Next Page"
          searchQuery={searchQuery}
        />
      </div>
    </main>
  );
}