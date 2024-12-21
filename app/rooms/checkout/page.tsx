"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BreadCrumb from "@/components/ui/BreadCrumb";
import { SectionBoxTitle } from "@/components/ui/SectionBoxTitle";
import { SectionBoxSubtitle } from "@/components/ui/SectionBoxSubtitle";
import ActionIconsBar from "@/components/ui/ActionIconsBar";
import { ROOMS_STEPS } from "@/constants/navigation";
import { ALL_SERVICES } from "@/constants/services";
import { ALL_CATEGORIES } from "@/constants/categories";
import { ROOMS } from "@/constants/rooms";

// Session storage helper: Save data to sessionStorage
const saveToSession = (key: string, value: any) => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(key, JSON.stringify(value));
  }
};

// Session storage helper: Load data from sessionStorage
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
 * Utility function to format numeric values (e.g., prices) with commas
 * and exactly two decimal places (e.g., 100 -> 100.00).
 */
const formatWithSeparator = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export default function RoomsEstimatePage() {
  const router = useRouter();

  // 1) Load all the key data from session
  const selectedServicesState: Record<string, Record<string, number>> =
    loadFromSession("rooms_selectedServicesWithQuantity", {});
  const address: string = loadFromSession("address", "");
  const photos: string[] = loadFromSession("photos", []);
  const description: string = loadFromSession("description", "");
  const selectedTime: string | null = loadFromSession("selectedTime", null);
  const timeCoefficient: number = loadFromSession("timeCoefficient", 1);

  // 2) Check if there's any selected service or no address
  useEffect(() => {
    let hasAnyService = false;
    for (const roomId in selectedServicesState) {
      if (Object.keys(selectedServicesState[roomId]).length > 0) {
        hasAnyService = true;
        break;
      }
    }
    if (!hasAnyService || !address.trim()) {
      router.push("/rooms/details");
    }
  }, [selectedServicesState, address, router]);

  // 3) Calculate total cost
  function calculateSubtotal(): number {
    let total = 0;
    for (const roomId in selectedServicesState) {
      for (const [serviceId, quantity] of Object.entries(
        selectedServicesState[roomId]
      )) {
        const svc = ALL_SERVICES.find((s) => s.id === serviceId);
        if (svc) {
          total += svc.price * (quantity || 1);
        }
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

  // 4) Retrieve all rooms so we can match up the IDs with their titles
  const allRooms = [...ROOMS.indoor, ...ROOMS.outdoor];
  function getRoomById(roomId: string) {
    return allRooms.find((r) => r.id === roomId);
  }

  // Helper: get category name by ID
  function getCategoryNameById(catId: string): string {
    const catObj = ALL_CATEGORIES.find((c) => c.id === catId);
    return catObj ? catObj.title : catId;
  }

  // Helper: derive category ID from serviceId
  function getCategoryId(serviceId: string): string {
    return serviceId.split("-").slice(0, 2).join("-");
  }

  // Place the order logic
  const handlePlaceOrder = () => {
    alert("Rooms: Your order has been placed!");
    // router.push(...) or any next step
  };

  // Print: navigate to your dedicated print page
  const handlePrint = () => {
    router.push("/rooms/checkout/print");
  };

  // Share: real logic to share via messenger or email
  const handleShare = () => {
    alert("Sharing via email or messenger...");
  };

  // Save: export or save PDF
  const handleSave = () => {
    alert("Saving as PDF to your computer...");
  };

  /**
   * Build a "temporary estimate number" from address and current date/time.
   * Format: AAA-ZZZZZ-YYYYDDMM-HHMM
   * Where:
   *   - AAA = first 3 letters of city (uppercase)
   *   - ZZZZZ = zip code
   *   - YYYYDDMM = year, day, month
   *   - HHMM = hour + minute
   */
  const buildEstimateNumber = (): string => {
    // Attempt to parse city and zip from the address
    // e.g. "Philadelphia, 19107, USA"
    let city = "NOC";
    let zip = "00000";
    if (address) {
      const parts = address.split(",").map((p) => p.trim());
      if (parts.length > 0) {
        city = parts[0].slice(0, 3).toUpperCase(); // first 3 letters
      }
      if (parts.length > 1) {
        zip = parts[1];
      }
    }
    // Format the date/time
    const now = new Date();
    const yyyy = String(now.getFullYear());
    const dd = String(now.getDate()).padStart(2, "0"); // day
    const mm = String(now.getMonth() + 1).padStart(2, "0"); // month
    // user wants "ГГГГДДММ" => year + day + month
    const dateString = `${yyyy}${mm}${dd}`;
    // time in HHMM
    const hh = String(now.getHours()).padStart(2, "0");
    const mins = String(now.getMinutes()).padStart(2, "0");
    const timeString = hh + mins;

    return `${city}-${zip}-${dateString}-${timeString}`;
  };

  const estimateNumber = buildEstimateNumber();

  return (
    <main className="min-h-screen pt-24 pb-16">
      {/* Typically your site header is here, but it remains visible */}
      <div className="container mx-auto">
        <BreadCrumb items={ROOMS_STEPS} />
      </div>

      <div className="container mx-auto pt-8">
        {/* If you want a back link, keep it here */}
        <div className="flex items-center justify-between mb-6">
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

        {/* Title + Icons aligned: Title left, icons right */}
        <div className="flex items-center justify-between">
          <SectionBoxTitle>Checkout</SectionBoxTitle>
          <ActionIconsBar
            onPrint={handlePrint}
            onShare={handleShare}
            onSave={handleSave}
          />
        </div>

        {/* Final Estimate Area */}
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
              *This number is temporary and will be replaced with a permanent order number
              after confirmation.
            </p>

            <div className="mt-4 space-y-8">
              {Object.entries(selectedServicesState).map(
                ([roomId, servicesMap]) => {
                  const roomServiceIds = Object.keys(servicesMap);
                  if (roomServiceIds.length === 0) return null;

                  const roomObj = getRoomById(roomId);
                  const roomTitle = roomObj ? roomObj.title : roomId;

                  // Group services by category
                  const categoryMap: Record<string, string[]> = {};
                  for (const serviceId of roomServiceIds) {
                    const catId = getCategoryId(serviceId);
                    if (!categoryMap[catId]) categoryMap[catId] = [];
                    categoryMap[catId].push(serviceId);
                  }

                  // Sum up total for this room
                  const roomSubtotal = roomServiceIds.reduce((acc, svcId) => {
                    const qty = servicesMap[svcId];
                    const found = ALL_SERVICES.find((s) => s.id === svcId);
                    return found ? acc + found.price * qty : acc;
                  }, 0);

                  return (
                    <div key={roomId} className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {roomTitle}
                      </h3>

                      {Object.entries(categoryMap).map(([catId, sIds]) => {
                        const catTitle = getCategoryNameById(catId);
                        const chosenServices = sIds
                          .map((id) => ALL_SERVICES.find((s) => s.id === id))
                          .filter(Boolean) as (typeof ALL_SERVICES)[number][];

                        return (
                          <div key={catId} className="ml-4 space-y-4">
                            <h4 className="text-lg font-medium text-gray-700">
                              {catTitle}
                            </h4>
                            {chosenServices.map((svc) => {
                              const quantity = servicesMap[svc.id] || 1;
                              return (
                                <div
                                  key={svc.id}
                                  className="flex justify-between items-start gap-4 border-b pb-2"
                                >
                                  <div>
                                    <h3 className="font-medium text-lg text-gray-800">
                                      {svc.title}
                                    </h3>
                                    {svc.description && (
                                      <div className="text-sm text-gray-500 mt-1">
                                        <span>{svc.description}</span>
                                      </div>
                                    )}
                                    <div className="text-medium font-medium text-gray-800 mt-2">
                                      <span>
                                        {quantity.toLocaleString("en-US")}{" "}
                                      </span>
                                      <span>{svc.unit_of_measurement}</span>
                                    </div>
                                  </div>
                                  <div className="text-right mt-auto">
                                    <span className="block text-gray-800 font-medium">
                                      $
                                      {formatWithSeparator(
                                        svc.price * quantity
                                      )}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}

                      {/* Room total */}
                      <div className="flex justify-between items-center ml-4 mt-2">
                        <span className="font-semibold text-gray-800">
                          {roomTitle} Total:
                        </span>
                        <span className="font-semibold text-blue-600">
                          ${formatWithSeparator(roomSubtotal)}
                        </span>
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            {/* 2) Overall cost summary */}
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
                <span>${formatWithSeparator(adjustedSubtotal * 0.0825)}</span>
              </div>

              <div className="flex justify-between text-2xl font-semibold mt-4">
                <span>Total</span>
                <span>${formatWithSeparator(total)}</span>
              </div>
            </div>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* 3) Date of Service */}
          <div>
            <SectionBoxSubtitle>Date of Service</SectionBoxSubtitle>
            <p className="text-gray-800">
              {selectedTime ? selectedTime : "No date selected"}
            </p>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* 4) Additional Details (Problem Description) */}
          <div>
            <SectionBoxSubtitle>Additional Details</SectionBoxSubtitle>
            <p className="text-gray-700">
              {description || "No details provided"}
            </p>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* 5) Address */}
          <div>
            <SectionBoxSubtitle>Address</SectionBoxSubtitle>
            <p className="text-gray-800">{address || "No address provided"}</p>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* 6) Uploaded Photos */}
          <div>
            <SectionBoxSubtitle>Uploaded Photos</SectionBoxSubtitle>
            {photos.length === 0 ? (
              <p className="text-gray-500 mt-2">No photos uploaded</p>
            ) : (
              <div className="grid grid-cols-6 gap-2 mt-4">
                {photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Photo ${index + 1}`}
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