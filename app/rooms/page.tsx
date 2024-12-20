"use client";

import { useState, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import BreadCrumb from "@/components/ui/BreadCrumb";
import SearchServices from "@/components/SearchServices";
import RoomsGrid from "@/components/home/RoomMakeovers";
import { ROOMS_STEPS } from "@/constants/navigation";

// Helper functions for session storage
// Save data to sessionStorage as JSON string
const saveToSession = (key: string, value: any) => {
  sessionStorage.setItem(key, JSON.stringify(value));
};

// Load data from sessionStorage and parse it from JSON string
const loadFromSession = (key: string, defaultValue: any) => {
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

  // Load the search query from sessionStorage, if available
  const [searchQuery, setSearchQuery] = useState<string>(
    loadFromSession("rooms_searchQuery", "")
  );

  // Save the search query to sessionStorage whenever it changes
  useEffect(() => {
    saveToSession("rooms_searchQuery", searchQuery);
  }, [searchQuery]);

  return (
    <main className="min-h-screen pt-24">
      <div className="container mx-auto">
        {/* Breadcrumb navigation */}
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

        {/* RoomsGrid handles room selection and navigation to the next page */}
        <RoomsGrid
          title="Select a room"
          subtitle="Specify the Required Services on the Next Page"
          searchQuery={searchQuery}
        />
      </div>
    </main>
  );
}