"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BreadCrumb from "@/components/ui/BreadCrumb";
import ActionIconsBar from "@/components/ui/ActionIconsBar";
import { SectionBoxTitle } from "@/components/ui/SectionBoxTitle";
import { SectionBoxSubtitle } from "@/components/ui/SectionBoxSubtitle";
import { EMERGENCY_STEPS } from "@/constants/navigation";
import { EMERGENCY_SERVICES } from "@/constants/emergency";
import { ALL_SERVICES } from "@/constants/services";

// session utils
import { getSessionItem, setSessionItem } from "@/utils/session";
// format helper
import { formatWithSeparator } from "@/utils/format";

/**
 * Builds an estimate number: "SS-ZZZZZ-YYYYMMDD-HHMM",
 * where SS is a two-letter uppercase state code, ZZZZZ is a 5-digit ZIP code,
 * and the rest is date+time.
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

  // Fallback: use a simplified regex to find "StateName 12345" at end
  const regex = /([A-Za-z]+)\s+(\d{5})$/;
  const match = fullAddr.trim().match(regex);
  if (match) {
    return { parsedState: match[1], parsedZip: match[2] };
  }
  return { parsedState: "", parsedZip: "" };
}

/**
 * Converts a numeric USD amount into words, e.g. "One thousand ...".
 * Simplified example only.
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
    const tens = Math.floor(n / 10) * 10;
    const ones = n % 10;
    if (ones === 0) return wordsMap[tens];
    return wordsMap[tens] + "-" + (wordsMap[ones] || "");
  }

  function threeDigitsToWords(n: number): string {
    const hundreds = Math.floor(n / 100);
    const remainder = n % 100;
    const hundredPart = hundreds > 0 ? wordsMap[hundreds] + " hundred" : "";
    const remainderPart = remainder ? twoDigitsToWords(remainder) : "";
    if (hundreds && remainder) {
      return hundredPart + " " + remainderPart;
    }
    return hundredPart || remainderPart || "";
  }

  const scale = ["", " thousand", " million", " billion"];
  let chunks: string[] = [];
  let temp = Math.floor(amount);
  let i = 0;

  if (temp === 0) {
    chunks.push("zero");
  }
  while (temp > 0 && i < scale.length) {
    const c = temp % 1000;
    temp = Math.floor(temp / 1000);
    if (c > 0) {
      const chunkStr = threeDigitsToWords(c).trim();
      chunks.unshift(chunkStr + scale[i]);
    }
    i++;
  }

  const integerWords = chunks.join(" ").trim() || "zero";
  const decimalStr = decimalPart < 10 ? `0${decimalPart}` : `${decimalPart}`;
  return `${integerWords} and ${decimalStr}/100 dollars`;
}

/**
 * Converts camelCase or PascalCase into a more readable format.
 */
function capitalizeAndTransform(str: string): string {
  return str
    .replace(/([A-Z])/g, " $1")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());
}

/**
 * Interface describing how selectedActivities are stored in session.
 */
interface SelectedActivities {
  [service: string]: {
    [activityKey: string]: number;
  };
}

