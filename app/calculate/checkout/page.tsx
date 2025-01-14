"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BreadCrumb from "@/components/ui/BreadCrumb";
import { SectionBoxTitle } from "@/components/ui/SectionBoxTitle";
import { SectionBoxSubtitle } from "@/components/ui/SectionBoxSubtitle";
import ActionIconsBar from "@/components/ui/ActionIconsBar";
import { CALCULATE_STEPS } from "@/constants/navigation";
import { ALL_SERVICES } from "@/constants/services";
import { ALL_CATEGORIES } from "@/constants/categories";

// Session storage helpers
const saveToSession = (key: string, value: any) => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(key, JSON.stringify(value));
  }
};

const loadFromSession = (key: string, defaultValue: any = null) => {
  if (typeof window === "undefined") return defaultValue;
  const savedValue = sessionStorage.getItem(key);
  try {
    return savedValue ? JSON.parse(savedValue) : defaultValue;
  } catch {
    return defaultValue;
  }
};

// Utility function to format numeric values with commas and exactly two decimal places
const formatWithSeparator = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

/**
 * Builds a "temporary estimate number" from the address + current date/time.
 * Format: AAA-ZZZZZ-YYYYDDMM-HHMM
 *  - AAA = first 3 uppercase letters of city (or fallback)
 *  - ZZZZZ = zip from second part of address (or fallback)
 *  - YYYYDDMM (year + day + month)
 *  - HHMM (hour + minute)
 */
function buildEstimateNumber(address: string): string {
  let city = "NOC"; // fallback
  let zip = "00000"; // fallback

  if (address) {
    const parts = address.split(",").map((p) => p.trim());
    if (parts.length > 0) {
      city = parts[0].slice(0, 3).toUpperCase(); // e.g. "New" in "New York"
    }
    if (parts.length > 1) {
      // often the 2nd element is zip code
      zip = parts[1].replace(/\D/g, "") || "00000";
    }
  }

  const now = new Date();
  const yyyy = String(now.getFullYear());
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");

  // user wants "ГГГГДДММ" => year + day + month
  const dateString = `${yyyy}${dd}${mm}`;

  // HHMM
  const hh = String(now.getHours()).padStart(2, "0");
  const mins = String(now.getMinutes()).padStart(2, "0");
  const timeString = hh + mins;

  return `${city}-${zip}-${dateString}-${timeString}`;
}

