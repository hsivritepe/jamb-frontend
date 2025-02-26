"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, ChangeEvent } from "react";
import BreadCrumb from "@/components/ui/BreadCrumb";
import SearchServices from "@/components/SearchServices";
import ServicePackages from "@/components/ServicePackages";
import { PACKAGES_STEPS } from "@/constants/navigation";
import { getSessionItem, setSessionItem } from "@/utils/session";

export default function PackagesPage() {
  // Restore search query from session
  const [searchQuery, setSearchQuery] = useState<string>(() =>
    getSessionItem("packages_searchQuery", "")
  );

  // Clear old session keys from other flows on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("selectedTime");
      sessionStorage.removeItem("timeCoefficient");
      sessionStorage.removeItem("selectedServicesWithQuantity");
      sessionStorage.removeItem("rooms_selectedServices");
      sessionStorage.removeItem("rooms_selectedServicesWithQuantity");
      sessionStorage.removeItem("emergency_selectedActivities");
    }
  }, []);

  // Persist search query to session
  useEffect(() => {
    setSessionItem("packages_searchQuery", searchQuery);
  }, [searchQuery]);

  return (
    <main className="min-h-screen pt-24">
      <div className="container mx-auto">
        <BreadCrumb items={PACKAGES_STEPS} />

        <div className="mt-8">
          <SearchServices
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
            placeholder="Search for packages..."
          />
        </div>

        <ServicePackages />
      </div>
    </main>
  );
}