export default function CheckoutPage() {
  const router = useRouter();

  // Load from session
  const selectedActivities = getSessionItem<SelectedActivities>("selectedActivities", {});
  const calculationResultsMap = getSessionItem<Record<string, any>>("calculationResultsMap", {});
  const fullAddress = getSessionItem<string>("fullAddress", "");
  const photos = getSessionItem<string[]>("photos", []);
  const description = getSessionItem<string>("description", "");
  const date = getSessionItem<string>("selectedTime", "No date selected");

  // Steps array (immediate steps)
  const filteredSteps = getSessionItem<{ serviceName: string; steps: any[] }[]>(
    "filteredSteps",
    []
  );

  // Fees and timeCoefficient
  const timeCoefficient = getSessionItem<number>("timeCoefficient", 1);
  const serviceFeeOnLabor = getSessionItem<number>("serviceFeeOnLabor", 0);
  const serviceFeeOnMaterials = getSessionItem<number>("serviceFeeOnMaterials", 0);

  // Attempt to parse state/zip from session, fallback to parse from fullAddress
  let userStateName = getSessionItem<string>("location_state", "NoState");
  let userZip = getSessionItem<string>("location_zip", "00000");
  if (
    (userStateName === "NoState" || userStateName.length < 2 || userZip === "00000") &&
    fullAddress
  ) {
    const { parsedState, parsedZip } = parseStateAndZipFromAddress(fullAddress);
    if (parsedState && parsedState.length >= 2 && parsedZip && parsedZip.length === 5) {
      userStateName = parsedState;
      userZip = parsedZip;
    }
  }

  // userTaxRate (e.g. 8.25 => 8.25%)
  const userTaxRate = getSessionItem<number>("userTaxRate", 0);

  // If essential data is missing, redirect
  useEffect(() => {
    if (!selectedActivities || Object.keys(selectedActivities).length === 0 || !fullAddress.trim()) {
      router.push("/emergency/estimate");
    }
  }, [selectedActivities, fullAddress, router]);

  // Store final checkout data in local state once (no infinite loop)
  const [checkoutData, setCheckoutData] = useState<{
    address: string;
    date: string;
    photos: string[];
    description: string;
    selectedActivities: SelectedActivities;
  } | null>(null);

  useEffect(() => {
    const data = {
      address: fullAddress,
      date,
      photos,
      description,
      selectedActivities,
    };
    setCheckoutData(data);
    setSessionItem("checkoutData", data);
    // Only run once on mount
  }, []);

  if (!checkoutData) {
    return <p>Loading...</p>;
  }

  // Summation logic
  function sumLabor(): number {
    let total = 0;
    for (const acts of Object.values(selectedActivities)) {
      for (const activityKey of Object.keys(acts)) {
        const cr = calculationResultsMap[activityKey];
        if (cr) {
          total += parseFloat(cr.work_cost) || 0;
        }
      }
    }
    return total;
  }

  function sumMaterials(): number {
    let total = 0;
    for (const acts of Object.values(selectedActivities)) {
      for (const activityKey of Object.keys(acts)) {
        const cr = calculationResultsMap[activityKey];
        if (cr) {
          total += parseFloat(cr.material_cost) || 0;
        }
      }
    }
    return total;
  }

  const laborSubtotal = sumLabor();
  const materialsSubtotal = sumMaterials();

  // Apply timeCoefficient to labor only
  const finalLabor = laborSubtotal * timeCoefficient;

  // sumBeforeTax = finalLabor + materialsSubtotal + fees
  const sumBeforeFees = finalLabor + materialsSubtotal;
  const sumBeforeTax = sumBeforeFees + serviceFeeOnLabor + serviceFeeOnMaterials;

  // tax from userTaxRate
  const tax = sumBeforeTax * (userTaxRate / 100);
  const grandTotal = sumBeforeTax + tax;

  // Check for discount or surcharge
  const hasSurchargeOrDiscount = timeCoefficient !== 1;
  const surchargeOrDiscount = hasSurchargeOrDiscount
    ? Math.abs(laborSubtotal * (timeCoefficient - 1))
    : 0;

  // Build final estimate number
  const estimateNumber = buildEstimateNumber(userStateName, userZip);

  // Convert final total to words
  const totalInWords = numberToWordsUSD(grandTotal);

  // Build an array => group by derived category
  interface RenderItem {
    category: string;
    activityKey: string;
    title: string;
    description?: string;
    quantity: number;
    combinedCost: number;
    breakdown: any;
  }

  function buildRenderItems(): RenderItem[] {
    const items: RenderItem[] = [];

    for (const acts of Object.values(selectedActivities)) {
      for (const [activityKey, quantity] of Object.entries(acts)) {
        const cr = calculationResultsMap[activityKey];
        if (!cr) continue;

        const found = ALL_SERVICES.find((svc) => svc.id === activityKey);
        if (!found) continue;

        const combinedCost =
          parseFloat(cr.work_cost || "0") + parseFloat(cr.material_cost || "0");

        // derive category from EMERGENCY_SERVICES
        let matchedCategoryName = "Uncategorized";
        outerLoop: for (const catKey of Object.keys(EMERGENCY_SERVICES)) {
          const catObj = EMERGENCY_SERVICES[catKey];
          if (!catObj?.services) continue;
          for (const svcName of Object.keys(catObj.services)) {
            const svcData = catObj.services[svcName];
            if (svcData.activities && svcData.activities[activityKey]) {
              matchedCategoryName = capitalizeAndTransform(catKey);
              break outerLoop;
            }
          }
        }

        items.push({
          category: matchedCategoryName,
          activityKey,
          title: found.title,
          description: found.description,
          quantity,
          combinedCost,
          breakdown: cr,
        });
      }
    }
    return items;
  }

  const renderItems = buildRenderItems();

  // group them by derived category
  const groupedByCategory: Record<string, RenderItem[]> = {};
  renderItems.forEach((item) => {
    if (!groupedByCategory[item.category]) {
      groupedByCategory[item.category] = [];
    }
    groupedByCategory[item.category].push(item);
  });

  const categoryNamesInOrder = Object.keys(groupedByCategory).sort();

  function handlePlaceOrder() {
    alert("Your emergency order has been placed!");
  }

  function handlePrint() {
    router.push("/emergency/checkout/print");
  }

  function handleShare() {
    alert("Sharing your order...");
  }

  function handleSave() {
    alert("Saving as PDF...");
  }

  return (
    <main className="min-h-screen py-24">
      <div className="container mx-auto">
        <BreadCrumb items={EMERGENCY_STEPS} />
      </div>

      <div className="container mx-auto">
        {/* Top bar */}
        <div className="flex justify-between items-center mt-8">
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

        <div className="flex items-center justify-between mt-8">
          <SectionBoxTitle>Checkout</SectionBoxTitle>
          <ActionIconsBar onPrint={handlePrint} onShare={handleShare} onSave={handleSave} />
        </div>

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

            {/* Numbered categories and their items */}
            <div className="mt-4 space-y-4">
              {categoryNamesInOrder.map((catName, i) => {
                const catIndex = i + 1;
                const items = groupedByCategory[catName];

                return (
                  <div key={catName} className="space-y-2 pb-2">
                    <h2 className="font-semibold text-xl text-gray-800">
                      {catIndex}. {catName}
                    </h2>

                    {items.map((item, j) => {
                      const itemIndex = `${catIndex}.${j + 1}`;
                      return (
                        <div key={item.activityKey} className="mt-3 ml-0 sm:ml-4 pb-3">
                          <h3 className="font-medium text-lg text-gray-800 mb-1">
                            {itemIndex}. {item.title}
                          </h3>
                          {item.description && (
                            <div className="text-sm text-gray-500 mt-1">{item.description}</div>
                          )}
                          <div className="flex justify-between items-center mt-1">
                            <div className="text-gray-700 font-medium">
                              {item.quantity}{" "}
                              {ALL_SERVICES.find((x) => x.id === item.activityKey)
                                ?.unit_of_measurement || "each"}
                            </div>
                            <span className="text-gray-700 font-medium text-lg mr-3">
                              ${formatWithSeparator(item.combinedCost)}
                            </span>
                          </div>

                          {/* cost breakdown */}
                          <div className="mt-3 p-4 bg-gray-50 border rounded">
                            <div className="flex justify-between mb-3">
                              <span className="text-md font-medium text-gray-800">Labor</span>
                              <span className="text-md font-medium text-gray-700">
                                {item.breakdown.work_cost
                                  ? `$${formatWithSeparator(parseFloat(item.breakdown.work_cost))}`
                                  : "—"}
                              </span>
                            </div>
                            <div className="flex justify-between mb-3">
                              <span className="text-md font-medium text-gray-800">
                                Materials, tools &amp; equipment
                              </span>
                              <span className="text-md font-medium text-gray-700">
                                {item.breakdown.material_cost
                                  ? `$${formatWithSeparator(
                                      parseFloat(item.breakdown.material_cost)
                                    )}`
                                  : "—"}
                              </span>
                            </div>
                            {Array.isArray(item.breakdown.materials) &&
                              item.breakdown.materials.length > 0 && (
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
                                      {item.breakdown.materials.map((m: any, idx2: number) => (
                                        <tr key={`${m.external_id}-${idx2}`} className="align-top">
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

            {/* Summary: labor, materials, timeCoefficient, fees, tax, total */}
            <div className="pt-4 mt-4 border-t">
              <div className="flex justify-between mb-2">
                <span className="text-lg text-gray-700 font-semibold">Labor</span>
                <span className="text-lg text-gray-700 font-semibold">
                  ${formatWithSeparator(finalLabor)}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-lg text-gray-700 font-semibold">
                  Materials, tools &amp; equipment
                </span>
                <span className="text-lg text-gray-700 font-semibold">
                  ${formatWithSeparator(materialsSubtotal)}
                </span>
              </div>

              {hasSurchargeOrDiscount && (
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">
                    {timeCoefficient > 1 ? "Surcharge (urgency)" : "Discount (date selection)"}
                  </span>
                  <span
                    className={`font-semibold text-lg ${
                      timeCoefficient > 1 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {timeCoefficient > 1 ? "+" : "-"}$
                    {formatWithSeparator(surchargeOrDiscount)}
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
                <span className="text-gray-700">Delivery &amp; Processing (10% on materials)</span>
                <span className="text-lg text-gray-700 font-semibold">
                  ${formatWithSeparator(serviceFeeOnMaterials)}
                </span>
              </div>

              <div className="flex justify-between mb-2 mt-4">
                <span className="font-semibold text-xl text-gray-800">Subtotal</span>
                <span className="font-semibold text-xl text-gray-800">
                  ${formatWithSeparator(sumBeforeTax)}
                </span>
              </div>

              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Sales tax ({userTaxRate}%)</span>
                <span>${formatWithSeparator(tax)}</span>
              </div>

              <div className="flex justify-between text-2xl font-semibold mt-4">
                <span>Total</span>
                <span>${formatWithSeparator(grandTotal)}</span>
              </div>
              <p className="text-sm text-gray-500 text-right mt-1">
                ({totalInWords})
              </p>
            </div>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* 2) Date of Service */}
          <div>
            <SectionBoxSubtitle>Date of Service</SectionBoxSubtitle>
            <p className="text-gray-800">{date || "No date selected"}</p>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* 3) Problem Description */}
          <div>
            <SectionBoxSubtitle>Problem Description</SectionBoxSubtitle>
            <p className="text-gray-700">{description || "No details provided"}</p>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* 4) Address */}
          <div>
            <SectionBoxSubtitle>Address</SectionBoxSubtitle>
            <p className="text-gray-800">{fullAddress || "No address provided"}</p>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* 5) Photos */}
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

          <hr className="my-6 border-gray-200" />

          {/* 6) Steps (immediate steps) */}
          <div>
            <SectionBoxSubtitle>Emergency Steps</SectionBoxSubtitle>
            {filteredSteps.length === 0 ? (
              <p className="text-gray-500 mt-4">No steps available.</p>
            ) : (
              <div className="space-y-6 mt-4">
                {filteredSteps.map((svc) => (
                  <div key={svc.serviceName} className="bg-white">
                    <h3 className="text-2xl font-semibold text-gray-800">
                      {svc.serviceName}
                    </h3>
                    <div className="mt-4 space-y-4">
                      {svc.steps.map((step) => (
                        <div key={step.step_number} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="text-lg font-medium">{step.step_number}.</h4>
                            <h4 className="text-lg font-medium">{step.title}</h4>
                          </div>
                          <p className="text-gray-600">{step.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}