"use client";

// Import necessary modules and components
import { useState, ChangeEvent } from "react";
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

// Main component for Emergency Services
export default function EmergencyServices() {
  const router = useRouter(); // Initialize router for navigation

  // State variables
  const [selectedServices, setSelectedServices] = useState<
    Record<string, string[]>
  >({}); // Stores selected services by category
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  ); // Tracks expanded categories
  const [searchQuery, setSearchQuery] = useState(""); // Tracks the search query
  const [warningMessage, setWarningMessage] = useState<string | null>(null); // Stores warning messages
  const [address, setAddress] = useState<string>(""); // Stores the user's address
  const [description, setDescription] = useState<string>(""); // Stores the problem description

  const { location, setLocation } = useLocation(); // Access user location from the context

  // Calculate total number of services available
  const totalServices = Object.values(EMERGENCY_SERVICES).flatMap(
    ({ services }) => Object.keys(services)
  ).length;

  // Toggle service selection for a given category and service
  const handleServiceSelect = (category: string, service: string) => {
    setSelectedServices((prev) => {
      const currentCategory = prev[category] || [];
      const isSelected = currentCategory.includes(service);

      if (!isSelected) {
        setWarningMessage(null); // Hide warning if any service is selected
      }

      return {
        ...prev,
        [category]: isSelected
          ? currentCategory.filter((item) => item !== service) // Remove service
          : [...currentCategory, service], // Add service
      };
    });
  };

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category); // Collapse category
      } else {
        next.add(category); // Expand category
      }
      return next;
    });
  };

  // Clear all selected services
  const handleClearSelection = () => {
    setSelectedServices({});
  };

  // Handle the "Next" button click
  const handleNextClick = () => {
    if (Object.values(selectedServices).flat().length === 0) {
      setWarningMessage("Please select at least one service before proceeding.");
    } else if (!address.trim()) {
      setWarningMessage("Please enter your address before proceeding.");
    } else {
      // Navigate to the next page with selected services, address, and other details
      router.push(
        `/emergency/details?services=${encodeURIComponent(
          JSON.stringify(selectedServices)
        )}&address=${encodeURIComponent(address)}&photos=${encodeURIComponent(
          JSON.stringify(uploadedPhotos.map((p) => p.url))
        )}&description=${encodeURIComponent(description)}`
      );
    }
  };

  // Handle address input changes
  const handleAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
  };

  // Handle description input changes
  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  // Use the user's current location to fill the address
  const handleUseMyLocation = async () => {
    setAddress(`${location.city}, ${location.zip}, ${location.country || ""}`);
  };

  const [uploadedPhotos, setUploadedPhotos] = useState<
    { file: File; url: string }[]
  >([]); // State for uploaded photos

  // Remove a specific photo from the list
  const handleRemovePhoto = (index: number) => {
    setUploadedPhotos((prev) => {
      const updatedPhotos = [...prev];
      updatedPhotos.splice(index, 1); // Remove photo by index
      return updatedPhotos;
    });
  };

  // Filter services based on the search query
  const filteredServices: EmergencyServicesType = searchQuery
    ? Object.entries(EMERGENCY_SERVICES).reduce(
        (acc, [category, { services }]) => {
          const matchingServices = Object.entries(services).filter(
            ([serviceKey]) =>
              serviceKey.toLowerCase().includes(searchQuery.toLowerCase()) // Match services with the query
          );
          if (matchingServices.length > 0) {
            acc[category] = { services: Object.fromEntries(matchingServices) }; // Add matching services to the filtered list
          }
          return acc;
        },
        {} as EmergencyServicesType
      )
    : EMERGENCY_SERVICES;

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto">
        <BreadCrumb items={EMERGENCY_STEPS} /> {/* Breadcrumb navigation */}

        {/* Title and Next button */}
        <div className="flex justify-between items-start mt-8">
          <SectionBoxTitle>
            Let's Quickly Find the Help You Need
          </SectionBoxTitle>
          <Button onClick={handleNextClick}>Next →</Button> {/* Navigate to the next page */}
        </div>

        {/* Search and Clear */}
        <div className="flex flex-col gap-4 mt-8 w-full max-w-[600px]">
          <SearchServices
            value={searchQuery} // Search query value
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value) // Update search query
            }
            placeholder={`Explore ${totalServices} emergency services`} // Placeholder with the total number of services
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
              onClick={handleClearSelection} // Clear all selections
              className="text-blue-600 hover:underline focus:outline-none"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Warning Message */}
        <div className="h-6 mt-4 text-left">
          {warningMessage && <p className="text-red-500">{warningMessage}</p>}
        </div>

        <div className="container mx-auto relative flex">
          {/* Left Section */}
          <div className="flex-1">
            {/* Emergency Services List */}
            <div className="flex flex-col gap-3 mt-5 w-full max-w-[600px]">
              {Object.entries(filteredServices).map(
                ([category, { services }]) => {
                  const categorySelectedCount =
                    selectedServices[category]?.length || 0; // Count selected services in the category
                  const categoryLabel = category
                    .replace(/([A-Z])/g, " $1")
                    .trim(); // Format category label

                  return (
                    <div
                      key={category}
                      className={`p-4 border rounded-xl bg-white ${
                        categorySelectedCount > 0
                          ? "border-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      {/* Category Toggle */}
                      <button
                        onClick={() => toggleCategory(category)} // Toggle category expansion
                        className="flex justify-between items-center w-full"
                      >
                        <h3
                          className={`font-medium text-2xl ${
                            categorySelectedCount > 0
                              ? "text-blue-600"
                              : "text-black"
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

                      {/* List of Services */}
                      {expandedCategories.has(category) && (
                        <div className="mt-4 flex flex-col gap-3">
                          {Object.entries(services).map(([serviceKey]) => {
                            const isSelected =
                              selectedServices[category]?.includes(
                                serviceKey
                              ) || false; // Check if the service is selected
                            const serviceLabel = serviceKey
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())
                              .trim(); // Format service label

                            return (
                              <div
                                key={serviceKey}
                                className="flex justify-between items-center"
                              >
                                <span
                                  className={`text-lg transition-colors duration-300 ${
                                    isSelected
                                      ? "text-blue-600"
                                      : "text-gray-800"
                                  }`}
                                >
                                  {serviceLabel}
                                </span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={isSelected} // Set checkbox state
                                    onChange={() =>
                                      handleServiceSelect(category, serviceKey) // Select or deselect service
                                    }
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
                }
              )}
            </div>
          </div>

          {/* Right Section */}
          <div className="w-1/2 ml-auto mt-4 pt-0">
            {/* Address Section */}
            <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden mb-6">
              <h2 className="text-2xl font-medium text-gray-800 mb-4">
                We Need Your Address
              </h2>
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  value={address} // Address input value
                  onChange={handleAddressChange} // Update address state
                  onFocus={(e) => (e.target.placeholder = "")} // Clear placeholder on focus
                  onBlur={(e) =>
                    (e.target.placeholder = "Enter your address")
                  } // Reset placeholder on blur
                  placeholder="Enter your address"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleUseMyLocation} // Use current location as address
                  className="text-blue-600 text-left"
                >
                  Use my location
                </button>
              </div>
            </div>

            {/* Problem Description Section */}
            <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden">
              <h2 className="text-2xl font-medium text-gray-800 mb-4">
                Upload Photos & Description
              </h2>
              <div className="flex flex-col gap-4">
                {/* File Upload */}
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
                    accept="image/*" // Accept only image files
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []); // Convert FileList to array
                      if (
                        files.length > 12 ||
                        uploadedPhotos.length + files.length > 12
                      ) {
                        alert("You can upload up to 12 photos total."); // Show error if more than 12 photos
                        e.target.value = ""; // Reset the input
                        return;
                      }
                      const filePreviews = files.map((file) => ({
                        file,
                        url: URL.createObjectURL(file), // Create a URL for the uploaded file
                      }));
                      setUploadedPhotos((prev) => [...prev, ...filePreviews]); // Update state with new photos
                    }}
                    className="hidden"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Maximum 12 images. Supported formats: JPG, PNG.
                  </p>

                  {/* Preview Section */}
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    {uploadedPhotos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={photo.url} // Show preview of uploaded photo
                          alt={`Uploaded preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md border border-gray-300"
                        />
                        <button
                          onClick={() => handleRemovePhoto(index)} // Remove the photo
                          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remove photo"
                        >
                          <span className="text-sm">✕</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Problem Description */}
                <div>
                  <textarea
                    id="problem-description"
                    rows={5} // Set textarea rows
                    value={description} // Problem description value
                    onChange={handleDescriptionChange} // Update description state
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