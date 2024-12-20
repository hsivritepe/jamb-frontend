"use client";

import { useState, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import BreadCrumb from "@/components/ui/BreadCrumb";
import ServicesGrid from "@/components/home/ServicesGrid";
import SearchServices from "@/components/SearchServices";
import { CALCULATE_STEPS } from "@/constants/navigation";

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

export default function Calculate() {
  const router = useRouter();
  
  // Load search query from sessionStorage
  const [searchQuery, setSearchQuery] = useState<string>(
    loadFromSession("services_searchQuery", "")
  );

  // Save search query to sessionStorage whenever it changes
  useEffect(() => {
    saveToSession("services_searchQuery", searchQuery);
  }, [searchQuery]);

  return (
    <main className="min-h-screen pt-24">
      <div className="container mx-auto">
        {/* Breadcrumb for navigation */}
        <BreadCrumb items={CALCULATE_STEPS} />

        {/* Search bar */}
        <div className="mt-8 mb-4">
          <SearchServices
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
            placeholder="Search for services..."
          />
        </div>

        {/* Displaying ServicesGrid - user chooses sections here */}
        <ServicesGrid searchQuery={searchQuery} />
      </div>
    </main>
  );
}