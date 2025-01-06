"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BreadCrumb from "@/components/ui/BreadCrumb";
import { SectionBoxTitle } from "@/components/ui/SectionBoxTitle";
import { SectionBoxSubtitle } from "@/components/ui/SectionBoxSubtitle";
import ActionIconsBar from "@/components/ui/ActionIconsBar";
import { ROOMS_STEPS } from "@/constants/navigation";
import { ALL_SERVICES } from "@/constants/services";
import { ALL_CATEGORIES } from "@/constants/categories";
import { ROOMS } from "@/constants/rooms";

/**
 * Saves data to sessionStorage (client-only).
 */
function saveToSession(key: string, value: any) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(key, JSON.stringify(value));
  }
}

/**
 * Loads data from sessionStorage, or returns defaultValue if not found (or SSR).
 */
function loadFromSession<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  const stored = sessionStorage.getItem(key);
  try {
    return stored ? (JSON.parse(stored) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Formats a number with commas and exactly two decimals.
 */
function formatWithSeparator(num: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Returns a room object by ID from ROOMS.indoor/outdoor, or null if not found.
 */
function getRoomById(roomId: string) {
  const allRooms = [...ROOMS.indoor, ...ROOMS.outdoor];
  return allRooms.find((r) => r.id === roomId) || null;
}

/**
 * Returns the "category" portion from a service ID like "1-1-2".
 * For example, "1-1" if the service ID is "1-1-2".
 */
function getCategoryIdFromServiceId(serviceId: string): string {
  return serviceId.split("-").slice(0, 2).join("-");
}

/**
 * Finds a category name from ALL_CATEGORIES by ID, or returns the ID if not found.
 */
function getCategoryNameById(catId: string): string {
  const found = ALL_CATEGORIES.find((c) => c.id === catId);
  return found ? found.title : catId;
}

/**
 * If user removed finishing materials, we have override data in rooms_overrideCalcResults.
 * Otherwise we use calculationResultsMap. This function picks the final result.
 */
function getCalcResultFor(
  serviceId: string,
  overrideCalcResults: Record<string, any>,
  calculationResultsMap: Record<string, any>
) {
  return (
    overrideCalcResults[serviceId] || calculationResultsMap[serviceId] || null
  );
}

/**
 * Builds a temporary estimate number, e.g. "NY-10006-20250615-0930"
 * from (stateName, zip).
 */
function buildEstimateNumber(stateName: string, zip: string): string {
  // We'll take the first 2 letters of stateName (uppercase), then zip
  let stateZipBlock = "??-00000";
  if (stateName && zip) {
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
 * Converts a numeric USD amount into words, in a simplified manner.
 * e.g. 1234.56 => "One thousand two hundred thirty-four and 56/100 dollars".
 * This is a demo function, not fully robust for very large numbers.
 */
function numberToWordsUSD(amount: number): string {
  const integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - integerPart) * 100);

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
    return String(n);
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
      resultWords.unshift(threeDigitsToWords(chunk) + thousands[i]);
    }
    i++;
  }

  const integerWords = resultWords.join(" ").trim() || "zero";
  const decimalStr = decimalPart < 10 ? `0${decimalPart}` : String(decimalPart);

  return `${integerWords} and ${decimalStr}/100 dollars`;
}

export default function RoomsCheckout() {
  const router = useRouter();

  // 1) Load data from session
  const selectedServicesState: Record<string, Record<string, number>> =
    loadFromSession("rooms_selectedServicesWithQuantity", {});
  const address: string = loadFromSession("address", "");
  const description: string = loadFromSession("description", "");
  const photos: string[] = loadFromSession("photos", []);

  // city/stateName/zip/country for constructing address
  const city: string = loadFromSession("city", "");
  const stateName: string = loadFromSession("stateName", "");
  const zip: string = loadFromSession("zip", "");
  const country: string = loadFromSession("country", "");

  // Time selection
  const selectedTime: string | null = loadFromSession("selectedTime", null);
  const timeCoefficient: number = loadFromSession("timeCoefficient", 1);

  // The big data: normal + overrides
  const calculationResultsMap: Record<string, any> =
    loadFromSession("calculationResultsMap", {});
  const overrideCalcResults: Record<string, any> =
    loadFromSession("rooms_overrideCalcResults", {});

  // Summaries from the previous step
  const laborSubtotal: number = loadFromSession("rooms_laborSubtotal", 0);
  const materialsSubtotal: number = loadFromSession("rooms_materialsSubtotal", 0);
  const sumBeforeTax: number = loadFromSession("rooms_sumBeforeTax", 0);
  const taxRatePercent: number = loadFromSession("rooms_taxRatePercent", 0);
  const taxAmount: number = loadFromSession("rooms_taxAmount", 0);
  const finalTotal: number = loadFromSession("rooms_estimateFinalTotal", 0);
  const serviceFeeOnLabor: number = loadFromSession("serviceFeeOnLabor", 0);
  const serviceFeeOnMaterials: number = loadFromSession("serviceFeeOnMaterials", 0);

  // 2) If no services or no address => redirect
  useEffect(() => {
    let anyServices = false;
    for (const roomId in selectedServicesState) {
      if (Object.keys(selectedServicesState[roomId] || {}).length > 0) {
        anyServices = true;
        break;
      }
    }
    if (!anyServices || !address.trim()) {
      router.push("/rooms/details");
    }
  }, [selectedServicesState, address, router]);

  // We'll want to only show rooms that actually have services
  const chosenRoomIds = Object.keys(selectedServicesState).filter(
    (roomId) => Object.keys(selectedServicesState[roomId]).length > 0
  );

  // 3) Reconstruct full address
  let constructedAddress = "";
  if (city) constructedAddress += city;
  if (stateName) {
    if (constructedAddress) constructedAddress += ", ";
    constructedAddress += stateName;
  }
  if (zip) {
    if (constructedAddress) constructedAddress += " ";
    constructedAddress += zip;
  }
  if (country) {
    if (constructedAddress) constructedAddress += ", ";
    constructedAddress += country;
  }

  // 4) Build a "temporary" estimate number
  const estimateNumber = buildEstimateNumber(stateName, zip);

  // 5) We'll convert the finalTotal to a spelled-out version
  const finalTotalWords = numberToWordsUSD(finalTotal);

  // 6) Actions
  function handlePlaceOrder() {
    alert("Your Rooms order has been placed!");
  }
  function handlePrint() {
    router.push("/rooms/checkout/print");
  }
  function handleShare() {
    alert("Sharing the Rooms estimate link...");
  }
  function handleSave() {
    alert("Saving the Rooms estimate as PDF...");
  }

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto">
        <BreadCrumb items={ROOMS_STEPS} />
      </div>

      <div className="container mx-auto pt-8">
        {/* Top row: back link + Place Order */}
        <div className="flex items-center justify-between mb-6">
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

        {/* Title + Action Icons */}
        <div className="flex items-center justify-between">
          <SectionBoxTitle>Checkout</SectionBoxTitle>
          <ActionIconsBar onPrint={handlePrint} onShare={handleShare} onSave={handleSave} />
        </div>

        {/* Main white card */}
        <div className="bg-white border border-gray-300 mt-8 p-6 rounded-lg space-y-6">
          {/* 1) Header: "Estimate (...)" */}
          <SectionBoxSubtitle>
            Estimate <span className="ml-2 text-sm text-gray-500">({estimateNumber})</span>
          </SectionBoxSubtitle>
          <p className="text-xs text-gray-400 -mt-2 ml-1">
            *This number is temporary and will be replaced with a permanent order number after confirmation.
          </p>

          <div className="mt-4 space-y-8">
            {chosenRoomIds.map((roomId) => {
              // The room => e.g. "Attic" or "Basement"
              const roomObj = getRoomById(roomId);
              const roomTitle = roomObj ? roomObj.title : roomId;
              const roomServicesMap = selectedServicesState[roomId] || {};
              const sectionMap: Record<string, Record<string, string[]>> = {};

              for (const svcId of Object.keys(roomServicesMap)) {
                const catId = getCategoryIdFromServiceId(svcId);
                // find category => has .section => e.g. "Electrical"
                const catObj = ALL_CATEGORIES.find((c) => c.id === catId);
                const sectionName = catObj ? catObj.section : "Other";

                if (!sectionMap[sectionName]) sectionMap[sectionName] = {};
                if (!sectionMap[sectionName][catId]) sectionMap[sectionName][catId] = [];
                sectionMap[sectionName][catId].push(svcId);
              }

              // Summation of labor+mat for the entire room
              let roomLabor = 0;
              let roomMat = 0;
              for (const svcId of Object.keys(roomServicesMap)) {
                const cr = getCalcResultFor(svcId, overrideCalcResults, calculationResultsMap);
                if (!cr) continue;
                roomLabor += parseFloat(cr.work_cost) || 0;
                roomMat += parseFloat(cr.material_cost) || 0;
              }
              const roomSubtotal = roomLabor + roomMat;

              return (
                <div key={roomId} className="space-y-4">
                  {/* The room name, no numbering */}
                  <h3 className="text-2xl font-semibold text-gray-800">
                    {roomTitle}
                  </h3>

                  {/* Now we do the 3-level numbering:
                      L1 => "1. Electrical" (the "sectionName" index)
                      L2 => "1.1. CategoryName" 
                      L3 => "1.1.1. ServiceTitle"
                  */}
                  {Object.entries(sectionMap).map(([sectionName, catObjMap], sectionIdx) => {
                    const sectionNum = sectionIdx + 1; // e.g. "1"
                    return (
                      <div key={sectionName} className="ml-4 space-y-4">
                        {/* L1 => "1. <sectionName>" */}
                        <h4 className="text-xl font-medium text-gray-700">
                          {sectionNum}. {sectionName}
                        </h4>

                        {Object.entries(catObjMap).map(([catId, svcList], catIdx) => {
                          // L2 => "1.1. <catName>"
                          const catNum = `${sectionNum}.${catIdx + 1}`;
                          const catName = getCategoryNameById(catId);

                          return (
                            <div key={catId} className="ml-4 space-y-4">
                              <h5 className="font-medium text-lg text-gray-700">
                                {catNum}. {catName}
                              </h5>

                              {svcList.map((svcId, svcIdx) => {
                                // L3 => "1.1.1. <svcTitle>"
                                const svcNum = `${catNum}.${svcIdx + 1}`;
                                const foundSvc = ALL_SERVICES.find((s) => s.id === svcId);
                                const svcTitle = foundSvc ? foundSvc.title : svcId;
                                const svcDesc = foundSvc?.description || "";
                                const qty = roomServicesMap[svcId] || 1;

                                const cr = getCalcResultFor(svcId, overrideCalcResults, calculationResultsMap);
                                const laborCost = cr ? parseFloat(cr.work_cost) || 0 : 0;
                                const matCost = cr ? parseFloat(cr.material_cost) || 0 : 0;
                                const totalCost = laborCost + matCost;

                                return (
                                  <div key={svcId} className="pl-4 border-gray-200 mb-6 space-y-2">
                                    <h6 className="font-medium text-md text-gray-700">
                                      {svcNum}. {svcTitle}
                                    </h6>

                                    {svcDesc && (
                                      <p className="text-sm text-gray-500 mt-1">
                                        {svcDesc}
                                      </p>
                                    )}

                                    {/* quantity + total cost */}
                                    <div className="flex items-center justify-between mt-1">
                                      <div className="text-md font-medium text-gray-700">
                                        {qty} {foundSvc?.unit_of_measurement || "units"}
                                      </div>
                                      <div className="text-md font-medium mr-4 text-gray-700">
                                        ${formatWithSeparator(totalCost)}
                                      </div>
                                    </div>

                                    {/* cost breakdown */}
                                    {cr && (
                                      <div className="mt-2 p-4 bg-gray-50 border rounded">
                                        <div className="flex justify-between mb-3">
                                          <span className="text-md font-medium text-gray-800">Labor:</span>
                                          <span className="text-md text-gray-700">
                                            {cr.work_cost
                                              ? `$${formatWithSeparator(parseFloat(cr.work_cost))}`
                                              : "—"}
                                          </span>
                                        </div>
                                        <div className="flex justify-between mb-3">
                                          <span className="text-md font-medium text-gray-800">Material:</span>
                                          <span className="text-md text-gray-700">
                                            {cr.material_cost
                                              ? `$${formatWithSeparator(parseFloat(cr.material_cost))}`
                                              : "—"}
                                          </span>
                                        </div>
                                        <div className="flex justify-between border-t pt-2 mt-2">
                                          <span className="text-md font-medium text-gray-800">Total:</span>
                                          <span className="text-md font-medium text-gray-800">
                                            {cr.total
                                              ? `$${formatWithSeparator(parseFloat(cr.total))}`
                                              : `$${formatWithSeparator(totalCost)}`}
                                          </span>
                                        </div>

                                        {Array.isArray(cr.materials) && cr.materials.length > 0 && (
                                          <div className="mt-4">
                                            <h6 className="text-md font-medium text-gray-800 mb-2">
                                              Materials
                                            </h6>
                                            <table className="table-auto w-full text-sm text-left text-gray-700">
                                              <thead>
                                                <tr className="border-b">
                                                  <th className="py-2 px-3">Name</th>
                                                  <th className="py-2 px-3">Price</th>
                                                  <th className="py-2 px-3">Qty</th>
                                                  <th className="py-2 px-3">Subtotal</th>
                                                </tr>
                                              </thead>
                                              <tbody className="divide-y divide-gray-200">
                                                {cr.materials.map((m: any, i2: number) => (
                                                  <tr key={`${m.external_id}-${i2}`} className="align-top">
                                                    <td className="py-3 px-3">{m.name}</td>
                                                    <td className="py-3 px-3">
                                                      ${formatWithSeparator(parseFloat(m.cost_per_unit))}
                                                    </td>
                                                    <td className="py-3 px-3">{m.quantity}</td>
                                                    <td className="py-3 px-3">
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

                  {/* Room total */}
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-medium text-xl text-gray-700">
                      {roomTitle} Total:
                    </span>
                    <span className="font-medium text-xl text-gray-700">
                      ${formatWithSeparator(roomSubtotal)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 3) Overall summary */}
          <div className="pt-4 mt-4 border-t">
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-lg text-gray-600">Labor</span>
              <span className="font-semibold text-lg text-gray-600">
                ${formatWithSeparator(laborSubtotal)}
              </span>
            </div>

            <div className="flex justify-between mb-2">
              <span className="font-semibold text-lg text-gray-600">Materials</span>
              <span className="font-semibold text-lg text-gray-600">
                ${formatWithSeparator(materialsSubtotal)}
              </span>
            </div>

            {timeCoefficient !== 1 && (
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">
                  {timeCoefficient > 1
                    ? "Surcharge (date selection)"
                    : "Discount (date selection)"}
                </span>
                <span
                  className={`font-semibold text-lg ${
                    timeCoefficient > 1 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {timeCoefficient > 1 ? "+" : "-"}$
                  {formatWithSeparator(Math.abs(laborSubtotal * timeCoefficient - laborSubtotal))}
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
              <span className="text-gray-600">Delivery &amp; Processing (5% on materials)</span>
              <span className="font-semibold text-lg text-gray-800">
                ${formatWithSeparator(serviceFeeOnMaterials)}
              </span>
            </div>

            <div className="flex justify-between mb-2">
              <span className="font-semibold text-xl text-gray-800">Subtotal</span>
              <span className="font-semibold text-xl text-gray-800">
                ${formatWithSeparator(sumBeforeTax)}
              </span>
            </div>

            <div className="flex justify-between mb-2">
              <span className="text-gray-600">
                Sales tax
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

          {/* 4) Date of Service */}
          <hr className="my-6 border-gray-200" />
          <div>
            <SectionBoxSubtitle>Date of Service</SectionBoxSubtitle>
            <p className="text-gray-700">{selectedTime || "No date selected"}</p>
          </div>

          {/* 5) Additional details */}
          <hr className="my-6 border-gray-200" />
          <div>
            <SectionBoxSubtitle>Additional Details</SectionBoxSubtitle>
            <p className="text-gray-700">{description || "No details provided"}</p>
          </div>

          {/* 6) Address */}
          <hr className="my-6 border-gray-200" />
          <div>
            <SectionBoxSubtitle>Address</SectionBoxSubtitle>
            <p className="text-gray-800">{constructedAddress.trim() || "No address provided"}</p>
          </div>

          {/* 7) Photos */}
          <hr className="my-6 border-gray-200" />
          <div>
            <SectionBoxSubtitle>Uploaded Photos</SectionBoxSubtitle>
            {photos.length === 0 ? (
              <p className="text-gray-500 mt-2">No photos uploaded</p>
            ) : (
              <div className="grid grid-cols-6 gap-2 mt-4">
                {photos.map((photo, idx) => (
                  <img
                    key={idx}
                    src={photo}
                    alt={`Photo ${idx + 1}`}
                    className="w-full h-24 object-cover rounded border border-gray-300"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}