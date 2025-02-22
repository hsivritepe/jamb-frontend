"use client";

export const dynamic = "force-dynamic";

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
import { setSessionItem, getSessionItem } from "@/utils/session";
import AddressSection from "@/components/ui/AddressSection";
import PhotosAndDescription from "@/components/ui/PhotosAndDescription";

/**
 * Clears most session storage but preserves auth tokens and profile info.
 */
function clearSessionPreserveAuth() {
  const authToken = sessionStorage.getItem("authToken");
  const profileData = sessionStorage.getItem("profileData");
  sessionStorage.clear();
  if (authToken) sessionStorage.setItem("authToken", authToken);
  if (profileData) sessionStorage.setItem("profileData", profileData);
}

export default function EmergencyServices() {
  const router = useRouter();
  const { location } = useLocation();

  // Clear session (except auth) on mount
  useEffect(() => {
    clearSessionPreserveAuth();
  }, []);

  // Service selection state
  const [selectedServices, setSelectedServices] = useState<Record<string, string[]>>(
    getSessionItem("selectedServices", {})
  );
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>(
    getSessionItem("searchQuery", "")
  );
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Address/Contact info (split into separate states)
  const [address, setAddress] = useState<string>(getSessionItem("address", ""));
  const [city, setCity] = useState<string>(getSessionItem("city", ""));
  const [zip, setZip] = useState<string>(getSessionItem("zip", ""));
  const [stateName, setStateName] = useState<string>(
    getSessionItem("stateName", "")
  );
  const [country, setCountry] = useState<string>(getSessionItem("country", ""));

  // Additional fields
  const [description, setDescription] = useState<string>(
    getSessionItem("description", "")
  );
  const [photos, setPhotos] = useState<string[]>(getSessionItem("photos", []));

  // Persist states in session storage
  useEffect(() => setSessionItem("selectedServices", selectedServices), [selectedServices]);
  useEffect(() => setSessionItem("searchQuery", searchQuery), [searchQuery]);
  useEffect(() => setSessionItem("address", address), [address]);
  useEffect(() => setSessionItem("city", city), [city]);
  useEffect(() => setSessionItem("zip", zip), [zip]);
  useEffect(() => setSessionItem("stateName", stateName), [stateName]);
  useEffect(() => setSessionItem("country", country), [country]);
  useEffect(() => setSessionItem("description", description), [description]);
  useEffect(() => setSessionItem("photos", photos), [photos]);

  // Auto-fill address fields from location context if they're all empty
  useEffect(() => {
    if (
      !address &&
      !city &&
      !zip &&
      !country &&
      location?.city &&
      location?.zip
    ) {
      setAddress(location.city);
      setCity(location.city);
      setZip(location.zip);
      setStateName(location.state || "");
      setCountry(location.country || "");
    }
  }, [address, city, zip, country, location, stateName]);

  // Combine address for convenience
  useEffect(() => {
    const combinedAddress = [address, stateName, zip].filter(Boolean).join(", ");
    setSessionItem("fullAddress", combinedAddress);
  }, [address, stateName, zip]);

  // Count total available emergency services
  const totalServices = Object.values(EMERGENCY_SERVICES)
    .flatMap(({ services }) => Object.keys(services)).length;

  // Expand/collapse category sections
  function toggleCategory(category: string) {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.has(category) ? next.delete(category) : next.add(category);
      return next;
    });
  }

  // Toggle a single service
  function handleServiceSelect(category: string, serviceKey: string) {
    setSelectedServices((prev) => {
      const current = prev[category] || [];
      const isSelected = current.includes(serviceKey);
      if (!isSelected) setWarningMessage(null);
      return {
        ...prev,
        [category]: isSelected
          ? current.filter((item) => item !== serviceKey)
          : [...current, serviceKey],
      };
    });
  }

  // Clear all
  function handleClearSelection() {
    const confirmed = window.confirm(
      "Are you sure you want to clear all selected services? This will also collapse all categories."
    );
    if (!confirmed) return;
    setSelectedServices({});
    setExpandedCategories(new Set());
  }

  // Validate and go next
  function handleNextClick() {
    const anyServiceSelected = Object.values(selectedServices).some(
      (list) => list.length > 0
    );
    if (!anyServiceSelected) {
      setWarningMessage("Please select at least one service before proceeding.");
      return;
    }
    if (!address.trim() || !stateName.trim() || !zip.trim()) {
      setWarningMessage("Please enter your address, state, and ZIP before proceeding.");
      return;
    }
    router.push("/emergency/details");
  }

  // Handlers for address input
  function handleAddressChange(e: ChangeEvent<HTMLInputElement>) {
    setAddress(e.target.value);
  }
  function handleStateChange(e: ChangeEvent<HTMLInputElement>) {
    setStateName(e.target.value);
  }
  function handleZipChange(e: ChangeEvent<HTMLInputElement>) {
    setZip(e.target.value);
  }
  function handleUseMyLocation() {
    if (location?.city && location?.state && location?.zip) {
      setAddress(location.city);
      setCity(location.city);
      setStateName(location.state);
      setZip(location.zip);
      setCountry(location.country || "");
    } else {
      setWarningMessage("Location data is unavailable. Please enter manually.");
    }
  }

  // Filter services by search
  const filteredServices: EmergencyServicesType = searchQuery
    ? Object.entries(EMERGENCY_SERVICES).reduce((acc, [category, { services }]) => {
        const matching = Object.entries(services).filter(([key]) =>
          key.toLowerCase().includes(searchQuery.toLowerCase())
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
        {/* Breadcrumb */}
        <BreadCrumb items={EMERGENCY_STEPS} />
      </div>

      {/* Header */}
      <div className="container mx-auto mt-8">
        <div className="flex flex-col xl:flex-row justify-between items-start gap-2 w-full">
          <SectionBoxTitle className="text-left">
            Let's Quickly Find the Help You Need
          </SectionBoxTitle>
          <div className="self-end xl:self-center">
            <Button onClick={handleNextClick}>Next →</Button>
          </div>
        </div>
      </div>

      {/* Search and Clear */}
      <div className="container w-full xl:w-[600px] mt-6 mb-4">
        <SearchServices
          value={searchQuery}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          placeholder={`Explore ${totalServices} emergency services`}
        />
        <div className="flex justify-between items-center text-sm text-gray-500 mt-2">
          <span>
            No service?{" "}
            <a
              href="#"
              className="text-blue-600 hover:underline focus:outline-none"
            >
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

      {/* Warning */}
      <div className="container mx-auto h-6 mt-4 text-left">
        {warningMessage && <p className="text-red-500">{warningMessage}</p>}
      </div>

      {/* Main layout */}
      <div className="container mx-auto flex flex-col xl:flex-row gap-6 w-full mt-4">
        {/* Categories */}
        <div className="w-full xl:flex-1">
          <div className="flex flex-col gap-3 mt-3 w-full">
            {Object.entries(filteredServices).map(([category, { services }]) => {
              const selectedCount = selectedServices[category]?.length || 0;
              const categoryLabel = category.replace(/([A-Z])/g, " $1").trim();

              return (
                <div
                  key={category}
                  className={`p-4 border rounded-xl bg-white ${
                    selectedCount > 0 ? "border-blue-500" : "border-gray-300"
                  }`}
                >
                  <button
                    onClick={() => toggleCategory(category)}
                    className="flex justify-between items-center w-full"
                  >
                    <h3
                      className={`font-semibold sm:font-medium text-xl sm:text-2xl ${
                        selectedCount > 0 ? "text-blue-600" : "text-black"
                      }`}
                    >
                      {categoryLabel}
                      {selectedCount > 0 && (
                        <span className="text-sm text-gray-500 ml-2">
                          ({selectedCount} selected)
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
                        const serviceLabel = serviceKey
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (char) => char.toUpperCase())
                          .trim();
                        const isSelected =
                          selectedServices[category]?.includes(serviceKey) || false;

                        return (
                          <div
                            key={serviceKey}
                            className="flex justify-between items-center"
                          >
                            <span
                              className={`text-lg ${
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
                              <div className="w-[50px] h-[26px] bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors duration-300" />
                              <div className="absolute top-[2px] left-[2px] w-[22px] h-[22px] bg-white rounded-full shadow-md peer-checked:translate-x-[24px] transform transition-transform duration-300" />
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

        {/* Address and Photos */}
        <div className="w-full xl:w-1/2 flex flex-col gap-6 mt-6 xl:mt-0">
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
    </main>
  );
}