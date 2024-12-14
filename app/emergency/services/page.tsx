"use client";

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

export default function EmergencyServices() {
  const router = useRouter();

  const [selectedServices, setSelectedServices] = useState<
    Record<string, string[]>
  >({});
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [address, setAddress] = useState<string>("");

  const { location, setLocation } = useLocation();

  const totalServices = Object.values(EMERGENCY_SERVICES).flatMap(
    ({ services }) => Object.keys(services)
  ).length;

  const handleServiceSelect = (category: string, service: string) => {
    setSelectedServices((prev) => {
      const currentCategory = prev[category] || [];
      const isSelected = currentCategory.includes(service);

      if (!isSelected) {
        setWarningMessage(null); // Скрываем предупреждение
      }

      return {
        ...prev,
        [category]: isSelected
          ? currentCategory.filter((item) => item !== service)
          : [...currentCategory, service],
      };
    });
  };

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

  const handleClearSelection = () => {
    setSelectedServices({});
  };

  const handleNextClick = () => {
    if (Object.values(selectedServices).flat().length === 0) {
      setWarningMessage("Please select at least one service before proceeding.");
    } else if (!address.trim()) {
      setWarningMessage("Please enter your address before proceeding.");
    } else {
      router.push(
        `/emergency/details?services=${encodeURIComponent(
          JSON.stringify(selectedServices)
        )}&address=${encodeURIComponent(address)}&photos=${encodeURIComponent(
          JSON.stringify(uploadedPhotos.map((p) => p.url))
        )}`
      );
    }
  };

  const handleAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
  };

  const handleUseMyLocation = async () => {
    setAddress(`${location.city}, ${location.zip}, ${location.country || ""}`);
  };

  const [uploadedPhotos, setUploadedPhotos] = useState<
    { file: File; url: string }[]
  >([]);

  const handleRemovePhoto = (index: number) => {
    setUploadedPhotos((prev) => {
      const updatedPhotos = [...prev];
      updatedPhotos.splice(index, 1); // Удаляем фото из массива
      return updatedPhotos;
    });
  };

  const filteredServices: EmergencyServicesType = searchQuery
    ? Object.entries(EMERGENCY_SERVICES).reduce(
        (acc, [category, { services }]) => {
          const matchingServices = Object.entries(services).filter(
            ([serviceKey]) =>
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
        <BreadCrumb items={EMERGENCY_STEPS} />

        {/* Title and Next button */}
        <div className="flex justify-between items-start mt-8">
          <SectionBoxTitle>
            Let's Quickly Find the Help You Need
          </SectionBoxTitle>
          <Button onClick={handleNextClick}>Next →</Button>
        </div>

        {/* Search and Clear */}
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
                    selectedServices[category]?.length || 0;
                  const categoryLabel = category
                    .replace(/([A-Z])/g, " $1")
                    .trim();

                  return (
                    <div
                      key={category}
                      className={`p-4 border rounded-xl bg-white ${
                        categorySelectedCount > 0
                          ? "border-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      <button
                        onClick={() => toggleCategory(category)}
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

                      {expandedCategories.has(category) && (
                        <div className="mt-4 flex flex-col gap-3">
                          {Object.entries(services).map(([serviceKey]) => {
                            const isSelected =
                              selectedServices[category]?.includes(
                                serviceKey
                              ) || false;
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
                                    checked={isSelected}
                                    onChange={() =>
                                      handleServiceSelect(category, serviceKey)
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
            <div className="max-w-[500px] ml-auto bg-blue-100 p-4 rounded-lg border border-gray-300 overflow-hidden mb-6">
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

            {/* Problem Description Section */}
            <div className="max-w-[500px] ml-auto bg-blue-100 p-4 rounded-lg border border-gray-300 overflow-hidden">
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
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (
                        files.length > 12 ||
                        uploadedPhotos.length + files.length > 12
                      ) {
                        alert("You can upload up to 12 photos total.");
                        e.target.value = ""; // Reset the input
                        return;
                      }
                      const filePreviews = files.map((file) => ({
                        file,
                        url: URL.createObjectURL(file),
                      }));
                      setUploadedPhotos((prev) => [...prev, ...filePreviews]);
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
                          src={photo.url}
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

                {/* Problem Description */}
                <div>
                  <textarea
                    id="problem-description"
                    rows={5}
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
