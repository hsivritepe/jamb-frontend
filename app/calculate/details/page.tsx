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
  image?: string;
  unit_of_measurement: string;
  name: string;
  external_id: string;
  cost: string;
}

/**
 * formatWithSeparator:
 * Helper to format a numeric value with commas, e.g., 1000 -> "1,000.00"
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
 * getApiBaseUrl:
 * Returns the base API URL from environment variables or a fallback
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

  /** 
   * location from our custom context: 
   * includes { city, zip, country, ... }
   */
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

  // Potential warning shown above categories
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Expand/collapse categories (store catId in a Set)
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

  // Map catId -> array of services
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

  // manualInputValue => user typed quantity for each service
  const [manualInputValue, setManualInputValue] = useState<Record<string, string | null>>({});

  // Store the entire JSON from /calculate for each service to show the breakdown
  const [calculationResultsMap, setCalculationResultsMap] = useState<Record<string, any>>({});

  // Track which services have details expanded
  const [expandedServiceDetails, setExpandedServiceDetails] = useState<Set<string>>(new Set());

  // Track any finishing materials that are "client-owned" (highlight in red)
  // clientOwnedMaterials[serviceId] = Set of external_ids
  const [clientOwnedMaterials, setClientOwnedMaterials] = useState<Record<string, Set<string>>>({});

  // which service + section user clicked => open modal
  const [showModalServiceId, setShowModalServiceId] = useState<string | null>(null);
  const [showModalSectionName, setShowModalSectionName] = useState<string | null>(null);

  // Save if services changed
  useEffect(() => {
    saveToSession("selectedServicesWithQuantity", selectedServicesState);
  }, [selectedServicesState]);

  /**
   * ensureFinishingMaterialsLoaded: fetch finishing materials if not loaded yet
   * and select defaults in finishingMaterialSelections if not present
   */
  async function ensureFinishingMaterialsLoaded(serviceId: string) {
    try {
      if (!finishingMaterialsMapAll[serviceId]) {
        const dot = convertServiceIdToApiFormat(serviceId);
        const data = await fetchFinishingMaterials(dot);

        finishingMaterialsMapAll[serviceId] = data;
        setFinishingMaterialsMapAll({ ...finishingMaterialsMapAll });
      }

      // If there's no finishingMaterialSelections for this service => pick the first from each section
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

  /**
   * fetchFinishingMaterialsForCategory:
   * For all services in a category, fetch finishing materials if not loaded
   */
  async function fetchFinishingMaterialsForCategory(services: (typeof ALL_SERVICES)[number][]) {
    const promises = services.map(async (svc) => {
      if (!finishingMaterialsMapAll[svc.id]) {
        try {
          const dot = convertServiceIdToApiFormat(svc.id);
          const data = await fetchFinishingMaterials(dot);

          finishingMaterialsMapAll[svc.id] = data;
          // pick the first item from each section
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

  /** toggleCategory: expand/collapse a category panel */
  function toggleCategory(catId: string) {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) {
        next.delete(catId);
      } else {
        next.add(catId);
        // fetch finishing materials for all services in this cat
        const servicesInCat = categoryServicesMap[catId] || [];
        fetchFinishingMaterialsForCategory(servicesInCat);
      }
      return next;
    });
  }

  /** handleServiceToggle: user toggles a service ON/OFF */
  function handleServiceToggle(serviceId: string) {
    setSelectedServicesState((old) => {
      const isOn = !!old[serviceId];
      if (isOn) {
        // Turn OFF => remove from relevant states
        const updated = { ...old };
        delete updated[serviceId];

        const fmCopy = { ...finishingMaterialSelections };
        delete fmCopy[serviceId];
        setFinishingMaterialSelections(fmCopy);

        const muCopy = { ...manualInputValue };
        delete muCopy[serviceId];
        setManualInputValue(muCopy);

        const crCopy = { ...calculationResultsMap };
        delete crCopy[serviceId];
        setCalculationResultsMap(crCopy);

        const scCopy = { ...serviceCosts };
        delete scCopy[serviceId];
        setServiceCosts(scCopy);

        // also remove from clientOwnedMaterials if any
        const coCopy = { ...clientOwnedMaterials };
        delete coCopy[serviceId];
        setClientOwnedMaterials(coCopy);

        return updated;
      } else {
        // Turn ON => set quantity to minQ
        const found = ALL_SERVICES.find((s) => s.id === serviceId);
        if (!found) return old;
        const minQ = found.min_quantity ?? 1;

        const updated = { ...old, [serviceId]: minQ };
        setManualInputValue((mOld) => ({ ...mOld, [serviceId]: String(minQ) }));

        // Ensure finishing materials
        ensureFinishingMaterialsLoaded(serviceId);
        return updated;
      }
    });
    setWarningMessage(null);
  }

  /** handleQuantityChange: increment/decrement the quantity */
  function handleQuantityChange(serviceId: string, increment: boolean, unit: string) {
    const found = ALL_SERVICES.find((x) => x.id === serviceId);
    if (!found) return;
    const minQ = found.min_quantity ?? 1;
    const maxQ = found.max_quantity ?? 999999;

    setSelectedServicesState((old) => {
      const curVal = old[serviceId] || minQ;
      let nextVal = increment ? curVal + 1 : curVal - 1;
      if (nextVal < minQ) nextVal = minQ;
      if (nextVal > maxQ) {
        nextVal = maxQ;
        setWarningMessage(`Maximum quantity for "${found.title}" is ${maxQ}.`);
      }
      return {
        ...old,
        [serviceId]: unit === "each" ? Math.round(nextVal) : nextVal,
      };
    });

    // Reset manual input
    setManualInputValue((old) => ({ ...old, [serviceId]: null }));
  }

  /** handleManualQuantityChange: user typed a quantity directly */
  function handleManualQuantityChange(serviceId: string, value: string, unit: string) {
    const found = ALL_SERVICES.find((x) => x.id === serviceId);
    if (!found) return;
    const minQ = found.min_quantity ?? 1;
    const maxQ = found.max_quantity ?? 999999;

    setManualInputValue((old) => ({ ...old, [serviceId]: value }));
    let numericVal = parseFloat(value.replace(/,/g, "")) || 0;
    if (numericVal < minQ) {
      numericVal = minQ;
    }
    if (numericVal > maxQ) {
      numericVal = maxQ;
      setWarningMessage(`Maximum quantity for "${found.title}" is ${maxQ}.`);
    }

    setSelectedServicesState((old) => ({
      ...old,
      [serviceId]: unit === "each" ? Math.round(numericVal) : numericVal,
    }));
  }

  /** handleBlurInput: if user left the input empty, revert to null */
  function handleBlurInput(serviceId: string) {
    if (!manualInputValue[serviceId]) {
      setManualInputValue((old) => ({ ...old, [serviceId]: null }));
    }
  }

  /** clearAllSelections: reset everything */
  function clearAllSelections() {
    const c = window.confirm(
      "Are you sure you want to clear all selected services? This will also collapse all expanded categories."
    );
    if (!c) return;

    setSelectedServicesState({});
    setExpandedCategories(new Set());
    setFinishingMaterialSelections({});
    setManualInputValue({});
    setCalculationResultsMap({});
    setServiceCosts({});
    setClientOwnedMaterials({});
  }

  /**
   * Recalculate price whenever services or location changes
   */
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

    // For each service => call /calculate
    serviceIds.forEach(async (serviceId) => {
      try {
        const quantity = selectedServicesState[serviceId];
        const finishingIds = finishingMaterialSelections[serviceId] || [];
        const foundS = ALL_SERVICES.find((x) => x.id === serviceId);
        const unit = foundS?.unit_of_measurement || "each";
        const dot = convertServiceIdToApiFormat(serviceId);

        // Ensure finishing materials loaded
        await ensureFinishingMaterialsLoaded(serviceId);

        const resp = await calculatePrice({
          work_code: dot,
          zipcode: zip,
          unit_of_measurement: unit,
          square: quantity,
          finishing_materials: finishingIds,
        });

        const labor = parseFloat(resp.work_cost) || 0;
        const mat = parseFloat(resp.material_cost) || 0;
        const tot = labor + mat;

        setServiceCosts((old) => ({ ...old, [serviceId]: tot }));
        setCalculationResultsMap((old) => ({ ...old, [serviceId]: resp }));
      } catch (err) {
        console.error("Error calculating price:", err);
      }
    });
  }, [selectedServicesState, finishingMaterialSelections, location]);

  /** calculateTotal: sum the final cost of all selected services */
  function calculateTotal() {
    return Object.values(serviceCosts).reduce((acc, val) => acc + val, 0);
  }

  /** handleNext: proceed to the "estimate" page */
  function handleNext() {
    if (Object.keys(selectedServicesState).length === 0) {
      setWarningMessage("Please select at least one service before proceeding.");
      return;
    }
    if (!address.trim()) {
      setWarningMessage("Please enter your address before proceeding.");
      return;
    }
    // Example: go to /calculate/estimate
    router.push("/calculate/estimate");
  }

  /** getCategoryNameById: returns category.title from ALL_CATEGORIES */
  function getCategoryNameById(catId: string): string {
    const c = ALL_CATEGORIES.find((x) => x.id === catId);
    return c ? c.title : catId;
  }

  /** toggleServiceDetails: expand/collapse the cost breakdown for a single service */
  function toggleServiceDetails(serviceId: string) {
    setExpandedServiceDetails((old) => {
      const next = new Set(old);
      if (next.has(serviceId)) {
        next.delete(serviceId);
      } else {
        next.add(serviceId);
      }
      return next;
    });
  }

  /** findFinishingMaterialObj: get FinishingMaterial by external_id */
  function findFinishingMaterialObj(serviceId: string, externalId: string): FinishingMaterial | null {
    const data = finishingMaterialsMapAll[serviceId];
    if (!data) return null;
    for (const arr of Object.values(data.sections || {})) {
      if (Array.isArray(arr)) {
        const f = arr.find((m) => m.external_id === externalId);
        if (f) return f;
      }
    }
    return null;
  }

  /** pickMaterial: choose a new finishing material => finishingMaterialSelections[serviceId] = [newExtId] */
  function pickMaterial(serviceId: string, newExtId: string) {
    finishingMaterialSelections[serviceId] = [newExtId];
    setFinishingMaterialSelections({ ...finishingMaterialSelections });
  }

  /** closeModal: hide the modal that lists finishing materials for a section */
  function closeModal() {
    setShowModalServiceId(null);
    setShowModalSectionName(null);
  }

  /** userHasOwnMaterial: highlight the finishing material in red, but don't remove it from calculation */
  function userHasOwnMaterial(serviceId: string, externalId: string) {
    if (!clientOwnedMaterials[serviceId]) {
      clientOwnedMaterials[serviceId] = new Set();
    }
    clientOwnedMaterials[serviceId].add(externalId);
    setClientOwnedMaterials({ ...clientOwnedMaterials });
  }

  /** onClickFinishingMaterialRow: user clicked a finishing material row => open the modal for that section */
  function onClickFinishingMaterialRow(serviceId: string, sectionName: string) {
    setShowModalServiceId(serviceId);
    setShowModalSectionName(sectionName);
  }

  /** save choice of services and materials to session storage*/
useEffect(() => {
  saveToSession("calculationResultsMap", calculationResultsMap);
}, [calculationResultsMap]);

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto">
        <BreadCrumb items={CALCULATE_STEPS} />

        {/* Top row */}
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
                    const selectedInThisCat = servicesForCategory.filter((svc) =>
                      Object.keys(selectedServicesState).includes(svc.id)
                    ).length;

                    const categoryName = getCategoryNameById(catId);

                    return (
                      <div
                        key={catId}
                        className={`p-4 border rounded-xl bg-white ${
                          selectedInThisCat > 0 ? "border-blue-500" : "border-gray-300"
                        }`}
                      >
                        {/* Category toggler */}
                        <button
                          onClick={() => toggleCategory(catId)}
                          className="flex justify-between items-center w-full"
                        >
                          <h3
                            className={`font-medium text-2xl ${
                              selectedInThisCat > 0 ? "text-blue-600" : "text-black"
                            }`}
                          >
                            {categoryName}
                            {selectedInThisCat > 0 && (
                              <span className="text-sm text-gray-500 ml-2">
                                ({selectedInThisCat} selected)
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
                              const isSelected = selectedServicesState[svc.id] != null;
                              const foundService = ALL_SERVICES.find((x) => x.id === svc.id);
                              const minQ = foundService?.min_quantity ?? 1;
                              const quantity = selectedServicesState[svc.id] ?? minQ;
                              const rawManual = manualInputValue[svc.id];
                              const manualValue =
                                rawManual != null ? rawManual : quantity.toString();

                              // final cost from serviceCosts
                              const finalCost = serviceCosts[svc.id] || 0;
                              // entire JSON from /calculate
                              const calcResult = calculationResultsMap[svc.id];
                              const detailsExpanded = expandedServiceDetails.has(svc.id);

                              return (
                                <div key={svc.id} className="space-y-2">
                                  {/* Service row */}
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
                                          <button
                                            onClick={() => toggleServiceDetails(svc.id)}
                                            className={`text-blue-500 text-sm ml-2 ${
                                              detailsExpanded ? "" : "underline"
                                            }`}
                                          >
                                            Details
                                          </button>
                                        </div>
                                      </div>

                                      {/* If not the last => divider */}
                                      {(() => {
                                        const chosen = servicesForCategory.filter(
                                          (s) => selectedServicesState[s.id] != null
                                        );
                                        const currentIndex = chosen.findIndex((s) => s.id === svc.id);
                                        if (currentIndex !== chosen.length - 1) {
                                          return <hr className="mt-4 border-gray-200" />;
                                        }
                                        return null;
                                      })()}

                                      {/* Cost Breakdown */}
                                      {calcResult && detailsExpanded && (
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
                                                {calcResult.work_cost
                                                  ? `$${calcResult.work_cost}`
                                                  : "—"}
                                              </span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-sm font-medium text-gray-700">
                                                Material cost:
                                              </span>
                                              <span className="text-sm text-gray-700">
                                                {calcResult.material_cost
                                                  ? `$${calcResult.material_cost}`
                                                  : "—"}
                                              </span>
                                            </div>
                                            <div className="flex justify-between border-t pt-2 mt-2">
                                              <span className="text-sm font-medium text-gray-800">
                                                Total:
                                              </span>
                                              <span className="text-sm font-medium text-gray-800">
                                                {calcResult.total
                                                  ? `$${calcResult.total}`
                                                  : `${
                                                      (parseFloat(calcResult.work_cost) || 0) +
                                                      (parseFloat(calcResult.material_cost) || 0)
                                                    }`}
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
                                                      <th className="py-2 px-1">Price</th>
                                                      <th className="py-2 px-1">Qty</th>
                                                      <th className="py-2 px-1">Subtotal</th>
                                                    </tr>
                                                  </thead>
                                                  <tbody className="divide-y divide-gray-200">
                                                    {calcResult.materials.map((m: any, i: number) => {
                                                      const fmObj = findFinishingMaterialObj(svc.id, m.external_id);
                                                      const hasImage = fmObj?.image?.length ? true : false;

                                                      // highlight row if client-owned or has image
                                                      const isClientOwned = clientOwnedMaterials[svc.id]?.has(
                                                        m.external_id
                                                      );

                                                      let rowClass = "";
                                                      if (isClientOwned) {
                                                        rowClass = "border border-red-500 bg-red-50";
                                                      } else if (hasImage) {
                                                        rowClass = "border border-blue-300 bg-white cursor-pointer";
                                                      }

                                                      return (
                                                        <tr
                                                          key={`${m.external_id}-${i}`}
                                                          className={`last:border-0 ${rowClass}`}
                                                          onClick={() => {
                                                            // if not client-owned and has image => open modal
                                                            if (!isClientOwned && hasImage) {
                                                              let foundSection: string | null = null;
                                                              const fmData = finishingMaterialsMapAll[svc.id];
                                                              if (fmData?.sections) {
                                                                for (const [secName, list] of Object.entries(
                                                                  fmData.sections
                                                                )) {
                                                                  if (
                                                                    Array.isArray(list) &&
                                                                    list.some(
                                                                      (mm) => mm.external_id === m.external_id
                                                                    )
                                                                  ) {
                                                                    foundSection = secName;
                                                                    break;
                                                                  }
                                                                }
                                                              }
                                                              setShowModalServiceId(svc.id);
                                                              setShowModalSectionName(foundSection);
                                                            }
                                                          }}
                                                        >
                                                          <td className="py-3 px-1">
                                                            {hasImage ? (
                                                              <div className="flex items-center gap-2">
                                                                <img
                                                                  src={fmObj?.image}
                                                                  alt={m.name}
                                                                  className="w-8 h-8 object-cover rounded"
                                                                />
                                                                <span>{m.name}</span>
                                                              </div>
                                                            ) : (
                                                              m.name
                                                            )}
                                                          </td>
                                                          <td className="py-3 px-1">${m.cost_per_unit}</td>
                                                          <td className="py-3 px-3">{m.quantity}</td>
                                                          <td className="py-3 px-3">${m.cost}</td>
                                                        </tr>
                                                      );
                                                    })}
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

          {/* RIGHT COLUMN: summary, address, photos, details */}
          <div className="w-1/2 ml-auto mt-14 pt-1">
            <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden">
              <SectionBoxSubtitle>Summary</SectionBoxSubtitle>
              {Object.keys(selectedServicesState).length === 0 ? (
                <div className="text-left text-gray-500 text-medium mt-4">
                  No services selected
                </div>
              ) : (
                <>
                  {Object.entries(categoriesBySection).map(([secName, catIds]) => {
                    const relevantCatIds = catIds.filter((catId) => {
                      const arr = categoryServicesMap[catId] || [];
                      return arr.some((svc) => selectedServicesState[svc.id] != null);
                    });
                    if (relevantCatIds.length === 0) return null;

                    return (
                      <div key={secName} className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                          {secName}
                        </h3>
                        {relevantCatIds.map((catId) => {
                          const catObj = ALL_CATEGORIES.find((c) => c.id === catId);
                          const catName = catObj ? catObj.title : catId;
                          const arr = categoryServicesMap[catId] || [];
                          const chosenServices = arr.filter((svc) => selectedServicesState[svc.id] != null);
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
                                      <span>{svc.title}</span>
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
              <p className="text-gray-500 text-medium">
                {address || "No address provided"}
              </p>
            </div>

            {/* Photos */}
            <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden mt-6">
              <h2 className="text-2xl font-medium text-gray-800 mb-4">Uploaded Photos</h2>
              <div className="grid grid-cols-2 gap-4">
                {photos.map((ph, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={ph}
                      alt={`Uploaded photo ${i + 1}`}
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

      {/* Modal for finishing materials selection if user clicks a row with an image */}
      {showModalServiceId &&
        showModalSectionName &&
        finishingMaterialsMapAll[showModalServiceId] &&
        finishingMaterialsMapAll[showModalServiceId].sections[showModalSectionName] && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            {/* Example fixed size: w-[700px], h-[750px] */}
            <div className="bg-white rounded-lg w-[700px] h-[750px] overflow-hidden relative flex flex-col">
              {/* Sticky header */}
              <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-xl font-semibold">
                  Choose a finishing material (section {showModalSectionName})
                </h2>
                <button
                  onClick={closeModal}
                  className="text-red-500 border border-red-500 px-2 py-1 rounded"
                >
                  Close
                </button>
              </div>

              {/* Info about current material (if any) */}
              {(() => {
                const currentSel = finishingMaterialSelections[showModalServiceId] || [];
                if (currentSel.length === 0) return null;
                const currentExtId = currentSel[0];
                const curMat = findFinishingMaterialObj(showModalServiceId, currentExtId);
                if (!curMat) return null;

                const curCost = parseFloat(curMat.cost || "0") || 0;

                return (
                  <div className="text-sm text-gray-600 border-b p-4 bg-white sticky top-[61px] z-10">
                    Current material:{" "}
                    <strong>
                      {curMat.name} (${formatWithSeparator(curCost)})
                    </strong>
                    <button
                      onClick={() => userHasOwnMaterial(showModalServiceId as string, currentExtId)}
                      className="ml-4 text-xs text-red-500 border border-red-500 px-2 py-1 rounded"
                    >
                      I have my own (Remove later)
                    </button>
                  </div>
                );
              })()}

              {/* scrollable content */}
              <div className="overflow-auto p-4 flex-1">
                {(() => {
                  const data = finishingMaterialsMapAll[showModalServiceId];
                  if (!data) return <p className="text-sm text-gray-500">No data found</p>;

                  const arr = data.sections[showModalSectionName] || [];
                  if (!Array.isArray(arr) || arr.length === 0) {
                    return (
                      <p className="text-sm text-gray-500">
                        No finishing materials in section {showModalSectionName}
                      </p>
                    );
                  }

                  // current selection
                  const curSel = finishingMaterialSelections[showModalServiceId] || [];
                  const currentExtId = curSel[0] || null;
                  let currentCost = 0;
                  if (currentExtId) {
                    const curMat = findFinishingMaterialObj(showModalServiceId, currentExtId);
                    if (curMat) currentCost = parseFloat(curMat.cost || "0") || 0;
                  }

                  return (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {arr.map((material, i) => {
                        if (!material.image) return null; // show only with image
                        const costNum = parseFloat(material.cost || "0") || 0;
                        const isSelected = currentExtId === material.external_id;
                        const diff = costNum - currentCost;
                        let diffStr = "";
                        let diffColor = "";
                        if (diff > 0) {
                          diffStr = `+${formatWithSeparator(diff)}`;
                          diffColor = "text-red-500";
                        } else if (diff < 0) {
                          diffStr = `-${formatWithSeparator(Math.abs(diff))}`;
                          diffColor = "text-green-600";
                        }

                        return (
                          <div
                            key={`${material.external_id}-${i}`}
                            className={`border rounded p-3 flex flex-col items-center cursor-pointer ${
                              isSelected ? "border-blue-500" : "border-gray-300"
                            }`}
                            onClick={() => {
                              finishingMaterialSelections[showModalServiceId] = [
                                material.external_id,
                              ];
                              setFinishingMaterialSelections({ ...finishingMaterialSelections });
                            }}
                          >
                            <img
                              src={material.image}
                              alt={material.name}
                              className="w-32 h-32 object-cover rounded"
                            />
                            <h3 className="text-sm font-medium mt-2 text-center line-clamp-2">
                              {material.name}
                            </h3>
                            <p className="text-xs text-gray-700">
                              ${formatWithSeparator(costNum)} / {material.unit_of_measurement}
                            </p>
                            {diff !== 0 && (
                              <p className={`text-xs mt-1 font-medium ${diffColor}`}>
                                {diffStr}
                              </p>
                            )}
                            {isSelected && (
                              <span className="text-xs text-blue-600 font-semibold mt-1">
                                Currently Selected
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
    </main>
  );
}