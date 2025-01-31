"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BreadCrumb from "@/components/ui/BreadCrumb";
import { SectionBoxTitle } from "@/components/ui/SectionBoxTitle";
import { SectionBoxSubtitle } from "@/components/ui/SectionBoxSubtitle";
import ActionIconsBar from "@/components/ui/ActionIconsBar";
import { CALCULATE_STEPS } from "@/constants/navigation";
import { ALL_CATEGORIES } from "@/constants/categories";
import { ALL_SERVICES } from "@/constants/services";
import { taxRatesUSA } from "@/constants/taxRatesUSA";
import { useLocation } from "@/context/LocationContext";
import { getSessionItem, setSessionItem } from "@/utils/session";

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
 * Returns the tax rate (e.g. 8.85) from taxRatesUSA by matching
 * the two-letter state code. If not found, returns 0.
 */
function getTaxRateForState(stateCode: string): number {
  if (!stateCode) return 0;
  const row = taxRatesUSA.taxRates.find(
    (t) => t.state.toLowerCase() === stateCode.toLowerCase()
  );
  return row ? row.combinedStateAndLocalTaxRate : 0;
}

/**
 * Builds an estimate number in the format:
 * SS-ZZZZZ-YYYYMMDD-HHMM
 */
function buildEstimateNumber(stateCode: string, zip: string): string {
  let stateZipBlock = "??-00000";
  if (stateCode && zip) {
    stateZipBlock = `${stateCode}-${zip}`;
  }

  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mins = String(now.getMinutes()).padStart(2, "0");

  return `${stateZipBlock}-${yyyy}${mm}${dd}-${hh}${mins}`;
}

/**
 * Converts a numeric USD amount into spelled-out words (simplified).
 */
function numberToWordsUSD(amount: number): string {
  // We'll split into whole dollars + cents
  const wholeDollars = Math.floor(amount);
  const cents = Math.round((amount - wholeDollars) * 100);

  // Helper function for 0..999
  function threeDigitToWords(n: number): string {
    const ones = [
      "",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
    ];
    const teens = [
      "ten",
      "eleven",
      "twelve",
      "thirteen",
      "fourteen",
      "fifteen",
      "sixteen",
      "seventeen",
      "eighteen",
      "nineteen",
    ];
    const tensWords = [
      "",
      "",
      "twenty",
      "thirty",
      "forty",
      "fifty",
      "sixty",
      "seventy",
      "eighty",
      "ninety",
    ];

    let str = "";
    const hundred = Math.floor(n / 100);
    const remainder = n % 100;

    if (hundred > 0) {
      str += ones[hundred] + " hundred";
      if (remainder > 0) str += " ";
    }
    if (remainder >= 10 && remainder <= 19) {
      str += teens[remainder - 10];
    } else {
      const t = Math.floor(remainder / 10);
      const o = remainder % 10;
      if (t > 1) {
        str += tensWords[t];
        if (o > 0) str += "-" + ones[o];
      } else if (t === 1) {
        // handle '10..19' if not used teens above
        str += teens[o];
      } else if (o > 0) {
        str += ones[o];
      }
    }
    return str.trim();
  }

  // For thousands, etc.
  function numberToWords(num: number): string {
    if (num === 0) return "zero";
    let words = "";

    // handle thousands
    const thousands = Math.floor(num / 1000);
    const remainder = num % 1000;
    if (thousands > 0) {
      words += threeDigitToWords(thousands) + " thousand";
      if (remainder > 0) words += " ";
    }
    if (remainder > 0) {
      words += threeDigitToWords(remainder);
    }
    return words || "zero";
  }

  const dollarsPart = numberToWords(wholeDollars);
  const centsPart = cents < 10 ? `0${cents}` : `${cents}`;

  // Combine final => "one thousand two hundred... and 45/100 dollars"
  return `${dollarsPart} and ${centsPart}/100 dollars`.trim();
}

/**
 * getCategoryNameById:
 * Finds a category by its ID from ALL_CATEGORIES and returns its title,
 * or returns the ID itself if not found.
 */
