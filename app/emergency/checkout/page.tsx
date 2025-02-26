"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BreadCrumb from "@/components/ui/BreadCrumb";
import { SectionBoxTitle } from "@/components/ui/SectionBoxTitle";
import { SectionBoxSubtitle } from "@/components/ui/SectionBoxSubtitle";
import PlaceOrderButton from "@/components/ui/PlaceOrderButton";
import { EMERGENCY_STEPS } from "@/constants/navigation";
import { EMERGENCY_SERVICES } from "@/constants/emergency";
import { ALL_SERVICES } from "@/constants/services";
import { getSessionItem, setSessionItem } from "@/utils/session";
import { formatWithSeparator } from "@/utils/format";
import { Printer, Share2, Save } from "lucide-react";
import { usePhotos } from "@/context/PhotosContext";

/**
 * Inserts spaces before uppercase letters and capitalizes the string.
 * e.g. "burstPipesRepair" => "Burst Pipes Repair"
 */
function capitalizeAndTransform(text: string): string {
  return text
    .replace(/([A-Z])/g, " $1")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}

/**
 * Builds a temporary reference code, e.g. "NY-10006-20250219-1405".
 */
function buildEstimateNumber(stateCode: string, zip: string): string {
  let stateZipBlock = "??-00000";
  if (stateCode && stateCode.length >= 2 && zip && zip.length === 5) {
    const st = stateCode.slice(0, 2).toUpperCase();
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
 * Converts a numeric dollar amount into spelled-out English text (simplified).
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

  function twoDigits(n: number): string {
    if (n <= 20) return wordsMap[n] || "";
    const tens = Math.floor(n / 10) * 10;
    const ones = n % 10;
    if (ones === 0) return wordsMap[tens];
    return wordsMap[tens] + "-" + (wordsMap[ones] || "");
  }

  function threeDigits(n: number): string {
    const hundreds = Math.floor(n / 100);
    const remainder = n % 100;
    const hundredPart = hundreds ? wordsMap[hundreds] + " hundred" : "";
    const remainderPart = remainder ? twoDigits(remainder) : "";
    if (hundreds && remainder) {
      return `${hundredPart} ${remainderPart}`.trim();
    }
    return hundredPart || remainderPart || "";
  }

  const parts: string[] = [];
  const scaleUnits = ["", " thousand", " million"];
  let tmp = integerPart;
  let i = 0;

  if (tmp === 0) parts.push("zero");

  while (tmp > 0 && i < scaleUnits.length) {
    const chunk = tmp % 1000;
    tmp = Math.floor(tmp / 1000);
    if (chunk > 0) {
      const chunkStr = threeDigits(chunk).trim();
      parts.unshift(`${chunkStr}${scaleUnits[i]}`);
    }
    i++;
  }

  const mainStr = parts.join(" ").trim() || "zero";
  const decimalStr = decimalPart < 10 ? `0${decimalPart}` : String(decimalPart);
  return `${mainStr} and ${decimalStr}/100 dollars`;
}

/**
 * Button row with printer/share/save icons (optional).
 */
interface ActionIconsBarProps {
  onPrint?: () => void;
}

function ActionIconsBar({ onPrint }: ActionIconsBarProps) {
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
}

export default function EmergencyCheckoutPage() {
  const router = useRouter();

  // Load data from session
  const selectedActivities = getSessionItem<
    Record<string, Record<string, number>>
  >("selectedActivities", {});
  const calculationResultsMap = getSessionItem<Record<string, any>>(
    "calculationResultsMap",
    {}
  );
  const fullAddress = getSessionItem<string>("fullAddress", "");
  const { photos } = usePhotos();
  const description = getSessionItem<string>("description", "");
  const selectedTime = getSessionItem<string>("selectedTime", "No date selected");

  const timeCoefficient = getSessionItem<number>("timeCoefficient", 1);
  const serviceFeeOnLabor = getSessionItem<number>("serviceFeeOnLabor", 0);
  const serviceFeeOnMaterials = getSessionItem<number>("serviceFeeOnMaterials", 0);
  const userTaxRate = getSessionItem<number>("userTaxRate", 0);

  const userState = getSessionItem<string>("stateName", "");
  const userZip = getSessionItem<string>("zip", "");

  // Redirect if missing data
  useEffect(() => {
    if (
      !selectedActivities ||
      Object.keys(selectedActivities).length === 0 ||
      !fullAddress.trim()
    ) {
      router.push("/emergency/estimate");
    }
  }, [selectedActivities, fullAddress, router]);

  // Calculate labor/materials
  function getLaborSubtotal(): number {
    let total = 0;
    for (const catObj of Object.values(selectedActivities)) {
      for (const actKey of Object.keys(catObj)) {
        const calcRes = calculationResultsMap[actKey];
        if (calcRes?.work_cost) {
          total += parseFloat(calcRes.work_cost);
        }
      }
    }
    return total;
  }

  function getMaterialsSubtotal(): number {
    let total = 0;
    for (const catObj of Object.values(selectedActivities)) {
      for (const actKey of Object.keys(catObj)) {
        const calcRes = calculationResultsMap[actKey];
        if (calcRes?.material_cost) {
          total += parseFloat(calcRes.material_cost);
        }
      }
    }
    return total;
  }

  const laborSubtotal = getLaborSubtotal();
  const materialsSubtotal = getMaterialsSubtotal();
  const finalLabor = laborSubtotal * timeCoefficient;
  const sumBeforeTax =
    finalLabor + materialsSubtotal + serviceFeeOnLabor + serviceFeeOnMaterials;
  const taxAmount = sumBeforeTax * (userTaxRate / 100);
  const finalTotal = sumBeforeTax + taxAmount;

  // Build data for the PlaceOrderButton
  function buildWorksData() {
    const result: Array<{
      type: string;
      code: string;
      unitOfMeasurement: string;
      quantity: number;
      laborCost: number;
      materialsCost: number;
      serviceFeeOnLabor?: number;
      serviceFeeOnMaterials?: number;
      total: number;
      paymentType?: string;
      paymentCoefficient?: number;
      materials?: Array<{
        external_id: string;
        quantity: number;
        costPerUnit: number;
        total: number;
      }>;
    }> = [];

    for (const catKey of Object.keys(selectedActivities)) {
      const acts = selectedActivities[catKey];
      for (const [activityKey, qty] of Object.entries(acts)) {
        const calcRes = calculationResultsMap[activityKey];
        if (!calcRes) continue;

        const found = ALL_SERVICES.find((x) => x.id === activityKey);
        const laborVal = parseFloat(calcRes.work_cost || "0");
        const matVal = parseFloat(calcRes.material_cost || "0");

        let mats: Array<{
          external_id: string;
          quantity: number;
          costPerUnit: number;
          total: number;
        }> = [];
        if (Array.isArray(calcRes.materials)) {
          mats = calcRes.materials.map((m: any) => ({
            external_id: m.external_id,
            quantity: m.quantity,
            costPerUnit: parseFloat(m.cost_per_unit) || 0,
            total: parseFloat(m.cost) || 0,
          }));
        }

        result.push({
          type: "emergency",
          code: activityKey.replace(/-/g, "."),
          unitOfMeasurement: found?.unit_of_measurement || "units",
          quantity: qty,
          laborCost: laborVal,
          materialsCost: matVal,
          total: laborVal + matVal,
          materials: mats,
        });
      }
    }
    return result;
  }

  const worksData = buildWorksData();

  const orderData = {
    zipcode: userZip || "",
    address: fullAddress.trim(),
    description: description || "",
    selectedTime: selectedTime || "",
    timeCoefficient,
    laborSubtotal,
    sumBeforeTax,
    finalTotal,
    taxRate: userTaxRate,
    taxAmount,
    worksData,
    serviceFeeOnLabor,
    serviceFeeOnMaterials,
    paymentType: "emergency",
    paymentCoefficient: 1,
  };

  // Temporary code + spelled-out total
  const estimateNumber = buildEstimateNumber(userState, userZip);
  const totalInWords = numberToWordsUSD(finalTotal);

  // Handlers
  function handleOrderSuccess() {
    router.push("/thank-you");
  }
  function handlePrint() {
    router.push("/emergency/checkout/print");
  }
  function handleBack() {
    router.back();
  }

  // Render items grouped by category
  interface RenderItem {
    category: string;
    activityKey: string;
    title: string;
    description?: string;
    quantity: number;
    cost: number;
    breakdown: any;
  }

  function buildDisplayItems() {
    const arr: RenderItem[] = [];
    for (const catKey of Object.keys(selectedActivities)) {
      const catActs = selectedActivities[catKey];
      for (const [actKey, qty] of Object.entries(catActs)) {
        const calcRes = calculationResultsMap[actKey];
        if (!calcRes) continue;

        const foundSvc = ALL_SERVICES.find((x) => x.id === actKey);
        // Sum labor + materials
        const combined =
          (parseFloat(calcRes.work_cost || "0") || 0) +
          (parseFloat(calcRes.material_cost || "0") || 0);

        // Always transform the category name
        let catDisplay = capitalizeAndTransform(catKey);

        arr.push({
          category: catDisplay,
          activityKey: actKey,
          title: foundSvc?.title || actKey,
          description: foundSvc?.description,
          quantity: qty,
          cost: combined,
          breakdown: calcRes,
        });
      }
    }
    return arr;
  }

  const displayItems = buildDisplayItems();
  const groupedByCategory: Record<string, RenderItem[]> = {};
  displayItems.forEach((it) => {
    if (!groupedByCategory[it.category]) {
      groupedByCategory[it.category] = [];
    }
    groupedByCategory[it.category].push(it);
  });
  const sortedCatNames = Object.keys(groupedByCategory).sort();

  return (
    <main className="min-h-screen py-24">
      <div className="container mx-auto">
        <BreadCrumb items={EMERGENCY_STEPS} />
      </div>

      <div className="container mx-auto">
        {/* Top row */}
        <div className="flex justify-between items-center mt-8">
          <span className="text-blue-600 cursor-pointer" onClick={handleBack}>
            ← Back
          </span>

          <PlaceOrderButton
            photos={photos}
            orderData={orderData}
            onOrderSuccess={handleOrderSuccess}
          />
        </div>

        {/* Title + Print */}
        <div className="flex items-center justify-between mt-8">
          <SectionBoxTitle>Checkout</SectionBoxTitle>
          <ActionIconsBar onPrint={handlePrint} />
        </div>

        {/* Summary container */}
        <div className="bg-white border border-gray-300 mt-4 p-4 sm:p-6 rounded-lg space-y-6">
          {/* Estimate info */}
          <div>
            <SectionBoxSubtitle>
              <div>Estimate for Emergency Services</div>
              <div className="my-2 text-sm text-gray-500">({estimateNumber})</div>
            </SectionBoxSubtitle>
            <p className="text-xs text-gray-400 -mt-2 ml-1">
              *This number is temporary and will be replaced with a permanent
              order number after confirmation.
            </p>

            {/* Categories */}
            <div className="mt-4 space-y-4">
              {sortedCatNames.map((catName, i) => {
                const catIndex = i + 1;
                const catItems = groupedByCategory[catName];
                return (
                  <div key={catName} className="space-y-2 pb-2">
                    <h2 className="font-semibold text-xl text-gray-800">
                      {catIndex}. {catName}
                    </h2>

                    {catItems.map((it, j) => {
                      const itemIndex = `${catIndex}.${j + 1}`;
                      return (
                        <div
                          key={it.activityKey}
                          className="mt-3 ml-0 sm:ml-4 pb-3"
                        >
                          <h3 className="font-medium text-lg text-gray-800 mb-1">
                            {itemIndex}. {it.title}
                          </h3>
                          {it.description && (
                            <div className="text-sm text-gray-500 mt-1">
                              {it.description}
                            </div>
                          )}
                          <div className="flex justify-between items-center mt-1">
                            <div className="text-gray-700 font-medium">
                              {it.quantity}{" "}
                              {ALL_SERVICES.find((x) => x.id === it.activityKey)
                                ?.unit_of_measurement || "each"}
                            </div>
                            <span className="text-gray-700 font-medium text-lg mr-3">
                              ${formatWithSeparator(it.cost)}
                            </span>
                          </div>

                          {/* Cost breakdown */}
                          <div className="mt-3 p-2 sm:p-4 bg-gray-50 border rounded">
                            <div className="flex justify-between mb-3">
                              <span className="text-md font-medium text-gray-800">
                                Labor
                              </span>
                              <span className="text-md font-medium text-gray-700">
                                {it.breakdown.work_cost
                                  ? `$${formatWithSeparator(
                                      parseFloat(it.breakdown.work_cost)
                                    )}`
                                  : "—"}
                              </span>
                            </div>
                            <div className="flex justify-between mb-3">
                              <span className="text-md font-medium text-gray-800">
                                Materials, tools &amp; equipment
                              </span>
                              <span className="text-md font-medium text-gray-700">
                                {it.breakdown.material_cost
                                  ? `$${formatWithSeparator(
                                      parseFloat(it.breakdown.material_cost)
                                    )}`
                                  : "—"}
                              </span>
                            </div>
                            {Array.isArray(it.breakdown.materials) &&
                              it.breakdown.materials.length > 0 && (
                                <div className="mt-2">
                                  <table className="table-auto w-full text-sm text-left text-gray-700">
                                    <thead>
                                      <tr className="border-b">
                                        <th className="py-2 px-1">Name</th>
                                        <th className="py-2 px-1">Price</th>
                                        <th className="py-2 px-1">Qty</th>
                                        <th className="py-2 px-1">Subtotal</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                      {it.breakdown.materials.map(
                                        (m: any, idx2: number) => (
                                          <tr
                                            key={`${m.external_id}-${idx2}`}
                                            className="align-top"
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
                                            <td className="py-2 px-3">
                                              {m.quantity}
                                            </td>
                                            <td className="py-2 px-3">
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
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="pt-4 mt-4 border-t">
              <div className="flex justify-between mb-2">
                <span className="text-lg text-gray-700 font-semibold">Labor</span>
                <span className="text-lg text-gray-700 font-semibold">
                  ${formatWithSeparator(finalLabor)}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-lg text-gray-700 font-semibold">
                  Materials, tools & equipment
                </span>
                <span className="text-lg text-gray-700 font-semibold">
                  ${formatWithSeparator(materialsSubtotal)}
                </span>
              </div>

              {timeCoefficient !== 1 && (
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">
                    {timeCoefficient > 1
                      ? "Surcharge (urgency)"
                      : "Discount (date selection)"}
                  </span>
                  <span
                    className={`font-semibold text-lg ${
                      timeCoefficient > 1 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {timeCoefficient > 1 ? "+" : "-"}$
                    {formatWithSeparator(
                      Math.abs(laborSubtotal * (timeCoefficient - 1))
                    )}
                  </span>
                </div>
              )}

              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Service Fee (20% on labor)</span>
                <span className="text-lg text-gray-700 font-semibold">
                  ${formatWithSeparator(serviceFeeOnLabor)}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">
                  Delivery &amp; Processing (10% on materials)
                </span>
                <span className="text-lg text-gray-700 font-semibold">
                  ${formatWithSeparator(serviceFeeOnMaterials)}
                </span>
              </div>

              <div className="flex justify-between mb-2 mt-4">
                <span className="font-semibold text-xl text-gray-800">
                  Subtotal
                </span>
                <span className="font-semibold text-xl text-gray-800">
                  ${formatWithSeparator(sumBeforeTax)}
                </span>
              </div>

              <div className="flex justify-between mb-2">
                <span className="text-gray-600">
                  Sales tax ({userTaxRate}%)
                </span>
                <span>${formatWithSeparator(taxAmount)}</span>
              </div>

              <div className="flex justify-between text-2xl font-semibold mt-4">
                <span>Total</span>
                <span>${formatWithSeparator(finalTotal)}</span>
              </div>
              <p className="text-sm text-gray-500 text-right mt-1">
                ({totalInWords})
              </p>
            </div>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* Date of Service */}
          <div>
            <SectionBoxSubtitle>Date of Service</SectionBoxSubtitle>
            <p className="text-gray-800">
              {selectedTime || "No date selected"}
            </p>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* Problem Description */}
          <div>
            <SectionBoxSubtitle>Problem Description</SectionBoxSubtitle>
            <p className="text-gray-700">
              {description || "No details provided"}
            </p>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* Address */}
          <div>
            <SectionBoxSubtitle>Address</SectionBoxSubtitle>
            <p className="text-gray-800">{fullAddress || "No address provided"}</p>
          </div>

          <hr className="my-6 border-gray-200" />

          <div>
            <SectionBoxSubtitle>Uploaded Photos</SectionBoxSubtitle>
            <div className="grid grid-cols-6 gap-2">
              {photos.map((ph, i) => (
                <img
                  key={i}
                  src={ph}
                  alt={`Photo ${i + 1}`}
                  className="w-full h-24 object-cover rounded border border-gray-300"
                />
              ))}
            </div>
            {photos.length === 0 && (
              <p className="text-gray-500 mt-2">No photos uploaded</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}