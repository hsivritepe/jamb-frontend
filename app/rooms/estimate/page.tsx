"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BreadCrumb from "@/components/ui/BreadCrumb";
import Button from "@/components/ui/Button";
import { SectionBoxSubtitle } from "@/components/ui/SectionBoxSubtitle";
import { ROOMS_STEPS } from "@/constants/navigation";
import { ALL_CATEGORIES } from "@/constants/categories";
import { ALL_SERVICES } from "@/constants/services";
import { ROOMS } from "@/constants/rooms";
import ServiceTimePicker from "@/components/ui/ServiceTimePicker";

/**
 * Utility function to format numeric values (e.g., prices) with commas
 * and **exactly two** decimals (e.g., 100 -> 100.00).
 */
const formatWithSeparator = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

/**
 * Save data to sessionStorage as JSON (only in browser).
 */
const saveToSession = (key: string, value: any) => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(key, JSON.stringify(value));
  }
};

/**
 * Load JSON-parsed data from sessionStorage or return a default if SSR or parse error.
 */
const loadFromSession = (key: string, defaultValue: any) => {
  if (typeof window === "undefined") return defaultValue;
  const savedValue = sessionStorage.getItem(key);
  try {
    return savedValue ? JSON.parse(savedValue) : defaultValue;
  } catch (error) {
    console.error(`Error parsing sessionStorage for key "${key}"`, error);
    return defaultValue;
  }
};

