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
 * FinishingMaterial: describes items returned by /work/finishing_materials
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
 * Formats a number with commas, e.g. 1000 -> "1,000.00"
 */
function formatWithSeparator(value: number): string {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(value);
}

/** Save data to sessionStorage */
function saveToSession(key: string, value: any) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(key, JSON.stringify(value));
  }
}

/** Load data from sessionStorage */
function loadFromSession<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  const savedValue = sessionStorage.getItem(key);
  try {
    return savedValue ? JSON.parse(savedValue) : defaultValue;
  } catch (error) {
    console.error(`Error parsing sessionStorage key "${key}"`, error);
    return defaultValue;
  }
}

/** Convert "1-1-1" -> "1.1.1" for the server */
function convertServiceIdToApiFormat(serviceId: string) {
  return serviceId.replaceAll("-", ".");
}

/**
 * POST /work/finishing_materials (server does NOT support GET)
 * Returns something like:
 * {
 *   "sections": {
 *       "1": [...array of materials...],
 *       "2": [...],
 *       ...
 *   }
 * }
 */
async function fetchFinishingMaterials(workCode: string) {
  const url = "http://dev.thejamb.com/work/finishing_materials";

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
  return res.json(); // { sections: { "1": FinishingMaterial[], ... } }
}

/**
 * POST /calculate
 * The server does NOT support GET /calculate
 */
async function calculatePrice(params: {
  work_code: string;
  zipcode: string;
  unit_of_measurement: string;
  square: number;
  finishing_materials: string[];
}) {
  const url = "http://dev.thejamb.com/calculate";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    // 400 with {error: "..."} is possible if there's a business logic issue
    throw new Error(`Failed to calculate price (work_code=${params.work_code}).`);
  }
  return res.json();
}

