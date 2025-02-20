"use client";

export const dynamic = "force-dynamic";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import BreadCrumb from "@/components/ui/BreadCrumb";
import { SectionBoxTitle } from "@/components/ui/SectionBoxTitle";
import { SectionBoxSubtitle } from "@/components/ui/SectionBoxSubtitle";
import { Printer, Share2, Save } from "lucide-react";
import { ROOMS_STEPS } from "@/constants/navigation";
import { ROOMS } from "@/constants/rooms";
import { ALL_SERVICES } from "@/constants/services";
import { ALL_CATEGORIES } from "@/constants/categories";
import { getSessionItem, setSessionItem } from "@/utils/session";
import PlaceOrderButton from "@/components/ui/PlaceOrderButton";

/**
 * Props for the print/share/save button bar.
 */
interface ActionIconsBarProps {
  onPrint?: () => void;
}

/**
 * Renders a single button with icons for Print, Share, and Save.
 * Calls onPrint when clicked, if provided.
 */
const ActionIconsBar: React.FC<ActionIconsBarProps> = ({ onPrint }) => {
  return (
    <button
      onClick={onPrint}
      className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:text-gray-900"
    >
      <Printer size={20} />
      <Share2 size={20} />
      <Save size={20} />
      <span className="hidden sm:inline text-sm">Print</span>
    </button>
  );
};

/**
 * Formats a number with commas and two decimals.
 */
function formatWithSeparator(num: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Extracts the "category" part of a service ID.
 * Example: "1-1-2" => "1-1".
 */
function getCategoryIdFromServiceId(serviceId: string): string {
  return serviceId.split("-").slice(0, 2).join("-");
}

/**
 * Finds a category title by ID, or returns the ID if none found.
 */
function getCategoryNameById(catId: string): string {
  const found = ALL_CATEGORIES.find((c) => c.id === catId);
  return found ? found.title : catId;
}

/**
 * Returns a room object by ID from the ROOMS arrays, or null if not found.
 */
function getRoomById(roomId: string) {
  const all = [...ROOMS.indoor, ...ROOMS.outdoor];
  return all.find((r) => r.id === roomId) || null;
}

/**
 * Constructs a temporary estimate code, e.g. "NY-10006-20251122-1530".
 */
function buildEstimateNumber(stateName: string, zip: string): string {
  let stateZipBlock = "??-00000";
  if (stateName && zip) {
    const shortState = stateName.trim().split(" ")[0].slice(0, 2).toUpperCase();
    stateZipBlock = `${shortState}-${zip}`;
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
 * Converts a numeric USD amount into spelled-out English (simplified).
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
      return `${wordsMap[tens]}-${wordsMap[ones]}`;
    }
    return String(n);
  }

  function threeDigitsToWords(n: number): string {
    const hundreds = Math.floor(n / 100);
    const remainder = n % 100;
    const hundredPart = hundreds ? wordsMap[hundreds] + " hundred" : "";
    const remainderPart = remainder ? twoDigitsToWords(remainder) : "";
    if (hundreds && remainder) return `${hundredPart} ${remainderPart}`;
    return hundredPart || remainderPart || "";
  }

  const chunks: string[] = [];
  const units = ["", " thousand", " million", " billion"];
  let temp = integerPart;
  let i = 0;

  if (temp === 0) {
    chunks.push("zero");
  }
  while (temp > 0 && i < units.length) {
    const chunk = temp % 1000;
    if (chunk > 0) {
      chunks.unshift(threeDigitsToWords(chunk) + units[i]);
    }
    temp = Math.floor(temp / 1000);
    i++;
  }

  const integerWords = chunks.join(" ").trim() || "zero";
  const decimalStr = decimalPart < 10 ? `0${decimalPart}` : String(decimalPart);
  return `${integerWords} and ${decimalStr}/100 dollars`;
}

/**
 * Final checkout page for the "Rooms" flow.
 */
