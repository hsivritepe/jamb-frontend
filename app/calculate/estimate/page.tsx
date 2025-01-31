"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BreadCrumb from "@/components/ui/BreadCrumb";
import { SectionBoxSubtitle } from "@/components/ui/SectionBoxSubtitle";
import { CALCULATE_STEPS } from "@/constants/navigation";
import { ALL_CATEGORIES } from "@/constants/categories";
import { ALL_SERVICES } from "@/constants/services";
import ServiceTimePicker from "@/components/ui/ServiceTimePicker";
import { useLocation } from "@/context/LocationContext"; 
import { taxRatesUSA } from "@/constants/taxRatesUSA";
import { setSessionItem, getSessionItem } from "@/utils/session";

/** Formats a number with commas and two decimals. */
function formatWithSeparator(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Formats a number with no decimals (for mobile). */
function formatMobileNoDecimals(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Returns combined state+local tax rate or 0 if not found. */
function getTaxRateForState(stateName: string): number {
  if (!stateName) return 0;
  const row = taxRatesUSA.taxRates.find(
    (t) => t.state.toLowerCase() === stateName.toLowerCase()
  );
  return row ? row.combinedStateAndLocalTaxRate : 0;
}

/**
 * The main "Estimate" page:
 */
export default function Estimate() {
  const router = useRouter();
  const { location } = useLocation();
  const userState = location.state || "";

  // Load from session
  const selectedServicesState: Record<string, number> =
    getSessionItem("selectedServicesWithQuantity", {});
  const calculationResultsMap: Record<string, any> =
    getSessionItem("calculationResultsMap", {});
  const address: string = getSessionItem("address", "");
  const photos: string[] = getSessionItem("photos", []);
  const description: string = getSessionItem("description", "");
  const selectedCategories: string[] = getSessionItem("services_selectedCategories", []);
  const searchQuery: string = getSessionItem("services_searchQuery", "");

  // If no services or address => redirect
  useEffect(() => {
    if (
      Object.keys(selectedServicesState).length === 0 ||
      !address ||
      selectedCategories.length === 0
    ) {
      router.push("/calculate");
    }
  }, [selectedServicesState, address, selectedCategories, router]);

  // Possibly track user-owned finishing materials
  const clientOwnedMaterials: Record<string, string[]> =
    getSessionItem("clientOwnedMaterials", {});

  // For overriding calculations
  const [overrideCalcResults, setOverrideCalcResults] = useState<Record<string, any>>({});

  /** Returns the effective calcResult. */
  function getCalcResultFor(serviceId: string) {
    return overrideCalcResults[serviceId] || calculationResultsMap[serviceId];
  }

  /** Zero out material costs. */
  function removeFinishingMaterials(serviceId: string) {
    const original = getCalcResultFor(serviceId);
    if (!original) return;
    const newObj = {
      ...original,
      material_cost: "0.00",
      materials: [],
      total: original.work_cost,
    };
    setOverrideCalcResults((old) => ({ ...old, [serviceId]: newObj }));
  }

  // Summations
  function calculateLaborSubtotal(): number {
    let total = 0;
    for (const serviceId of Object.keys(selectedServicesState)) {
      const c = getCalcResultFor(serviceId);
      if (!c) continue;
      total += parseFloat(c.work_cost) || 0;
    }
    return total;
  }
  function calculateMaterialsSubtotal(): number {
    let total = 0;
    for (const serviceId of Object.keys(selectedServicesState)) {
      const c = getCalcResultFor(serviceId);
      if (!c) continue;
      total += parseFloat(c.material_cost) || 0;
    }
    return total;
  }

  const laborSubtotal = calculateLaborSubtotal();
  const materialsSubtotal = calculateMaterialsSubtotal();

  // time-based coefficient
  const [selectedTime, setSelectedTime] = useState<string | null>(() =>
    getSessionItem("selectedTime", null)
  );
  const [timeCoefficient, setTimeCoefficient] = useState<number>(() =>
    getSessionItem("timeCoefficient", 1)
  );

  useEffect(() => {
    setSessionItem("selectedTime", selectedTime);
  }, [selectedTime]);
  useEffect(() => {
    setSessionItem("timeCoefficient", timeCoefficient);
  }, [timeCoefficient]);

  // final labor
  const finalLabor = laborSubtotal * timeCoefficient;

  // fees
  const serviceFeeOnLabor = finalLabor * 0.15;
  const serviceFeeOnMaterials = materialsSubtotal * 0.05;
  useEffect(() => {
    setSessionItem("serviceFeeOnLabor", serviceFeeOnLabor);
    setSessionItem("serviceFeeOnMaterials", serviceFeeOnMaterials);
  }, [serviceFeeOnLabor, serviceFeeOnMaterials]);

  // sum before tax => tax => final
  const sumBeforeTax = finalLabor + materialsSubtotal + serviceFeeOnLabor + serviceFeeOnMaterials;
  const taxRatePercent = getTaxRateForState(userState);
  const taxAmount = sumBeforeTax * (taxRatePercent / 100);
  const finalTotal = sumBeforeTax + taxAmount;

  function handleProceedToCheckout() {
    router.push("/calculate/checkout");
  }

  // Build category structure
  const categoriesWithSection = selectedCategories
    .map((catId) => ALL_CATEGORIES.find((x) => x.id === catId) || null)
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
    let arr = ALL_SERVICES.filter((svc) => svc.id.startsWith(`${catId}-`));
    if (searchQuery) {
      arr = arr.filter((svc) =>
        svc.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    categoryServicesMap[catId] = arr;
  });

  function getCategoryNameById(catId: string): string {
    const found = ALL_CATEGORIES.find((x) => x.id === catId);
    return found ? found.title : catId;
  }

  return (
    <main className="min-h-screen pt-24">
      <div className="container mx-auto">
        <BreadCrumb items={CALCULATE_STEPS} />
      </div>

      <div className="container mx-auto py-12 flex flex-col xl:flex-row gap-12">
        {/* LEFT column */}
        <div className="w-full xl:max-w-[700px] bg-brand-light p-6 rounded-xl border border-gray-300 overflow-hidden">
          <SectionBoxSubtitle>Estimate for Selected Services</SectionBoxSubtitle>

          <div className="mt-4 space-y-4">
            {Object.entries(categoriesBySection).map(([sectionName, catIds], i) => {
              const sectionIndex = i + 1;
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
                    const chosen = servicesArr.filter((x) => selectedServicesState[x.id] != null);
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

                              {/* If user has "own materials" => show a button */}
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
                                      Materials, tools &amp; equipment
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
                                            {calcResult.materials.map((m: any, idx: number) => {
                                              const priceVal = parseFloat(m.cost_per_unit);
                                              const subtotalVal = parseFloat(m.cost);
                                              return (
                                                <tr
                                                  key={`${m.external_id}-${idx}`}
                                                  className="align-top"
                                                >
                                                  <td className="py-3 px-1">{m.name}</td>

                                                  {/* Price: mobile => no decimals, desktop => with decimals */}
                                                  <td className="py-3 px-1">
                                                    <span className="block sm:hidden">
                                                      ${formatMobileNoDecimals(priceVal)}
                                                    </span>
                                                    <span className="hidden sm:block">
                                                      ${formatWithSeparator(priceVal)}
                                                    </span>
                                                  </td>

                                                  <td className="py-3 px-3">{m.quantity}</td>

                                                  {/* Subtotal: same approach */}
                                                  <td className="py-3 px-3">
                                                    <span className="block sm:hidden">
                                                      ${formatMobileNoDecimals(subtotalVal)}
                                                    </span>
                                                    <span className="hidden sm:block">
                                                      ${formatWithSeparator(subtotalVal)}
                                                    </span>
                                                  </td>
                                                </tr>
                                              );
                                            })}
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
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-lg text-gray-600">Labor total</span>
              <span className="font-semibold text-lg text-gray-600">
                ${formatWithSeparator(laborSubtotal)}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-lg text-gray-600">
                Materials, tools &amp; equipment
              </span>
              <span className="font-semibold text-lg text-gray-600">
                ${formatWithSeparator(materialsSubtotal)}
              </span>
            </div>

            {timeCoefficient !== 1 && (
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">
                  {timeCoefficient > 1
                    ? "Surcharge (date selection)"
                    : "Discount (date selection)"}
                </span>
                <span
                  className={`font-semibold text-lg ${
                    timeCoefficient > 1 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {timeCoefficient > 1 ? "+" : "-"}$
                  {formatWithSeparator(
                    Math.abs(laborSubtotal * timeCoefficient - laborSubtotal)
                  )}
                </span>
              </div>
            )}

            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Service Fee (15% on labor)</span>
              <span className="font-semibold text-lg text-gray-600">
                ${formatWithSeparator(serviceFeeOnLabor)}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">
                Delivery &amp; Processing (5% on materials)
              </span>
              <span className="font-semibold text-lg text-gray-600">
                ${formatWithSeparator(serviceFeeOnMaterials)}
              </span>
            </div>

            <div className="flex justify-between mb-2">
              <span className="font-semibold text-xl text-gray-800">Subtotal</span>
              <span className="font-semibold text-xl text-gray-800">
                ${formatWithSeparator(sumBeforeTax)}
              </span>
            </div>

            <div className="flex justify-between mb-2">
              <span className="text-gray-600">
                Sales tax {userState ? `(${userState})` : ""}
                {taxRatePercent > 0 ? ` (${taxRatePercent.toFixed(2)}%)` : ""}
              </span>
              <span>${formatWithSeparator(taxAmount)}</span>
            </div>

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

          {/* Buttons */}
          <div className="mt-6 space-y-4">
            <button
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
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

        {/* RIGHT column => ServiceTimePicker */}
        <div className="w-full xl:w-[500px]">
          <ServiceTimePicker
            subtotal={laborSubtotal}
            onConfirm={(date, coefficient) => {
              setSelectedTime(date);
              setTimeCoefficient(coefficient);
            }}
          />
        </div>
      </div>
    </main>
  );
}