export default function RoomsEstimate() {
  const router = useRouter();

  // 1) Load array of selected room IDs from session
  const selectedRooms: string[] = loadFromSession("rooms_selectedSections", []);

  // 2) Gather "allRooms" from both indoor and outdoor, find the chosen ones
  const allRooms = [...ROOMS.indoor, ...ROOMS.outdoor];
  const chosenRooms = selectedRooms
    .map((roomId) => allRooms.find((r) => r.id === roomId))
    .filter((r): r is Exclude<typeof r, undefined> => r !== undefined);

  // If mismatch or no rooms chosen, redirect back
  useEffect(() => {
    if (selectedRooms.length === 0 || chosenRooms.length !== selectedRooms.length) {
      router.push("/rooms");
    }
  }, [selectedRooms, chosenRooms, router]);

  // 3) Load selected services with quantity for each room:
  //    { [roomId]: { [serviceId]: number } }
  const selectedServicesState: Record<string, Record<string, number>> =
    loadFromSession("rooms_selectedServicesWithQuantity", {});

  // 4) Load address, photos, and description
  const address: string = loadFromSession("address", "");
  const photos: string[] = loadFromSession("photos", []);
  const description: string = loadFromSession("description", "");

  // 5) Confirm at least one service is chosen across all rooms & we have an address
  useEffect(() => {
    const anyServiceSelected = chosenRooms.some((room) => {
      const roomServices = selectedServicesState[room.id] || {};
      return Object.keys(roomServices).length > 0;
    });
    if (!anyServiceSelected || !address.trim()) {
      router.push("/rooms");
    }
  }, [chosenRooms, selectedServicesState, address, router]);

  // 6) Time pick modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(() =>
    loadFromSession("selectedTime", null)
  );
  const [timeCoefficient, setTimeCoefficient] = useState<number>(() =>
    loadFromSession("timeCoefficient", 1)
  );

  useEffect(() => {
    saveToSession("selectedTime", selectedTime);
  }, [selectedTime]);

  useEffect(() => {
    saveToSession("timeCoefficient", timeCoefficient);
  }, [timeCoefficient]);

  // 7) Calculate total cost: sum of all room subtotals
  function calculateRoomSubtotal(roomId: string): number {
    let total = 0;
    const roomServices = selectedServicesState[roomId] || {};
    for (const [serviceId, qty] of Object.entries(roomServices)) {
      const svc = ALL_SERVICES.find((s) => s.id === serviceId);
      if (svc) {
        total += svc.price * (qty || 1);
      }
    }
    return total;
  }

  function calculateAllRoomsSubtotal(): number {
    return chosenRooms.reduce((sum, room) => sum + calculateRoomSubtotal(room.id), 0);
  }

  const subtotal = calculateAllRoomsSubtotal();
  const adjustedSubtotal = subtotal * timeCoefficient;
  const salesTax = adjustedSubtotal * 0.0825;
  const total = adjustedSubtotal + salesTax;

  // 8) Build structure for display
  //    We want to group each room's services by "section -> category -> service"
  type RoomData = {
    categoriesBySection: Record<string, string[]>;
    categoryServicesMap: Record<string, typeof ALL_SERVICES[number][]>;
  };

  const roomsData: Record<string, RoomData> = {};

  // For each chosen room, gather section->category->services
  for (const room of chosenRooms) {
    const chosenRoomServiceIDs = room.services.map((s) => s.id);

    // Extract categories from each service's ID
    const categoriesWithSection = room.services
      .map((svc) => {
        const catId = svc.id.split("-").slice(0, 2).join("-");
        return ALL_CATEGORIES.find((c) => c.id === catId) || null;
      })
      .filter(Boolean) as (typeof ALL_CATEGORIES)[number][];

    // Build a map: sectionName -> array of category IDs
    const categoriesBySection: Record<string, string[]> = {};
    categoriesWithSection.forEach((cat) => {
      if (!categoriesBySection[cat.section]) {
        categoriesBySection[cat.section] = [];
      }
      if (!categoriesBySection[cat.section].includes(cat.id)) {
        categoriesBySection[cat.section].push(cat.id);
      }
    });

    // Build a map: categoryId -> array of services
    const categoryServicesMap: Record<string, typeof ALL_SERVICES[number][]> = {};
    chosenRoomServiceIDs.forEach((serviceId) => {
      const catId = serviceId.split("-").slice(0, 2).join("-");
      if (!categoryServicesMap[catId]) {
        categoryServicesMap[catId] = [];
      }
      const svcObj = ALL_SERVICES.find((s) => s.id === serviceId);
      if (svcObj) {
        categoryServicesMap[catId].push(svcObj);
      }
    });

    roomsData[room.id] = { categoriesBySection, categoryServicesMap };
  }

  // Helper: get user-friendly category name
  function getCategoryNameById(catId: string): string {
    const catObj = ALL_CATEGORIES.find((c) => c.id === catId);
    return catObj ? catObj.title : catId;
  }

  // 9) On user click "Proceed to Checkout"
  const handleProceedToCheckout = () => {
    saveToSession("selectedTime", selectedTime);
    saveToSession("timeCoefficient", timeCoefficient);

    // Optionally, store the chosenRooms with their titles to session
    // so the next page can also show them if needed
    const chosenRoomTitles = chosenRooms.map((rm) => ({
      id: rm.id,
      title: rm.title,
    }));
    saveToSession("chosenRoomTitles", chosenRoomTitles);

    router.push("/rooms/checkout");
  };

  // 10) Return final JSX
  return (
    <main className="min-h-screen pt-24">
      <div className="container mx-auto">
        {/* Breadcrumb for Room Steps */}
        <BreadCrumb items={ROOMS_STEPS} />
      </div>

      <div className="container mx-auto py-12">
        <div className="flex gap-12">
          {/* LEFT COLUMN: main estimate details */}
          <div className="w-[700px]">
            <div className="bg-brand-light p-6 rounded-xl border border-gray-300 overflow-hidden">
              <SectionBoxSubtitle>Estimate</SectionBoxSubtitle>

              {/* If truly no services, show a fallback */}
              {chosenRooms.every((r) => {
                const s = selectedServicesState[r.id] || {};
                return Object.keys(s).length === 0;
              }) ? (
                <div className="text-left text-gray-500 text-medium mt-4">
                  No services selected
                </div>
              ) : (
                <>
                  {/* Show each chosen room with section/category grouping */}
                  {chosenRooms.map((room) => {
                    const roomServices = selectedServicesState[room.id] || {};
                    const hasServices = Object.keys(roomServices).length > 0;
                    if (!hasServices) return null;

                    const { categoriesBySection, categoryServicesMap } = roomsData[room.id];
                    const roomSubtotal = calculateRoomSubtotal(room.id);

                    return (
                      <div key={room.id} className="mb-6">
                        {/* Always show the room title, even if only 1 */}
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                          {room.title}
                        </h3>

                        {Object.entries(categoriesBySection).map(
                          ([sectionName, catIds]) => {
                            // Filter only categories that have services chosen
                            const categoriesWithSelected = catIds.filter((catId) =>
                              (categoryServicesMap[catId] || []).some(
                                (svc) => roomServices[svc.id] !== undefined
                              )
                            );
                            if (categoriesWithSelected.length === 0) return null;

                            return (
                              <div key={sectionName} className="mb-4 ml-2">
                                <h4 className="text-lg font-medium text-gray-700 mb-2">
                                  {sectionName}
                                </h4>
                                {categoriesWithSelected.map((catId) => {
                                  const catName = getCategoryNameById(catId);
                                  const servicesForCategory = categoryServicesMap[catId] || [];
                                  const chosenServices = servicesForCategory.filter(
                                    (svc) => roomServices[svc.id] !== undefined
                                  );
                                  if (chosenServices.length === 0) return null;

                                  return (
                                    <div key={catId} className="mb-4 ml-4">
                                      <h5 className="text-md font-medium text-gray-700 mb-2">
                                        {catName}
                                      </h5>
                                      <ul className="space-y-2 pb-4">
                                        {chosenServices.map((svc) => {
                                          const quantity = roomServices[svc.id] || 1;
                                          return (
                                            <li
                                              key={svc.id}
                                              className="grid grid-cols-3 gap-2 text-sm text-gray-600"
                                              style={{
                                                gridTemplateColumns: "55% 18% 25%",
                                                width: "100%",
                                              }}
                                            >
                                              {/* Service Title + Full Description */}
                                              <div className="truncate overflow-hidden">
                                                <span className="font-medium text-gray-800">
                                                  {svc.title}
                                                </span>
                                                {svc.description && (
                                                  <p className="text-gray-500 mt-1 text-sm whitespace-normal">
                                                    {svc.description}
                                                  </p>
                                                )}
                                              </div>

                                              {/* Quantity + Unit */}
                                              <div className="text-right">
                                                {quantity} {svc.unit_of_measurement}
                                              </div>

                                              {/* Price */}
                                              <div className="text-right">
                                                ${formatWithSeparator(svc.price * quantity)}
                                              </div>
                                            </li>
                                          );
                                        })}
                                      </ul>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          }
                        )}

                        {/* Show room total */}
                        <div className="flex justify-between items-center mb-2 ml-2">
                          <span className="font-medium text-gray-800">
                            {room.title} Total:
                          </span>
                          <span className="font-medium text-blue-600">
                            ${formatWithSeparator(roomSubtotal)}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Subtotal across all rooms */}
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xl font-semibold text-gray-800">
                      Subtotal:
                    </span>
                    <span className="text-2xl font-semibold text-blue-600">
                      ${formatWithSeparator(subtotal)}
                    </span>
                  </div>

                  {/* TimeCoefficient, tax, total */}
                  <div className="pt-4 mt-4">
                    {timeCoefficient !== 1 && (
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">
                          {timeCoefficient > 1 ? "Surcharge" : "Discount"}
                        </span>
                        <span
                          className={`font-semibold text-lg ${
                            timeCoefficient > 1
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {timeCoefficient > 1 ? "+" : "-"}$
                          {formatWithSeparator(Math.abs(subtotal * (timeCoefficient - 1)))}
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

                    {/* Time picker button */}
                    <button
                      onClick={() => setShowModal(true)}
                      className={`w-full py-3 rounded-lg font-medium mt-4 border ${
                        selectedTime
                          ? "text-red-500 border-red-500"
                          : "text-brand border-brand"
                      }`}
                    >
                      {selectedTime ? "Change Date" : "Select Available Time"}
                    </button>

                    {selectedTime && (
                      <p className="mt-2 text-gray-700 text-center font-medium">
                        Selected Date:{" "}
                        <span className="text-blue-600">{selectedTime}</span>
                      </p>
                    )}

                    {showModal && (
                      <ServiceTimePicker
                        subtotal={subtotal}
                        onClose={() => setShowModal(false)}
                        onConfirm={(date, coefficient) => {
                          setSelectedTime(date);
                          setTimeCoefficient(coefficient);
                          setShowModal(false);
                        }}
                      />
                    )}

                    <div className="flex justify-between text-2xl font-semibold mt-4">
                      <span>Total</span>
                      <span>${formatWithSeparator(total)}</span>
                    </div>
                  </div>
                </>
              )}

              {/* Address */}
              <div className="mt-6">
                <h3 className="font-semibold text-xl text-gray-800">Address</h3>
                <p className="text-gray-500 mt-2">
                  {address || "No address provided"}
                </p>
              </div>

              {/* Photos */}
              <div className="mt-6">
                <h3 className="font-semibold text-xl text-gray-800">
                  Uploaded Photos
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`Uploaded photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-300 transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <span className="text-white font-medium">
                          Photo {index + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {photos.length === 0 && (
                  <p className="text-medium text-gray-500 mt-2">
                    No photos uploaded
                  </p>
                )}
              </div>

              {/* Additional details */}
              <div className="mt-6">
                <h3 className="font-semibold text-xl text-gray-800">
                  Additional details
                </h3>
                <p className="text-gray-500 mt-2 whitespace-pre-wrap">
                  {description || "No details provided"}
                </p>
              </div>

              {/* Buttons: Proceed or add more */}
              <div className="mt-6 space-y-4">
                <button
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium"
                  onClick={handleProceedToCheckout}
                >
                  Proceed to Checkout &nbsp;→
                </button>
                <button
                  onClick={() => router.push("/rooms/details")}
                  className="w-full text-brand border border-brand py-3 rounded-lg font-medium"
                >
                  Add more services &nbsp;→
                </button>
              </div>
            </div>
          </div>

          {/* (Optional) RIGHT COLUMN: Additional panel or empty */}
        </div>
      </div>
    </main>
  );
}