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

/**
 * Saves any value to sessionStorage, only on the client side.
 */
function saveToSession(key: string, value: any) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(key, JSON.stringify(value));
  }
}

/**
 * Loads a value from sessionStorage, or returns defaultValue if not found/SSR.
 */
function loadFromSession<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  const saved = sessionStorage.getItem(key);
  try {
    return saved ? JSON.parse(saved) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Formats a number with commas and exactly two decimals, e.g. 1234 -> "1,234.00".
 */
function formatWithSeparator(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Returns the tax rate (e.g. 8.85) from taxRatesUSA by matching
 * the two-letter state code. If no match, returns 0.
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
 * Where:
 *  - SS-ZZZZZ = e.g. "NY-10006" (two-letter state code + zip)
 *  - YYYYMMDD-HHMM = date + time
 */
function buildEstimateNumber(stateCode: string, zip: string): string {
  // Combine state code + zip => e.g. "NY-10006"
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

  // e.g. "20250301" for date, "2221" for time
  const dateString = `${yyyy}${mm}${dd}`;
  const timeString = hh + mins;

  return `${stateZipBlock}-${dateString}-${timeString}`;
}

/**
 * Converts a numeric USD amount into words, in a simplified manner.
 * e.g. 1234.56 => "One thousand two hundred thirty-four and 56/100 dollars".
 * This is a demo function, not fully robust for very large numbers.
 */
function numberToWordsUSD(amount: number): string {
  // 1) Split into integer and decimal parts
  const integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - integerPart) * 100);

  // 2) Convert integerPart to words (highly simplified).
  //    For a production app, consider a real library (e.g. 'number-to-words' or 'numbro').
  const wordsMap: Record<number, string> = {
    0: "zero",
    1: "one",
    2: "two",
    3: "three",
    4: "four",
    5: "five",
    6: "six",
    7: "seven",
    8: "eight",
    9: "nine",
    10: "ten",
    11: "eleven",
    12: "twelve",
    13: "thirteen",
    14: "fourteen",
    15: "fifteen",
    16: "sixteen",
    17: "seventeen",
    18: "eighteen",
    19: "nineteen",
    20: "twenty",
    30: "thirty",
    40: "forty",
    50: "fifty",
    60: "sixty",
    70: "seventy",
    80: "eighty",
    90: "ninety",
  };

  function twoDigitsToWords(n: number): string {
    if (n <= 20) return wordsMap[n] || "";
    if (n < 100) {
      const tens = Math.floor(n / 10) * 10;
      const ones = n % 10;
      if (ones === 0) return wordsMap[tens];
      return wordsMap[tens] + "-" + (wordsMap[ones] || "");
    }
    return `${n}`;
  }

  function threeDigitsToWords(n: number): string {
    const hundreds = Math.floor(n / 100);
    const remainder = n % 100;
    const hundredPart = hundreds > 0 ? wordsMap[hundreds] + " hundred" : "";
    const remainderPart = remainder > 0 ? twoDigitsToWords(remainder) : "";
    if (hundreds > 0 && remainder > 0) {
      return hundredPart + " " + remainderPart;
    }
    return hundredPart || remainderPart || "";
  }

  let resultWords: string[] = [];
  const thousands = ["", " thousand", " million", " billion"];
  let temp = integerPart;
  let i = 0;
  if (temp === 0) {
    resultWords.push("zero");
  }
  while (temp > 0 && i < thousands.length) {
    const chunk = temp % 1000;
    temp = Math.floor(temp / 1000);
    if (chunk > 0) {
      const str = threeDigitsToWords(chunk) + thousands[i];
      resultWords.unshift(str);
    }
    i++;
  }
  const integerWords = resultWords.join(" ").trim();

  const decimalStr = decimalPart < 10 ? `0${decimalPart}` : `${decimalPart}`;
  return `${integerWords} and ${decimalStr}/100 dollars`;
}

