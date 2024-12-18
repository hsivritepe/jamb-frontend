"use client";

import { useState, ChangeEvent, useEffect } from "react";
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

// Helper functions for saving and loading data from sessionStorage
// These functions allow us to persist state between page navigations
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

// Main component for the Emergency Services page
// This is the first page of the user flow
export default function EmergencyServices() {
  const router = useRouter();

  // Clear sessionStorage on the initial load of the first page
  // This ensures a fresh start every time the user lands here
  useEffect(() => {
    sessionStorage.clear();
  }, []);

  // State variables with data loaded from sessionStorage (if available)
  // selectedServices: Which services and categories user has chosen
  const [selectedServices, setSelectedServices] = useState<Record<string, string[]>>(
    loadFromSession("selectedServices", {})
  );
  
  // expandedCategories: For toggling visibility of services under each category
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  // searchQuery: User's search term for filtering services
  const [searchQuery, setSearchQuery] = useState<string>(
    loadFromSession("searchQuery", "")
  );
  
  // warningMessage: Displays an error or warning if required fields are missing
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  
  // address: The user's input address where services are needed
  const [address, setAddress] = useState<string>(
    loadFromSession("address", "")
  );
  
  // description: The user's optional problem description
  const [description, setDescription] = useState<string>(
    loadFromSession("description", "")
  );
  
  // photos: Array of photo URLs uploaded by the user
  // Storing only URLs for simplicity
  const [photos, setPhotos] = useState<string[]>(loadFromSession("photos", []));

  // Access user's location from context if available
  const { location } = useLocation();

  // Save changes to state in sessionStorage so data persists between pages
  useEffect(() => saveToSession("selectedServices", selectedServices), [selectedServices]);
  useEffect(() => saveToSession("searchQuery", searchQuery), [searchQuery]);
  useEffect(() => saveToSession("address", address), [address]);
  useEffect(() => saveToSession("description", description), [description]);
  useEffect(() => saveToSession("photos", photos), [photos]);

  // Calculate the total number of available services
  const totalServices = Object.values(EMERGENCY_SERVICES).flatMap(
    ({ services }) => Object.keys(services)
  ).length;

  // Handle toggling a service selection within a category
  const handleServiceSelect = (category: string, service: string) => {
    setSelectedServices((prev) => {
      const currentCategory = prev[category] || [];
      const isSelected = currentCategory.includes(service);

      if (!isSelected) setWarningMessage(null); // Clear warning if a service is selected

      return {
        ...prev,
        [category]: isSelected
          ? currentCategory.filter((item) => item !== service)
          : [...currentCategory, service],
      };
    });
  };

  // Handle toggling a category's expanded state
  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.has(category) ? next.delete(category) : next.add(category);
      return next;
    });
  };

  // Clear all selections
  const handleClearSelection = () => setSelectedServices({});

  // Move to the next page of the user flow
  const handleNextClick = () => {
    // Ensure at least one service is selected
    if (Object.values(selectedServices).flat().length === 0) {
      setWarningMessage("Please select at least one service before proceeding.");
    } 
    // Ensure an address is entered
    else if (!address.trim()) {
      setWarningMessage("Please enter your address before proceeding.");
    } 
    // If everything is fine, navigate to the next page (details)
    else {
      router.push("/emergency/details");
    }
  };

  // Update address state when user types into the address field
  const handleAddressChange = (e: ChangeEvent<HTMLInputElement>) =>
    setAddress(e.target.value);

  // Update description state when user types into the description textarea
  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) =>
    setDescription(e.target.value);

  // Attempt to use user's current location for address
  const handleUseMyLocation = () => {
    if (location?.city && location?.zip) {
      setAddress(`${location.city}, ${location.zip}, ${location.country || ""}`);
    } else {
      setWarningMessage("Location data is unavailable. Please enter manually.");
    }
  };

  // Remove a photo by index
  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Filter services based on search query
  const filteredServices: EmergencyServicesType = searchQuery
    ? Object.entries(EMERGENCY_SERVICES).reduce(
        (acc, [category, { services }]) => {
          const matchingServices = Object.entries(services).filter(([serviceKey]) =>
            serviceKey.toLowerCase().includes(searchQuery.toLowerCase())
          );
          if (matchingServices.length > 0) {
            acc[category] = { services: Object.fromEntries(matchingServices) };
          }
          return acc;
        },
        {} as EmergencyServicesType
      )
    : EMERGENCY_SERVICES;

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto">
        {/* Breadcrumb navigation at the top */}
        <BreadCrumb items={EMERGENCY_STEPS} />
        
        {/* Page Title and Next Button */}
        <div className="flex justify-between items-start mt-8">
          <SectionBoxTitle>
            Let's Quickly Find the Help You Need
          </SectionBoxTitle>
          <Button onClick={handleNextClick}>Next →</Button>
        </div>

        {/* Search field and Clear option */}
        <div className="flex flex-col gap-4 mt-8 w-full max-w-[600px]">
          <SearchServices
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
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

        {/* Warning message display */}
        <div className="h-6 mt-4 text-left">
          {warningMessage && <p className="text-red-500">{warningMessage}</p>}
        </div>

        <div className="container mx-auto relative flex">
          {/* Left Section: Displaying categories and services */}
          <div className="flex-1">
            <div className="flex flex-col gap-3 mt-5 w-full max-w-[600px]">
              {Object.entries(filteredServices).map(([category, { services }]) => {
                const categorySelectedCount = selectedServices[category]?.length || 0;
                const categoryLabel = category
                  .replace(/([A-Z])/g, " $1")
                  .trim();

                return (
                  <div
                    key={category}
                    className={`p-4 border rounded-xl bg-white ${
                      categorySelectedCount > 0 ? "border-blue-500" : "border-gray-300"
                    }`}
                  >
                    {/* Category header with expand/collapse functionality */}
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

                    {/* Show services if category is expanded */}
                    {expandedCategories.has(category) && (
                      <div className="mt-4 flex flex-col gap-3">
                        {Object.entries(services).map(([serviceKey]) => {
                          const isSelected =
                            selectedServices[category]?.includes(serviceKey) || false;
                          const serviceLabel = serviceKey
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())
                            .trim();

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

          {/* Right Section: Address and Photos/Description input */}
          <div className="w-1/2 ml-auto mt-4 pt-0">
            {/* Address Section */}
            <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden mb-6">
              <h2 className="text-2xl font-medium text-gray-800 mb-4">
                We Need Your Address
              </h2>
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  value={address}
                  onChange={handleAddressChange}
                  onFocus={(e) => (e.target.placeholder = "")}
                  onBlur={(e) => (e.target.placeholder = "Enter your address")}
                  placeholder="Enter your address"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleUseMyLocation}
                  className="text-blue-600 text-left"
                >
                  Use my location
                </button>
              </div>
            </div>

            {/* Photos & Description Section */}
            <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden">
              <h2 className="text-2xl font-medium text-gray-800 mb-4">
                Upload Photos & Description
              </h2>
              <div className="flex flex-col gap-4">
                <div>
                  {/* File upload button */}
                  <label
                    htmlFor="photo-upload"
                    className="block w-full px-4 py-2 text-center bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    Choose Files
                  </label>
                  <input
                    type="file"
                    id="photo-upload"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      // Limit to a maximum of 12 photos total
                      if (files.length > 12 || photos.length + files.length > 12) {
                        alert("You can upload up to 12 photos total.");
                        e.target.value = "";
                        return;
                      }
                      // Convert files to object URLs
                      const fileUrls = files.map((file) =>
                        URL.createObjectURL(file)
                      );
                      setPhotos((prev) => [...prev, ...fileUrls]);
                    }}
                    className="hidden"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Maximum 12 images. Supported formats: JPG, PNG.
                  </p>

                  {/* Photo previews */}
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={photo}
                          alt={`Uploaded preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md border border-gray-300"
                        />
                        <button
                          onClick={() => handleRemovePhoto(index)}
                          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remove photo"
                        >
                          <span className="text-sm">✕</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description textarea */}
                <div>
                  <textarea
                    id="problem-description"
                    rows={5}
                    value={description}
                    onChange={handleDescriptionChange}
                    placeholder="Please, describe us your problem (optional)..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}