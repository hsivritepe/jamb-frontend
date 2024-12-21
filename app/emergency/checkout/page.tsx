"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BreadCrumb from "@/components/ui/BreadCrumb";
import ActionIconsBar from "@/components/ui/ActionIconsBar"; // <-- import icon bar
import { SectionBoxTitle } from "@/components/ui/SectionBoxTitle";
import { SectionBoxSubtitle } from "@/components/ui/SectionBoxSubtitle";
import { EMERGENCY_STEPS } from "@/constants/navigation";
import { ALL_SERVICES } from "@/constants/services";

/** 
 * Save data to sessionStorage as JSON.
 */
const saveToSession = (key: string, value: any) => {
  sessionStorage.setItem(key, JSON.stringify(value));
};

/** 
 * Load JSON-parsed data from sessionStorage (or null if not found).
 */
const loadFromSession = (key: string) => {
  const savedValue = sessionStorage.getItem(key);
  return savedValue ? JSON.parse(savedValue) : null;
};

/** 
 * Formats a number with comma separators and **exactly two** decimal places.
 */
const formatWithSeparator = (value: number): string =>
  new Intl.NumberFormat("en-US", { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  }).format(value);

/**
 * Builds a "temporary estimate number" from the address + current date/time.
 * Format: AAA-ZZZZZ-YYYYDDMM-HHMM
 *   - AAA = first 3 uppercase letters of city (or fallback "NOC")
 *   - ZZZZZ = numeric zip from second part of address (or fallback "00000")
 *   - YYYYDDMM = year + day + month
 *   - HHMM = hour + minute
 */
function buildEstimateNumber(address: string): string {
  let city = "NOC";
  let zip = "00000";

  if (address) {
    const parts = address.split(",").map((p) => p.trim());
    if (parts.length > 0) {
      city = parts[0].slice(0, 3).toUpperCase(); // e.g. "New" from "New York"
    }
    if (parts.length > 1) {
      // second part might be zip code
      zip = parts[1].replace(/\D/g, "") || "00000";
    }
  }

  const now = new Date();
  const yyyy = String(now.getFullYear());
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");

  // user wants "ГГГГДДММ" => year + day + month
  const dateString = `${yyyy}${dd}${mm}`;

  const hh = String(now.getHours()).padStart(2, "0");
  const mins = String(now.getMinutes()).padStart(2, "0");
  const timeString = hh + mins;

  return `${city}-${zip}-${dateString}-${timeString}`;
}

interface SelectedActivities {
  [service: string]: {
    [activityKey: string]: number;
  };
}

