"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ALL_SERVICES } from "@/constants/services";
import { ALL_CATEGORIES } from "@/constants/categories";
import { taxRatesUSA } from "@/constants/taxRatesUSA";
import { DisclaimerBlock } from "@/components/ui/DisclaimerBlock";

/**
 * Safely load a value from sessionStorage (client side only).
 */
function loadFromSession<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  const savedValue = sessionStorage.getItem(key);
  try {
    return savedValue ? JSON.parse(savedValue) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Formats a numeric value with two decimal places and comma separators.
 * Example: 1234 => "1,234.00"
 */
function formatWithSeparator(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Finds a matching tax rate in taxRatesUSA based on a two-letter state code
 * (e.g. "CA" => 8.85%). Returns 0 if not found.
 */
function getTaxRateForState(stateCode: string): number {
  if (!stateCode) return 0;
  const row = taxRatesUSA.taxRates.find(
    (r) => r.state.toLowerCase() === stateCode.toLowerCase()
  );
  return row ? row.combinedStateAndLocalTaxRate : 0;
}

/**
 * Converts a numeric USD amount into spelled-out English text, in a simplified manner.
 * e.g. 1234.56 => "One thousand two hundred thirty-four and 56/100 dollars"
 */
function numberToWordsUSD(amount: number): string {
  // 1) Split integer & decimal
  const integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - integerPart) * 100);

  // 2) Basic map for small numbers
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

  // Handle two digits (under 100)
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

  // Handle three digits (e.g., up to 999)
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

  // Combine all chunks (thousands, millions, etc.) - simplified
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

  // Combine integer & decimal
  const decimalStr = decimalPart < 10 ? `0${decimalPart}` : `${decimalPart}`;
  return `${integerWords} and ${decimalStr}/100 dollars`;
}

/**
 * Creates an estimate number string: "CA-94103-YYYYMMDD-HHMM" or fallback
 */
function buildEstimateNumber(stateCode: string, zip: string): string {
  let stateZipPart = "??-00000";
  if (stateCode && zip) {
    stateZipPart = `${stateCode}-${zip}`;
  }

  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mins = String(now.getMinutes()).padStart(2, "0");

  const dateString = `${yyyy}${mm}${dd}`;
  const timeString = hh + mins;

  return `${stateZipPart}-${dateString}-${timeString}`;
}