export default function RoomsCheckout() {
  const router = useRouter();

  // Selected services
  const selectedServicesState: Record<string, Record<string, number>> =
    getSessionItem("rooms_selectedServicesWithQuantity", {});

  const address: string = getSessionItem("address", "");
  const description: string = getSessionItem("description", "");
  const photos: string[] = getSessionItem("photos", []);
  const city: string = getSessionItem("city", "");
  const stateName: string = getSessionItem("stateName", "");
  const zip: string = getSessionItem("zip", "");
  const country: string = getSessionItem("country", "");
  const selectedTime: string | null = getSessionItem("selectedTime", null);
  const timeCoefficient: number = getSessionItem("timeCoefficient", 1);

  // Calculations
  const calculationResultsMap: Record<string, any> =
    getSessionItem("calculationResultsMap", {});
  const overrideCalcResults: Record<string, any> =
    getSessionItem("rooms_overrideCalcResults", {});

  // Summaries from previous step
  const laborSubtotal: number = getSessionItem("rooms_laborSubtotal", 0);
  const materialsSubtotal: number = getSessionItem("rooms_materialsSubtotal", 0);
  const sumBeforeTax: number = getSessionItem("rooms_sumBeforeTax", 0);
  const taxRatePercent: number = getSessionItem("rooms_taxRatePercent", 0);
  const taxAmount: number = getSessionItem("rooms_taxAmount", 0);
  const finalTotal: number = getSessionItem("rooms_estimateFinalTotal", 0);
  const serviceFeeOnLabor: number = getSessionItem("serviceFeeOnLabor", 0);
  const serviceFeeOnMaterials: number = getSessionItem("serviceFeeOnMaterials", 0);

  // Redirect if nothing is selected or no address
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

  // Determine which rooms actually have services
  const chosenRoomIds = Object.keys(selectedServicesState).filter(
    (roomId) => Object.keys(selectedServicesState[roomId]).length > 0
  );

  // Address string
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

  // Temporary reference code
  const estimateNumber = buildEstimateNumber(stateName, zip);
  const spelledOutTotal = numberToWordsUSD(finalTotal);

  /**
   * Builds the "worksData" array describing each service line item for order posting.
   */
  function buildWorksData() {
    const works: Array<{
      type: string;
      code: string;
      unitOfMeasurement: string;
      quantity: number;
      laborCost: number;
      materialsCost: number;
      serviceFeeOnLabor?: number;
      serviceFeeOnMaterials?: number;
      total: number;
      materials?: Array<{
        external_id: string;
        quantity: number;
        costPerUnit: number;
        total: number;
      }>;
    }> = [];

    for (const roomId of Object.keys(selectedServicesState)) {
      const roomServices = selectedServicesState[roomId];
      for (const svcId of Object.keys(roomServices)) {
        const qty = roomServices[svcId];
        const resultObj = overrideCalcResults[svcId] || calculationResultsMap[svcId];
        if (!resultObj) continue;

        const laborVal = parseFloat(resultObj.work_cost) || 0;
        const matVal = parseFloat(resultObj.material_cost) || 0;
        const totalVal = laborVal + matVal;

        const foundSvc = ALL_SERVICES.find((x) => x.id === svcId);
        const unit = foundSvc?.unit_of_measurement || "units";

        let mats: Array<{
          external_id: string;
          quantity: number;
          costPerUnit: number;
          total: number;
        }> = [];
        if (Array.isArray(resultObj.materials)) {
          mats = resultObj.materials.map((m: any) => ({
            external_id: m.external_id,
            quantity: m.quantity,
            costPerUnit: parseFloat(m.cost_per_unit) || 0,
            total: parseFloat(m.cost) || 0,
          }));
        }

        works.push({
          type: "rooms",
          code: svcId.replace(/-/g, "."),
          unitOfMeasurement: unit,
          quantity: qty,
          laborCost: laborVal,
          materialsCost: matVal,
          total: totalVal,
          serviceFeeOnLabor: 0,
          serviceFeeOnMaterials: 0,
          materials: mats,
        });
      }
    }
    return works;
  }

  /**
   * Clears session storage for "rooms" data on successful order, then navigates away.
   */
  function onOrderSuccess() {
    // Remove keys associated with the "rooms" flow
    sessionStorage.removeItem("rooms_selectedServicesWithQuantity");
    sessionStorage.removeItem("rooms_selectedSections");
    sessionStorage.removeItem("rooms_searchQuery");
    sessionStorage.removeItem("finishingMaterialSelections");
    sessionStorage.removeItem("rooms_overrideCalcResults");
    sessionStorage.removeItem("rooms_laborSubtotal");
    sessionStorage.removeItem("rooms_materialsSubtotal");
    sessionStorage.removeItem("rooms_sumBeforeTax");
    sessionStorage.removeItem("rooms_taxRatePercent");
    sessionStorage.removeItem("rooms_taxAmount");
    sessionStorage.removeItem("rooms_estimateFinalTotal");

    // Optionally remove other global or local keys if needed
    sessionStorage.removeItem("description");
    sessionStorage.removeItem("photos");
    sessionStorage.removeItem("selectedTime");
    sessionStorage.removeItem("timeCoefficient");

    router.push("/thank-you");
  }

  const orderData = {
    zipcode: zip,
    address: constructedAddress.trim(),
    description,
    selectedTime: selectedTime || "",
    timeCoefficient,
    laborSubtotal,
    sumBeforeTax,
    finalTotal,
    taxRate: taxRatePercent,
    taxAmount,
    worksData: buildWorksData(),
    serviceFeeOnLabor,
    serviceFeeOnMaterials,
    paymentType: "n/a",
    paymentCoefficient: 1,
  };

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto">
        <BreadCrumb items={ROOMS_STEPS} />
      </div>

      <div className="container mx-auto pt-8">
        {/* Top row: back button + PlaceOrderButton */}
        <div className="flex items-center justify-between mb-6">
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => router.back()}
          >
            ← Back
          </span>
          <PlaceOrderButton
            photos={photos}
            orderData={orderData}
            onOrderSuccess={onOrderSuccess}
          />
        </div>

        {/* Title + Action bar */}
        <div className="flex items-center justify-between">
          <SectionBoxTitle>Checkout</SectionBoxTitle>
          <ActionIconsBar onPrint={() => router.push("/rooms/checkout/print")} />
        </div>

        <div className="bg-white border border-gray-300 mt-8 p-4 sm:p-6 rounded-lg space-y-6">
          <SectionBoxSubtitle>
            <div>Estimate for Selected Rooms</div>
            <div className="text-sm text-gray-500 mt-1">{estimateNumber}</div>
          </SectionBoxSubtitle>
          <p className="text-xs text-gray-400 ml-1">
            *This number is temporary and will be replaced with a permanent order number after confirmation.
          </p>

          {/* Breakdown of each room */}
          <div className="space-y-6 mt-4">
            {chosenRoomIds.map((roomId) => {
              const roomObj = getRoomById(roomId);
              if (!roomObj) return null;

              const roomServices = selectedServicesState[roomId] || {};
              let roomLabor = 0;
              let roomMaterials = 0;
              Object.keys(roomServices).forEach((svcId) => {
                const cr = overrideCalcResults[svcId] || calculationResultsMap[svcId];
                if (!cr) return;
                roomLabor += parseFloat(cr.work_cost) || 0;
                roomMaterials += parseFloat(cr.material_cost) || 0;
              });
              const roomSubtotal = roomLabor + roomMaterials;

              // Build structure for grouping by category
              const sectionMap: Record<string, Record<string, string[]>> = {};
              Object.keys(roomServices).forEach((svcId) => {
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
              });

              return (
                <div key={roomId} className="space-y-4">
                  <h3 className="text-2xl font-semibold text-gray-800">
                    {roomObj.title}
                  </h3>

                  {Object.entries(sectionMap).map(([secName, catObjMap], idx) => {
                    const secNumber = idx + 1;
                    return (
                      <div key={secName} className="ml-0 sm:ml-4 space-y-4">
                        <h4 className="text-xl font-medium text-gray-700">
                          {secNumber}. {secName}
                        </h4>

                        {Object.entries(catObjMap).map(([catId, svcIds], catIdx) => {
                          const catNumber = `${secNumber}.${catIdx + 1}`;
                          const catName = getCategoryNameById(catId);

                          return (
                            <div key={catId} className="ml-0 sm:ml-4 space-y-4">
                              <h5 className="font-medium text-lg text-gray-700">
                                {catNumber}. {catName}
                              </h5>

                              {svcIds.map((svcId, svcIndex) => {
                                const svcNum = `${catNumber}.${svcIndex + 1}`;
                                const foundSvc = ALL_SERVICES.find((s) => s.id === svcId);
                                if (!foundSvc) return null;

                                const cr = overrideCalcResults[svcId] || calculationResultsMap[svcId];
                                const qty = roomServices[svcId] || 1;
                                const laborCost = cr ? parseFloat(cr.work_cost) || 0 : 0;
                                const matCost = cr ? parseFloat(cr.material_cost) || 0 : 0;
                                const totalCost = laborCost + matCost;

                                return (
                                  <div key={svcId} className="pl-0 sm:pl-4 mb-6 space-y-2">
                                    <h6 className="font-medium text-md text-gray-700">
                                      {svcNum}. {foundSvc.title}
                                    </h6>
                                    {foundSvc.description && (
                                      <p className="text-sm text-gray-500 mt-1">
                                        {foundSvc.description}
                                      </p>
                                    )}
                                    <div className="flex items-center justify-between mt-1">
                                      <div className="text-md font-medium text-gray-700">
                                        {qty} {foundSvc.unit_of_measurement}
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
                                              ? `$${formatWithSeparator(parseFloat(cr.work_cost))}`
                                              : "—"}
                                          </span>
                                        </div>
                                        <div className="flex justify-between mb-3">
                                          <span className="text-md font-medium text-gray-700">
                                            Materials, tools and equipment
                                          </span>
                                          <span className="text-md font-medium text-gray-700">
                                            {cr.material_cost
                                              ? `$${formatWithSeparator(parseFloat(cr.material_cost))}`
                                              : "—"}
                                          </span>
                                        </div>

                                        {Array.isArray(cr.materials) && cr.materials.length > 0 && (
                                          <div className="mt-4">
                                            <table className="table-auto w-full text-sm text-gray-700">
                                              <thead>
                                                <tr className="border-b">
                                                  <th className="py-2 px-1 sm:px-3">Name</th>
                                                  <th className="py-2 px-1 sm:px-3">Price</th>
                                                  <th className="py-2 px-1 sm:px-3">Qty</th>
                                                  <th className="py-2 px-1 sm:px-3">Subtotal</th>
                                                </tr>
                                              </thead>
                                              <tbody className="divide-y divide-gray-200">
                                                {cr.materials.map((m: any, i2: number) => {
                                                  const priceVal = parseFloat(m.cost_per_unit);
                                                  const subVal = parseFloat(m.cost);
                                                  return (
                                                    <tr
                                                      key={`${m.external_id}-${i2}`}
                                                      className="align-top"
                                                    >
                                                      <td className="py-3 px-3">{m.name}</td>
                                                      <td className="py-3 px-3">
                                                        ${formatWithSeparator(priceVal)}
                                                      </td>
                                                      <td className="py-3 px-3">{m.quantity}</td>
                                                      <td className="py-3 px-3">
                                                        ${formatWithSeparator(subVal)}
                                                      </td>
                                                    </tr>
                                                  );
                                                })}
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
                      {roomObj.title} Total:
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
              ({spelledOutTotal})
            </span>
          </div>

          {/* Date of service */}
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
              <p className="text-gray-700 mt-2">No photos uploaded</p>
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