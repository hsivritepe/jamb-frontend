"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import BreadCrumb from "@/components/ui/BreadCrumb";
import SearchServices from "@/components/SearchServices";
import Button from "@/components/ui/Button";
import { EMERGENCY_STEPS } from "@/constants/navigation";
import {
  EMERGENCY_SERVICES,
  EmergencyServicesType,
} from "@/constants/emergency";
import { ChevronDown } from "lucide-react";
import { SectionBoxTitle } from "@/components/ui/SectionBoxTitle";
import { useLocation } from "@/context/LocationContext";

// Import the new reusable components
import AddressSection from "@/components/ui/AddressSection";
import PhotosAndDescription from "@/components/ui/PhotosAndDescription";

// Helper functions for saving/loading data from sessionStorage
const saveToSession = (key: string, value: any) => {
  sessionStorage.setItem(key, JSON.stringify(value));
};
const loadFromSession = (key: string, defaultValue: any) => {
  const savedValue = sessionStorage.getItem(key);
  try {
    return savedValue ? JSON.parse(savedValue) : defaultValue;
  } catch (error) {
    console.error(`Error parsing sessionStorage for key "${key}"`, error);
    return defaultValue;
  }
};

/**
 * This component is the first page of the "Emergency" flow.
 * Users select one or more emergency services, then provide an address,
 * optional photos, and optional description before continuing.
 */
