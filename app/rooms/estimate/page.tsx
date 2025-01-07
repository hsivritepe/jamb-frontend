"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BreadCrumb from "@/components/ui/BreadCrumb";
import ServiceTimePicker from "@/components/ui/ServiceTimePicker";
import { SectionBoxSubtitle } from "@/components/ui/SectionBoxSubtitle";
import { ROOMS_STEPS } from "@/constants/navigation";
import { ROOMS } from "@/constants/rooms";
import { ALL_CATEGORIES } from "@/constants/categories";
import { ALL_SERVICES } from "@/constants/services";
import { taxRatesUSA } from "@/constants/taxRatesUSA";

// Formats a numeric value with commas and exactly two decimals
function formatWithSeparator(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Loads data from sessionStorage (JSON.parse). Returns defaultValue if on server or parse error
function loadFromSession<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  const savedValue = sessionStorage.getItem(key);
  try {
    return savedValue ? JSON.parse(savedValue) : defaultValue;
  } catch (error) {
    console.error(`Error parsing sessionStorage key "${key}":`, error);
    return defaultValue;
  }
}

// Saves data to sessionStorage (JSON.stringify)
function saveToSession(key: string, value: any) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(key, JSON.stringify(value));
  }
}

// Returns the combined state+local tax rate (in percentage) for a given state name. Returns 0 if the state is not found
function getTaxRateForState(stateName: string): number {
  if (!stateName) return 0;
  const row = taxRatesUSA.taxRates.find(
    (t) => t.state.toLowerCase() === stateName.toLowerCase()
  );
  return row ? row.combinedStateAndLocalTaxRate : 0;
}

