"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BreadCrumb from "@/components/ui/BreadCrumb";
import Button from "@/components/ui/Button";
import { SectionBoxTitle } from "@/components/ui/SectionBoxTitle";
import { SectionBoxSubtitle } from "@/components/ui/SectionBoxSubtitle";
import { EMERGENCY_STEPS } from "@/constants/navigation";
import { EMERGENCY_SERVICES } from "@/constants/emergency";
import { ALL_SERVICES } from "@/constants/services";
import { ChevronDown } from "lucide-react";

// Session utilities
import { setSessionItem, getSessionItem } from "@/utils/session";
// Number formatting utility
import { formatWithSeparator } from "@/utils/format";

/** Inline definition of the FinishingMaterial interface. */
interface FinishingMaterial {
  id: number;
  image?: string;
  unit_of_measurement: string;
  name: string;
  external_id: string;
  cost: string;
}

/**
 * Converts a hyphen-based service ID like "1-1-1" to dotted format "1.1.1"
 */
function convertServiceIdToApiFormat(serviceId: string) {
  return serviceId.replaceAll("-", ".");
}

/**
 * Returns the base API URL
 */
function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://dev.thejamb.com";
}

/**
 * Sends a POST /calculate request to the server
 */
async function calculatePrice(params: {
  work_code: string;
  zipcode: string;
  unit_of_measurement: string;
  square: number;
  finishing_materials?: string[];
}) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/calculate`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error(`Failed to calculate price (work_code=${params.work_code}).`);
  }
  return res.json();
}

/**
 * fetchFinishingMaterials: POST /work/finishing_materials
 * Takes a "work_code" like "1.1.1" and returns an object with "sections".
 */
async function fetchFinishingMaterials(workCode: string) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/work/finishing_materials`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ work_code: workCode }),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch finishing materials (work_code=${workCode}).`);
  }
  return res.json();
}

/**
 * Capitalize or transform a string from possible camelCase/PascalCase
 * to a spaced, title-style string.
 */
function capitalizeAndTransform(text: string): string {
  return text
    .replace(/([A-Z])/g, " $1")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());
}

export default function EmergencyDetails() {
  const router = useRouter();

  // Read from session using your new utility:
  const selectedServices = getSessionItem<Record<string, string[]>>("selectedServices", {});
  const fullAddress = getSessionItem<string>("fullAddress", "");
  const zip = getSessionItem<string>("zip", "");
  const photos = getSessionItem<string[]>("photos", []);
  const description = getSessionItem<string>("description", "");

  // Activities: each "service" can have multiple "activities"
  // Example: { plumbing: { "1-1-1": 2 }, ... }
  const [selectedActivities, setSelectedActivities] = useState<
    Record<string, Record<string, number>>
  >(() => getSessionItem("selectedActivities", {}));

  // Manual input values for the quantity field
  const [manualInputValue, setManualInputValue] = useState<
    Record<string, Record<string, string | null>>
  >({});

  // Expanded service panels
  const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set());

  // Potential warning message
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // (activityKey -> final numeric cost) from /calculate
  const [serviceCosts, setServiceCosts] = useState<Record<string, number>>({});

  // Full JSON from /calculate for each activity, to show cost breakdown
  const [calculationResultsMap, setCalculationResultsMap] = useState<Record<string, any>>({});

  // Data for finishing materials if the user wants to pick them
  // finishingMaterialsMapAll[activityKey] = { sections: Record<string, FinishingMaterial[]> }
  const [finishingMaterialsMapAll, setFinishingMaterialsMapAll] = useState<
    Record<string, { sections: Record<string, FinishingMaterial[]> }>
  >({});

  // finishingMaterialSelections[activityKey] = array of external_ids
  const [finishingMaterialSelections, setFinishingMaterialSelections] = useState<
    Record<string, string[]>
  >({});

  // Track a set of client-owned materials (highlighted in red)
  // Example: clientOwnedMaterials[activityKey] = Set of external_ids
  const [clientOwnedMaterials, setClientOwnedMaterials] = useState<
    Record<string, Set<string>>
  >({});

  // Show/hide the modal for selecting finishing materials
  const [showModalServiceId, setShowModalServiceId] = useState<string | null>(null);
  const [showModalSectionName, setShowModalSectionName] = useState<string | null>(null);

  // Persist selectedActivities to sessionStorage on each change
  useEffect(() => {
    setSessionItem("selectedActivities", selectedActivities);
  }, [selectedActivities]);

  /**
   * Whenever activities or ZIP changes => call /calculate for each activity.
   */
  useEffect(() => {
    const activityKeys: string[] = [];
    Object.values(selectedActivities).forEach((svcObj) => {
      Object.keys(svcObj).forEach((k) => activityKeys.push(k));
    });

    if (activityKeys.length === 0) {
      setServiceCosts({});
      setCalculationResultsMap({});
      return;
    }

    if (!zip) {
      setWarningMessage("Please enter your ZIP code before proceeding.");
      return;
    }

    // For each activity, do a /calculate
    activityKeys.forEach(async (activityKey) => {
      const found = ALL_SERVICES.find((x) => x.id === activityKey);
      if (!found) return;

      const quantity = getQuantityForActivity(activityKey);
      const dot = convertServiceIdToApiFormat(activityKey);

      // Ensure finishing materials are loaded
      await ensureFinishingMaterialsLoaded(activityKey);

      try {
        const resp = await calculatePrice({
          work_code: dot,
          zipcode: zip,
          unit_of_measurement: found.unit_of_measurement || "each",
          square: quantity,
          finishing_materials: finishingMaterialSelections[activityKey] || [],
        });

        const laborCost = parseFloat(resp.work_cost) || 0;
        const matCost = parseFloat(resp.material_cost) || 0;
        const total = laborCost + matCost;

        setServiceCosts((old) => ({ ...old, [activityKey]: total }));
        setCalculationResultsMap((old) => ({ ...old, [activityKey]: resp }));
      } catch (err) {
        console.error("Error fetching price for activity:", err);
      }
    });
  }, [selectedActivities, zip, finishingMaterialSelections]);

  // Helper to get quantity for a single activityKey
  function getQuantityForActivity(activityKey: string): number {
    for (const srv in selectedActivities) {
      if (activityKey in selectedActivities[srv]) {
        return selectedActivities[srv][activityKey] || 1;
      }
    }
    return 1;
  }

  // Ensure finishing materials are loaded for a given activityKey
  async function ensureFinishingMaterialsLoaded(activityKey: string) {
    if (finishingMaterialsMapAll[activityKey]) return; // already loaded

    const dot = convertServiceIdToApiFormat(activityKey);
    try {
      const data = await fetchFinishingMaterials(dot);
      finishingMaterialsMapAll[activityKey] = data;

      // if no finishingMaterialSelections => pick the first from each section
      if (!finishingMaterialSelections[activityKey]) {
        const singleSelections: string[] = [];
        for (const arr of Object.values(data.sections || {})) {
          if (Array.isArray(arr) && arr.length > 0) {
            singleSelections.push(arr[0].external_id);
          }
        }
        finishingMaterialSelections[activityKey] = singleSelections;
      }

      setFinishingMaterialsMapAll({ ...finishingMaterialsMapAll });
      setFinishingMaterialSelections({ ...finishingMaterialSelections });
    } catch (err) {
      console.error("ensureFinishingMaterialsLoaded:", err);
    }
  }

  // Toggle expanding a service panel
  function handleToggleExpand(serviceKey: string) {
    setExpandedServices((old) => {
      const next = new Set(old);
      if (next.has(serviceKey)) next.delete(serviceKey);
      else next.add(serviceKey);
      return next;
    });
  }

  // Toggle an activity ON/OFF => set quantity to its minQ if turning ON
  function handleActivityToggle(serviceKey: string, activityKey: string) {
    const foundActivity = ALL_SERVICES.find((x) => x.id === activityKey);
    const minQ = foundActivity?.min_quantity ?? 1;

    setSelectedActivities((prev) => {
      const current = prev[serviceKey] || {};

      // If this activity is already in selected state => remove it
      if (current[activityKey] != null) {
        const copy = { ...current };
        delete copy[activityKey];
        return { ...prev, [serviceKey]: copy };
      }

      // Otherwise, turn it ON => set quantity = minQ
      return { ...prev, [serviceKey]: { ...current, [activityKey]: minQ } };
    });

    // reset manual input for that activity
    setManualInputValue((old) => ({
      ...old,
      [serviceKey]: { ...old[serviceKey], [activityKey]: null },
    }));

    setWarningMessage(null);
  }

  // Increment or decrement quantity. Enforce min and max.
  function handleQuantityChange(serviceKey: string, activityKey: string, increment: boolean) {
    const found = ALL_SERVICES.find((x) => x.id === activityKey);
    if (!found) return;

    const minQ = found.min_quantity ?? 1;
    const maxQ = found.max_quantity ?? 99999;

    setSelectedActivities((prev) => {
      const currentVal = prev[serviceKey]?.[activityKey] ?? minQ;
      let newVal = increment ? currentVal + 1 : currentVal - 1;

      if (newVal < minQ) newVal = minQ;
      if (newVal > maxQ) {
        newVal = maxQ;
        setWarningMessage(`Maximum quantity for "${found.title}" is ${maxQ}.`);
      }

      return {
        ...prev,
        [serviceKey]: { ...prev[serviceKey], [activityKey]: newVal },
      };
    });

    // clear any manual input
    setManualInputValue((old) => ({
      ...old,
      [serviceKey]: { ...old[serviceKey], [activityKey]: null },
    }));
  }

  // Manually typed quantity. Enforce min and max.
  function handleManualQuantityChange(serviceKey: string, activityKey: string, value: string) {
    const found = ALL_SERVICES.find((x) => x.id === activityKey);
    if (!found) return;

    const minQ = found.min_quantity ?? 1;
    const maxQ = found.max_quantity ?? 99999;

    setManualInputValue((old) => ({
      ...old,
      [serviceKey]: { ...old[serviceKey], [activityKey]: value },
    }));

    let parsedVal = parseFloat(value.replace(/,/g, "")) || 0;
    if (parsedVal < minQ) parsedVal = minQ;
    if (parsedVal > maxQ) {
      parsedVal = maxQ;
      setWarningMessage(`Maximum quantity for "${found.title}" is ${maxQ}.`);
    }

    setSelectedActivities((prev) => ({
      ...prev,
      [serviceKey]: { ...prev[serviceKey], [activityKey]: Math.round(parsedVal) },
    }));

    setWarningMessage(null);
  }

  // On blur, if user leaves field empty => reset manual input
  function handleBlurInput(serviceKey: string, activityKey: string) {
    if (!manualInputValue[serviceKey]?.[activityKey]) {
      setManualInputValue((old) => ({
        ...old,
        [serviceKey]: { ...old[serviceKey], [activityKey]: null },
      }));
    }
  }

  // Clear all
  function handleClearSelection() {
    const c = window.confirm("Are you sure you want to clear all selections?");
    if (!c) return;

    setSelectedActivities({});
    setManualInputValue({});
    setServiceCosts({});
    setCalculationResultsMap({});
    setFinishingMaterialsMapAll({});
    setFinishingMaterialSelections({});
    setClientOwnedMaterials({});
    setExpandedServices(new Set());
    setWarningMessage(null);

    // Clear "selectedActivities" from session
    setSessionItem("selectedActivities", {});
  }

  // Calculate total from serviceCosts
  function calculateTotal() {
    return Object.values(serviceCosts).reduce((acc, v) => acc + v, 0);
  }

  // On Next => check if we have something, also check address
  function handleNext() {
    const hasAny = Object.values(selectedActivities).some(
      (obj) => Object.keys(obj).length > 0
    );
    if (!hasAny) {
      setWarningMessage("Please select at least one service before proceeding.");
      return;
    }
    if (!fullAddress.trim()) {
      setWarningMessage("Please enter your address before proceeding.");
      return;
    }
    router.push("/emergency/estimate");
  }

  // Build a list of services from the first step
  const servicesList = Object.entries(selectedServices).flatMap(([category, arr]) => {
    return arr.map((srvKey) => {
      const activities = EMERGENCY_SERVICES[category]?.services[srvKey]?.activities || {};
      return { service: srvKey, category, activities };
    });
  });

  // Toggle cost breakdown details for a single activity
  const [expandedServiceDetails, setExpandedServiceDetails] = useState<Set<string>>(new Set());
  function toggleActivityDetails(activityKey: string) {
    setExpandedServiceDetails((old) => {
      const next = new Set(old);
      if (next.has(activityKey)) next.delete(activityKey);
      else next.add(activityKey);
      return next;
    });
  }

  // find finishing material object for an external_id
  function findFinishingMaterialObj(activityKey: string, externalId: string) {
    const data = finishingMaterialsMapAll[activityKey];
    if (!data) return null;
    for (const arr of Object.values(data.sections || {})) {
      if (Array.isArray(arr)) {
        const found = arr.find((m) => m.external_id === externalId);
        if (found) return found;
      }
    }
    return null;
  }

  // user picks a new finishing material
  function pickMaterial(activityKey: string, externalId: string) {
    finishingMaterialSelections[activityKey] = [externalId];
    setFinishingMaterialSelections({ ...finishingMaterialSelections });
  }

  // user indicates they have their own material
  function userHasOwnMaterial(activityKey: string, externalId: string) {
    if (!clientOwnedMaterials[activityKey]) {
      clientOwnedMaterials[activityKey] = new Set();
    }
    clientOwnedMaterials[activityKey].add(externalId);
    setClientOwnedMaterials({ ...clientOwnedMaterials });
  }

  // open modal for finishing materials
  function onClickFinishingMaterialRow(activityKey: string, sectionName: string) {
    setShowModalServiceId(activityKey);
    setShowModalSectionName(sectionName);
  }

  // close finishing material modal
  function closeModal() {
    setShowModalServiceId(null);
    setShowModalSectionName(null);
  }

  // Save the entire calculationResultsMap to session if needed
  useEffect(() => {
    setSessionItem("calculationResultsMap", calculationResultsMap);
  }, [calculationResultsMap]);

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto relative">
        <BreadCrumb items={EMERGENCY_STEPS} />

        {/* Top row: title + Next button */}
        <div className="flex justify-between items-start mt-8">
          <SectionBoxTitle>Emergency Details</SectionBoxTitle>
          <Button onClick={handleNext}>Next →</Button>
        </div>

        {/* Clear or Contact Support */}
        <div className="flex justify-between items-center text-sm text-gray-500 mt-8 w-full max-w-[600px]">
          <span>
            No service?{" "}
            <a href="#" className="text-blue-600 hover:underline focus:outline-none">
              Contact emergency support
            </a>
          </span>
          <button
            onClick={handleClearSelection}
            className="text-blue-600 hover:underline focus:outline-none"
          >
            Clear
          </button>
        </div>

        {/* Warning */}
        <div className="h-6 mt-4 text-left">
          {warningMessage && <p className="text-red-500">{warningMessage}</p>}
        </div>

        {/* Main content: services on the left, summary on the right */}
        <div className="container mx-auto relative flex mt-8">
          {/* LEFT column: each selected service + activities */}
          <div className="flex-1">
            <div className="flex flex-col gap-4 mt-4 w-full max-w-[600px]">
              {servicesList.map(({ service, category, activities }, idx) => {
                const serviceLabel = capitalizeAndTransform(service);
                const isExpanded = expandedServices.has(service);

                // how many chosen in this service
                const chosenCount = Object.keys(selectedActivities[service] || {}).length;

                return (
                  <div
                    key={`${category}-${service}`}
                    className="p-4 border rounded-xl bg-white border-gray-300"
                  >
                    {/* Service header */}
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => handleToggleExpand(service)}
                    >
                      <span
                        className={`text-2xl font-medium ${
                          chosenCount > 0 ? "text-blue-600" : "text-gray-800"
                        }`}
                      >
                        {serviceLabel}
                        {chosenCount > 0 && (
                          <span className="text-sm text-gray-500 ml-2">
                            ({chosenCount} selected)
                          </span>
                        )}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 transform transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </div>

                    {isExpanded && (
                      <div className="mt-4 flex flex-col gap-4">
                        {Object.entries(activities).map(([activityKey, activityData], i2) => {
                          const isSelected =
                            selectedActivities[service]?.[activityKey] != null;
                          const activityLabel = capitalizeAndTransform(activityData.activity);
                          const foundActivity = ALL_SERVICES.find((x) => x.id === activityKey);

                          // cost from the server
                          const finalCost = serviceCosts[activityKey] || 0;
                          // entire JSON
                          const calcResult = calculationResultsMap[activityKey];
                          const detailsExpanded = expandedServiceDetails.has(activityKey);

                          return (
                            <div key={activityKey} className="space-y-2">
                              {/* Toggle row */}
                              <div className="flex justify-between items-center">
                                <span className="text-lg text-gray-800">{activityLabel}</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleActivityToggle(service, activityKey)}
                                    className="sr-only peer"
                                  />
                                  <div className="w-[50px] h-[26px] bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors duration-300"></div>
                                  <div className="absolute top-[2px] left-[2px] w-[22px] h-[22px] bg-white rounded-full shadow-md peer-checked:translate-x-[24px] transform transition-transform duration-300"></div>
                                </label>
                              </div>

                              {isSelected && foundActivity && (
                                <>
                                  {foundActivity.description && (
                                    <p className="text-sm text-gray-500 pr-16">
                                      {foundActivity.description}
                                    </p>
                                  )}

                                  {/* Quantity & cost row */}
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-1">
                                      {/* Decrement */}
                                      <button
                                        onClick={() =>
                                          handleQuantityChange(service, activityKey, false)
                                        }
                                        className="w-8 h-8 bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg rounded"
                                      >
                                        −
                                      </button>
                                      {/* Manual input */}
                                      <input
                                        type="text"
                                        value={
                                          manualInputValue[service]?.[activityKey] != null
                                            ? manualInputValue[service][activityKey]!
                                            : (selectedActivities[service]?.[activityKey] || 1).toString()
                                        }
                                        onClick={() =>
                                          setManualInputValue((old) => ({
                                            ...old,
                                            [service]: {
                                              ...old[service],
                                              [activityKey]: "",
                                            },
                                          }))
                                        }
                                        onBlur={() => handleBlurInput(service, activityKey)}
                                        onChange={(e) =>
                                          handleManualQuantityChange(service, activityKey, e.target.value)
                                        }
                                        className="w-20 text-center px-2 py-1 border rounded"
                                      />
                                      {/* Increment */}
                                      <button
                                        onClick={() =>
                                          handleQuantityChange(service, activityKey, true)
                                        }
                                        className="w-8 h-8 bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg rounded"
                                      >
                                        +
                                      </button>
                                      <span className="text-sm text-gray-600">
                                        {foundActivity.unit_of_measurement}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      {/* Final cost */}
                                      <span className="text-lg text-blue-600 font-medium text-right">
                                        ${formatWithSeparator(finalCost)}
                                      </span>
                                      {/* "Details" button */}
                                      <button
                                        onClick={() => toggleActivityDetails(activityKey)}
                                        className={`text-blue-500 text-sm ml-2 ${
                                          detailsExpanded ? "" : "underline"
                                        }`}
                                      >
                                        Details
                                      </button>
                                    </div>
                                  </div>

                                  {/* Cost Breakdown */}
                                  {calcResult && detailsExpanded && (
                                    <div className="mt-4 p-4 bg-gray-50 border rounded">
                                      <h4 className="text-lg font-semibold text-gray-800 mb-3">
                                        Cost Breakdown
                                      </h4>

                                      <div className="flex flex-col gap-2 mb-4">
                                        <div className="flex justify-between">
                                          <span className="text-md font-medium text-gray-700">
                                            Labor
                                          </span>
                                          <span className="text-md font-medium text-gray-700">
                                            {calcResult.work_cost
                                              ? `$${calcResult.work_cost}`
                                              : "—"}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-md font-medium text-gray-700">
                                            Materials, tools & equipment
                                          </span>
                                          <span className="text-md font-medium text-gray-700">
                                            {calcResult.material_cost
                                              ? `$${calcResult.material_cost}`
                                              : "—"}
                                          </span>
                                        </div>
                                      </div>

                                      {Array.isArray(calcResult.materials) &&
                                        calcResult.materials.length > 0 && (
                                          <div className="mt-2">
                                            <table className="table-auto w-full text-sm text-left text-gray-700">
                                              <thead>
                                                <tr className="border-b">
                                                  <th className="py-2 px-1">Name</th>
                                                  <th className="py-2 px-1">Price</th>
                                                  <th className="py-2 px-1">Qty</th>
                                                  <th className="py-2 px-1">Subtotal</th>
                                                </tr>
                                              </thead>
                                              <tbody className="divide-y divide-gray-200">
                                                {calcResult.materials.map((m: any, i: number) => {
                                                  const fmObj = findFinishingMaterialObj(
                                                    activityKey,
                                                    m.external_id
                                                  );
                                                  const hasImage = fmObj?.image?.length
                                                    ? true
                                                    : false;

                                                  const isClientOwned =
                                                    clientOwnedMaterials[activityKey]?.has(
                                                      m.external_id
                                                    );

                                                  let rowClass = "";
                                                  if (isClientOwned) {
                                                    rowClass = "border border-red-500 bg-red-50";
                                                  } else if (hasImage) {
                                                    rowClass = "border border-blue-300 bg-white cursor-pointer";
                                                  }

                                                  return (
                                                    <tr
                                                      key={`${m.external_id}-${i}`}
                                                      className={`last:border-0 ${rowClass}`}
                                                      onClick={() => {
                                                        // if has image and not client-owned => open modal
                                                        if (hasImage && !isClientOwned) {
                                                          let foundSection: string | null = null;
                                                          const fmData = finishingMaterialsMapAll[
                                                            activityKey
                                                          ];
                                                          if (fmData && fmData.sections) {
                                                            for (const [secName, list] of Object.entries(
                                                              fmData.sections
                                                            )) {
                                                              if (
                                                                Array.isArray(list) &&
                                                                list.some(
                                                                  (xx) => xx.external_id === m.external_id
                                                                )
                                                              ) {
                                                                foundSection = secName;
                                                                break;
                                                              }
                                                            }
                                                          }
                                                          setShowModalServiceId(activityKey);
                                                          setShowModalSectionName(foundSection);
                                                        }
                                                      }}
                                                    >
                                                      <td className="py-3 px-1">
                                                        {hasImage ? (
                                                          <div className="flex items-center gap-2">
                                                            <img
                                                              src={fmObj?.image}
                                                              alt={m.name}
                                                              className="w-8 h-8 object-cover rounded"
                                                            />
                                                            <span>{m.name}</span>
                                                          </div>
                                                        ) : (
                                                          m.name
                                                        )}
                                                      </td>
                                                      <td className="py-3 px-1">
                                                        ${m.cost_per_unit}
                                                      </td>
                                                      <td className="py-3 px-3">{m.quantity}</td>
                                                      <td className="py-3 px-3">${m.cost}</td>
                                                    </tr>
                                                  );
                                                })}
                                              </tbody>
                                            </table>
                                          </div>
                                        )}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT column: summary, address, photos, description */}
          <div className="w-1/2 ml-auto mt-16 pt-1">
            {/* Summary */}
            <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden">
              <SectionBoxSubtitle>Summary</SectionBoxSubtitle>
              {Object.keys(selectedActivities).length === 0 ? (
                <div className="text-left text-gray-500 text-medium mt-4">
                  No services selected
                </div>
              ) : (
                <>
                  <ul className="mt-4 space-y-2 pb-4">
                    {Object.entries(selectedActivities).flatMap(([srvKey, acts]) =>
                      Object.entries(acts).map(([activityKey, quantity]) => {
                        const foundAct = ALL_SERVICES.find((x) => x.id === activityKey);
                        if (!foundAct) return null;
                        const finalCost = serviceCosts[activityKey] || 0;
                        return (
                          <li
                            key={activityKey}
                            className="grid grid-cols-3 gap-2 text-sm text-gray-600"
                            style={{
                              gridTemplateColumns: "46% 25% 25%",
                              width: "100%",
                            }}
                          >
                            <span className="truncate overflow-hidden">
                              {foundAct.title}
                            </span>
                            <span className="text-right">
                              {quantity} {foundAct.unit_of_measurement}
                            </span>
                            <span className="text-right">
                              ${formatWithSeparator(finalCost)}
                            </span>
                          </li>
                        );
                      })
                    )}
                  </ul>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xl font-semibold text-gray-800">Subtotal:</span>
                    <span className="text-2xl font-semibold text-blue-600">
                      ${formatWithSeparator(calculateTotal())}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Address */}
            <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden mt-6">
              <h2 className="text-2xl font-medium text-gray-800 mb-4">Address</h2>
              <p className="text-gray-500 text-medium">
                {fullAddress || "No address provided"}
              </p>
            </div>

            {/* Photos */}
            <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden mt-6">
              <h2 className="text-2xl font-medium text-gray-800 mb-4">Uploaded Photos</h2>
              <div className="grid grid-cols-2 gap-4">
                {photos.map((photo, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={photo}
                      alt={`Uploaded photo ${idx + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
              {photos.length === 0 && (
                <p className="text-medium text-gray-500 mt-2">No photos uploaded</p>
              )}
            </div>

            {/* Description */}
            <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden mt-6">
              <h2 className="text-2xl font-medium text-gray-800 mb-4">Problem Description</h2>
              <p className="text-gray-500 text-medium whitespace-pre-wrap">
                {description || "No description provided"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for finishing materials if a row with an image is clicked */}
      {showModalServiceId &&
        showModalSectionName &&
        finishingMaterialsMapAll[showModalServiceId] &&
        finishingMaterialsMapAll[showModalServiceId].sections[showModalSectionName] && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-[700px] h-[750px] overflow-hidden relative flex flex-col">
              {/* Header */}
              <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-xl font-semibold">
                  Choose a finishing material (section {showModalSectionName})
                </h2>
                <button
                  onClick={closeModal}
                  className="text-red-500 border border-red-500 px-2 py-1 rounded"
                >
                  Close
                </button>
              </div>

              {/* Current material info */}
              {(() => {
                const currentSel = finishingMaterialSelections[showModalServiceId] || [];
                if (currentSel.length === 0) return null;
                const currentExtId = currentSel[0];
                const curMat = findFinishingMaterialObj(showModalServiceId, currentExtId);
                if (!curMat) return null;

                const curCost = parseFloat(curMat.cost || "0") || 0;

                return (
                  <div className="text-sm text-gray-600 border-b p-4 bg-white sticky top-[61px] z-10">
                    Current material:{" "}
                    <strong>
                      {curMat.name} (${formatWithSeparator(curCost)})
                    </strong>
                    <button
                      onClick={() => userHasOwnMaterial(showModalServiceId!, currentExtId)}
                      className="ml-4 text-xs text-red-500 border border-red-500 px-2 py-1 rounded"
                    >
                      I have my own (Remove later)
                    </button>
                  </div>
                );
              })()}

              {/* Scrollable content with available finishing materials */}
              <div className="overflow-auto p-4 flex-1">
                {(() => {
                  const data = finishingMaterialsMapAll[showModalServiceId];
                  if (!data) return <p className="text-sm text-gray-500">No data found</p>;

                  const arr = data.sections[showModalSectionName] || [];
                  if (!Array.isArray(arr) || arr.length === 0) {
                    return (
                      <p className="text-sm text-gray-500">
                        No finishing materials in this section.
                      </p>
                    );
                  }

                  // current selection
                  const curSel = finishingMaterialSelections[showModalServiceId] || [];
                  const currentExtId = curSel[0] || null;
                  let currentCost = 0;
                  if (currentExtId) {
                    const cMat = findFinishingMaterialObj(showModalServiceId, currentExtId);
                    if (cMat) currentCost = parseFloat(cMat.cost || "0") || 0;
                  }

                  return (
                    <div className="grid grid-cols-2 gap-4">
                      {arr.map((material, i) => {
                        // show only if there's an image
                        if (!material.image) return null;
                        const costNum = parseFloat(material.cost || "0") || 0;
                        const isSelected = currentExtId === material.external_id;
                        const diff = costNum - currentCost;
                        let diffStr = "";
                        let diffColor = "";
                        if (diff > 0) {
                          diffStr = `+${formatWithSeparator(diff)}`;
                          diffColor = "text-red-500";
                        } else if (diff < 0) {
                          diffStr = `-${formatWithSeparator(Math.abs(diff))}`;
                          diffColor = "text-green-600";
                        }

                        return (
                          <div
                            key={`${material.external_id}-${i}`}
                            className={`border rounded p-3 flex flex-col items-center cursor-pointer ${
                              isSelected ? "border-blue-500" : "border-gray-300"
                            }`}
                            onClick={() => {
                              finishingMaterialSelections[showModalServiceId] = [
                                material.external_id,
                              ];
                              setFinishingMaterialSelections({ ...finishingMaterialSelections });
                            }}
                          >
                            <img
                              src={material.image}
                              alt={material.name}
                              className="w-32 h-32 object-cover rounded"
                            />
                            <h3 className="text-sm font-medium mt-2 text-center line-clamp-2">
                              {material.name}
                            </h3>
                            <p className="text-xs text-gray-700">
                              ${formatWithSeparator(costNum)} / {material.unit_of_measurement}
                            </p>
                            {diff !== 0 && (
                              <p className={`text-xs mt-1 font-medium ${diffColor}`}>
                                {diffStr}
                              </p>
                            )}
                            {isSelected && (
                              <span className="text-xs text-blue-600 font-semibold mt-1">
                                Currently Selected
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
    </main>
  );
}