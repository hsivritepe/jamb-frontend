"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BreadCrumb from "@/components/ui/BreadCrumb";
import { SectionBoxSubtitle } from "@/components/ui/SectionBoxSubtitle";
import { CALCULATE_STEPS } from "@/constants/navigation";
import { ALL_CATEGORIES } from "@/constants/categories";
import { ALL_SERVICES } from "@/constants/services";
import ServiceTimePicker from "@/components/ui/ServiceTimePicker";
import { useLocation } from "@/context/LocationContext";   // we get the state from context
import { taxRatesUSA } from "@/constants/taxRatesUSA";      // tax table

/**
 * Formats a numeric value with a comma/decimal separator, exactly two decimals.
 */
function formatWithSeparator(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Loads data from sessionStorage. Returns a defaultValue if on server or parsing fails.
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
 * Saves data to sessionStorage if in the browser environment.
 */
function saveToSession(key: string, value: any) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(key, JSON.stringify(value));
  }
}

/**
 * Returns the combined state+local tax rate (in percentage) for a given state name from taxRatesUSA.
 * Example: if state = "Texas", returns 8.19 (which means 8.19%).
 * If not found, returns 0.
 */
function getTaxRateForState(stateName: string): number {
  if (!stateName) return 0;
  const row = taxRatesUSA.taxRates.find(
    (t) => t.state.toLowerCase() === stateName.toLowerCase()
  );
  return row ? row.combinedStateAndLocalTaxRate : 0;
}

