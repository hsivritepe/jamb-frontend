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
 * Helper to format a numeric value with commas, e.g. 1000 -> "1,000.00"
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
 * Loads a value from sessionStorage, or returns a default value if not found (or SSR).
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
 * Expects fields like { work_code, zipcode, unit_of_measurement, square, finishing_materials } 
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

  /** Location from our custom context: location has { city, zip, ... } */
  const { location } = useLocation();

  // 1) Load user data from session
  const selectedCategories = loadFromSession<string[]>("services_selectedCategories", []);
  const [address, setAddress] = useState<string>(() => loadFromSession("address", ""));
  const description = loadFromSession<string>("description", "");
  const photos = loadFromSession<string[]>("photos", []);
  const searchQuery = loadFromSession<string>("services_searchQuery", "");

  // If no categories or no address, redirect to /calculate
  useEffect(() => {
    if (selectedCategories.length === 0 || !address) {
      router.push("/calculate");
    }
  }, [selectedCategories, address, router]);

  // Update address if location changes
  useEffect(() => {
    const newAddress = `${location.city || ""}, ${location.zip || ""}${
      location.country ? `, ${location.country}` : ""
    }`.trim();
    if (newAddress !== ", ,") {
      setAddress(newAddress);
      saveToSession("address", newAddress);
    }
  }, [location]);

  // Potential warning message shown above categories
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Expand/collapse categories
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Build categories by their "section" property
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

  // Build a map of catId -> array of services
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

  // (serviceId -> quantity)
  const [selectedServicesState, setSelectedServicesState] = useState<Record<string, number>>(
    () => loadFromSession("selectedServicesWithQuantity", {})
  );

  // (serviceId -> final numeric cost)
  const [serviceCosts, setServiceCosts] = useState<Record<string, number>>({});

  // finishingMaterialsMapAll => (serviceId -> { sections: {...} })
  const [finishingMaterialsMapAll, setFinishingMaterialsMapAll] = useState<
    Record<string, { sections: Record<string, FinishingMaterial[]> }>
  >({});

  // finishingMaterialSelections => (serviceId -> string[] of external_ids)
  const [finishingMaterialSelections, setFinishingMaterialSelections] = useState<
    Record<string, string[]>
  >({});

  // manualInputValue => store user typed quantity for each service
  const [manualInputValue, setManualInputValue] = useState<Record<string, string | null>>({});

  // We'll also store the entire JSON from /calculate for each service to show the breakdown
  const [calculationResultsMap, setCalculationResultsMap] = useState<Record<string, any>>({});

  // We'll track which services have their details expanded
  const [expandedServiceDetails, setExpandedServiceDetails] = useState<Set<string>>(new Set());

  // Save changes if services changed
  useEffect(() => {
    saveToSession("selectedServicesWithQuantity", selectedServicesState);
  }, [selectedServicesState]);

  /**
   * Fetch finishing materials for a single service if not loaded,
   * then set default finishingMaterialSelections (pick the first item in each section).
   */
  async function ensureFinishingMaterialsLoaded(serviceId: string) {
    try {
      if (!finishingMaterialsMapAll[serviceId]) {
        const dot = convertServiceIdToApiFormat(serviceId);
        const data = await fetchFinishingMaterials(dot);

        finishingMaterialsMapAll[serviceId] = data;
        setFinishingMaterialsMapAll({ ...finishingMaterialsMapAll });
      }

      // Now set default finishingMaterialSelections for this service if none is present
      if (!finishingMaterialSelections[serviceId]) {
        const data = finishingMaterialsMapAll[serviceId];
        const singleSelections: string[] = [];

        for (const arr of Object.values(data.sections || {})) {
          if (Array.isArray(arr) && arr.length > 0) {
            singleSelections.push(arr[0].external_id);
          }
        }
        finishingMaterialSelections[serviceId] = singleSelections;
        setFinishingMaterialSelections({ ...finishingMaterialSelections });
      }
    } catch (err) {
      console.error("Error in ensureFinishingMaterialsLoaded:", err);
    }
  }

  // Fetch finishing materials for all services in a category if not already loaded
  async function fetchFinishingMaterialsForCategory(services: (typeof ALL_SERVICES)[number][]) {
    const promises = services.map(async (svc) => {
      if (!finishingMaterialsMapAll[svc.id]) {
        try {
          const dot = convertServiceIdToApiFormat(svc.id);
          const data = await fetchFinishingMaterials(dot);

          finishingMaterialsMapAll[svc.id] = data;
          // Pick first from each section
          const singleSelections: string[] = [];
          for (const arr of Object.values(data.sections || {})) {
            if (Array.isArray(arr) && arr.length > 0) {
              singleSelections.push(arr[0].external_id);
            }
          }
          finishingMaterialSelections[svc.id] = singleSelections;
        } catch (err) {
          console.error("Error fetching finishing materials:", err);
        }
      }
    });

    try {
      await Promise.all(promises);
      setFinishingMaterialsMapAll({ ...finishingMaterialsMapAll });
      setFinishingMaterialSelections({ ...finishingMaterialSelections });
    } catch (err) {
      console.error("Error fetchFinishingMaterialsForCategory:", err);
    }
  }

  // Expand/collapse a category
  async function toggleCategory(catId: string) {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) {
        next.delete(catId);
      } else {
        next.add(catId);
        const servicesInCat = categoryServicesMap[catId] || [];
        fetchFinishingMaterialsForCategory(servicesInCat);
      }
      return next;
    });
  }

  /**
   * handleServiceToggle:
   * When user toggles a service ON => set quantity=min_quantity
   * and ALSO set manualInputValue to String(min_quantity)
   * so that the input is controlled from the start.
   */
  async function handleServiceToggle(serviceId: string) {
    setSelectedServicesState((prev) => {
      const isCurrentlySelected = !!prev[serviceId];
      if (isCurrentlySelected) {
        // OFF => remove from all states
        const updated = { ...prev };
        delete updated[serviceId];

        setFinishingMaterialSelections((prevSel) => {
          const newSel = { ...prevSel };
          delete newSel[serviceId];
          return newSel;
        });

        setManualInputValue((prevManual) => {
          const newManual = { ...prevManual };
          delete newManual[serviceId];
          return newManual;
        });

        setCalculationResultsMap((prevCalc) => {
          const newCalc = { ...prevCalc };
          delete newCalc[serviceId];
          return newCalc;
        });

        setServiceCosts((prevCosts) => {
          const newCosts = { ...prevCosts };
          delete newCosts[serviceId];
          return newCosts;
        });

        return updated;
      } else {
        // ON => quantity = min_quantity
        const foundService = ALL_SERVICES.find((svc) => svc.id === serviceId);
        if (!foundService) return prev;

        const minQ = foundService.min_quantity ?? 1;

        // Set quantity in the main state
        const updated = { ...prev, [serviceId]: minQ };

        // Also set manualInputValue so that the input is never undefined
        setManualInputValue((oldManual) => ({
          ...oldManual,
          [serviceId]: String(minQ),
        }));

        // Ensure finishing materials
        ensureFinishingMaterialsLoaded(serviceId);
        return updated;
      }
    });

    setWarningMessage(null);
  }

  /**
   * handleQuantityChange:
   * + / - change. We clamp the new quantity to [min_quantity, max_quantity].
   * If it exceeds max_quantity, we set a warning.
   */
  function handleQuantityChange(serviceId: string, increment: boolean, unit: string) {
    const foundService = ALL_SERVICES.find((svc) => svc.id === serviceId);
    if (!foundService) return;

    const minQ = foundService.min_quantity ?? 1;
    const maxQ = foundService.max_quantity ?? 999999;

    setSelectedServicesState((prev) => {
      const currentVal = prev[serviceId] || minQ;
      let nextVal = increment ? currentVal + 1 : currentVal - 1;

      if (nextVal < minQ) {
        nextVal = minQ;
      } else if (nextVal > maxQ) {
        nextVal = maxQ;
        setWarningMessage(
          `Maximum quantity for "${foundService.title}" is ${foundService.max_quantity}.`
        );
      }

      return {
        ...prev,
        [serviceId]: unit === "each" ? Math.round(nextVal) : nextVal,
      };
    });

    // Reset manual input, so it re-syncs to the numeric quantity
    setManualInputValue((prev) => ({ ...prev, [serviceId]: null }));
  }

  /**
   * handleManualQuantityChange:
   * If user manually enters a number, clamp it to [min_quantity, max_quantity].
   * If it exceeds max_quantity, set a warning.
   */
  function handleManualQuantityChange(serviceId: string, value: string, unit: string) {
    const foundService = ALL_SERVICES.find((svc) => svc.id === serviceId);
    if (!foundService) return;

    const minQ = foundService.min_quantity ?? 1;
    const maxQ = foundService.max_quantity ?? 999999;

    setManualInputValue((prev) => ({ ...prev, [serviceId]: value }));
    let numericVal = parseFloat(value.replace(/,/g, "")) || 0;

    if (numericVal < minQ) {
      numericVal = minQ;
    } else if (numericVal > maxQ) {
      numericVal = maxQ;
      setWarningMessage(
        `Maximum quantity for "${foundService.title}" is ${foundService.max_quantity}.`
      );
    }

    setSelectedServicesState((prev) => ({
      ...prev,
      [serviceId]: unit === "each" ? Math.round(numericVal) : numericVal,
    }));
  }

  // On blur, if user didn't enter anything, revert the manual input to null
  function handleBlurInput(serviceId: string) {
    if (!manualInputValue[serviceId]) {
      setManualInputValue((prev) => ({ ...prev, [serviceId]: null }));
    }
  }

  // Clear all services and collapse categories
  function clearAllSelections() {
    const confirmed = window.confirm(
      "Are you sure you want to clear all selected services? This will also collapse all expanded categories."
    );
    if (!confirmed) return;
    setSelectedServicesState({});
    setExpandedCategories(new Set());
    setFinishingMaterialSelections({});
    setManualInputValue({});
    setCalculationResultsMap({});
    setServiceCosts({});
  }

  // Whenever services or location changes => recalc price
  useEffect(() => {
    const serviceIds = Object.keys(selectedServicesState);
    if (serviceIds.length === 0) {
      setServiceCosts({});
      setCalculationResultsMap({});
      return;
    }

    const { zip, country } = location;
    // Show a warning if ZIP code is not a valid US ZIP
    if (country !== "United States" || !/^\d{5}$/.test(zip)) {
      setWarningMessage("Currently, our service is only available for US ZIP codes (5 digits).");
      return;
    }

    serviceIds.forEach(async (serviceId) => {
      try {
        const quantity = selectedServicesState[serviceId];
        const finishingIds = finishingMaterialSelections[serviceId] || [];
        const foundService = ALL_SERVICES.find((svc) => svc.id === serviceId);
        const unit = foundService?.unit_of_measurement || "each";
        const dotFormat = convertServiceIdToApiFormat(serviceId);

        // If no finishing materials are selected, server may respond with an error
        await ensureFinishingMaterialsLoaded(serviceId);

        const response = await calculatePrice({
          work_code: dotFormat,
          zipcode: zip,
          unit_of_measurement: unit,
          square: quantity,
          finishing_materials: finishingIds,
        });

        const workCostNum = parseFloat(response.work_cost) || 0;
        const materialCostNum = parseFloat(response.material_cost) || 0;
        const finalCost = workCostNum + materialCostNum;

        setServiceCosts((prev) => ({
          ...prev,
          [serviceId]: finalCost,
        }));

        setCalculationResultsMap((prev) => ({
          ...prev,
          [serviceId]: response,
        }));
      } catch (err) {
        console.error("Error calculating price:", err);
      }
    });
  }, [selectedServicesState, finishingMaterialSelections, location]);

  // Calculate total cost of all selected services
  function calculateTotal() {
    return Object.values(serviceCosts).reduce((acc, cost) => acc + cost, 0);
  }

  // "Next" button handler
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

  // Utility to get category name by its ID
  function getCategoryNameById(catId: string): string {
    const categoryObj = ALL_CATEGORIES.find((c) => c.id === catId);
    return categoryObj ? categoryObj.title : catId;
  }

  // Toggle the "details" section for a single service
  function toggleServiceDetails(serviceId: string) {
    setExpandedServiceDetails((prev) => {
      const next = new Set(prev);
      if (next.has(serviceId)) next.delete(serviceId);
      else next.add(serviceId);
      return next;
    });
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

        {/* "No service?" + "Clear" */}
        <div className="flex justify-between items-center text-sm text-gray-500 mt-8 w-full max-w-[600px]">
          <span>
            No service?{" "}
            <a href="#" className="text-blue-600 hover:underline focus:outline-none">
              Contact support
            </a>
          </span>
          <button onClick={clearAllSelections} className="text-blue-600 hover:underline focus:outline-none">
            Clear
          </button>
        </div>

        {/* Warning */}
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
                        {/* Category header toggler */}
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

                              // Find the service to get minQ, maxQ, etc.
                              const foundService = ALL_SERVICES.find((x) => x.id === svc.id);
                              const minQ = foundService?.min_quantity ?? 1;

                              // Current quantity from state, fallback to minQ if undefined
                              const quantity = selectedServicesState[svc.id] ?? minQ;

                              // If user typed something (rawManual) we show that, else we show quantity
                              const rawManual = manualInputValue[svc.id];
                              // Make sure the input is always a string => no "uncontrolled" warnings
                              const manualValue =
                                rawManual != null
                                  ? rawManual
                                  : quantity != null
                                  ? quantity.toString()
                                  : "";

                              // final cost
                              const finalCost = serviceCosts[svc.id] || 0;
                              const calcResult = calculationResultsMap[svc.id];

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

                                  {/* If user selected => show quantity, cost, "Details" btn */}
                                  {isSelected && (
                                    <>
                                      {svc.description && (
                                        <p className="text-sm text-gray-500 pr-16">
                                          {svc.description}
                                        </p>
                                      )}

                                      <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-1">
                                          {/* Decrement */}
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
                                          {/* Manual input */}
                                          <input
                                            type="text"
                                            value={manualValue}
                                            onClick={() =>
                                              setManualInputValue((old) => ({
                                                ...old,
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
                                          />
                                          {/* Increment */}
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

                                        {/* Show cost + "Details" */}
                                        <div className="flex items-center gap-2">
                                          <span className="text-lg text-blue-600 font-medium text-right">
                                            ${formatWithSeparator(finalCost)}
                                          </span>
                                          {/* "Details" button */}
                                          <button
                                            onClick={() => toggleServiceDetails(svc.id)}
                                            className="text-blue-500 underline text-sm ml-2"
                                          >
                                            Details
                                          </button>
                                        </div>
                                      </div>

                                      {/* If not the last chosen in this category => divider */}
                                      {(() => {
                                        const chosen = servicesForCategory.filter(
                                          (s) => selectedServicesState[s.id] !== undefined
                                        );
                                        const currentIndex = chosen.findIndex((s) => s.id === svc.id);
                                        if (currentIndex !== chosen.length - 1) {
                                          return <hr className="mt-4 border-gray-200" />;
                                        }
                                        return null;
                                      })()}

                                      {/* If user clicked "Details," show improved breakdown */}
                                      {calcResult && expandedServiceDetails.has(svc.id) && (
                                        <div className="mt-4 p-4 bg-gray-50 border rounded">
                                          <h4 className="text-lg font-semibold text-gray-800 mb-3">
                                            Cost Breakdown
                                          </h4>

                                          <div className="flex flex-col gap-2 mb-4">
                                            <div className="flex justify-between">
                                              <span className="text-sm font-medium text-gray-700">
                                                Labor cost:
                                              </span>
                                              <span className="text-sm text-gray-700">
                                                ${calcResult.work_cost || "—"}
                                              </span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-sm font-medium text-gray-700">
                                                Material cost:
                                              </span>
                                              <span className="text-sm text-gray-700">
                                                ${calcResult.material_cost || "—"}
                                              </span>
                                            </div>
                                            <div className="flex justify-between border-t pt-2 mt-2">
                                              <span className="text-sm font-medium text-gray-800">
                                                Total:
                                              </span>
                                              <span className="text-sm font-medium text-gray-800">
                                                $
                                                {calcResult.total ||
                                                  calcResult.work_cost + calcResult.material_cost ||
                                                  "—"}
                                              </span>
                                            </div>
                                          </div>

                                          {Array.isArray(calcResult.materials) &&
                                            calcResult.materials.length > 0 && (
                                              <div className="mt-2">
                                                <h5 className="text-md font-medium text-gray-800 mb-2">
                                                  Materials
                                                </h5>
                                                <table className="table-auto w-full text-sm text-left text-gray-700">
                                                  <thead>
                                                    <tr className="border-b">
                                                      <th className="py-2 px-1">Name</th>
                                                      <th className="py-2 px-1">Cost/Unit</th>
                                                      <th className="py-2 px-1">Qty</th>
                                                      <th className="py-2 px-1">Subtotal</th>
                                                    </tr>
                                                  </thead>
                                                  <tbody>
                                                    {calcResult.materials.map((m: any, i: number) => (
                                                      <tr key={i} className="border-b last:border-0">
                                                        <td className="py-2 px-1">{m.name}</td>
                                                        <td className="py-2 px-1">
                                                          ${m.cost_per_unit}
                                                        </td>
                                                        <td className="py-2 px-1">{m.quantity}</td>
                                                        <td className="py-2 px-1">${m.cost}</td>
                                                      </tr>
                                                    ))}
                                                  </tbody>
                                                </table>
                                              </div>
                                            )}
                                        </div>
                                      )}
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

          {/* RIGHT COLUMN: summary, address, photos, additional details */}
          <div className="w-1/2 ml-auto mt-14 pt-1">
            <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden">
              <SectionBoxSubtitle>Summary</SectionBoxSubtitle>
              {Object.keys(selectedServicesState).length === 0 ? (
                <div className="text-left text-gray-500 text-medium mt-4">
                  No services selected
                </div>
              ) : (
                <>
                  {Object.entries(categoriesBySection).map(([sectionName, catIds]) => {
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

                          // chosen services for this cat
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
                                      <span className="truncate overflow-hidden">{svc.title}</span>
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

            {/* Address */}
            <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden mt-6">
              <h2 className="text-2xl font-medium text-gray-800 mb-4">Address</h2>
              <p className="text-gray-500 text-medium">{address || "No address provided"}</p>
            </div>

            {/* Photos */}
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