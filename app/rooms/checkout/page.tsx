"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BreadCrumb from "@/components/ui/BreadCrumb";
import { SectionBoxTitle } from "@/components/ui/SectionBoxTitle";
import { SectionBoxSubtitle } from "@/components/ui/SectionBoxSubtitle";
import { ROOMS_STEPS } from "@/constants/navigation";
import { ALL_SERVICES } from "@/constants/services";
import { ALL_CATEGORIES } from "@/constants/categories";
import { ROOMS } from "@/constants/rooms"; // For retrieving full room info (title, etc.)

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

// Utility function to format numeric values with commas and two decimal places
const formatWithSeparator = (value: number): string =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(value);

export default function RoomsEstimatePage() {
  const router = useRouter();

  // Load the key data from session
  // - selectedServicesState: { [roomId]: { [serviceId]: quantity } }
  // - selectedTime and timeCoefficient for surcharges/discounts
  const selectedServicesState: Record<string, Record<string, number>> = loadFromSession(
    "rooms_selectedServicesWithQuantity",
    {}
  );
  const address: string = loadFromSession("address", "");
  const photos: string[] = loadFromSession("photos", []);
  const description: string = loadFromSession("description", "");
  const selectedTime: string | null = loadFromSession("selectedTime", null);
  const timeCoefficient: number = loadFromSession("timeCoefficient", 1);

  // If the user didn't actually select anything or no address, redirect back
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

  // Calculate the total cost
  // 1) Sum up all services across all rooms
  // 2) Apply timeCoefficient
  // 3) Apply sales tax
  const calculateSubtotal = (): number => {
    let total = 0;
    for (const roomId in selectedServicesState) {
      for (const [serviceId, quantity] of Object.entries(selectedServicesState[roomId])) {
        const svc = ALL_SERVICES.find((s) => s.id === serviceId);
        if (svc) {
          total += svc.price * (quantity || 1);
        }
      }
    }
    return total;
  };

  const subtotal = calculateSubtotal();
  const adjustedSubtotal = subtotal * timeCoefficient;
  const salesTax = adjustedSubtotal * 0.0825; // 8.25% tax
  const total = adjustedSubtotal + salesTax;

  // If timeCoefficient !== 1, then there's a surcharge (>1) or discount (<1)
  const hasSurchargeOrDiscount = timeCoefficient !== 1;
  const surchargeOrDiscountAmount = hasSurchargeOrDiscount
    ? Math.abs(subtotal * (timeCoefficient - 1))
    : 0;

  // Retrieve all possible rooms so we can show the correct name for each selected room
  const allRooms = [...ROOMS.indoor, ...ROOMS.outdoor];

  // Helper: get the room object by ID to show its title, or fallback to ID
  const getRoomById = (roomId: string) => {
    return allRooms.find((r) => r.id === roomId);
  };

  // Helper: get category name from ID
  const getCategoryNameById = (catId: string): string => {
    const catObj = ALL_CATEGORIES.find((c) => c.id === catId);
    return catObj ? catObj.title : catId;
  };

  // Group the services for each room by category ID
  // category ID is the first two segments, e.g. "1-4" from "1-4-2"
  function getCategoryId(serviceId: string): string {
    return serviceId.split("-").slice(0, 2).join("-");
  }

  // "Place your order" logic
  const handlePlaceOrder = () => {
    alert("Rooms: Your order has been placed!");
  };

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto">
        <BreadCrumb items={ROOMS_STEPS} />
      </div>

      <div className="container mx-auto pt-8">
        {/* Top actions: back link & place order */}
        <div className="flex justify-between items-center">
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

        <SectionBoxTitle className="mt-8">
          Checkout
        </SectionBoxTitle>

        {/* Main container for final estimate */}
        <div className="bg-white border border-gray-300 mt-8 p-6 rounded-lg space-y-6">
          {/* 1) Final Estimate */}
          <div>
            <SectionBoxSubtitle>Final Estimate</SectionBoxSubtitle>

            {/* We'll display each selected room, its chosen services, grouped by category */}
            <div className="mt-4 space-y-8">
              {Object.entries(selectedServicesState).map(([roomId, servicesMap]) => {
                // If this room has no selected services, skip
                const roomServiceIds = Object.keys(servicesMap);
                if (roomServiceIds.length === 0) return null;

                // Find the room object to get the room title
                const roomObj = getRoomById(roomId);
                const roomTitle = roomObj ? roomObj.title : roomId;

                // Build a map categoryId -> array of service IDs for that category
                const categoryMap: Record<string, string[]> = {};
                for (const serviceId of roomServiceIds) {
                  const catId = getCategoryId(serviceId);
                  if (!categoryMap[catId]) {
                    categoryMap[catId] = [];
                  }
                  categoryMap[catId].push(serviceId);
                }

                // We'll also compute the total for this room
                const roomSubtotal = roomServiceIds.reduce((acc, svcId) => {
                  const q = servicesMap[svcId] || 0;
                  const s = ALL_SERVICES.find((ss) => ss.id === svcId);
                  return s ? acc + s.price * q : acc;
                }, 0);

                return (
                  <div key={roomId} className="space-y-4">
                    {/* Show the room name, even if only one room */}
                    <h3 className="text-xl font-semibold text-gray-800">
                      {roomTitle}
                    </h3>

                    {/* Now display each category in that room */}
                    {Object.entries(categoryMap).map(([catId, svcIds]) => {
                      // For each category, find the category title
                      const catTitle = getCategoryNameById(catId);

                      // Build the list of services in that category
                      const chosenServices = svcIds.map((svId) =>
                        ALL_SERVICES.find((s) => s.id === svId)
                      ).filter(Boolean) as (typeof ALL_SERVICES)[number][];

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
                                    <span>{quantity.toLocaleString("en-US")} </span>
                                    <span>{svc.unit_of_measurement}</span>
                                  </div>
                                </div>
                                <div className="text-right mt-auto">
                                  <span className="block text-gray-800 font-medium">
                                    ${formatWithSeparator(svc.price * quantity)}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}

                    {/* Show this room's subtotal */}
                    <div className="flex justify-between items-center ml-4 mt-2">
                      <span className="font-semibold text-gray-800">Room Total:</span>
                      <span className="font-semibold text-blue-600">
                        ${formatWithSeparator(roomSubtotal)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 2) Overall cost summary (all rooms combined) */}
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

          {/* 3) Date of Service */}
          <div>
            <SectionBoxSubtitle>Date of Service</SectionBoxSubtitle>
            <p className="text-gray-800">
              {selectedTime ? selectedTime : "No date selected"}
            </p>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* 4) Problem Description */}
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
            <p className="text-gray-800">
              {address || "No address provided"}
            </p>
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