export default function Estimate() {
  const router = useRouter();

  // 1) Get user location from context => { city, zip, country, state, ... }
  const { location } = useLocation();
  const userState = location.state || ""; // e.g. "California"

  // 2) Load data from sessionStorage
  const selectedServicesState: Record<string, number> = loadFromSession(
    "selectedServicesWithQuantity",
    {}
  );
  const calculationResultsMap: Record<string, any> = loadFromSession(
    "calculationResultsMap",
    {}
  );
  const address: string = loadFromSession("address", "");
  const photos: string[] = loadFromSession("photos", []);
  const description: string = loadFromSession("description", "");
  const selectedCategories: string[] = loadFromSession(
    "services_selectedCategories",
    []
  );
  const searchQuery: string = loadFromSession("services_searchQuery", "");

  // This object indicates that the user has their own finishing materials for some services.
  const clientOwnedMaterials: Record<string, string[]> = loadFromSession(
    "clientOwnedMaterials",
    {}
  );

  // If user lands here without any data, redirect to /calculate
  useEffect(() => {
    if (
      Object.keys(selectedServicesState).length === 0 ||
      !address ||
      selectedCategories.length === 0
    ) {
      router.push("/calculate");
    }
  }, [selectedServicesState, address, selectedCategories, router]);

  // 3) Build section/category grouping
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
    let matchedServices = ALL_SERVICES.filter((svc) =>
      svc.id.startsWith(`${catId}-`)
    );
    if (searchQuery) {
      matchedServices = matchedServices.filter((svc) =>
        svc.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    categoryServicesMap[catId] = matchedServices;
  });

  // 4) Local state to hold overridden calc results if user removes finishing materials
  const [overrideCalcResults, setOverrideCalcResults] = useState<
    Record<string, any>
  >({});

  /**
   * Returns the effective calculation result for a service,
   * either from overrideCalcResults or the original calculationResultsMap.
   */
  function getCalcResultFor(serviceId: string): any {
    return overrideCalcResults[serviceId] || calculationResultsMap[serviceId];
  }

  /**
   * Removes finishing materials for a given service by setting material_cost=0,
   * materials=[] and total=work_cost. This simulates the user selecting "I have my own materials."
   */
  function removeFinishingMaterials(serviceId: string) {
    const original = getCalcResultFor(serviceId);
    if (!original) return;

    // Construct new object with zeroed out material cost
    const newObj = {
      ...original,
      material_cost: "0.00",
      materials: [],
      total: original.work_cost, // total = labor cost only
    };

    setOverrideCalcResults((prev) => ({
      ...prev,
      [serviceId]: newObj,
    }));
  }

  /**
   * Calculates total labor cost by summing all work_cost across selected services.
   * (no timeCoefficient applied here; we will apply it later)
   */
  function calculateLaborSubtotal(): number {
    let totalLabor = 0;
    for (const serviceId of Object.keys(selectedServicesState)) {
      const calcResult = getCalcResultFor(serviceId);
      if (!calcResult) continue;
      totalLabor += parseFloat(calcResult.work_cost) || 0;
    }
    return totalLabor;
  }

  /**
   * Calculates total materials cost by summing all material_cost across selected services.
   */
  function calculateMaterialsSubtotal(): number {
    let totalMat = 0;
    for (const serviceId of Object.keys(selectedServicesState)) {
      const calcResult = getCalcResultFor(serviceId);
      if (!calcResult) continue;
      totalMat += parseFloat(calcResult.material_cost) || 0;
    }
    return totalMat;
  }

  // 5) Summation logic
  const laborSubtotal = calculateLaborSubtotal();
  const materialsSubtotal = calculateMaterialsSubtotal();

  // We'll apply timeCoefficient to labor only. So finalLabor = laborSubtotal * timeCoefficient
  const [showModal, setShowModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(() =>
    loadFromSession("selectedTime", null)
  );
  const [timeCoefficient, setTimeCoefficient] = useState<number>(() =>
    loadFromSession("timeCoefficient", 1)
  );

  useEffect(() => {
    saveToSession("selectedTime", selectedTime);
  }, [selectedTime]);

  useEffect(() => {
    saveToSession("timeCoefficient", timeCoefficient);
  }, [timeCoefficient]);

  // final labor after timeCoefficient
  const finalLabor = laborSubtotal * timeCoefficient;

  // sumBeforeTax = final labor + materials
  const sumBeforeTax = finalLabor + materialsSubtotal;

  // 6) Find tax rate from the state (e.g. "California" => 8.85%)
  // If not found => 0
  const taxRatePercent = getTaxRateForState(userState); // e.g. 8.85
  const taxAmount = sumBeforeTax * (taxRatePercent / 100); // e.g. 0.0885

  // final total = sumBeforeTax + tax
  const finalTotal = sumBeforeTax + taxAmount;

  /**
   * Proceeds to the next step (e.g., /calculate/checkout).
   */
  function handleProceedToCheckout() {
    router.push("/calculate/checkout");
  }

  /**
   * Returns category title by id, or the id if no match found.
   */
  function getCategoryNameById(catId: string): string {
    const cat = ALL_CATEGORIES.find((x) => x.id === catId);
    return cat ? cat.title : catId;
  }

  // Helper counters to produce "1. Electrical, 1.1. Smoke Detector, 1.1.1. Battery-Operated..."
  // We'll iterate over sections with index i, then categories with index j, then services with index k.
  return (
    <main className="min-h-screen pt-24">
      <div className="container mx-auto">
        <BreadCrumb items={CALCULATE_STEPS} />
      </div>

      <div className="container mx-auto py-12">
        <div className="flex gap-12">
          {/* Left column with Estimate content */}
          <div className="w-[700px]">
            <div className="bg-brand-light p-6 rounded-xl border border-gray-300 overflow-hidden">
              <SectionBoxSubtitle>Estimate</SectionBoxSubtitle>

              {/* 1) Group by section -> categories -> services with numbering */}
              <div className="mt-4 space-y-4">
                {Object.entries(categoriesBySection).map(([sectionName, catIds], i) => {
                  // "i" is the index of the section
                  const sectionIndex = i + 1; // for numbering
                  // Filter out categories that have no selected services
                  const catsWithSelected = catIds.filter((catId) => {
                    const services = categoryServicesMap[catId] || [];
                    return services.some((s) => selectedServicesState[s.id] != null);
                  });
                  if (catsWithSelected.length === 0) return null;

                  return (
                    <div key={sectionName} className="space-y-4">
                      {/* Example: "1. Electrical" */}
                      <h3 className="text-xl font-semibold text-gray-800">
                        {sectionIndex}. {sectionName}
                      </h3>

                      {catsWithSelected.map((catId, j) => {
                        const catIndex = j + 1;
                        const servicesInCat = categoryServicesMap[catId] || [];
                        const chosenServices = servicesInCat.filter(
                          (s) => selectedServicesState[s.id] != null
                        );
                        if (chosenServices.length === 0) return null;

                        const catName = getCategoryNameById(catId);

                        return (
                          <div key={catId} className="ml-4 space-y-4">
                            {/* Example: "1.1. Smoke Detector" */}
                            <h4 className="text-xl font-medium text-gray-700">
                              {sectionIndex}.{catIndex}. {catName}
                            </h4>

                            {chosenServices.map((svc, k) => {
                              const svcIndex = k + 1;
                              const quantity = selectedServicesState[svc.id] || 1;
                              const calcResult = getCalcResultFor(svc.id);
                              const finalCost =
                                calcResult ? parseFloat(calcResult.total) || 0 : 0;

                              return (
                                <div key={svc.id} className="flex flex-col gap-2 mb-2">
                                  {/* Example: "1.1.1. Battery-Operated Smoke Detector Installation" */}
                                  <div>
                                    <h3 className="font-medium text-lg text-gray-800">
                                      {sectionIndex}.{catIndex}.{svcIndex}. {svc.title}
                                    </h3>
                                    {svc.description && (
                                      <div className="text-sm text-gray-500 mt-1">
                                        {svc.description}
                                      </div>
                                    )}
                                  </div>

                                  {/* quantity/unit + final cost on the same row */}
                                  <div className="flex items-center justify-between mt-2">
                                    <div className="text-medium font-medium text-gray-800">
                                      {quantity} {svc.unit_of_measurement}
                                    </div>
                                    <span className="text-gray-800 font-medium text-lg">
                                      ${formatWithSeparator(finalCost)}
                                    </span>
                                  </div>

                                  {/* "Remove finishing materials" if user indicated client-owned */}
                                  {clientOwnedMaterials[svc.id] && (
                                    <button
                                      onClick={() => removeFinishingMaterials(svc.id)}
                                      className="text-red-600 text-sm underline mt-2 self-end"
                                    >
                                      Remove finishing materials
                                    </button>
                                  )}

                                  {/* Cost Breakdown always visible */}
                                  {calcResult && (
                                    <div className="mt-1 p-4 bg-gray-50 border rounded">
                                      {/* Labor cost only */}
                                      <div className="flex justify-between mb-4">
                                        <span className="text-md font-medium text-gray-800">
                                          Labor:
                                        </span>
                                        <span className="text-sm text-gray-700">
                                          {calcResult.work_cost
                                            ? `$${formatWithSeparator(
                                                parseFloat(calcResult.work_cost)
                                              )}`
                                            : "—"}
                                        </span>
                                      </div>

                                      {/* Materials list */}
                                      {Array.isArray(calcResult.materials) &&
                                        calcResult.materials.length > 0 && (
                                          <div className="mt-2">
                                            <h5 className="text-md font-medium text-gray-800 mb-2">
                                              Materials:
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
                                                {calcResult.materials.map((m: any, idx: number) => (
                                                  <tr
                                                    key={`${m.external_id}-${idx}`}
                                                    className="align-top"
                                                  >
                                                    <td className="py-3 px-1">{m.name}</td>
                                                    <td className="py-3 px-1">
                                                      ${formatWithSeparator(
                                                        parseFloat(m.cost_per_unit)
                                                      )}
                                                    </td>
                                                    <td className="py-3 px-3">{m.quantity}</td>
                                                    <td className="py-3 px-3">
                                                      ${formatWithSeparator(parseFloat(m.cost))}
                                                    </td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {/* Summary: 
                  - laborSubtotal (before timeCoefficient)
                  - materialsSubtotal
                  - timeCoefficient => finalLabor
                  - sumBeforeTax
                  - taxRatePercent
                  - finalTotal
              */}
              <div className="pt-4 mt-4 border-t">
                {/* Labor (no coefficient) */}
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-lg text-gray-600">Labor</span>
                  <span className="font-semibold text-lg text-gray-600">
                    ${formatWithSeparator(laborSubtotal)}
                  </span>
                </div>

                {/* Materials */}
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-lg text-gray-600">Materials</span>
                  <span className="font-semibold text-lg text-gray-600">
                    ${formatWithSeparator(materialsSubtotal)}
                  </span>
                </div>

                {/* timeCoefficient => show if != 1 */}
                {timeCoefficient !== 1 && (
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">
                      {timeCoefficient > 1 ? "Surcharge (date selection)" : "Discount (day selection)"}
                    </span>
                    <span
                      className={`font-semibold text-lg ${
                        timeCoefficient > 1 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {/* difference: finalLabor - laborSubtotal */}
                      {timeCoefficient > 1 ? "+" : "-"}$
                      {formatWithSeparator(
                        Math.abs(finalLabor - laborSubtotal)
                      )}
                    </span>
                  </div>
                )}

                {/* finalLabor + materials = sumBeforeTax */}
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-xl text-gray-800">
                    Subtotal
                  </span>
                  <span className="font-semibold text-xl text-gray-800">
                    ${formatWithSeparator(sumBeforeTax)}
                  </span>
                </div>

                {/* tax if any */}
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">
                    Sales tax{userState ? ` (${userState})` : ""} 
                    {taxRatePercent > 0 ? ` (${taxRatePercent.toFixed(2)}%)` : ""}
                  </span>
                  <span>${formatWithSeparator(taxAmount)}</span>
                </div>

                {/* Button to open the time selection modal */}
                <button
                  onClick={() => setShowModal(true)}
                  className={`w-full py-3 rounded-lg font-medium mt-4 border ${
                    selectedTime
                      ? "text-red-500 border-red-500"
                      : "text-brand border-brand"
                  }`}
                >
                  {selectedTime ? "Change Date" : "Select Available Time"}
                </button>

                {selectedTime && (
                  <p className="mt-2 text-gray-700 text-center font-medium">
                    Selected Date:{" "}
                    <span className="text-blue-600">{selectedTime}</span>
                  </p>
                )}

                {/* Time selection modal */}
                {showModal && (
                  <ServiceTimePicker
                    // We pass only laborSubtotal as base, because timeCoefficient applies to labor alone
                    subtotal={laborSubtotal}
                    onClose={() => setShowModal(false)}
                    onConfirm={(date, coefficient) => {
                      setSelectedTime(date);
                      setTimeCoefficient(coefficient);
                      setShowModal(false);
                    }}
                  />
                )}

                {/* Final total */}
                <div className="flex justify-between text-2xl font-semibold mt-4">
                  <span>Total</span>
                  <span>${formatWithSeparator(finalTotal)}</span>
                </div>
              </div>

              {/* Address */}
              <div className="mt-6">
                <h3 className="font-semibold text-xl text-gray-800">Address</h3>
                <p className="text-gray-500 mt-2">
                  {address || "No address provided"}
                </p>
              </div>

              {/* Photos */}
              <div className="mt-6">
                <h3 className="font-semibold text-xl text-gray-800">
                  Uploaded Photos
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`Uploaded photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-300 transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <span className="text-white font-medium">
                          Photo {index + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {photos.length === 0 && (
                  <p className="text-medium text-gray-500 mt-2">
                    No photos uploaded
                  </p>
                )}
              </div>

              {/* Additional details */}
              <div className="mt-6">
                <h3 className="font-semibold text-xl text-gray-800">
                  Additional details
                </h3>
                <p className="text-gray-500 mt-2 whitespace-pre-wrap">
                  {description || "No details provided"}
                </p>
              </div>

              {/* Action buttons */}
              <div className="mt-6 space-y-4">
                <button
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium"
                  onClick={handleProceedToCheckout}
                >
                  Proceed to Checkout &nbsp;→
                </button>
                <button
                  onClick={() => router.push("/calculate/details")}
                  className="w-full text-brand border border-brand py-3 rounded-lg font-medium"
                >
                  Add more services &nbsp;→
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}