"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import BreadCrumb from "@/components/ui/BreadCrumb";
import { SectionBoxSubtitle } from "@/components/ui/SectionBoxSubtitle";
import ServiceTimePicker from "@/components/ui/ServiceTimePicker";
import { CALCULATE_STEPS } from "@/constants/navigation";
import { ALL_CATEGORIES } from "@/constants/categories";
import { ALL_SERVICES } from "@/constants/services";
import { useLocation } from "@/context/LocationContext"; // for userState
import { taxRatesUSA } from "@/constants/taxRatesUSA";
import { setSessionItem, getSessionItem } from "@/utils/session";
import { servicesRecommendations } from "@/components/ServicesRecommendations";

/**
 * Formats a numeric value with commas and exactly two decimals.
 */
function formatWithSeparator(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Returns the combined state+local tax rate for a given state name.
 * If not found, returns 0.
 */
function getTaxRateForState(stateName: string): number {
  if (!stateName) return 0;
  const row = taxRatesUSA.taxRates.find(
    (t) => t.state.toLowerCase() === stateName.toLowerCase()
  );
  return row ? row.combinedStateAndLocalTaxRate : 0;
}

/**
 * Converts "1-1-1" => "1.1.1"
 */
function dashToDot(id: string): string {
  return id.replaceAll("-", ".");
}

/**
 * Converts "1.1.1" => "1-1-1"
 */
function dotToDash(id: string): string {
  return id.replaceAll(".", "-");
}

/**
 * (Optional) we can fetch minimal cost for recommended services if needed.
 * You can adjust the logic or remove if you don't need dynamic pricing in the sidebar.
 */
async function calculateRecommendedCost(
  workCode: string,
  zip: string,
  unit: string,
  quantity: number
) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://dev.thejamb.com";
  const url = `${baseUrl}/calculate`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      work_code: workCode,
      zipcode: zip,
      unit_of_measurement: unit,
      square: quantity,
      finishing_materials: [],
    }),
  });
  if (!res.ok) {
    throw new Error(`Failed to calculate cost for recommended service: ${workCode}`);
  }
  return res.json();
}

/**
 * A small sidebar component that shows recommended activities.
 * It reads which services are currently selected (selectedServicesState),
 * looks up recommendations in servicesRecommendations, and then displays them.
 */
