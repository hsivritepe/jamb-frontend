"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BreadCrumb from "@/components/ui/BreadCrumb";
import { SectionBoxTitle } from "@/components/ui/SectionBoxTitle";
import { SectionBoxSubtitle } from "@/components/ui/SectionBoxSubtitle";
import ActionIconsBar from "@/components/ui/ActionIconsBar";
import { PACKAGES_STEPS } from "@/constants/navigation";
import { PACKAGES } from "@/constants/packages";
import { ALL_SERVICES } from "@/constants/services";
import { ALL_CATEGORIES } from "@/constants/categories";

/** Save JSON to sessionStorage (client side). */
function saveToSession(key: string, value: any) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(key, JSON.stringify(value));
  }
}

/** Load JSON from sessionStorage or return defaultValue if not found or SSR. */
function loadFromSession<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  const raw = sessionStorage.getItem(key);
  try {
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/** Format a number with commas and exactly two decimals (e.g., 1234 => 1,234.00). */
function formatWithSeparator(num: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Build a "temporary" order number using houseInfo.city and houseInfo.zip,
 * plus the current time. Format: CCC-ZZZZZ-YYYYDDMM-HHMM
 *  - CCC = first 3 letters of city or "NOC" if missing
 *  - ZZZZZ = zip or "00000" if missing
 *  - YYYYDDMM (year, day, month)
 *  - HHMM (hour + minute)
 */
function buildEstimateNumber(city: string, zipCode: string): string {
  const cityPart = city ? city.slice(0, 3).toUpperCase() : "NOC";
  const zipPart = zipCode || "00000";

  const now = new Date();
  const yyyy = String(now.getFullYear());
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  // => YYYYDDMM
  const dateString = `${yyyy}${dd}${mm}`;
  const hh = String(now.getHours()).padStart(2, "0");
  const mins = String(now.getMinutes()).padStart(2, "0");
  const timeString = hh + mins;

  return `${cityPart}-${zipPart}-${dateString}-${timeString}`;
}

/**
 * If "Quarterly" or "Monthly" is selected, we display approximate payment dates.
 */
function getPaymentScheduleInfo(
  selectedPaymentOption: string | null,
  finalTotal: number
): JSX.Element | null {
  if (!selectedPaymentOption) return null;

  // Helper to format a date as mm/dd/yyyy
  function formatDate(date: Date): string {
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  }

  if (selectedPaymentOption === "100% Prepayment") {
    return (
      <div className="mt-4">
        <h4 className="text-lg font-semibold text-gray-800">Payment Schedule</h4>
        <p className="text-sm text-gray-600 mt-2">
          You pay the entire total of{" "}
          <span className="font-medium text-blue-600">
            ${formatWithSeparator(finalTotal)}
          </span>{" "}
          upfront. Thank you!
        </p>
      </div>
    );
  } else if (selectedPaymentOption === "Monthly") {
    const monthly = finalTotal / 12;
    return (
      <div className="mt-4">
        <h4 className="text-lg font-semibold text-gray-800">
          Payment Schedule (Monthly)
        </h4>
        <p className="text-sm text-gray-600 mt-2">
          You will pay{" "}
          <span className="font-medium text-blue-600">
            ${formatWithSeparator(monthly)}
          </span>{" "}
          each month for 12 months, starting immediately.
        </p>
      </div>
    );
  } else if (selectedPaymentOption === "Quarterly") {
    const quarterly = finalTotal / 4;
    const now = new Date();
    const dates: string[] = [];
    for (let i = 0; i < 4; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i * 3, now.getDate());
      dates.push(formatDate(d));
    }
    return (
      <div className="mt-4">
        <h4 className="text-lg font-semibold text-gray-800">
          Payment Schedule (Quarterly)
        </h4>
        <p className="text-sm text-gray-600 mt-2 mb-2">
          You will pay{" "}
          <span className="font-medium text-blue-600">
            ${formatWithSeparator(quarterly)}
          </span>{" "}
          every 3 months (4 payments total).
        </p>
        <ul className="list-disc list-inside text-sm text-gray-600">
          {dates.map((date, idx) => (
            <li key={idx}>
              Payment #{idx + 1}: {date}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return null;
}

export default function PackagesCheckoutPage() {
  const router = useRouter();

  // 1) Load needed data from session
  const paymentCoefficient = loadFromSession("packages_timeCoefficient", 1);
  const selectedPaymentOption = loadFromSession<string | null>(
    "packages_selectedTime",
    null
  );

  const selectedServicesFromSession = loadFromSession("packages_selectedServices", {
    indoor: {},
    outdoor: {},
  });
  const mergedSelected: Record<string, number> = {
    ...selectedServicesFromSession.indoor,
    ...selectedServicesFromSession.outdoor,
  };

  const houseInfo = loadFromSession("packages_houseInfo", {
    addressLine: "",
    city: "",
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

  const description = loadFromSession("packages_description", "");
  const photos: string[] = loadFromSession("packages_photos", []);

  // Check which package was chosen
  const storedPackageId = loadFromSession("packages_currentPackageId", null);
  const chosenPackage = PACKAGES.find((pkg) => pkg.id === storedPackageId) || null;

  // Если нет адреса или не выбрано сервисов -> уходим на Estimate,
  // добавляя ?packageId=...
  useEffect(() => {
    if (!houseInfo.addressLine || Object.keys(mergedSelected).length === 0) {
      if (storedPackageId) {
        router.push(`/packages/estimate?packageId=${storedPackageId}`);
      } else {
        router.push("/packages/estimate");
      }
    }
  }, [houseInfo, mergedSelected, storedPackageId, router]);

  // 2) Calculate total
  function calculateSubtotal(): number {
    let sum = 0;
    for (const [svcId, qty] of Object.entries(mergedSelected)) {
      const found = ALL_SERVICES.find((s) => s.id === svcId);
      if (found) sum += found.price * qty;
    }
    return sum;
  }

  const subtotal = calculateSubtotal();
  const adjustedSubtotal = subtotal * paymentCoefficient;
  const salesTax = adjustedSubtotal * 0.0825;
  const total = adjustedSubtotal + salesTax;

  // Discounts or surcharges?
  const hasDiscount = paymentCoefficient < 1;
  const discountAmount = hasDiscount ? subtotal * (1 - paymentCoefficient) : 0;
  const hasSurcharge = paymentCoefficient > 1;
  const surchargeAmount = hasSurcharge ? subtotal * (paymentCoefficient - 1) : 0;

  // 3) Group selected items by section -> category
  type ServiceItem = {
    svcObj: (typeof ALL_SERVICES)[number];
    qty: number;
  };
  const itemsArr: ServiceItem[] = Object.entries(mergedSelected)
    .map(([svcId, qty]) => {
      const svc = ALL_SERVICES.find((s) => s.id === svcId);
      return svc ? { svcObj: svc, qty } : null;
    })
    .filter(Boolean) as ServiceItem[];

  const summaryBySection: Record<string, { catName: string; data: ServiceItem[] }[]> = {};
  itemsArr.forEach(({ svcObj, qty }) => {
    const catId = svcObj.id.split("-").slice(0, 2).join("-");
    const catObj = ALL_CATEGORIES.find((c) => c.id === catId);
    if (!catObj) return;
    const sectionName = catObj.section;

    if (!summaryBySection[sectionName]) {
      summaryBySection[sectionName] = [];
    }
    let catEntry = summaryBySection[sectionName].find(
      (x) => x.catName === catObj.title
    );
    if (!catEntry) {
      catEntry = { catName: catObj.title, data: [] };
      summaryBySection[sectionName].push(catEntry);
    }
    catEntry.data.push({ svcObj, qty });
  });

  // 4) Build "temporary order number"
  const estimateNumber = buildEstimateNumber(houseInfo.city, houseInfo.zip);

  // 5) Place order
  function handlePlaceOrder() {
    alert("Your package order has been placed!");
    // e.g. router.push("/packages/checkout/confirmation")
  }

  // 6) For printing, sharing, saving
  function handlePrint() {
    router.push("/packages/checkout/print");
  }
  function handleShare() {
    alert("Sharing your final order...");
  }
  function handleSave() {
    alert("Saving your final order as PDF...");
  }

  // 7) Вместо router.back() – уходим на /packages/estimate?packageId=...
  function handleGoBackToEstimate() {
    if (storedPackageId) {
      router.push(`/packages/estimate?packageId=${storedPackageId}`);
    } else {
      router.push("/packages/estimate");
    }
  }

  // 8) Делаем модифицированный хлебный крошки – везде сохраняем ?packageId
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

  return (
    <main className="min-h-screen py-24">
      <div className="container mx-auto">
        {/* Используем теперь modifiedCrumbs */}
        <BreadCrumb items={modifiedCrumbs} />
      </div>

      <div className="container mx-auto">
        {/* Top bar: go back to Estimate + place order */}
        <div className="flex justify-between items-center mt-8">
          <span
            className="text-blue-600 cursor-pointer"
            onClick={handleGoBackToEstimate}
          >
            ← Back to Estimate
          </span>
          <button
            className="bg-yellow-400 hover:bg-yellow-500 text-black py-3 px-6 rounded-md font-semibold text-lg shadow-sm transition-colors duration-200"
            onClick={handlePlaceOrder}
          >
            Place your order
          </button>
        </div>

        {/* Title + icons */}
        <div className="flex items-center justify-between mt-8">
          <SectionBoxTitle>
            {chosenPackage ? chosenPackage.title : "No Package"}
          </SectionBoxTitle>
          <ActionIconsBar
            onPrint={handlePrint}
            onShare={handleShare}
            onSave={handleSave}
          />
        </div>

        <div className="bg-white border border-gray-300 mt-8 p-6 rounded-lg space-y-6">
          {/* Final Estimate */}
          <div>
            <SectionBoxSubtitle>
              Order
              <span className="ml-2 text-sm text-gray-500">
                ({estimateNumber})
              </span>
            </SectionBoxSubtitle>
            <p className="text-xs text-gray-400 -mt-2 ml-1">
              *This number is temporary and will be replaced with a permanent
              order number after confirmation.
            </p>

            {/* Render selected services */}
            <div className="mt-4 space-y-4">
              {Object.keys(summaryBySection).length === 0 ? (
                <p className="text-gray-500">No services selected</p>
              ) : (
                Object.entries(summaryBySection).map(([section, cats]) => (
                  <div key={section} className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {section}
                    </h3>
                    {cats.map((catObj) => {
                      const { catName, data } = catObj;
                      return (
                        <div key={catName} className="ml-4 space-y-4">
                          <h4 className="text-lg font-medium text-gray-700">
                            {catName}
                          </h4>
                          {data.map(({ svcObj, qty }) => (
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
                                    <span>{svcObj.description}</span>
                                  </div>
                                )}
                                <div className="text-medium font-medium text-gray-800 mt-2">
                                  <span>{qty.toLocaleString("en-US")} </span>
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

            {/* Summary of costs */}
            <div className="pt-4 mt-4">
              {/* discount or surcharge */}
              {hasDiscount && (
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-semibold text-lg text-green-600">
                    -${formatWithSeparator(discountAmount)}
                  </span>
                </div>
              )}
              {hasSurcharge && (
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Surcharge</span>
                  <span className="font-semibold text-lg text-red-600">
                    +${formatWithSeparator(surchargeAmount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between mb-2">
                <span className="font-semibold text-lg text-gray-800">
                  Subtotal
                </span>
                <span className="font-semibold text-lg text-gray-800">
                  ${formatWithSeparator(subtotal * paymentCoefficient)}
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

          {/* Payment Option */}
          <hr className="my-6 border-gray-200" />
          <div>
            <SectionBoxSubtitle>Payment Option</SectionBoxSubtitle>
            {selectedPaymentOption ? (
              <p className="text-gray-700">
                Selected:{" "}
                <span className="font-medium text-blue-600">
                  {selectedPaymentOption}
                </span>
              </p>
            ) : (
              <p className="text-gray-500">No payment option chosen</p>
            )}
            {getPaymentScheduleInfo(selectedPaymentOption, total)}
          </div>

          {/* House Info */}
          <hr className="my-6 border-gray-200" />
          <div>
            <SectionBoxSubtitle>Home Details</SectionBoxSubtitle>
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
                {houseInfo.hasPool
                  ? `${houseInfo.poolArea} sq ft`
                  : "No pool"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}