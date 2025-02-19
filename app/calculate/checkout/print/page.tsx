"use client";

export const dynamic = "force-dynamic";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ALL_SERVICES } from "@/constants/services";
import { ALL_CATEGORIES } from "@/constants/categories";
import { taxRatesUSA } from "@/constants/taxRatesUSA";
import { DisclaimerBlock } from "@/components/ui/DisclaimerBlock";
import { getSessionItem } from "@/utils/session";

/**
 * Compress a base64-encoded image by drawing it on a canvas and exporting to JPEG.
 * The `quality` can be lowered (0.1 to 0.9) to reduce file size. 
 */
function compressOnePhoto(base64String: string, quality = 0.4): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const offCanvas = document.createElement("canvas");
      offCanvas.width = image.width;
      offCanvas.height = image.height;
      const ctx = offCanvas.getContext("2d");
      if (!ctx) {
        return reject(new Error("Canvas 2D context not available"));
      }
      ctx.drawImage(image, 0, 0);
      // Export to JPEG at the specified quality
      const compressed = offCanvas.toDataURL("image/jpeg", quality);
      resolve(compressed);
    };
    image.onerror = (err) => reject(err);
    image.src = base64String;
  });
}

/**
 * Formats a numeric value into a US-style string with commas and exactly two decimals.
 */
