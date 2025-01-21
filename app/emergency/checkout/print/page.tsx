"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { EMERGENCY_SERVICES } from "@/constants/emergency";
import { ALL_SERVICES } from "@/constants/services";
import { taxRatesUSA } from "@/constants/taxRatesUSA";
import { DisclaimerBlock } from "@/components/ui/DisclaimerBlock";
import { getSessionItem } from "@/utils/session";
import { formatWithSeparator } from "@/utils/format";

/**
 * Returns combined state+local tax rate from taxRatesUSA, or 0 if not found.
 */
function getTaxRateForState(stateCode: string): number {
  if (!stateCode) return 0;
  const row = taxRatesUSA.taxRates.find(
    (r) => r.state.toLowerCase() === stateCode.toLowerCase()
  );
  return row ? row.combinedStateAndLocalTaxRate : 0;
}

/**
 * Converts a numeric USD amount into spelled-out text (simplified).
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
    let str = "";
    if (hundreds > 0) {
      str += `${onesMap[hundreds]} hundred`;
      if (remainder > 0) str += " ";
    }
    if (remainder > 0) {
      str += remainder < 100 ? twoDigits(remainder) : "";
    }
    return str || "zero";
  }

  let integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - integerPart) * 100);
  const units = ["", " thousand", " million", " billion"];
  let i = 0;
  let result = "";

  if (integerPart === 0) {
    result = "zero";
  } else {
    while (integerPart > 0 && i < units.length) {
      const chunk = integerPart % 1000;
      integerPart = Math.floor(integerPart / 1000);
      if (chunk > 0) {
        const chunkStr = threeDigits(chunk);
        const label = units[i] ? ` ${units[i]}` : "";
        result = chunkStr + label + (result ? " " + result : "");
      }
      i++;
    }
  }
  const decStr = decimalPart < 10 ? `0${decimalPart}` : String(decimalPart);
  return `${result} and ${decStr}/100 dollars`;
}

/**
 * Builds an estimate number in the format: SS-ZZZZZ-YYYYMMDD-HHMM
 * Where SS is a two-letter uppercase state code,
 * ZZZZZ is a 5-digit ZIP code,
 * and YYYYMMDD-HHMM is the current date/time.
 */
function buildEstimateNumber(stateCode: string, zip: string): string {
  let stateZipBlock = "??-00000";
  if (stateCode && stateCode.length >= 2 && zip && zip.length === 5) {
    const upperState = stateCode.slice(0, 2).toUpperCase();
    stateZipBlock = `${upperState}-${zip}`;
  }
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mins = String(now.getMinutes()).padStart(2, "0");
  const dateString = `${yyyy}${mm}${dd}`;
  const timeString = hh + mins;
  return `${stateZipBlock}-${dateString}-${timeString}`;
}

/**
 * Tries to parse "State, ZIP" by splitting on commas if present,
 * then falls back to a simple regex pattern for "... SomeState 12345" at the end of the string.
 */
function parseStateAndZipFromAddress(fullAddr: string) {
  const parts = fullAddr.split(",").map((p) => p.trim());
  if (parts.length >= 3) {
    const potentialState = parts[1];
    const potentialZip = parts[2];
    if (potentialState.length === 2 && potentialZip.length === 5) {
      return { parsedState: potentialState, parsedZip: potentialZip };
    }
  }
  // fallback to a simplified pattern
  const regex = /([A-Za-z]+)\s+(\d{5})$/;
  const match = fullAddr.trim().match(regex);
  if (match) {
    return { parsedState: match[1], parsedZip: match[2] };
  }
  return { parsedState: "", parsedZip: "" };
}

/** Determines a category name by scanning EMERGENCY_SERVICES for an activityKey. */
function deriveCategoryFromActivityKey(activityKey: string): string {
  for (const catKey of Object.keys(EMERGENCY_SERVICES)) {
    const catObj = EMERGENCY_SERVICES[catKey];
    if (!catObj?.services) continue;
    for (const svcKey of Object.keys(catObj.services)) {
      const svcData = catObj.services[svcKey];
      if (svcData?.activities && svcData.activities[activityKey]) {
        // e.g. "plumbing" => "Plumbing"
        return catKey.charAt(0).toUpperCase() + catKey.slice(1);
      }
    }
  }
  return "Uncategorized";
}

interface SelectedActivities {
  [service: string]: {
    [activityKey: string]: number;
  };
}

