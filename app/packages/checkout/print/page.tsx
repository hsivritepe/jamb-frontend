"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ALL_SERVICES } from "@/constants/services";
import { ALL_CATEGORIES } from "@/constants/categories";

/**
 * Safely load JSON data from sessionStorage.
 */
function loadFromSession<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") {
    return defaultValue;
  }
  const savedValue = sessionStorage.getItem(key);
  try {
    return savedValue ? JSON.parse(savedValue) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Format a number with commas and exactly two decimals (e.g. 1234 => "1,234.00").
 */
function formatWithSeparator(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Build a "temporary estimate number" based on houseInfo.city / houseInfo.zip and the current date/time.
 * Example format: CCC-ZZZZZ-YYYYMMDD-HHMM
 *
 * - CCC = first 3 letters of the city (or "NOC" if missing)
 * - ZZZZZ = zip code (or "00000" if missing)
 * - YYYYMMDD = year-month-day
 * - HHMM = hour-minute (24-hour)
 */
function buildEstimateNumber(city: string, zip: string): string {
  const cityPart = city ? city.slice(0, 3).toUpperCase() : "NOC";
  const zipPart = zip || "00000";

  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mins = String(now.getMinutes()).padStart(2, "0");

  const dateString = `${yyyy}${mm}${dd}`;
  const timeString = hh + mins;

  return `${cityPart}-${zipPart}-${dateString}-${timeString}`;
}

/**
 * If the selectedPaymentOption is "Quarterly", show an approximate schedule for 4 payments over 3-month intervals.
 */
function getQuarterlySchedule(total: number): JSX.Element {
  // Helper to format date as mm/dd/yyyy
  function formatDate(date: Date): string {
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  }

  // Calculate 4 payments total
  const quarterlyAmount = total / 4;
  const now = new Date();
  const payDates: string[] = [];

  for (let i = 0; i < 4; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i * 3, now.getDate());
    payDates.push(formatDate(d));
  }

  return (
    <div className="mt-4">
      <h4 className="text-lg font-semibold text-gray-800">
        Payment Schedule (Quarterly)
      </h4>
      <p className="text-sm text-gray-600 mt-2 mb-2">
        You will pay{" "}
        <span className="font-medium text-blue-600">
          ${formatWithSeparator(quarterlyAmount)}
        </span>{" "}
        every 3 months (4 payments total).
      </p>
      <ul className="list-disc list-inside text-sm text-gray-600">
        {payDates.map((date, idx) => (
          <li key={idx}>
            Payment #{idx + 1}: {date}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PackagesPrintPage() {
  const router = useRouter();

  // 1) Load data from session for the "Packages" flow
  const selectedServices = loadFromSession("packages_selectedServices", {
    indoor: {},
    outdoor: {},
  });
  const mergedSelected: Record<string, number> = {
    ...selectedServices.indoor,
    ...selectedServices.outdoor,
  };

  const houseInfo = loadFromSession("packages_houseInfo", {
    addressLine: "",
    city: "",
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

  const photos: string[] = loadFromSession("packages_photos", []);
  const description: string = loadFromSession("packages_description", "");

  // Could be "Monthly", "Quarterly", "One-time", "Annually", etc.
  const selectedPaymentOption: string | null = loadFromSession(
    "packages_selectedTime",
    null
  );
  const paymentCoefficient: number = loadFromSession(
    "packages_timeCoefficient",
    1
  );

  // 2) Ensure we have at least one selected service and a valid address
  useEffect(() => {
    const hasAnyService = Object.keys(mergedSelected).length > 0;
    const hasAddress = houseInfo.addressLine.trim().length > 0;
    if (!hasAnyService || !hasAddress) {
      router.push("/packages/estimate");
    }
  }, [mergedSelected, houseInfo, router]);

  // 3) Calculate totals
  function calculateSubtotal(): number {
    let total = 0;
    for (const [serviceId, qty] of Object.entries(mergedSelected)) {
      const svc = ALL_SERVICES.find((s) => s.id === serviceId);
      if (svc) {
        total += svc.price * qty;
      }
    }
    return total;
  }

  const subtotal = calculateSubtotal();
  const adjustedSubtotal = subtotal * paymentCoefficient;
  const salesTax = adjustedSubtotal * 0.0825; // e.g. 8.25% tax
  const total = adjustedSubtotal + salesTax;

  const hasSurchargeOrDiscount = paymentCoefficient !== 1;
  const surchargeOrDiscountAmount = hasSurchargeOrDiscount
    ? Math.abs(subtotal * (paymentCoefficient - 1))
    : 0;

  // 4) Build a "temporary order number" from city + zip
  const estimateNumber = buildEstimateNumber(houseInfo.city, houseInfo.zip);

  /**
   * 4.1) In order to customize the PDF's default filename, we update the document title 
   *      to something like "JAMB-Estimate-(estimateNumber)" before printing.
   */
  useEffect(() => {
    // Store original document title
    const oldTitle = document.title;
    // Set a new one
    document.title = `JAMB-Estimate-${estimateNumber}`;
    // Restore old title after unmount
    return () => {
      document.title = oldTitle;
    };
  }, [estimateNumber]);

  /**
   * 4.2) Trigger window.print() after a slight delay.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="print-page p-4">
      <div className="flex justify-between items-center mb-4 mt-24">
        <div className="text-left">
          <h1 className="text-2xl font-bold">Package Order</h1>
          <h2 className="text-sm text-gray-500 mt-1">
            {estimateNumber} (temporary)
          </h2>
        </div>
      </div>

      {/* If there's a payment option selected */}
      {selectedPaymentOption && (
        <p className="mb-2 text-gray-700">
          <strong>Payment Option:</strong> {selectedPaymentOption}
        </p>
      )}

      {/* If "Quarterly", show a 4-payment schedule */}
      {selectedPaymentOption === "Quarterly" && getQuarterlySchedule(total)}

      <p className="my-2 text-gray-700">
        <strong>Address:</strong> {houseInfo.addressLine}, {houseInfo.city}{" "}
        {houseInfo.zip}
      </p>

      {/* Render each chosen service */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-3">Selected Services</h2>
        <ul className="pl-3 space-y-2">
          {Object.entries(mergedSelected).map(([serviceId, quantity]) => {
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
                    <p className="text-sm text-gray-600">{svc.description}</p>
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

      {/* Price summary */}
      <div className="mt-6 pt-2 space-y-1">
        {hasSurchargeOrDiscount && (
          <div className="flex justify-between">
            <span>
              {paymentCoefficient > 1 ? "Surcharge" : "Discount"}:
            </span>
            <span>
              {paymentCoefficient > 1 ? "+" : "-"}$
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

      {/* House Info / "Home Details" */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Home Details
        </h3>
        <div className="text-sm text-gray-700 space-y-1">
          <p>
            <strong>House Type:</strong> {houseInfo.houseType || "?"}
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
          <p>
            <strong>Garage:</strong>{" "}
            {houseInfo.hasGarage ? houseInfo.garageCount : "No"}
          </p>
          <p>
            <strong>Yard:</strong>{" "}
            {houseInfo.hasYard
              ? `${houseInfo.yardArea} sq ft`
              : "No yard/garden"}
          </p>
          <p>
            <strong>Pool:</strong>{" "}
            {houseInfo.hasPool ? `${houseInfo.poolArea} sq ft` : "No pool"}
          </p>
        </div>
      </div>

      {/* Photos, if any */}
      {photos && photos.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Uploaded Photos
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
            {photos.map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={`Photo ${index + 1}`}
                className="w-full h-32 object-cover rounded-md border border-gray-300"
              />
            ))}
          </div>
        </div>
      )}

      {/* Additional details, if any */}
      {description && description.trim().length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Additional Details
          </h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {description}
          </p>
        </div>
      )}
    </div>
  );
}