export default function Details() {
  const router = useRouter();
  const { location } = useLocation();

  /**
   * 1) Load user-chosen categories from session
   */
  const selectedCategories = loadFromSession<string[]>("services_selectedCategories", []);
  const [address, setAddress] = useState<string>(() => loadFromSession("address", ""));
  const description = loadFromSession<string>("description", "");
  const photos = loadFromSession<string[]>("photos", []);
  const searchQuery = loadFromSession<string>("services_searchQuery", "");

  // If none selected or no address, go back
  useEffect(() => {
    if (selectedCategories.length === 0 || !address) {
      router.push("/calculate");
    }
  }, [selectedCategories, address, router]);

  // If location changes in header, update address
  useEffect(() => {
    const newAddress = `${location.city || ""}, ${location.zip || ""}${
      location.country ? `, ${location.country}` : ""
    }`.trim();

    if (newAddress !== ", ,") {
      setAddress(newAddress);
      saveToSession("address", newAddress);
    }
  }, [location]);

  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Track expansions
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  /**
   * Build categoriesBySection from selectedCategories only
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
   * Build map from catId -> array of services in ALL_SERVICES
   * Also filter by searchQuery if needed
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
   * selectedServicesState: serviceId -> quantity
   */
  const [selectedServicesState, setSelectedServicesState] = useState<Record<string, number>>(
    () => loadFromSession("selectedServicesWithQuantity", {})
  );

  // serviceCosts: final cost for each service
  const [serviceCosts, setServiceCosts] = useState<Record<string, number>>({});

  /**
   * finishingMaterialsMapAll: we store the full data from server:
   * finishingMaterialsMapAll[serviceId] = { "sections": { "1": [FinishingMaterial,...], "2": [...], ... } }
   */
  const [finishingMaterialsMapAll, setFinishingMaterialsMapAll] = useState<
    Record<string, { sections: Record<string, FinishingMaterial[]> }>
  >({});

  /**
   * finishingMaterialSelections: which external_ids we currently pick for each service
   * By default, we pick the first item from each section => one finishing material per section.
   */
  const [finishingMaterialSelections, setFinishingMaterialSelections] = useState<
    Record<string, string[]>
  >({});

  // manualInputValue: store raw text input
  const [manualInputValue, setManualInputValue] = useState<Record<string, string | null>>({});

  // Save changes
  useEffect(() => {
    saveToSession("selectedServicesWithQuantity", selectedServicesState);
  }, [selectedServicesState]);

  /**
   * expand/collapse category
   */
  function toggleCategory(catId: string) {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  }

  /**
   * Toggle a service: if on -> quantity=1; if off -> remove
   */
  async function handleServiceToggle(serviceId: string) {
    setSelectedServicesState((prev) => {
      if (prev[serviceId]) {
        const updated = { ...prev };
        delete updated[serviceId];
        return updated;
      }
      return { ...prev, [serviceId]: 1 };
    });
    setWarningMessage(null);

    // If not loaded finishing materials
    if (!finishingMaterialsMapAll[serviceId]) {
      try {
        const dotFormat = convertServiceIdToApiFormat(serviceId);
        const data = await fetchFinishingMaterials(dotFormat); 
        // data might look like { sections: { "1": [ {...}, {...} ], "2": [ ... ] } }

        // Сохраним весь ответ
        setFinishingMaterialsMapAll((prev) => ({
          ...prev,
          [serviceId]: data,
        }));

        // По умолчанию берём "первый" материал из каждой "sections" => external_id
        const singleSelections: string[] = [];
        const sectionsObj = data.sections || {};
        for (const [sectKey, arr] of Object.entries(sectionsObj)) {
          if (Array.isArray(arr) && arr.length > 0) {
            singleSelections.push(arr[0].external_id);
          }
        }

        // Запишем выбор в finishingMaterialSelections
        setFinishingMaterialSelections((prev) => ({
          ...prev,
          [serviceId]: singleSelections,
        }));
      } catch (error) {
        console.error("Error fetching finishing materials:", error);
      }
    }
  }

  /**
   * Placeholder: user might pick a different finishing material from the same section
   * For example:
   * handleChangeMaterial(serviceId, sectionKey, newExternalId)
   */
  function handleChangeMaterial(
    serviceId: string,
    sectionKey: string,
    newExternalId: string
  ) {
    // We won't code UI logic here, just an example
    setFinishingMaterialSelections((prev) => {
      const oldArray = prev[serviceId] || [];
      // Suppose oldArray currently has one external_id per section => we need to replace the entry for this section
      // but we need a mapping from (section -> external_id). To keep it simple, let's pretend oldArray is small
      // In real code, you'd store a map: Record<sectionKey, string>. We'll keep it simple.
      return {
        ...prev,
        [serviceId]: [...oldArray.filter((id) => id !== newExternalId), newExternalId],
      };
    });
  }

  /**
   * +/- buttons
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
    setManualInputValue((prev) => ({ ...prev, [serviceId]: null }));
  }

  /**
   * Manual input
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
   * On blur, if empty => revert
   */
  function handleBlurInput(serviceId: string) {
    if (!manualInputValue[serviceId]) {
      setManualInputValue((prev) => ({ ...prev, [serviceId]: null }));
    }
  }

  /**
   * Clear all
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
   * Recalc cost whenever user changes selectedServices or finishingMaterialSelections
   */
  useEffect(() => {
    const serviceIds = Object.keys(selectedServicesState);
    if (serviceIds.length === 0) {
      setServiceCosts({});
      return;
    }

    const { zip, country } = location;
    if (country !== "United States" || !/^\d{5}$/.test(zip)) {
      setWarningMessage(
        "Currently, our service is only available for US ZIP codes (5 digits)."
      );
      return;
    }

    serviceIds.forEach(async (serviceId) => {
      try {
        const quantity = selectedServicesState[serviceId] || 1;

        // finishingMaterialsMapAll[serviceId] = { sections: { "1": [...], ... } }
        // finishingMaterialSelections[serviceId] = ["203728679", ...] (one per section by default)
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
  }, [
    selectedServicesState,
    finishingMaterialSelections, // добавим, чтобы при смене материала был пересчёт
    location,
  ]);

  /**
   * Calculate total
   */
  function calculateTotal() {
    return Object.values(serviceCosts).reduce((acc, cost) => acc + (cost || 0), 0);
  }

  /**
   * handleNext => validate, go to estimate
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
   * Helper: getCategoryNameById
   */
  function getCategoryNameById(catId: string): string {
    const categoryObj = ALL_CATEGORIES.find((c) => c.id === catId);
    return categoryObj ? categoryObj.title : catId;
  }

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto">
        <BreadCrumb items={CALCULATE_STEPS} />

        {/* Top: title + Next button */}
        <div className="flex justify-between items-start mt-8">
          <SectionBoxTitle>Choose a Service and Quantity</SectionBoxTitle>
          <Button onClick={handleNext}>Next →</Button>
        </div>

        {/* "No service?" + Clear */}
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

        {/* Warning messages */}
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
                    // array of services in this category
                    const servicesForCategory = categoryServicesMap[catId] || [];
                    // how many are selected
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

                              const finalCost = serviceCosts[svc.id] || 0;

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
                                          {/* decrement */}
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

                                      {/* If not the last chosen one, draw divider */}
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

          {/* RIGHT: Summary, Address, Photos, Additional details */}
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
                          // chosen services
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
                                      style={{
                                        gridTemplateColumns: "40% 30% 25%",
                                      }}
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
                  {/* Subtotal */}
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