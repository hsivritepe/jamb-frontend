"use client";

export const dynamic = "force-dynamic";
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
import { getSessionItem, setSessionItem } from "@/utils/session";
import { usePhotos } from "@/context/PhotosContext";

/**
 * formatWithSeparator:
 * Formats a numeric value with commas and exactly two decimals (e.g., 1234.56).
 */
function formatWithSeparator(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * formatMobileNoDecimals:
 * Formats a number with no decimals for mobile displays.
 */
function formatMobileNoDecimals(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * getTaxRateForState:
 * Returns a combined (state + local) tax rate for a given state (e.g., "CA").
 * If not found, returns 0.
 */
function getTaxRateForState(stateName: string): number {
  if (!stateName) return 0;
  const row = taxRatesUSA.taxRates.find(
    (t) => t.state.toLowerCase() === stateName.toLowerCase()
  );
  return row ? row.combinedStateAndLocalTaxRate : 0;
}

export default function RoomsEstimate() {
  const router = useRouter();

  // Load from session
  const selectedRooms: string[] = getSessionItem("rooms_selectedSections", []);
  const allRooms = [...ROOMS.indoor, ...ROOMS.outdoor];
  const chosenRooms = selectedRooms
    .map((id) => allRooms.find((r) => r.id === id))
    .filter((r): r is Exclude<typeof r, undefined> => r !== undefined);

  useEffect(() => {
    if (selectedRooms.length === 0 || chosenRooms.length !== selectedRooms.length) {
      router.push("/rooms");
    }
  }, [selectedRooms, chosenRooms, router]);

  const { photos } = usePhotos();
  const description: string = getSessionItem("description", "");
  const stateName: string = getSessionItem("stateName", "");
  const zip: string = getSessionItem("zip", "");
  const city: string = getSessionItem("city", "");
  const country: string = getSessionItem("country", "");
  const address: string = getSessionItem("address", "");

  // Services chosen: { roomId: { serviceId: quantity } }
  const selectedServicesState: Record<string, Record<string, number>> =
    getSessionItem("rooms_selectedServicesWithQuantity", {});

  // Detailed cost breakdown for each service
  const calculationResultsMap: Record<string, any> = getSessionItem("calculationResultsMap", {});

  // Possibly user-owned finishing materials (if used)
  const clientOwnedMaterials: Record<string, string[]> =
    getSessionItem("clientOwnedMaterials", {});

  // Check if any service is selected and address is provided
  useEffect(() => {
    const anySelected = chosenRooms.some((room) => {
      const roomServices = selectedServicesState[room.id] || {};
      return Object.keys(roomServices).length > 0;
    });
    if (!anySelected || !address.trim()) {
      router.push("/rooms");
    }
  }, [chosenRooms, selectedServicesState, address, router]);

  // Service time selection (date, timeCoefficient)
  const [selectedTime, setSelectedTime] = useState<string | null>(
    () => getSessionItem("selectedTime", null)
  );
  const [timeCoefficient, setTimeCoefficient] = useState<number>(
    () => getSessionItem("timeCoefficient", 1)
  );

  useEffect(() => {
    setSessionItem("selectedTime", selectedTime);
  }, [selectedTime]);
  useEffect(() => {
    setSessionItem("timeCoefficient", timeCoefficient);
  }, [timeCoefficient]);

  // Allows manual override of material cost if needed
  const [overrideCalcResults, setOverrideCalcResults] = useState<Record<string, any>>({});

  function getCalcResultFor(serviceId: string) {
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

  function calculateLaborSubtotal(): number {
    let total = 0;
    chosenRooms.forEach((room) => {
      const roomServices = selectedServicesState[room.id] || {};
      Object.keys(roomServices).forEach((svcId) => {
        const cr = getCalcResultFor(svcId);
        if (cr?.work_cost) {
          total += parseFloat(cr.work_cost) || 0;
        }
      });
    });
    return total;
  }

  function calculateMaterialsSubtotal(): number {
    let total = 0;
    chosenRooms.forEach((room) => {
      const roomServices = selectedServicesState[room.id] || {};
      Object.keys(roomServices).forEach((svcId) => {
        const cr = getCalcResultFor(svcId);
        if (cr?.material_cost) {
          total += parseFloat(cr.material_cost) || 0;
        }
      });
    });
    return total;
  }

  const laborSubtotal = calculateLaborSubtotal();
  const materialsSubtotal = calculateMaterialsSubtotal();
  const finalLabor = laborSubtotal * timeCoefficient;

  // Fees
  const serviceFeeOnLabor = finalLabor * 0.15;
  const serviceFeeOnMaterials = materialsSubtotal * 0.05;

  useEffect(() => {
    setSessionItem("serviceFeeOnLabor", serviceFeeOnLabor);
    setSessionItem("serviceFeeOnMaterials", serviceFeeOnMaterials);
  }, [serviceFeeOnLabor, serviceFeeOnMaterials]);

  const sumBeforeTax = finalLabor + materialsSubtotal + serviceFeeOnLabor + serviceFeeOnMaterials;
  const taxRatePercent = getTaxRateForState(stateName);
  const taxAmount = sumBeforeTax * (taxRatePercent / 100);
  const finalTotal = sumBeforeTax + taxAmount;

  useEffect(() => {
    setSessionItem("rooms_laborSubtotal", laborSubtotal);
    setSessionItem("rooms_materialsSubtotal", materialsSubtotal);
    setSessionItem("rooms_sumBeforeTax", sumBeforeTax);
    setSessionItem("rooms_taxRatePercent", taxRatePercent);
    setSessionItem("rooms_taxAmount", taxAmount);
    setSessionItem("rooms_estimateFinalTotal", finalTotal);
  }, [
    laborSubtotal,
    materialsSubtotal,
    sumBeforeTax,
    taxRatePercent,
    taxAmount,
    finalTotal,
  ]);

  function handleProceedToCheckout() {
    router.push("/rooms/checkout");
  }

  // Build structured data for categories
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

    const categoryServicesMap: Record<string, (typeof ALL_SERVICES)[number][]> = {};
    chosenRoomServiceIDs.forEach((serviceId) => {
      const catId = serviceId.split("-").slice(0, 2).join("-");
      if (!categoryServicesMap[catId]) {
        categoryServicesMap[catId] = [];
      }
      const svcObj = ALL_SERVICES.find((x) => x.id === serviceId);
      if (svcObj) {
        categoryServicesMap[catId].push(svcObj);
      }
    });

    roomsData[room.id] = { categoriesBySection, categoryServicesMap };
  }

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

  function getCategoryNameById(catId: string): string {
    const cat = ALL_CATEGORIES.find((x) => x.id === catId);
    return cat ? cat.title : catId;
  }

  return (
    <main className="min-h-screen pt-24">
      <div className="container mx-auto">
        <BreadCrumb items={ROOMS_STEPS} />
      </div>

      <div className="container mx-auto py-12 flex flex-col xl:flex-row gap-12">
        {/* Main estimate section */}
        <div className="w-full xl:max-w-[700px] bg-brand-light p-4 sm:p-6 rounded-xl border border-gray-300 overflow-hidden">
          <SectionBoxSubtitle>Estimate for Selected Rooms</SectionBoxSubtitle>

          {chosenRooms.map((room) => {
            const roomServices = selectedServicesState[room.id] || {};
            const hasServices = Object.keys(roomServices).length > 0;
            if (!hasServices) return null;

            const { categoriesBySection, categoryServicesMap } = roomsData[room.id];
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

                {Object.entries(categoriesBySection).map(([sectionName, catIds], secIdx) => {
                  const sectionNumber = secIdx + 1;
                  const relevantCats = catIds.filter((catId) => {
                    const arr = categoryServicesMap[catId] || [];
                    return arr.some((svc) => roomServices[svc.id] != null);
                  });
                  if (relevantCats.length === 0) return null;

                  return (
                    <div key={sectionName} className="mb-4 ml-0 sm:ml-2">
                      <h4 className="text-xl font-medium text-gray-700 mb-2">
                        {sectionNumber}. {sectionName}
                      </h4>

                      {relevantCats.map((catId, catIdx) => {
                        const catNumber = `${sectionNumber}.${catIdx + 1}`;
                        const catName = getCategoryNameById(catId);
                        const servicesArr = categoryServicesMap[catId] || [];
                        const chosenSvcs = servicesArr.filter(
                          (svc) => roomServices[svc.id] != null
                        );
                        if (chosenSvcs.length === 0) return null;

                        return (
                          <div key={catId} className="mb-4 ml-0 sm:ml-4">
                            <h5 className="text-lg font-medium text-gray-700 mb-2">
                              {catNumber}. {catName}
                            </h5>

                            {chosenSvcs.map((svc, svcIdx) => {
                              const svcNumber = `${catNumber}.${svcIdx + 1}`;
                              const cr = getCalcResultFor(svc.id);
                              const qty = roomServices[svc.id] || 1;
                              const laborVal = cr ? parseFloat(cr.work_cost) || 0 : 0;
                              const matVal = cr ? parseFloat(cr.material_cost) || 0 : 0;
                              const totalCost = laborVal + matVal;

                              return (
                                <div key={svc.id} className="mb-6 ml-0 sm:ml-4 space-y-2">
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
                                      onClick={() => removeFinishingMaterials(svc.id)}
                                      className="text-red-600 text-sm underline"
                                    >
                                      Remove finishing materials
                                    </button>
                                  )}

                                  {cr && (
                                    <div className="p-2 sm:p-4 bg-gray-50 border rounded">
                                      <div className="flex justify-between mb-3">
                                        <span className="text-sm font-medium text-gray-800">
                                          Labor
                                        </span>
                                        <span className="text-sm font-medium text-gray-700">
                                          {cr.work_cost
                                            ? `$${formatWithSeparator(parseFloat(cr.work_cost))}`
                                            : "—"}
                                        </span>
                                      </div>

                                      <div className="flex justify-between mb-3">
                                        <span className="text-sm font-medium text-gray-800">
                                          Materials, tools and equipment
                                        </span>
                                        <span className="text-sm font-medium text-gray-700">
                                          {cr.material_cost
                                            ? `$${formatWithSeparator(parseFloat(cr.material_cost))}`
                                            : "—"}
                                        </span>
                                      </div>

                                      {Array.isArray(cr.materials) && cr.materials.length > 0 && (
                                        <div className="mt-4">
                                          <table className="table-auto w-full text-sm text-gray-700">
                                            <thead>
                                              <tr className="border-b">
                                                <th className="py-2 px-1 text-left">Name</th>
                                                <th className="py-2 px-1 text-left">Price</th>
                                                <th className="py-2 px-1 text-left">Qty</th>
                                                <th className="py-2 px-1 text-left">Subtotal</th>
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                              {cr.materials.map((m: any, i: number) => {
                                                const priceVal = parseFloat(m.cost_per_unit);
                                                const subVal = parseFloat(m.cost);
                                                return (
                                                  <tr key={`${m.external_id}-${i}`}>
                                                    <td className="py-3 px-1">{m.name}</td>
                                                    <td className="py-3 px-1">
                                                      <span className="block sm:hidden">
                                                        ${formatMobileNoDecimals(priceVal)}
                                                      </span>
                                                      <span className="hidden sm:block">
                                                        ${formatWithSeparator(priceVal)}
                                                      </span>
                                                    </td>
                                                    <td className="py-3 px-3">{m.quantity}</td>
                                                    <td className="py-3 px-3">
                                                      <span className="block sm:hidden">
                                                        ${formatMobileNoDecimals(subVal)}
                                                      </span>
                                                      <span className="hidden sm:block">
                                                        ${formatWithSeparator(subVal)}
                                                      </span>
                                                    </td>
                                                  </tr>
                                                );
                                              })}
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
                })}

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

          {/* Overall summary */}
          <div className="pt-4 mt-4 border-t">
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-lg text-gray-600">Labor total:</span>
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
                  {formatWithSeparator(Math.abs(finalLabor - laborSubtotal))}
                </span>
              </div>
            )}
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Service Fee (15% on labor)</span>
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
              <span className="font-semibold text-xl text-gray-800">Subtotal</span>
              <span className="font-semibold text-xl text-gray-800">
                ${formatWithSeparator(sumBeforeTax)}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">
                Sales tax
                {stateName ? ` (${stateName})` : ""}
                {taxRatePercent > 0 ? ` (${taxRatePercent.toFixed(2)}%)` : ""}
              </span>
              <span>${formatWithSeparator(taxAmount)}</span>
            </div>
            <div className="flex justify-between text-2xl font-semibold mt-4">
              <span>Total</span>
              <span>${formatWithSeparator(finalTotal)}</span>
            </div>
          </div>

          {/* Address */}
          <div className="mt-6">
            <h3 className="font-semibold text-xl text-gray-800">Address</h3>
            <p className="text-gray-500 mt-2">
              {constructedAddress.trim() || "No address provided"}
            </p>
          </div>

          {/* Photos => from PhotosContext */}
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

          {/* Action buttons */}
          <div className="mt-6 space-y-4">
            <button
              onClick={handleProceedToCheckout}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold sm:font-medium hover:bg-blue-700 transition-colors"
            >
              Proceed to Checkout →
            </button>
          </div>
        </div>

        {/* Time picker column */}
        <div className="w-full xl:w-[500px]">
          <ServiceTimePicker
            subtotal={laborSubtotal}
            onConfirm={(date, coefficient) => {
              setSelectedTime(date);
              setTimeCoefficient(coefficient);
            }}
          />
        </div>
      </div>
    </main>
  );
}