"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addDays, addMonths, format } from "date-fns";

import BreadCrumb from "@/components/ui/BreadCrumb";
import Button from "@/components/ui/Button";
import { SectionBoxSubtitle } from "@/components/ui/SectionBoxSubtitle";
import PaymentOptionPanel from "@/components/ui/PaymentOptionPanel";

import { PACKAGES_STEPS } from "@/constants/navigation";
import { ALL_CATEGORIES } from "@/constants/categories";
import { ALL_SERVICES } from "@/constants/services";
import { PACKAGES } from "@/constants/packages";
import { taxRatesUSA } from "@/constants/taxRatesUSA";

import { getSessionItem, setSessionItem } from "@/utils/session";

/**
 * Formats a number with commas and two decimals.
 */
function formatWithSeparator(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Returns state+local tax rate (e.g. "8.25"), or 0 if not found.
 */
function getTaxRateForState(stateName: string): number {
  if (!stateName) return 0;
  const row = taxRatesUSA.taxRates.find(
    (r) => r.state.toLowerCase() === stateName.toLowerCase()
  );
  return row ? row.combinedStateAndLocalTaxRate : 0;
}

/**
 * Converts a houseType code to a readable string.
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

export default function EstimatePage() {
  const router = useRouter();

  // Detect which package is selected
  const storedPackageId = getSessionItem<string | null>("packages_currentPackageId", null);
  const chosenPackage = PACKAGES.find((p) => p.id === storedPackageId) || null;

  // Load user-selected services
  const selectedServicesData = getSessionItem("packages_selectedServices", {
    indoor: {},
    outdoor: {},
  } as Record<string, Record<string, number>>);

  // Merge into a single object
  const mergedSelected: Record<string, number> = {
    ...selectedServicesData.indoor,
    ...selectedServicesData.outdoor,
  };

  // If no services => redirect
  useEffect(() => {
    if (Object.keys(mergedSelected).length === 0) {
      router.push(
        storedPackageId
          ? `/packages/services?packageId=${storedPackageId}`
          : "/packages/services"
      );
    }
  }, [mergedSelected, router, storedPackageId]);

  // Calculation data from session
  const calculationResultsMap = getSessionItem<Record<string, any>>(
    "packages_calculationResultsMap",
    {}
  );

  // Basic house info
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

  // Payment option state
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<string | null>(
    () => getSessionItem("packages_selectedTime", null)
  );
  const [paymentCoefficient, setPaymentCoefficient] = useState<number>(() =>
    getSessionItem("packages_timeCoefficient", 1)
  );

  useEffect(() => {
    setSessionItem("packages_selectedTime", selectedPaymentOption);
  }, [selectedPaymentOption]);

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

  // Apply coefficient to labor
  const finalLabor = laborSubtotal * paymentCoefficient;

  // Additional fees
  const serviceFeeOnLabor = finalLabor * 0.15;
  const serviceFeeOnMaterials = materialsSubtotal * 0.05;

  // Subtotal before tax
  const sumBeforeTax = finalLabor + materialsSubtotal + serviceFeeOnLabor + serviceFeeOnMaterials;

  // Tax
  const userState = houseInfo.state || "";
  const taxRatePercent = getTaxRateForState(userState);
  const taxAmount = sumBeforeTax * (taxRatePercent / 100);
  const finalTotal = sumBeforeTax + taxAmount;

  // Build data structure for rendering
  type ServiceItem = {
    svcId: string;
    quantity: number;
    labor: number;
    materials: number;
    breakdown: any;
    title: string;
    description?: string;
    unit: string;
  };
  const servicesArray: ServiceItem[] = Object.entries(mergedSelected)
    .map(([svcId, qty]) => {
      const found = ALL_SERVICES.find((s) => s.id === svcId);
      const br = calculationResultsMap[svcId];
      if (!found || !br) return null;
      const lab = parseFloat(br.work_cost) || 0;
      const mat = parseFloat(br.material_cost) || 0;
      return {
        svcId,
        quantity: qty,
        labor: lab,
        materials: mat,
        breakdown: br,
        title: found.title,
        description: found.description,
        unit: found.unit_of_measurement || "each",
      };
    })
    .filter(Boolean) as ServiceItem[];

  // summaryBySection => { sectionName: { categoryId: [items] } }
  const summaryBySection: Record<string, Record<string, ServiceItem[]>> = {};
  for (const item of servicesArray) {
    const catId = item.svcId.split("-").slice(0, 2).join("-");
    const catObj = ALL_CATEGORIES.find((c) => c.id === catId);
    if (!catObj) continue;
    const sectionName = catObj.section;
    if (!summaryBySection[sectionName]) {
      summaryBySection[sectionName] = {};
    }
    if (!summaryBySection[sectionName][catId]) {
      summaryBySection[sectionName][catId] = [];
    }
    summaryBySection[sectionName][catId].push(item);
  }

  // Save final amounts to session for Checkout
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

  // Adjust breadcrumbs if package ID is known
  const modifiedCrumbs = PACKAGES_STEPS.map((step) => {
    if (!storedPackageId) return step;
    if (step.href.startsWith("/packages") && !step.href.includes("?")) {
      return { ...step, href: `${step.href}?packageId=${storedPackageId}` };
    }
    return step;
  });

  function renderPaymentSchedule() {
    if (!selectedPaymentOption) return null;
    const total = finalTotal;
    const now = new Date();

    function fmtDate(d: Date) {
      return format(d, "MM/dd/yyyy");
    }

    // Single prepayment
    if (selectedPaymentOption === "100% Prepayment") {
      const payDate = addDays(now, 10);
      return (
        <div className="mt-4">
          <h4 className="text-xl font-semibold text-gray-800">Payment Schedule</h4>
          <p className="text-md text-gray-600 mt-2">
            One-time payment of{" "}
            <span className="font-medium text-blue-600">
              ${formatWithSeparator(total)}
            </span>{" "}
            due on <strong>{fmtDate(payDate)}</strong>.
          </p>
        </div>
      );
    }

    // Quarterly
    if (selectedPaymentOption === "Quarterly") {
      const payAmount = total / 4;
      const schedule = [0, 3, 6, 9].map((m) => addMonths(now, m));
      return (
        <div className="mt-4">
          <h4 className="text-xl font-semibold text-gray-800">
            Payment Schedule (Quarterly)
          </h4>
          <p className="text-md text-gray-600 mt-2 mb-2">
            4 payments of{" "}
            <span className="font-medium text-blue-600">
              ${formatWithSeparator(payAmount)}
            </span>{" "}
            every 3 months.
          </p>
          <ul className="list-disc list-inside text-gray-600 text-md">
            {schedule.map((dateObj, idx) => (
              <li key={idx}>
                Payment #{idx + 1}: <strong>{fmtDate(dateObj)}</strong>{" "}
                (${formatWithSeparator(payAmount)})
              </li>
            ))}
          </ul>
        </div>
      );
    }

    // Monthly
    if (selectedPaymentOption === "Monthly") {
      const payAmount = total / 12;
      const schedule = Array.from({ length: 12 }).map((_, i) => addMonths(now, i));
      return (
        <div className="mt-4">
          <h4 className="text-xl font-semibold text-gray-800">
            Payment Schedule (Monthly)
          </h4>
          <p className="text-md text-gray-600 mt-2 mb-2">
            12 monthly payments of{" "}
            <span className="font-medium text-blue-600">
              ${formatWithSeparator(payAmount)}
            </span>.
          </p>
          <ul className="list-disc list-inside text-gray-600 text-md">
            {schedule.map((dateObj, idx) => (
              <li key={idx}>
                Payment #{idx + 1}: <strong>{fmtDate(dateObj)}</strong>{" "}
                (${formatWithSeparator(payAmount)})
              </li>
            ))}
          </ul>
        </div>
      );
    }

    return null;
  }

  function handleProceedToCheckout() {
    router.push("/packages/checkout");
  }

  function handleGoBack() {
    if (storedPackageId) {
      router.push(`/packages/services?packageId=${storedPackageId}`);
    } else {
      router.push("/packages/services");
    }
  }

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto">
        <BreadCrumb items={modifiedCrumbs} />
      </div>

      <div className="container mx-auto py-12 flex flex-col xl:flex-row gap-12">
        {/* LEFT: estimate details */}
        <div className="w-full xl:max-w-[700px] bg-brand-light p-4 sm:p-6 rounded-xl border border-gray-300 overflow-hidden lg:mr-auto">
          <SectionBoxSubtitle>
            Estimate for {chosenPackage ? chosenPackage.title : "No package found"}
          </SectionBoxSubtitle>

          {/* Services summary */}
          <div className="mt-4 space-y-6">
            {Object.keys(summaryBySection).length === 0 ? (
              <p className="text-gray-500">No services selected</p>
            ) : (
              Object.entries(summaryBySection).map(([sectionName, catMap], secIdx) => {
                const secNum = secIdx + 1;
                return (
                  <div key={sectionName} className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {secNum}. {sectionName}
                    </h3>
                    {Object.entries(catMap).map(([catId, items], catIdx) => {
                      const catNum = `${secNum}.${catIdx + 1}`;
                      const catObj = ALL_CATEGORIES.find((c) => c.id === catId);
                      const catTitle = catObj ? catObj.title : catId;

                      return (
                        <div key={catId} className="ml-0 sm:ml-4 space-y-4">
                          <h4 className="text-lg font-semibold text-gray-700">
                            {catNum}. {catTitle}
                          </h4>
                          {items.map((svc, svcIdx) => {
                            const svcNum = `${catNum}.${svcIdx + 1}`;
                            const totalCost = svc.labor + svc.materials;
                            return (
                              <div
                                key={svc.svcId}
                                className="border-b last:border-b-0 pb-3 mb-3 last:mb-0 last:pb-0"
                              >
                                <h5 className="font-medium text-md text-gray-800 mb-1">
                                  {svcNum}. {svc.title}
                                </h5>
                                {svc.description && (
                                  <p className="text-sm text-gray-500">{svc.description}</p>
                                )}

                                <div className="mt-2 flex justify-between items-center">
                                  <div className="text-md font-medium text-gray-700">
                                    {svc.quantity} {svc.unit}
                                  </div>
                                  <div className="text-md font-medium text-gray-800 mr-4">
                                    ${formatWithSeparator(totalCost)}
                                  </div>
                                </div>

                                {/* Cost breakdown */}
                                {svc.breakdown && (
                                  <div className="mt-2 p-2 sm:p-4 bg-gray-50 border rounded">
                                    <div className="flex justify-between mb-2">
                                      <span className="text-sm font-medium text-gray-700">
                                        Labor
                                      </span>
                                      <span className="text-sm font-medium text-gray-700">
                                        ${formatWithSeparator(svc.labor)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                      <span className="text-sm font-medium text-gray-700">
                                        Materials, tools &amp; equipment
                                      </span>
                                      <span className="text-sm font-medium text-gray-700">
                                        ${formatWithSeparator(svc.materials)}
                                      </span>
                                    </div>

                                    {Array.isArray(svc.breakdown.materials) &&
                                      svc.breakdown.materials.length > 0 && (
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
                                              {svc.breakdown.materials.map(
                                                (m: any, i2: number) => (
                                                  <tr key={`${m.external_id}-${i2}`}>
                                                    <td className="py-2 px-1">{m.name}</td>
                                                    <td className="py-2 px-1">
                                                      ${formatWithSeparator(
                                                        parseFloat(m.cost_per_unit)
                                                      )}
                                                    </td>
                                                    <td className="py-2 px-3">{m.quantity}</td>
                                                    <td className="py-2 px-3">
                                                      ${formatWithSeparator(parseFloat(m.cost))}
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
              })
            )}
          </div>

          {/* Subtotals */}
          <div className="pt-4 mt-4 border-t border-gray-200">
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
                Materials, tools &amp; equipment:
              </span>
              <span className="font-semibold text-lg text-gray-600">
                ${formatWithSeparator(materialsSubtotal)}
              </span>
            </div>

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
                {userState ? ` (${userState})` : ""}
                {taxRatePercent > 0 ? ` (${taxRatePercent.toFixed(2)}%)` : ""}
              </span>
              <span>${formatWithSeparator(taxAmount)}</span>
            </div>

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
                <strong>Address:</strong>{" "}
                {houseInfo.addressLine || "—"}
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

          {/* Action buttons */}
          <div className="mt-6 space-y-4">
            <button
              onClick={handleProceedToCheckout}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold sm:font-medium hover:bg-blue-700 transition-colors"
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
                font-semibold sm:font-medium
              "
            >
              Go back to Services →
            </Button>
          </div>
        </div>

        {/* RIGHT: PaymentOptionPanel */}
        <div className="w-full xl:w-[500px]">
          <PaymentOptionPanel
            subtotal={laborSubtotal}
            materialsAndFees={materialsSubtotal + serviceFeeOnLabor + serviceFeeOnMaterials}
            selectedOption={selectedPaymentOption}
            onConfirm={(label, coeff) => {
              setSelectedPaymentOption(label);
              setPaymentCoefficient(coeff);
            }}
          />
        </div>
      </div>
    </main>
  );
}