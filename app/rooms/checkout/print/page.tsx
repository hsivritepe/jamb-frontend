"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ALL_SERVICES } from "@/constants/services";
import { ALL_CATEGORIES } from "@/constants/categories";
import { ROOMS } from "@/constants/rooms";

const loadFromSession = (key: string, defaultValue: any = null) => {
  if (typeof window === "undefined") return defaultValue;
  const savedValue = sessionStorage.getItem(key);
  try {
    return savedValue ? JSON.parse(savedValue) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const formatWithSeparator = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

function buildEstimateNumber(address: string): string {
  let city = "NOC";
  let zip = "00000";

  if (address) {
    const parts = address.split(",").map((p) => p.trim());
    if (parts.length > 0) {
      city = parts[0].slice(0, 3).toUpperCase(); // e.g. "New" from "New York"
    }
    if (parts.length > 1) {
      // second part is often zip code
      zip = parts[1].replace(/\D/g, "") || "00000"; 
    }
  }

  const now = new Date();
  const yyyy = String(now.getFullYear());
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dateString = `${yyyy}${mm}${dd}`;
  const hh = String(now.getHours()).padStart(2, "0");
  const mins = String(now.getMinutes()).padStart(2, "0");
  const timeString = hh + mins;

  return `${city}-${zip}-${dateString}-${timeString}`;
}

export default function PrintRoomsEstimate() {
  const router = useRouter();

  // 1) Load data
  const selectedServicesState: Record<string, Record<string, number>> = loadFromSession(
    "rooms_selectedServicesWithQuantity",
    {}
  );
  const address: string = loadFromSession("address", "");
  const photos: string[] = loadFromSession("photos", []);
  const description: string = loadFromSession("description", "");
  const selectedTime: string | null = loadFromSession("selectedTime", null);
  const timeCoefficient: number = loadFromSession("timeCoefficient", 1);

  // 2) Basic check
  useEffect(() => {
    let hasAnyService = false;
    for (const roomId in selectedServicesState) {
      if (Object.keys(selectedServicesState[roomId]).length > 0) {
        hasAnyService = true;
        break;
      }
    }
    if (!hasAnyService || !address.trim()) {
      router.push("/rooms/estimate");
    }
  }, [selectedServicesState, address, router]);

  // 3) Calculate totals
  function calculateSubtotal(): number {
    let sum = 0;
    for (const roomId in selectedServicesState) {
      for (const [serviceId, qty] of Object.entries(
        selectedServicesState[roomId]
      )) {
        const svc = ALL_SERVICES.find((s) => s.id === serviceId);
        if (svc) sum += svc.price * (qty || 1);
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

  // 4) Autoprint once page loads
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // 5) gather rooms
  const allRooms = [...ROOMS.indoor, ...ROOMS.outdoor];
  function getRoomById(roomId: string) {
    return allRooms.find((r) => r.id === roomId);
  }
  function getCategoryNameById(catId: string) {
    const catObj = ALL_CATEGORIES.find((c) => c.id === catId);
    return catObj ? catObj.title : catId;
  }
  function getCategoryId(serviceId: string) {
    return serviceId.split("-").slice(0, 2).join("-");
  }

  // Generate the temporary estimate number
  const estimateNumber = buildEstimateNumber(address);

  return (
    <div className="print-page p-4">
      {/*
        Add a custom style or global CSS to hide header/footer during printing:
        @media print {
          header, footer { display: none !important; }
        }
      */}

      {/* Minimal brand logo + Title + Estimate # */}
      <div className="flex justify-between items-center mb-4 mt-24">
        <div className="text-left">
          <h1 className="text-2xl font-bold">Estimate</h1>
          <h1 className="text-sm text-gray-500 mt-1">
            {estimateNumber} (temporary)
          </h1>
        </div>
      </div>

      {/* If user chose a date/time */}
      {selectedTime && (
        <p className="mb-2 text-gray-700">
          <strong>Date of Service:</strong> {selectedTime}
        </p>
      )}

      {/* Basic info */}
      <p className="mb-2">
        <strong>Address:</strong> {address}
      </p>
      <p className="mb-2">
        <strong>Details:</strong>{" "}
        {description || "No details provided"}
      </p>

      {/* Rooms + services grouped by category */}
      <div className="mt-6">
        {Object.entries(selectedServicesState).map(([roomId, services]) => {
          const svcIds = Object.keys(services);
          if (svcIds.length === 0) return null;
          const roomObj = getRoomById(roomId);
          const roomTitle = roomObj ? roomObj.title : roomId;

          let roomSubtotal = 0;
          svcIds.forEach((id) => {
            const qty = services[id] || 1;
            const found = ALL_SERVICES.find((s) => s.id === id);
            if (found) roomSubtotal += found.price * qty;
          });

          const categoryGroups: Record<string, string[]> = {};
          svcIds.forEach((id) => {
            const catId = getCategoryId(id);
            if (!categoryGroups[catId]) categoryGroups[catId] = [];
            categoryGroups[catId].push(id);
          });

          return (
            <div key={roomId} className="mb-4">
              <h2 className="text-xl font-semibold mb-2">{roomTitle}</h2>
              {Object.entries(categoryGroups).map(([catId, ids]) => {
                const catTitle = getCategoryNameById(catId);
                const chosenSvcs = ids
                  .map((sId) => ALL_SERVICES.find((s) => s.id === sId))
                  .filter(Boolean) as (typeof ALL_SERVICES)[number][];

                return (
                  <div key={catId} className="ml-4 mb-3">
                    <h3 className="text-lg font-medium">{catTitle}</h3>
                    <ul className="pl-3">
                      {chosenSvcs.map((svc) => {
                        const quantity = services[svc.id] || 1;
                        return (
                          <li
                            key={svc.id}
                            className="flex justify-between items-start"
                          >
                            <div className="w-2/3">
                              <p className="font-medium">{svc.title}</p>
                              {svc.description && (
                                <p className="text-sm text-gray-600">
                                  {svc.description}
                                </p>
                              )}
                              <p className="text-sm text-gray-700 mt-1">
                                {quantity} {svc.unit_of_measurement}
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
                );
              })}

              {/* Room total */}
              <div className="ml-4 flex justify-between font-semibold mt-1">
                <span>{roomTitle} Total:</span>
                <span>${formatWithSeparator(roomSubtotal)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summaries */}
      <div className="mt-6 border-t pt-2">
        {hasSurchargeOrDiscount && (
          <div className="flex justify-between">
            <span>
              {timeCoefficient > 1 ? "Surcharge" : "Discount"}:
            </span>
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

      {/* Photos (optional) */}
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