function formatWithSeparator(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Looks up the combined state+local tax rate from taxRatesUSA for a given state code.
 */
function getTaxRateForState(stateCode: string): number {
  if (!stateCode) return 0;
  const row = taxRatesUSA.taxRates.find(
    (r) => r.state.toLowerCase() === stateCode.toLowerCase()
  );
  return row ? row.combinedStateAndLocalTaxRate : 0;
}

/**
 * Converts a numeric dollar amount into spelled-out English text (simplified).
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
    let out = "";
    if (hundreds > 0) {
      out += `${onesMap[hundreds]} hundred`;
      if (remainder > 0) out += " ";
    }
    if (remainder > 0) {
      if (remainder < 100) out += twoDigits(remainder);
    }
    if (!out) return "zero";
    return out;
  }

  let integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - integerPart) * 100);
  if (integerPart === 0) integerPart = 0;

  let spelled = "";
  const units = ["", "thousand", "million", "billion"];
  let idx = 0;
  while (integerPart > 0 && idx < units.length) {
    const chunk = integerPart % 1000;
    integerPart = Math.floor(integerPart / 1000);
    if (chunk > 0) {
      const chunkStr = threeDigits(chunk);
      const label = units[idx] ? ` ${units[idx]}` : "";
      spelled = chunkStr + label + (spelled ? ` ${spelled}` : "");
    }
    idx++;
  }
  if (!spelled) spelled = "zero";

  const decimalString = decimalPart < 10 ? `0${decimalPart}` : String(decimalPart);
  return `${spelled} and ${decimalString}/100 dollars`;
}

/**
 * Builds an estimate reference number, e.g., "CA-94103-20250131-1345"
 */
function buildEstimateNumber(stateCode: string, zip: string): string {
  let prefix = "??-00000";
  if (stateCode && zip) {
    prefix = `${stateCode}-${zip}`;
  }
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mins = String(now.getMinutes()).padStart(2, "0");
  return `${prefix}-${yyyy}${mm}${dd}-${hh}${mins}`;
}

/**
 * getCategoryNameById: returns the category's display title or falls back to the catId.
 */
function getCategoryNameById(catId: string): string {
  const found = ALL_CATEGORIES.find((c) => c.id === catId);
  return found ? found.title : catId;
}

export default function PrintServicesEstimate() {
  const router = useRouter();

  // Grab data from session
  const selectedServicesState: Record<string, number> = getSessionItem(
    "selectedServicesWithQuantity",
    {}
  );
  const calculationResultsMap: Record<string, any> = getSessionItem(
    "calculationResultsMap",
    {}
  );
  const address = getSessionItem("address", "");
  // store photos in local state to compress them
  const [photos, setPhotos] = useState<string[]>(() => getSessionItem("photos", []));
  const description = getSessionItem("description", "");
  const selectedTime = getSessionItem<string | null>("selectedTime", null);
  const timeCoefficient = getSessionItem<number>("timeCoefficient", 1);
  const serviceFeeOnLabor = getSessionItem("serviceFeeOnLabor", 0);
  const serviceFeeOnMaterials = getSessionItem("serviceFeeOnMaterials", 0);
  const userStateCode = getSessionItem("location_state", "");
  const userZip = getSessionItem("location_zip", "00000");
  const selectedCategories: string[] = getSessionItem("services_selectedCategories", []);
  const searchQuery: string = getSessionItem("services_searchQuery", "");

  // If no data => redirect
  useEffect(() => {
    if (Object.keys(selectedServicesState).length === 0 || !address.trim()) {
      router.push("/calculate/estimate");
    }
  }, [selectedServicesState, address, router]);

  /**
   * Compress any base64 photos on mount, storing them in local state
   */
  useEffect(() => {
    if (photos.length > 0) {
      const tasks = photos.map((original) => compressOnePhoto(original, 0.4));
      Promise.all(tasks)
        .then((compressedArr) => {
          setPhotos(compressedArr);
        })
        .catch((err) => {
          console.warn("Photo compression error:", err);
        });
    }
  }, [photos]);

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

  // Build cat -> services map
  const categoryServicesMap: Record<string, (typeof ALL_SERVICES)[number][]> = {};
  selectedCategories.forEach((catId) => {
    let matched = ALL_SERVICES.filter((svc) => svc.id.startsWith(catId + "-"));
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
  const sumBeforeTax =
    finalLabor + materialsSubtotal + serviceFeeOnLabor + serviceFeeOnMaterials;
  const taxRatePercent = getTaxRateForState(userStateCode);
  const taxAmount = sumBeforeTax * (taxRatePercent / 100);
  const finalTotal = sumBeforeTax + taxAmount;
  const finalTotalWords = numberToWordsUSD(finalTotal);
  const estimateNumber = buildEstimateNumber(userStateCode, userZip);

  // On mount => rename document title => print
  useEffect(() => {
    const oldTitle = document.title;
    document.title = `JAMB-Estimate-${estimateNumber}`;
    const timer = setTimeout(() => window.print(), 600);
    return () => {
      document.title = oldTitle;
      clearTimeout(timer);
    };
  }, [estimateNumber]);

  // Materials & labor breakdown
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

    // find which cat => which section
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
  const totalMaterialsCost = materialsSpecArray.reduce(
    (acc, m) => acc + m.totalCost,
    0
  );
  const laborDiff = finalLabor - laborSubtotal;

  // Render
  return (
    <div className="p-4 my-2" style={{ backgroundColor: "#fff" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4" style={{ backgroundColor: "transparent" }}>
        <img src="/images/logo.png" alt="JAMB Logo" className="h-10 w-auto" />
      </div>
      <hr className="border-gray-300 mb-4" style={{ backgroundColor: "#fff" }} />

      <div className="flex justify-between items-center mb-4 mt-12" style={{ backgroundColor: "transparent" }}>
        <div>
          <h1 className="text-2xl font-bold">Estimate for Selected Services</h1>
          <h2 className="text-sm mt-1" style={{ color: "#555" }}>
            {estimateNumber} (temporary)
          </h2>
        </div>
      </div>

      {selectedTime && (
        <p className="mb-2" style={{ color: "#333" }}>
          <strong>Date of Service:</strong> {selectedTime}
        </p>
      )}
      <p className="mb-2" style={{ color: "#333" }}>
        <strong>Address:</strong> {address}
      </p>
      <p className="mb-4" style={{ color: "#333" }}>
        <strong>Details:</strong> {description || "No details provided"}
      </p>

      {/* Photos */}
      {photos.length > 0 && (
        <section className="mb-6">
          <h3 className="font-semibold text-xl mb-2">Uploaded Photos</h3>
          {photos.length === 1 ? (
            <div className="flex w-full justify-center">
              <div className="w-1/2 overflow-hidden border border-gray-300">
                <img
                  src={photos[0]}
                  alt="Uploaded Photo"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ) : photos.length <= 8 ? (
            <div
              className={`grid grid-cols-${photos.length} gap-2 w-full`}
              style={{
                gridTemplateColumns: `repeat(${photos.length}, minmax(0, 1fr))`,
              }}
            >
              {photos.map((photoUrl, idx) => (
                <div
                  key={idx}
                  className="overflow-hidden border border-gray-300"
                >
                  <img
                    src={photoUrl}
                    alt={`Photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2 w-full">
              <div className="grid grid-cols-8 gap-2 w-full">
                {photos.slice(0, 8).map((photoUrl, idx) => (
                  <div
                    key={idx}
                    className="overflow-hidden border border-gray-300"
                  >
                    <img
                      src={photoUrl}
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-8 gap-2 w-full">
                {photos.slice(8).map((photoUrl, idx) => (
                  <div
                    key={idx}
                    className="overflow-hidden border border-gray-300"
                  >
                    <img
                      src={photoUrl}
                      alt={`Photo ${8 + idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Disclaimer */}
      <div className="mb-8">
        <DisclaimerBlock />
      </div>

      {/* 1) SUMMARY */}
      <section className="page-break mt-8">
        <h2 className="text-xl font-semibold mb-4" style={{ color: "#333" }}>
          1) Summary
        </h2>
        <p className="text-sm mb-4" style={{ color: "#666" }}>
          This table provides a simple overview of each selected service,
          quantity, and total cost.
        </p>

        <table className="w-full table-auto border text-sm" style={{ color: "#333", borderColor: "#999" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #999", background: "transparent" }}>
              <th className="px-3 py-2 border-r text-center" style={{ borderColor: "#999", width: "3.5rem" }}>
                #
              </th>
              <th className="px-3 py-2 border-r text-left" style={{ borderColor: "#999" }}>
                Service
              </th>
              <th className="px-3 py-2 border-r text-center" style={{ borderColor: "#999", width: "5rem" }}>
                Qty
              </th>
              <th className="px-3 py-2 text-center" style={{ width: "6rem" }}>
                Total Cost
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(categoriesBySection).map(([sectionName, catIds], i) => {
              const sectionIndex = i + 1;
              const catsWithServices = catIds.filter((catId) => {
                const arr = categoryServicesMap[catId] || [];
                return arr.some((svc) => selectedServicesState[svc.id] != null);
              });
              if (catsWithServices.length === 0) return null;

              return (
                <React.Fragment key={sectionName}>
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-2 font-medium"
                      style={{
                        borderBottom: "1px solid #999",
                        background: "transparent",
                      }}
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
                            className="px-5 py-2"
                            style={{ borderBottom: "1px solid #ccc", background: "transparent" }}
                          >
                            {sectionIndex}.{catIndex}. {catName}
                          </td>
                        </tr>
                        {chosenServices.map((svc, k2) => {
                          const svcIndex = k2 + 1;
                          const qty = selectedServicesState[svc.id] || 1;
                          const cr = calculationResultsMap[svc.id];
                          const finalCost = cr ? parseFloat(cr.total) || 0 : 0;

                          return (
                            <tr key={svc.id} style={{ borderBottom: "1px solid #ccc" }}>
                              <td className="px-3 py-2 border-r text-center" style={{ borderColor: "#ccc" }}>
                                {sectionIndex}.{catIndex}.{svcIndex}
                              </td>
                              <td className="px-3 py-2 border-r" style={{ borderColor: "#ccc" }}>
                                {svc.title}
                              </td>
                              <td className="px-3 py-2 border-r text-center" style={{ borderColor: "#ccc" }}>
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
            })}
          </tbody>
        </table>

        {/* Summary totals */}
        <div className="border-t pt-4 mt-6 text-sm" style={{ borderColor: "#999" }}>
          <div className="flex justify-between mb-1">
            <span>Labor total:</span>
            <span>${formatWithSeparator(laborSubtotal)}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Materials, tools and equipment:</span>
            <span>${formatWithSeparator(materialsSubtotal)}</span>
          </div>

          {timeCoefficient !== 1 && (
            <div className="flex justify-between mb-1">
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

          <div className="flex justify-between mb-1">
            <span>Service Fee (15% on labor)</span>
            <span>${formatWithSeparator(serviceFeeOnLabor)}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Delivery &amp; Processing (5% on materials)</span>
            <span>${formatWithSeparator(serviceFeeOnMaterials)}</span>
          </div>

          <div className="flex justify-between font-semibold mb-1">
            <span>Subtotal:</span>
            <span>${formatWithSeparator(sumBeforeTax)}</span>
          </div>
          <div className="flex justify-between mb-1">
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
          <p className="text-right text-sm" style={{ color: "#666" }}>
            ({finalTotalWords})
          </p>
        </div>
      </section>

      {/* 2) COST BREAKDOWN */}
      <section className="page-break mt-10">
        <h2 className="text-xl font-semibold mb-4" style={{ color: "#333" }}>
          2) Cost Breakdown
        </h2>
        <p className="text-sm mb-4" style={{ color: "#666" }}>
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
              <h3 className="text-lg font-bold mb-2" style={{ color: "#333" }}>
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
                    <h4 className="text-base font-semibold mb-2" style={{ color: "#444" }}>
                      {sectionIndex}.{catIndex}. {catName}
                    </h4>
                    {chosenServices.map((svc, k2) => {
                      const svcIndex = k2 + 1;
                      const quantity = selectedServicesState[svc.id] || 1;
                      const cr = calculationResultsMap[svc.id];
                      const finalCost = cr ? parseFloat(cr.total) || 0 : 0;

                      return (
                        <div key={svc.id} className="mb-4 avoid-break">
                          <h5
                            className="text-sm font-semibold flex justify-between"
                            style={{ color: "#444" }}
                          >
                            <span>
                              {sectionIndex}.{catIndex}.{svcIndex}. {svc.title}
                            </span>
                          </h5>
                          {svc.description && (
                            <p className="text-sm my-1" style={{ color: "#777" }}>
                              {svc.description}
                            </p>
                          )}
                          <p className="text-sm flex justify-between" style={{ color: "#444" }}>
                            <span className="font-semibold">
                              {quantity} {svc.unit_of_measurement}
                            </span>
                            <span className="font-semibold mr-4">
                              ${formatWithSeparator(finalCost)}
                            </span>
                          </p>

                          {/* cost breakdown */}
                          {cr && (
                            <div
                              className="mt-2 p-3 border border-gray-300 rounded text-sm"
                              style={{ color: "#444", backgroundColor: "transparent" }}
                            >
                              <div className="flex justify-between mb-1">
                                <span className="font-semibold">Labor</span>
                                <span className="font-semibold">
                                  {cr.work_cost
                                    ? `$${formatWithSeparator(parseFloat(cr.work_cost))}`
                                    : "—"}
                                </span>
                              </div>
                              <div className="flex justify-between mb-3">
                                <span className="font-semibold">
                                  Materials, tools and equipment
                                </span>
                                <span className="font-semibold">
                                  {cr.material_cost
                                    ? `$${formatWithSeparator(parseFloat(cr.material_cost))}`
                                    : "—"}
                                </span>
                              </div>

                              {Array.isArray(cr.materials) && cr.materials.length > 0 && (
                                <div className="mt-2">
                                  <table className="table-auto w-full text-left" style={{ color: "#444" }}>
                                    <thead>
                                      <tr style={{ borderBottom: "1px solid #ccc" }}>
                                        <th className="py-1 px-1">Name</th>
                                        <th className="py-1 px-1">Price</th>
                                        <th className="py-1 px-1">Qty</th>
                                        <th className="py-1 px-1">Subtotal</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {cr.materials.map((m: any, idx2: number) => (
                                        <tr
                                          key={`${m.external_id}-${idx2}`}
                                          style={{ borderBottom: "1px solid #eee" }}
                                        >
                                          <td className="py-2 px-1">{m.name}</td>
                                          <td className="py-2 px-1">
                                            ${formatWithSeparator(parseFloat(m.cost_per_unit))}
                                          </td>
                                          <td className="py-2 px-1">{m.quantity}</td>
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
      </section>

      {/* 3) SPECIFICATIONS */}
      <section className="page-break mt-10">
        <h2 className="text-xl font-semibold mb-4" style={{ color: "#333" }}>
          3) Specifications
        </h2>
        <p className="text-sm mb-4" style={{ color: "#666" }}>
          This section shows labor by section (including date surcharges/discounts) 
          and an overall list of materials.
        </p>

        {/* A) Labor by Section */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-2" style={{ color: "#333" }}>
            A) Labor by Section
          </h3>
          <table
            className="w-full table-auto border text-sm mb-3"
            style={{ color: "#333", borderColor: "#999" }}
          >
            <thead style={{ background: "transparent" }}>
              <tr>
                <th className="px-3 py-2 border" style={{ borderColor: "#999", textAlign: "left" }}>
                  Section
                </th>
                <th className="px-3 py-2 border" style={{ borderColor: "#999", textAlign: "right" }}>
                  Labor
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(categoriesBySection).map((sectionName) => {
                let laborSum = 0;
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
                  <tr key={sectionName} style={{ borderBottom: "1px solid #ccc" }}>
                    <td className="px-3 py-2 border" style={{ borderColor: "#ccc" }}>
                      {sectionName}
                    </td>
                    <td
                      className="px-3 py-2 border text-right"
                      style={{ borderColor: "#ccc" }}
                    >
                      ${formatWithSeparator(laborSum)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {/* Explanation */}
          <div className="text-sm" style={{ color: "#444" }}>
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
          <h3 className="text-lg font-bold mb-2" style={{ color: "#333" }}>
            B) Overall Materials, tools and equipment
          </h3>
          {materialsSpecArray.length === 0 ? (
            <p className="text-sm" style={{ color: "#666" }}>
              No materials used in this estimate.
            </p>
          ) : (
            <div>
              <table
                className="w-full table-auto border text-sm"
                style={{ color: "#333", borderColor: "#999" }}
              >
                <thead style={{ background: "transparent" }}>
                  <tr>
                    <th className="px-3 py-2 border" style={{ borderColor: "#999", textAlign: "left" }}>
                      Material Name
                    </th>
                    <th className="px-3 py-2 border" style={{ borderColor: "#999", textAlign: "center" }}>
                      Qty
                    </th>
                    <th className="px-3 py-2 border" style={{ borderColor: "#999", textAlign: "center" }}>
                      Price
                    </th>
                    <th className="px-3 py-2 border" style={{ textAlign: "center" }}>
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {materialsSpecArray.map((mat) => {
                    const unitPrice = mat.totalQuantity
                      ? mat.totalCost / mat.totalQuantity
                      : 0;
                    return (
                      <tr key={mat.name} style={{ borderBottom: "1px solid #ccc" }}>
                        <td className="px-3 py-2 border-r" style={{ borderColor: "#ccc" }}>
                          {mat.name}
                        </td>
                        <td
                          className="px-3 py-2 border-r text-center"
                          style={{ borderColor: "#ccc" }}
                        >
                          {mat.totalQuantity}
                        </td>
                        <td
                          className="px-3 py-2 border-r text-center"
                          style={{ borderColor: "#ccc" }}
                        >
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
              <div className="flex justify-end mt-2 text-sm font-semibold" style={{ color: "#444" }}>
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