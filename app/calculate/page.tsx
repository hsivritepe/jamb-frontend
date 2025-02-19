"use client";

export const dynamic = "force-dynamic";
import { useState, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import BreadCrumb from "@/components/ui/BreadCrumb";
import ServicesGrid from "@/components/home/ServicesGrid";
import SearchServices from "@/components/SearchServices";
import { CALCULATE_STEPS } from "@/constants/navigation";
import { setSessionItem, getSessionItem } from "@/utils/session";

export default function Calculate() {
  const router = useRouter();

  // Load initial search query from session storage
  const [searchQuery, setSearchQuery] = useState<string>(() =>
    getSessionItem("services_searchQuery", "")
  );

  // Persist search query to session storage on change
  useEffect(() => {
    setSessionItem("services_searchQuery", searchQuery);
  }, [searchQuery]);

  return (
    <main className="min-h-screen pt-24">
      <div className="container mx-auto">
        {/* Breadcrumb */}
        <BreadCrumb items={CALCULATE_STEPS} />

        {/* Search bar */}
        <div className="mt-8 mb-4">
          <SearchServices
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            placeholder="Search for services..."
          />
        </div>

        {/* Services Grid */}
        <ServicesGrid searchQuery={searchQuery} />
      </div>
    </main>
  );
}