export default function CheckoutPage() {
  const router = useRouter();

  // 1) Load data from session
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
  const selectedTime: string | null = loadFromSession("selectedTime", null);
  const timeCoefficient: number = loadFromSession("timeCoefficient", 1);

  // 2) Get location from context => for tax re-calc + estimateNumber
  const { location } = useLocation();
  const userStateCode = location.state || ""; // e.g. "NY"
  const userZip = location.zip || "00000";

  // **Here** we store the real state+zip from context
  useEffect(() => {
    // If location has state/zip, save them to session
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

  // 3) Build grouping
  const selectedCategories: string[] = loadFromSession(
    "services_selectedCategories",
    []
  );
  const searchQuery: string = loadFromSession("services_searchQuery", "");

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

  const categoryServicesMap: Record<string, (typeof ALL_SERVICES)[number][]> =
    {};
  selectedCategories.forEach((catId) => {
    let matched = ALL_SERVICES.filter((svc) => svc.id.startsWith(`${catId}-`));
    if (searchQuery) {
      matched = matched.filter((svc) =>
        svc.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    categoryServicesMap[catId] = matched;
  });

  /**
   * Returns the category's title by ID, or the ID if not found.
   */
  function getCategoryNameById(catId: string): string {
    const cat = ALL_CATEGORIES.find((x) => x.id === catId);
    return cat ? cat.title : catId;
  }

  // 4) Summation logic
  function calculateLaborSubtotal(): number {
    let total = 0;
    for (const svcId of Object.keys(selectedServicesState)) {
      const cr = calculationResultsMap[svcId];
      if (!cr) continue;
      total += parseFloat(cr.work_cost) || 0;
    }
    return total;
  }

  function calculateMaterialsSubtotal(): number {
    let total = 0;
    for (const svcId of Object.keys(selectedServicesState)) {
      const cr = calculationResultsMap[svcId];
      if (!cr) continue;
      total += parseFloat(cr.material_cost) || 0;
    }
    return total;
  }

  const laborSubtotal = calculateLaborSubtotal();
  const materialsSubtotal = calculateMaterialsSubtotal();

  const finalLabor = laborSubtotal * timeCoefficient;
  const serviceFeeOnLabor = loadFromSession("serviceFeeOnLabor", 0);
  const serviceFeeOnMaterials = loadFromSession("serviceFeeOnMaterials", 0);

  // sumBeforeTax = final labor + materials + fees
  const sumBeforeTax =
    finalLabor + materialsSubtotal + serviceFeeOnLabor + serviceFeeOnMaterials;

  // re-check location-based tax
  const taxRatePercent = getTaxRateForState(userStateCode);
  const taxAmount = sumBeforeTax * (taxRatePercent / 100);
  const finalTotal = sumBeforeTax + taxAmount;

  // 5) build the estimate number
  const estimateNumber = buildEstimateNumber(userStateCode, userZip);

  // 6) Actions
  function handlePlaceOrder() {
    alert("Your order has been placed!");
  }

  function handlePrint() {
    router.push("/calculate/checkout/print");
  }

  function handleShare() {
    alert("Sharing your estimate...");
  }

  function handleSave() {
    alert("Saving your estimate as a PDF...");
  }

  // Convert finalTotal to words
  const finalTotalWords = numberToWordsUSD(finalTotal);

  return (
    <main className="min-h-screen py-24">
      <div className="container mx-auto">
        <BreadCrumb items={CALCULATE_STEPS} />
      </div>

      <div className="container mx-auto">
        {/* Top bar */}
        <div className="flex justify-between items-center mt-8">
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => router.back()}
          >
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
          <ActionIconsBar
            onPrint={handlePrint}
            onShare={handleShare}
            onSave={handleSave}
          />
        </div>

        <div className="bg-white border-gray-300 mt-8 p-6 rounded-lg space-y-6 border">
          {/* Estimate info */}
          <div>
            <SectionBoxSubtitle>
              Estimate{" "}
              <span className="ml-2 text-sm text-gray-500">
                ({estimateNumber})
              </span>
            </SectionBoxSubtitle>
            <p className="text-xs text-gray-400 -mt-2 ml-1">
              *This number is temporary and will be replaced with a permanent
              order number after confirmation.
            </p>

            {/* Group by section -> category -> services with numbering */}
            <div className="mt-4 space-y-4">
              {Object.entries(categoriesBySection).map(
                ([sectionName, catIds], i) => {
                  const sectionIndex = i + 1;
                  const catsWithSelected = catIds.filter((catId) => {
                    const arr = categoryServicesMap[catId] || [];
                    return arr.some((s) => selectedServicesState[s.id] != null);
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
                          (s) => selectedServicesState[s.id] != null
                        );
                        if (chosenServices.length === 0) return null;

                        const catName = getCategoryNameById(catId);

                        return (
                          <div key={catId} className="ml-4 space-y-4">
                            <h4 className="text-xl font-medium text-gray-700">
                              {sectionIndex}.{catIndex}. {catName}
                            </h4>

                            {chosenServices.map((svc, k2) => {
                              const svcIndex = k2 + 1;
                              const quantity =
                                selectedServicesState[svc.id] || 1;
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
                                      {sectionIndex}.{catIndex}.{svcIndex}.{" "}
                                      {svc.title}
                                    </h3>
                                    {svc.description && (
                                      <div className="text-sm text-gray-500 mt-1">
                                        {svc.description}
                                      </div>
                                    )}
                                  </div>

                                  {/* quantity + cost */}
                                  <div className="flex items-center justify-between mt-2">
                                    <div className="text-md font-medium text-gray-700">
                                      {quantity} {svc.unit_of_measurement}
                                    </div>
                                    <span className="text-gray-700 font-medium text-md mr-4">
                                      ${formatWithSeparator(finalCost)}
                                    </span>
                                  </div>

                                  {/* breakdown: labor/materials */}
                                  {calcResult && (
                                    <div className="mt-2 p-4 bg-gray-50 border rounded">
                                      <div className="flex justify-between mb-4">
                                        <span className="text-md font-medium text-gray-700">
                                          Labor:
                                        </span>
                                        <span className="text-md text-gray-700">
                                          {calcResult.work_cost
                                            ? `$${formatWithSeparator(
                                                parseFloat(calcResult.work_cost)
                                              )}`
                                            : "—"}
                                        </span>
                                      </div>

                                      {Array.isArray(calcResult.materials) &&
                                        calcResult.materials.length > 0 && (
                                          <div>
                                            <h5 className="text-md font-medium text-gray-700 mb-2">
                                              Materials:
                                            </h5>
                                            <table className="table-auto w-full text-sm text-left text-gray-700">
                                              <thead>
                                                <tr className="border-b">
                                                  <th className="py-2 px-1">
                                                    Name
                                                  </th>
                                                  <th className="py-2 px-1">
                                                    Price
                                                  </th>
                                                  <th className="py-2 px-1">
                                                    Qty
                                                  </th>
                                                  <th className="py-2 px-1">
                                                    Subtotal
                                                  </th>
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
                                                          parseFloat(
                                                            m.cost_per_unit
                                                          )
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
                }
              )}
            </div>

            {/* Summary: labor, materials, timeCoefficient, location-based tax, final total */}
            <div className="pt-4 mt-4 border-t">
              <div className="flex justify-between mb-2">
                <span className="font-semibold text-lg text-gray-600">
                  Labor
                </span>
                <span className="font-semibold text-lg text-gray-600">
                  ${formatWithSeparator(laborSubtotal)}
                </span>
              </div>

              <div className="flex justify-between mb-2">
                <span className="font-semibold text-lg text-gray-600">
                  Materials
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

              {/* add lines for fees */}
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">
                  Service Fee (15% on labor)
                </span>
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

              {/* Final total with spelled-out text */}
              <div className="flex justify-between text-2xl font-semibold mt-4">
                <span>Total</span>
                {/* 
                  1) Show numeric total with comma separators 
                  2) Then in parentheses the spelled-out text 
                */}
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
            <p className="text-gray-600">
              {description || "No details provided"}
            </p>
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
