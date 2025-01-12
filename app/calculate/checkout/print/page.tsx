"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ALL_SERVICES } from "@/constants/services";
import { ALL_CATEGORIES } from "@/constants/categories";
import { taxRatesUSA } from "@/constants/taxRatesUSA";
import { DisclaimerBlock } from "@/components/ui/DisclaimerBlock";
import { getSessionItem, setSessionItem } from "@/utils/session";

/**
 * Formats a number with commas and exactly two decimals, e.g. 1234 => "1,234.00"
 */
function formatWithSeparator(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Returns the combined state+local tax rate (e.g. 8.85) for "CA" from taxRatesUSA.
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
 * Example: 1234.56 => "One thousand two hundred thirty-four and 56/100 dollars"
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
    return `${onesMap[tens]}-${onesMap[ones]}`;
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
 * Builds an estimate number in the format "CA-94103-YYYYMMDD-HHMM" or fallback.
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

/**
 * getCategoryNameById:
 * Locates a category by its ID from ALL_CATEGORIES and returns its title,
 * or returns the ID if not found.
 */
function getCategoryNameById(catId: string): string {
  const found = ALL_CATEGORIES.find((c) => c.id === catId);
  return found ? found.title : catId;
}

export default function PrintServicesEstimate() {
  const router = useRouter();

  // Load data from session using getSessionItem
  const selectedServicesState: Record<string, number> = getSessionItem(
    "selectedServicesWithQuantity",
    {}
  );
  const calculationResultsMap: Record<string, any> = getSessionItem(
    "calculationResultsMap",
    {}
  );
  const address = getSessionItem("address", "");
  const photos: string[] = getSessionItem("photos", []);
  const description = getSessionItem("description", "");
  const selectedTime = getSessionItem<string | null>("selectedTime", null);
  const timeCoefficient = getSessionItem<number>("timeCoefficient", 1);
  const serviceFeeOnLabor = getSessionItem("serviceFeeOnLabor", 0);
  const serviceFeeOnMaterials = getSessionItem("serviceFeeOnMaterials", 0);
  const userStateCode = getSessionItem("location_state", "");
  const userZip = getSessionItem("location_zip", "00000");
  const selectedCategories: string[] = getSessionItem(
    "services_selectedCategories",
    []
  );
  const searchQuery: string = getSessionItem("services_searchQuery", "");

  // If no data => redirect
  useEffect(() => {
    if (Object.keys(selectedServicesState).length === 0 || !address.trim()) {
      router.push("/calculate/estimate");
    }
  }, [selectedServicesState, address, router]);

  // Build categories by section
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

  // Build cat->services map
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
  const sumBeforeTax = finalLabor + materialsSubtotal + serviceFeeOnLabor + serviceFeeOnMaterials;
  const taxRatePercent = getTaxRateForState(userStateCode);
  const taxAmount = sumBeforeTax * (taxRatePercent / 100);
  const finalTotal = sumBeforeTax + taxAmount;
  const finalTotalWords = numberToWordsUSD(finalTotal);
  const estimateNumber = buildEstimateNumber(userStateCode, userZip);

  // Print on mount
  useEffect(() => {
    const oldTitle = document.title;
    document.title = `JAMB-Estimate-${estimateNumber}`;
    const t = setTimeout(() => window.print(), 600);
    return () => {
      document.title = oldTitle;
      clearTimeout(t);
    };
  }, [estimateNumber]);

  // We'll also build a materials breakdown, plus labor-by-section
  interface MaterialSpec {
    name: string;
    totalQuantity: number;
    totalCost: number;
  }
  const materialsSpecMap: Record<string, MaterialSpec> = {};
  const sectionLaborMap: Record<string, number> = {};

  for (const svcId of Object.keys(selectedServicesState)) {
    const cr = calculationResultsMap[svcId];
    if (!cr) continue;

    // find which cat -> which section
    const catIdFound = selectedCategories.find((catId) =>
      svcId.startsWith(catId + "-")
    );
    if (!catIdFound) continue;
    const catObj = ALL_CATEGORIES.find((x) => x.id === catIdFound);
    if (!catObj) continue;
    const secName = catObj.section;

    const laborVal = parseFloat(cr.work_cost) || 0;
    if (!sectionLaborMap[secName]) {
      sectionLaborMap[secName] = 0;
    }
    sectionLaborMap[secName] += laborVal;

    if (Array.isArray(cr.materials)) {
      cr.materials.forEach((m: any) => {
        const name = m.name;
        const costVal = parseFloat(m.cost) || 0;
        const qtyVal = m.quantity || 0;

        if (!materialsSpecMap[name]) {
          materialsSpecMap[name] = {
            name,
            totalQuantity: 0,
            totalCost: 0,
          };
        }
        materialsSpecMap[name].totalQuantity += qtyVal;
        materialsSpecMap[name].totalCost += costVal;
      });
    }
  }

  const materialsSpecArray = Object.values(materialsSpecMap);
  const totalMaterialsCost = materialsSpecArray.reduce((acc, m) => acc + m.totalCost, 0);
  const laborDiff = finalLabor - laborSubtotal;

  return (
    <div className="print-page p-4 my-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <img src="/images/logo.png" alt="JAMB Logo" className="h-10 w-auto" />
      </div>
      <hr className="border-gray-300 mb-4" />

      <div className="flex justify-between items-center mb-4 mt-12">
        <div>
          <h1 className="text-2xl font-bold">Estimate for Selected Services</h1>
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

      <div className="mb-8">
        <DisclaimerBlock />
      </div>

      {/* (1) SUMMARY */}
      <section className="page-break mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">1) Summary</h2>
        <p className="text-sm text-gray-700 mb-4">
          This table provides a simple overview of each selected service,
          quantity, and total cost.
        </p>

        <table className="w-full table-auto border border-gray-300 text-sm text-gray-700">
          <thead>
            <tr className="border-b bg-white">
              <th className="px-3 py-2 border-r border-gray-300 w-14 text-center">#</th>
              <th className="px-3 py-2 border-r border-gray-300 text-left">Service</th>
              <th className="px-3 py-2 border-r border-gray-300 text-center w-20">Qty</th>
              <th className="px-3 py-2 text-center w-24">Total Cost</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(categoriesBySection).map(
              ([sectionName, catIds], i) => {
                const sectionIndex = i + 1;
                const catsWithServices = catIds.filter((catId) => {
                  const arr = categoryServicesMap[catId] || [];
                  return arr.some((s) => selectedServicesState[s.id] != null);
                });
                if (catsWithServices.length === 0) return null;

                return (
                  <React.Fragment key={sectionName}>
                    <tr>
                      <td
                        colSpan={4}
                        className="px-3 py-2 font-medium bg-gray-100 border-b border-gray-300"
                      >
                        {sectionIndex}. {sectionName}
                      </td>
                    </tr>
                    {catsWithServices.map((catId, j) => {
                      const catIndex = j + 1;
                      const arr = categoryServicesMap[catId] || [];
                      const chosenServices = arr.filter(
                        (svc) => selectedServicesState[svc.id] != null
                      );
                      if (chosenServices.length === 0) return null;

                      const catName = getCategoryNameById(catId);

                      return (
                        <React.Fragment key={catId}>
                          <tr>
                            <td
                              colSpan={4}
                              className="px-5 py-2 border-b border-gray-200 font-medium"
                            >
                              {sectionIndex}.{catIndex}. {catName}
                            </td>
                          </tr>
                          {chosenServices.map((svc, k2) => {
                            const svcIndex = k2 + 1;
                            const qty = selectedServicesState[svc.id] || 1;
                            const cr = calculationResultsMap[svc.id];
                            const finalCost = cr
                              ? parseFloat(cr.total) || 0
                              : 0;

                            return (
                              <tr
                                key={svc.id}
                                className="border-b last:border-0"
                              >
                                <td className="px-3 py-2 border-r border-gray-300 text-center">
                                  {sectionIndex}.{catIndex}.{svcIndex}
                                </td>
                                <td className="px-3 py-2 border-r border-gray-300">
                                  {svc.title}
                                </td>
                                <td className="px-3 py-2 border-r border-gray-300 text-center">
                                  {qty} {svc.unit_of_measurement}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  ${formatWithSeparator(finalCost)}
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}
                  </React.Fragment>
                );
              }
            )}
          </tbody>
        </table>

        {/* Summary totals */}
        <div className="border-t pt-4 mt-6 space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Labor total:</span>
            <span>${formatWithSeparator(laborSubtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Materials, tools and equipment:</span>
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

          <div className="flex justify-between">
            <span>Service Fee (15% on labor)</span>
            <span>${formatWithSeparator(serviceFeeOnLabor)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery &amp; Processing (5% on materials)</span>
            <span>${formatWithSeparator(serviceFeeOnMaterials)}</span>
          </div>

          <div className="flex justify-between font-semibold">
            <span>Subtotal:</span>
            <span>${formatWithSeparator(sumBeforeTax)}</span>
          </div>
          <div className="flex justify-between">
            <span>
              Sales tax
              {userStateCode ? ` (${userStateCode})` : ""}
              {taxRatePercent > 0 ? ` (${taxRatePercent.toFixed(2)}%)` : ""}
              :
            </span>
            <span>${formatWithSeparator(taxAmount)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold mt-2">
            <span>Total:</span>
            <span>${formatWithSeparator(finalTotal)}</span>
          </div>
          <p className="text-right text-sm text-gray-600">
            ({finalTotalWords})
          </p>
        </div>
      </section>

      {/* 2) COST BREAKDOWN */}
      <section className="page-break mt-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          2) Cost Breakdown
        </h2>
        <p className="text-sm text-gray-700 mb-4">
          This section shows a detailed breakdown of each service's labor and
          materials cost.
        </p>

        {Object.entries(categoriesBySection).map(([sectionName, catIds], i) => {
          const sectionIndex = i + 1;
          const catsWithServices = catIds.filter((catId) => {
            const arr = categoryServicesMap[catId] || [];
            return arr.some((svc) => selectedServicesState[svc.id] != null);
          });
          if (catsWithServices.length === 0) return null;

          return (
            <div key={sectionName} className="avoid-break mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {sectionIndex}. {sectionName}
              </h3>
              {catsWithServices.map((catId, j) => {
                const catIndex = j + 1;
                const arr = categoryServicesMap[catId] || [];
                const chosenServices = arr.filter(
                  (svc) => selectedServicesState[svc.id] != null
                );
                if (chosenServices.length === 0) return null;

                const catName = getCategoryNameById(catId);

                return (
                  <div key={catId} className="ml-4 mb-4 avoid-break">
                    <h4 className="text-base font-semibold text-gray-700 mb-2">
                      {sectionIndex}.{catIndex}. {catName}
                    </h4>
                    {chosenServices.map((svc, k2) => {
                      const svcIndex = k2 + 1;
                      const quantity = selectedServicesState[svc.id] || 1;
                      const cr = calculationResultsMap[svc.id];
                      const finalCost = cr ? parseFloat(cr.total) || 0 : 0;

                      return (
                        <div key={svc.id} className="mb-4 avoid-break">
                          <h5 className="text-sm font-semibold text-gray-800 flex justify-between">
                            <span>
                              {sectionIndex}.{catIndex}.{svcIndex}. {svc.title}
                            </span>
                          </h5>
                          {svc.description && (
                            <p className="text-sm text-gray-500 my-1">
                              {svc.description}
                            </p>
                          )}
                          <p className="text-sm text-gray-800 flex justify-between">
                            <span className="font-semibold">
                              {quantity} {svc.unit_of_measurement}
                            </span>
                            <span className="font-semibold mr-4">
                              ${formatWithSeparator(finalCost)}
                            </span>
                          </p>

                          {/* cost breakdown */}
                          {cr && (
                            <div className="mt-2 p-3 bg-gray-50 border border-gray-300 rounded text-sm text-gray-700">
                              <div className="flex justify-between mb-1">
                                <span className="font-semibold">Labor</span>
                                <span className="font-semibold">
                                  {cr.work_cost
                                    ? `$${formatWithSeparator(
                                        parseFloat(cr.work_cost)
                                      )}`
                                    : "—"}
                                </span>
                              </div>
                              <div className="flex justify-between mb-3">
                                <span className="font-semibold">
                                  Materials, tools and equipment
                                </span>
                                <span className="font-semibold">
                                  {cr.material_cost
                                    ? `$${formatWithSeparator(
                                        parseFloat(cr.material_cost)
                                      )}`
                                    : "—"}
                                </span>
                              </div>

                              {Array.isArray(cr.materials) &&
                                cr.materials.length > 0 && (
                                  <div className="mt-2">
                                    <table className="table-auto w-full text-left text-gray-700">
                                      <thead>
                                        <tr className="border-b">
                                          <th className="py-1 px-1">Name</th>
                                          <th className="py-1 px-1">Price</th>
                                          <th className="py-1 px-1">Qty</th>
                                          <th className="py-1 px-1">
                                            Subtotal
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-200">
                                        {cr.materials.map(
                                          (m: any, idx2: number) => (
                                            <tr
                                              key={`${m.external_id}-${idx2}`}
                                            >
                                              <td className="py-2 px-1">
                                                {m.name}
                                              </td>
                                              <td className="py-2 px-1">
                                                $
                                                {formatWithSeparator(
                                                  parseFloat(m.cost_per_unit)
                                                )}
                                              </td>
                                              <td className="py-2 px-1">
                                                {m.quantity}
                                              </td>
                                              <td className="py-2 px-1">
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
      </section>

      {/* 3) SPECIFICATIONS */}
      <section className="page-break mt-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          3) Specifications
        </h2>
        <p className="text-sm text-gray-700 mb-4">
          This section shows labor by section (including any date
          surcharges/discounts) and an overall list of materials.
        </p>

        {/* A) Labor by Section */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            A) Labor by Section
          </h3>
          <table className="w-full table-auto border border-gray-300 text-sm text-gray-700 mb-3">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 border border-gray-300 text-left">
                  Section
                </th>
                <th className="px-3 py-2 border  border-gray-300 text-right">
                  Labor
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(categoriesBySection).map((sectionName) => {
                // Summation for each section
                let laborSum = 0;
                // For each category in that section => for each chosen service => accumulate labor
                const catIds = categoriesBySection[sectionName];
                catIds.forEach((catId) => {
                  const arr = categoryServicesMap[catId] || [];
                  arr.forEach((svc) => {
                    if (selectedServicesState[svc.id]) {
                      const cr = calculationResultsMap[svc.id];
                      if (cr && cr.work_cost) {
                        laborSum += parseFloat(cr.work_cost);
                      }
                    }
                  });
                });
                if (laborSum === 0) return null;

                return (
                  <tr key={sectionName} className="border-b last:border-0">
                    <td className="px-3 py-2 border border-gray-300">
                      {sectionName}
                    </td>
                    <td className="px-3 py-2 border border-gray-300 text-right">
                      ${formatWithSeparator(laborSum)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {/* Explanation */}
          <div className="text-sm">
            <div className="flex justify-end">
              <span className="mr-6">Labor Sum:</span>
              <span>${formatWithSeparator(laborSubtotal)}</span>
            </div>
            {timeCoefficient !== 1 && (
              <div className="flex justify-end mt-1">
                <span className="mr-6">
                  {timeCoefficient > 1 ? "Surcharge" : "Discount"}:
                </span>
                <span>
                  {timeCoefficient > 1 ? "+" : "-"}$
                  {formatWithSeparator(Math.abs(laborDiff))}
                </span>
              </div>
            )}
            <div className="flex justify-end font-semibold mt-1">
              <span className="mr-6">Total Labor:</span>
              <span>${formatWithSeparator(finalLabor)}</span>
            </div>
          </div>
        </div>

        {/* B) Overall Materials */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            B) Overall Materials, tools and equipment
          </h3>
          {/* If no materials => show message */}
          {materialsSpecArray.length === 0 ? (
            <p className="text-sm text-gray-700">
              No materials used in this estimate.
            </p>
          ) : (
            <div>
              <table className="w-full table-auto border border-gray-300 text-sm text-gray-700">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 border border-gray-300 text-left">
                      Material Name
                    </th>
                    <th className="px-3 py-2 border border-gray-300 text-center">
                      Qty
                    </th>
                    <th className="px-3 py-2 border border-gray-300 text-center">
                      Price
                    </th>
                    <th className="px-3 py-2 border text-center">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {materialsSpecArray.map((mat) => {
                    const unitPrice = mat.totalQuantity
                      ? mat.totalCost / mat.totalQuantity
                      : 0;
                    return (
                      <tr key={mat.name} className="border-b last:border-0">
                        <td className="px-3 py-2 border-r border-gray-300">
                          {mat.name}
                        </td>
                        <td className="px-3 py-2 border-r border-gray-300 text-center">
                          {mat.totalQuantity}
                        </td>
                        <td className="px-3 py-2 border-r border-gray-300 text-center">
                          ${formatWithSeparator(unitPrice)}
                        </td>
                        <td className="px-3 py-2 text-center">
                          ${formatWithSeparator(mat.totalCost)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="flex justify-end mt-2 text-sm font-semibold">
                <span className="mr-6">Total Materials, tools and equipment:</span>
                <span>${formatWithSeparator(totalMaterialsCost)}</span>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}