"use client";

import { useState, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import BreadCrumb from "@/components/ui/BreadCrumb";
import ServicesGrid from "@/components/home/ServicesGrid";
import SearchServices from "@/components/SearchServices";
import { CALCULATE_STEPS } from "@/constants/navigation";

// Unified session utilities
import { setSessionItem, getSessionItem } from "@/utils/session";

export default function Calculate() {
  const router = useRouter();

  // Load the search query from session storage (if any)
  const [searchQuery, setSearchQuery] = useState<string>(() =>
    getSessionItem("services_searchQuery", "")
  );

  // Whenever the searchQuery changes, persist it to session storage
  useEffect(() => {
    setSessionItem("services_searchQuery", searchQuery);
  }, [searchQuery]);

  return (
    <main className="min-h-screen pt-24">
      <div className="container mx-auto">
        {/* Breadcrumb navigation for the "Calculate" flow */}
        <BreadCrumb items={CALCULATE_STEPS} />

        {/* Search bar */}
        <div className="mt-8 mb-4">
          <SearchServices
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            placeholder="Search for services..."
          />
        </div>

        {/* ServicesGrid displays categories/sections where user can pick services */}
        <ServicesGrid searchQuery={searchQuery} />
      </div>
    </main>
  );
}