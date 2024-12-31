"use client";

import React, { useState, useEffect } from "react";
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

/**
 * Describes a finishing material object returned by /work/finishing_materials.
 */
interface FinishingMaterial {
  id: number;
  image: string;
  unit_of_measurement: string;
  name: string;
  external_id: string;
  cost: string;
}

/** 
 * formatWithSeparator:
 * Helper function to format a numeric value with commas, e.g. 1000 -> "1,000.00"
 */
function formatWithSeparator(value: number): string {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(value);
}

/**
 * saveToSession:
 * Saves a value to sessionStorage (only in the browser).
 */
function saveToSession(key: string, value: any) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(key, JSON.stringify(value));
  }
}

/**
 * loadFromSession:
 * Loads a value from sessionStorage, or returns a default value if not found (or if SSR).
 */
function loadFromSession<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  const savedValue = sessionStorage.getItem(key);
  try {
    return savedValue ? JSON.parse(savedValue) : defaultValue;
  } catch (error) {
    console.error(`Error parsing sessionStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * convertServiceIdToApiFormat:
 * Converts a hyphen-based service ID like "1-1-1" into a dotted format "1.1.1" required by the server.
 */
function convertServiceIdToApiFormat(serviceId: string) {
  return serviceId.replaceAll("-", ".");
}

/**
 * getApiBaseUrl:
 * Returns the base API URL from environment variables or a fallback.
 */
function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://dev.thejamb.com";
}

/**
 * fetchFinishingMaterials:
 * POST /work/finishing_materials
 * Takes a "work_code" like "1.1.1" and returns an object with "sections".
 */
async function fetchFinishingMaterials(workCode: string) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/work/finishing_materials`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ work_code: workCode }),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch finishing materials (work_code=${workCode}).`);
  }
  return res.json();
}

/**
 * calculatePrice:
 * POST /calculate
 * Expects fields like { work_code, zipcode, ... } in the body.
 */
async function calculatePrice(params: {
  work_code: string;
  zipcode: string;
  unit_of_measurement: string;
  square: number;
  finishing_materials: string[];
}) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/calculate`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    throw new Error(`Failed to calculate price (work_code=${params.work_code}).`);
  }
  return res.json();
}