export default function PrintServicesEstimate() {
  const router = useRouter();

  // 1) Load data from sessionStorage
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

  // These should be stored on Checkout:
  const userStateCode: string = loadFromSession("location_state", "");
  const userZip: string = loadFromSession("location_zip", "00000");

  // For grouping categories & services
  const selectedCategories: string[] = loadFromSession(
    "services_selectedCategories",
    []
  );
  const searchQuery: string = loadFromSession("services_searchQuery", "");

  // If no data => back to /calculate/estimate
  useEffect(() => {
    if (
      Object.keys(selectedServicesState).length === 0 ||
      !address.trim()
    ) {
      router.push("/calculate/estimate");
    }
  }, [selectedServicesState, address, router]);

  // Build the same category→services structure as on Checkout
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

  /**
   * Returns category title by id or the id itself if not found.
   */
  function getCategoryNameById(catId: string): string {
    const cat = ALL_CATEGORIES.find((x) => x.id === catId);
    return cat ? cat.title : catId;
  }

  // 2) Summation logic: labor, materials, taxes
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

  // Apply timeCoefficient to labor
  const finalLabor = laborSubtotal * timeCoefficient;
  const sumBeforeTax = finalLabor + materialsSubtotal;

  // Tax
  const taxRatePercent = getTaxRateForState(userStateCode);
  const taxAmount = sumBeforeTax * (taxRatePercent / 100);
  const finalTotal = sumBeforeTax + taxAmount;

  // spelled-out final total
  const finalTotalWords = numberToWordsUSD(finalTotal);

  // Build estimate number "CA-94103-YYYYMMDD-HHMM"
  const estimateNumber = buildEstimateNumber(userStateCode, userZip);

  // Auto-print after a short delay + set doc title
  useEffect(() => {
    const oldTitle = document.title;
    document.title = `JAMB-Estimate-${estimateNumber}`;

    const printTimer = setTimeout(() => {
      window.print();
    }, 600);

    return () => {
      document.title = oldTitle;
      clearTimeout(printTimer);
    };
  }, [estimateNumber]);

  return (
    <div className="print-page p-4 my-2">
      {/* LOGO at top */}
      <div className="flex items-center justify-between mb-4">
        <img
          src="/images/logo.png"
          alt="JAMB Logo"
          className="h-10 w-auto"
        />
      </div>
      {/* Divider under logo */}
      <hr className="border-gray-300 mb-4" />

      <div className="flex justify-between items-center mb-4 mt-12">
        <div>
          <h1 className="text-2xl font-bold">Estimate</h1>
          <h2 className="text-sm text-gray-500 mt-1">
            {estimateNumber} (temporary)
          </h2>
        </div>
      </div>

      {selectedTime && (
        <p className="mb-2 text-gray-700">
          <strong>Date of Service:</strong> {selectedTime}
        </p>
      )}

      <p className="mb-2">
        <strong>Address:</strong> {address}
      </p>
      <p className="mb-2">
        <strong>Details:</strong> {description || "No details provided"}
      </p>

      {/* Services breakdown */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-3">Selected Services</h2>

        {/* 
          Group by section -> categories -> services 
          We remove the divider between services and keep a consistent spacing. 
          Also, we add a custom class "avoid-break" so the sections won't be split across pages if possible.
        */}
        <div className="space-y-4">
          {Object.entries(categoriesBySection).map(([sectionName, catIds], i) => {
            const sectionIndex = i + 1;

            // Only categories that actually have chosen services
            const catsWithSelected = catIds.filter((catId) => {
              const arr = categoryServicesMap[catId] || [];
              return arr.some((s) => selectedServicesState[s.id] != null);
            });
            if (catsWithSelected.length === 0) return null;

            return (
              <div key={sectionName} className="space-y-4 avoid-break">
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
                    <div key={catId} className="ml-4 space-y-4 avoid-break">
                      <h4 className="text-xl font-medium text-gray-700">
                        {sectionIndex}.{catIndex}. {catName}
                      </h4>

                      {chosenServices.map((svc, k2) => {
                        const svcIndex = k2 + 1;
                        const quantity = selectedServicesState[svc.id] || 1;
                        const calcResult = calculationResultsMap[svc.id];
                        const finalCost = calcResult
                          ? parseFloat(calcResult.total) || 0
                          : 0;

                        return (
                          <div
                            key={svc.id}
                            className="flex flex-col gap-2 mb-4 avoid-break"
                          >
                            <div>
                              <h5 className="text-lg font-medium text-gray-800">
                                {sectionIndex}.{catIndex}.{svcIndex}. {svc.title}
                              </h5>
                              {svc.description && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {svc.description}
                                </p>
                              )}
                            </div>

                            <div className="flex justify-between items-center mt-2">
                              <p className="text-sm text-gray-700 font-medium">
                                {quantity} {svc.unit_of_measurement}
                              </p>
                              <p className="text-sm text-gray-800 font-medium">
                                ${formatWithSeparator(finalCost)}
                              </p>
                            </div>

                            {/* cost breakdown (labor + materials) */}
                            {calcResult && (
                              <div className="mt-2 p-3 bg-gray-50 border border-gray-300 rounded text-sm text-gray-700">
                                {/* Labor row */}
                                <div className="flex justify-between mb-2">
                                  <span className="font-semibold">Labor:</span>
                                  <span>
                                    {calcResult.work_cost
                                      ? `$${formatWithSeparator(parseFloat(calcResult.work_cost))}`
                                      : "—"}
                                  </span>
                                </div>

                                {/* Materials as a table, with header row "Name Price Qty Subtotal" */}
                                {Array.isArray(calcResult.materials) &&
                                  calcResult.materials.length > 0 && (
                                    <div className="mt-2">
                                      <p className="font-semibold mb-1">
                                        Materials:
                                      </p>
                                      <table className="table-auto w-full text-left text-gray-700">
                                        <thead>
                                          <tr className="border-b">
                                            <th className="py-1 px-1">Name</th>
                                            <th className="py-1 px-1">Price</th>
                                            <th className="py-1 px-1">Qty</th>
                                            <th className="py-1 px-1">Subtotal</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                          {calcResult.materials.map((m: any, idx2: number) => (
                                            <tr key={`${m.external_id}-${idx2}`}>
                                              <td className="py-2 px-1">{m.name}</td>
                                              <td className="py-2 px-1">
                                                ${formatWithSeparator(parseFloat(m.cost_per_unit))}
                                              </td>
                                              <td className="py-2 px-1">
                                                {m.quantity}
                                              </td>
                                              <td className="py-2 px-1">
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
      </div>

      {/* Summary (Labor, Materials, Tax, etc.) */}
      <div className="mt-6 border-t pt-4 space-y-2 avoid-break">
        <div className="flex justify-between">
          <span>Labor:</span>
          <span>${formatWithSeparator(laborSubtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Materials:</span>
          <span>${formatWithSeparator(materialsSubtotal)}</span>
        </div>

        {timeCoefficient !== 1 && (
          <div className="flex justify-between">
            <span>
              {timeCoefficient > 1
                ? "Surcharge (date selection)"
                : "Discount (day selection)"}
            </span>
            <span>
              {timeCoefficient > 1 ? "+" : "-"}$
              {formatWithSeparator(Math.abs(finalLabor - laborSubtotal))}
            </span>
          </div>
        )}

        <div className="flex justify-between font-semibold">
          <span>Subtotal:</span>
          <span>${formatWithSeparator(sumBeforeTax)}</span>
        </div>

        <div className="flex justify-between">
          <span>
            Sales tax
            {userStateCode ? ` (${userStateCode})` : ""}
            {taxRatePercent > 0 ? ` (${taxRatePercent.toFixed(2)}%)` : ""}:
          </span>
          <span>${formatWithSeparator(taxAmount)}</span>
        </div>

        <div className="flex justify-between text-lg font-semibold mt-2">
          <span>Total:</span>
          <span>${formatWithSeparator(finalTotal)}</span>
        </div>

        {/* spelled-out total in parentheses */}
        <span className="block text-right text-sm text-gray-600">
          ({finalTotalWords})
        </span>
      </div>

      {/* Photos (if any) */}
      {photos.length > 0 && (
        <div className="mt-6 avoid-break">
          <h3 className="font-semibold text-xl">Uploaded Photos</h3>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {photos.map((photo, idx) => (
              <img
                key={idx}
                src={photo}
                alt={`Photo ${idx + 1}`}
                className="w-full h-32 object-cover rounded-md border border-gray-300"
              />
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer block at the bottom */}
      <DisclaimerBlock />
    </div>
  );
}