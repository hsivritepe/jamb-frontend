"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PACKAGES } from "@/constants/packages";
import { ALL_SERVICES } from "@/constants/services";
import { ALL_CATEGORIES } from "@/constants/categories";
import { DisclaimerBlock } from "@/components/ui/DisclaimerBlock";

// Unified session utilities
import { getSessionItem } from "@/utils/session";

// An interface describing the shape of selected services for packages
interface PackagesSelectedServices {
  indoor: Record<string, number>;
  outdoor: Record<string, number>;
}

/**
 * Formats a numeric value with commas and exactly two decimals.
 */
function formatWithSeparator(n: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

/**
 * Converts a code like "single_family" into a more user-friendly label.
 */
function formatHouseType(value: string): string {
  switch (value) {
    case "single_family":
      return "Single Family";
    case "townhouse":
      return "Townhouse";
    case "apartment":
      return "Apartment / Condo";
    default:
      return value || "—";
  }
}

/**
 * Builds a reference code from state code + zip + current date/time.
 */
function buildOrderReference(stateCode: string, zip: string): string {
  const st = stateCode ? stateCode.trim().slice(0, 2).toUpperCase() : "??";
  const z = zip || "00000";
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mi = String(now.getMinutes()).padStart(2, "0");
  return `${st}-${z}-${yyyy}${mm}${dd}-${hh}${mi}`;
}

/**
 * Converts a numeric USD amount into spelled-out text in a simplified manner.
 */
function numberToWordsUSD(amount: number): string {
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

  function twoDigitWords(n: number): string {
    if (n <= 20) return wordsMap[n] || "";
    const tens = Math.floor(n / 10) * 10;
    const ones = n % 10;
    if (ones === 0) return wordsMap[tens];
    return `${wordsMap[tens]}-${wordsMap[ones]}`;
  }

  function threeDigitWords(n: number): string {
    const hundreds = Math.floor(n / 100);
    const remainder = n % 100;
    let result = "";
    if (hundreds > 0) {
      result += `${wordsMap[hundreds]} hundred`;
      if (remainder > 0) result += " ";
    }
    if (remainder > 0) {
      result += twoDigitWords(remainder);
    }
    return result || "zero";
  }

  let integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - integerPart) * 100);
  if (integerPart === 0) integerPart = 0;

  const thousandsLabels = ["", " thousand", " million", " billion"];
  let i = 0;
  let words = "";
  while (integerPart > 0 && i < thousandsLabels.length) {
    const chunk = integerPart % 1000;
    if (chunk > 0) {
      const chunkStr = threeDigitWords(chunk).trim();
      words = `${chunkStr}${thousandsLabels[i]}${
        words ? " " + words : ""
      }`.trim();
    }
    integerPart = Math.floor(integerPart / 1000);
    i++;
  }
  if (!words) words = "zero";

  const decStr = decimalPart < 10 ? `0${decimalPart}` : `${decimalPart}`;
  return `${words} and ${decStr}/100 dollars`;
}

/**
 * Returns the calculation result for a specific service ID, if any.
 */
function getCalcResultFor(
  svcId: string,
  calcMap: Record<string, any>
): Record<string, any> | null {
  return calcMap[svcId] || null;
}