export default function EmergencyServices() {
  const router = useRouter();

  // Clear sessionStorage on first load to start fresh
  useEffect(() => {
    sessionStorage.clear();
  }, []);

  // States for selected services, expansions, search query, warnings, etc.
  const [selectedServices, setSelectedServices] = useState<Record<string, string[]>>(
    loadFromSession("selectedServices", {})
  );
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>(
    loadFromSession("searchQuery", "")
  );
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // States for address, description, and photos
  const [address, setAddress] = useState<string>(loadFromSession("address", ""));
  const [description, setDescription] = useState<string>(
    loadFromSession("description", "")
  );
  const [photos, setPhotos] = useState<string[]>(loadFromSession("photos", []));

  // Access user location from context (if available)
  const { location } = useLocation();

  // Persist states to sessionStorage whenever they change
  useEffect(() => saveToSession("selectedServices", selectedServices), [selectedServices]);
  useEffect(() => saveToSession("searchQuery", searchQuery), [searchQuery]);
  useEffect(() => saveToSession("address", address), [address]);
  useEffect(() => saveToSession("description", description), [description]);
  useEffect(() => saveToSession("photos", photos), [photos]);

  // Calculate the total number of possible services (for placeholder text)
  const totalServices = Object.values(EMERGENCY_SERVICES).flatMap(
    ({ services }) => Object.keys(services)
  ).length;

  // Expand/collapse category
  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Select/unselect a service
  const handleServiceSelect = (category: string, serviceKey: string) => {
    setSelectedServices((prev) => {
      const current = prev[category] || [];
      const isSelected = current.includes(serviceKey);
      if (!isSelected) {
        setWarningMessage(null); // clear any warnings if newly selected
      }
      return {
        ...prev,
        [category]: isSelected
          ? current.filter((item) => item !== serviceKey)
          : [...current, serviceKey],
      };
    });
  };

  // Clear all selections
  const handleClearSelection = () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear all selected services? This will also collapse all expanded categories."
    );
    if (!confirmed) return;
    setSelectedServices({});
    setExpandedCategories(new Set());
  };

  // "Next" button: must have at least one service + an address
  const handleNextClick = () => {
    if (Object.values(selectedServices).flat().length === 0) {
      setWarningMessage("Please select at least one service before proceeding.");
      return;
    }
    if (!address.trim()) {
      setWarningMessage("Please enter your address before proceeding.");
      return;
    }
    // Everything is OK -> proceed
    router.push("/emergency/details");
  };

  // Update address fields
  const handleAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
  };
  const handleUseMyLocation = () => {
    if (location?.city && location?.zip) {
      setAddress(`${location.city}, ${location.zip}, ${location.country || ""}`);
    } else {
      setWarningMessage("Location data is unavailable. Please enter manually.");
    }
  };

  // Filter the EMERGENCY_SERVICES data based on search query
  const filteredServices: EmergencyServicesType = searchQuery
    ? Object.entries(EMERGENCY_SERVICES).reduce((acc, [category, { services }]) => {
        const matching = Object.entries(services).filter(([serviceKey]) =>
          serviceKey.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (matching.length > 0) {
          acc[category] = { services: Object.fromEntries(matching) };
        }
        return acc;
      }, {} as EmergencyServicesType)
    : EMERGENCY_SERVICES;

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto">
        {/* Breadcrumb navigation */}
        <BreadCrumb items={EMERGENCY_STEPS} />

        {/* Page Title & Next button */}
        <div className="flex justify-between items-start mt-8">
          <SectionBoxTitle>Let's Quickly Find the Help You Need</SectionBoxTitle>
          <Button onClick={handleNextClick}>Next →</Button>
        </div>

        {/* Search field */}
        <div className="flex flex-col gap-4 mt-8 w-full max-w-[600px]">
          <SearchServices
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            placeholder={`Explore ${totalServices} emergency services`}
          />
          <div className="flex justify-between items-center text-sm text-gray-500 mt-2">
            <span>
              No service?{" "}
              <a href="#" className="text-blue-600 hover:underline focus:outline-none">
                Contact emergency support
              </a>
            </span>
            <button
              onClick={handleClearSelection}
              className="text-blue-600 hover:underline focus:outline-none"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Possible warning messages */}
        <div className="h-6 mt-4 text-left">
          {warningMessage && <p className="text-red-500">{warningMessage}</p>}
        </div>

        <div className="container mx-auto relative flex">
          {/* Left section: categories + services */}
          <div className="flex-1">
            <div className="flex flex-col gap-3 mt-5 w-full max-w-[600px]">
              {Object.entries(filteredServices).map(([category, { services }]) => {
                const categorySelectedCount = selectedServices[category]?.length || 0;
                // Make a nicer label if needed
                const categoryLabel = category.replace(/([A-Z])/g, " $1").trim();

                return (
                  <div
                    key={category}
                    className={`p-4 border rounded-xl bg-white ${
                      categorySelectedCount > 0 ? "border-blue-500" : "border-gray-300"
                    }`}
                  >
                    <button
                      onClick={() => toggleCategory(category)}
                      className="flex justify-between items-center w-full"
                    >
                      <h3
                        className={`font-medium text-2xl ${
                          categorySelectedCount > 0 ? "text-blue-600" : "text-black"
                        }`}
                      >
                        {categoryLabel}
                        {categorySelectedCount > 0 && (
                          <span className="text-sm text-gray-500 ml-2">
                            ({categorySelectedCount} selected)
                          </span>
                        )}
                      </h3>
                      <ChevronDown
                        className={`h-5 w-5 transform transition-transform ${
                          expandedCategories.has(category) ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {expandedCategories.has(category) && (
                      <div className="mt-4 flex flex-col gap-3">
                        {Object.entries(services).map(([serviceKey]) => {
                          // Convert key to a readable label
                          const serviceLabel = serviceKey
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())
                            .trim();

                          const isSelected =
                            selectedServices[category]?.includes(serviceKey) || false;

                          return (
                            <div
                              key={serviceKey}
                              className="flex justify-between items-center"
                            >
                              <span
                                className={`text-lg transition-colors duration-300 ${
                                  isSelected ? "text-blue-600" : "text-gray-800"
                                }`}
                              >
                                {serviceLabel}
                              </span>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleServiceSelect(category, serviceKey)}
                                  className="sr-only peer"
                                />
                                <div className="w-[50px] h-[26px] bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors duration-300"></div>
                                <div className="absolute top-[2px] left-[2px] w-[22px] h-[22px] bg-white rounded-full shadow-md peer-checked:translate-x-[24px] transform transition-transform duration-300"></div>
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right section: use the new AddressSection & PhotosAndDescription */}
          <div className="w-1/2 ml-auto mt-4 pt-0">
            {/* Reusable AddressSection */}
            <AddressSection
              address={address}
              onAddressChange={handleAddressChange}
              onUseMyLocation={handleUseMyLocation}
            />

            {/* Reusable PhotosAndDescription */}
            <PhotosAndDescription
              photos={photos}
              description={description}
              onSetPhotos={setPhotos}
              onSetDescription={setDescription}
            />
          </div>
        </div>
      </div>
    </main>
  );
}