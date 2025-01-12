"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BreadCrumb from "@/components/ui/BreadCrumb";
import Button from "@/components/ui/Button";
import { SectionBoxSubtitle } from "@/components/ui/SectionBoxSubtitle";

import { PACKAGES_STEPS } from "@/constants/navigation";
import { ALL_CATEGORIES } from "@/constants/categories";
import { ALL_SERVICES } from "@/constants/services";
import { PACKAGES } from "@/constants/packages";
import { taxRatesUSA } from "@/constants/taxRatesUSA";

// Unified session utilities
import { getSessionItem, setSessionItem } from "@/utils/session";

/**
 * Formats a number with commas and exactly two decimals.
 */
function formatWithSeparator(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Returns the combined (state + local) tax rate by two-letter state code,
 * or 0 if not found.
 */
function getTaxRateForState(stateName: string): number {
  if (!stateName) return 0;
  const row = taxRatesUSA.taxRates.find(
    (r) => r.state.toLowerCase() === stateName.toLowerCase()
  );
  return row ? row.combinedStateAndLocalTaxRate : 0;
}

/**
 * Converts a houseType code into a user-friendly string.
 */
function formatHouseType(value: string): string {
  switch (value) {
    case "single_family":
      return "Single Family";
    case "townhouse":
      return "Townhouse";
    case "apartment":
      return "Apartment / Condo";
    default:
      return value || "—";
  }
}

/**
 * Modal component to select a payment option, such as monthly or prepayment.
 */
function PaymentOptionModal({
  subtotal,
  onClose,
  onConfirm,
}: {
  subtotal: number;
  onClose: () => void;
  onConfirm: (option: string, coefficient: number) => void;
}) {
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
            const discountedSubtotal = subtotal * opt.coefficient;
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
                      ${formatWithSeparator(discountedSubtotal)}
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

export default function EstimatePage() {
  const router = useRouter();

  // Identify which package was chosen
  const storedPackageId = getSessionItem<string | null>("packages_currentPackageId", null);
  const chosenPackage = PACKAGES.find((p) => p.id === storedPackageId) || null;

  // Load selected services
  const selectedServicesData = getSessionItem("packages_selectedServices", {
    indoor: {},
    outdoor: {},
  } as Record<string, Record<string, number>>);

  // Merge indoor + outdoor
  const mergedSelected: Record<string, number> = {
    ...selectedServicesData.indoor,
    ...selectedServicesData.outdoor,
  };

  // Redirect if no services selected
  useEffect(() => {
    if (Object.keys(mergedSelected).length === 0) {
      router.push(
        storedPackageId
          ? `/packages/services?packageId=${storedPackageId}`
          : "/packages/services"
      );
    }
  }, [mergedSelected, router, storedPackageId]);

  // Load calculation data
  const calculationResultsMap = getSessionItem<Record<string, any>>(
    "packages_calculationResultsMap",
    {}
  );
  const serviceCosts = getSessionItem<Record<string, number>>("packages_serviceCosts", {});

  // House info
  const houseInfo = getSessionItem("packages_houseInfo", {
    addressLine: "",
    city: "",
    state: "",
    zip: "",
    country: "",
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

  // Payment modal
  const [showModal, setShowModal] = useState(false);
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<string | null>(
    () => getSessionItem("packages_selectedTime", null)
  );
  const [paymentCoefficient, setPaymentCoefficient] = useState<number>(() =>
    getSessionItem("packages_timeCoefficient", 1)
  );

  // Save user-chosen payment option
  useEffect(() => {
    setSessionItem("packages_selectedTime", selectedPaymentOption);
  }, [selectedPaymentOption]);

  // Save paymentCoefficient
  useEffect(() => {
    setSessionItem("packages_timeCoefficient", paymentCoefficient);
  }, [paymentCoefficient]);

  // Summation
  let laborSubtotal = 0;
  let materialsSubtotal = 0;
  for (const svcId of Object.keys(mergedSelected)) {
    const res = calculationResultsMap[svcId];
    if (!res) continue;
    laborSubtotal += parseFloat(res.work_cost) || 0;
    materialsSubtotal += parseFloat(res.material_cost) || 0;
  }

  // Apply paymentCoefficient to labor
  const finalLabor = laborSubtotal * paymentCoefficient;

  // Fees
  const serviceFeeOnLabor = finalLabor * 0.15;
  const serviceFeeOnMaterials = materialsSubtotal * 0.05;

  // sumBeforeTax
  const sumBeforeTax = finalLabor + materialsSubtotal + serviceFeeOnLabor + serviceFeeOnMaterials;

  // Tax
  const userState = houseInfo.state || "";
  const taxRatePercent = getTaxRateForState(userState);
  const taxAmount = sumBeforeTax * (taxRatePercent / 100);

  // final
  const finalTotal = sumBeforeTax + taxAmount;

  // Build an array => cost breakdown
  type ServiceItem = {
    svcId: string;
    svcObj: (typeof ALL_SERVICES)[number];
    quantity: number;
    labor: number;
    materials: number;
    breakdown: any;
  };

  const servicesArray: ServiceItem[] = Object.entries(mergedSelected)
    .map(([svcId, qty]) => {
      const svcObj = ALL_SERVICES.find((s) => s.id === svcId);
      if (!svcObj) return null;
      const breakdown = calculationResultsMap[svcId];
      const laborVal = breakdown ? parseFloat(breakdown.work_cost) || 0 : 0;
      const matVal = breakdown ? parseFloat(breakdown.material_cost) || 0 : 0;
      return {
        svcId,
        svcObj,
        quantity: qty,
        labor: laborVal,
        materials: matVal,
        breakdown,
      };
    })
    .filter(Boolean) as ServiceItem[];

  // Group by section->category
  const summaryBySection: Record<string, Record<string, ServiceItem[]>> = {};
  servicesArray.forEach((item) => {
    const catId = item.svcId.split("-").slice(0, 2).join("-");
    const catObj = ALL_CATEGORIES.find((c) => c.id === catId);
    if (!catObj) return;
    const sectionName = catObj.section;
    if (!summaryBySection[sectionName]) {
      summaryBySection[sectionName] = {};
    }
    if (!summaryBySection[sectionName][catId]) {
      summaryBySection[sectionName][catId] = [];
    }
    summaryBySection[sectionName][catId].push(item);
  });

  // Proceed to checkout
  function handleProceedToCheckout() {
    router.push("/packages/checkout");
  }

  // Go back to services
  function handleGoBack() {
    if (storedPackageId) {
      router.push(`/packages/services?packageId=${storedPackageId}`);
    } else {
      router.push("/packages/services");
    }
  }

  // Save final numbers so the checkout page can read them
  useEffect(() => {
    setSessionItem("packages_laborSubtotal", laborSubtotal);
    setSessionItem("packages_materialsSubtotal", materialsSubtotal);
    setSessionItem("serviceFeeOnLabor", serviceFeeOnLabor);
    setSessionItem("serviceFeeOnMaterials", serviceFeeOnMaterials);
    setSessionItem("packages_sumBeforeTax", sumBeforeTax);
    setSessionItem("packages_taxRatePercent", taxRatePercent);
    setSessionItem("packages_taxAmount", taxAmount);
    setSessionItem("packages_estimateFinalTotal", finalTotal);
  }, [
    laborSubtotal,
    materialsSubtotal,
    serviceFeeOnLabor,
    serviceFeeOnMaterials,
    sumBeforeTax,
    taxRatePercent,
    taxAmount,
    finalTotal,
  ]);

  // Tweak breadcrumbs
  const modifiedCrumbs = PACKAGES_STEPS.map((step) => {
    if (!storedPackageId) return step;
    if (step.href.startsWith("/packages") && !step.href.includes("?")) {
      return { ...step, href: `${step.href}?packageId=${storedPackageId}` };
    }
    return step;
  });

  // Helper to render payment schedule
  function renderPaymentSchedule() {
    if (!selectedPaymentOption) return null;

    function formatDate(d: Date): string {
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const y = d.getFullYear();
      return `${m}/${dd}/${y}`;
    }

    if (selectedPaymentOption === "100% Prepayment") {
      return (
        <div className="mt-4">
          <h4 className="text-xl font-semibold text-gray-800">Payment Schedule</h4>
          <p className="text-md text-gray-600 mt-2">
            You pay the entire total of{" "}
            <span className="font-medium text-blue-600">
              ${formatWithSeparator(finalTotal)}
            </span>{" "}
            once (upfront).
          </p>
        </div>
      );
    }

    if (selectedPaymentOption === "Monthly") {
      const monthlyPayment = finalTotal / 12;
      return (
        <div className="mt-4">
          <h4 className="text-xl font-semibold text-gray-800">Payment Schedule</h4>
          <p className="text-md text-gray-600 mt-2">
            You will pay{" "}
            <span className="font-medium text-blue-600">
              ${formatWithSeparator(monthlyPayment)}
            </span>{" "}
            monthly, for 12 months.
          </p>
        </div>
      );
    }

    if (selectedPaymentOption === "Quarterly") {
      const quarterlyPayment = finalTotal / 4;
      const now = new Date();
      const futureDates: string[] = [];
      for (let i = 0; i < 4; i++) {
        futureDates.push(
          formatDate(new Date(now.getFullYear(), now.getMonth() + i * 3, now.getDate()))
        );
      }
      return (
        <div className="mt-4">
          <h4 className="text-xl font-semibold text-gray-800">Payment Schedule (Quarterly)</h4>
          <p className="text-md text-gray-600 mt-2 mb-2">
            You will pay{" "}
            <span className="font-medium text-blue-600">
              ${formatWithSeparator(quarterlyPayment)}
            </span>{" "}
            every 3 months (4 total payments).
          </p>
          <ul className="list-disc list-inside text-md text-gray-600">
            {futureDates.map((dateStr, idx) => (
              <li key={idx}>
                Payment #{idx + 1}: {dateStr}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    return null;
  }

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto">
        <BreadCrumb items={modifiedCrumbs} />
      </div>

      <div className="container mx-auto py-12">
        <div className="max-w-[700px] bg-brand-light p-6 rounded-xl border border-gray-300 overflow-hidden mr-auto">
          <SectionBoxSubtitle>
            Estimate for {chosenPackage ? chosenPackage.title : "No package found"}
          </SectionBoxSubtitle>

          {/* Cost breakdown by section/category */}
          <div className="mt-4 space-y-6">
            {Object.keys(summaryBySection).length === 0 ? (
              <p className="text-gray-500">No services selected</p>
            ) : (
              Object.entries(summaryBySection).map(([sectionName, catMap], secIdx) => {
                const sectionNumber = secIdx + 1;
                return (
                  <div key={sectionName} className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {sectionNumber}. {sectionName}
                    </h3>

                    {Object.entries(catMap).map(([catId, items], catIdx) => {
                      const catNumber = `${sectionNumber}.${catIdx + 1}`;
                      const catObj = ALL_CATEGORIES.find((c) => c.id === catId);
                      const catName = catObj ? catObj.title : catId;

                      return (
                        <div key={catId} className="ml-4 space-y-4">
                          <h4 className="text-lg font-semibold text-gray-700">
                            {catNumber}. {catName}
                          </h4>
                          {items.map((svcItem, svcIdx) => {
                            const svcNumber = `${catNumber}.${svcIdx + 1}`;
                            const totalCost = svcItem.labor + svcItem.materials;
                            const br = svcItem.breakdown;

                            return (
                              <div
                                key={svcItem.svcId}
                                className="border-b last:border-b-0 pb-3 mb-3 last:mb-0 last:pb-0"
                              >
                                <h5 className="font-medium text-md text-gray-800 mb-1">
                                  {svcNumber}. {svcItem.svcObj.title}
                                </h5>
                                {svcItem.svcObj.description && (
                                  <p className="text-sm text-gray-500">
                                    {svcItem.svcObj.description}
                                  </p>
                                )}
                                <div className="mt-2 flex justify-between items-center">
                                  <div className="text-md font-medium text-gray-700">
                                    {svcItem.quantity} {svcItem.svcObj.unit_of_measurement}
                                  </div>
                                  <div className="text-md font-medium text-gray-800 mr-4">
                                    ${formatWithSeparator(totalCost)}
                                  </div>
                                </div>

                                {/* Cost breakdown details */}
                                {br && (
                                  <div className="mt-2 p-4 bg-gray-50 border rounded">
                                    <div className="flex justify-between mb-2">
                                      <span className="text-sm font-medium text-gray-700">
                                        Labor
                                      </span>
                                      <span className="text-sm font-medium text-gray-700">
                                        ${formatWithSeparator(svcItem.labor)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                      <span className="text-sm font-medium text-gray-700">
                                        Materials, tools & equipment
                                      </span>
                                      <span className="text-sm font-medium text-gray-700">
                                        ${formatWithSeparator(svcItem.materials)}
                                      </span>
                                    </div>

                                    {Array.isArray(br.materials) && br.materials.length > 0 && (
                                      <div className="mt-2">
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
                                            {br.materials.map((m: any, i2: number) => (
                                              <tr key={`${m.external_id}-${i2}`}>
                                                <td className="py-3 px-1">{m.name}</td>
                                                <td className="py-3 px-1">
                                                  ${formatWithSeparator(parseFloat(m.cost_per_unit))}
                                                </td>
                                                <td className="py-3 px-3">{m.quantity}</td>
                                                <td className="py-3 px-3">
                                                  ${formatWithSeparator(parseFloat(m.cost))}
                                                </td>
                                              </tr>
                                            ))}
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
              })
            )}
          </div>

          {/* Subtotals and fees */}
          <div className="pt-4 mt-4 border-t border-gray-200">
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-lg text-gray-600">Labor total:</span>
              <span className="font-semibold text-lg text-gray-600">
                ${formatWithSeparator(laborSubtotal)}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-lg text-gray-600">
                Materials, tools & equipment:
              </span>
              <span className="font-semibold text-lg text-gray-600">
                ${formatWithSeparator(materialsSubtotal)}
              </span>
            </div>

            {/* PaymentCoefficient => discount or surcharge */}
            {paymentCoefficient !== 1 && (
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">
                  {paymentCoefficient > 1 ? "Surcharge" : "Discount"} (time)
                </span>
                <span
                  className={`font-semibold text-lg ${
                    paymentCoefficient > 1 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {paymentCoefficient > 1 ? "+" : "-"}$
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
              <span className="text-gray-600">Delivery &amp; Processing (5% on materials)</span>
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
                {userState ? ` (${userState})` : ""}
                {taxRatePercent > 0 ? ` (${taxRatePercent.toFixed(2)}%)` : ""}
              </span>
              <span>${formatWithSeparator(taxAmount)}</span>
            </div>

            {/* Payment Option button */}
            <button
              onClick={() => setShowModal(true)}
              className={`w-full py-3 rounded-lg font-medium mt-4 border ${
                selectedPaymentOption ? "text-red-500 border-red-500" : "text-brand border-brand"
              }`}
            >
              {selectedPaymentOption ? "Change Payment Option" : "Select Payment Option"}
            </button>
            {selectedPaymentOption && (
              <p className="mt-2 text-gray-700 text-center font-medium">
                Payment Option:{" "}
                <span className="text-blue-600">{selectedPaymentOption}</span>
              </p>
            )}
            {showModal && (
              <PaymentOptionModal
                subtotal={sumBeforeTax}
                onClose={() => setShowModal(false)}
                onConfirm={(lbl, coeff) => {
                  setSelectedPaymentOption(lbl);
                  setPaymentCoefficient(coeff);
                  setShowModal(false);
                }}
              />
            )}

            <div className="flex justify-between text-2xl font-semibold mt-4">
              <span>Total</span>
              <span>${formatWithSeparator(finalTotal)}</span>
            </div>
          </div>

          {/* Payment schedule */}
          {renderPaymentSchedule()}

          {/* House info */}
          <div className="mt-6">
            <h3 className="font-semibold text-xl text-gray-800">Home Details</h3>
            <div className="text-md text-gray-700 mt-4 space-y-1">
              <p>
                <strong>Address:</strong> {houseInfo.addressLine || "—"}
                {houseInfo.state ? `, ${houseInfo.state}` : ""}
              </p>
              <p>
                <strong>City / Zip:</strong> {houseInfo.city || "—"},{" "}
                {houseInfo.zip || "—"}
              </p>
              <p>
                <strong>Country:</strong> {houseInfo.country || "—"}
              </p>
              <p>
                <strong>House Type:</strong> {formatHouseType(houseInfo.houseType)}
              </p>
              <p>
                <strong>Floors:</strong> {houseInfo.floors}
              </p>
              <p>
                <strong>Square ft:</strong>{" "}
                {houseInfo.squareFootage > 0 ? houseInfo.squareFootage : "—"}
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
                {houseInfo.hasBoiler
                  ? `Yes (${houseInfo.boilerType || "unknown type"})`
                  : "No"}
              </p>
              <p>
                <strong>Garage:</strong>{" "}
                {houseInfo.hasGarage ? String(houseInfo.garageCount) : "No"}
              </p>
              <p>
                <strong>Yard:</strong>{" "}
                {houseInfo.hasYard ? `${houseInfo.yardArea} sq ft` : "No"}
              </p>
              <p>
                <strong>Pool:</strong>{" "}
                {houseInfo.hasPool ? `${houseInfo.poolArea} sq ft` : "No"}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 space-y-4">
            <button
              onClick={handleProceedToCheckout}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
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
                hover:!bg-blue-50
                hover:!text-blue-700
                transition-colors
                py-3
                rounded-lg
                font-xs
                font-normal
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