"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BreadCrumb from "@/components/ui/BreadCrumb";
import Button from "@/components/ui/Button";
import { SectionBoxSubtitle } from "@/components/ui/SectionBoxSubtitle";
import { PACKAGES_STEPS } from "@/constants/navigation";
import { ALL_CATEGORIES } from "@/constants/categories";
import { ALL_SERVICES } from "@/constants/services";
import { PACKAGES } from "@/constants/packages"; // We import PACKAGES to find the chosen package

/**
 * Format a number with commas and exactly two decimals (e.g., 1234 => "1,234.00").
 */
function formatWithSeparator(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format an integer with commas (no decimals). e.g.: 1234 => "1,234".
 */
function formatQuantity(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

/** Save JSON to sessionStorage (client side only). */
function saveToSession(key: string, value: any) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(key, JSON.stringify(value));
  }
}

/** Load JSON from sessionStorage or return a default if not found or SSR. */
function loadFromSession<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") {
    return defaultValue;
  }
  const stored = sessionStorage.getItem(key);
  try {
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/** A custom modal (replacing time selection) to choose a payment plan. */
function PaymentOptionModal({
  subtotal,
  onClose,
  onConfirm,
}: {
  subtotal: number;
  onClose: () => void;
  onConfirm: (option: string, coefficient: number) => void;
}) {
  /**
   * Three payment options:
   * 1) 100% Prepayment => discount 15% => coefficient=0.85
   * 2) Quarterly => discount 8% => coefficient=0.92
   * 3) Monthly => no discount => coefficient=1.00
   */
  const options = [
    {
      label: "100% Prepayment",
      description: "Pay everything upfront and get a 15% discount.",
      coefficient: 0.85,
    },
    {
      label: "Quarterly",
      description: "Pay every 3 months and get an 8% discount.",
      coefficient: 0.92,
    },
    {
      label: "Monthly",
      description: "Pay monthly with no discount.",
      coefficient: 1.0,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      {/* The modal content */}
      <div className="bg-white rounded-lg p-6 w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl"
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Select Payment Option
        </h2>
        <p className="text-gray-600 mb-6">
          Please choose one of the payment methods below.
        </p>

        <div className="space-y-4">
          {options.map((opt) => {
            const discountedPrice = subtotal * opt.coefficient;
            return (
              <div
                key={opt.label}
                className="border border-gray-300 p-4 rounded-lg flex items-center justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {opt.label}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {opt.description}
                  </p>
                  <p className="text-gray-700 text-sm mt-2">
                    New Subtotal:{" "}
                    <span className="font-medium text-blue-600">
                      ${formatWithSeparator(discountedPrice)}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => onConfirm(opt.label, opt.coefficient)}
                  className="bg-blue-600 text-white rounded-md py-2 px-4 hover:bg-blue-700 transition-colors"
                >
                  Select
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Our main Estimate page, now with a PaymentOptionModal
 * and additional logic to display the final payment schedule after the total.
 */
export default function EstimatePage() {
  const router = useRouter();

  // 1) Retrieve packageId from session
  const storedPackageId = loadFromSession("packages_currentPackageId", null);

  // 2) Find package in PACKAGES
  const chosenPackage = PACKAGES.find((pkg) => pkg.id === storedPackageId) || null;

  // 3) Load selected services
  const selectedServicesFromSession = loadFromSession("packages_selectedServices", {
    indoor: {},
    outdoor: {},
  });
  const mergedSelected: Record<string, number> = {
    ...selectedServicesFromSession.indoor,
    ...selectedServicesFromSession.outdoor,
  };

  // If no services, redirect
  useEffect(() => {
    if (Object.keys(mergedSelected).length === 0) {
      router.push(
        storedPackageId
          ? `/packages/services?packageId=${storedPackageId}`
          : "/packages/services"
      );
    }
  }, [mergedSelected, router, storedPackageId]);

  // 4) House info, photos, description
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
  const photos: string[] = loadFromSession("packages_photos", []);
  const description: string = loadFromSession("packages_description", "");

  // 5) Payment modal states
  const [showModal, setShowModal] = useState(false);

  // We rename "selectedTime" to "selectedPaymentOption" logically
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<string | null>(() =>
    loadFromSession("packages_selectedTime", null)
  );

  // We rename "timeCoefficient" to "paymentCoefficient"
  const [paymentCoefficient, setPaymentCoefficient] = useState<number>(() =>
    loadFromSession("packages_timeCoefficient", 1)
  );

  // Persist changes
  useEffect(() => {
    saveToSession("packages_selectedTime", selectedPaymentOption);
  }, [selectedPaymentOption]);

  useEffect(() => {
    saveToSession("packages_timeCoefficient", paymentCoefficient);
  }, [paymentCoefficient]);

  // 6) Pricing calculations
  function calculateSubtotal(): number {
    let total = 0;
    for (const [svcId, qty] of Object.entries(mergedSelected)) {
      const svcObj = ALL_SERVICES.find((s) => s.id === svcId);
      if (svcObj) {
        total += svcObj.price * qty;
      }
    }
    return total;
  }
  const subtotal = calculateSubtotal();
  const adjustedSubtotal = subtotal * paymentCoefficient;
  const salesTax = adjustedSubtotal * 0.0825;
  const finalTotal = adjustedSubtotal + salesTax;

  // 7) Payment schedule or final payment info
  // Based on `selectedPaymentOption`, we'll display different info
  function renderPaymentSchedule() {
    if (!selectedPaymentOption) {
      return null;
    }

    // Helper to format date in mm/dd/yyyy
    function formatDate(date: Date): string {
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const yyyy = date.getFullYear();
      return `${mm}/${dd}/${yyyy}`;
    }

    if (selectedPaymentOption === "100% Prepayment") {
      // One payment of finalTotal
      return (
        <div className="mt-4">
          <h4 className="text-lg font-semibold text-gray-800">
            Payment Schedule
          </h4>
          <p className="text-sm text-gray-600 mt-2">
            You pay the entire total of{" "}
            <span className="font-medium text-blue-600">
              ${formatWithSeparator(finalTotal)}
            </span>{" "}
            upfront (once). Thank you!
          </p>
        </div>
      );
    } else if (selectedPaymentOption === "Monthly") {
      // 12 monthly payments
      const monthlyPayment = finalTotal / 12;
      return (
        <div className="mt-4">
          <h4 className="text-lg font-semibold text-gray-800">
            Payment Schedule
          </h4>
          <p className="text-sm text-gray-600 mt-2">
            You will pay{" "}
            <span className="font-medium text-blue-600">
              ${formatWithSeparator(monthlyPayment)}
            </span>{" "}
            each month for 12 months. Starting now, the next 11 payments
            will be monthly.
          </p>
        </div>
      );
    } else if (selectedPaymentOption === "Quarterly") {
      // 4 payments, every 3 months. Let's show approximate dates
      const quarterlyPayment = finalTotal / 4;

      // Build approximate next 4 dates
      const now = new Date();
      const payments: string[] = [];
      for (let i = 0; i < 4; i++) {
        // For i=0 => today, i=1 => +3 months, etc.
        const paymentDate = new Date(
          now.getFullYear(),
          now.getMonth() + i * 3,
          now.getDate()
        );
        payments.push(formatDate(paymentDate));
      }

      return (
        <div className="mt-4">
          <h4 className="text-lg font-semibold text-gray-800">
            Payment Schedule (Quarterly)
          </h4>
          <p className="text-sm text-gray-600 mt-2 mb-2">
            You will pay{" "}
            <span className="font-medium text-blue-600">
              ${formatWithSeparator(quarterlyPayment)}
            </span>{" "}
            every 3 months, for a total of 4 payments.
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600">
            {payments.map((date, idx) => (
              <li key={idx} className="ml-4">
                Payment #{idx + 1}: {date}
              </li>
            ))}
          </ul>
        </div>
      );
    } else {
      return null;
    }
  }

  // 8) "Proceed to checkout" => store user choice, go next
  function handleProceedToCheckout() {
    saveToSession("packages_selectedTime", selectedPaymentOption);
    saveToSession("packages_timeCoefficient", paymentCoefficient);
    router.push("/packages/checkout");
  }

  // 9) Summaries
  type ServiceItem = { svcObj: (typeof ALL_SERVICES)[number]; qty: number };
  const itemsArray: ServiceItem[] = Object.entries(mergedSelected)
    .map(([svcId, qty]) => {
      const svcObj = ALL_SERVICES.find((s) => s.id === svcId);
      return svcObj ? { svcObj, qty } : null;
    })
    .filter(Boolean) as ServiceItem[];

  const summaryBySection: Record<string, Record<string, ServiceItem[]>> = {};
  itemsArray.forEach(({ svcObj, qty }) => {
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

  // 10) Modify BreadCrumb to keep ?packageId
  const modifiedCrumbs = PACKAGES_STEPS.map((step) => {
    if (!storedPackageId) return step;
    if (step.href.startsWith("/packages") && !step.href.includes("?")) {
      return {
        ...step,
        href: `${step.href}?packageId=${storedPackageId}`,
      };
    }
    return step;
  });

  // "Go back to Services" button
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
        <BreadCrumb items={modifiedCrumbs} />
      </div>

      <div className="container mx-auto py-12">
        <div className="max-w-[700px] bg-brand-light p-6 rounded-xl border border-gray-300 overflow-hidden mr-auto">
          <SectionBoxSubtitle>
            {chosenPackage ? chosenPackage.title : "No package found"}
          </SectionBoxSubtitle>

          {/* Selected services section */}
          <div className="mt-4 space-y-4">
            {Object.keys(summaryBySection).length === 0 ? (
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
                            className="flex justify-between items-start gap-4"
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

          {/* Payment summary */}
          <div className="pt-4 mt-4 border-t border-gray-200">
            {/* Show discount or surcharge if paymentCoefficient != 1 */}
            {paymentCoefficient < 1 && (
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Discount</span>
                <span className="font-semibold text-lg text-green-600">
                  -$
                  {formatWithSeparator(subtotal * (1 - paymentCoefficient))}
                </span>
              </div>
            )}
            {paymentCoefficient > 1 && (
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Surcharge</span>
                <span className="font-semibold text-lg text-red-600">
                  +$
                  {formatWithSeparator(subtotal * (paymentCoefficient - 1))}
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

            {/* Button to show PaymentOptionModal */}
            <button
              onClick={() => setShowModal(true)}
              className={`w-full py-3 rounded-lg font-medium mt-4 border ${
                selectedPaymentOption
                  ? "text-red-500 border-red-500"
                  : "text-brand border-brand"
              }`}
            >
              {selectedPaymentOption
                ? "Change Payment Option"
                : "Select Payment Option"}
            </button>
            {selectedPaymentOption && (
              <p className="mt-2 text-gray-700 text-center font-medium">
                Selected Payment:{" "}
                <span className="text-blue-600">{selectedPaymentOption}</span>
              </p>
            )}

            {/* If user clicks, open PaymentOptionModal */}
            {showModal && (
              <PaymentOptionModal
                subtotal={subtotal}
                onClose={() => setShowModal(false)}
                onConfirm={(optionLabel, coefficient) => {
                  setSelectedPaymentOption(optionLabel);
                  setPaymentCoefficient(coefficient);
                  setShowModal(false);
                }}
              />
            )}

            {/* Final total */}
            <div className="flex justify-between text-2xl font-semibold mt-4">
              <span>Total</span>
              <span>${formatWithSeparator(finalTotal)}</span>
            </div>
          </div>

          {/* Payment schedule / final payment info */}
          {selectedPaymentOption && renderPaymentSchedule()}

          {/* House Info, etc. */}
          <div className="mt-6">
            <h3 className="font-semibold text-xl text-gray-800">
              Home Details
            </h3>
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
          
          <div className="mt-6 space-y-4">
            <button
              onClick={handleProceedToCheckout}
              className="
                w-full
                bg-blue-600
                text-white
                py-3
                rounded-lg
                font-medium
                hover:bg-blue-700
                transition-colors
              "
            >
              Proceed to Checkout →
            </button>
            <Button
              onClick={handleGoBack}
              variant="secondary"
              className="
                w-full
                justify-center
                border border-blue-600
                bg-transparent
                !text-blue-600
                hover:bg-blue-50
                hover:!text-blue-700
                transition-colors
                py-3
                rounded-lg
                font-medium
              "
            >
              Go back to Services →
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}