"use client";

export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import BreadCrumb from "@/components/ui/BreadCrumb";
import { EMERGENCY_STEPS } from "@/constants/navigation";
import { SectionBoxSubtitle } from "@/components/ui/SectionBoxSubtitle";
import { EMERGENCY_SERVICES } from "@/constants/emergency";
import { ALL_SERVICES } from "@/constants/services";
import ServiceTimePicker from "@/components/ui/ServiceTimePicker";
import { useLocation } from "@/context/LocationContext";
import { taxRatesUSA } from "@/constants/taxRatesUSA";
import { getSessionItem, setSessionItem } from "@/utils/session";
import { formatWithSeparator } from "@/utils/format";
import { usePhotos } from "@/context/PhotosContext";

/**
 * Formats a number without decimals for mobile displays.
 */
function formatMobileNoDecimals(num: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Returns a state-specific tax rate, defaulting to 8.25 if not found.
 */
function getTaxRateForState(stateName: string): number {
  if (!stateName.trim()) return 8.25;
  const found = taxRatesUSA.taxRates.find(
    (row) => row.state.toLowerCase() === stateName.toLowerCase()
  );
  return found ? found.combinedStateAndLocalTaxRate : 8.25;
}

/**
 * Inserts spaces before uppercase letters and capitalizes the string.
 */
function capitalizeAndTransform(text: string): string {
  return text
    .replace(/([A-Z])/g, " $1")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}

export default function EmergencyEstimate() {
  const router = useRouter();
  const { location } = useLocation();
  const userState = location?.state || "";

  // Time selection
  const [selectedTime, setSelectedTime] = useState<string | null>(() =>
    getSessionItem("selectedTime", null)
  );
  const [timeCoefficient, setTimeCoefficient] = useState<number>(() =>
    getSessionItem("timeCoefficient", 1)
  );

  // Data from session
  const selectedActivities = getSessionItem<
    Record<string, Record<string, number>>
  >("selectedActivities", {});
  const calculationResultsMap = getSessionItem<Record<string, any>>(
    "calculationResultsMap",
    {}
  );
  const fullAddress = getSessionItem<string>("fullAddress", "");
  // *** Use PhotosContext instead of session for photos ***
  const { photos } = usePhotos(); // <-- from context
  const description = getSessionItem<string>("description", "");

  // Redirect if missing data
  useEffect(() => {
    if (
      !selectedActivities ||
      Object.keys(selectedActivities).length === 0 ||
      !fullAddress.trim()
    ) {
      router.push("/emergency");
    }
  }, [selectedActivities, fullAddress, router]);

  // Persist time selection
  useEffect(() => {
    setSessionItem("selectedTime", selectedTime);
  }, [selectedTime]);
  useEffect(() => {
    setSessionItem("timeCoefficient", timeCoefficient);
  }, [timeCoefficient]);

  /**
   * Returns a calculation result for a given activity.
   */
  function getCalcResult(activityKey: string) {
    return calculationResultsMap[activityKey] || null;
  }

  /**
   * Sums labor costs for all selected activities.
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
   * Sums material costs for all selected activities.
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

  // Main calculations
  const laborSubtotal = calculateTotalLabor();
  const materialsSubtotal = calculateTotalMaterials();
  const finalLabor = laborSubtotal * timeCoefficient;
  const serviceFeeOnLabor = finalLabor * 0.2; // 20% on labor
  const serviceFeeOnMaterials = materialsSubtotal * 0.1; // 10% on materials
  const sumBeforeTax =
    finalLabor + materialsSubtotal + serviceFeeOnLabor + serviceFeeOnMaterials;

  // Tax logic
  const taxRatePercent = getTaxRateForState(userState);
  const taxAmount = sumBeforeTax * (taxRatePercent / 100);
  const grandTotal = sumBeforeTax + taxAmount;

  // Steps from EMERGENCY_SERVICES
  const shownServices = new Set<string>();
  const stepsList = Object.entries(selectedActivities)
    .flatMap(([, activities]) => {
      return Object.keys(activities).map((activityKey) => {
        let matchedService = null;
        let matchedServiceKey = "";

        // Find service in EMERGENCY_SERVICES
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
          steps: matchedService.steps?.length ? matchedService.steps : [],
        };
      });
    })
    .filter(Boolean) as { serviceName: string; steps: any[] }[];

  // Persist steps if needed
  useEffect(() => {
    setSessionItem("filteredSteps", stepsList);
  }, [stepsList]);

  function handleProceedToCheckout() {
    if (!selectedTime) {
      alert("Please pick a date before proceeding.");
      return;
    }
    router.push("/emergency/checkout");
  }

  // Build a list of chosen activities
  function getAllChosenActivities() {
    const res: {
      activityKey: string;
      title: string;
      description?: string;
      quantity: number;
      finalCost: number;
      breakdown: any;
      category: string;
    }[] = [];

    Object.values(selectedActivities).forEach((acts) => {
      Object.entries(acts).forEach(([activityKey, quantity]) => {
        const found = ALL_SERVICES.find((x) => x.id === activityKey);
        if (!found) return;
        const br = getCalcResult(activityKey);
        let sumCost = 0;
        if (br) {
          sumCost =
            (parseFloat(br.work_cost) || 0) +
            (parseFloat(br.material_cost) || 0);
        }

        // Find category from EMERGENCY_SERVICES
        let matchedCategoryName = "Uncategorized";
        outerLoop: for (const catKey of Object.keys(EMERGENCY_SERVICES)) {
          const catObj = EMERGENCY_SERVICES[catKey];
          if (!catObj?.services) continue;
          for (const svcK of Object.keys(catObj.services)) {
            if (
              catObj.services[svcK].activities &&
              catObj.services[svcK].activities[activityKey]
            ) {
              matchedCategoryName = capitalizeAndTransform(catKey);
              break outerLoop;
            }
          }
        }

        res.push({
          activityKey,
          title: found.title,
          description: found.description,
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
  const groupedByCategory: Record<string, typeof chosenActivitiesRaw> = {};
  chosenActivitiesRaw.forEach((act) => {
    if (!groupedByCategory[act.category]) {
      groupedByCategory[act.category] = [];
    }
    groupedByCategory[act.category].push(act);
  });
  const categoriesInOrder = Object.keys(groupedByCategory).sort();

  // Persist fees/tax
  useEffect(() => {
    setSessionItem("serviceFeeOnLabor", serviceFeeOnLabor);
    setSessionItem("serviceFeeOnMaterials", serviceFeeOnMaterials);
    setSessionItem("userTaxRate", taxRatePercent);
  }, [serviceFeeOnLabor, serviceFeeOnMaterials, taxRatePercent]);

  // Show/hide immediate steps
  const [showSteps, setShowSteps] = useState<boolean>(false);

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto">
        <BreadCrumb items={EMERGENCY_STEPS} />
      </div>

      <div className="container mx-auto py-12 flex flex-col xl:flex-row gap-12">
        {/* LEFT: Estimate summary */}
        <div className="w-full xl:max-w-[700px] bg-brand-light p-4 sm:p-6 rounded-xl border border-gray-300 overflow-hidden">
          <SectionBoxSubtitle>Estimate for Emergency Services</SectionBoxSubtitle>

          {/* Grouped by category */}
          <div className="mt-4 space-y-4">
            {categoriesInOrder.map((catName, catIndex) => {
              const catServices = groupedByCategory[catName];
              const catNumber = catIndex + 1;

              return (
                <div key={catName} className="border-b pb-2 space-y-2">
                  <h2 className="font-semibold text-xl text-gray-800">
                    {catNumber}. {catName}
                  </h2>

                  {catServices.map((act, svcIndex) => {
                    const serviceNumber = `${catNumber}.${svcIndex + 1}`;
                    return (
                      <div key={act.activityKey} className="mt-3 ml-0 sm:ml-4">
                        <h3 className="font-medium text-lg text-gray-800 mb-1">
                          {serviceNumber}. {act.title}
                        </h3>
                        {act.description && (
                          <div className="text-sm text-gray-500">
                            {act.description}
                          </div>
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

                        {/* Cost breakdown */}
                        {act.breakdown && (
                          <div className="mt-3 p-2 sm:p-4 bg-gray-50 border rounded">
                            <div className="flex justify-between mb-2">
                              <span className="text-md font-medium text-gray-800">
                                Labor
                              </span>
                              <span className="text-md font-medium text-gray-700">
                                {act.breakdown.work_cost
                                  ? `$${formatWithSeparator(
                                      parseFloat(act.breakdown.work_cost)
                                    )}`
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
                                      {act.breakdown.materials.map(
                                        (m: any, idx: number) => {
                                          const priceVal = parseFloat(
                                            m.cost_per_unit
                                          );
                                          const subtotalVal = parseFloat(m.cost);
                                          return (
                                            <tr
                                              key={`${m.external_id}-${idx}`}
                                              className="align-top"
                                            >
                                              <td className="py-2 px-1">
                                                {m.name}
                                              </td>
                                              <td className="py-2 px-1">
                                                {/* No decimals on mobile, decimals on desktop */}
                                                <span className="block sm:hidden">
                                                  $
                                                  {formatMobileNoDecimals(priceVal)}
                                                </span>
                                                <span className="hidden sm:block">
                                                  $
                                                  {formatWithSeparator(priceVal)}
                                                </span>
                                              </td>
                                              <td className="py-2 px-3">
                                                {m.quantity}
                                              </td>
                                              <td className="py-2 px-3">
                                                <span className="block sm:hidden">
                                                  $
                                                  {formatMobileNoDecimals(
                                                    subtotalVal
                                                  )}
                                                </span>
                                                <span className="hidden sm:block">
                                                  $
                                                  {formatWithSeparator(
                                                    subtotalVal
                                                  )}
                                                </span>
                                              </td>
                                            </tr>
                                          );
                                        }
                                      )}
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

          <div className="block sm:hidden -mx-4 mt-6">
  <ServiceTimePicker
    subtotal={laborSubtotal}
    onConfirm={(date, coefficient) => {
      setSelectedTime(date);
      setTimeCoefficient(coefficient);
    }}
  />
</div>

          {/* Price summary */}
          <div className="pt-4 mt-4">
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-lg text-gray-600">Labor</span>
              <span className="font-semibold text-lg text-gray-600">
                ${formatWithSeparator(finalLabor)}
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
                    ? "Surcharge (urgency)"
                    : "Discount (date selection)"}
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
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Service Fee (20% on labor)</span>
              <span className="font-semibold text-lg text-gray-600">
                ${formatWithSeparator(serviceFeeOnLabor)}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">
                Delivery &amp; Processing (10% on materials)
              </span>
              <span className="font-semibold text-lg text-gray-600">
                ${formatWithSeparator(serviceFeeOnMaterials)}
              </span>
            </div>
            <div className="flex justify-between mb-2 mt-4">
              <span className="font-semibold text-xl text-gray-800">
                Subtotal
              </span>
              <span className="font-semibold text-xl text-gray-800">
                ${formatWithSeparator(sumBeforeTax)}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">
                Sales tax
                {userState ? ` (${userState})` : ""}
                {taxRatePercent ? ` (${taxRatePercent.toFixed(2)}%)` : ""}
              </span>
              <span>${formatWithSeparator(taxAmount)}</span>
            </div>
            <div className="flex justify-between text-2xl font-semibold mt-4">
              <span>Total</span>
              <span>${formatWithSeparator(grandTotal)}</span>
            </div>
          </div>

          {/* Address */}
          <div className="mt-6">
            <h3 className="font-semibold text-xl text-gray-800">Address</h3>
            <p className="text-gray-500 mt-2">{fullAddress}</p>
          </div>

          {/* Photos => from context */}
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

          {/* Description */}
          <div className="mt-6">
            <h3 className="font-semibold text-xl text-gray-800">
              Problem Description
            </h3>
            <p className="text-gray-500 mt-2 whitespace-pre-wrap">
              {description || "No description provided"}
            </p>
          </div>

          {/* Actions */}
          <div className="mt-6 space-y-4">
            <button
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold"
              onClick={handleProceedToCheckout}
            >
              Proceed to Checkout →
            </button>
          </div>
        </div>

        {/* RIGHT: time picker & immediate steps */}
        <div className="w-full xl:w-[500px] flex flex-col">
          <div className="hidden sm:block mb-10">
            <ServiceTimePicker
              subtotal={laborSubtotal}
              onConfirm={(date, coefficient) => {
                setSelectedTime(date);
                setTimeCoefficient(coefficient);
              }}
            />
          </div>

          <div className="flex items-center justify-between mb-4">
            <SectionBoxSubtitle>Follow the Instructions</SectionBoxSubtitle>
          </div>
          <button
            onClick={() => setShowSteps((prev) => !prev)}
            className="w-full py-2 mb-6 border rounded-lg font-medium transition-transform active:scale-95 text-brand border-brand"
          >
            {showSteps ? "Hide" : "Show"}
          </button>

          {showSteps && (
            <div className="space-y-8">
              {stepsList.map((svcObj, idx) => {
                const hasSteps = svcObj.steps && svcObj.steps.length > 0;
                return (
                  <div
                    key={svcObj.serviceName + idx}
                    className="bg-white p-6 rounded-lg border border-gray-200"
                  >
                    <SectionBoxSubtitle>{svcObj.serviceName}</SectionBoxSubtitle>
                    {hasSteps ? (
                      <div className="mt-4 space-y-4">
                        {svcObj.steps.map((step: any, stepIdx: number) => (
                          <div key={step.title + stepIdx} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="text-lg font-medium">
                                {step.step_number}.
                              </h4>
                              <h4 className="text-lg font-medium">
                                {step.title}
                              </h4>
                            </div>
                            <p className="text-gray-600">{step.description}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 mt-4">No steps available.</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}