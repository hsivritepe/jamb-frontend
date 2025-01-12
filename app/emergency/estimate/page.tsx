"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import BreadCrumb from "@/components/ui/BreadCrumb";
import { EMERGENCY_STEPS } from "@/constants/navigation";
import { SectionBoxTitle } from "@/components/ui/SectionBoxTitle";
import { SectionBoxSubtitle } from "@/components/ui/SectionBoxSubtitle";
import { EMERGENCY_SERVICES } from "@/constants/emergency";
import { ALL_SERVICES } from "@/constants/services";
import ServiceTimePicker from "@/components/ui/ServiceTimePicker";
import { useLocation } from "@/context/LocationContext"; // for userState
import { taxRatesUSA } from "@/constants/taxRatesUSA"; // table with { state, combinedStateAndLocalTaxRate }[]

// session utils
import { getSessionItem, setSessionItem } from "@/utils/session";
// format helper
import { formatWithSeparator } from "@/utils/format";

/**
 * Returns a numeric tax rate for a given state. Example: "California" => 8.85
 * If not found, fallback to 8.25
 */
function getTaxRateForState(stateName: string): number {
  if (!stateName.trim()) return 8.25; // default fallback
  const found = taxRatesUSA.taxRates.find(
    (row) => row.state.toLowerCase() === stateName.toLowerCase()
  );
  return found ? found.combinedStateAndLocalTaxRate : 8.25;
}

/**
 * Converts camelCase or PascalCase to a more readable format.
 */
function capitalizeAndTransform(text: string): string {
  return text
    .replace(/([A-Z])/g, " $1")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}

