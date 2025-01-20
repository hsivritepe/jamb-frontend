"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

// Example UI components
import BreadCrumb from "@/components/ui/BreadCrumb";
import { SectionBoxTitle } from "@/components/ui/SectionBoxTitle";
import { SectionBoxSubtitle } from "@/components/ui/SectionBoxSubtitle";
import ActionIconsBar from "@/components/ui/ActionIconsBar";

// Import your constants
import { ROOMS_STEPS } from "@/constants/navigation";
import { ROOMS } from "@/constants/rooms"; // optional if needed
import { ALL_SERVICES } from "@/constants/services";
import { ALL_CATEGORIES } from "@/constants/categories";

// Session utilities
import { getSessionItem, setSessionItem } from "@/utils/session";

/**
 * Formats a numeric value with commas and exactly two decimals, for example "123,456.78".
 */
function formatWithSeparator(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Converts a standard house type code (e.g. "single_family") into a readable string.
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
 * Constructs a basic reference number, such as "NY-10009-20260815-1455" from the
 * state's short code, ZIP code, and the current date/time.
 */
function buildOrderReference(stateCode: string, zipCode: string): string {
  const upperState = stateCode ? stateCode.toUpperCase().slice(0, 2) : "??";
  const zip = zipCode || "00000";

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");

  return `${upperState}-${zip}-${year}${month}${day}-${hour}${minute}`;
}

/**
 * Converts a numeric USD amount into a (very simplified) spelled-out string,
 * for example "one hundred twenty and 45/100 dollars".
 */
function numberToWordsUSD(amount: number): string {
  const integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - integerPart) * 100);

  // Very basic word mapping for 0-19
  const basicWords: Record<number, string> = {
    0: "zero", 1: "one", 2: "two", 3: "three", 4: "four",
    5: "five", 6: "six", 7: "seven", 8: "eight", 9: "nine",
    10: "ten", 11: "eleven", 12: "twelve", 13: "thirteen", 14: "fourteen",
    15: "fifteen", 16: "sixteen", 17: "seventeen", 18: "eighteen", 19: "nineteen",
  };

  function wordsForTwoDigits(n: number): string {
    if (n <= 19) {
      return basicWords[n] ?? String(n);
    }
    if (n < 30) {
      // "twenty", "twenty-one", etc. (very simplified)
      if (n === 20) return "twenty";
      return "twenty-" + (basicWords[n - 20] ?? String(n - 20));
    }
    // For demonstration only: skipping real tens logic for 30,40,50...
    return String(n);
  }

  // If you want "thousands" or bigger, you'd expand this logic:
  const integerString = wordsForTwoDigits(integerPart);
  const decimalString = decimalPart < 10 ? `0${decimalPart}` : String(decimalPart);

  // "twenty-five and 07/100 dollars"
  return `${integerString} and ${decimalString}/100 dollars`;
}

/**
 * Renders an optional schedule of future payments, based on the user's chosen
 * payment option (like "100% Prepayment", "Monthly", or "Quarterly") and the final total.
 */
function renderPaymentSchedule(selectedPaymentOption: string | null, finalTotal: number) {
  if (!selectedPaymentOption) return null;

  if (selectedPaymentOption === "100% Prepayment") {
    return (
      <div className="mt-4">
        <h4 className="text-lg font-semibold text-gray-800">Payment Schedule</h4>
        <p className="text-sm text-gray-600 mt-2">
          You will pay the entire amount of{" "}
          <span className="font-medium text-blue-600">
            ${formatWithSeparator(finalTotal)}
          </span>{" "}
          as a single upfront payment.
        </p>
      </div>
    );
  } else if (selectedPaymentOption === "Monthly") {
    const monthlyPayment = finalTotal / 12;
    return (
      <div className="mt-4">
        <h4 className="text-lg font-semibold text-gray-800">Payment Schedule (Monthly)</h4>
        <p className="text-sm text-gray-600 mt-2">
          You will pay{" "}
          <span className="font-medium text-blue-600">
            ${formatWithSeparator(monthlyPayment)}
          </span>{" "}
          each month, for 12 total months.
        </p>
      </div>
    );
  } else if (selectedPaymentOption === "Quarterly") {
    const quarterlyPayment = finalTotal / 4;
    return (
      <div className="mt-4">
        <h4 className="text-lg font-semibold text-gray-800">Payment Schedule (Quarterly)</h4>
        <p className="text-sm text-gray-600 mt-2">
          You will pay{" "}
          <span className="font-medium text-blue-600">
            ${formatWithSeparator(quarterlyPayment)}
          </span>{" "}
          every three months, for four total payments.
        </p>
      </div>
    );
  }

  return null;
}

/**
 * RoomsCheckoutPage:
 * A final "Checkout" page for rooms, matching the data stored in the "rooms_*" keys from the Estimate page.
 */