export default function CheckoutPage() {
  const router = useRouter();

  // 1) Load required data from session
  const selectedServicesState: Record<string, number> = loadFromSession(
    "selectedServicesWithQuantity",
    {}
  );
  const address: string = loadFromSession("address", "");
  const photos: string[] = loadFromSession("photos", []);
  const description: string = loadFromSession("description", "");
  const selectedTime: string | null = loadFromSession("selectedTime", null);
  const timeCoefficient: number = loadFromSession("timeCoefficient", 1);

  // If no essential data, go back
  useEffect(() => {
    if (Object.keys(selectedServicesState).length === 0 || !address) {
      router.push("/calculate/estimate");
    }
  }, [selectedServicesState, address, router]);

  // Calculate subtotal
  const calculateSubtotal = (): number => {
    let total = 0;
    for (const [serviceId, quantity] of Object.entries(selectedServicesState)) {
      const svc = ALL_SERVICES.find((s) => s.id === serviceId);
      if (svc) {
        total += svc.price * (quantity || 1);
      }
    }
    return total;
  };

  const subtotal = calculateSubtotal();
  const adjustedSubtotal = subtotal * timeCoefficient;
  const salesTax = adjustedSubtotal * 0.0825;
  const total = adjustedSubtotal + salesTax;

  const hasSurchargeOrDiscount = timeCoefficient !== 1;
  const surchargeOrDiscountAmount = hasSurchargeOrDiscount
    ? Math.abs(subtotal * (timeCoefficient - 1))
    : 0;

  // For grouping services by section/category
  const selectedCategories: string[] = loadFromSession(
    "services_selectedCategories",
    []
  );
  const searchQuery: string = loadFromSession("services_searchQuery", "");

  // Build the category -> section structure
  const categoriesWithSection = selectedCategories
    .map((catId) => ALL_CATEGORIES.find((c) => c.id === catId) || null)
    .filter(Boolean) as typeof ALL_CATEGORIES[number][];

  const categoriesBySection: Record<string, string[]> = {};
  categoriesWithSection.forEach((cat) => {
    if (!categoriesBySection[cat.section]) {
      categoriesBySection[cat.section] = [];
    }
    categoriesBySection[cat.section].push(cat.id);
  });

  const categoryServicesMap: Record<string, typeof ALL_SERVICES[number][]> = {};
  selectedCategories.forEach((catId) => {
    let matchedServices = ALL_SERVICES.filter((svc) =>
      svc.id.startsWith(`${catId}-`)
    );
    if (searchQuery) {
      matchedServices = matchedServices.filter((svc) =>
        svc.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    categoryServicesMap[catId] = matchedServices;
  });

  const getCategoryNameById = (catId: string): string => {
    const categoryObj = ALL_CATEGORIES.find((c) => c.id === catId);
    return categoryObj ? categoryObj.title : catId;
  };

  const handlePlaceOrder = () => {
    alert("Your order has been placed!");
  };

  // Optionally, handle Print, Share, Save (like the rooms page)
  const handlePrint = () => {
    router.push("/calculate/checkout/print");
  };
  const handleShare = () => {
    alert("Sharing your estimate...");
  };
  const handleSave = () => {
    alert("Saving your estimate as a PDF...");
  };

  // Build a "temporary estimate number"
  const estimateNumber = buildEstimateNumber(address);

  return (
    <main className="min-h-screen py-24">
      <div className="container mx-auto">
        <BreadCrumb items={CALCULATE_STEPS} />
      </div>

      <div className="container mx-auto">
        {/* Top bar with back link + place order button */}
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

        {/* Title and icon bar, just like rooms */}
        <div className="flex items-center justify-between mt-8">
          <SectionBoxTitle>Checkout</SectionBoxTitle>
          {/* If you want the ActionIconsBar here */}
          <ActionIconsBar
            onPrint={handlePrint}
            onShare={handleShare}
            onSave={handleSave}
          />
        </div>

        <div className="bg-white border-gray-300 mt-8 p-6 rounded-lg space-y-6 border">
          {/* Final Estimate Section */}
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
            <div className="mt-4 space-y-4">
              {/* Display services grouped by section and category */}
              {Object.entries(categoriesBySection).map(
                ([sectionName, catIds]) => {
                  const categoriesWithSelected = catIds.filter((catId) => {
                    const servicesForCategory = categoryServicesMap[catId] || [];
                    return servicesForCategory.some(
                      (svc) => selectedServicesState[svc.id] !== undefined
                    );
                  });
                  if (categoriesWithSelected.length === 0) return null;

                  return (
                    <div key={sectionName} className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {sectionName}
                      </h3>
                      {categoriesWithSelected.map((catId) => {
                        const categoryName = getCategoryNameById(catId);
                        const servicesForCategory =
                          categoryServicesMap[catId] || [];
                        const chosenServices = servicesForCategory.filter(
                          (svc) => selectedServicesState[svc.id] !== undefined
                        );

                        if (chosenServices.length === 0) return null;

                        return (
                          <div key={catId} className="ml-4 space-y-4">
                            <h4 className="text-lg font-medium text-gray-700">
                              {categoryName}
                            </h4>
                            {chosenServices.map((activity) => {
                              const quantity =
                                selectedServicesState[activity.id] || 1;
                              return (
                                <div
                                  key={activity.id}
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
                                      <span>
                                        {quantity.toLocaleString("en-US")}{" "}
                                      </span>
                                      <span>
                                        {activity.unit_of_measurement}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right mt-auto">
                                    <span className="block text-gray-800 font-medium">
                                      $
                                      {formatWithSeparator(
                                        activity.price * quantity
                                      )}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  );
                }
              )}
            </div>

            {/* Summary of costs */}
            <div className="pt-4 mt-4">
              {timeCoefficient !== 1 && (
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
                    {formatWithSeparator(
                      Math.abs(subtotal * (timeCoefficient - 1))
                    )}
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

          {/* Selected Date */}
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
            <p className="text-gray-800">{address || "No address provided"}</p>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* Uploaded Photos */}
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
        </div>
      </div>
    </main>
  );
}