export default function RoomsEstimate() {
  const router = useRouter();

  // Load selected rooms
  const selectedRooms: string[] = loadFromSession("rooms_selectedSections", []);
  const allRooms = [...ROOMS.indoor, ...ROOMS.outdoor];
  const chosenRooms = selectedRooms
    .map((id) => allRooms.find((r) => r.id === id))
    .filter((r): r is Exclude<typeof r, undefined> => r !== undefined);

  // Redirect if mismatch or no rooms
  useEffect(() => {
    if (
      selectedRooms.length === 0 ||
      chosenRooms.length !== selectedRooms.length
    ) {
      router.push("/rooms");
    }
  }, [selectedRooms, chosenRooms, router]);

  // Load data from session
  const address: string = loadFromSession("address", "");
  const photos: string[] = loadFromSession("photos", []);
  const description: string = loadFromSession("description", "");
  const stateName: string = loadFromSession("stateName", "");
  const zip: string = loadFromSession("zip", "");
  // Load city and country from session
  const city: string = loadFromSession("city", "");
  const country: string = loadFromSession("country", "");

  // Our selected services: { [roomId]: { [serviceId]: number } }
  const selectedServicesState: Record<
    string,
    Record<string, number>
  > = loadFromSession("rooms_selectedServicesWithQuantity", {});

  // Calculation results from the server
  const calculationResultsMap: Record<string, any> = loadFromSession(
    "calculationResultsMap",
    {}
  );

  // If the user has their own materials
  const clientOwnedMaterials: Record<string, string[]> = loadFromSession(
    "clientOwnedMaterials",
    {}
  );

  // Redirect if no services selected or no address
  useEffect(() => {
    const anySelected = chosenRooms.some((room) => {
      const roomServices = selectedServicesState[room.id] || {};
      return Object.keys(roomServices).length > 0;
    });
    if (!anySelected || !address.trim()) {
      router.push("/rooms");
    }
  }, [chosenRooms, selectedServicesState, address, router]);

  // Time selection (timeCoefficient)
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

  // Overridden results if user removes finishing materials
  const [overrideCalcResults, setOverrideCalcResults] = useState<
    Record<string, any>
  >({});

  function getCalcResultFor(serviceId: string): any {
    return overrideCalcResults[serviceId] || calculationResultsMap[serviceId];
  }

  function removeFinishingMaterials(serviceId: string) {
    const original = getCalcResultFor(serviceId);
    if (!original) return;
    const newObj = {
      ...original,
      material_cost: "0.00",
      materials: [],
      total: original.work_cost,
    };
    setOverrideCalcResults((prev) => ({ ...prev, [serviceId]: newObj }));
  }

  // Summation logic (labor, materials)
  function calculateLaborSubtotal(): number {
    let totalLabor = 0;
    for (const room of chosenRooms) {
      const roomServices = selectedServicesState[room.id] || {};
      for (const serviceId of Object.keys(roomServices)) {
        const cr = getCalcResultFor(serviceId);
        if (cr && cr.work_cost) {
          totalLabor += parseFloat(cr.work_cost) || 0;
        }
      }
    }
    return totalLabor;
  }

  function calculateMaterialsSubtotal(): number {
    let totalMat = 0;
    for (const room of chosenRooms) {
      const roomServices = selectedServicesState[room.id] || {};
      for (const serviceId of Object.keys(roomServices)) {
        const cr = getCalcResultFor(serviceId);
        if (cr && cr.material_cost) {
          totalMat += parseFloat(cr.material_cost) || 0;
        }
      }
    }
    return totalMat;
  }

  const laborSubtotal = calculateLaborSubtotal();
  const materialsSubtotal = calculateMaterialsSubtotal();
  // Apply timeCoefficient to labor only
  const finalLabor = laborSubtotal * timeCoefficient;
  // fees: 15% on labor, 5% on materials
  const serviceFeeOnLabor = finalLabor * 0.15;
  const serviceFeeOnMaterials = materialsSubtotal * 0.05;

  // Store them in session for the next page
  useEffect(() => {
    saveToSession("serviceFeeOnLabor", serviceFeeOnLabor);
    saveToSession("serviceFeeOnMaterials", serviceFeeOnMaterials);
  }, [serviceFeeOnLabor, serviceFeeOnMaterials]);

  // sumBeforeTax = final labor + materials + fees
  const sumBeforeTax =
    finalLabor + materialsSubtotal + serviceFeeOnLabor + serviceFeeOnMaterials;

  // Find tax rate from the state
  const taxRatePercent = getTaxRateForState(stateName);
  const taxAmount = sumBeforeTax * (taxRatePercent / 100);

  // final total
  const finalTotal = sumBeforeTax + taxAmount;

  // Proceeds to the next step (e.g., /rooms/checkout)
  function handleProceedToCheckout() {
    router.push("/rooms/checkout");
  }

  // Returns category title by id, or the id if no match found
  function getCategoryNameById(catId: string): string {
    const cat = ALL_CATEGORIES.find((x) => x.id === catId);
    return cat ? cat.title : catId;
  }

  // Build the data structure for each chosen room
  type RoomData = {
    categoriesBySection: Record<string, string[]>;
    categoryServicesMap: Record<string, (typeof ALL_SERVICES)[number][]>;
  };
  const roomsData: Record<string, RoomData> = {};

  for (const room of chosenRooms) {
    const chosenRoomServiceIDs = room.services.map((s) => s.id);

    const categoriesWithSection = room.services
      .map((svc) => {
        const catId = svc.id.split("-").slice(0, 2).join("-");
        return ALL_CATEGORIES.find((c) => c.id === catId) || null;
      })
      .filter(Boolean) as (typeof ALL_CATEGORIES)[number][];

    const categoriesBySection: Record<string, string[]> = {};
    categoriesWithSection.forEach((cat) => {
      if (!categoriesBySection[cat.section]) {
        categoriesBySection[cat.section] = [];
      }
      if (!categoriesBySection[cat.section].includes(cat.id)) {
        categoriesBySection[cat.section].push(cat.id);
      }
    });

    const categoryServicesMap: Record<string, (typeof ALL_SERVICES)[number][]> =
      {};
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

  // Construct address from city, stateName, zip, country
  let constructedAddress = "";
  if (city) constructedAddress += city;
  if (stateName) {
    if (constructedAddress) constructedAddress += ", ";
    constructedAddress += stateName;
  }
  if (zip) {
    if (constructedAddress) constructedAddress += " ";
    constructedAddress += zip;
  }
  if (country) {
    if (constructedAddress) constructedAddress += ", ";
    constructedAddress += country;
  }

  saveToSession("rooms_laborSubtotal", laborSubtotal);
  saveToSession("rooms_materialsSubtotal", materialsSubtotal);
  saveToSession("rooms_sumBeforeTax", sumBeforeTax);
  saveToSession("rooms_taxRatePercent", taxRatePercent);
  saveToSession("rooms_taxAmount", taxAmount);
  saveToSession("rooms_estimateFinalTotal", finalTotal);

  return (
    <main className="min-h-screen pt-24">
      <div className="container mx-auto">
        <BreadCrumb items={ROOMS_STEPS} />
      </div>

      <div className="container mx-auto py-12">
        <div className="flex gap-12">
          {/* Left column with Estimate content */}
          <div className="w-[700px]">
            <div className="bg-brand-light p-6 rounded-xl border border-gray-300 overflow-hidden">
              <SectionBoxSubtitle>Estimate for Selected Rooms</SectionBoxSubtitle>

              {chosenRooms.map((room) => {
                const roomServices = selectedServicesState[room.id] || {};
                const hasServices = Object.keys(roomServices).length > 0;
                if (!hasServices) return null;

                const { categoriesBySection, categoryServicesMap } =
                  roomsData[room.id];

                // Sum labor + materials for this room
                let roomLabor = 0;
                let roomMaterials = 0;
                Object.keys(roomServices).forEach((svcId) => {
                  const cr = getCalcResultFor(svcId);
                  if (!cr) return;
                  roomLabor += parseFloat(cr.work_cost) || 0;
                  roomMaterials += parseFloat(cr.material_cost) || 0;
                });
                const roomSubtotal = roomLabor + roomMaterials;

                return (
                  <div key={room.id} className="mb-6">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                      {room.title}
                    </h3>

                    {Object.entries(categoriesBySection).map(
                      ([sectionName, catIds], sectionIdx) => {
                        const sectionNumber = sectionIdx + 1;
                        const relevantCats = catIds.filter((catId) => {
                          const arr = categoryServicesMap[catId] || [];
                          return arr.some(
                            (svc) => roomServices[svc.id] != null
                          );
                        });
                        if (relevantCats.length === 0) return null;

                        return (
                          <div key={sectionName} className="mb-4 ml-2">
                            <h4 className="text-xl font-medium text-gray-700 mb-2">
                              {sectionNumber}. {sectionName}
                            </h4>

                            {relevantCats.map((catId, catIdx) => {
                              const catNumber = `${sectionNumber}.${
                                catIdx + 1
                              }`;
                              const catName = getCategoryNameById(catId);
                              const servicesInCat =
                                categoryServicesMap[catId] || [];
                              const chosenServices = servicesInCat.filter(
                                (svc) => roomServices[svc.id] != null
                              );
                              if (chosenServices.length === 0) return null;

                              return (
                                <div key={catId} className="mb-4 ml-4">
                                  <h5 className="text-lg font-medium text-gray-700 mb-2">
                                    {catNumber}. {catName}
                                  </h5>

                                  {chosenServices.map((svc, svcIdx) => {
                                    const svcNumber = `${catNumber}.${
                                      svcIdx + 1
                                    }`;
                                    const cr = getCalcResultFor(svc.id);
                                    const qty = roomServices[svc.id] || 1;
                                    const laborCost = cr
                                      ? parseFloat(cr.work_cost) || 0
                                      : 0;
                                    const matCost = cr
                                      ? parseFloat(cr.material_cost) || 0
                                      : 0;
                                    const totalCost = laborCost + matCost;

                                    return (
                                      <div
                                        key={svc.id}
                                        className="mb-6 ml-4 space-y-2"
                                      >
                                        <h6 className="font-medium text-md text-gray-700">
                                          {svcNumber}. {svc.title}
                                        </h6>
                                        {svc.description && (
                                          <p className="text-sm text-gray-500 mt-1">
                                            {svc.description}
                                          </p>
                                        )}

                                        <div className="flex items-center justify-between mt-1">
                                          <div className="text-md font-medium text-gray-700">
                                            {qty} {svc.unit_of_measurement}
                                          </div>
                                          <div className="text-md font-medium text-gray-700 mr-2">
                                            ${formatWithSeparator(totalCost)}
                                          </div>
                                        </div>

                                        {clientOwnedMaterials[svc.id] && (
                                          <button
                                            onClick={() =>
                                              removeFinishingMaterials(svc.id)
                                            }
                                            className="text-red-600 text-sm underline"
                                          >
                                            Remove finishing materials
                                          </button>
                                        )}

                                        {cr && (
                                          <div className="p-4 bg-gray-50 border rounded">
                                            <div className="flex justify-between mb-3">
                                              <span className="text-sm font-medium text-gray-800">
                                                Labor
                                              </span>
                                              <span className="text-sm font-medium text-gray-700">
                                                {cr.work_cost
                                                  ? `$${formatWithSeparator(
                                                      parseFloat(cr.work_cost)
                                                    )}`
                                                  : "—"}
                                              </span>
                                            </div>

                                            <div className="flex justify-between mb-3">
                                              <span className="text-sm font-medium text-gray-800">
                                                Materials, tools and equipment
                                              </span>
                                              <span className="text-sm font-medium text-gray-700">
                                                {cr.material_cost
                                                  ? `$${formatWithSeparator(
                                                      parseFloat(
                                                        cr.material_cost
                                                      )
                                                    )}`
                                                  : "—"}
                                              </span>
                                            </div>

                                            {Array.isArray(cr.materials) &&
                                              cr.materials.length > 0 && (
                                                <div className="mt-4">
                                                  <table className="table-auto w-full text-sm text-gray-700">
                                                    <thead>
                                                      <tr className="border-b">
                                                        <th className="py-2 px-1">
                                                          Name
                                                        </th>
                                                        <th className="py-2 px-1">
                                                          Price
                                                        </th>
                                                        <th className="py-2 px-1">
                                                          Qty
                                                        </th>
                                                        <th className="py-2 px-1">
                                                          Subtotal
                                                        </th>
                                                      </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200">
                                                      {cr.materials.map(
                                                        (m: any, i: number) => (
                                                          <tr
                                                            key={`${m.external_id}-${i}`}
                                                          >
                                                            <td className="py-3 px-1">
                                                              {m.name}
                                                            </td>
                                                            <td className="py-3 px-1">
                                                              $
                                                              {formatWithSeparator(
                                                                parseFloat(
                                                                  m.cost_per_unit
                                                                )
                                                              )}
                                                            </td>
                                                            <td className="py-3 px-3">
                                                              {m.quantity}
                                                            </td>
                                                            <td className="py-3 px-3">
                                                              $
                                                              {formatWithSeparator(
                                                                parseFloat(
                                                                  m.cost
                                                                )
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
                      }
                    )}

                    <div className="flex justify-between items-center mb-2 mt-2">
                      <span className="font-semibold text-lg text-gray-700">
                        {room.title} total:
                      </span>
                      <span className="font-semibold text-lg text-gray-700 mr-2">
                        ${formatWithSeparator(roomSubtotal)}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Final summary */}
              <div className="pt-4 mt-4 border-t">
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
                    Materials, tools and equipment:
                  </span>
                  <span className="font-semibold text-lg text-gray-600">
                    ${formatWithSeparator(materialsSubtotal)}
                  </span>
                </div>

                {timeCoefficient !== 1 && (
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">
                      {timeCoefficient > 1
                        ? "Surcharge (date selection)"
                        : "Discount (date selection)"}
                    </span>
                    <span
                      className={`font-semibold text-lg ${
                        timeCoefficient > 1 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {timeCoefficient > 1 ? "+" : "-"}$
                      {formatWithSeparator(
                        Math.abs(finalLabor - laborSubtotal)
                      )}
                    </span>
                  </div>
                )}

                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">
                    Service Fee (15% on labor)
                  </span>
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
                  <span className="font-semibold text-xl text-gray-800">
                    Subtotal
                  </span>
                  <span className="font-semibold text-xl text-gray-800">
                    ${formatWithSeparator(sumBeforeTax)}
                  </span>
                </div>

                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">
                    Sales tax
                    {stateName ? ` (${stateName})` : ""}
                    {taxRatePercent > 0
                      ? ` (${taxRatePercent.toFixed(2)}%)`
                      : ""}
                  </span>
                  <span>${formatWithSeparator(taxAmount)}</span>
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
                    subtotal={laborSubtotal}
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
                  <span>${formatWithSeparator(finalTotal)}</span>
                </div>
              </div>

              {/* Address: now combining city, stateName, zip, country */}
              <div className="mt-6">
                <h3 className="font-semibold text-xl text-gray-800">Address</h3>
                <p className="text-gray-500 mt-2">
                  {constructedAddress.trim() || "No address provided"}
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

              {/* Buttons */}
              <div className="mt-6 space-y-4">
                <button
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium"
                  onClick={handleProceedToCheckout}
                >
                  Proceed to Checkout →
                </button>
                <button
                  onClick={() => router.push("/rooms/details")}
                  className="w-full text-brand border border-brand py-3 rounded-lg font-medium"
                >
                  Add more services →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
