"use client";

import { useState, useEffect } from "react";
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

// Session helpers with environment check
const saveToSession = (key: string, value: any) => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(key, JSON.stringify(value));
  }
};

const loadFromSession = (key: string, defaultValue: any) => {
  if (typeof window === 'undefined') return defaultValue;
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

  // Load chosen categories and other data only if window is defined
  const selectedCategories: string[] = loadFromSession("services_selectedCategories", []);
  const address: string = loadFromSession("address", "");
  const description: string = loadFromSession("description", "");
  const photos: string[] = loadFromSession("photos", []);
  const searchQuery: string = loadFromSession("services_searchQuery", "");

  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  useEffect(() => {
    // If no categories or no address, go back
    if (selectedCategories.length === 0 || !address) {
      router.push("/calculate");
    }
  }, [selectedCategories, address, router]);

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const categoriesWithSection = selectedCategories
    .map((catId) => ALL_CATEGORIES.find((c) => c.id === catId) || null)
    .filter(Boolean) as (typeof ALL_CATEGORIES)[number][];

  const categoriesBySection: Record<string, string[]> = {};
  categoriesWithSection.forEach((cat) => {
    if (!categoriesBySection[cat.section]) {
      categoriesBySection[cat.section] = [];
    }
    categoriesBySection[cat.section].push(cat.id);
  });

  const categoryServicesMap: Record<string, (typeof ALL_SERVICES)[number][]> = {};
  selectedCategories.forEach((catId) => {
    let matchedServices = ALL_SERVICES.filter((svc) => svc.id.startsWith(`${catId}-`));
    if (searchQuery) {
      matchedServices = matchedServices.filter((svc) =>
        svc.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    categoryServicesMap[catId] = matchedServices;
  });

  const [selectedServicesState, setSelectedServicesState] = useState<Record<string, number>>(
    () => loadFromSession("selectedServicesWithQuantity", {})
  );

  const [manualInputValue, setManualInputValue] = useState<Record<string, string | null>>({});

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
    setManualInputValue((prev) => ({
      ...prev,
      [serviceId]: null,
    }));
  };

  const handleManualQuantityChange = (serviceId: string, value: string, unit: string) => {
    setManualInputValue((prev) => ({
      ...prev,
      [serviceId]: value,
    }));

    const numericValue = parseFloat(value.replace(/,/g, "")) || 0;
    if (!isNaN(numericValue)) {
      setSelectedServicesState((prev) => ({
        ...prev,
        [serviceId]: unit === "each" ? Math.round(numericValue) : numericValue,
      }));
    }
  };

  const handleBlurInput = (serviceId: string) => {
    if (!manualInputValue[serviceId]) {
      setManualInputValue((prev) => ({
        ...prev,
        [serviceId]: null,
      }));
    }
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

    router.push("/calculate/estimate");
  };

  const getCategoryNameById = (catId: string): string => {
    const categoryObj = ALL_CATEGORIES.find((c) => c.id === catId);
    return categoryObj ? categoryObj.title : catId;
  };

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto">
        <BreadCrumb items={CALCULATE_STEPS} />

        <div className="flex justify-between items-start mt-8">
          <SectionBoxTitle>Choose a Service and Quantity</SectionBoxTitle>
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

        <div className="container mx-auto relative flex mt-8">
          <div className="flex-1">
            {Object.entries(categoriesBySection).map(([sectionName, catIds]) => (
              <div key={sectionName} className="mb-8">
                <SectionBoxSubtitle>{sectionName}</SectionBoxSubtitle>
                <div className="flex flex-col gap-4 mt-4 w-full max-w-[600px]">
                  {catIds.map((catId) => {
                    const servicesForCategory = categoryServicesMap[catId] || [];
                    const selectedInThisCategory = servicesForCategory.filter((svc) =>
                      Object.keys(selectedServicesState).includes(svc.id)
                    ).length;

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
                              const quantity = selectedServicesState[svc.id] || 1;
                              const manualValue =
                                manualInputValue[svc.id] !== null
                                  ? manualInputValue[svc.id] || ""
                                  : quantity.toString();

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
                                    <>
                                      {svc.description && (
                                        <p className="text-sm text-gray-500 pr-16">
                                          {svc.description}
                                        </p>
                                      )}
                                      <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-1">
                                          {/* Decrement button */}
                                          <button
                                            onClick={() =>
                                              handleQuantityChange(
                                                svc.id,
                                                false,
                                                svc.unit_of_measurement
                                              )
                                            }
                                            className="w-8 h-8 bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg rounded"
                                          >
                                            −
                                          </button>
                                          {/* Manual input field */}
                                          <input
                                            type="text"
                                            value={manualValue}
                                            onClick={() =>
                                              setManualInputValue((prev) => ({
                                                ...prev,
                                                [svc.id]: "",
                                              }))
                                            }
                                            onBlur={() => handleBlurInput(svc.id)}
                                            onChange={(e) =>
                                              handleManualQuantityChange(
                                                svc.id,
                                                e.target.value,
                                                svc.unit_of_measurement
                                              )
                                            }
                                            className="w-20 text-center px-2 py-1 border rounded"
                                            placeholder="1"
                                          />
                                          {/* Increment button */}
                                          <button
                                            onClick={() =>
                                              handleQuantityChange(
                                                svc.id,
                                                true,
                                                svc.unit_of_measurement
                                              )
                                            }
                                            className="w-8 h-8 bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg rounded"
                                          >
                                            +
                                          </button>
                                          <span className="text-sm text-gray-600">
                                            {svc.unit_of_measurement}
                                          </span>
                                        </div>
                                        <span className="text-lg text-blue-600 font-medium text-right">
                                          ${formatWithSeparator(svc.price * quantity)}
                                        </span>
                                      </div>
                                      {isSelected &&
                                        (() => {
                                          const chosen = servicesForCategory.filter(
                                            (s) => selectedServicesState[s.id] !== undefined
                                          );
                                          const currentIndex = chosen.findIndex((s) => s.id === svc.id);
                                          return currentIndex !== chosen.length - 1 ? (
                                            <hr className="mt-4 border-gray-200" />
                                          ) : null;
                                        })()}
                                    </>
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
            ))}
          </div>

          {/* Right Section: Summary, Address, Photos, and Description */}
          <div className="w-1/2 ml-auto mt-14 pt-1">
            <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden">
              <SectionBoxSubtitle>Summary</SectionBoxSubtitle>
              {Object.keys(selectedServicesState).length === 0 ? (
                <div className="text-left text-gray-500 text-medium mt-4">
                  No services selected
                </div>
              ) : (
                <>
                  {Object.entries(categoriesBySection).map(
                    ([sectionName, catIds]) => {
                      const categoriesWithSelectedServices = catIds.filter(
                        (catId) => {
                          const servicesForCategory =
                            categoryServicesMap[catId] || [];
                          return servicesForCategory.some(
                            (svc) => selectedServicesState[svc.id] !== undefined
                          );
                        }
                      );

                      if (categoriesWithSelectedServices.length === 0)
                        return null;

                      return (
                        <div key={sectionName} className="mb-6">
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            {sectionName}
                          </h3>
                          {categoriesWithSelectedServices.map((catId) => {
                            const categoryObj = ALL_CATEGORIES.find(
                              (c) => c.id === catId
                            );
                            const categoryName = categoryObj
                              ? categoryObj.title
                              : catId;

                            const servicesForCategory =
                              categoryServicesMap[catId] || [];
                            const chosenServices = servicesForCategory.filter(
                              (svc) =>
                                selectedServicesState[svc.id] !== undefined
                            );

                            if (chosenServices.length === 0) return null;

                            return (
                              <div key={catId} className="mb-4 ml-4">
                                <h4 className="text-lg font-medium text-gray-700 mb-2">
                                  {categoryName}
                                </h4>
                                <ul className="space-y-2 pb-4">
                                  {chosenServices.map((svc) => {
                                    const quantity =
                                      selectedServicesState[svc.id] || 1;
                                    return (
                                      <li
                                        key={svc.id}
                                        className="grid grid-cols-3 gap-2 text-sm text-gray-600"
                                        style={{
                                          gridTemplateColumns: "40% 30% 25%",
                                          width: "100%",
                                        }}
                                      >
                                        <span className="truncate overflow-hidden">
                                          {svc.title}
                                        </span>
                                        <span className="text-right">
                                          {quantity} {svc.unit_of_measurement} x
                                          ${formatWithSeparator(svc.price)}
                                        </span>
                                        <span className="text-right">
                                          $
                                          {formatWithSeparator(
                                            svc.price * quantity
                                          )}
                                        </span>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            );
                          })}
                        </div>
                      );
                    }
                  )}
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
              <h2 className="text-2xl font-medium text-gray-800 mb-4">
                Address
              </h2>
              <p className="text-gray-500 text-medium">
                {address || "No address provided"}
              </p>
            </div>

            <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden mt-6">
              <h2 className="text-2xl font-medium text-gray-800 mb-4">
                Uploaded Photos
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {photos.map((photo: string, index: number) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`Uploaded photo ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
              {photos.length === 0 && (
                <p className="text-medium text-gray-500 mt-2">
                  No photos uploaded
                </p>
              )}
            </div>

            <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden mt-6">
              <h2 className="text-2xl font-medium text-gray-800 mb-4">
                Additional details
              </h2>
              <p className="text-gray-500 text-medium whitespace-pre-wrap">
                {description || "No details provided"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