export default function RoomsCheckoutPage() {
  const router = useRouter();

  // Retrieve totals from session, exactly matching the "rooms_*" keys used in the Estimate page.
  const laborSubtotal = getSessionItem<number>("rooms_laborSubtotal", 0);
  const materialsSubtotal = getSessionItem<number>("rooms_materialsSubtotal", 0);
  const serviceFeeOnLabor = getSessionItem<number>("serviceFeeOnLabor", 0);
  const serviceFeeOnMaterials = getSessionItem<number>("serviceFeeOnMaterials", 0);
  const sumBeforeTax = getSessionItem<number>("rooms_sumBeforeTax", 0);
  const taxRatePercent = getSessionItem<number>("rooms_taxRatePercent", 0);
  const taxAmount = getSessionItem<number>("rooms_taxAmount", 0);
  const finalTotal = getSessionItem<number>("rooms_estimateFinalTotal", 0);

  // Payment info
  const timeCoefficient = getSessionItem<number>("rooms_timeCoefficient", 1);
  const selectedPaymentOption = getSessionItem<string | null>("rooms_selectedTime", null);

  // House info (optional), also from "rooms_houseInfo" if your Estimate page set it
  const houseInfo = getSessionItem("rooms_houseInfo", {
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

  // If we have no real data, perhaps redirect back to estimate:
  useEffect(() => {
    const noData =
      laborSubtotal === 0 &&
      materialsSubtotal === 0 &&
      !houseInfo.addressLine &&
      !houseInfo.city;
    if (noData) {
      router.push("/rooms/estimate");
    }
  }, [laborSubtotal, materialsSubtotal, houseInfo, router]);

  // Build a reference number from the state and zip code
  const referenceNumber = buildOrderReference(houseInfo.state || "", houseInfo.zip || "");
  const finalTotalText = numberToWordsUSD(finalTotal);

  function handlePlaceOrder() {
    alert("Thank you! Your rooms order has been placed.");
  }
  function handlePrint() {
    alert("Printing the checkout page...");
  }
  function handleShare() {
    alert("Sharing the checkout link...");
  }
  function handleSave() {
    alert("Saving as PDF...");
  }
  function handleGoBack() {
    router.push("/rooms/estimate");
  }

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto">
        <BreadCrumb items={ROOMS_STEPS} />
      </div>

      <div className="container mx-auto">
        {/* Top row: back + place order */}
        <div className="flex justify-between items-center mt-8">
          <button onClick={handleGoBack} className="text-blue-600 hover:underline">
            ← Back to Estimate
          </button>
          <button
            onClick={handlePlaceOrder}
            className="bg-yellow-400 hover:bg-yellow-500 text-black py-3 px-6 rounded-md font-semibold text-lg shadow-sm transition-colors duration-200"
          >
            Place Your Order
          </button>
        </div>

        {/* Title + icons */}
        <div className="flex items-center justify-between mt-8">
          <SectionBoxTitle>Checkout</SectionBoxTitle>
          <ActionIconsBar onPrint={handlePrint} onShare={handleShare} onSave={handleSave} />
        </div>

        <div className="bg-white border border-gray-300 mt-8 p-6 rounded-lg space-y-6">
          {/* Basic reference & subtitle */}
          <SectionBoxSubtitle>
            Rooms Checkout <span className="ml-2 text-sm text-gray-500">({referenceNumber})</span>
          </SectionBoxSubtitle>
          <p className="text-xs text-gray-400 ml-1">
            *This is a temporary reference, replaced with a final order number after payment.
          </p>

          {/* Summaries */}
          <div className="space-y-4 mt-4">
            {/* Labor */}
            <div className="flex justify-between">
              <span className="font-semibold text-lg text-gray-600">Labor total</span>
              <span className="font-semibold text-lg text-gray-600">
                ${formatWithSeparator(laborSubtotal)}
              </span>
            </div>
            {/* Materials */}
            <div className="flex justify-between">
              <span className="font-semibold text-lg text-gray-600">Materials total</span>
              <span className="font-semibold text-lg text-gray-600">
                ${formatWithSeparator(materialsSubtotal)}
              </span>
            </div>

            {/* Payment discount/surcharge on labor */}
            {timeCoefficient !== 1 && (
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {timeCoefficient > 1 ? "Surcharge" : "Discount"} (time)
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

            {/* Fees */}
            <div className="flex justify-between">
              <span className="text-gray-600">Service Fee (15% on labor)</span>
              <span className="font-semibold text-lg text-gray-800">
                ${formatWithSeparator(serviceFeeOnLabor)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery &amp; Processing (5% on materials)</span>
              <span className="font-semibold text-lg text-gray-800">
                ${formatWithSeparator(serviceFeeOnMaterials)}
              </span>
            </div>

            {/* Subtotal */}
            <div className="flex justify-between mt-2">
              <span className="font-semibold text-xl text-gray-800">Subtotal</span>
              <span className="font-semibold text-xl text-gray-800">
                ${formatWithSeparator(sumBeforeTax)}
              </span>
            </div>

            {/* Tax */}
            <div className="flex justify-between">
              <span className="text-gray-600">
                Sales tax{" "}
                {houseInfo.state ? `(${houseInfo.state})` : ""}
                {taxRatePercent > 0 ? ` (${taxRatePercent.toFixed(2)}%)` : ""}
              </span>
              <span>${formatWithSeparator(taxAmount)}</span>
            </div>

            {/* Final total */}
            <div className="flex justify-between text-2xl font-semibold mt-2">
              <span>Total</span>
              <span>${formatWithSeparator(finalTotal)}</span>
            </div>
            <div className="text-right text-sm text-gray-600">
              ({finalTotalText})
            </div>
          </div>

          {/* Possibly show a schedule if we have a payment option */}
          {renderPaymentSchedule(selectedPaymentOption, finalTotal)}

          <hr className="my-6 border-gray-200" />

          {/* House info (if you want to show it) */}
          <SectionBoxSubtitle>Home Details</SectionBoxSubtitle>
          <div className="mt-2 space-y-1 text-sm text-gray-700">
            <p>
              <strong>Address:</strong> {houseInfo.addressLine || "—"}
            </p>
            <p>
              <strong>City / Zip:</strong> {houseInfo.city || "?"}, {houseInfo.zip || "?"}
            </p>
            <p>
              <strong>Country:</strong> {houseInfo.country || "?"}
            </p>
            <p>
              <strong>Type:</strong> {formatHouseType(houseInfo.houseType)}
            </p>
            {/* etc. You can show floors, bedrooms, etc. */}
          </div>
        </div>
      </div>
    </main>
  );
}