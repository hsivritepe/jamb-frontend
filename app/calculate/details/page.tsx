"use client";

import { useState, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import BreadCrumb from "@/components/ui/BreadCrumb";
import Button from "@/components/ui/Button";
import { SectionBoxTitle } from "@/components/ui/SectionBoxTitle";
import { SectionBoxSubtitle } from "@/components/ui/SectionBoxSubtitle";
import { CALCULATE_STEPS } from "@/constants/navigation";
import { useLocation } from "@/context/LocationContext";
import { ALL_CATEGORIES } from "@/constants/categories";
import { ALL_SERVICES } from "@/constants/services";
import { ChevronDown } from "lucide-react";

// Utility to format numbers nicely
const formatWithSeparator = (value: number): string =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(value);

// Session helpers
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

export default function Details() {
  const router = useRouter();
  const { location } = useLocation();

  // Load chosen category IDs (like "1-1", "1-2", etc.)
  const selectedCategories: string[] = loadFromSession("services_selectedCategories", []);

  const [address, setAddress] = useState<string>(loadFromSession("address", ""));
  const [description, setDescription] = useState<string>(loadFromSession("description", ""));
  const [photos, setPhotos] = useState<string[]>(loadFromSession("photos", []));
  const [searchQuery, setSearchQuery] = useState<string>(loadFromSession("services_searchQuery", ""));

  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // If no categories or no address, go back
  useEffect(() => {
    if (selectedCategories.length === 0 || !address) {
      router.push("/calculate");
    }
  }, [selectedCategories, address, router]);

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // For each selected category ID, find all services under it
  const categoryServicesMap: Record<string, typeof ALL_SERVICES[number][]> = {};
  selectedCategories.forEach((catId) => {
    let matchedServices = ALL_SERVICES.filter((svc) => svc.id.startsWith(`${catId}-`));
    if (searchQuery) {
      matchedServices = matchedServices.filter((svc) =>
        svc.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    categoryServicesMap[catId] = matchedServices;
  });

  // Load previously chosen services with quantity
  const [selectedServicesState, setSelectedServicesState] = useState<Record<string, number>>(
    () => loadFromSession("selectedServicesWithQuantity", {})
  );

  useEffect(() => {
    saveToSession("selectedServicesWithQuantity", selectedServicesState);
  }, [selectedServicesState]);

  const toggleCategory = (catId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.has(catId) ? next.delete(catId) : next.add(catId);
      return next;
    });
  };

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServicesState((prev) => {
      if (prev[serviceId]) {
        const updated = { ...prev };
        delete updated[serviceId];
        return updated;
      }
      return { ...prev, [serviceId]: 1 };
    });
    setWarningMessage(null);
  };

  const handleQuantityChange = (serviceId: string, increment: boolean, unit: string) => {
    setSelectedServicesState((prev) => {
      const currentValue = prev[serviceId] || 1;
      const updatedValue = increment ? currentValue + 1 : Math.max(1, currentValue - 1);
      return {
        ...prev,
        [serviceId]: unit === "each" ? Math.round(updatedValue) : updatedValue,
      };
    });
  };

  const clearAllSelections = () => {
    setSelectedServicesState({});
  };

  const calculateTotal = (): number => {
    let total = 0;
    for (const [serviceId, quantity] of Object.entries(selectedServicesState)) {
      const svc = ALL_SERVICES.find((s) => s.id === serviceId);
      if (svc) {
        total += svc.price * (quantity || 1);
      }
    }
    return total;
  };

  const handleNext = () => {
    if (Object.keys(selectedServicesState).length === 0) {
      setWarningMessage("Please select at least one service before proceeding.");
      return;
    }
    if (!address.trim()) {
      setWarningMessage("Please enter your address before proceeding.");
      return;
    }

    saveToSession("selectedServicesWithQuantity", selectedServicesState);
    saveToSession("address", address);
    saveToSession("photos", photos);
    saveToSession("description", description);

    router.push("/calculate/estimate");
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

  // Function to get the category name from ALL_CATEGORIES by ID
  const getCategoryNameById = (catId: string): string => {
    const categoryObj = ALL_CATEGORIES.find((c) => c.id === catId);
    return categoryObj ? categoryObj.title : catId;
  };

  const totalSelectedCount = Object.keys(selectedServicesState).length;

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto">
        <BreadCrumb items={CALCULATE_STEPS} />

        <div className="flex justify-between items-start mt-8">
          <SectionBoxTitle>Service Details</SectionBoxTitle>
          <Button onClick={handleNext}>Next →</Button>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-500 mt-8 w-full max-w-[600px]">
          <span>
            No service?{" "}
            <a href="#" className="text-blue-600 hover:underline focus:outline-none">
              Contact support
            </a>
          </span>
          <button
            onClick={clearAllSelections}
            className="text-blue-600 hover:underline focus:outline-none"
          >
            Clear
          </button>
        </div>

        <div className="h-6 mt-4 text-left">
          {warningMessage && <p className="text-red-500">{warningMessage}</p>}
        </div>

        <div className="container mx-auto relative flex">
          <div className="flex-1">
            <div className="flex flex-col gap-4 mt-8 w-full max-w-[600px]">
              {selectedCategories.map((catId) => {
                const servicesForCategory = categoryServicesMap[catId] || [];
                const selectedInThisCategory = servicesForCategory.filter((svc) =>
                  Object.keys(selectedServicesState).includes(svc.id)
                ).length;

                // Get category name instead of ID
                const categoryName = getCategoryNameById(catId);

                return (
                  <div
                    key={catId}
                    className={`p-4 border rounded-xl bg-white ${
                      selectedInThisCategory > 0 ? "border-blue-500" : "border-gray-300"
                    }`}
                  >
                    <button
                      onClick={() => toggleCategory(catId)}
                      className="flex justify-between items-center w-full"
                    >
                      <h3
                        className={`font-medium text-2xl ${
                          selectedInThisCategory > 0 ? "text-blue-600" : "text-black"
                        }`}
                      >
                        {categoryName}
                        {selectedInThisCategory > 0 && (
                          <span className="text-sm text-gray-500 ml-2">
                            ({selectedInThisCategory} selected)
                          </span>
                        )}
                      </h3>
                      <ChevronDown
                        className={`h-5 w-5 transform transition-transform ${
                          expandedCategories.has(catId) ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {expandedCategories.has(catId) && (
                      <div className="mt-4 flex flex-col gap-3">
                        {servicesForCategory.map((svc) => {
                          const isSelected = selectedServicesState[svc.id] !== undefined;
                          return (
                            <div key={svc.id} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span
                                  className={`text-lg transition-colors duration-300 ${
                                    isSelected ? "text-blue-600" : "text-gray-800"
                                  }`}
                                >
                                  {svc.title}
                                </span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleServiceToggle(svc.id)}
                                    className="sr-only peer"
                                  />
                                  <div className="w-[50px] h-[26px] bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors duration-300"></div>
                                  <div className="absolute top-[2px] left-[2px] w-[22px] h-[22px] bg-white rounded-full shadow-md peer-checked:translate-x-[24px] transform transition-transform duration-300"></div>
                                </label>
                              </div>

                              {isSelected && (
                                <div className="flex items-center gap-2 pl-4">
                                  <button
                                    onClick={() =>
                                      handleQuantityChange(svc.id, false, svc.unit_of_measurement)
                                    }
                                    className="w-8 h-8 bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg rounded"
                                  >
                                    −
                                  </button>
                                  <span className="w-10 text-center">
                                    {selectedServicesState[svc.id] || 1}
                                  </span>
                                  <button
                                    onClick={() =>
                                      handleQuantityChange(svc.id, true, svc.unit_of_measurement)
                                    }
                                    className="w-8 h-8 bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg rounded"
                                  >
                                    +
                                  </button>
                                  <span className="text-sm text-gray-600">
                                    {svc.unit_of_measurement}
                                  </span>
                                  <span className="text-lg text-blue-600 font-medium ml-auto">
                                    ${formatWithSeparator(svc.price * (selectedServicesState[svc.id] || 1))}
                                  </span>
                                </div>
                              )}
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

          <div className="w-1/2 ml-auto mt-20 pt-1">
            <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden">
              <SectionBoxSubtitle>Summary</SectionBoxSubtitle>
              {Object.keys(selectedServicesState).length === 0 ? (
                <div className="text-left text-gray-500 text-lg mt-4">
                  No services selected
                </div>
              ) : (
                <>
                  <ul className="mt-4 space-y-2 pb-4">
                    {Object.entries(selectedServicesState).map(([serviceId, quantity]) => {
                      const svc = ALL_SERVICES.find((s) => s.id === serviceId);
                      if (!svc) return null;
                      return (
                        <li
                          key={serviceId}
                          className="grid grid-cols-3 gap-2 text-sm text-gray-600"
                          style={{
                            gridTemplateColumns: "46% 25% 25%",
                            width: "100%",
                          }}
                        >
                          <span className="truncate overflow-hidden">
                            {svc.title}
                          </span>
                          <span className="text-right">
                            {quantity} x ${formatWithSeparator(svc.price)}
                          </span>
                          <span className="text-right">
                            ${formatWithSeparator(svc.price * quantity)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xl font-semibold text-gray-800">
                      Subtotal:
                    </span>
                    <span className="text-2xl font-semibold text-blue-600">
                      ${formatWithSeparator(calculateTotal())}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden mt-6">
              <h2 className="text-2xl font-medium text-gray-800 mb-4">Address</h2>
              <input
                type="text"
                value={address}
                onChange={handleAddressChange}
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "Enter your address")}
                placeholder="Enter your address"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              />
              <button onClick={handleUseMyLocation} className="text-blue-600 text-left">
                Use my location
              </button>
            </div>

            <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden mt-6">
              <h2 className="text-2xl font-medium text-gray-800 mb-4">
                Uploaded Photos
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
                          onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== index))}
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