function RecommendedActivitiesSidebar({
  selectedServicesState,
}: {
  selectedServicesState: Record<string, number>;
}) {
  const router = useRouter();
  const { location } = useLocation();

  // We'll store minimal cost for each recommended service
  const [recommendedCosts, setRecommendedCosts] = useState<Record<string, number>>({});

  // Step 1: Collect recommended IDs in dash-format
  const recommendedIds = useMemo(() => {
    const recSet = new Set<string>();

    Object.keys(selectedServicesState).forEach((selectedDashId) => {
      const dotId = dashToDot(selectedDashId); // "1-1-1" => "1.1.1"

      // Decompose something like "1.1.1" => [ "1", "1", "1" ]
      const [secKey, catKey, actKey] = dotId.split(".");
      if (!secKey || !catKey || !actKey) return;

      const sectionObj = servicesRecommendations[secKey];
      if (!sectionObj) return;

      const categoryObj = sectionObj.categories[`${secKey}.${catKey}`];
      if (!categoryObj) return;

      const activityObj = categoryObj.activities[dotId];
      if (!activityObj) return;

      const recs = activityObj.recommendedActivities || {};
      // recs keys are dot-format => convert them to dash-format
      for (const recDotKey of Object.keys(recs)) {
        const recDashKey = dotToDash(recDotKey);
        recSet.add(recDashKey);
      }
    });

    // Exclude the services that are already selected
    const filtered = Array.from(recSet).filter((dashId) => !selectedServicesState[dashId]);
    return filtered;
  }, [selectedServicesState]);

  // Step 2: Convert recommended IDs => actual service objects (title, description, etc.)
  const recommendedServices = useMemo(() => {
    return recommendedIds.map((dashId) => {
      const found = ALL_SERVICES.find((x) => x.id === dashId);
      if (!found) {
        // fallback object
        return {
          id: dashId,
          title: dashId,
          description: "",
          unit_of_measurement: "each",
          min_quantity: 1,
        };
      }
      return found;
    });
  }, [recommendedIds]);

  // Step 3: Optionally fetch minimal cost for each recommended service
  useEffect(() => {
    (async () => {
      // We assume location.zip is a valid 5-digit US ZIP code
      if (!location?.zip) return;
      const zip = location.zip;

      const nextCosts: Record<string, number> = {};
      for (const svc of recommendedServices) {
        try {
          const dot = dashToDot(svc.id);
          const qty = svc.min_quantity || 1;
          const resp = await calculateRecommendedCost(dot, zip, svc.unit_of_measurement, qty);
          const labor = parseFloat(resp.work_cost) || 0;
          const mat = parseFloat(resp.material_cost) || 0;
          nextCosts[svc.id] = labor + mat;
        } catch (err) {
          console.warn("Failed to load recommended cost for", svc.id, err);
        }
      }
      setRecommendedCosts(nextCosts);
    })();
  }, [recommendedServices, location]);

  // Step 4: "Add" button. For now, let's just navigate to "/calculate/details?addService=..."
  function handleAddService(serviceId: string) {
    router.push(`/calculate/details?addService=${serviceId}`);
  }

  // Render
  return (
    <div className="min-w-[300px]">
      <h2 className="text-xl font-semibold mb-4">Maybe You Also Need</h2>
      {recommendedServices.length === 0 ? (
        <p className="text-sm text-gray-500">No additional recommendations.</p>
      ) : (
        <div className="space-y-4">
          {recommendedServices.map((svc) => {
            const totalCost = recommendedCosts[svc.id] || 0;
            return (
              <div key={svc.id} className="bg-white p-3 rounded border border-gray-300 shadow-sm">
                <h3 className="text-md font-semibold text-gray-800">{svc.title}</h3>
                {svc.description && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {svc.description}
                  </p>
                )}
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-blue-600 font-semibold">
                    ${formatWithSeparator(totalCost)}
                  </span>
                  <button
                    onClick={() => handleAddService(svc.id)}
                    className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Main Estimate component
 * Left column: everything as before
 * Right column: only the RecommendedActivitiesSidebar
 */
export default function Estimate() {
  const router = useRouter();
  const { location } = useLocation();
  const userState = location.state || ""; // example: "California"

  // Load data from session
  const selectedServicesState: Record<string, number> = getSessionItem(
    "selectedServicesWithQuantity",
    {}
  );
  const calculationResultsMap: Record<string, any> = getSessionItem("calculationResultsMap", {});
  const address: string = getSessionItem("address", "");
  const photos: string[] = getSessionItem("photos", []);
  const description: string = getSessionItem("description", "");
  const selectedCategories: string[] = getSessionItem("services_selectedCategories", []);
  const searchQuery: string = getSessionItem("services_searchQuery", "");

  // If no data => redirect
  useEffect(() => {
    if (
      Object.keys(selectedServicesState).length === 0 ||
      !address ||
      selectedCategories.length === 0
    ) {
      router.push("/calculate");
    }
  }, [selectedServicesState, address, selectedCategories, router]);

  // Some user might have their own finishing materials => override
  const clientOwnedMaterials: Record<string, string[]> = getSessionItem(
    "clientOwnedMaterials",
    {}
  );

  // Local state for overriding calculation results if user removes finishing materials
  const [overrideCalcResults, setOverrideCalcResults] = useState<Record<string, any>>({});

  /**
   * Returns the effective calcResult for a service,
   * either from overrideCalcResults or from calculationResultsMap.
   */
  function getCalcResultFor(serviceId: string): any {
    return overrideCalcResults[serviceId] || calculationResultsMap[serviceId];
  }

  /**
   * Zeroes out material_cost and materials array for a given service,
   * simulating "user-provided" materials.
   */
  function removeFinishingMaterials(serviceId: string) {
    const original = getCalcResultFor(serviceId);
    if (!original) return;

    const newObj = {
      ...original,
      material_cost: "0.00",
      materials: [],
      total: original.work_cost, // labor cost only
    };
    setOverrideCalcResults((prev) => ({
      ...prev,
      [serviceId]: newObj,
    }));
  }

  /**
   * Sums up labor cost for all selected services (before applying timeCoefficient).
   */
  function calculateLaborSubtotal(): number {
    let total = 0;
    for (const serviceId of Object.keys(selectedServicesState)) {
      const calcResult = getCalcResultFor(serviceId);
      if (!calcResult) continue;
      total += parseFloat(calcResult.work_cost) || 0;
    }
    return total;
  }

  /**
   * Sums up materials cost for all selected services.
   */
  function calculateMaterialsSubtotal(): number {
    let total = 0;
    for (const serviceId of Object.keys(selectedServicesState)) {
      const calcResult = getCalcResultFor(serviceId);
      if (!calcResult) continue;
      total += parseFloat(calcResult.material_cost) || 0;
    }
    return total;
  }

  const laborSubtotal = calculateLaborSubtotal();
  const materialsSubtotal = calculateMaterialsSubtotal();

  // Time selection for labor cost
  const [showModal, setShowModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(() =>
    getSessionItem("selectedTime", null)
  );
  const [timeCoefficient, setTimeCoefficient] = useState<number>(() =>
    getSessionItem("timeCoefficient", 1)
  );

  // Save timeCoefficient and selectedTime
  useEffect(() => {
    setSessionItem("selectedTime", selectedTime);
  }, [selectedTime]);
  useEffect(() => {
    setSessionItem("timeCoefficient", timeCoefficient);
  }, [timeCoefficient]);

  // final labor
  const finalLabor = laborSubtotal * timeCoefficient;

  // new fees
  const serviceFeeOnLabor = finalLabor * 0.15;
  const serviceFeeOnMaterials = materialsSubtotal * 0.05;

  // store them in session
  useEffect(() => {
    setSessionItem("serviceFeeOnLabor", serviceFeeOnLabor);
    setSessionItem("serviceFeeOnMaterials", serviceFeeOnMaterials);
  }, [serviceFeeOnLabor, serviceFeeOnMaterials]);

  // sumBeforeTax
  const sumBeforeTax = finalLabor + materialsSubtotal + serviceFeeOnLabor + serviceFeeOnMaterials;

  // tax
  const taxRatePercent = getTaxRateForState(userState);
  const taxAmount = sumBeforeTax * (taxRatePercent / 100);

  const finalTotal = sumBeforeTax + taxAmount;

  function handleProceedToCheckout() {
    router.push("/calculate/checkout");
  }

  // Category grouping
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
    let matched = ALL_SERVICES.filter((svc) => svc.id.startsWith(`${catId}-`));
    if (searchQuery) {
      matched = matched.filter((svc) =>
        svc.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    categoryServicesMap[catId] = matched;
  });

  function getCategoryNameById(catId: string): string {
    const c = ALL_CATEGORIES.find((x) => x.id === catId);
    return c ? c.title : catId;
  }

  return (
    <main className="min-h-screen pt-24">
      <div className="container mx-auto">
        <BreadCrumb items={CALCULATE_STEPS} />
      </div>

      <div className="container mx-auto py-12">
        <div className="flex gap-12">
          {/* Left column: unchanged */}
          <div className="w-[700px]">
            <div className="bg-brand-light p-6 rounded-xl border border-gray-300 overflow-hidden">
              <SectionBoxSubtitle>Estimate for Selected Services</SectionBoxSubtitle>

              <div className="mt-4 space-y-4">
                {Object.entries(categoriesBySection).map(([sectionName, catIds], i) => {
                  const sectionIndex = i + 1;
                  // filter categories with chosen services
                  const catsWithServices = catIds.filter((catId) => {
                    const arr = categoryServicesMap[catId] || [];
                    return arr.some((s) => selectedServicesState[s.id] != null);
                  });
                  if (catsWithServices.length === 0) return null;

                  return (
                    <div key={sectionName} className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {sectionIndex}. {sectionName}
                      </h3>

                      {catsWithServices.map((catId, j) => {
                        const catIndex = j + 1;
                        const servicesArr = categoryServicesMap[catId] || [];
                        const chosen = servicesArr.filter(
                          (x) => selectedServicesState[x.id] != null
                        );
                        if (chosen.length === 0) return null;
                        const catName = getCategoryNameById(catId);

                        return (
                          <div key={catId} className="ml-4 space-y-4">
                            <h4 className="text-xl font-medium text-gray-700">
                              {sectionIndex}.{catIndex}. {catName}
                            </h4>

                            {chosen.map((svc, k) => {
                              const svcIndex = k + 1;
                              const qty = selectedServicesState[svc.id] || 1;
                              const calcResult = getCalcResultFor(svc.id);
                              const finalCost = calcResult
                                ? parseFloat(calcResult.total) || 0
                                : 0;

                              return (
                                <div key={svc.id} className="flex flex-col gap-2 mb-2">
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

                                  <div className="flex items-center justify-between mt-2">
                                    <div className="text-medium font-medium text-gray-700">
                                      {qty} {svc.unit_of_measurement}
                                    </div>
                                    <span className="text-gray-700 font-medium text-lg mr-3">
                                      ${formatWithSeparator(finalCost)}
                                    </span>
                                  </div>

                                  {clientOwnedMaterials[svc.id] && (
                                    <button
                                      onClick={() => removeFinishingMaterials(svc.id)}
                                      className="text-red-600 text-sm underline mt-2 self-end"
                                    >
                                      Remove finishing materials
                                    </button>
                                  )}

                                  {calcResult && (
                                    <div className="mt-1 p-4 bg-gray-50 border rounded">
                                      <div className="flex justify-between mb-4">
                                        <span className="text-md font-medium text-gray-800">
                                          Labor
                                        </span>
                                        <span className="text-md font-medium text-gray-700">
                                          {calcResult.work_cost
                                            ? `$${formatWithSeparator(
                                                parseFloat(calcResult.work_cost)
                                              )}`
                                            : "—"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between mb-3">
                                        <span className="text-md font-medium text-gray-800">
                                          Materials, tools & equipment
                                        </span>
                                        <span className="text-md font-medium text-gray-700">
                                          {calcResult.material_cost
                                            ? `$${formatWithSeparator(
                                                parseFloat(calcResult.material_cost)
                                              )}`
                                            : "—"}
                                        </span>
                                      </div>

                                      {Array.isArray(calcResult.materials) &&
                                        calcResult.materials.length > 0 && (
                                          <div className="mt-2">
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
                                                      $
                                                      {formatWithSeparator(
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

              {/* Summary */}
              <div className="pt-4 mt-4 border-t">
                {/* Labor */}
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-lg text-gray-600">Labor total</span>
                  <span className="font-semibold text-lg text-gray-600">
                    ${formatWithSeparator(laborSubtotal)}
                  </span>
                </div>

                {/* Materials */}
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-lg text-gray-600">
                    Materials, tools & equipment
                  </span>
                  <span className="font-semibold text-lg text-gray-600">
                    ${formatWithSeparator(materialsSubtotal)}
                  </span>
                </div>

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
                      {timeCoefficient > 1 ? "+" : "-"}$
                      {formatWithSeparator(Math.abs(laborSubtotal * timeCoefficient - laborSubtotal))}
                    </span>
                  </div>
                )}

                {/* Fees */}
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Service Fee (15% on labor)</span>
                  <span className="font-semibold text-lg text-gray-600">
                    ${formatWithSeparator(serviceFeeOnLabor)}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Delivery &amp; Processing (5% on materials)</span>
                  <span className="font-semibold text-lg text-gray-600">
                    ${formatWithSeparator(serviceFeeOnMaterials)}
                  </span>
                </div>

                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-xl text-gray-800">
                    Subtotal
                  </span>
                  <span className="font-semibold text-xl text-gray-800">
                    ${formatWithSeparator(sumBeforeTax)}
                  </span>
                </div>

                {/* tax */}
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">
                    Sales tax {userState ? `(${userState})` : ""}
                    {taxRatePercent > 0 ? ` (${taxRatePercent.toFixed(2)}%)` : ""}
                  </span>
                  <span>${formatWithSeparator(taxAmount)}</span>
                </div>

                {/* Time selection */}
                <button
                  onClick={() => setShowModal(true)}
                  className={`w-full py-3 rounded-lg font-medium mt-4 border ${
                    selectedTime ? "text-red-500 border-red-500" : "text-brand border-brand"
                  }`}
                >
                  {selectedTime ? "Change Date" : "Select Available Time"}
                </button>
                {selectedTime && (
                  <p className="mt-2 text-gray-700 text-center font-medium">
                    Selected Date: <span className="text-blue-600">{selectedTime}</span>
                  </p>
                )}
                {showModal && (
                  <ServiceTimePicker
                    subtotal={laborSubtotal}
                    onClose={() => setShowModal(false)}
                    onConfirm={(date, coefficient) => {
                      setSelectedTime(date);
                      setTimeCoefficient(coefficient);
                      setShowModal(false);
                    }}
                  />
                )}

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
                        <span className="text-white font-medium">Photo {index + 1}</span>
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

              {/* Buttons */}
              <div className="mt-6 space-y-4">
                <button
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium"
                  onClick={handleProceedToCheckout}
                >
                  Proceed to Checkout →
                </button>
                <button
                  onClick={() => router.push("/calculate/details")}
                  className="w-full text-brand border border-brand py-3 rounded-lg font-medium"
                >
                  Add more services →
                </button>
              </div>
            </div>
          </div>

          {/* Right column => ONLY the RecommendedActivitiesSidebar */}
          <div className="w-1/4 ml-auto mt-0 pt-1">
            <RecommendedActivitiesSidebar selectedServicesState={selectedServicesState} />
          </div>
        </div>
      </div>
    </main>
  );
}