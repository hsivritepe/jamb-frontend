"use client";

import { useState, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import BreadCrumb from "@/components/ui/BreadCrumb";
import SearchServices from "@/components/SearchServices";
import RoomsGrid from "@/components/home/RoomMakeovers";
import { ROOMS_STEPS } from "@/constants/navigation";

// Unified session utilities
import { setSessionItem, getSessionItem } from "@/utils/session";

export default function Rooms() {
  const router = useRouter();

  // Load previous search query from session if available
  const [searchQuery, setSearchQuery] = useState<string>(
    getSessionItem("rooms_searchQuery", "")
  );

  // On page load, clear previously stored data to ensure a fresh start
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Clear data related to older flows or estimates
      sessionStorage.removeItem("selectedTime");
      sessionStorage.removeItem("timeCoefficient");
      sessionStorage.removeItem("selectedServicesWithQuantity");
      sessionStorage.removeItem("services_selectedCategories");
      sessionStorage.removeItem("rooms_selectedServices");
      sessionStorage.removeItem("rooms_selectedServicesWithQuantity");
    }
  }, []);

  // Whenever the search query changes, store it in session
  useEffect(() => {
    setSessionItem("rooms_searchQuery", searchQuery);
  }, [searchQuery]);

  return (
    <main className="min-h-screen pt-24">
      <div className="container mx-auto">
        {/* Breadcrumb navigation for the rooms flow */}
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

        {/* RoomsGrid component displays room options */}
        <RoomsGrid
          title="Select a room"
          subtitle="Specify the Required Services on the Next Page"
          searchQuery={searchQuery}
        />
      </div>
    </main>
  );
}