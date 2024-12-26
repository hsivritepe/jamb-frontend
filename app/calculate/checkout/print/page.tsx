"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ALL_SERVICES } from "@/constants/services";
import { ALL_CATEGORIES } from "@/constants/categories";
import { ROOMS } from "@/constants/rooms"; // If needed for referencing "indoor"/"outdoor" structure

/**
 * A helper to load data from sessionStorage safely.
 */
const loadFromSession = (key: string, defaultValue: any = null) => {
  if (typeof window === "undefined") return defaultValue;
  const savedValue = sessionStorage.getItem(key);
  try {
    return savedValue ? JSON.parse(savedValue) : defaultValue;
  } catch {
    return defaultValue;
  }
};

/**
 * Formats a number with 2 decimal places, e.g. 1234 -> 1,234.00
 */
const formatWithSeparator = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

/**
 * Builds a "temporary estimate number" based on the address and current date/time.
 * Format: AAA-ZZZZZ-YYYYMMDD-HHMM
 */
function buildEstimateNumber(address: string): string {
  let city = "NOC"; // fallback if no city found
  let zip = "00000";

  if (address) {
    const parts = address.split(",").map((p) => p.trim());
    if (parts.length > 0) {
      city = parts[0].slice(0, 3).toUpperCase(); // e.g. "New" from "New York"
    }
    if (parts.length > 1) {
      // second part is often the zip code
      zip = parts[1].replace(/\D/g, "") || "00000";
    }
  }

  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mins = String(now.getMinutes()).padStart(2, "0");

  // The user wants YYYYMMDD or a variation. We'll do year+month+day
  const dateString = `${yyyy}${mm}${dd}`;
  const timeString = hh + mins;

  return `${city}-${zip}-${dateString}-${timeString}`;
}

export default function PrintServicesEstimate() {
  const router = useRouter();

  // 1) Load the relevant data from sessionStorage
  const selectedServicesState: Record<string, number> = loadFromSession(
    "selectedServicesWithQuantity",
    {}
  );
  const address: string = loadFromSession("address", "");
  const photos: string[] = loadFromSession("photos", []);
  const description: string = loadFromSession("description", "");
  const selectedTime: string | null = loadFromSession("selectedTime", null);
  const timeCoefficient: number = loadFromSession("timeCoefficient", 1);

  // 2) Ensure there's something to print (at least one service & an address)
  useEffect(() => {
    const hasServices = Object.keys(selectedServicesState).length > 0;
    if (!hasServices || !address.trim()) {
      router.push("/calculate/estimate");
    }
  }, [selectedServicesState, address, router]);

  // 3) Calculate the totals
  function calculateSubtotal(): number {
    let total = 0;
    for (const [serviceId, quantity] of Object.entries(selectedServicesState)) {
      const svc = ALL_SERVICES.find((s) => s.id === serviceId);
      if (svc) {
        total += svc.price * (quantity || 1);
      }
    }
    return total;
  }

  const subtotal = calculateSubtotal();
  const adjustedSubtotal = subtotal * timeCoefficient;
  const salesTax = adjustedSubtotal * 0.0825;
  const total = adjustedSubtotal + salesTax;

  const hasSurchargeOrDiscount = timeCoefficient !== 1;
  const surchargeOrDiscountAmount = hasSurchargeOrDiscount
    ? Math.abs(subtotal * (timeCoefficient - 1))
    : 0;

  // 4) Create the "temporary estimate number" (e.g. "NEW-12345-20231002-0930")
  const estimateNumber = buildEstimateNumber(address);

  // 4.1) Change the document.title so the printed PDF is named "JAMB-Estimate-<estimateNumber>.pdf"
  useEffect(() => {
    const oldTitle = document.title;
    document.title = `JAMB-Estimate-${estimateNumber}`;
    return () => {
      // Optional: restore old title if leaving the page
      document.title = oldTitle;
    };
  }, [estimateNumber]);

  // 5) Trigger print automatically
  useEffect(() => {
    const printTimer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(printTimer);
  }, []);

  return (
    <div className="print-page p-4">
      {/* Optional styles to hide header/footer on print can be in global CSS */}
      <div className="flex justify-between items-center mb-4 mt-24">
        <div className="text-left">
          <h1 className="text-2xl font-bold">Estimate</h1>
          <h2 className="text-sm text-gray-500 mt-1">
            {estimateNumber} (temporary)
          </h2>
        </div>
      </div>

      {/* If user chose a date/time */}
      {selectedTime && (
        <p className="mb-2 text-gray-700">
          <strong>Date of Service:</strong> {selectedTime}
        </p>
      )}

      {/* Address / Description */}
      <p className="mb-2">
        <strong>Address:</strong> {address}
      </p>
      <p className="mb-2">
        <strong>Details:</strong>{" "}
        {description || "No details provided"}
      </p>

      {/* List each chosen service with quantity & cost */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-3">Selected Services</h2>

        <ul className="pl-3 space-y-2">
          {Object.entries(selectedServicesState).map(([serviceId, quantity]) => {
            const svc = ALL_SERVICES.find((s) => s.id === serviceId);
            if (!svc) return null;

            return (
              <li
                key={serviceId}
                className="flex justify-between items-start border-b pb-2"
              >
                <div className="w-2/3">
                  <p className="font-medium">{svc.title}</p>
                  {svc.description && (
                    <p className="text-sm text-gray-600">
                      {svc.description}
                    </p>
                  )}
                  <p className="text-sm text-gray-700 mt-1">
                    {quantity.toLocaleString("en-US")} {svc.unit_of_measurement}
                  </p>
                </div>
                <p className="w-1/3 text-right">
                  ${formatWithSeparator(svc.price * quantity)}
                </p>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Summaries */}
      <div className="mt-6 border-t pt-2 space-y-1">
        {hasSurchargeOrDiscount && (
          <div className="flex justify-between">
            <span>{timeCoefficient > 1 ? "Surcharge" : "Discount"}:</span>
            <span>
              {timeCoefficient > 1 ? "+" : "-"}$
              {formatWithSeparator(surchargeOrDiscountAmount)}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>${formatWithSeparator(adjustedSubtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Sales Tax (8.25%):</span>
          <span>${formatWithSeparator(salesTax)}</span>
        </div>
        <div className="flex justify-between text-lg font-semibold mt-2">
          <span>Total:</span>
          <span>${formatWithSeparator(total)}</span>
        </div>
      </div>

      {/* If any photos were uploaded */}
      {photos.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-xl">Uploaded Photos</h3>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {photos.map((photo, idx) => (
              <img
                key={idx}
                src={photo}
                alt={`Photo ${idx + 1}`}
                className="w-full h-32 object-cover rounded-md border border-gray-300"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}