function getCategoryNameById(catId: string): string {
  const found = ALL_CATEGORIES.find((cat) => cat.id === catId);
  return found ? found.title : catId;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { location } = useLocation();

  // 1) userStateCode, userZip from context
  const userStateCode = location.state || "";
  const userZip = location.zip || "00000";

  // 2) get session data
  const selectedServicesState: Record<string, number> = getSessionItem(
    "selectedServicesWithQuantity",
    {}
  );
  const calculationResultsMap: Record<string, any> = getSessionItem(
    "calculationResultsMap",
    {}
  );
  const address = getSessionItem("address", "");
  const photos = getSessionItem<string[]>("photos", []);
  const description = getSessionItem("description", "");
  const selectedTime: string | null = getSessionItem("selectedTime", null);
  const timeCoefficient: number = getSessionItem("timeCoefficient", 1);

  // 3) store location to session if valid
  useEffect(() => {
    if (userStateCode && userZip) {
      sessionStorage.setItem("location_state", JSON.stringify(userStateCode));
      sessionStorage.setItem("location_zip", JSON.stringify(userZip));
    }
  }, [userStateCode, userZip]);

  // If no essential data => redirect
  useEffect(() => {
    if (Object.keys(selectedServicesState).length === 0 || !address) {
      router.push("/calculate/estimate");
    }
  }, [selectedServicesState, address, router]);

  // Build the same grouping used in Estimate
  const selectedCategories: string[] = getSessionItem("services_selectedCategories", []);
  const searchQuery: string = getSessionItem("services_searchQuery", "");

  // categoriesBySection
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

  // categoryServicesMap => catId => services
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

  // Summation
  function calculateLaborSubtotal(): number {
    let total = 0;
    for (const svcId of Object.keys(selectedServicesState)) {
      const cr = calculationResultsMap[svcId];
      if (cr && cr.work_cost) {
        total += parseFloat(cr.work_cost);
      }
    }
    return total;
  }

  function calculateMaterialsSubtotal(): number {
    let total = 0;
    for (const svcId of Object.keys(selectedServicesState)) {
      const cr = calculationResultsMap[svcId];
      if (cr && cr.material_cost) {
        total += parseFloat(cr.material_cost);
      }
    }
    return total;
  }

  const laborSubtotal = calculateLaborSubtotal();
  const materialsSubtotal = calculateMaterialsSubtotal();

  const finalLabor = laborSubtotal * timeCoefficient;

  const serviceFeeOnLabor = getSessionItem("serviceFeeOnLabor", 0);
  const serviceFeeOnMaterials = getSessionItem("serviceFeeOnMaterials", 0);

  const sumBeforeTax = finalLabor + materialsSubtotal + serviceFeeOnLabor + serviceFeeOnMaterials;

  // tax
  const taxRatePercent = getTaxRateForState(userStateCode);
  const taxAmount = sumBeforeTax * (taxRatePercent / 100);
  const finalTotal = sumBeforeTax + taxAmount;

  // estimate number
  const estimateNumber = buildEstimateNumber(userStateCode, userZip);

  // place order
  function handlePlaceOrder() {
    alert("Your order has been placed!");
  }

  // icons
  function handlePrint() {
    router.push("/calculate/checkout/print");
  }
  function handleShare() {
    alert("Sharing your estimate...");
  }
  function handleSave() {
    alert("Saving your estimate as a PDF...");
  }

  const finalTotalWords = numberToWordsUSD(finalTotal);

  return (
    <main className="min-h-screen py-24">
      <div className="container mx-auto">
        <BreadCrumb items={CALCULATE_STEPS} />
      </div>

      <div className="container mx-auto">
        {/* Top bar */}
        <div className="flex justify-between items-center mt-8">
          <span className="text-blue-600 cursor-pointer" onClick={() => router.back()}>
            ← Back
          </span>
          <button
            className="bg-yellow-400 hover:bg-yellow-500 text-black py-3 px-6 rounded-md font-semibold text-lg shadow-sm transition-colors duration-200"
            onClick={handlePlaceOrder}
          >
            Place your order
          </button>
        </div>

        <div className="flex items-center justify-between mt-8">
          <SectionBoxTitle>Checkout</SectionBoxTitle>
          <ActionIconsBar onPrint={handlePrint} onShare={handleShare} onSave={handleSave} />
        </div>

        <div className="bg-white border-gray-300 mt-8 p-4 sm:p-6 rounded-lg space-y-6 border">
          {/* Estimate info */}
          <div>
            <SectionBoxSubtitle>
              Estimate for Selected Services <span className="ml-2 text-sm text-gray-500">({estimateNumber})</span>
            </SectionBoxSubtitle>
            <p className="text-xs text-gray-400 -mt-2 ml-1">
              *This number is temporary and will be replaced with a permanent order number after confirmation.
            </p>

            {/* Group by section -> category -> services with numbering */}
            <div className="mt-4 space-y-4">
              {Object.entries(categoriesBySection).map(([sectionName, catIds], i) => {
                const sectionIndex = i + 1;
                const catsWithSelected = catIds.filter((catId) => {
                  const arr = categoryServicesMap[catId] || [];
                  return arr.some((svc) => selectedServicesState[svc.id] != null);
                });
                if (catsWithSelected.length === 0) return null;

                return (
                  <div key={sectionName} className="space-y-4">
                    <h3 className="text-2xl font-semibold text-gray-700">
                      {sectionIndex}. {sectionName}
                    </h3>

                    {catsWithSelected.map((catId, j) => {
                      const catIndex = j + 1;
                      const servicesInCat = categoryServicesMap[catId] || [];
                      const chosenServices = servicesInCat.filter(
                        (svc) => selectedServicesState[svc.id] != null
                      );
                      if (chosenServices.length === 0) return null;

                      const foundCatName = getCategoryNameById(catId);

                      return (
                        <div key={catId} className="ml-0 sm:ml-4 space-y-4">
                          <h4 className="text-xl font-medium text-gray-700">
                            {sectionIndex}.{catIndex}. {foundCatName}
                          </h4>

                          {chosenServices.map((svc, svcIdx) => {
                            const svcIndex = svcIdx + 1;
                            const quantity = selectedServicesState[svc.id] || 1;
                            const calcResult = calculationResultsMap[svc.id];
                            const finalCost = calcResult
                              ? parseFloat(calcResult.total) || 0
                              : 0;

                            return (
                              <div
                                key={svc.id}
                                className="flex flex-col gap-2 mb-4"
                              >
                                <div>
                                  <h3 className="font-medium text-lg text-gray-700">
                                    {sectionIndex}.{catIndex}.{svcIndex}. {svc.title}
                                  </h3>
                                  {svc.description && (
                                    <div className="text-sm text-gray-500 mt-1">
                                      {svc.description}
                                    </div>
                                  )}
                                </div>

                                {/* quantity + cost */}
                                <div className="flex items-center justify-between mt-2">
                                  <div className="text-lg font-medium text-gray-700">
                                    {quantity} {svc.unit_of_measurement}
                                  </div>
                                  <span className="text-gray-700 font-medium text-lg mr-4">
                                    ${formatWithSeparator(finalCost)}
                                  </span>
                                </div>

                                {/* cost breakdown => labor/materials */}
                                {calcResult && (
                                  <div className="mt-2 p-2 sm:p-4 bg-gray-50 border rounded">
                                    <div className="flex justify-between mb-4">
                                      <span className="text-md font-medium text-gray-700">
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
                                        Materials, tools and equipment
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
                                        <div>
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
                                              {calcResult.materials.map(
                                                (m: any, idx2: number) => (
                                                  <tr
                                                    key={`${m.external_id}-${idx2}`}
                                                    className="align-top"
                                                  >
                                                    <td className="py-3 px-1">
                                                      {m.name}
                                                    </td>
                                                    <td className="py-3 px-1">
                                                      $
                                                      {formatWithSeparator(
                                                        parseFloat(m.cost_per_unit)
                                                      )}
                                                    </td>
                                                    <td className="py-3 px-3">
                                                      {m.quantity}
                                                    </td>
                                                    <td className="py-3 px-3">
                                                      $
                                                      {formatWithSeparator(
                                                        parseFloat(m.cost)
                                                      )}
                                                    </td>
                                                  </tr>
                                                )
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
                );
              })}
            </div>

            {/* Summary => labor/materials/tax/fees */}
            <div className="pt-4 mt-4 border-t">
              <div className="flex justify-between mb-2">
                <span className="font-semibold text-lg text-gray-600">Labor total</span>
                <span className="font-semibold text-lg text-gray-600">
                  ${formatWithSeparator(laborSubtotal)}
                </span>
              </div>

              <div className="flex justify-between mb-2">
                <span className="font-semibold text-lg text-gray-600">
                  Materials, tools and equipment
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
                      : "Discount (day selection)"}
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
                <span className="text-gray-600">Service Fee (15% on labor)</span>
                <span className="font-semibold text-lg text-gray-800">
                  ${formatWithSeparator(serviceFeeOnLabor)}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">
                  Delivery &amp; Processing (5% on materials)
                </span>
                <span className="font-semibold text-lg text-gray-800">
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

              <div className="flex justify-between mb-2">
                <span className="text-gray-600">
                  Sales tax
                  {userStateCode ? ` (${userStateCode})` : ""}
                  {taxRatePercent > 0 ? ` (${taxRatePercent.toFixed(2)}%)` : ""}
                </span>
                <span>${formatWithSeparator(taxAmount)}</span>
              </div>

              <div className="flex justify-between text-2xl font-semibold mt-4">
                <span>Total</span>
                <span>${formatWithSeparator(finalTotal)}</span>
              </div>

              <span className="block text-right my-2 text-gray-600">
                ({finalTotalWords})
              </span>
            </div>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* Selected date/time */}
          <div>
            <SectionBoxSubtitle>Date of Service</SectionBoxSubtitle>
            <p className="text-gray-600">
              {selectedTime || "No date selected"}
            </p>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* Problem description */}
          <div>
            <SectionBoxSubtitle>Problem Description</SectionBoxSubtitle>
            <p className="text-gray-600">{description || "No details provided"}</p>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* Address */}
          <div>
            <SectionBoxSubtitle>Address</SectionBoxSubtitle>
            <p className="text-gray-600">{address || "No address provided"}</p>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* Photos */}
          <div>
            <SectionBoxSubtitle>Uploaded Photos</SectionBoxSubtitle>
            <div className="grid grid-cols-6 gap-2">
              {photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-24 object-cover rounded border border-gray-300"
                />
              ))}
            </div>
            {photos.length === 0 && (
              <p className="text-gray-600 mt-2">No photos uploaded</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}