export default function CheckoutPage() {
  const router = useRouter();

  // The final combined data: address, photos, description, date, selectedActivities
  const [checkoutData, setCheckoutData] = useState<{
    address: string;
    photos: string[];
    description: string;
    date: string | null;
    selectedActivities: SelectedActivities;
  } | null>(null);

  // Load any pre-filtered steps from an "Estimate" page
  const filteredSteps =
    (loadFromSession("filteredSteps") as {
      serviceName: string;
      steps: any[];
    }[]) || [];

  // On mount: gather essential data from session
  useEffect(() => {
    const selectedActivities: SelectedActivities =
      loadFromSession("selectedActivities") || {};
    const address: string = loadFromSession("address") || "";
    const photos: string[] = loadFromSession("photos") || [];
    const description: string = loadFromSession("description") || "";
    const date: string | null =
      loadFromSession("selectedTime") || "No date selected";

    // If crucial data is missing, redirect to estimate
    if (
      !selectedActivities ||
      Object.keys(selectedActivities).length === 0 ||
      !address
    ) {
      router.push("/emergency/estimate");
      return;
    }

    const data = {
      address,
      photos,
      description,
      date: date || "No date selected",
      selectedActivities,
    };

    setCheckoutData(data);
    saveToSession("checkoutData", data);
  }, [router]);

  if (!checkoutData) {
    return <p>Loading...</p>;
  }

  const selectedActivities = checkoutData.selectedActivities;
  const address = checkoutData.address;
  const photos = checkoutData.photos;
  const description = checkoutData.description;
  const date = checkoutData.date;

  // The timeCoefficient: may represent a surcharge (>1) or discount (<1)
  const timeCoefficient: number = loadFromSession("timeCoefficient") || 1;

  // Summation of the selected activities
  const calculateSubtotal = (): number => {
    let total = 0;
    for (const service in selectedActivities) {
      for (const activityKey in selectedActivities[service]) {
        const activity = ALL_SERVICES.find((a) => a.id === activityKey);
        if (activity) {
          total += activity.price * (selectedActivities[service][activityKey] || 1);
        }
      }
    }
    return total;
  };

  // 1) Original total
  const subtotal = calculateSubtotal();
  // 2) Adjusted by timeCoefficient
  const adjustedSubtotal = subtotal * timeCoefficient;
  // 3) Sales tax 8.25%
  const salesTax = adjustedSubtotal * 0.0825;
  // 4) Final total
  const total = adjustedSubtotal + salesTax;

  const hasSurchargeOrDiscount = timeCoefficient !== 1;
  const surchargeOrDiscountAmount = hasSurchargeOrDiscount
    ? Math.abs(subtotal * (timeCoefficient - 1))
    : 0;

  // Build a "temporary" estimate number
  const estimateNumber = buildEstimateNumber(address);

  // Handlers for printing, sharing, saving
  const handlePrint = () => {
    router.push("/emergency/checkout/print"); // <-- Link to print page
  };
  const handleShare = () => {
    alert("Sharing your estimate...");
  };
  const handleSave = () => {
    alert("Saving your estimate as a PDF...");
  };

  // Place your order logic (stub)
  const handlePlaceOrder = () => {
    alert("Your emergency order has been placed!");
  };

  return (
    <main className="min-h-screen py-24">
      <div className="container mx-auto">
        <BreadCrumb items={EMERGENCY_STEPS} />
      </div>

      <div className="container mx-auto py-4">
        {/* Back link + Place order */}
        <div className="flex justify-between items-center mt-8">
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
            Place your order
          </button>
        </div>
      </div>

      <div className="container mx-auto">
        {/* Title + icon bar */}
        <div className="flex items-center justify-between mt-8">
          <SectionBoxTitle>Checkout</SectionBoxTitle>
          <ActionIconsBar
            onPrint={handlePrint}
            onShare={handleShare}
            onSave={handleSave}
          />
        </div>

        {/* Main content container */}
        <div className="bg-white border border-gray-300 mt-8 p-6 rounded-lg space-y-6">
          {/* 1) Final Estimate + Temporary ID */}
          <div>
            <SectionBoxSubtitle>
              Estimate{" "}
              <span className="ml-2 text-sm text-gray-500">
                ({estimateNumber})
              </span>
            </SectionBoxSubtitle>
            <p className="text-xs text-gray-400 -mt-2 ml-1">
              *This number is temporary and will be replaced with a permanent
              order number after confirmation.
            </p>

            {/* List all selected activities with final cost */}
            <div className="mt-4 space-y-4">
              {Object.entries(selectedActivities).flatMap(([, activities]) =>
                Object.entries(activities).map(([activityKey, quantity]) => {
                  const activity = ALL_SERVICES.find((a) => a.id === activityKey);
                  if (!activity) return null;

                  return (
                    <div
                      key={activityKey}
                      className="flex justify-between items-start gap-4 border-b pb-2"
                    >
                      <div>
                        <h3 className="font-medium text-lg text-gray-800">
                          {activity.title}
                        </h3>
                        {activity.description && (
                          <div className="text-sm text-gray-500 mt-1">
                            <span>{activity.description}</span>
                          </div>
                        )}
                        <div className="text-medium font-medium text-gray-800 mt-2">
                          <span>{quantity} </span>
                          <span>{activity.unit_of_measurement}</span>
                        </div>
                      </div>
                      <div className="text-right mt-auto">
                        <span className="block text-gray-800 font-medium">
                          ${formatWithSeparator(activity.price * quantity)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Additional charges/discount, tax, total */}
            <div className="pt-4 mt-4">
              {hasSurchargeOrDiscount && (
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">
                    {timeCoefficient > 1 ? "Surcharge" : "Discount"}
                  </span>
                  <span
                    className={`font-semibold text-lg ${
                      timeCoefficient > 1 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {timeCoefficient > 1 ? "+" : "-"}$
                    {formatWithSeparator(surchargeOrDiscountAmount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between mb-2">
                <span className="font-semibold text-lg text-gray-800">
                  Subtotal
                </span>
                <span className="font-semibold text-lg text-gray-800">
                  ${formatWithSeparator(adjustedSubtotal)}
                </span>
              </div>

              <div className="flex justify-between mb-4">
                <span className="text-gray-600">Sales tax (8.25%)</span>
                <span>${formatWithSeparator(salesTax)}</span>
              </div>

              <div className="flex justify-between text-2xl font-semibold mt-4">
                <span>Total</span>
                <span>${formatWithSeparator(total)}</span>
              </div>
            </div>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* 2) Date of Service */}
          <div>
            <SectionBoxSubtitle>Date of Service</SectionBoxSubtitle>
            <p className="text-gray-800">
              {date || "No date selected"}
            </p>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* 3) Problem Description */}
          <div>
            <SectionBoxSubtitle>Problem Description</SectionBoxSubtitle>
            <p className="text-gray-700">
              {description || "No details provided"}
            </p>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* 4) Address */}
          <div>
            <SectionBoxSubtitle>Address</SectionBoxSubtitle>
            <p className="text-gray-800">{address || "No address provided"}</p>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* 5) Uploaded Photos */}
          <div>
            <SectionBoxSubtitle>Uploaded Photos</SectionBoxSubtitle>
            <div className="grid grid-cols-6 gap-2">
              {photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-24 object-cover rounded border border-gray-300"
                />
              ))}
            </div>
            {photos.length === 0 && (
              <p className="text-gray-500 mt-2">No photos uploaded</p>
            )}
          </div>

          <hr className="my-6 border-gray-200" />

          {/* 6) Emergency Steps if any (from filteredSteps) */}
          <div>
            <SectionBoxSubtitle>Emergency Steps</SectionBoxSubtitle>
            {filteredSteps.length > 0 ? (
              <div className="space-y-6 mt-4">
                {filteredSteps.map((service) => (
                  <div
                    key={service.serviceName}
                    className="bg-white p-6 rounded-lg border border-gray-200"
                  >
                    <h3 className="text-xl font-semibold text-gray-800">
                      {service.serviceName}
                    </h3>
                    <div className="mt-4 space-y-4">
                      {service.steps.map((step) => (
                        <div key={step.step_number} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="text-lg font-medium">
                              {step.step_number}.
                            </h4>
                            <h4 className="text-lg font-medium">{step.title}</h4>
                          </div>
                          <p className="text-gray-600">{step.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 mt-4">No steps available.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}