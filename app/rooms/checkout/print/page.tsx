"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROOMS } from "@/constants/rooms";
import { ALL_SERVICES } from "@/constants/services";
import { ALL_CATEGORIES } from "@/constants/categories";
import { DisclaimerBlock } from "@/components/ui/DisclaimerBlock";
import { taxRatesUSA } from "@/constants/taxRatesUSA";

/**
 * Safely load a value from sessionStorage.
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
 * Formats a number with commas + exactly two decimals.
 * e.g., 1234 => "1,234.00"
 */
function formatWithSeparator(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Returns the combined state+local tax rate (e.g. 8.85) from taxRatesUSA
 * for the given state code, or 0 if not found.
 */
function getTaxRateForState(stateCode: string): number {
  if (!stateCode) return 0;
  const row = taxRatesUSA.taxRates.find(
    (r) => r.state.toLowerCase() === stateCode.toLowerCase()
  );
  return row ? row.combinedStateAndLocalTaxRate : 0;
}

/**
 * Converts a numeric USD amount into spelled-out English text (simplified).
 * e.g. 1234.56 => "One thousand two hundred thirty-four and 56/100 dollars".
 */
function numberToWordsUSD(amount: number): string {
  const onesMap: Record<number, string> = {
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

  function twoDigits(num: number): string {
    if (num <= 20) return onesMap[num] || "";
    const tens = Math.floor(num / 10) * 10;
    const ones = num % 10;
    if (ones === 0) return onesMap[tens];
    return onesMap[tens] + "-" + (onesMap[ones] || "");
  }

  function threeDigits(num: number): string {
    const hundreds = Math.floor(num / 100);
    const remainder = num % 100;
    let result = "";
    if (hundreds > 0) {
      result += `${onesMap[hundreds]} hundred`;
      if (remainder > 0) result += " ";
    }
    if (remainder > 0) {
      if (remainder < 100) {
        result += twoDigits(remainder);
      }
    }
    return result || "zero";
  }

  let integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - integerPart) * 100);
  if (integerPart === 0) {
    integerPart = 0;
  }

  let str = "";
  const units = ["", "thousand", "million", "billion"];
  let i = 0;
  while (integerPart > 0 && i < units.length) {
    const chunk = integerPart % 1000;
    integerPart = Math.floor(integerPart / 1000);
    if (chunk > 0) {
      const chunkStr = threeDigits(chunk);
      const label = units[i] ? ` ${units[i]}` : "";
      str = chunkStr + label + (str ? " " + str : "");
    }
    i++;
  }
  if (!str) str = "zero";

  const dec = decimalPart < 10 ? `0${decimalPart}` : String(decimalPart);
  return `${str} and ${dec}/100 dollars`;
}

