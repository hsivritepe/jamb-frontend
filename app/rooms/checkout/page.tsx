"use client";

export const dynamic = "force-dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BreadCrumb from "@/components/ui/BreadCrumb";
import { SectionBoxTitle } from "@/components/ui/SectionBoxTitle";
import { SectionBoxSubtitle } from "@/components/ui/SectionBoxSubtitle";
import ActionIconsBar from "@/components/ui/ActionIconsBar";
import { ROOMS_STEPS } from "@/constants/navigation";
import { ROOMS } from "@/constants/rooms";
import { ALL_SERVICES } from "@/constants/services";
import { ALL_CATEGORIES } from "@/constants/categories";

// Unified session utilities
import { getSessionItem, setSessionItem } from "@/utils/session";

/**
 * Formats a numeric value with commas and exactly two decimals.
 */
function formatWithSeparator(num: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Finds a room object by ID from ROOMS.indoor/outdoor arrays, or returns null if not found.
 */
function getRoomById(roomId: string) {
  const allRooms = [...ROOMS.indoor, ...ROOMS.outdoor];
  return allRooms.find((r) => r.id === roomId) || null;
}

/**
 * Extracts the category part ("1-1") from a service ID like "1-1-2".
 */
function getCategoryIdFromServiceId(serviceId: string): string {
  return serviceId.split("-").slice(0, 2).join("-");
}

/**
 * Returns a category name from ALL_CATEGORIES by its ID, or the ID itself if not found.
 */
function getCategoryNameById(catId: string): string {
  const found = ALL_CATEGORIES.find((c) => c.id === catId);
  return found ? found.title : catId;
}

/**
 * Returns either the overridden calc results or the normal calculation results from the server.
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
 * Builds a reference number using partial state name, zip, and current datetime.
 * Example: "NY-10006-20250910-1415"
 */
function buildEstimateNumber(stateName: string, zip: string): string {
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
 * Converts a numeric USD amount to words in a simplified manner, e.g. "one hundred and 50/100".
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

  // Load data from session
  const selectedServicesState: Record<
    string,
    Record<string, number>
  > = getSessionItem("rooms_selectedServicesWithQuantity", {});
  const address: string = getSessionItem("address", "");
  const description: string = getSessionItem("description", "");
  const photos: string[] = getSessionItem("photos", []);

  // City/state/zip/country
  const city: string = getSessionItem("city", "");
  const stateName: string = getSessionItem("stateName", "");
  const zip: string = getSessionItem("zip", "");
  const country: string = getSessionItem("country", "");

  // Date/time selection
  const selectedTime: string | null = getSessionItem("selectedTime", null);
  const timeCoefficient: number = getSessionItem("timeCoefficient", 1);

  // Calculation results
  const calculationResultsMap: Record<string, any> = getSessionItem(
    "calculationResultsMap",
    {}
  );
  const overrideCalcResults: Record<string, any> = getSessionItem(
    "rooms_overrideCalcResults",
    {}
  );

  // Summaries from the previous step
  const laborSubtotal: number = getSessionItem("rooms_laborSubtotal", 0);
  const materialsSubtotal: number = getSessionItem(
    "rooms_materialsSubtotal",
    0
  );
  const sumBeforeTax: number = getSessionItem("rooms_sumBeforeTax", 0);
  const taxRatePercent: number = getSessionItem("rooms_taxRatePercent", 0);
  const taxAmount: number = getSessionItem("rooms_taxAmount", 0);
  const finalTotal: number = getSessionItem("rooms_estimateFinalTotal", 0);
  const serviceFeeOnLabor: number = getSessionItem("serviceFeeOnLabor", 0);
  const serviceFeeOnMaterials: number = getSessionItem(
    "serviceFeeOnMaterials",
    0
  );

  // If no selected services or no address => redirect
  useEffect(() => {
    let anySelected = false;
    for (const roomId in selectedServicesState) {
      if (Object.keys(selectedServicesState[roomId] || {}).length > 0) {
        anySelected = true;
        break;
      }
    }
    if (!anySelected || !address.trim()) {
      router.push("/rooms/details");
    }
  }, [selectedServicesState, address, router]);

  // The set of rooms that actually have chosen services
  const chosenRoomIds = Object.keys(selectedServicesState).filter(
    (roomId) => Object.keys(selectedServicesState[roomId]).length > 0
  );

  // Build a combined address
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

  // Build the estimate number
  const estimateNumber = buildEstimateNumber(stateName, zip);

  // Convert final total to words
  const finalTotalWords = numberToWordsUSD(finalTotal);

  // Action handlers
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
        {/* Top row: back + place order */}
        <div className="flex items-center justify-between mb-6">
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
            Place Your Order
          </button>
        </div>

        {/* Header row: "Checkout" + Action icons */}
        <div className="flex items-center justify-between">
          <SectionBoxTitle>Checkout</SectionBoxTitle>
          <ActionIconsBar
            onPrint={handlePrint}
            onShare={handleShare}
            onSave={handleSave}
          />
        </div>

        <div className="bg-white border border-gray-300 mt-8 p-4 sm:p-6 rounded-lg space-y-6">
          {/* Title and reference number in a column (always) */}
          <SectionBoxSubtitle>
            <div>Estimate for Selected Rooms</div>
            <div className="text-sm text-gray-500 mt-1">({estimateNumber})</div>
          </SectionBoxSubtitle>
          <p className="text-xs text-gray-400 ml-1">
            *This number is temporary and will be replaced with a permanent
            order number after confirmation.
          </p>

          {/* Rooms breakdown */}
          <div className="space-y-6 mt-4">
            {chosenRoomIds.map((roomId) => {
              const roomObj = getRoomById(roomId);
              const roomTitle = roomObj ? roomObj.title : roomId;

              const roomServices = selectedServicesState[roomId] || {};

              // Summation for entire room
              let roomLabor = 0;
              let roomMat = 0;
              for (const svcId of Object.keys(roomServices)) {
                const cr = getCalcResultFor(
                  svcId,
                  overrideCalcResults,
                  calculationResultsMap
                );
                if (!cr) continue;
                roomLabor += parseFloat(cr.work_cost) || 0;
                roomMat += parseFloat(cr.material_cost) || 0;
              }
              const roomSubtotal = roomLabor + roomMat;

              // Build structure => { sectionName => { catId => [svcIds] } }
              const sectionMap: Record<string, Record<string, string[]>> = {};
              Object.keys(roomServices).forEach((svcId) => {
                const catId = getCategoryIdFromServiceId(svcId);
                const catObj = ALL_CATEGORIES.find((c) => c.id === catId);
                const sectionName = catObj ? catObj.section : "Other";

                if (!sectionMap[sectionName]) sectionMap[sectionName] = {};
                if (!sectionMap[sectionName][catId])
                  sectionMap[sectionName][catId] = [];
                sectionMap[sectionName][catId].push(svcId);
              });

              return (
                <div key={roomId} className="space-y-4">
                  <h3 className="text-2xl font-semibold text-gray-800">
                    {roomTitle}
                  </h3>

                  {Object.entries(sectionMap).map(
                    ([sectionName, catObjMap], sectionIdx) => {
                      const sectionNum = sectionIdx + 1;
                      return (
                        <div
                          key={sectionName}
                          className="ml-0 sm:ml-4 space-y-4"
                        >
                          <h4 className="text-xl font-medium text-gray-700">
                            {sectionNum}. {sectionName}
                          </h4>

                          {Object.entries(catObjMap).map(
                            ([catId, svcList], catIdx) => {
                              const catNum = `${sectionNum}.${catIdx + 1}`;
                              const catName = getCategoryNameById(catId);

                              return (
                                <div
                                  key={catId}
                                  className="ml-0 sm:ml-4 space-y-4"
                                >
                                  <h5 className="font-medium text-lg text-gray-700">
                                    {catNum}. {catName}
                                  </h5>

                                  {svcList.map((svcId, svcIdx) => {
                                    const svcNum = `${catNum}.${svcIdx + 1}`;
                                    const foundSvc = ALL_SERVICES.find(
                                      (s) => s.id === svcId
                                    );
                                    const svcTitle = foundSvc
                                      ? foundSvc.title
                                      : svcId;
                                    const svcDesc = foundSvc?.description || "";
                                    const qty = roomServices[svcId] || 1;

                                    const cr = getCalcResultFor(
                                      svcId,
                                      overrideCalcResults,
                                      calculationResultsMap
                                    );
                                    const laborCost = cr
                                      ? parseFloat(cr.work_cost) || 0
                                      : 0;
                                    const matCost = cr
                                      ? parseFloat(cr.material_cost) || 0
                                      : 0;
                                    const totalCost = laborCost + matCost;

                                    return (
                                      <div
                                        key={svcId}
                                        className="pl-0 sm:pl-4 border-gray-200 mb-6 space-y-2"
                                      >
                                        <h6 className="font-medium text-md text-gray-700">
                                          {svcNum}. {svcTitle}
                                        </h6>

                                        {svcDesc && (
                                          <p className="text-sm text-gray-500 mt-1">
                                            {svcDesc}
                                          </p>
                                        )}

                                        <div className="flex items-center justify-between mt-1">
                                          <div className="text-md font-medium text-gray-700">
                                            {qty}{" "}
                                            {foundSvc?.unit_of_measurement ||
                                              "units"}
                                          </div>
                                          <div className="text-md font-medium text-gray-700 mr-2">
                                            ${formatWithSeparator(totalCost)}
                                          </div>
                                        </div>

                                        {cr && (
                                          <div className="mt-2 p-2 sm:p-4 bg-gray-50 border rounded">
                                            <div className="flex justify-between mb-3">
                                              <span className="text-md font-medium text-gray-700">
                                                Labor
                                              </span>
                                              <span className="text-md font-medium text-gray-700">
                                                {cr.work_cost
                                                  ? `$${formatWithSeparator(
                                                      parseFloat(cr.work_cost)
                                                    )}`
                                                  : "—"}
                                              </span>
                                            </div>
                                            <div className="flex justify-between mb-3">
                                              <span className="text-md font-medium text-gray-700">
                                                Materials, tools and equipment
                                              </span>
                                              <span className="text-md font-medium text-gray-700">
                                                {cr.material_cost
                                                  ? `$${formatWithSeparator(
                                                      parseFloat(
                                                        cr.material_cost
                                                      )
                                                    )}`
                                                  : "—"}
                                              </span>
                                            </div>

                                            {Array.isArray(cr.materials) &&
                                              cr.materials.length > 0 && (
                                                <div className="mt-4">
                                                  <table className="table-auto w-full text-sm text-left text-gray-700">
                                                    <thead>
                                                      <tr className="border-b">
                                                        <th className="py-2 px-1 sm:px-3">
                                                          Name
                                                        </th>
                                                        <th className="py-2 px-1 sm:px-3">
                                                          Price
                                                        </th>
                                                        <th className="py-2 px-1 sm:px-3">
                                                          Qty
                                                        </th>
                                                        <th className="py-2 px-1 sm:px-3">
                                                          Subtotal
                                                        </th>
                                                      </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200">
                                                      {cr.materials.map(
                                                        (
                                                          m: any,
                                                          i2: number
                                                        ) => (
                                                          <tr
                                                            key={`${m.external_id}-${i2}`}
                                                            className="align-top"
                                                          >
                                                            <td className="py-3 px-3">
                                                              {m.name}
                                                            </td>
                                                            <td className="py-3 px-3">
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
                                                                parseFloat(
                                                                  m.cost
                                                                )
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
                            }
                          )}
                        </div>
                      );
                    }
                  )}

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

          {/* Overall summary */}
          <div className="pt-4 mt-4 border-t">
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-lg text-gray-600">
                Labor total:
              </span>
              <span className="font-semibold text-lg text-gray-600">
                ${formatWithSeparator(laborSubtotal)}
              </span>
            </div>

            <div className="flex justify-between mb-2">
              <span className="font-semibold text-lg text-gray-600">
                Materials, tools & equipment:
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
                    : "Discount (date selection)"}
                </span>
                <span
                  className={`font-semibold text-lg ${
                    timeCoefficient > 1 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {timeCoefficient > 1 ? "+" : "-"}$
                  {formatWithSeparator(
                    Math.abs(laborSubtotal * timeCoefficient - laborSubtotal)
                  )}
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
                Subtotal:
              </span>
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
              <span>Total:</span>
              <span>${formatWithSeparator(finalTotal)}</span>
            </div>

            <span className="block text-right my-2 text-gray-600">
              ({finalTotalWords})
            </span>
          </div>

          {/* Date of Service */}
          <hr className="my-6 border-gray-200" />
          <div>
            <SectionBoxSubtitle>Work Start Date</SectionBoxSubtitle>
            <p className="text-gray-700">
              {selectedTime || "No date selected"}
            </p>
          </div>

          {/* Additional details */}
          <hr className="my-6 border-gray-200" />
          <div>
            <SectionBoxSubtitle>Additional Details</SectionBoxSubtitle>
            <p className="text-gray-700">
              {description || "No details provided"}
            </p>
          </div>

          {/* Address */}
          <hr className="my-6 border-gray-200" />
          <div>
            <SectionBoxSubtitle>Location</SectionBoxSubtitle>
            <p className="text-gray-800">
              {constructedAddress.trim() || "No address provided"}
            </p>
          </div>

          {/* Photos */}
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
