"use client";

export const dynamic = "force-dynamic";

import { useState, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import BreadCrumb from "@/components/ui/BreadCrumb";
import SearchServices from "@/components/SearchServices";
import RoomsGrid from "@/components/home/RoomMakeovers";
import { ROOMS_STEPS } from "@/constants/navigation";
import { setSessionItem, getSessionItem } from "@/utils/session";

export default function Rooms() {
  const router = useRouter();
  // Load existing search query from session, if any
  const [searchQuery, setSearchQuery] = useState<string>(
    getSessionItem("rooms_searchQuery", "")
  );

  // Clear certain session data on mount to ensure a fresh flow
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("selectedTime");
      sessionStorage.removeItem("timeCoefficient");
      sessionStorage.removeItem("selectedServicesWithQuantity");
      sessionStorage.removeItem("services_selectedCategories");
      sessionStorage.removeItem("rooms_selectedServices");
      sessionStorage.removeItem("rooms_selectedServicesWithQuantity");
    }
  }, []);

  // Whenever searchQuery changes, persist it to session
  useEffect(() => {
    setSessionItem("rooms_searchQuery", searchQuery);
  }, [searchQuery]);

  return (
    <main className="min-h-screen pt-24">
      <div className="container mx-auto">
        {/* Breadcrumb navigation for the Rooms flow */}
        <BreadCrumb items={ROOMS_STEPS} />

        {/* Search input */}
        <div className="mt-8 mb-4">
          <SearchServices
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
            placeholder="Search for rooms..."
          />
        </div>

        {/* RoomsGrid displays room categories/options */}
        <RoomsGrid
          title="Select a Room or Space"
          subtitle="Specify Which Services You Need on the Next Page"
          searchQuery={searchQuery}
        />
      </div>
    </main>
  );
}