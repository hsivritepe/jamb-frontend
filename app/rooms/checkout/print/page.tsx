"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ROOMS } from "@/constants/rooms";
import { ALL_SERVICES } from "@/constants/services";
import { ALL_CATEGORIES } from "@/constants/categories";
import { DisclaimerBlock } from "@/components/ui/DisclaimerBlock";
import { taxRatesUSA } from "@/constants/taxRatesUSA";
import { getSessionItem } from "@/utils/session";

/**
 * Compress a base64-encoded image by drawing it on a canvas and exporting to JPEG.
 * The `quality` can be lowered (e.g., 0.4) to reduce file size.
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
        return reject(new Error("Canvas 2D context is not available"));
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
 * Formats a numeric value with commas and exactly two decimals, e.g. 1234 => "1,234.00".
 */
function formatWithSeparator(num: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Looks up the combined state+local tax rate from taxRatesUSA based on a given state code.
 * If not found, returns 0.
 */
function getTaxRateForState(stateCode: string): number {
  if (!stateCode) return 0;
  const match = taxRatesUSA.taxRates.find(
    (r) => r.state.toLowerCase() === stateCode.toLowerCase()
  );
  return match ? match.combinedStateAndLocalTaxRate : 0;
}

/**
 * Converts a numeric USD amount into spelled-out English text (simplified).
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

  function twoDigitsToWords(n: number): string {
    if (n <= 20) return onesMap[n] || "";
    const tens = Math.floor(n / 10) * 10;
    const ones = n % 10;
    if (ones === 0) return onesMap[tens];
    return `${onesMap[tens]}-${onesMap[ones]}`;
  }

  function threeDigitsToWords(numVal: number): string {
    const hundreds = Math.floor(numVal / 100);
    const remainder = numVal % 100;
    let result = "";
    if (hundreds > 0) {
      result += `${onesMap[hundreds]} hundred`;
      if (remainder > 0) {
        result += " ";
      }
    }
    if (remainder > 0) {
      result += twoDigitsToWords(remainder);
    }
    return result || "zero";
  }

  let integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - integerPart) * 100);
  if (integerPart === 0) integerPart = 0;

  let wordsString = "";
  const units = ["", "thousand", "million", "billion"];
  let i = 0;
  while (integerPart > 0 && i < units.length) {
    const chunk = integerPart % 1000;
    integerPart = Math.floor(integerPart / 1000);
    if (chunk > 0) {
      const chunkStr = threeDigitsToWords(chunk);
      const label = units[i] ? ` ${units[i]}` : "";
      wordsString = chunkStr + label + (wordsString ? " " + wordsString : "");
    }
    i++;
  }

  if (!wordsString) {
    wordsString = "zero";
  }

  const decimalStr = decimalPart < 10 ? `0${decimalPart}` : String(decimalPart);
  return `${wordsString} and ${decimalStr}/100 dollars`;
}

/**
 * Builds an estimate number in the format "ST-ZIP-YYYYMMDD-HHMM".
 * Example: "CA-90001-20250910-1445".
 */
function buildEstimateNumber(stateName: string, zip: string): string {
  let stateZipBlock = "??-00000";
  if (stateName && zip) {
    // optional logic: use first 2 letters of stateName
    const st = stateName.trim().split(" ")[0].slice(0, 2).toUpperCase();
    stateZipBlock = `${st}-${zip}`;
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
 * Returns a room object from ROOMS.indoor or ROOMS.outdoor by ID, or null if not found.
 */
function getRoomById(roomId: string) {
  const allRooms = [...ROOMS.indoor, ...ROOMS.outdoor];
  return allRooms.find((r) => r.id === roomId) || null;
}

/**
 * Extracts the category portion from a service ID (e.g. "1-1-2" => "1-1").
 */
function getCategoryIdFromServiceId(serviceId: string): string {
  return serviceId.split("-").slice(0, 2).join("-");
}

/**
 * Returns a category name from ALL_CATEGORIES by ID, or the catId if not found.
 */
function getCategoryNameById(catId: string): string {
  const found = ALL_CATEGORIES.find((c) => c.id === catId);
  return found ? found.title : catId;
}

/**
 * Chooses either the override or the normal calculation results for a given serviceId.
 */
function getCalcResultFor(
  serviceId: string,
  overrideCalc: Record<string, any>,
  calcMap: Record<string, any>
) {
  return overrideCalc[serviceId] || calcMap[serviceId] || null;
}

export default function PrintRoomsEstimate() {
  const router = useRouter();

  // 1) Gather data from session
  const address: string = getSessionItem("address", "");
  const city: string = getSessionItem("city", "");
  const stateName: string = getSessionItem("stateName", "");
  const zip: string = getSessionItem("zip", "");
  const country: string = getSessionItem("country", "");
  // We'll store photos in local state so we can compress them
  const [photos, setPhotos] = useState<string[]>(() => getSessionItem("photos", []));
  const description: string = getSessionItem("description", "");
  const selectedTime: string | null = getSessionItem("selectedTime", null);

  // Subtotals and fees
  const laborSubtotal: number = getSessionItem("rooms_laborSubtotal", 0);
  const materialsSubtotal: number = getSessionItem("rooms_materialsSubtotal", 0);
  const serviceFeeOnLabor: number = getSessionItem("serviceFeeOnLabor", 0);
  const serviceFeeOnMaterials: number = getSessionItem("serviceFeeOnMaterials", 0);

  // Summaries
  const sumBeforeTax: number = getSessionItem("rooms_sumBeforeTax", 0);
  const taxRatePercent: number = getSessionItem("rooms_taxRatePercent", 0);
  const taxAmount: number = getSessionItem("rooms_taxAmount", 0);
  const finalTotal: number = getSessionItem("rooms_estimateFinalTotal", 0);

  // The selected services: (roomId -> { serviceId -> qty })
  const selectedServicesState: Record<string, Record<string, number>> =
    getSessionItem("rooms_selectedServicesWithQuantity", {});

  // The big data: normal + overrides
  const calculationResultsMap: Record<string, any> =
    getSessionItem("calculationResultsMap", {});
  const overrideCalcResults: Record<string, any> =
    getSessionItem("rooms_overrideCalcResults", {});

  // Surcharges/discounts
  const timeCoefficient: number = getSessionItem("timeCoefficient", 1);

  // 2) If no services or no address => redirect
  useEffect(() => {
    let hasServices = false;
    for (const roomId in selectedServicesState) {
      if (Object.keys(selectedServicesState[roomId] || {}).length > 0) {
        hasServices = true;
        break;
      }
    }
    if (!hasServices || !address.trim()) {
      router.push("/rooms/details");
    }
  }, [selectedServicesState, address, router]);

  // 3) Compress any photos on mount to reduce print size
  useEffect(() => {
    if (photos.length > 0) {
      const tasks = photos.map((orig) => compressOnePhoto(orig, 0.4));
      Promise.all(tasks)
        .then((compressedArray) => {
          setPhotos(compressedArray);
        })
        .catch((err) => {
          console.warn("Photo compression error:", err);
        });
    }
  }, [photos]);

  // 4) Build the estimate number & spelled-out total
  const estimateNumber = buildEstimateNumber(stateName, zip);
  const finalTotalWords = numberToWordsUSD(finalTotal);

  // 5) Auto-print after a short delay
  useEffect(() => {
    const oldTitle = document.title;
    document.title = `JAMB-Estimate-${estimateNumber}`;
    const timer = setTimeout(() => {
      window.print();
    }, 600);
    return () => {
      document.title = oldTitle;
      clearTimeout(timer);
    };
  }, [estimateNumber]);

  // Construct a single-line address
  let constructedAddress = address.trim();
  if (stateName) constructedAddress += `, ${stateName}`;
  if (zip) constructedAddress += ` ${zip}`;
  if (country) constructedAddress += `, ${country}`;

  return (
    <div className="p-4 my-2" style={{ backgroundColor: "#fff" }}>
      {/* Minimal header */}
      <div className="flex items-center justify-between mt-4 mb-2" style={{ backgroundColor: "transparent" }}>
        <img src="/images/logo.png" alt="JAMB Logo" className="h-10 w-auto" />
      </div>
      <hr className="border-gray-300 my-4" style={{ backgroundColor: "#fff" }} />

      {/* Basic Info */}
      <div className="flex justify-between items-center mb-4 mt-4" style={{ backgroundColor: "transparent" }}>
        <div>
          <h1 className="text-2xl font-bold">Estimate for Selected Rooms</h1>
          <p className="text-sm mt-1" style={{ color: "#555" }}>
            {estimateNumber} (temporary)
          </p>
        </div>
      </div>

      {selectedTime && (
        <p className="mb-2" style={{ color: "#333" }}>
          <strong>Work Start Date:</strong> {selectedTime}
        </p>
      )}
      <p className="mb-2" style={{ color: "#333" }}>
        <strong>Location:</strong> {constructedAddress || "No address provided"}
      </p>
      <p className="mb-4" style={{ color: "#333" }}>
        <strong>Details:</strong> {description || "No details provided"}
      </p>

      {/* Photos */}
      {photos.length > 0 && (
        <section className="mb-6" style={{ backgroundColor: "transparent" }}>
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

      <DisclaimerBlock />

      {/* (1) SUMMARY */}
      <section className="page-break mt-8" style={{ backgroundColor: "transparent" }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: "#333" }}>
          1) Summary
        </h2>
        <p className="text-sm mb-4" style={{ color: "#666" }}>
          This table provides a simple overview of each selected service, quantity, and total cost.
        </p>

        <table className="w-full table-auto border text-sm" style={{ color: "#333", borderColor: "#999" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #999", background: "transparent" }}>
              <th className="px-3 py-2 border-r" style={{ width: "4rem", borderColor: "#999", textAlign: "center" }}>
                #
              </th>
              <th className="px-3 py-2 border-r" style={{ borderColor: "#999", textAlign: "left" }}>
                Service
              </th>
              <th className="px-3 py-2 border-r" style={{ borderColor: "#999", textAlign: "center", width: "5rem" }}>
                Qty
              </th>
              <th className="px-3 py-2" style={{ textAlign: "center", width: "6rem" }}>
                Total Cost
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(selectedServicesState).map((roomId) => {
              const roomObj = getRoomById(roomId);
              const roomTitle = roomObj ? roomObj.title : roomId;
              const servicesInThisRoom = selectedServicesState[roomId];

              // Build a structure: section -> cat -> [svcIds]
              const sectionMap: Record<string, Record<string, string[]>> = {};
              let roomTotal = 0;

              // Fill sectionMap
              for (const svcId of Object.keys(servicesInThisRoom)) {
                const catId = getCategoryIdFromServiceId(svcId);
                const catObj = ALL_CATEGORIES.find((c) => c.id === catId);
                const sectionName = catObj ? catObj.section : "Other";
                if (!sectionMap[sectionName]) {
                  sectionMap[sectionName] = {};
                }
                if (!sectionMap[sectionName][catId]) {
                  sectionMap[sectionName][catId] = [];
                }
                sectionMap[sectionName][catId].push(svcId);
              }

              return (
                <React.Fragment key={roomId}>
                  {/* Room heading */}
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-2 font-semibold"
                      style={{
                        background: "transparent",
                        borderBottom: "1px solid #999",
                        fontSize: "1.2rem",
                      }}
                    >
                      {roomTitle}
                    </td>
                  </tr>

                  {/* For each section + categories */}
                  {Object.entries(sectionMap).map(([secName, catObjMap], sIdx) => {
                    const sectionNumber = sIdx + 1;
                    return (
                      <React.Fragment key={secName}>
                        <tr>
                          <td
                            colSpan={4}
                            className="px-5 py-2"
                            style={{
                              borderBottom: "1px solid #ccc",
                              background: "transparent",
                              fontWeight: "500",
                              fontSize: "1rem",
                            }}
                          >
                            {sectionNumber}. {secName}
                          </td>
                        </tr>

                        {Object.entries(catObjMap).map(([catId, svcIds], cIdx) => {
                          const catNumber = `${sectionNumber}.${cIdx + 1}`;
                          const catFound = ALL_CATEGORIES.find((c) => c.id === catId);
                          const catTitle = catFound ? catFound.title : catId;

                          return (
                            <React.Fragment key={catId}>
                              <tr>
                                <td
                                  colSpan={4}
                                  className="px-8 py-2"
                                  style={{
                                    borderBottom: "1px solid #ccc",
                                    background: "transparent",
                                    fontWeight: "500",
                                  }}
                                >
                                  {catNumber}. {catTitle}
                                </td>
                              </tr>
                              {svcIds.map((svcId, si) => {
                                const svcIndex = si + 1;
                                const foundSvc = ALL_SERVICES.find((s) => s.id === svcId);
                                const svcTitle = foundSvc ? foundSvc.title : svcId;
                                const qty = servicesInThisRoom[svcId] || 1;
                                const cr = getCalcResultFor(svcId, overrideCalcResults, calculationResultsMap);
                                let finalCost = 0;
                                if (cr && cr.total) {
                                  finalCost = parseFloat(cr.total) || 0;
                                }
                                roomTotal += finalCost;

                                return (
                                  <tr key={svcId} style={{ borderBottom: "1px solid #ccc" }}>
                                    <td
                                      className="px-3 py-2 border-r text-center"
                                      style={{ borderColor: "#ccc", fontWeight: 500 }}
                                    >
                                      {catNumber}.{svcIndex}
                                    </td>
                                    <td
                                      className="px-3 py-2 border-r"
                                      style={{ borderColor: "#ccc", fontWeight: 500 }}
                                    >
                                      {svcTitle}
                                    </td>
                                    <td
                                      className="px-3 py-2 border-r text-center"
                                      style={{ borderColor: "#ccc", fontWeight: 500 }}
                                    >
                                      {qty} {foundSvc?.unit_of_measurement || "units"}
                                    </td>
                                    <td
                                      className="px-3 py-2 text-center"
                                      style={{ fontWeight: 500 }}
                                    >
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

                  {/* Room total row */}
                  <tr style={{ borderTop: "1px solid #999", background: "transparent", fontWeight: 600 }}>
                    <td colSpan={3} className="px-3 py-2 text-right">
                      {roomTitle} total:
                    </td>
                    <td className="px-3 py-2 text-center">
                      ${formatWithSeparator(roomTotal)}
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {/* Summary totals */}
        <div className="border-t pt-4 mt-6 text-sm" style={{ borderColor: "#999" }}>
          <div className="flex justify-end mb-1">
            <span className="mr-6">Labor total:</span>
            <span>${formatWithSeparator(laborSubtotal)}</span>
          </div>
          <div className="flex justify-end mb-1">
            <span className="mr-6">Materials, tools and equipment:</span>
            <span>${formatWithSeparator(materialsSubtotal)}</span>
          </div>

          {timeCoefficient !== 1 && (
            <div className="flex justify-end mb-1">
              <span className="mr-6">
                {timeCoefficient > 1 ? "Surcharge (date selection)" : "Discount (date selection)"}
              </span>
              <span>
                {timeCoefficient > 1 ? "+" : "-"}$
                {formatWithSeparator(Math.abs(laborSubtotal * timeCoefficient - laborSubtotal))}
              </span>
            </div>
          )}

          <div className="flex justify-end mb-1">
            <span className="mr-6">Service Fee (15% on labor):</span>
            <span>${formatWithSeparator(serviceFeeOnLabor)}</span>
          </div>
          <div className="flex justify-end mb-1">
            <span className="mr-6">Delivery &amp; Processing (5% on materials):</span>
            <span>${formatWithSeparator(serviceFeeOnMaterials)}</span>
          </div>
          <div className="flex justify-end font-semibold mb-1">
            <span className="mr-6">Subtotal:</span>
            <span>${formatWithSeparator(sumBeforeTax)}</span>
          </div>
          <div className="flex justify-end mb-1">
            <span className="mr-6">
              Sales tax {taxRatePercent > 0 ? `(${taxRatePercent.toFixed(2)}%)` : ""}:
            </span>
            <span>${formatWithSeparator(taxAmount)}</span>
          </div>
          <div className="flex justify-end text-base font-semibold mt-2">
            <span className="mr-6">Total:</span>
            <span>${formatWithSeparator(finalTotal)}</span>
          </div>
          <p className="text-right text-sm" style={{ color: "#666" }}>
            ({finalTotalWords})
          </p>
        </div>
      </section>

      {/* (2) COST BREAKDOWN */}
      <section className="page-break mt-10" style={{ backgroundColor: "transparent" }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: "#333" }}>
          2) Cost Breakdown
        </h2>
        <p className="text-sm mb-4" style={{ color: "#666" }}>
          This section shows a more detailed breakdown of each service’s labor and materials,
          including line items for each material if available.
        </p>

        {Object.keys(selectedServicesState).map((roomId, rIndex) => {
          const roomObj = getRoomById(roomId);
          const roomTitle = roomObj ? roomObj.title : roomId;
          const roomServices = selectedServicesState[roomId];

          // Build a structure for cost breakdown
          const breakdownMap: Record<string, Record<string, string[]>> = {};
          for (const svcId of Object.keys(roomServices)) {
            const catId = getCategoryIdFromServiceId(svcId);
            const catObj = ALL_CATEGORIES.find((c) => c.id === catId);
            const sectionName = catObj ? catObj.section : "Other";
            if (!breakdownMap[sectionName]) {
              breakdownMap[sectionName] = {};
            }
            if (!breakdownMap[sectionName][catId]) {
              breakdownMap[sectionName][catId] = [];
            }
            breakdownMap[sectionName][catId].push(svcId);
          }

          return (
            <div key={roomId} className="mb-8" style={{ backgroundColor: "transparent" }}>
              <h3 className="text-lg font-bold mb-2" style={{ color: "#333" }}>
                {roomTitle}
              </h3>

              {Object.entries(breakdownMap).map(([secName, catObjMap], secIdx) => {
                const secNumber = `${rIndex + 1}.${secIdx + 1}`;
                return (
                  <div key={secName} className="ml-4 mb-4">
                    <h4 className="text-md font-bold mb-2" style={{ color: "#444" }}>
                      {secNumber}. {secName}
                    </h4>

                    {Object.entries(catObjMap).map(([catId, svcIds], cIdx) => {
                      const catNumber = `${secNumber}.${cIdx + 1}`;
                      const catName = getCategoryNameById(catId);

                      return (
                        <div key={catId} className="ml-4 mb-4">
                          <h5 className="text-sm font-semibold mb-2" style={{ color: "#444" }}>
                            {catNumber}. {catName}
                          </h5>

                          {svcIds.map((svcId, sIdx) => {
                            const svcNumber = `${catNumber}.${sIdx + 1}`;
                            const foundSvc = ALL_SERVICES.find((s) => s.id === svcId);
                            const svcTitle = foundSvc ? foundSvc.title : svcId;

                            const cr = getCalcResultFor(svcId, overrideCalcResults, calculationResultsMap);
                            const laborCost = cr ? parseFloat(cr.work_cost) || 0 : 0;
                            const materialCost = cr ? parseFloat(cr.material_cost) || 0 : 0;
                            const totalCost = cr ? parseFloat(cr.total) || 0 : 0;

                            return (
                              <div
                                key={svcId}
                                className="ml-4 mb-4 p-3 border border-gray-200"
                                style={{
                                  backgroundColor: "transparent",
                                  borderRadius: "4px",
                                }}
                              >
                                <h6 className="text-sm font-semibold" style={{ color: "#444" }}>
                                  {svcNumber}. {svcTitle}
                                </h6>
                                {foundSvc?.description && (
                                  <p className="text-xs my-1" style={{ color: "#777" }}>
                                    {foundSvc.description}
                                  </p>
                                )}

                                <div className="mt-2 space-y-1 text-sm" style={{ color: "#444" }}>
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
                                  <div className="flex justify-between border-t mt-2 pt-2">
                                    <span className="font-semibold">Total:</span>
                                    <span>
                                      {totalCost > 0
                                        ? `$${formatWithSeparator(totalCost)}`
                                        : "$0.00"}
                                    </span>
                                  </div>
                                </div>

                                {/* Materials line items if present */}
                                {cr && Array.isArray(cr.materials) && cr.materials.length > 0 && (
                                  <div className="mt-3 text-sm" style={{ color: "#444" }}>
                                    <p className="font-semibold mb-1">Materials:</p>
                                    <table className="table-auto w-full text-left text-xs md:text-sm">
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

      {/* (3) SPECIFICATIONS */}
      <section className="page-break mt-10" style={{ backgroundColor: "transparent" }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: "#333" }}>
          3) Specifications
        </h2>
        <p className="text-sm mb-4" style={{ color: "#666" }}>
          This section shows labor by section (including any date surcharges/discounts)
          and an overall list of materials, tools, and equipment.
        </p>

        {(() => {
          // Build a map of section -> labor sum
          const sectionLaborMap: Record<string, number> = {};
          for (const roomId in selectedServicesState) {
            const services = selectedServicesState[roomId];
            for (const svcId of Object.keys(services)) {
              const cr = getCalcResultFor(svcId, overrideCalcResults, calculationResultsMap);
              if (!cr) continue;
              const catId = getCategoryIdFromServiceId(svcId);
              const catObj = ALL_CATEGORIES.find((c) => c.id === catId);
              const secName = catObj ? catObj.section : "Other";
              const labVal = parseFloat(cr.work_cost) || 0;
              if (!sectionLaborMap[secName]) sectionLaborMap[secName] = 0;
              sectionLaborMap[secName] += labVal;
            }
          }

          // Build materials map
          const materialsSpecMap: Record<
            string,
            { name: string; qty: number; cost: number }
          > = {};

          for (const roomId in selectedServicesState) {
            const services = selectedServicesState[roomId];
            for (const svcId of Object.keys(services)) {
              const cr = getCalcResultFor(svcId, overrideCalcResults, calculationResultsMap);
              if (!cr) continue;
              if (Array.isArray(cr.materials)) {
                cr.materials.forEach((m: any) => {
                  if (!materialsSpecMap[m.name]) {
                    materialsSpecMap[m.name] = {
                      name: m.name,
                      qty: 0,
                      cost: 0,
                    };
                  }
                  materialsSpecMap[m.name].qty += m.quantity || 0;
                  materialsSpecMap[m.name].cost += parseFloat(m.cost) || 0;
                });
              }
            }
          }

          const specsArray = Object.values(materialsSpecMap);

          return (
            <div style={{ backgroundColor: "transparent" }}>
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
                  {Object.entries(sectionLaborMap).map(([secName, totalLab]) => {
                    if (totalLab === 0) return null;
                    return (
                      <tr key={secName} style={{ borderBottom: "1px solid #ccc" }}>
                        <td className="px-3 py-2 border-r" style={{ borderColor: "#ccc" }}>
                          {secName}
                        </td>
                        <td className="px-3 py-2" style={{ textAlign: "right" }}>
                          ${formatWithSeparator(totalLab)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="text-sm" style={{ color: "#444" }}>
                <div className="flex justify-end">
                  <span className="mr-6">Labor Sum:</span>
                  <span>${formatWithSeparator(laborSubtotal)}</span>
                </div>
                {timeCoefficient !== 1 && (
                  <div className="flex justify-end mt-1">
                    <span className="mr-6">
                      {timeCoefficient > 1 ? "Surcharge" : "Discount"} (date):
                    </span>
                    <span>
                      {timeCoefficient > 1 ? "+" : "-"}$
                      {formatWithSeparator(
                        Math.abs(laborSubtotal * timeCoefficient - laborSubtotal)
                      )}
                    </span>
                  </div>
                )}
                <div className="flex justify-end font-semibold mt-1">
                  <span className="mr-6">Total Labor:</span>
                  <span>
                    $
                    {formatWithSeparator(
                      laborSubtotal * (timeCoefficient !== 1 ? timeCoefficient : 1)
                    )}
                  </span>
                </div>
              </div>

              {/* Materials */}
              <div className="mt-6">
                <h3 className="text-lg font-bold mb-2" style={{ color: "#333" }}>
                  B) Overall Materials, tools and equipment
                </h3>
                {specsArray.length === 0 ? (
                  <p className="text-sm" style={{ color: "#666" }}>
                    No materials used in this estimate.
                  </p>
                ) : (
                  <table
                    className="w-full table-auto border text-sm"
                    style={{ color: "#333", borderColor: "#999" }}
                  >
                    <thead style={{ background: "transparent" }}>
                      <tr>
                        <th className="px-3 py-2 border" style={{ borderColor: "#999", textAlign: "left" }}>
                          Material
                        </th>
                        <th className="px-3 py-2 border" style={{ borderColor: "#999", textAlign: "center" }}>
                          Qty
                        </th>
                        <th className="px-3 py-2 border" style={{ borderColor: "#999", textAlign: "center" }}>
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {specsArray.map((mat) => (
                        <tr key={mat.name} style={{ borderBottom: "1px solid #ccc" }}>
                          <td className="px-3 py-2 border-r" style={{ borderColor: "#ccc" }}>
                            {mat.name}
                          </td>
                          <td
                            className="px-3 py-2 border-r text-center"
                            style={{ borderColor: "#ccc" }}
                          >
                            {mat.qty}
                          </td>
                          <td className="px-3 py-2 text-center">
                            ${formatWithSeparator(mat.cost)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          );
        })()}
      </section>
    </div>
  );
}