export default function Details() {
  const router = useRouter();

  /**
   * useLocation from our LocationContext:
   *   location has { city, zip, country, ... }
   */
  const { location } = useLocation();

  /**
   * 1) Load data from session storage:
   *    - selectedCategories is a list of category IDs the user selected
   *    - address is the user's entered address
   *    - description, photos, searchQuery are additional data
   */
  const selectedCategories = loadFromSession<string[]>("services_selectedCategories", []);
  const [address, setAddress] = useState<string>(() => loadFromSession("address", ""));
  const description = loadFromSession<string>("description", "");
  const photos = loadFromSession<string[]>("photos", []);
  const searchQuery = loadFromSession<string>("services_searchQuery", "");

  /**
   * If user somehow arrived here without categories or address,
   * redirect them back to /calculate
   */
  useEffect(() => {
    if (selectedCategories.length === 0 || !address) {
      router.push("/calculate");
    }
  }, [selectedCategories, address, router]);

  /**
   * If the user changes location data (city, zip, country),
   * update the address accordingly and save to session.
   */
  useEffect(() => {
    const newAddress = `${location.city || ""}, ${location.zip || ""}${
      location.country ? `, ${location.country}` : ""
    }`.trim();
    if (newAddress !== ", ,") {
      setAddress(newAddress);
      saveToSession("address", newAddress);
    }
  }, [location]);

  /** Possibly show a warning, e.g. "please select at least one service" */
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  /** expandedCategories: tracks which category IDs are expanded in the UI */
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  /**
   * Build a structure: categoriesBySection from the user-chosen categories:
   *    e.g. { "Kitchen": ["1-1"], "Bathroom": ["1-2","1-3"] }
   */
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

  /**
   * For each chosen category, gather services from ALL_SERVICES.
   * If there's a searchQuery, filter the services by matching titles.
   */
  const categoryServicesMap: Record<string, (typeof ALL_SERVICES)[number][]> = {};
  selectedCategories.forEach((catId) => {
    let arr = ALL_SERVICES.filter((svc) => svc.id.startsWith(`${catId}-`));
    if (searchQuery) {
      arr = arr.filter((svc) =>
        svc.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    categoryServicesMap[catId] = arr;
  });

  /**
   * selectedServicesState:
   *   a dictionary: { [serviceId]: quantity }
   *   e.g. { "1-1-1": 2, "2-1-1": 1 }
   */
  const [selectedServicesState, setSelectedServicesState] = useState<Record<string, number>>(
    () => loadFromSession("selectedServicesWithQuantity", {})
  );

  /** serviceCosts: final cost for each selected service, derived from /calculate */
  const [serviceCosts, setServiceCosts] = useState<Record<string, number>>({});

  /**
   * finishingMaterialsMapAll:
   *   for each serviceId -> an object { sections: { "1": [FinishingMaterial[]], "2": ... } }
   *   fetched from /work/finishing_materials. 
   *   We only load them when user expands a category that includes this service, if not already loaded.
   */
  const [finishingMaterialsMapAll, setFinishingMaterialsMapAll] = useState<
    Record<string, { sections: Record<string, FinishingMaterial[]> }>
  >({});

  /**
   * finishingMaterialSelections:
   *   for each serviceId -> array of finishing material external_ids
   *   By default, we pick the first item in each "section" returned by the API,
   *   so finishing_materials is not empty for /calculate.
   */
  const [finishingMaterialSelections, setFinishingMaterialSelections] = useState<
    Record<string, string[]>
  >({});

  /**
   * manualInputValue:
   *   a dictionary storing raw text input for each service
   */
  const [manualInputValue, setManualInputValue] = useState<Record<string, string | null>>({});

  /**
   * Whenever selectedServicesState changes, save it to session
   * so the user doesn't lose the state on a refresh.
   */
  useEffect(() => {
    saveToSession("selectedServicesWithQuantity", selectedServicesState);
  }, [selectedServicesState]);

  /**
   * toggleCategory:
   * Expand or collapse a category.
   * If we're expanding a category for the first time, fetch finishing materials
   * for each service in that category (if we haven't loaded them yet).
   */
  async function toggleCategory(catId: string) {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) {
        // The category was expanded, so now we collapse it
        next.delete(catId);
      } else {
        // The category was collapsed, so let's expand it
        next.add(catId);

        // For each service in this category, fetch finishing materials if not loaded
        const servicesForThisCat = categoryServicesMap[catId] || [];
        fetchFinishingMaterialsForCategory(servicesForThisCat);
      }
      return next;
    });
  }

  /**
   * fetchFinishingMaterialsForCategory:
   * For each service in the category, if we haven't loaded finishing materials,
   * do a POST /work/finishing_materials, then store the result in finishingMaterialsMapAll.
   * Also pick the first finishing material from each 'section' by default 
   * to fill finishingMaterialSelections.
   */
  async function fetchFinishingMaterialsForCategory(services: (typeof ALL_SERVICES)[number][]) {
    const promises = services.map(async (svc) => {
      const svcId = svc.id;
      if (!finishingMaterialsMapAll[svcId]) {
        try {
          const dotFormat = convertServiceIdToApiFormat(svcId);
          const data = await fetchFinishingMaterials(dotFormat);

          // Save the entire response
          finishingMaterialsMapAll[svcId] = data;

          // By default, pick the first finishing material in each "section"
          const singleSelections: string[] = [];
          for (const arr of Object.values(data.sections || {})) {
            if (Array.isArray(arr) && arr.length > 0) {
              singleSelections.push(arr[0].external_id);
            }
          }
          finishingMaterialSelections[svcId] = singleSelections;
        } catch (err) {
          console.error("Error loading finishing materials for serviceId=", svcId, err);
        }
      }
    });

    try {
      await Promise.all(promises);
      // Once all fetches finish, update the states
      setFinishingMaterialsMapAll({ ...finishingMaterialsMapAll });
      setFinishingMaterialSelections({ ...finishingMaterialSelections });
    } catch (err) {
      console.error("Error fetchFinishingMaterialsForCategory:", err);
    }
  }

  /**
   * handleServiceToggle:
   * If the service is already selected, remove it. Otherwise, set quantity=1.
   */
  function handleServiceToggle(serviceId: string) {
    setSelectedServicesState((prev) => {
      if (prev[serviceId]) {
        const updated = { ...prev };
        delete updated[serviceId];
        return updated;
      }
      return { ...prev, [serviceId]: 1 };
    });
    setWarningMessage(null);
  }

  /**
   * handleQuantityChange:
   * +/- increment the quantity for a given service.
   * If it's "each," ensure it's an integer (use Math.round).
   */
  function handleQuantityChange(serviceId: string, increment: boolean, unit: string) {
    setSelectedServicesState((prev) => {
      const currentVal = prev[serviceId] || 1;
      const nextVal = increment ? currentVal + 1 : Math.max(1, currentVal - 1);
      return {
        ...prev,
        [serviceId]: unit === "each" ? Math.round(nextVal) : nextVal,
      };
    });
    // Reset manual input if user used +/- buttons
    setManualInputValue((prev) => ({ ...prev, [serviceId]: null }));
  }

  /**
   * handleManualQuantityChange:
   * If user types directly into the quantity input, store the raw text in manualInputValue
   * and update selectedServicesState accordingly (parsed float).
   */
  function handleManualQuantityChange(serviceId: string, value: string, unit: string) {
    setManualInputValue((prev) => ({ ...prev, [serviceId]: value }));
    const numericVal = parseFloat(value.replace(/,/g, "")) || 0;
    if (!isNaN(numericVal)) {
      setSelectedServicesState((prev) => ({
        ...prev,
        [serviceId]: unit === "each" ? Math.round(numericVal) : numericVal,
      }));
    }
  }

  /**
   * handleBlurInput:
   * If the input is empty on blur, revert manualInputValue to null
   * so the UI can show the current selected quantity again.
   */
  function handleBlurInput(serviceId: string) {
    if (!manualInputValue[serviceId]) {
      setManualInputValue((prev) => ({ ...prev, [serviceId]: null }));
    }
  }

  /**
   * clearAllSelections:
   * Clears all selected services and collapses all categories.
   */
  function clearAllSelections() {
    const confirmed = window.confirm(
      "Are you sure you want to clear all selected services? This will also collapse all expanded categories."
    );
    if (!confirmed) return;
    setSelectedServicesState({});
    setExpandedCategories(new Set());
  }

  /**
   * Recalculate cost whenever:
   * - selectedServicesState changes (user picks/unpicks or changes quantity)
   * - finishingMaterialSelections changes (if user changes finishing materials)
   * - location changes (zip or country), because /calculate depends on zip for pricing
   */
  useEffect(() => {
    const serviceIds = Object.keys(selectedServicesState);
    if (serviceIds.length === 0) {
      setServiceCosts({});
      return;
    }

    const { zip, country } = location;
    // Only valid for US, 5-digit ZIP
    if (country !== "United States" || !/^\d{5}$/.test(zip)) {
      setWarningMessage(
        "Currently, our service is only available for US ZIP codes (5 digits)."
      );
      return;
    }

    // For each selected service, POST /calculate
    serviceIds.forEach(async (serviceId) => {
      try {
        const quantity = selectedServicesState[serviceId] || 1;
        const externalIds = finishingMaterialSelections[serviceId] || [];
        const foundService = ALL_SERVICES.find((svc) => svc.id === serviceId);
        const unit = foundService?.unit_of_measurement || "each";
        const dotFormat = convertServiceIdToApiFormat(serviceId);

        const response = await calculatePrice({
          work_code: dotFormat,
          zipcode: zip,
          unit_of_measurement: unit,
          square: quantity,
          finishing_materials: externalIds,
        });

        const workCostNum = parseFloat(response.work_cost) || 0;
        const materialCostNum = parseFloat(response.material_cost) || 0;
        const finalCost = workCostNum + materialCostNum;

        setServiceCosts((prev) => ({
          ...prev,
          [serviceId]: finalCost,
        }));
      } catch (err) {
        console.error("Error calculating price:", err);
      }
    });
  }, [selectedServicesState, finishingMaterialSelections, location]);

  /**
   * calculateTotal:
   * Summation of all serviceCosts for the selected services.
   */
  function calculateTotal() {
    return Object.values(serviceCosts).reduce((acc, cost) => acc + (cost || 0), 0);
  }

  /**
   * handleNext:
   * 1) Ensure there's at least one selected service
   * 2) Ensure address is not empty
   * 3) Move to /calculate/estimate
   */
  function handleNext() {
    if (Object.keys(selectedServicesState).length === 0) {
      setWarningMessage("Please select at least one service before proceeding.");
      return;
    }
    if (!address.trim()) {
      setWarningMessage("Please enter your address before proceeding.");
      return;
    }
    router.push("/calculate/estimate");
  }

  /**
   * getCategoryNameById:
   * Returns the category's title or the catId if not found.
   */
  function getCategoryNameById(catId: string): string {
    const categoryObj = ALL_CATEGORIES.find((c) => c.id === catId);
    return categoryObj ? categoryObj.title : catId;
  }

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto">
        <BreadCrumb items={CALCULATE_STEPS} />

        {/* Top row: title and "Next" button */}
        <div className="flex justify-between items-start mt-8">
          <SectionBoxTitle>Choose a Service and Quantity</SectionBoxTitle>
          <Button onClick={handleNext}>Next →</Button>
        </div>

        {/* A small row: "No service?" and a "Clear" button */}
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

        {/* Potential warning (address missing, no US ZIP, etc.) */}
        <div className="h-6 mt-4 text-left">
          {warningMessage && <p className="text-red-500">{warningMessage}</p>}
        </div>

        <div className="container mx-auto relative flex mt-8">
          {/* LEFT COLUMN: categories & services */}
          <div className="flex-1">
            {Object.entries(categoriesBySection).map(([sectionName, catIds]) => (
              <div key={sectionName} className="mb-8">
                <SectionBoxSubtitle>{sectionName}</SectionBoxSubtitle>

                <div className="flex flex-col gap-4 mt-4 w-full max-w-[600px]">
                  {catIds.map((catId) => {
                    const servicesForCategory = categoryServicesMap[catId] || [];
                    // Count how many selected services are in this category
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
                        {/* Category header that toggles expand/collapse */}
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

                        {/* If the category is expanded, show its services */}
                        {expandedCategories.has(catId) && (
                          <div className="mt-4 flex flex-col gap-3">
                            {servicesForCategory.map((svc) => {
                              const isSelected = selectedServicesState[svc.id] !== undefined;
                              const quantity = selectedServicesState[svc.id] || 1;
                              const manualValue =
                                manualInputValue[svc.id] !== null
                                  ? manualInputValue[svc.id] || ""
                                  : quantity.toString();

                              // final cost from serviceCosts
                              const finalCost = serviceCosts[svc.id] || 0;

                              return (
                                <div key={svc.id} className="space-y-2">
                                  {/* Service row: name + toggle */}
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

                                  {/* If user selected this service, show quantity + cost */}
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
                                          {/* Manual quantity input */}
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
                                          ${formatWithSeparator(finalCost)}
                                        </span>
                                      </div>
                                      {/* If this service is not the last one selected in this category, draw a divider */}
                                      {(() => {
                                        const chosen = servicesForCategory.filter(
                                          (s) => selectedServicesState[s.id] !== undefined
                                        );
                                        const currentIndex = chosen.findIndex(
                                          (s) => s.id === svc.id
                                        );
                                        if (currentIndex !== chosen.length - 1) {
                                          return <hr className="mt-4 border-gray-200" />;
                                        }
                                        return null;
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

          {/* RIGHT COLUMN: Summary, Address, Photos, Additional Details */}
          <div className="w-1/2 ml-auto mt-14 pt-1">
            <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden">
              <SectionBoxSubtitle>Summary</SectionBoxSubtitle>
              {Object.keys(selectedServicesState).length === 0 ? (
                <div className="text-left text-gray-500 text-medium mt-4">
                  No services selected
                </div>
              ) : (
                <>
                  {/* Loop through each section => categories => selected services */}
                  {Object.entries(categoriesBySection).map(([sectionName, catIds]) => {
                    // Filter out categories that don't have any selected services
                    const relevantCatIds = catIds.filter((catId) => {
                      const arr = categoryServicesMap[catId] || [];
                      return arr.some((svc) => selectedServicesState[svc.id] !== undefined);
                    });
                    if (relevantCatIds.length === 0) return null;

                    return (
                      <div key={sectionName} className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                          {sectionName}
                        </h3>
                        {relevantCatIds.map((catId) => {
                          const catObj = ALL_CATEGORIES.find((c) => c.id === catId);
                          const catName = catObj ? catObj.title : catId;
                          const arr = categoryServicesMap[catId] || [];

                          // Only the selected services in this category
                          const chosenServices = arr.filter(
                            (svc) => selectedServicesState[svc.id] !== undefined
                          );
                          if (chosenServices.length === 0) return null;

                          return (
                            <div key={catId} className="mb-4 ml-4">
                              <h4 className="text-lg font-medium text-gray-700 mb-2">
                                {catName}
                              </h4>
                              <ul className="space-y-2 pb-4">
                                {chosenServices.map((svc) => {
                                  const q = selectedServicesState[svc.id] || 1;
                                  const cost = serviceCosts[svc.id] || 0;

                                  return (
                                    <li
                                      key={svc.id}
                                      className="grid grid-cols-3 gap-2 text-sm text-gray-600"
                                      style={{ gridTemplateColumns: "40% 30% 25%" }}
                                    >
                                      <span className="truncate overflow-hidden">
                                        {svc.title}
                                      </span>
                                      <span className="text-right">
                                        {q} {svc.unit_of_measurement}
                                      </span>
                                      <span className="text-right">
                                        ${formatWithSeparator(cost)}
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
                  })}
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xl font-semibold text-gray-800">Subtotal:</span>
                    <span className="text-2xl font-semibold text-blue-600">
                      ${formatWithSeparator(calculateTotal())}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Address block */}
            <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden mt-6">
              <h2 className="text-2xl font-medium text-gray-800 mb-4">Address</h2>
              <p className="text-gray-500 text-medium">{address || "No address provided"}</p>
            </div>

            {/* Photos block */}
            <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden mt-6">
              <h2 className="text-2xl font-medium text-gray-800 mb-4">Uploaded Photos</h2>
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
                <p className="text-medium text-gray-500 mt-2">No photos uploaded</p>
              )}
            </div>

            {/* Additional details */}
            <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden mt-6">
              <h2 className="text-2xl font-medium text-gray-800 mb-4">Additional details</h2>
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