export default function PrintEmergencyEstimate() {
  const router = useRouter();

  // (1) Load from session using new helper
  const selectedActivities = getSessionItem<SelectedActivities>("selectedActivities", {});
  const calculationResultsMap = getSessionItem<Record<string, any>>("calculationResultsMap", {});
  const fullAddress = getSessionItem<string>("fullAddress", "");
  const photos = getSessionItem<string[]>("photos", []);
  const description = getSessionItem<string>("description", "");
  const date = getSessionItem<string>("selectedTime", "No date selected");
  const timeCoefficient = getSessionItem<number>("timeCoefficient", 1);
  const serviceFeeOnLabor = getSessionItem<number>("serviceFeeOnLabor", 0);
  const serviceFeeOnMaterials = getSessionItem<number>("serviceFeeOnMaterials", 0);
  const userTaxRate = getSessionItem<number>("userTaxRate", 0);

  // Possibly parse state/zip from address if missing
  let userStateCode = getSessionItem<string>("location_state", "XX");
  let userZip = getSessionItem<string>("location_zip", "00000");
  if ((userStateCode === "XX" || userZip === "00000") && fullAddress) {
    const { parsedState, parsedZip } = parseStateAndZipFromAddress(fullAddress);
    if (parsedState && parsedState.length >= 2 && parsedZip && parsedZip.length === 5) {
      userStateCode = parsedState.toUpperCase(); // e.g. "NY"
      userZip = parsedZip;
    }
  }

  // Steps array
  const filteredSteps = getSessionItem<{ serviceName: string; steps: any[] }[]>(
    "filteredSteps",
    []
  );

  // (2) Validate essential data
  useEffect(() => {
    if (!selectedActivities || Object.keys(selectedActivities).length === 0 || !fullAddress.trim()) {
      router.push("/emergency/estimate");
    }
  }, [selectedActivities, fullAddress, router]);

  // (3) Summation logic
  function sumLabor(): number {
    let total = 0;
    for (const acts of Object.values(selectedActivities)) {
      for (const key of Object.keys(acts)) {
        const res = calculationResultsMap[key];
        if (res) total += parseFloat(res.work_cost) || 0;
      }
    }
    return total;
  }

  function sumMaterials(): number {
    let total = 0;
    for (const acts of Object.values(selectedActivities)) {
      for (const key of Object.keys(acts)) {
        const res = calculationResultsMap[key];
        if (res) total += parseFloat(res.material_cost) || 0;
      }
    }
    return total;
  }

  const laborSubtotal = sumLabor();
  const materialsSubtotal = sumMaterials();
  const finalLabor = laborSubtotal * timeCoefficient;
  const sumBeforeFees = finalLabor + materialsSubtotal;
  const sumBeforeTax = sumBeforeFees + serviceFeeOnLabor + serviceFeeOnMaterials;
  const taxAmount = sumBeforeTax * (userTaxRate / 100);
  const grandTotal = sumBeforeTax + taxAmount;
  const hasSurchargeOrDiscount = timeCoefficient !== 1;
  const laborDiff = finalLabor - laborSubtotal;
  const surchargeOrDiscount = hasSurchargeOrDiscount
    ? Math.abs(laborSubtotal * (timeCoefficient - 1))
    : 0;

  // Build final estimate number
  const estimateNumber = buildEstimateNumber(userStateCode, userZip);
  const totalInWords = numberToWordsUSD(grandTotal);

  // Build array => group by derived category
  interface RenderItem {
    category: string;
    activityKey: string;
    title: string;
    description?: string;
    quantity: number;
    combinedCost: number;
    breakdown: any;
  }

  const renderItems: RenderItem[] = [];
  for (const acts of Object.values(selectedActivities)) {
    for (const [activityKey, quantity] of Object.entries(acts)) {
      const cr = calculationResultsMap[activityKey];
      if (!cr) continue;
      const found = ALL_SERVICES.find((svc) => svc.id === activityKey);
      if (!found) continue;

      const combinedCost =
        parseFloat(cr.work_cost || "0") + parseFloat(cr.material_cost || "0");
      renderItems.push({
        category: deriveCategoryFromActivityKey(activityKey),
        activityKey,
        title: found.title,
        description: found.description,
        quantity,
        combinedCost,
        breakdown: cr,
      });
    }
  }

  // group them
  const groupedByCategory: Record<string, RenderItem[]> = {};
  renderItems.forEach((item) => {
    if (!groupedByCategory[item.category]) {
      groupedByCategory[item.category] = [];
    }
    groupedByCategory[item.category].push(item);
  });
  const sortedCats = Object.keys(groupedByCategory).sort();

  // For specs => labor by category + overall materials
  const materialsSpecMap: Record<
    string,
    { name: string; totalQuantity: number; totalCost: number }
  > = {};
  const categoryLaborMap: Record<string, number> = {};

  // Accumulate
  for (const acts of Object.values(selectedActivities)) {
    for (const [activityKey] of Object.entries(acts)) {
      const cr = calculationResultsMap[activityKey];
      if (!cr) continue;

      const cat = deriveCategoryFromActivityKey(activityKey);
      const laborVal = parseFloat(cr.work_cost) || 0;
      if (!categoryLaborMap[cat]) {
        categoryLaborMap[cat] = 0;
      }
      categoryLaborMap[cat] += laborVal;

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
  }

  const materialsSpecArray = Object.values(materialsSpecMap);
  const totalMaterialsCost = materialsSpecArray.reduce(
    (acc, mat) => acc + mat.totalCost,
    0
  );

  // Adjust doc title + auto-print
  useEffect(() => {
    const oldTitle = document.title;
    document.title = `EmergencyEstimate-${estimateNumber}`;
    const timer = setTimeout(() => window.print(), 700);
    return () => {
      document.title = oldTitle;
      clearTimeout(timer);
    };
  }, [estimateNumber]);

  return (
    <div className="print-page p-4 text-sm text-gray-800">
      {/* Logo + horizontal divider */}
      <div className="flex items-center justify-between mb-4">
        <img
          src="/images/logo.png"
          alt="Your Logo"
          className="h-10 w-auto object-contain"
        />
      </div>
      <hr className="border-gray-300 mb-6" />

      {/* Title + estimate number */}
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-2xl font-bold">Emergency Estimate</h1>
        <span className="text-sm text-gray-500">({estimateNumber})</span>
      </div>
      <p className="text-xs text-gray-400 mb-4">
        *This number is temporary and will be replaced with a permanent
        order number after confirmation.
      </p>

      {/* Address / date / description */}
      <div className="space-y-2 mb-6">
        <div>
          <strong>Address:</strong>{" "}
          <span>{fullAddress || "No address provided"}</span>
        </div>
        <div>
          <strong>Date of Service:</strong>{" "}
          <span>{date || "No date selected"}</span>
        </div>
        <div>
          <strong>Problem Description:</strong>{" "}
          <span>{description || "No details provided"}</span>
        </div>

        {/* Photos logic here */}
        {photos.length > 0 && (
          <div className="mt-2">
            <strong>Uploaded Photos:</strong>
            <div className="mt-2">
              {/* 1) Single photo => half width */}
              {photos.length === 1 ? (
                <div className="flex w-full justify-center">
                  <div className="w-1/2 overflow-hidden rounded-md border border-gray-300">
                    <img
                      src={photos[0]}
                      alt="Emergency Photo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ) : photos.length <= 8 ? (
                /* 2) If 2..8 => single row => exactly photos.length columns */
                <div
                  className={`grid grid-cols-${photos.length} gap-2 w-full`}
                  style={{
                    gridTemplateColumns: `repeat(${photos.length}, minmax(0, 1fr))`,
                  }}
                >
                  {photos.map((ph, idx) => (
                    <div
                      key={idx}
                      className="overflow-hidden rounded-md border border-gray-300"
                    >
                      <img
                        src={ph}
                        alt={`Photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                /* 3) More than 8 => two rows, each 8 columns */
                <div className="flex flex-col gap-2 w-full">
                  <div className="grid grid-cols-8 gap-2 w-full">
                    {photos.slice(0, 8).map((ph, idx) => (
                      <div
                        key={idx}
                        className="overflow-hidden rounded-md border border-gray-300"
                      >
                        <img
                          src={ph}
                          alt={`Photo ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-8 gap-2 w-full">
                    {photos.slice(8).map((ph, idx) => (
                      <div
                        key={idx}
                        className="overflow-hidden rounded-md border border-gray-300"
                      >
                        <img
                          src={ph}
                          alt={`Photo ${8 + idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="mb-8">
        <DisclaimerBlock />
      </div>

      {/* ---------- (1) SUMMARY ---------- */}
      <section className="page-break mb-10 mt-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">1) Summary</h2>
        <p className="text-sm text-gray-700 mb-4">
          A quick overview of all selected services, quantity, and simple totals.
        </p>

        {/* Table of categories -> items */}
        <table className="w-full table-auto border border-gray-300 text-gray-700 text-sm">
          <thead className="bg-gray-50">
            <tr className="border-b">
              <th className="px-3 py-2 border-r">#</th>
              <th className="px-3 py-2 border-r text-left">Service</th>
              <th className="px-3 py-2 border-r text-center">Qty</th>
              <th className="px-3 py-2 text-center">Total Cost</th>
            </tr>
          </thead>
          <tbody>
            {sortedCats.map((catName, i) => {
              const catIndex = i + 1;
              const items = groupedByCategory[catName];
              return (
                <React.Fragment key={catName}>
                  <tr className="border-b bg-gray-100">
                    <td colSpan={4} className="px-3 py-2 font-semibold">
                      {catIndex}. {catName}
                    </td>
                  </tr>
                  {items.map((item, j) => {
                    const rowNum = `${catIndex}.${j + 1}`;
                    return (
                      <tr
                        key={item.activityKey}
                        className="border-b last:border-0"
                      >
                        <td className="px-3 py-2 border-r text-center">
                          {rowNum}
                        </td>
                        <td className="px-3 py-2 border-r">{item.title}</td>
                        <td className="px-3 py-2 border-r text-center">
                          {item.quantity}
                        </td>
                        <td className="px-3 py-2 text-center">
                          ${formatWithSeparator(item.combinedCost)}
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {/* Totals */}
        <div className="border-t pt-3 mt-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Labor:</span>
            <span>${formatWithSeparator(finalLabor)}</span>
          </div>

          <div className="flex justify-between">
            <span>Materials, tools &amp; equipment:</span>
            <span>${formatWithSeparator(materialsSubtotal)}</span>
          </div>

          {hasSurchargeOrDiscount && (
            <div className="flex justify-between">
              <span>
                {timeCoefficient > 1 ? "Surcharge (urgency)" : "Discount (date selection)"}:
              </span>
              <span>
                {timeCoefficient > 1 ? "+" : "-"}$
                {formatWithSeparator(surchargeOrDiscount)}
              </span>
            </div>
          )}

          <div className="flex justify-between">
            <span>Service Fee (20% on labor):</span>
            <span>${formatWithSeparator(serviceFeeOnLabor)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery &amp; Processing (10% on materials):</span>
            <span>${formatWithSeparator(serviceFeeOnMaterials)}</span>
          </div>

          <div className="flex justify-between font-semibold">
            <span>Subtotal:</span>
            <span>${formatWithSeparator(sumBeforeTax)}</span>
          </div>
          <div className="flex justify-between">
            <span>Sales Tax ({userTaxRate}%):</span>
            <span>${formatWithSeparator(taxAmount)}</span>
          </div>

          <div className="flex justify-between text-base font-semibold mt-1">
            <span>Total:</span>
            <span>${formatWithSeparator(grandTotal)}</span>
          </div>
          <p className="text-right text-xs text-gray-600">
            ({totalInWords})
          </p>
        </div>
      </section>

      {/* ---------- (2) COST BREAKDOWN ---------- */}
      <section className="page-break mb-10 mt-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          2) Cost Breakdown
        </h2>
        <p className="text-sm text-gray-700 mb-4">
          A detailed breakdown of each service’s labor and materials cost.
        </p>

        {sortedCats.map((catName, i) => {
          const catIndex = i + 1;
          const items = groupedByCategory[catName];
          return (
            <div key={catName} className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {catIndex}. {catName}
              </h3>
              {items.map((item, j) => {
                const rowNum = `${catIndex}.${j + 1}`;
                const br = item.breakdown;
                return (
                  <div key={item.activityKey} className="ml-4 mb-4">
                    <h4 className="font-medium text-md text-gray-800">
                      {rowNum}. {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-sm text-gray-500 mt-1">
                        {item.description}
                      </p>
                    )}
                    <div className="flex justify-between items-center text-sm mt-1">
                      <span>{item.quantity} (units)</span>
                      <span className="mr-4">
                        ${formatWithSeparator(item.combinedCost)}
                      </span>
                    </div>

                    {/* cost breakdown table */}
                    <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold">Labor</span>
                        <span>
                          {br.work_cost
                            ? `$${formatWithSeparator(parseFloat(br.work_cost))}`
                            : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold">
                          Materials, tools &amp; equipment
                        </span>
                        <span>
                          {br.material_cost
                            ? `$${formatWithSeparator(parseFloat(br.material_cost))}`
                            : "—"}
                        </span>
                      </div>

                      {Array.isArray(br.materials) && br.materials.length > 0 && (
                        <table className="table-auto w-full text-xs text-left text-gray-700 mt-2">
                          <thead>
                            <tr className="border-b">
                              <th className="py-1 px-1">Name</th>
                              <th className="py-1 px-1">Price</th>
                              <th className="py-1 px-1">Qty</th>
                              <th className="py-1 px-1">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {br.materials.map((m: any, idx2: number) => (
                              <tr key={`${m.external_id}-${idx2}`}>
                                <td className="py-2 px-1">{m.name}</td>
                                <td className="py-2 px-1">
                                  ${formatWithSeparator(parseFloat(m.cost_per_unit))}
                                </td>
                                <td className="py-2 px-3">{m.quantity}</td>
                                <td className="py-2 px-3">
                                  ${formatWithSeparator(parseFloat(m.cost))}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </section>

      {/* ---------- (3) SPECIFICATIONS ---------- */}
      <section className="page-break mb-10 mt-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          3) Specifications
        </h2>
        <p className="text-sm text-gray-700 mb-4">
          This section shows labor by category (including any date
          surcharges/discounts) and an overall list of materials, tools, and equipment used.
        </p>

        {/* A) Labor by Category */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            A) Labor by Category
          </h3>
          <table className="w-full table-auto border border-gray-300 text-sm text-gray-700 mb-3">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 border border-gray-300 text-left">
                  Category
                </th>
                <th className="px-3 py-2 border border-gray-300 text-right">
                  Labor
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(groupedByCategory).map((catName) => {
                // sum labor in this category
                let catLabor = 0;
                groupedByCategory[catName].forEach((itm) => {
                  catLabor += parseFloat(itm.breakdown.work_cost) || 0;
                });
                if (catLabor === 0) return null;

                return (
                  <tr key={catName} className="border-b last:border-0">
                    <td className="px-3 py-2 border border-gray-300">
                      {catName}
                    </td>
                    <td className="px-3 py-2 border border-gray-300 text-right">
                      ${formatWithSeparator(catLabor)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Explanation of total labor */}
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
            B) Overall Materials, Tools &amp; Equipment
          </h3>
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
                  {materialsSpecArray.map((m) => {
                    const unitPrice =
                      m.totalQuantity > 0
                        ? m.totalCost / m.totalQuantity
                        : 0;
                    return (
                      <tr key={m.name} className="border-b last:border-0">
                        <td className="px-3 py-2 border-r border-gray-300">
                          {m.name}
                        </td>
                        <td className="px-3 py-2 border-r border-gray-300 text-center">
                          {m.totalQuantity}
                        </td>
                        <td className="px-3 py-2 border-r border-gray-300 text-center">
                          ${formatWithSeparator(unitPrice)}
                        </td>
                        <td className="px-3 py-2 text-center">
                          ${formatWithSeparator(m.totalCost)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="flex justify-end mt-2 text-sm font-semibold">
                <span className="mr-6">
                  Total Materials, tools and equipment:
                </span>
                <span>${formatWithSeparator(totalMaterialsCost)}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ---------- 4) EMERGENCY STEPS ---------- */}
      <section className="page-break mt-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          4) Emergency Steps
        </h2>
        {filteredSteps.length === 0 ? (
          <p className="text-gray-500">No steps available.</p>
        ) : (
          <div className="space-y-4">
            {filteredSteps.map((svc) => (
              <div
                key={svc.serviceName}
                className="bg-white p-3 rounded border border-gray-300"
              >
                <h3 className="text-lg font-semibold text-gray-800">
                  {svc.serviceName}
                </h3>
                <div className="mt-3 space-y-2">
                  {svc.steps.map((step) => (
                    <div key={step.step_number}>
                      <p className="font-medium">
                        {step.step_number}. {step.title}
                      </p>
                      <p className="text-xs text-gray-500 ml-4 mt-1">
                        {step.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}