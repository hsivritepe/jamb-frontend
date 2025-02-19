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
import {
  setSessionItem,
  getSessionItem,
} from "@/utils/session";

import AddressSection from "@/components/ui/AddressSection";
import PhotosAndDescription from "@/components/ui/PhotosAndDescription";

/**
 * clearSessionPreserveAuth will clear most session storage except "authToken" and "profileData".
 * This is used to reset the user's in-progress emergency data, while keeping them logged in if applicable.
 */
function clearSessionPreserveAuth() {
  const authToken = sessionStorage.getItem("authToken");
  const profileData = sessionStorage.getItem("profileData");
  sessionStorage.clear();
  if (authToken) sessionStorage.setItem("authToken", authToken);
  if (profileData) sessionStorage.setItem("profileData", profileData);
}

/**
 * The EmergencyServices page allows the user to select categories of emergency services
 * and provide their address, photos, and description.
 */
export default function EmergencyServices() {
  const router = useRouter();
  const { location } = useLocation();

  // On mount, clear the session except auth, so we start fresh
  useEffect(() => {
    clearSessionPreserveAuth();
  }, []);

  // Selected services are stored in a structure: { [categoryName]: [serviceKey, ...] }
  const [selectedServices, setSelectedServices] = useState<Record<string, string[]>>(
    getSessionItem("selectedServices", {})
  );
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>(
    getSessionItem("searchQuery", "")
  );
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Address-related states
  const [address, setAddress] = useState<string>(getSessionItem("address", ""));
  const [zip, setZip] = useState<string>(getSessionItem("zip", ""));
  const [stateName, setStateName] = useState<string>(
    getSessionItem("stateName", "")
  );

  // Additional fields
  const [description, setDescription] = useState<string>(
    getSessionItem("description", "")
  );
  const [photos, setPhotos] = useState<string[]>(getSessionItem("photos", []));

  // Whenever these states change, store them in session
  useEffect(() => setSessionItem("selectedServices", selectedServices), [selectedServices]);
  useEffect(() => setSessionItem("searchQuery", searchQuery), [searchQuery]);
  useEffect(() => setSessionItem("address", address), [address]);
  useEffect(() => setSessionItem("zip", zip), [zip]);
  useEffect(() => setSessionItem("stateName", stateName), [stateName]);
  useEffect(() => setSessionItem("description", description), [description]);
  useEffect(() => setSessionItem("photos", photos), [photos]);

  // Keep a combined "fullAddress" so we can pass it along
  useEffect(() => {
    const combinedAddress = [address, stateName, zip].filter(Boolean).join(", ");
    setSessionItem("fullAddress", combinedAddress);
  }, [address, stateName, zip]);

  // Determine how many total emergency services exist
  const totalServices = Object.values(EMERGENCY_SERVICES).flatMap(({ services }) => 
    Object.keys(services)
  ).length;

  // Toggling a category's expansion
  function toggleCategory(category: string) {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.has(category) ? next.delete(category) : next.add(category);
      return next;
    });
  }

  // Selecting or unselecting a single service
  function handleServiceSelect(category: string, serviceKey: string) {
    setSelectedServices((prev) => {
      const current = prev[category] || [];
      const isSelected = current.includes(serviceKey);
      if (!isSelected) setWarningMessage(null); // clear any warning
      return {
        ...prev,
        [category]: isSelected
          ? current.filter((item) => item !== serviceKey)
          : [...current, serviceKey],
      };
    });
  }

  // Clear all selected services
  function handleClearSelection() {
    const confirmed = window.confirm(
      "Are you sure you want to clear all selected services? This will also collapse all categories."
    );
    if (!confirmed) return;
    setSelectedServices({});
    setExpandedCategories(new Set());
  }

  // Pressing "Next" => need at least one service, and address + state + zip
  function handleNextClick() {
    const anyServiceSelected = Object.values(selectedServices).some((list) => list.length > 0);
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

  // Handling location autofill
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
      setStateName(location.state);
      setZip(location.zip);
    } else {
      setWarningMessage("Location data is unavailable. Please enter manually.");
    }
  }

  // Filtered services by search query
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
        {/* Breadcrumb for Emergency steps */}
        <BreadCrumb items={EMERGENCY_STEPS} />
      </div>

      {/* Title and Next button */}
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

      {/* Search bar and Clear button */}
      <div className="container w-full xl:w-[600px] mt-6 mb-4">
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

      {/* Warning messages */}
      <div className="container mx-auto h-6 mt-4 text-left">
        {warningMessage && <p className="text-red-500">{warningMessage}</p>}
      </div>

      {/* Main content => Categories on the left, Address/Photos on the right */}
      <div className="container mx-auto flex flex-col xl:flex-row gap-6 w-full mt-4">
        {/* LEFT: categories */}
        <div className="w-full xl:flex-1">
          <div className="flex flex-col gap-3 mt-3 w-full">
            {Object.entries(filteredServices).map(([category, { services }]) => {
              const categorySelectedCount = selectedServices[category]?.length || 0;
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
                      className={`font-semibold sm:font-medium text-xl sm:text-2xl text-left ${
                        categorySelectedCount > 0 ? "text-blue-600" : "text-black"
                      }`}
                    >
                      {categoryLabel}
                      {categorySelectedCount > 0 && (
                        <span className="text-sm text-gray-500 ml-2">
                          ({categorySelectedCount}
                          <span className="hidden sm:inline"> selected</span>)
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
                          <div key={serviceKey} className="flex justify-between items-center">
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

        {/* RIGHT: address / photos / description */}
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