export default function EmergencyEstimate() {
  const router = useRouter();

  // Get userState from location context if available
  const { location } = useLocation();
  const userState = location?.state || ""; // e.g. "Texas" or "California"

  // Date/time selection (coefficient)
  const [showModal, setShowModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(() =>
    getSessionItem("selectedTime", null)
  );
  const [timeCoefficient, setTimeCoefficient] = useState<number>(() =>
    getSessionItem("timeCoefficient", 1)
  );

  // 1) Load data from session
  const selectedActivities = getSessionItem<Record<string, Record<string, number>>>(
    "selectedActivities",
    {}
  );
  const calculationResultsMap = getSessionItem<Record<string, any>>(
    "calculationResultsMap",
    {}
  );
  const fullAddress = getSessionItem<string>("fullAddress", "");
  const photos = getSessionItem<string[]>("photos", []);
  const description = getSessionItem<string>("description", "");

  // 2) If no data => redirect
  useEffect(() => {
    if (
      !selectedActivities ||
      Object.keys(selectedActivities).length === 0 ||
      !fullAddress.trim()
    ) {
      router.push("/emergency");
    }
  }, [selectedActivities, fullAddress, router]);

  // Keep time selection in session
  useEffect(() => {
    setSessionItem("selectedTime", selectedTime);
  }, [selectedTime]);

  useEffect(() => {
    setSessionItem("timeCoefficient", timeCoefficient);
  }, [timeCoefficient]);

  /**
   * Returns the cost breakdown for a given activityKey from calculationResultsMap.
   */
  function getCalcResult(activityKey: string) {
    return calculationResultsMap[activityKey] || null;
  }

  /**
   * Sums up all "work_cost" from calculationResultsMap for selected activities.
   */
  function calculateTotalLabor(): number {
    let total = 0;
    Object.values(selectedActivities).forEach((acts) => {
      Object.keys(acts).forEach((activityKey) => {
        const r = getCalcResult(activityKey);
        if (r) {
          total += parseFloat(r.work_cost) || 0;
        }
      });
    });
    return total;
  }

  /**
   * Sums up all "material_cost" from calculationResultsMap for selected activities.
   */
  function calculateTotalMaterials(): number {
    let total = 0;
    Object.values(selectedActivities).forEach((acts) => {
      Object.keys(acts).forEach((activityKey) => {
        const r = getCalcResult(activityKey);
        if (r) {
          total += parseFloat(r.material_cost) || 0;
        }
      });
    });
    return total;
  }

  // 3) Calculate labor, materials
  const laborSubtotal = calculateTotalLabor();
  const materialsSubtotal = calculateTotalMaterials();
  const finalLabor = laborSubtotal * timeCoefficient; // apply timeCoefficient to labor only

  // 4) Fees (example: 20% on labor, 10% on materials)
  const serviceFeeOnLabor = finalLabor * 0.2;
  const serviceFeeOnMaterials = materialsSubtotal * 0.1;

  // 5) sumBeforeTax
  const sumBeforeTax =
    finalLabor + materialsSubtotal + serviceFeeOnLabor + serviceFeeOnMaterials;

  // 6) Tax from userState => getTaxRateForState
  const taxRatePercent = getTaxRateForState(userState);
  const taxAmount = sumBeforeTax * (taxRatePercent / 100);

  const grandTotal = sumBeforeTax + taxAmount;

  /**
   * Build stepsList from EMERGENCY_SERVICES for immediate steps.
   */
  const shownServices = new Set<string>();
  const stepsList = Object.entries(selectedActivities)
    .flatMap(([, activities]) => {
      return Object.keys(activities).map((activityKey) => {
        let matchedService = null;
        let matchedServiceKey = "";

        // match activityKey to EMERGENCY_SERVICES
        for (const category of Object.keys(EMERGENCY_SERVICES)) {
          const catServices = EMERGENCY_SERVICES[category]?.services || {};
          for (const svcKey in catServices) {
            if (catServices[svcKey]?.activities?.[activityKey]) {
              matchedService = catServices[svcKey];
              matchedServiceKey = svcKey;
              break;
            }
          }
          if (matchedService) break;
        }

        if (!matchedService || shownServices.has(matchedServiceKey)) return null;
        shownServices.add(matchedServiceKey);

        return {
          serviceName: capitalizeAndTransform(matchedServiceKey),
          steps:
            matchedService.steps && matchedService.steps.length > 0
              ? matchedService.steps
              : [],
        };
      });
    })
    .filter(Boolean) as { serviceName: string; steps: any[] }[];

  // 7) Save steps in session
  useEffect(() => {
    setSessionItem("filteredSteps", stepsList);
  }, [stepsList]);

  function handleProceedToCheckout() {
    if (!selectedTime) {
      alert("Please select a start date before proceeding.");
      return;
    }
    router.push("/emergency/checkout");
  }

  /**
   * Instead of using found.category from ALL_SERVICES,
   * we derive the category name from EMERGENCY_SERVICES to match steps.
   */
  function getAllChosenActivities() {
    const res: {
      activityKey: string;
      title: string;
      description?: string;
      quantity: number;
      finalCost: number;
      breakdown: any;
      category: string; // derived from EMERGENCY_SERVICES
    }[] = [];

    // For each selected activity
    Object.values(selectedActivities).forEach((acts) => {
      Object.entries(acts).forEach(([activityKey, quantity]) => {
        const foundService = ALL_SERVICES.find((x) => x.id === activityKey);
        if (!foundService) return;

        const br = getCalcResult(activityKey);
        let sumCost = 0;
        if (br) {
          const lab = parseFloat(br.work_cost) || 0;
          const mat = parseFloat(br.material_cost) || 0;
          sumCost = lab + mat;
        }

        // Find matching EMERGENCY_SERVICES "category"
        let matchedCategoryName = "Uncategorized";
        outerLoop: for (const catKey of Object.keys(EMERGENCY_SERVICES)) {
          // catKey e.g. "plumbing", "electrical", ...
          const catObj = EMERGENCY_SERVICES[catKey];
          if (!catObj?.services) continue;
          for (const svcK of Object.keys(catObj.services)) {
            const svcObj = catObj.services[svcK];
            if (svcObj.activities && svcObj.activities[activityKey]) {
              matchedCategoryName = capitalizeAndTransform(catKey);
              break outerLoop;
            }
          }
        }

        res.push({
          activityKey,
          title: foundService.title,
          description: foundService.description,
          quantity,
          finalCost: sumCost,
          breakdown: br,
          category: matchedCategoryName,
        });
      });
    });
    return res;
  }

  const chosenActivitiesRaw = getAllChosenActivities();

  // Group them by derived category
  const groupedByCategory: Record<string, typeof chosenActivitiesRaw> = {};
  chosenActivitiesRaw.forEach((act) => {
    if (!groupedByCategory[act.category]) {
      groupedByCategory[act.category] = [];
    }
    groupedByCategory[act.category].push(act);
  });

  // Sort category names for consistent numbering
  const categoriesInOrder = Object.keys(groupedByCategory).sort();

  // Save fees, taxRate to session for next page
  useEffect(() => {
    setSessionItem("serviceFeeOnLabor", serviceFeeOnLabor);
    setSessionItem("serviceFeeOnMaterials", serviceFeeOnMaterials);
    setSessionItem("userTaxRate", taxRatePercent);
  }, [serviceFeeOnLabor, serviceFeeOnMaterials, taxRatePercent]);

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto">
        <BreadCrumb items={EMERGENCY_STEPS} />
      </div>

      <div className="container mx-auto py-12">
        <div className="flex gap-12">
          {/* LEFT COLUMN */}
          <div className="w-[700px]">
            <div className="bg-brand-light p-6 rounded-xl border border-gray-300 overflow-hidden">
              <SectionBoxSubtitle>Estimate for Emergency Services</SectionBoxSubtitle>

              {/* Numbered categories & services */}
              <div className="mt-4 space-y-4">
                {categoriesInOrder.map((catName, catIndex) => {
                  const catServices = groupedByCategory[catName];
                  const catNumber = catIndex + 1;

                  return (
                    <div key={catName} className="space-y-2 border-b pb-2">
                      <h2 className="font-semibold text-xl text-gray-800">
                        {catNumber}. {catName}
                      </h2>

                      {catServices.map((act, svcIndex) => {
                        const serviceNumber = `${catNumber}.${svcIndex + 1}`;

                        return (
                          <div key={act.activityKey} className="mt-3 ml-4">
                            <h3 className="font-medium text-lg text-gray-800 mb-1">
                              {serviceNumber}. {act.title}
                            </h3>
                            {act.description && (
                              <div className="text-sm text-gray-500">{act.description}</div>
                            )}
                            <div className="flex justify-between items-center mt-1">
                              <div className="text-gray-700 font-medium">
                                {act.quantity}{" "}
                                {
                                  ALL_SERVICES.find((x) => x.id === act.activityKey)
                                    ?.unit_of_measurement
                                }
                              </div>
                              <span className="text-gray-700 font-medium text-lg mr-3">
                                ${formatWithSeparator(act.finalCost)}
                              </span>
                            </div>

                            {/* Cost Breakdown */}
                            {act.breakdown && (
                              <div className="mt-3 p-4 bg-gray-50 border rounded">
                                <div className="flex justify-between mb-2">
                                  <span className="text-md font-medium text-gray-800">Labor</span>
                                  <span className="text-md font-medium text-gray-700">
                                    {act.breakdown.work_cost
                                      ? `$${formatWithSeparator(parseFloat(act.breakdown.work_cost))}`
                                      : "—"}
                                  </span>
                                </div>
                                <div className="flex justify-between mb-2">
                                  <span className="text-md font-medium text-gray-800">
                                    Materials, tools &amp; equipment
                                  </span>
                                  <span className="text-md font-medium text-gray-700">
                                    {act.breakdown.material_cost
                                      ? `$${formatWithSeparator(
                                          parseFloat(act.breakdown.material_cost)
                                        )}`
                                      : "—"}
                                  </span>
                                </div>
                                {Array.isArray(act.breakdown.materials) &&
                                  act.breakdown.materials.length > 0 && (
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
                                          {act.breakdown.materials.map((m: any, idx: number) => (
                                            <tr
                                              key={`${m.external_id}-${idx}`}
                                              className="align-top"
                                            >
                                              <td className="py-2 px-1">{m.name}</td>
                                              <td className="py-2 px-1">
                                                $
                                                {formatWithSeparator(parseFloat(m.cost_per_unit))}
                                              </td>
                                              <td className="py-2 px-3">{m.quantity}</td>
                                              <td className="py-2 px-3">
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

              {/* Price summary */}
              <div className="pt-4 mt-4">
                {/* Labor */}
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-lg text-gray-600">Labor</span>
                  <span className="font-semibold text-lg text-gray-600">
                    ${formatWithSeparator(finalLabor)}
                  </span>
                </div>

                {/* Materials */}
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-lg text-gray-600">
                    Materials, tools &amp; equipment
                  </span>
                  <span className="font-semibold text-lg text-gray-600">
                    ${formatWithSeparator(materialsSubtotal)}
                  </span>
                </div>

                {/* Show surcharge/discount if timeCoefficient != 1 */}
                {timeCoefficient !== 1 && (
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">
                      {timeCoefficient > 1 ? "Surcharge (urgency)" : "Discount (date selection)"}
                    </span>
                    <span
                      className={`font-semibold text-lg ${
                        timeCoefficient > 1 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {timeCoefficient > 1 ? "+" : "-"}$
                      {formatWithSeparator(Math.abs(finalLabor - laborSubtotal))}
                    </span>
                  </div>
                )}

                {/* 20% on labor */}
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Service Fee (20% on labor)</span>
                  <span className="font-semibold text-lg text-gray-600">
                    ${formatWithSeparator(serviceFeeOnLabor)}
                  </span>
                </div>

                {/* 10% on materials */}
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">
                    Delivery &amp; Processing (10% on materials)
                  </span>
                  <span className="font-semibold text-lg text-gray-600">
                    ${formatWithSeparator(serviceFeeOnMaterials)}
                  </span>
                </div>

                {/* Subtotal */}
                <div className="flex justify-between mb-2 mt-4">
                  <span className="font-semibold text-xl text-gray-800">Subtotal</span>
                  <span className="font-semibold text-xl text-gray-800">
                    ${formatWithSeparator(sumBeforeTax)}
                  </span>
                </div>

                {/* Tax */}
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">
                    Sales tax
                    {userState ? ` (${userState})` : ""}
                    {taxRatePercent ? ` (${taxRatePercent.toFixed(2)}%)` : ""}
                  </span>
                  <span>${formatWithSeparator(taxAmount)}</span>
                </div>

                {/* Grand total */}
                <div className="flex justify-between text-2xl font-semibold mt-4">
                  <span>Total</span>
                  <span>${formatWithSeparator(grandTotal)}</span>
                </div>

                {/* Button: select or change time */}
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
              </div>

              {/* Address */}
              <div className="mt-6">
                <h3 className="font-semibold text-xl text-gray-800">Address</h3>
                <p className="text-gray-500 mt-2">{fullAddress}</p>
              </div>

              {/* Photos */}
              <div className="mt-6">
                <h3 className="font-semibold text-xl text-gray-800">Uploaded Photos</h3>
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
                  <p className="text-medium text-gray-500 mt-2">No photos uploaded</p>
                )}
              </div>

              {/* Problem Description */}
              <div className="mt-6">
                <h3 className="font-semibold text-xl text-gray-800">Problem Description</h3>
                <p className="text-gray-500 mt-2 whitespace-pre-wrap">
                  {description || "No description provided"}
                </p>
              </div>

              {/* Action buttons */}
              <div className="mt-6 space-y-4">
                <button
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium"
                  onClick={handleProceedToCheckout}
                >
                  Proceed to Checkout →
                </button>
                <button
                  onClick={() => router.back()}
                  className="w-full text-brand border border-brand py-3 rounded-lg font-medium"
                >
                  Add more services →
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Immediate Steps (do not remove) */}
          <div className="flex-1">
            <SectionBoxTitle>Immediate Steps for Selected Services</SectionBoxTitle>
            <div className="mt-8 space-y-8">
              {stepsList.map((serviceObj, index) => {
                if (serviceObj && serviceObj.steps.length > 0) {
                  return (
                    <div
                      key={serviceObj.serviceName + index}
                      className="bg-white p-6 rounded-lg border border-gray-200"
                    >
                      <SectionBoxSubtitle>{serviceObj.serviceName}</SectionBoxSubtitle>
                      <div className="mt-4 space-y-4">
                        {serviceObj.steps.map((step: any) => (
                          <div key={step.title} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="text-lg font-medium">{step.step_number}.</h4>
                              <h4 className="text-lg font-medium">{step.title}</h4>
                            </div>
                            <p className="text-gray-600">{step.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div
                      key={serviceObj?.serviceName + index}
                      className="bg-white p-6 rounded-lg border border-gray-200"
                    >
                      <SectionBoxSubtitle>{serviceObj?.serviceName}</SectionBoxSubtitle>
                      <p className="text-gray-600 mt-4">No steps available.</p>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}