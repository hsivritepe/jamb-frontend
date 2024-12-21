"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ALL_SERVICES } from "@/constants/services";

/**
 * Load from sessionStorage or return default.
 */
function loadFromSession(key: string, defaultValue: any = null) {
  if (typeof window === "undefined") return defaultValue;
  const val = sessionStorage.getItem(key);
  try {
    return val ? JSON.parse(val) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Format numbers with commas and exactly two decimals.
 */
function formatWithSeparator(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Build a "temporary estimate number."
 */
function buildEstimateNumber(address: string): string {
  let city = "NOC";
  let zip = "00000";

  if (address) {
    const parts = address.split(",").map((p) => p.trim());
    if (parts.length > 0) {
      city = parts[0].slice(0, 3).toUpperCase();
    }
    if (parts.length > 1) {
      zip = parts[1].replace(/\D/g, "") || "00000";
    }
  }
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mins = String(now.getMinutes()).padStart(2, "0");

  const dateString = `${yyyy}${mm}${dd}`;
  const timeString = hh + mins;

  return `${city}-${zip}-${dateString}-${timeString}`;
}

export default function PrintEmergencyEstimate() {
  const router = useRouter();

  // 1) Load data from session
  const selectedActivities: Record<string, Record<string, number>> =
    loadFromSession("selectedActivities", {});
  const address: string = loadFromSession("address", "");
  const photos: string[] = loadFromSession("photos", []);
  const description: string = loadFromSession("description", "");
  const selectedTime: string | null = loadFromSession("selectedTime", null);
  const timeCoefficient: number = loadFromSession("timeCoefficient", 1);

  // 2) Check essential data
  useEffect(() => {
    let hasAnyService = false;
    for (const serviceName in selectedActivities) {
      if (Object.keys(selectedActivities[serviceName]).length > 0) {
        hasAnyService = true;
        break;
      }
    }
    if (!hasAnyService || !address.trim()) {
      router.push("/emergency/estimate");
    }
  }, [selectedActivities, address, router]);

  // 3) Calculate totals
  function calculateSubtotal() {
    let sum = 0;
    for (const serviceName in selectedActivities) {
      for (const [activityKey, qty] of Object.entries(
        selectedActivities[serviceName]
      )) {
        const found = ALL_SERVICES.find((s) => s.id === activityKey);
        if (found) {
          sum += found.price * (qty || 1);
        }
      }
    }
    return sum;
  }
  const subtotal = calculateSubtotal();
  const adjustedSubtotal = subtotal * timeCoefficient;
  const salesTax = adjustedSubtotal * 0.0825;
  const total = adjustedSubtotal + salesTax;

  const hasSurchargeOrDiscount = timeCoefficient !== 1;
  const surchargeOrDiscountAmount = hasSurchargeOrDiscount
    ? Math.abs(subtotal * (timeCoefficient - 1))
    : 0;

  // 4) Auto-print
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Build an estimate number
  const estimateNumber = buildEstimateNumber(address);

  return (
    <div className="print-page p-4">
      <div className="flex justify-between items-center mb-4 mt-24">
        <div className="text-left">
          <h1 className="text-2xl font-bold">Emergency Estimate</h1>
          <h2 className="text-sm text-gray-500 mt-1">
            {estimateNumber} (temporary)
          </h2>
        </div>
      </div>

      {selectedTime && (
        <p className="mb-2 text-gray-700">
          <strong>Date of Service:</strong> {selectedTime}
        </p>
      )}
      <p className="mb-2">
        <strong>Address:</strong> {address}
      </p>
      <p className="mb-2">
        <strong>Details:</strong> {description || "No details provided"}
      </p>

      {/* List each chosen activity */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-3">Selected Activities</h2>
        <ul className="pl-3 space-y-2">
          {Object.entries(selectedActivities).map(([service, activityMap]) => {
            return Object.entries(activityMap).map(([activityKey, qty]) => {
              const found = ALL_SERVICES.find((s) => s.id === activityKey);
              if (!found) return null;

              return (
                <li
                  key={activityKey}
                  className="flex justify-between items-start border-b pb-2"
                >
                  <div className="w-2/3">
                    <p className="font-medium">{found.title}</p>
                    {found.description && (
                      <p className="text-sm text-gray-600">{found.description}</p>
                    )}
                    <p className="text-sm text-gray-700 mt-1">
                      {qty} {found.unit_of_measurement}
                    </p>
                  </div>
                  <p className="w-1/3 text-right">
                    ${formatWithSeparator(found.price * qty)}
                  </p>
                </li>
              );
            });
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

      {/* Photos, if any */}
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