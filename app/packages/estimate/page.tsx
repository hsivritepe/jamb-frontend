"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BreadCrumb from "@/components/ui/BreadCrumb";
import Button from "@/components/ui/Button";
import { SectionBoxSubtitle } from "@/components/ui/SectionBoxSubtitle";
import { PACKAGES_STEPS } from "@/constants/navigation";
import { ALL_CATEGORIES } from "@/constants/categories";
import { ALL_SERVICES } from "@/constants/services";
import ServiceTimePicker from "@/components/ui/ServiceTimePicker";

/** Format a number with commas and 2 decimals */
function formatWithSeparator(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Format an integer with commas (no decimals) */
function formatQuantity(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

/** Save JSON to sessionStorage */
function saveToSession(key: string, value: any) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(key, JSON.stringify(value));
  }
}

/** Load JSON from sessionStorage or fallback to default */
function loadFromSession<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  const stored = sessionStorage.getItem(key);
  try {
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export default function EstimatePage() {
  const router = useRouter();

  // 1) Retrieve the current packageId from session (so we can link back to the correct "Services" page).
  const storedPackageId = loadFromSession("packages_currentPackageId", null);

  // 2) Retrieve the user's selected services from session
  const selectedServicesFromSession = loadFromSession("packages_selectedServices", {
    indoor: {},
    outdoor: {},
  });

  // Merge indoor + outdoor
  const mergedSelected: Record<string, number> = {
    ...selectedServicesFromSession.indoor,
    ...selectedServicesFromSession.outdoor,
  };

  // If no services selected, redirect them back to the services page for that package
  useEffect(() => {
    if (Object.keys(mergedSelected).length === 0) {
      router.push(
        storedPackageId
          ? `/packages/services?packageId=${storedPackageId}`
          : "/packages/services"
      );
    }
  }, [mergedSelected, router, storedPackageId]);

  // 3) Retrieve the house info
  const houseInfo = loadFromSession("packages_houseInfo", {
    country: "",
    city: "",
    zip: "",
    addressLine: "",
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

  // 4) Retrieve uploaded photos and additional description
  const photos: string[] = loadFromSession("packages_photos", []);
  const description: string = loadFromSession("packages_description", "");

  // 5) State for time scheduling pop-up (and selected time, coefficient)
  const [showModal, setShowModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(() =>
    loadFromSession("packages_selectedTime", null)
  );
  const [timeCoefficient, setTimeCoefficient] = useState<number>(() =>
    loadFromSession("packages_timeCoefficient", 1)
  );

  // Persist changes
  useEffect(() => {
    saveToSession("packages_selectedTime", selectedTime);
  }, [selectedTime]);
  useEffect(() => {
    saveToSession("packages_timeCoefficient", timeCoefficient);
  }, [timeCoefficient]);

  // 6) Calculate the pricing
  function calculateSubtotal(): number {
    let sum = 0;
    for (const [svcId, qty] of Object.entries(mergedSelected)) {
      const svcObj = ALL_SERVICES.find((s) => s.id === svcId);
      if (svcObj) {
        sum += svcObj.price * qty;
      }
    }
    return sum;
  }
  const subtotal = calculateSubtotal();
  // Apply any timeCoefficient to the subtotal
  const adjustedSubtotal = subtotal * timeCoefficient;
  // A sample sales tax rate (8.25% as an example)
  const salesTax = adjustedSubtotal * 0.0825;
  const total = adjustedSubtotal + salesTax;

  // 7) Handle "Proceed to checkout"
  function handleProceedToCheckout() {
    // Make sure time is chosen and coefficient is stored
    saveToSession("packages_selectedTime", selectedTime);
    saveToSession("packages_timeCoefficient", timeCoefficient);
    // Go to checkout page
    router.push("/packages/checkout");
  }

  // We'll group the selected services by section -> category
  type ServiceItem = { svcObj: (typeof ALL_SERVICES)[number]; qty: number };
  const itemsArr: ServiceItem[] = Object.entries(mergedSelected)
    .map(([svcId, qty]) => {
      const svcObj = ALL_SERVICES.find((s) => s.id === svcId);
      return svcObj ? { svcObj, qty } : null;
    })
    .filter(Boolean) as ServiceItem[];

  const summaryBySection: Record<string, Record<string, ServiceItem[]>> = {};
  itemsArr.forEach(({ svcObj, qty }) => {
    const catId = svcObj.id.split("-").slice(0, 2).join("-");
    const catObj = ALL_CATEGORIES.find((c) => c.id === catId);
    if (!catObj) return;

    const sectionName = catObj.section;
    if (!summaryBySection[sectionName]) {
      summaryBySection[sectionName] = {};
    }
    if (!summaryBySection[sectionName][catId]) {
      summaryBySection[sectionName][catId] = [];
    }
    summaryBySection[sectionName][catId].push({ svcObj, qty });
  });

  const modifiedCrumbs = PACKAGES_STEPS.map((step) => {
    // If we have no storedPackageId, do nothing
    if (!storedPackageId) return step;
    if (step.href.startsWith("/packages") && !step.href.includes("?")) {
      return {
        ...step,
        href: `${step.href}?packageId=${storedPackageId}`,
      };
    }

    return step;
  });

  function handleGoBack() {
    if (storedPackageId) {
      router.push(`/packages/services?packageId=${storedPackageId}`);
    } else {
      router.push("/packages/services");
    }
  }

  return (
    <main className="min-h-screen pt-24">
      <div className="container mx-auto">
        {/* Use the modified breadcrumb with the correct link for all steps */}
        <BreadCrumb items={modifiedCrumbs} />
      </div>

      <div className="container mx-auto py-12">
        <div className="max-w-[900px] mx-auto bg-brand-light p-6 rounded-xl border border-gray-300 overflow-hidden">
          <SectionBoxSubtitle>Estimate</SectionBoxSubtitle>

          {/* Render the breakdown of selected services, grouped by section -> category */}
          <div className="mt-4 space-y-4">
            {Object.entries(summaryBySection).length === 0 ? (
              <p className="text-gray-500">No services selected</p>
            ) : (
              Object.entries(summaryBySection).map(([sectionName, cats]) => (
                <div key={sectionName} className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {sectionName}
                  </h3>
                  {Object.entries(cats).map(([catId, arr]) => {
                    const catObj = ALL_CATEGORIES.find((c) => c.id === catId);
                    const catName = catObj ? catObj.title : catId;
                    return (
                      <div key={catId} className="ml-4 space-y-4">
                        <h4 className="text-lg font-semibold text-gray-700">
                          {catName}
                        </h4>
                        {arr.map(({ svcObj, qty }) => (
                          <div
                            key={svcObj.id}
                            className="flex justify-between items-start gap-4 border-b pb-2"
                          >
                            <div>
                              <h3 className="font-medium text-lg text-gray-800">
                                {svcObj.title}
                              </h3>
                              {svcObj.description && (
                                <div className="text-sm text-gray-500 mt-1">
                                  {svcObj.description}
                                </div>
                              )}
                              <div className="text-medium font-medium text-gray-800 mt-2">
                                <span>{formatQuantity(qty)} </span>
                                <span>{svcObj.unit_of_measurement}</span>
                              </div>
                            </div>
                            <div className="text-right mt-auto">
                              <span className="block text-gray-800 font-medium">
                                ${formatWithSeparator(svcObj.price * qty)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Pricing summary */}
          <div className="pt-4 mt-4 border-t border-gray-200">
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
                  {formatWithSeparator(Math.abs(subtotal * (timeCoefficient - 1)))}
                </span>
              </div>
            )}

            <div className="flex justify-between mb-2">
              <span className="font-semibold text-lg text-gray-800">Subtotal</span>
              <span className="font-semibold text-lg text-gray-800">
                ${formatWithSeparator(adjustedSubtotal)}
              </span>
            </div>

            <div className="flex justify-between mb-4">
              <span className="text-gray-600">Sales tax (8.25%)</span>
              <span>${formatWithSeparator(salesTax)}</span>
            </div>

            {/* Button to select or change time (shows a modal) */}
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
                Selected Date: <span className="text-blue-600">{selectedTime}</span>
              </p>
            )}

            {/* Show the modal if user clicks the "Select Available Time" */}
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

            {/* Final total */}
            <div className="flex justify-between text-2xl font-semibold mt-4">
              <span>Total</span>
              <span>${formatWithSeparator(total)}</span>
            </div>
          </div>

          {/* House Info */}
          <div className="mt-6">
            <h3 className="font-semibold text-xl text-gray-800">Home Details</h3>
            <div className="mt-2 space-y-1 text-sm text-gray-700">
              <p>
                <strong>Address:</strong> {houseInfo.addressLine || "N/A"}
              </p>
              <p>
                <strong>City / Zip:</strong> {houseInfo.city || "?"},{" "}
                {houseInfo.zip || "?"}
              </p>
              <p>
                <strong>Country:</strong> {houseInfo.country || "?"}
              </p>
              <hr className="my-2" />
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
              <hr className="my-2" />
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

          {/* Uploaded Photos */}
          <div className="mt-6">
            <h3 className="font-semibold text-xl text-gray-800">Uploaded Photos</h3>
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
              <p className="text-medium text-gray-500 mt-2">No photos uploaded</p>
            )}
          </div>

          {/* Additional details / Comments */}
          <div className="mt-6">
            <h3 className="font-semibold text-xl text-gray-800">Additional details</h3>
            <p className="text-gray-500 mt-2 whitespace-pre-wrap">
              {description || "No details provided"}
            </p>
          </div>

          {/* Actions: proceed to checkout or go back */}
          <div className="mt-6 space-y-4">
            <Button
              className="w-full justify-center"
              variant="primary"
              onClick={handleProceedToCheckout}
            >
              Proceed to Checkout →
            </Button>
            <Button
              className="w-full justify-center"
              variant="secondary"
              onClick={handleGoBack}
            >
              Go back to Services →
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}