"use client";

import { useState, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import BreadCrumb from "@/components/ui/BreadCrumb";
import SearchServices from "@/components/SearchServices";
import Button from "@/components/ui/Button";
import { CALCULATE_STEPS } from "@/constants/navigation";
import { SectionBoxTitle } from "@/components/ui/SectionBoxTitle";
import { ChevronDown } from "lucide-react";
import { useLocation } from "@/context/LocationContext";
import { ALL_CATEGORIES } from "@/constants/categories";

// Helper functions for session storage
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

export default function Services() {
  const router = useRouter();
  const { location } = useLocation();

  // Load the previously chosen sections from the previous page
  // The user previously selected certain categories (sections) on the previous screen.
  // Now we will show only those sections and let the user pick specific services within them.
  const selectedSections: string[] = loadFromSession("services_selectedSections", []);

  // Load search query from session
  const [searchQuery, setSearchQuery] = useState<string>(
    loadFromSession("services_searchQuery", "")
  );

  // Load address, description, photos from session
  const [address, setAddress] = useState<string>(loadFromSession("address", ""));
  const [description, setDescription] = useState<string>(loadFromSession("description", ""));
  const [photos, setPhotos] = useState<string[]>(loadFromSession("photos", []));

  // Warnings
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Expanded categories for UI
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Map all categories from ALL_CATEGORIES by their section
  // This allows us to find which services belong to the chosen sections
  const categoryMap: Record<string, string[]> = {};
  ALL_CATEGORIES.forEach((cat) => {
    const section = cat.section;
    if (!categoryMap[section]) {
      categoryMap[section] = [];
    }
    categoryMap[section].push(cat.title);
  });

  // Initially, no services are selected. The user must now pick from the chosen categories.
  const [selectedServices, setSelectedServices] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    selectedSections.forEach((section) => {
      // Start with no preselected services
      initial[section] = [];
    });
    return initial;
  });

  // Save changes to session storage
  useEffect(() => saveToSession("services_searchQuery", searchQuery), [searchQuery]);
  useEffect(() => saveToSession("address", address), [address]);
  useEffect(() => saveToSession("description", description), [description]);
  useEffect(() => saveToSession("photos", photos), [photos]);
  useEffect(() => saveToSession("selectedServices", selectedServices), [selectedServices]);

  // Filter chosen sections and their services by search query
  const filteredSelectedServices = Object.entries(selectedServices).reduce(
    (acc, [category, servicesArr]) => {
      // Find all available services for this category
      const allServices = categoryMap[category] || [];
      // Filter by search query
      const filtered = allServices.filter((service) =>
        service.toLowerCase().includes(searchQuery.toLowerCase())
      );
      acc[category] = filtered;
      return acc;
    },
    {} as Record<string, string[]>
  );

  // Handle toggling a category's expanded state
  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.has(category) ? next.delete(category) : next.add(category);
      return next;
    });
  };

  // Handle selecting/deselecting a service
  const handleServiceSelect = (category: string, service: string) => {
    setSelectedServices((prev) => {
      const current = prev[category] || [];
      const isSelected = current.includes(service);
      if (!isSelected) setWarningMessage(null);
      return {
        ...prev,
        [category]: isSelected ? current.filter((s) => s !== service) : [...current, service],
      };
    });
  };

  // Clear all chosen services
  const handleClearSelection = () => {
    const cleared: Record<string, string[]> = {};
    selectedSections.forEach((section) => {
      cleared[section] = [];
    });
    setSelectedServices(cleared);
  };

  // Move to the next step
  const handleNext = () => {
    const totalChosen = Object.values(selectedServices).flat().length;
    if (totalChosen === 0) {
      setWarningMessage("Please select at least one service before proceeding.");
      return;
    }
    if (!address.trim()) {
      setWarningMessage("Please enter your address before proceeding.");
      return;
    }
    router.push("/calculate/details");
  };

  const handleAddressChange = (e: ChangeEvent<HTMLInputElement>) => setAddress(e.target.value);
  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) =>
    setDescription(e.target.value);

  const handleUseMyLocation = () => {
    if (location?.city && location?.zip) {
      setAddress(`${location.city}, ${location.zip}, ${location.country || ""}`);
    } else {
      setWarningMessage("Location data is unavailable. Please enter manually.");
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const totalChosen = Object.values(selectedServices).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto">
        {/* Breadcrumb */}
        <BreadCrumb items={CALCULATE_STEPS} />

        {/* Header and Next Button */}
        <div className="flex justify-between items-start mt-8">
          <SectionBoxTitle>Select Your Services</SectionBoxTitle>
          <Button onClick={handleNext}>Next →</Button>
        </div>

        {/* Search and Clear */}
        <div className="flex flex-col gap-4 mt-8 w-full max-w-[600px]">
          <SearchServices
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            placeholder="Search within your chosen categories..."
          />
          <div className="flex justify-between items-center text-sm text-gray-500 mt-2">
            <span>
              No service?{" "}
              <a href="#" className="text-blue-600 hover:underline focus:outline-none">
                Contact support
              </a>
            </span>
            <button
              onClick={handleClearSelection}
              className="text-blue-600 hover:underline focus:outline-none"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Warning Message */}
        <div className="h-6 mt-4 text-left">
          {warningMessage && <p className="text-red-500">{warningMessage}</p>}
        </div>

        <div className="flex container mx-auto relative">
          {/* Left Section: Show only chosen sections */}
          <div className="flex-1">
            <div className="flex flex-col gap-3 mt-5 w-full max-w-[600px]">
              {selectedSections.map((category) => {
                const allServicesForCategory = filteredSelectedServices[category] || [];
                const selectedCount = (selectedServices[category] || []).length;

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
                        className={`font-medium text-2xl ${
                          selectedCount > 0 ? "text-blue-600" : "text-black"
                        }`}
                      >
                        {category}
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
                        {allServicesForCategory.map((service) => {
                          const isSelected = selectedServices[category]?.includes(service) || false;
                          return (
                            <div key={service} className="flex justify-between items-center">
                              <span
                                className={`text-lg transition-colors duration-300 ${
                                  isSelected ? "text-blue-600" : "text-gray-800"
                                }`}
                              >
                                {service}
                              </span>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleServiceSelect(category, service)}
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
              <h2 className="text-2xl font-medium text-gray-800 mb-4">We Need Your Address</h2>
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
                <button onClick={handleUseMyLocation} className="text-blue-600 text-left">
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
                      if (files.length > 12 || photos.length + files.length > 12) {
                        alert("You can upload up to 12 photos total.");
                        e.target.value = "";
                        return;
                      }
                      const fileUrls = files.map((file) => URL.createObjectURL(file));
                      setPhotos((prev) => [...prev, ...fileUrls]);
                    }}
                    className="hidden"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Maximum 12 images. Supported formats: JPG, PNG.
                  </p>

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