export default function PackagesPrintPage() {
  const router = useRouter();

  // Which package was chosen
  const storedPackageId = getSessionItem<string | null>("packages_currentPackageId", null);
  const chosenPackage = PACKAGES.find((p) => p.id === storedPackageId) || null;

  // Summaries from the Estimate page
  const laborSubtotal = getSessionItem<number>("packages_laborSubtotal", 0);
  const materialsSubtotal = getSessionItem<number>("packages_materialsSubtotal", 0);
  const serviceFeeOnLabor = getSessionItem<number>("serviceFeeOnLabor", 0);
  const serviceFeeOnMaterials = getSessionItem<number>("serviceFeeOnMaterials", 0);
  const sumBeforeTax = getSessionItem<number>("packages_sumBeforeTax", 0);
  const taxRatePercent = getSessionItem<number>("packages_taxRatePercent", 0);
  const taxAmount = getSessionItem<number>("packages_taxAmount", 0);
  const finalTotal = getSessionItem<number>("packages_estimateFinalTotal", 0);

  // Payment plan
  const selectedPaymentOption = getSessionItem<string | null>("packages_selectedTime", null);
  const paymentCoefficient = getSessionItem<number>("packages_timeCoefficient", 1);

  // House info
  const houseInfo = getSessionItem("packages_houseInfo", {
    addressLine: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    houseType: "",
    floors: 1,
    squareFootage: 0,
    bedrooms: 1,
    bathrooms: 1,
    hasGarage: false,
    garageCount: 0,
    hasYard: false,
    yardArea: 0,
    hasPool: false,
    poolArea: 0,
    hasBoiler: false,
    boilerType: "",
    applianceCount: 1,
    airConditioners: 0,
  });

  // The user-chosen services
  const selectedServicesData = getSessionItem<PackagesSelectedServices>(
    "packages_selectedServices",
    { indoor: {}, outdoor: {} }
  );
  const calculationResultsMap: Record<string, any> = getSessionItem(
    "packages_calculationResultsMap",
    {}
  );

  // If no data => redirect
  useEffect(() => {
    const anyIndoor = Object.keys(selectedServicesData.indoor).length > 0;
    const anyOutdoor = Object.keys(selectedServicesData.outdoor).length > 0;
    const anyService = anyIndoor || anyOutdoor;
    if (!anyService || !houseInfo.addressLine) {
      if (storedPackageId) {
        router.push(`/packages/estimate?packageId=${storedPackageId}`);
      } else {
        router.push("/packages/estimate");
      }
    }
  }, [selectedServicesData, houseInfo, storedPackageId, router]);

  // Build reference code
  const referenceNumber = buildOrderReference(houseInfo.state, houseInfo.zip);
  // Convert total to words
  const finalTotalWords = numberToWordsUSD(finalTotal);

  // Auto-print after short delay => rename the doc title
  useEffect(() => {
    const oldTitle = document.title;
    const pkgName = chosenPackage ? chosenPackage.title : "Unknown";
    document.title = `JAMB-${pkgName}-${referenceNumber}`;
    const timer = setTimeout(() => {
      window.print();
    }, 600);
    return () => {
      document.title = oldTitle;
      clearTimeout(timer);
    };
  }, [chosenPackage, referenceNumber]);

  /**
   * Page 1 => heading, disclaimers, location, home details
   */
  function renderPage1() {
    return (
      <section>
        {/* Logo + divider */}
        <div className="flex items-center justify-between mt-4 mb-4">
          <img src="/images/logo.png" alt="JAMB Logo" className="h-10 w-auto" />
        </div>
        <hr className="border-gray-300 mb-4" />

        {/* Title / reference */}
        <div>
          <h1 className="text-2xl font-bold">
            Estimate for {chosenPackage ? chosenPackage.title : "Unknown"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {referenceNumber} (temporary)
          </p>
        </div>

        {/* Location */}
        <div className="mt-4 text-sm text-gray-700 space-y-1">
          <p>
            <strong>Address:</strong> {houseInfo.addressLine}
          </p>
          <p>
            <strong>City / Zip:</strong> {houseInfo.city}, {houseInfo.zip}
          </p>
          <p>
            <strong>Country:</strong> {houseInfo.country}
          </p>
        </div>

        {/* Home Details */}
        <div className="mt-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Home Details
          </h2>
          <div className="text-sm text-gray-700 space-y-1">
            <p>
              <strong>House Type:</strong>{" "}
              {formatHouseType(houseInfo.houseType)}
            </p>
            <p>
              <strong>Floors:</strong> {houseInfo.floors}
            </p>
            <p>
              <strong>Square ft:</strong>{" "}
              {houseInfo.squareFootage > 0 ? houseInfo.squareFootage : "?"}
            </p>
            <p>
              <strong>Bedrooms:</strong> {houseInfo.bedrooms}
            </p>
            <p>
              <strong>Bathrooms:</strong> {houseInfo.bathrooms}
            </p>
            <p>
              <strong>Appliances:</strong> {houseInfo.applianceCount}
            </p>
            <p>
              <strong>AC Units:</strong> {houseInfo.airConditioners}
            </p>
            <p>
              <strong>Boiler/Heater:</strong>{" "}
              {houseInfo.hasBoiler ? houseInfo.boilerType || "Yes" : "No / None"}
            </p>
            <p>
              <strong>Garage:</strong>{" "}
              {houseInfo.hasGarage ? houseInfo.garageCount : "No"}
            </p>
            <p>
              <strong>Yard:</strong>{" "}
              {houseInfo.hasYard ? `${houseInfo.yardArea} sq ft` : "No yard/garden"}
            </p>
            <p>
              <strong>Pool:</strong>{" "}
              {houseInfo.hasPool ? `${houseInfo.poolArea} sq ft` : "No pool"}
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-4">
          <DisclaimerBlock />
        </div>
      </section>
    );
  }

  /**
   * Page 2 => (1) Summary with "For Home" / "For Garden"
   */
  function renderPage2Summary() {
    function buildGroupedServices(services: Record<string, number>) {
      const result: Record<string, Record<string, string[]>> = {};
      for (const svcId of Object.keys(services)) {
        const catId = svcId.split("-").slice(0, 2).join("-");
        const catObj = ALL_CATEGORIES.find((c) => c.id === catId);
        const sectionName = catObj ? catObj.section : "Other";

        if (!result[sectionName]) {
          result[sectionName] = {};
        }
        if (!result[sectionName][catId]) {
          result[sectionName][catId] = [];
        }
        result[sectionName][catId].push(svcId);
      }
      return result;
    }

    const indoorMap = buildGroupedServices(selectedServicesData.indoor);
    const outdoorMap = buildGroupedServices(selectedServicesData.outdoor);

    return (
      <section className="page-break mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">1) Summary</h2>
        <p className="text-sm text-gray-700 mb-4">
          Below is a summary of selected services, grouped by home (indoor) and
          garden (outdoor), organized by section and category.
        </p>

        {/* For Home */}
        <h3 className="text-lg font-bold text-gray-800 mb-2">For Home</h3>
        {Object.keys(indoorMap).length === 0 ? (
          <p className="text-sm text-gray-500 ml-4">No indoor services.</p>
        ) : (
          Object.entries(indoorMap).map(([sectionName, catObj], secIdx) => {
            const secNumber = secIdx + 1;
            return (
              <div key={sectionName} className="ml-4 mb-4">
                <h4 className="text-md font-bold text-gray-700 mb-2">
                  {secNumber}. {sectionName}
                </h4>
                {Object.entries(catObj).map(([catId, svcIds], catIdx) => {
                  const catNumber = `${secNumber}.${catIdx + 1}`;
                  const catObj2 = ALL_CATEGORIES.find((c) => c.id === catId);
                  const catName = catObj2 ? catObj2.title : catId;

                  return (
                    <div key={catId} className="ml-6 mb-4">
                      <h5 className="font-medium text-gray-700 mb-2">
                        {catNumber}. {catName}
                      </h5>

                      <table className="w-full table-auto border border-gray-300 text-sm text-gray-700 mb-2">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-2 py-1 border border-gray-300 text-center w-10">
                              #
                            </th>
                            <th className="px-2 py-1 border border-gray-300 text-left">
                              Service
                            </th>
                            <th className="px-2 py-1 border border-gray-300 text-center w-20">
                              Qty
                            </th>
                            <th className="px-2 py-1 border border-gray-300 text-center w-24">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {svcIds.map((svcId, svcIdx) => {
                            const svcNumber = `${catNumber}.${svcIdx + 1}`;
                            const foundSvc = ALL_SERVICES.find((s) => s.id === svcId);
                            const svcTitle = foundSvc ? foundSvc.title : svcId;
                            const qty = selectedServicesData.indoor[svcId] || 1;
                            const cr = getCalcResultFor(svcId, calculationResultsMap);

                            let totalCost = 0;
                            if (cr && (cr.work_cost || cr.material_cost)) {
                              const lab = parseFloat(cr.work_cost) || 0;
                              const mat = parseFloat(cr.material_cost) || 0;
                              totalCost = lab + mat;
                            }

                            return (
                              <tr key={svcId} className="border last:border-0">
                                <td className="px-2 py-1 border border-gray-300 text-center font-medium">
                                  {svcNumber}
                                </td>
                                <td className="px-2 py-1 border border-gray-300">
                                  {svcTitle}
                                </td>
                                <td className="px-2 py-1 border border-gray-300 text-center">
                                  {qty}
                                </td>
                                <td className="px-2 py-1 border border-gray-300 text-center">
                                  ${formatWithSeparator(totalCost)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            );
          })
        )}

        {/* For Garden */}
        <h3 className="text-lg font-bold text-gray-800 mt-6 mb-2">For Garden</h3>
        {Object.keys(outdoorMap).length === 0 ? (
          <p className="text-sm text-gray-500 ml-4">No outdoor services.</p>
        ) : (
          Object.entries(outdoorMap).map(([sectionName, catObj], secIdx) => {
            const secNumber = secIdx + 1;
            return (
              <div key={sectionName} className="ml-4 mb-4">
                <h4 className="text-md font-bold text-gray-700 mb-2">
                  {secNumber}. {sectionName}
                </h4>
                {Object.entries(catObj).map(([catId, svcIds], catIdx) => {
                  const catNumber = `${secNumber}.${catIdx + 1}`;
                  const catObj2 = ALL_CATEGORIES.find((c) => c.id === catId);
                  const catName = catObj2 ? catObj2.title : catId;

                  return (
                    <div key={catId} className="ml-6 mb-4">
                      <h5 className="font-medium text-gray-700 mb-2">
                        {catNumber}. {catName}
                      </h5>

                      <table className="w-full table-auto border border-gray-300 text-sm text-gray-700 mb-2">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-2 py-1 border border-gray-300 text-center w-10">
                              #
                            </th>
                            <th className="px-2 py-1 border border-gray-300 text-left">
                              Service
                            </th>
                            <th className="px-2 py-1 border border-gray-300 text-center w-20">
                              Qty
                            </th>
                            <th className="px-2 py-1 border border-gray-300 text-center w-24">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {svcIds.map((svcId, svcIdx) => {
                            const svcNumber = `${catNumber}.${svcIdx + 1}`;
                            const foundSvc = ALL_SERVICES.find((s) => s.id === svcId);
                            const svcTitle = foundSvc ? foundSvc.title : svcId;
                            const qty = selectedServicesData.outdoor[svcId] || 1;
                            const cr = getCalcResultFor(svcId, calculationResultsMap);

                            let totalCost = 0;
                            if (cr && (cr.work_cost || cr.material_cost)) {
                              const lab = parseFloat(cr.work_cost) || 0;
                              const mat = parseFloat(cr.material_cost) || 0;
                              totalCost = lab + mat;
                            }

                            return (
                              <tr key={svcId} className="border last:border-0">
                                <td className="px-2 py-1 border border-gray-300 text-center font-medium">
                                  {svcNumber}
                                </td>
                                <td className="px-2 py-1 border border-gray-300">
                                  {svcTitle}
                                </td>
                                <td className="px-2 py-1 border border-gray-300 text-center">
                                  {qty}
                                </td>
                                <td className="px-2 py-1 border border-gray-300 text-center">
                                  ${formatWithSeparator(totalCost)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            );
          })
        )}

        {/* Final sums */}
        <div className="mt-6 space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Labor total:</span>
            <span>${formatWithSeparator(laborSubtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Materials total:</span>
            <span>${formatWithSeparator(materialsSubtotal)}</span>
          </div>

          {paymentCoefficient !== 1 && (
            <div className="flex justify-between">
              <span>
                {paymentCoefficient > 1 ? "Surcharge" : "Discount"} (time)
              </span>
              <span>
                {paymentCoefficient > 1 ? "+" : "-"}$
                {formatWithSeparator(
                  Math.abs(laborSubtotal * paymentCoefficient - laborSubtotal)
                )}
              </span>
            </div>
          )}

          <div className="flex justify-between">
            <span>Service Fee (15% on labor):</span>
            <span>${formatWithSeparator(serviceFeeOnLabor)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery &amp; Processing (5% on materials):</span>
            <span>${formatWithSeparator(serviceFeeOnMaterials)}</span>
          </div>

          <div className="flex justify-between font-medium mt-2">
            <span>Subtotal:</span>
            <span>${formatWithSeparator(sumBeforeTax)}</span>
          </div>
          <div className="flex justify-between">
            <span>
              Sales tax
              {houseInfo.state ? ` (${houseInfo.state})` : ""}
              {taxRatePercent > 0 ? ` (${taxRatePercent.toFixed(2)}%)` : ""}
            </span>
            <span>${formatWithSeparator(taxAmount)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold mt-2">
            <span>Total:</span>
            <span>${formatWithSeparator(finalTotal)}</span>
          </div>
          <span className="block text-right text-xs md:text-sm text-gray-500 font-normal">
            ({finalTotalWords})
          </span>
        </div>
      </section>
    );
  }

  /**
   * Page 3 => (2) Cost Breakdown
   */
  function renderPage3CostBreakdown() {
    const blockConfigs: { blockId: "indoor" | "outdoor"; title: string }[] = [
      { blockId: "indoor", title: "Indoor" },
      { blockId: "outdoor", title: "Outdoor" },
    ];

    return (
      <section className="page-break mt-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">2) Cost Breakdown</h2>
        <p className="text-sm text-gray-700 mb-4">
          A more detailed breakdown of each service&apos;s labor and materials,
          including line items for each material if available.
        </p>

        {blockConfigs.map((blockObj, idxBlock) => {
          const { blockId, title: blockTitle } = blockObj;

          // If user selected no items in that block => skip
          const blockServices = selectedServicesData[blockId];
          const hasAny = Object.keys(blockServices).length > 0;
          if (!hasAny) return null;

          // Build a "breakdown" structure => section -> cat -> array
          const breakdownMap: Record<string, Record<string, string[]>> = {};
          Object.keys(blockServices).forEach((svcId) => {
            const catId = svcId.split("-").slice(0, 2).join("-");
            const catObj = ALL_CATEGORIES.find((c) => c.id === catId);
            const sectionName = catObj ? catObj.section : "Other";

            if (!breakdownMap[sectionName]) breakdownMap[sectionName] = {};
            if (!breakdownMap[sectionName][catId]) {
              breakdownMap[sectionName][catId] = [];
            }
            breakdownMap[sectionName][catId].push(svcId);
          });

          return (
            <div key={blockId} className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-2">{blockTitle}</h3>

              {Object.entries(breakdownMap).map(([secName, catObjMap], secIdx) => {
                const secNumber = `${idxBlock + 1}.${secIdx + 1}`;
                return (
                  <div key={secName} className="ml-4 mb-4">
                    <h4 className="text-md font-bold text-gray-700 mb-2">
                      {secNumber}. {secName}
                    </h4>

                    {Object.entries(catObjMap).map(([catId, svcIds], cIdx) => {
                      const catNumber = `${secNumber}.${cIdx + 1}`;
                      const catNameObj = ALL_CATEGORIES.find((c) => c.id === catId);
                      const catName = catNameObj ? catNameObj.title : catId;

                      return (
                        <div key={catId} className="ml-4 mb-4">
                          <h5 className="text-sm font-semibold text-gray-700 mb-2">
                            {catNumber}. {catName}
                          </h5>

                          {svcIds.map((svcId, sIdx) => {
                            const svcNumber = `${catNumber}.${sIdx + 1}`;
                            const foundSvc = ALL_SERVICES.find((s) => s.id === svcId);
                            const svcTitle = foundSvc ? foundSvc.title : svcId;
                            const svcDesc = foundSvc?.description;

                            const cr = getCalcResultFor(svcId, calculationResultsMap);
                            const laborCost = cr ? parseFloat(cr.work_cost) || 0 : 0;
                            const materialCost = cr ? parseFloat(cr.material_cost) || 0 : 0;

                            return (
                              <div
                                key={svcId}
                                className="ml-4 mb-4 p-3 bg-gray-50 border border-gray-200 rounded"
                              >
                                <h6 className="text-sm font-semibold text-gray-800">
                                  {svcNumber}. {svcTitle}
                                </h6>
                                {svcDesc && (
                                  <p className="text-xs text-gray-500 my-1">
                                    {svcDesc}
                                  </p>
                                )}

                                <div className="mt-2 space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span className="font-medium">Labor:</span>
                                    <span>
                                      {laborCost > 0
                                        ? `$${formatWithSeparator(laborCost)}`
                                        : "—"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-medium">
                                      Materials, tools &amp; equipment:
                                    </span>
                                    <span>
                                      {materialCost > 0
                                        ? `$${formatWithSeparator(materialCost)}`
                                        : "—"}
                                    </span>
                                  </div>
                                </div>

                                {cr && Array.isArray(cr.materials) && cr.materials.length > 0 && (
                                  <div className="mt-3 text-sm">
                                    <table className="table-auto w-full text-left text-gray-700 text-xs md:text-sm">
                                      <thead>
                                        <tr className="border-b">
                                          <th className="py-1 px-1">Name</th>
                                          <th className="py-1 px-1">Price</th>
                                          <th className="py-1 px-1">Qty</th>
                                          <th className="py-1 px-1">Subtotal</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-200">
                                        {cr.materials.map((m: any, idx2: number) => (
                                          <tr key={`${m.external_id}-${idx2}`}>
                                            <td className="py-2 px-1">{m.name}</td>
                                            <td className="py-2 px-1">
                                              {m.cost_per_unit
                                                ? `$${formatWithSeparator(
                                                    parseFloat(m.cost_per_unit)
                                                  )}`
                                                : "—"}
                                            </td>
                                            <td className="py-2 px-1">{m.quantity}</td>
                                            <td className="py-2 px-1">
                                              {m.cost
                                                ? `$${formatWithSeparator(parseFloat(m.cost))}`
                                                : "—"}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
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
          );
        })}
      </section>
    );
  }

  /**
   * (4) Specifications => labor by section + overall materials
   */
  function renderPage4Specifications() {
    const mergedSelectedAll: Record<string, number> = {
      ...selectedServicesData.indoor,
      ...selectedServicesData.outdoor,
    };
    const sectionLaborMap: Record<string, number> = {};
    const materialsSpecMap: Record<
      string,
      { name: string; totalQuantity: number; totalCost: number }
    > = {};

    for (const svcId of Object.keys(mergedSelectedAll)) {
      const cr = getCalcResultFor(svcId, calculationResultsMap);
      if (!cr) continue;

      const catId = svcId.split("-").slice(0, 2).join("-");
      const catObj = ALL_CATEGORIES.find((c) => c.id === catId);
      const sectionName = catObj ? catObj.section : "Other";

      const laborVal = parseFloat(cr.work_cost) || 0;
      if (!sectionLaborMap[sectionName]) {
        sectionLaborMap[sectionName] = 0;
      }
      sectionLaborMap[sectionName] += laborVal;

      if (Array.isArray(cr.materials)) {
        cr.materials.forEach((m: any) => {
          const matName = m.name;
          const costVal = parseFloat(m.cost) || 0;
          const qtyVal = m.quantity || 0;

          if (!materialsSpecMap[matName]) {
            materialsSpecMap[matName] = {
              name: matName,
              totalQuantity: 0,
              totalCost: 0,
            };
          }
          materialsSpecMap[matName].totalQuantity += qtyVal;
          materialsSpecMap[matName].totalCost += costVal;
        });
      }
    }

    const materialsArray = Object.values(materialsSpecMap);
    const totalMaterialsCost = materialsArray.reduce(
      (acc, m) => acc + m.totalCost,
      0
    );

    return (
      <section className="page-break mt-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          3) Specifications
        </h2>
        <p className="text-sm text-gray-700 mb-4">
          This section shows labor by section (including any date surcharges or
          discounts) and an overall list of materials, tools, and equipment.
        </p>

        {/* A) Labor by Section */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            A) Labor by Section
          </h3>
          <table className="w-full table-auto border border-gray-300 text-sm text-gray-700">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 border border-gray-300 text-left">Section</th>
                <th className="px-3 py-2 border border-gray-300 text-right">Labor</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(sectionLaborMap).map(([secName, val]) => {
                if (val === 0) return null;
                return (
                  <tr key={secName} className="border-b last:border-0">
                    <td className="px-3 py-2 border border-gray-300">
                      {secName}
                    </td>
                    <td className="px-3 py-2 border border-gray-300 text-right">
                      ${formatWithSeparator(val)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="text-right text-sm mt-2">
            <div>
              <p>
                <span>Labor Sum:</span>{" "}
                <span>${formatWithSeparator(laborSubtotal)}</span>
              </p>
              {paymentCoefficient !== 1 && (
                <p>
                  <span>
                    {paymentCoefficient > 1
                      ? "Surcharge (payment option)"
                      : "Discount (payment option)"}:{" "}
                  </span>
                  <span>
                    {paymentCoefficient > 1 ? "+" : "-"}$
                    {formatWithSeparator(
                      Math.abs(laborSubtotal * paymentCoefficient - laborSubtotal)
                    )}
                  </span>
                </p>
              )}
              <p className="text-right font-semibold mt-1">
                <span className="mr-4">Total Labor:</span>
                <span>
                  $
                  {formatWithSeparator(
                    laborSubtotal * (paymentCoefficient !== 1 ? paymentCoefficient : 1)
                  )}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* B) Overall Materials */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            B) Overall Materials, Tools &amp; Equipment
          </h3>
          {materialsArray.length === 0 ? (
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
                    <th className="px-3 py-2 border border-gray-300 text-center">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {materialsArray.map((mObj) => {
                    const unitPrice =
                      mObj.totalQuantity > 0
                        ? mObj.totalCost / mObj.totalQuantity
                        : 0;
                    return (
                      <tr key={mObj.name} className="border last:border-0">
                        <td className="px-3 py-2 border border-gray-300">
                          {mObj.name}
                        </td>
                        <td className="px-3 py-2 border border-gray-300 text-center">
                          {mObj.totalQuantity}
                        </td>
                        <td className="px-3 py-2 border border-gray-300 text-center">
                          ${formatWithSeparator(unitPrice)}
                        </td>
                        <td className="px-3 py-2 border border-gray-300 text-center">
                          ${formatWithSeparator(mObj.totalCost)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="flex justify-end mt-2 text-sm font-semibold">
                <span className="mr-6">Total materials, tools &amp; equipment:</span>
                <span>${formatWithSeparator(totalMaterialsCost)}</span>
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <div className="print-page p-4 my-2">
      {/* Page 1 => heading, disclaimers, home details */}
      {renderPage1()}

      {/* Page 2 => (1) Summary with "For Home" / "For Garden" */}
      {renderPage2Summary()}

      {/* Page 3 => (2) Cost Breakdown */}
      {renderPage3CostBreakdown()}

      {/* Page 4 => (3) Specifications */}
      {renderPage4Specifications()}
    </div>
  );
}