/**
 * Builds an estimate number in format: "ST-ZIP-YYYYMMDD-HHMM" or fallback if missing.
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

  return `${stateZipPart}-${yyyy}${mm}${dd}-${hh}${mins}`;
}

export default function PrintRoomsEstimate() {
  const router = useRouter();

  // 1) LOAD all relevant data from session
  const address: string = loadFromSession("address", "");
  const city: string = loadFromSession("city", "");
  const stateName: string = loadFromSession("stateName", "");
  const zip: string = loadFromSession("zip", "");
  const country: string = loadFromSession("country", "");
  const photos: string[] = loadFromSession("photos", []);
  const description: string = loadFromSession("description", "");
  const selectedTime: string | null = loadFromSession("selectedTime", null);

  // Subtotals & fees
  const laborSubtotal: number = loadFromSession("rooms_laborSubtotal", 0);
  const materialsSubtotal: number = loadFromSession("rooms_materialsSubtotal", 0);
  const serviceFeeOnLabor: number = loadFromSession("serviceFeeOnLabor", 0);
  const serviceFeeOnMaterials: number = loadFromSession("serviceFeeOnMaterials", 0);

  // Summaries
  const sumBeforeTax: number = loadFromSession("rooms_sumBeforeTax", 0);
  const taxRatePercent: number = loadFromSession("rooms_taxRatePercent", 0);
  const taxAmount: number = loadFromSession("rooms_taxAmount", 0);
  const finalTotal: number = loadFromSession("rooms_estimateFinalTotal", 0);

  // The "selected services" (room -> service -> quantity)
  const selectedServicesState: Record<string, Record<string, number>> =
    loadFromSession("rooms_selectedServicesWithQuantity", {});

  // If no service or no address => redirect
  useEffect(() => {
    let hasAnyService = false;
    for (const roomId in selectedServicesState) {
      if (Object.keys(selectedServicesState[roomId]).length > 0) {
        hasAnyService = true;
        break;
      }
    }
    if (!hasAnyService || !address.trim()) {
      router.push("/rooms/details");
    }
  }, [selectedServicesState, address, router]);

  // 2) Build final estimate number using stateName (or ??), zip
  // We might want 2-letter state code, but here we can do similar logic:
  // e.g. "NY-10006-20250610-1130"
  let stateCodePart = stateName ? stateName.slice(0,2).toUpperCase() : "??";
  const estimateNumber = buildEstimateNumber(stateCodePart, zip || "00000");

  // 3) Convert finalTotal to words
  const finalTotalWords = numberToWordsUSD(finalTotal);

  // 4) Auto-print logic
  useEffect(() => {
    const oldTitle = document.title;
    document.title = `JAMB-Estimate-${estimateNumber}`;
    const t = setTimeout(() => window.print(), 600);
    return () => {
      document.title = oldTitle;
      clearTimeout(t);
    };
  }, [estimateNumber]);

  // 5) Let's group our data for "Summary" and "Cost Breakdown"
  //    (Here we replicate logic from the "RoomsEstimate" approach)
  // We'll do "section => catId => services" or something similar
  // Or we can do "just print out the final details" if we want simpler.

  // We might want a function to get the category from a service ID
  function getCategoryIdFromServiceId(serviceId: string): string {
    return serviceId.split("-").slice(0, 2).join("-");
  }
  function getCategoryNameById(catId: string): string {
    const found = ALL_CATEGORIES.find((c) => c.id === catId);
    return found ? found.title : catId;
  }

  // Let's also figure out "which room => which services" for the Summary
  const allRooms = [...ROOMS.indoor, ...ROOMS.outdoor];
  function getRoomById(roomId: string) {
    return allRooms.find((r) => r.id === roomId) || null;
  }

  // Build data structure for "Summary" => (room => sections => cat => services)
  // Similar to a 3-level approach: 
  //  (1) Section: We'll treat the Category's "section" property 
  //  (2) The catId => title
  //  (3) The services

  // For "Cost Breakdown" we can replicate the approach or unify them in a single pass.

  // 6) Render
  return (
    <div className="print-page p-4 my-2">
      {/* Minimal header */}
      <div className="flex items-center justify-between mb-4">
        {/* If you have a logo, place it here */}
        <img src="/images/logo.png" alt="JAMB Logo" className="h-10 w-auto" />
      </div>
      <hr className="border-gray-300 mb-4" />

      {/* Title / Basic Info */}
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
      <p className="mb-4">
        <strong>Details:</strong> {description || "No details provided"}
      </p>

      {/* Photos */}
      {photos.length > 0 && (
        <section className="mb-6">
          <h3 className="font-semibold text-xl mb-2">Uploaded Photos</h3>
          <div className="flex gap-2 w-full">
            {photos.map((photo, idx) => (
              <img
                key={idx}
                src={photo}
                alt={`Photo ${idx + 1}`}
                className="flex-1 h-24 object-cover rounded-md border border-gray-300"
              />
            ))}
          </div>
        </section>
      )}

      {/* (Optional) Disclaimer */}
      <div className="mb-8">
        <DisclaimerBlock />
      </div>

      {/* (1) SUMMARY */}
      <section className="page-break mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">1) Summary</h2>
        <p className="text-sm text-gray-700 mb-4">
          This table provides a simple overview of each selected service, quantity, and total cost.
        </p>

        {/* 
          Here we replicate the "Summary" approach:
          We'll show each room, then group by category, list services with numbering
        */}
        <div className="space-y-8">
          {Object.entries(selectedServicesState).map(([roomId, svcMap]) => {
            const svcIds = Object.keys(svcMap);
            if (svcIds.length === 0) return null;

            // Find the room object
            const roomObj = getRoomById(roomId);
            const roomTitle = roomObj ? roomObj.title : roomId;

            // Group them by "categoryId"
            const catGroups: Record<string, string[]> = {};
            svcIds.forEach((id) => {
              const catId = getCategoryIdFromServiceId(id);
              if (!catGroups[catId]) catGroups[catId] = [];
              catGroups[catId].push(id);
            });

            return (
              <div key={roomId}>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {roomTitle}
                </h3>

                {Object.entries(catGroups).map(([catId, ids], catIdx) => {
                  const catNumber = catIdx + 1;
                  const catName = getCategoryNameById(catId);

                  return (
                    <div key={catId} className="ml-4 mb-4">
                      <h4 className="text-lg font-medium text-gray-700 mb-2">
                        {catNumber}. {catName}
                      </h4>

                      {ids.map((svcId, svcIdx) => {
                        const svcNumber = `${catNumber}.${svcIdx + 1}`;
                        const foundSvc = ALL_SERVICES.find((s) => s.id === svcId);
                        if (!foundSvc) return null;
                        const qty = svcMap[svcId] || 1;
                        const lineCost = foundSvc.price * qty;

                        return (
                          <div key={svcId} className="pl-4 border-gray-200 mb-3">
                            <h5 className="font-medium text-md text-gray-800">
                              {svcNumber}. {foundSvc.title}
                            </h5>
                            {foundSvc.description && (
                              <p className="text-sm text-gray-500">
                                {foundSvc.description}
                              </p>
                            )}
                            <p className="mt-1 text-sm text-gray-700 flex justify-between">
                              <span>
                                {qty} {foundSvc.unit_of_measurement || "units"}
                              </span>
                              <span>${formatWithSeparator(lineCost)}</span>
                            </p>
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
      </section>

      {/* (2) COST BREAKDOWN */}
      <section className="page-break mt-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          2) Cost Breakdown
        </h2>
        <p className="text-sm text-gray-700 mb-4">
          This section shows a more detailed breakdown of labor and materials (if any).
        </p>

        {/* 
          Пример: если вы используете calculationResultsMap, 
          можно выводить детальнее (Labor cost, Materials table, etc.)
          Ниже - упрощённый вариант, если вам нужен полный "Detailed" анализ.
        */}
        <p className="text-sm text-gray-500">
          (*Here you'd replicate the logic of listing each service's labor + material breakdown if you store that in session.)
        </p>
      </section>

      {/* (3) SPECIFICATIONS */}
      <section className="page-break mt-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          3) Specifications
        </h2>
        <p className="text-sm text-gray-700 mb-4">
          This section shows labor by section (including any date surcharges/discounts) and an overall list of materials, if applicable.
        </p>

        {/* A) Labor by Section (example) */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-2">A) Labor by Section</h3>
          <p className="text-sm text-gray-500">
            (If you have the notion of "sections" or "categories", you can sum the labor from each one. 
            Otherwise, just show the total labor.)
          </p>
        </div>

        {/* B) Overall Materials */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">B) Overall Materials</h3>
          <p className="text-sm text-gray-500">
            (If you track a materials list in calculationResultsMap, you'd show it here.)
          </p>
        </div>
      </section>

      {/* Final totals / spelled-out */}
      <section className="mt-8 border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Final Summary
        </h3>

        <div className="flex justify-between text-sm mb-2">
          <span>Labor:</span>
          <span>${formatWithSeparator(laborSubtotal)}</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span>Materials:</span>
          <span>${formatWithSeparator(materialsSubtotal)}</span>
        </div>
        {/* Fees */}
        <div className="flex justify-between text-sm mb-2">
          <span>Service Fee (15% on labor)</span>
          <span>${formatWithSeparator(serviceFeeOnLabor)}</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span>Delivery &amp; Processing (5% on materials)</span>
          <span>${formatWithSeparator(serviceFeeOnMaterials)}</span>
        </div>
        {/* Subtotal */}
        <div className="flex justify-between text-base font-semibold mb-2 mt-4">
          <span>Subtotal:</span>
          <span>${formatWithSeparator(sumBeforeTax)}</span>
        </div>
        {/* Tax */}
        {taxRatePercent > 0 && (
          <div className="flex justify-between text-sm mb-2">
            <span>Sales tax ({taxRatePercent.toFixed(2)}%)</span>
            <span>${formatWithSeparator(taxAmount)}</span>
          </div>
        )}
        {/* Final */}
        <div className="flex justify-between text-xl font-bold mt-4">
          <span>Total:</span>
          <span>${formatWithSeparator(finalTotal)}</span>
        </div>
        <div className="text-right text-sm text-gray-600 mt-1">
          ({finalTotalWords})
        </div>
      </section>
    </div>
  );
}