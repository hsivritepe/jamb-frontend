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

// New imports from your session utils
import {
  setSessionItem,
  getSessionItem,
  clearSession,
} from "@/utils/session";

import AddressSection from "@/components/ui/AddressSection";
import PhotosAndDescription from "@/components/ui/PhotosAndDescription";

/**
 * EmergencyServices is the first step in the "Emergency" flow.
 * The user selects one or more services, enters address details,
 * optionally uploads photos, and provides a short description
 * before continuing to the next page.
 */
export default function EmergencyServices() {
  const router = useRouter();
  const { location } = useLocation();

  /**
   * Clear session data on initial render to ensure a fresh start.
   * Remove if you want to preserve data across visits.
   */
  useEffect(() => {
    clearSession();
  }, []);

  /**
   * State for selected services, expanded categories, search query, warnings, etc.
   */
  const [selectedServices, setSelectedServices] = useState<Record<string, string[]>>(
    getSessionItem("selectedServices", {})
  );
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>(
    getSessionItem("searchQuery", "")
  );
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  /**
   * Address section states: address, stateName, zip
   */
  const [address, setAddress] = useState<string>(getSessionItem("address", ""));
  const [zip, setZip] = useState<string>(getSessionItem("zip", ""));
  const [stateName, setStateName] = useState<string>(
    getSessionItem("stateName", "")
  );

  /**
   * Description and photos (both optional)
   */
  const [description, setDescription] = useState<string>(
    getSessionItem("description", "")
  );
  const [photos, setPhotos] = useState<string[]>(getSessionItem("photos", []));

  /**
   * Keep these states in sync with session storage whenever they change
   */
  useEffect(() => {
    setSessionItem("selectedServices", selectedServices);
  }, [selectedServices]);

  useEffect(() => {
    setSessionItem("searchQuery", searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    setSessionItem("address", address);
  }, [address]);

  useEffect(() => {
    setSessionItem("zip", zip);
  }, [zip]);

  useEffect(() => {
    setSessionItem("stateName", stateName);
  }, [stateName]);

  useEffect(() => {
    setSessionItem("description", description);
  }, [description]);

  useEffect(() => {
    setSessionItem("photos", photos);
  }, [photos]);

  /**
   * Combine address, stateName, and zip into a single "fullAddress" in session
   * This is optional.
   */
  useEffect(() => {
    const combinedAddress = [address, stateName, zip].filter(Boolean).join(", ");
    setSessionItem("fullAddress", combinedAddress);
  }, [address, stateName, zip]);

  /**
   * Count total number of possible emergency services for the search placeholder
   */
  const totalServices = Object.values(EMERGENCY_SERVICES).flatMap(
    ({ services }) => Object.keys(services)
  ).length;

  /**
   * Expand or collapse a category in the UI
   */
  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.has(category) ? next.delete(category) : next.add(category);
      return next;
    });
  };

  /**
   * Toggle a service within a category as selected or unselected
   * Clear the warning if the user selects a new service
   */
  const handleServiceSelect = (category: string, serviceKey: string) => {
    setSelectedServices((prev) => {
      const current = prev[category] || [];
      const isSelected = current.includes(serviceKey);

      if (!isSelected) {
        setWarningMessage(null);
      }

      return {
        ...prev,
        [category]: isSelected
          ? current.filter((item) => item !== serviceKey)
          : [...current, serviceKey],
      };
    });
  };

  /**
   * Clear all selected services and collapse all categories
   */
  const handleClearSelection = () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear all selected services? This will also collapse all categories."
    );
    if (!confirmed) return;

    setSelectedServices({});
    setExpandedCategories(new Set());
  };

  /**
   * On "Next", ensure at least one service is selected,
   * and that address/stateName/zip are non-empty
   */
  const handleNextClick = () => {
    const anyServiceSelected = Object.values(selectedServices).some(
      (list) => list.length > 0
    );
    if (!anyServiceSelected) {
      setWarningMessage("Please select at least one service before proceeding.");
      return;
    }
    if (!address.trim() || !stateName.trim() || !zip.trim()) {
      setWarningMessage("Please enter your address, state, and zip before proceeding.");
      return;
    }
    router.push("/emergency/details");
  };

  /**
   * Handlers for updating address, stateName, and zip
   */
  const handleAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
  };
  const handleStateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setStateName(e.target.value);
  };
  const handleZipChange = (e: ChangeEvent<HTMLInputElement>) => {
    setZip(e.target.value);
  };

  /**
   * Use location context to fill address fields if available
   * You could combine city + state + zip into a single address, if preferred
   */
  const handleUseMyLocation = () => {
    if (location?.city && location?.state && location?.zip) {
      setAddress(location.city);
      setStateName(location.state);
      setZip(location.zip);
    } else {
      setWarningMessage("Location data is unavailable. Please enter manually.");
    }
  };

  /**
   * Filter EMERGENCY_SERVICES by the current search query
   */
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
        {/* Breadcrumb navigation for the multi-step Emergency flow */}
        <BreadCrumb items={EMERGENCY_STEPS} />

        {/* Top row: page title + Next button */}
        <div className="flex justify-between items-start mt-8">
          <SectionBoxTitle>Let's Quickly Find the Help You Need</SectionBoxTitle>
          <Button onClick={handleNextClick}>Next →</Button>
        </div>

        {/* Search bar + Clear button */}
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

        {/* Warning message */}
        <div className="h-6 mt-4 text-left">
          {warningMessage && <p className="text-red-500">{warningMessage}</p>}
        </div>

        {/* Main content row: left = services, right = address + photos + description */}
        <div className="container mx-auto relative flex">
          {/* LEFT side: categories + services */}
          <div className="flex-1">
            <div className="flex flex-col gap-3 mt-5 w-full max-w-[600px]">
              {Object.entries(filteredServices).map(([category, { services }]) => {
                const categorySelectedCount = selectedServices[category]?.length || 0;
                // Basic transform for the category label
                const categoryLabel = category.replace(/([A-Z])/g, " $1").trim();

                return (
                  <div
                    key={category}
                    className={`p-4 border rounded-xl bg-white ${
                      categorySelectedCount > 0 ? "border-blue-500" : "border-gray-300"
                    }`}
                  >
                    {/* Expand/collapse heading */}
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

                    {/* If expanded => show list of services */}
                    {expandedCategories.has(category) && (
                      <div className="mt-4 flex flex-col gap-3">
                        {Object.entries(services).map(([serviceKey]) => {
                          // Basic transform for the service label
                          const serviceLabel = serviceKey
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (char) => char.toUpperCase())
                            .trim();

                          const isSelected = selectedServices[category]?.includes(serviceKey) || false;

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

          {/* RIGHT side: address, photos, description */}
          <div className="w-1/2 ml-auto mt-4 pt-0">
            <AddressSection
              address={address}
              onAddressChange={handleAddressChange}
              zip={zip}
              onZipChange={handleZipChange}
              stateName={stateName}
              onStateChange={handleStateChange}
              onUseMyLocation={handleUseMyLocation}
            />

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