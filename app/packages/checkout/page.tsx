"use client";

export const dynamic = "force-dynamic";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import BreadCrumb from "@/components/ui/BreadCrumb";
import { SectionBoxTitle } from "@/components/ui/SectionBoxTitle";
import { SectionBoxSubtitle } from "@/components/ui/SectionBoxSubtitle";
import { Printer, Share2, Save } from "lucide-react";

import { PACKAGES_STEPS } from "@/constants/navigation";
import { PACKAGES } from "@/constants/packages";
import { ALL_SERVICES } from "@/constants/services";
import { ALL_CATEGORIES } from "@/constants/categories";
import { getSessionItem } from "@/utils/session";
import PlaceOrderButton from "@/components/ui/PlaceOrderButton";

/**
 * Props for the print/share/save button bar.
 */
interface ActionIconsBarProps {
  onPrint?: () => void;
}

/**
 * A small button with three icons (Printer, Share, Save).
 */
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

/**
 * Formats a number with commas and two decimals.
 */
function formatWithSeparator(n: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

/**
 * Converts a numeric value into a simplified English phrase,
 * e.g. 123.45 => "one hundred twenty-three and 45/100 dollars".
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
    const hundredStr = hundreds ? wordsMap[hundreds] + " hundred" : "";
    const remainderStr = remainder ? twoDigits(remainder) : "";
    if (hundreds && remainder) {
      return `${hundredStr} ${remainderStr}`.trim();
    }
    return hundredStr || remainderStr || "";
  }

  const parts: string[] = [];
  const thousandUnits = ["", " thousand", " million", " billion"];
  let tmp = integerPart;
  let i = 0;

  if (tmp === 0) {
    parts.push("zero");
  }

  while (tmp > 0 && i < thousandUnits.length) {
    const chunk = tmp % 1000;
    if (chunk > 0) {
      parts.unshift(`${threeDigits(chunk).trim()}${thousandUnits[i]}`);
    }
    tmp = Math.floor(tmp / 1000);
    i++;
  }

  const mainStr = parts.join(" ").trim() || "zero";
  const decimalStr = decimalPart < 10 ? `0${decimalPart}` : String(decimalPart);

  return `${mainStr} and ${decimalStr}/100 dollars`;
}

/**
 * Builds a temporary reference code like "NY-10001-20250123-1450".
 */
function buildOrderReference(stateCode: string, zip: string): string {
  const sc = stateCode.trim().slice(0, 2).toUpperCase() || "??";
  const z = zip || "00000";

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mi = String(now.getMinutes()).padStart(2, "0");

  return `${sc}-${z}-${yyyy}${mm}${dd}-${hh}${mi}`;
}

/**
 * Converts houseType codes to human-readable labels.
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

export default function CheckoutPage() {
  const router = useRouter();

  // Package ID
  const storedPackageId = getSessionItem<string | null>("packages_currentPackageId", null);
  const chosenPackage = PACKAGES.find((p) => p.id === storedPackageId) || null;

  // Payment option
  const paymentCoefficient = getSessionItem<number>("packages_timeCoefficient", 1);
  const selectedPaymentOption = getSessionItem<string | null>("packages_selectedTime", null);

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

  // Summaries from the estimate
  const laborSubtotal = getSessionItem<number>("packages_laborSubtotal", 0);
  const materialsSubtotal = getSessionItem<number>("packages_materialsSubtotal", 0);
  const serviceFeeOnLabor = getSessionItem<number>("serviceFeeOnLabor", 0);
  const serviceFeeOnMaterials = getSessionItem<number>("serviceFeeOnMaterials", 0);
  const sumBeforeTax = getSessionItem<number>("packages_sumBeforeTax", 0);
  const taxRatePercent = getSessionItem<number>("packages_taxRatePercent", 0);
  const taxAmount = getSessionItem<number>("packages_taxAmount", 0);
  const finalTotal = getSessionItem<number>("packages_estimateFinalTotal", 0);

  // Selected services
  const selectedServicesData = getSessionItem("packages_selectedServices", {
    indoor: {},
    outdoor: {},
  } as Record<string, Record<string, number>>);

  // Merge indoor + outdoor
  const mergedServices: Record<string, number> = {
    ...selectedServicesData.indoor,
    ...selectedServicesData.outdoor,
  };

  // Calculation results
  const calculationResultsMap = getSessionItem<Record<string, any>>(
    "packages_calculationResultsMap",
    {}
  );

  // Redirect if no services or address
  useEffect(() => {
    const anyServices = Object.keys(mergedServices).length > 0;
    if (!anyServices || !houseInfo.addressLine) {
      if (storedPackageId) {
        router.push(`/packages/estimate?packageId=${storedPackageId}`);
      } else {
        router.push("/packages/estimate");
      }
    }
  }, [mergedServices, houseInfo, storedPackageId, router]);

  // Build full address
  let constructedAddress = "";
  if (houseInfo.city) constructedAddress += houseInfo.city;
  if (houseInfo.state) {
    if (constructedAddress) constructedAddress += ", ";
    constructedAddress += houseInfo.state;
  }
  if (houseInfo.zip) {
    if (constructedAddress) constructedAddress += " ";
    constructedAddress += houseInfo.zip;
  }
  if (houseInfo.country) {
    if (constructedAddress) constructedAddress += ", ";
    constructedAddress += houseInfo.country;
  }

  // Generate a reference code
  const referenceNumber = buildOrderReference(houseInfo.state || "", houseInfo.zip || "");

  // Possibly stored user photos
  const photos: string[] = getSessionItem<string[]>("photos", []);

  /**
   * Builds the "works" array that will be posted to the server.
   */
  function buildWorksData() {
    const worksArray: Array<{
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
        name: string;
        quantity: number;
        costPerUnit: number;
        total: number;
      }>;
    }> = [];

    for (const svcId of Object.keys(mergedServices)) {
      const qty = mergedServices[svcId];
      const breakdown = calculationResultsMap[svcId];
      if (!breakdown) continue;

      const laborVal = parseFloat(breakdown.work_cost || "0");
      const matVal = parseFloat(breakdown.material_cost || "0");

      const foundSvc = ALL_SERVICES.find((s) => s.id === svcId);
      const unit = foundSvc?.unit_of_measurement || "units";

      let materialsDetail: Array<{
        external_id: string;
        name: string;
        quantity: number;
        costPerUnit: number;
        total: number;
      }> = [];

      if (Array.isArray(breakdown.materials)) {
        materialsDetail = breakdown.materials.map((m: any) => ({
          external_id: m.external_id,
          name: m.name || "",
          quantity: m.quantity,
          costPerUnit: parseFloat(m.cost_per_unit),
          total: parseFloat(m.cost),
        }));
      }

      worksArray.push({
        type: "packages",
        code: svcId.replace(/-/g, "."),
        unitOfMeasurement: unit,
        quantity: qty,
        laborCost: laborVal,
        materialsCost: matVal,
        total: laborVal + matVal,
        paymentType: "",
        paymentCoefficient: 1,
        materials: materialsDetail,
      });
    }
    return worksArray;
  }

  /**
   * Called after the order is successfully saved.
   * Clears session keys and redirects to /thank-you.
   */
  function onOrderSuccess() {
    sessionStorage.removeItem("packages_currentPackageId");
    sessionStorage.removeItem("packages_timeCoefficient");
    sessionStorage.removeItem("packages_selectedTime");
    sessionStorage.removeItem("packages_houseInfo");
    sessionStorage.removeItem("packages_selectedServices");
    sessionStorage.removeItem("packages_calculationResultsMap");
    sessionStorage.removeItem("packages_laborSubtotal");
    sessionStorage.removeItem("packages_materialsSubtotal");
    sessionStorage.removeItem("packages_sumBeforeTax");
    sessionStorage.removeItem("packages_taxRatePercent");
    sessionStorage.removeItem("packages_taxAmount");
    sessionStorage.removeItem("packages_estimateFinalTotal");

    router.push("/thank-you");
  }

  /**
   * The final data structure for posting the order.
   */
  const orderData = {
    zipcode: houseInfo.zip || "",
    address: constructedAddress.trim() || "",
    description: chosenPackage ? chosenPackage.title : "N/A",
    selectedTime: chosenPackage ? chosenPackage.title : "",
    timeCoefficient: paymentCoefficient,
    laborSubtotal,
    sumBeforeTax,
    finalTotal,
    taxRate: taxRatePercent,
    taxAmount,
    worksData: buildWorksData(),
    serviceFeeOnLabor,
    serviceFeeOnMaterials,
    paymentType: chosenPackage ? chosenPackage.title : "",
    paymentCoefficient,
  };

  // Modify breadcrumb if packageId is known
  const modifiedCrumbs = PACKAGES_STEPS.map((step) => {
    if (!storedPackageId) return step;
    if (step.href.startsWith("/packages") && !step.href.includes("?")) {
      return { ...step, href: `${step.href}?packageId=${storedPackageId}` };
    }
    return step;
  });

  // Format final total in words
  const finalTotalWords = numberToWordsUSD(finalTotal);

  // Print handler
  function handlePrint() {
    router.push("/packages/checkout/print");
  }

  // Go back
  function handleGoBack() {
    if (storedPackageId) {
      router.push(`/packages/estimate?packageId=${storedPackageId}`);
    } else {
      router.push("/packages/estimate");
    }
  }

  // Optional payment schedule
  function renderPaymentSchedule() {
    if (!selectedPaymentOption) return null;

    if (selectedPaymentOption === "100% Prepayment") {
      return (
        <div className="mt-4">
          <h4 className="text-lg font-semibold text-gray-800">Payment Schedule</h4>
          <p className="text-sm text-gray-600 mt-2">
            You pay the entire total of{" "}
            <span className="font-medium text-blue-600">
              ${formatWithSeparator(finalTotal)}
            </span>{" "}
            once (upfront).
          </p>
        </div>
      );
    }
    if (selectedPaymentOption === "Monthly") {
      const monthlyPay = finalTotal / 12;
      return (
        <div className="mt-4">
          <h4 className="text-lg font-semibold text-gray-800">
            Payment Schedule (Monthly)
          </h4>
          <p className="text-sm text-gray-600 mt-2">
            You will pay{" "}
            <span className="font-medium text-blue-600">
              ${formatWithSeparator(monthlyPay)}
            </span>{" "}
            monthly for 12 months.
          </p>
        </div>
      );
    }
    if (selectedPaymentOption === "Quarterly") {
      const quarterlyPay = finalTotal / 4;
      return (
        <div className="mt-4">
          <h4 className="text-lg font-semibold text-gray-800">
            Payment Schedule (Quarterly)
          </h4>
          <p className="text-sm text-gray-600 mt-2">
            You will pay{" "}
            <span className="font-medium text-blue-600">
              ${formatWithSeparator(quarterlyPay)}
            </span>{" "}
            every 3 months (4 total payments).
          </p>
        </div>
      );
    }
    return null;
  }

  // Build a grouped summary for display
  const itemsArr = Object.keys(mergedServices).map((svcId) => ({
    svcId,
    breakdown: calculationResultsMap[svcId] || null,
  }));
  const summaryBySection: Record<string, Record<string, typeof itemsArr>> = {};

  itemsArr.forEach((item) => {
    const catId = item.svcId.split("-").slice(0, 2).join("-");
    const catObj = ALL_CATEGORIES.find((cat) => cat.id === catId);
    if (!catObj) return;
    const sectionName = catObj.section;

    if (!summaryBySection[sectionName]) {
      summaryBySection[sectionName] = {};
    }
    if (!summaryBySection[sectionName][catId]) {
      summaryBySection[sectionName][catId] = [];
    }
    summaryBySection[sectionName][catId].push(item);
  });

  return (
    <main className="min-h-screen py-24">
      <div className="container mx-auto">
        <BreadCrumb items={modifiedCrumbs} />
      </div>

      <div className="container mx-auto">
        {/* Top row */}
        <div className="flex justify-between items-center mt-8">
          <button className="text-blue-600 hover:underline" onClick={handleGoBack}>
            ← Back to Estimate
          </button>

          <PlaceOrderButton photos={photos} orderData={orderData} onOrderSuccess={onOrderSuccess} />
        </div>

        <div className="flex items-center justify-between mt-8">
          <SectionBoxTitle>Checkout</SectionBoxTitle>
          <ActionIconsBar onPrint={handlePrint} />
        </div>

        <div className="bg-white border border-gray-300 mt-8 p-4 sm:p-6 rounded-lg space-y-6">
          <SectionBoxSubtitle>
            <div>
              Estimate for {chosenPackage ? chosenPackage.title : "Unknown Package"}
            </div>
            <div className="text-sm text-gray-500">({referenceNumber})</div>
          </SectionBoxSubtitle>
          <p className="text-xs text-gray-400 ml-1">
            *This number is temporary and will be replaced with a permanent
            order number after confirmation.
          </p>

          {/* Cost breakdown */}
          <div className="space-y-6 mt-4">
            {Object.keys(summaryBySection).length === 0 ? (
              <p className="text-gray-500">No services selected.</p>
            ) : (
              Object.entries(summaryBySection).map(([sectionName, cats], secIdx) => {
                const secNum = secIdx + 1;
                return (
                  <div key={sectionName} className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {secNum}. {sectionName}
                    </h3>
                    {Object.entries(cats).map(([catId, arr], catIdx) => {
                      const catNum = `${secNum}.${catIdx + 1}`;
                      const catObj = ALL_CATEGORIES.find((c) => c.id === catId);
                      const catName = catObj ? catObj.title : catId;

                      return (
                        <div key={catId} className="ml-0 sm:ml-4 space-y-4">
                          <h4 className="text-lg font-semibold text-gray-700">
                            {catNum}. {catName}
                          </h4>
                          {arr.map((svcItem, idxSvc) => {
                            const svcNum = `${catNum}.${idxSvc + 1}`;
                            const qty = mergedServices[svcItem.svcId] || 1;
                            const breakdown = svcItem.breakdown;
                            const laborVal = parseFloat(breakdown?.work_cost || "0");
                            const matVal = parseFloat(breakdown?.material_cost || "0");
                            const totalCost = laborVal + matVal;

                            const foundSvc = ALL_SERVICES.find((s) => s.id === svcItem.svcId);
                            const svcTitle = foundSvc ? foundSvc.title : svcItem.svcId;
                            const svcDesc = foundSvc?.description;
                            const svcUnit = foundSvc?.unit_of_measurement || "units";

                            return (
                              <div
                                key={svcItem.svcId}
                                className="border-b last:border-b-0 pb-3 mb-3 last:mb-0 last:pb-0"
                              >
                                <h5 className="font-medium text-md text-gray-800 mb-1">
                                  {svcNum}. {svcTitle}
                                </h5>
                                {svcDesc && (
                                  <p className="text-sm text-gray-500">{svcDesc}</p>
                                )}
                                <div className="mt-2 flex justify-between items-center">
                                  <div className="text-md font-medium text-gray-700">
                                    {qty} {svcUnit}
                                  </div>
                                  <div className="text-md font-medium text-gray-800 mr-4">
                                    ${formatWithSeparator(totalCost)}
                                  </div>
                                </div>

                                {breakdown && (
                                  <div className="mt-2 p-2 sm:p-4 bg-gray-50 border rounded">
                                    <div className="flex justify-between mb-2">
                                      <span className="text-sm font-medium text-gray-700">
                                        Labor
                                      </span>
                                      <span className="text-sm font-medium text-gray-700">
                                        ${formatWithSeparator(laborVal)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                      <span className="text-sm font-medium text-gray-700">
                                        Materials, tools &amp; equipment
                                      </span>
                                      <span className="text-sm font-medium text-gray-700">
                                        ${formatWithSeparator(matVal)}
                                      </span>
                                    </div>

                                    {Array.isArray(breakdown.materials) &&
                                      breakdown.materials.length > 0 && (
                                        <div className="mt-2">
                                          <table className="table-auto w-full text-sm text-gray-700">
                                            <thead>
                                              <tr className="border-b">
                                                <th className="py-2 px-1 text-left">Name</th>
                                                <th className="py-2 px-1 text-left">Price</th>
                                                <th className="py-2 px-1 text-left">Qty</th>
                                                <th className="py-2 px-1 text-left">Subtotal</th>
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                              {breakdown.materials.map(
                                                (m: any, i2: number) => (
                                                  <tr key={`${m.external_id}-${i2}`}>
                                                    <td className="py-3 px-1">
                                                      {m.name}
                                                    </td>
                                                    <td className="py-3 px-1">
                                                      $
                                                      {formatWithSeparator(
                                                        parseFloat(m.cost_per_unit)
                                                      )}
                                                    </td>
                                                    <td className="py-3 px-1">
                                                      {m.quantity}
                                                    </td>
                                                    <td className="py-3 px-1">
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
              })
            )}
          </div>

          {/* Overall summary */}
          <div className="pt-4 mt-4 border-t border-gray-200">
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
                Materials total:
              </span>
              <span className="font-semibold text-lg text-gray-600">
                ${formatWithSeparator(materialsSubtotal)}
              </span>
            </div>

            {paymentCoefficient !== 1 && (
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">
                  {paymentCoefficient > 1 ? "Surcharge" : "Discount"} (time)
                </span>
                <span
                  className={`font-semibold text-lg ${
                    paymentCoefficient > 1 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {paymentCoefficient > 1 ? "+" : "-"}$
                  {formatWithSeparator(
                    Math.abs(laborSubtotal * paymentCoefficient - laborSubtotal)
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
              <span className="font-semibold text-xl text-gray-800">Subtotal</span>
              <span className="font-semibold text-xl text-gray-800">
                ${formatWithSeparator(sumBeforeTax)}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">
                Sales tax
                {houseInfo.state ? ` (${houseInfo.state})` : ""}
                {taxRatePercent > 0 ? ` (${taxRatePercent.toFixed(2)}%)` : ""}
              </span>
              <span>${formatWithSeparator(taxAmount)}</span>
            </div>

            <div className="flex justify-between text-2xl font-semibold mt-4">
              <span>Total</span>
              <span>${formatWithSeparator(finalTotal)}</span>
            </div>
            <span className="block text-right text-base text-gray-500 font-normal">
              ({finalTotalWords})
            </span>
          </div>

          {/* Optional payment schedule */}
          {renderPaymentSchedule()}

          {/* House details */}
          <hr className="my-6 border-gray-200" />
          <div>
            <SectionBoxSubtitle>Home Details</SectionBoxSubtitle>
            <div className="mt-2 space-y-1 text-sm text-gray-700">
              <p>
                <strong>Address:</strong> {houseInfo.addressLine || "No address"}
              </p>
              <p>
                <strong>City / Zip:</strong> {houseInfo.city || "?"},{" "}
                {houseInfo.zip || "?"}
              </p>
              <p>
                <strong>Country:</strong> {houseInfo.country || "?"}
              </p>
              <hr className="my-2" />
              <p>
                <strong>House Type:</strong> {formatHouseType(houseInfo.houseType)}
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
              <hr className="my-2" />
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
        </div>
      </div>
    </main>
  );
}