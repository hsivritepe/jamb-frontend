"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
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

// Modal components
import FinishingMaterialsModal from "@/components/FinishingMaterialsModal";
import SurfaceCalculatorModal from "@/components/SurfaceCalculatorModal"; // <-- ваш компонент калькулятора

interface FinishingMaterial {
  id: number;
  image?: string;
  unit_of_measurement: string;
  name: string;
  external_id: string;
  cost: string;
}

/** Converts "1-1-1" to "1.1.1". */
function convertServiceIdToApiFormat(serviceId: string) {
  return serviceId.replaceAll("-", ".");
}

/** Returns the base API URL. */
function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "https://dev.thejamb.com";
}

/** Sends a POST /calculate request to the server. */
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
    throw new Error(
      `Failed to calculate price (work_code=${params.work_code}).`
    );
  }
  return res.json();
}

/** Sends a POST /work/finishing_materials request to the server. */
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
    throw new Error(
      `Failed to fetch finishing materials (work_code=${workCode}).`
    );
  }
  return res.json();
}

/** Renders an image for a given activityKey. */
function ServiceImage({ activityKey }: { activityKey: string }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    const firstSegment = activityKey.split("-")[0];
    const code = convertServiceIdToApiFormat(activityKey);
    const url = `https://dev.thejamb.com/images/${firstSegment}/${code}.jpg`;
    setImageSrc(url);
  }, [activityKey]);

  if (!imageSrc) return null;

  return (
    <div className="mb-2 border rounded overflow-hidden w-full">
      <Image
        src={imageSrc}
        alt="Service"
        width={600}
        height={400}
        className="w-full h-auto object-cover"
      />
    </div>
  );
}

/** Capitalizes and inserts spaces before uppercase letters. */
function capitalizeAndTransform(text: string): string {
  return text
    .replace(/([A-Z])/g, " $1")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());
}

export default function EmergencyDetails() {
  const router = useRouter();

  // Session data
  const selectedServices = getSessionItem<Record<string, string[]>>(
    "selectedServices",
    {}
  );
  const fullAddress = getSessionItem<string>("fullAddress", "");
  const zip = getSessionItem<string>("zip", "");
  const photos = getSessionItem<string[]>("photos", []);
  const description = getSessionItem<string>("description", "");

  // selectedActivities => { [serviceKey]: { [activityKey]: number } }
  const [selectedActivities, setSelectedActivities] = useState<
    Record<string, Record<string, number>>
  >(() => getSessionItem("selectedActivities", {}));

  // Manual input for quantity
  const [manualInputValue, setManualInputValue] = useState<
    Record<string, Record<string, string | null>>
  >({});

  // Which service panels are expanded
  const [expandedServices, setExpandedServices] = useState<Set<string>>(
    new Set()
  );

  // Warnings
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Calculated costs
  const [serviceCosts, setServiceCosts] = useState<Record<string, number>>({});
  const [calculationResultsMap, setCalculationResultsMap] = useState<
    Record<string, any>
  >({});

  // Finishing materials data
  const [finishingMaterialsMapAll, setFinishingMaterialsMapAll] = useState<
    Record<string, { sections: Record<string, FinishingMaterial[]> }>
  >({});

  // finishingMaterialSelections[activityKey] = { [sectionName]: externalId }
  const [finishingMaterialSelections, setFinishingMaterialSelections] =
    useState<Record<string, Record<string, string>>>({});

  // Tracks client-owned materials
  const [clientOwnedMaterials, setClientOwnedMaterials] = useState<
    Record<string, Set<string>>
  >({});

  // Modal state (finishing materials)
  const [showModalServiceId, setShowModalServiceId] = useState<string | null>(
    null
  );
  const [showModalSectionName, setShowModalSectionName] = useState<
    string | null
  >(null);

  // Expanded cost breakdown per activity
  const [expandedServiceDetails, setExpandedServiceDetails] = useState<
    Set<string>
  >(new Set());

  // Persist selectedActivities to session
  useEffect(() => {
    setSessionItem("selectedActivities", selectedActivities);
  }, [selectedActivities]);

  // Persist calculationResultsMap if needed
  useEffect(() => {
    setSessionItem("calculationResultsMap", calculationResultsMap);
  }, [calculationResultsMap]);

  // ----------------------------------------------------------------------------
  // SURFACE CALCULATOR logic
  // ----------------------------------------------------------------------------
  const [surfaceCalcOpen, setSurfaceCalcOpen] = useState(false);
  const [surfaceCalcServiceKey, setSurfaceCalcServiceKey] = useState<
    string | null
  >(null);
  const [surfaceCalcActivityKey, setSurfaceCalcActivityKey] = useState<
    string | null
  >(null);

  // open calculator
  function openSurfaceCalc(serviceKey: string, activityKey: string) {
    setSurfaceCalcServiceKey(serviceKey);
    setSurfaceCalcActivityKey(activityKey);
    setSurfaceCalcOpen(true);
  }

  // use calculated area
  function handleApplySquareFeet(serviceId: string, sqFeet: number) {
    if (!surfaceCalcServiceKey || !surfaceCalcActivityKey) return;

    const found = ALL_SERVICES.find((x) => x.id === surfaceCalcActivityKey);
    if (!found) return;

    const minQ = found.min_quantity ?? 1;
    const maxQ = found.max_quantity ?? 99999;
    let finalVal = sqFeet;
    if (finalVal < minQ) finalVal = minQ;
    if (finalVal > maxQ) {
      finalVal = maxQ;
      setWarningMessage(`Maximum quantity for "${found.title}" is ${maxQ}.`);
    }

    // Обновляем selectedActivities
    setSelectedActivities((prev) => {
      const copy = { ...prev };
      if (!copy[surfaceCalcServiceKey]) {
        copy[surfaceCalcServiceKey] = {};
      }
      copy[surfaceCalcServiceKey][surfaceCalcActivityKey] = finalVal;
      return copy;
    });

    // Close modal
    setSurfaceCalcOpen(false);
  }
  // ----------------------------------------------------------------------------

  // ----------------------------------------------------------------------------
  // Recalculate costs whenever selected activities or ZIP changes
  // ----------------------------------------------------------------------------
  useEffect(() => {
    const allActivityKeys: string[] = [];
    Object.values(selectedActivities).forEach((serviceObj) => {
      Object.keys(serviceObj).forEach((k) => allActivityKeys.push(k));
    });

    if (allActivityKeys.length === 0) {
      setServiceCosts({});
      setCalculationResultsMap({});
      return;
    }

    if (!zip) {
      setWarningMessage("Please enter your ZIP code before proceeding.");
      return;
    }

    // Fetch cost for each activity
    allActivityKeys.forEach(async (activityKey) => {
      const found = ALL_SERVICES.find((x) => x.id === activityKey);
      if (!found) return;

      const qty = getQuantityForActivity(activityKey);
      const dot = convertServiceIdToApiFormat(activityKey);

      await ensureFinishingMaterialsLoaded(activityKey);

      // Collect finishing materials for this activity from finishingMaterialSelections
      const fmSelections = finishingMaterialSelections[activityKey] || {};
      const fmExtIds = Object.values(fmSelections);

      try {
        const resp = await calculatePrice({
          work_code: dot,
          zipcode: zip,
          unit_of_measurement: found.unit_of_measurement || "each",
          square: qty,
          finishing_materials: fmExtIds,
        });

        const laborCost = parseFloat(resp.work_cost) || 0;
        const matCost = parseFloat(resp.material_cost) || 0;
        setServiceCosts((old) => ({
          ...old,
          [activityKey]: laborCost + matCost,
        }));
        setCalculationResultsMap((old) => ({ ...old, [activityKey]: resp }));
      } catch (err) {
        console.error("Error in calculatePrice:", err);
      }
    });
  }, [selectedActivities, zip, finishingMaterialSelections]);

  /** Gets quantity for a single activityKey. */
  function getQuantityForActivity(activityKey: string): number {
    for (const srvKey in selectedActivities) {
      if (selectedActivities[srvKey][activityKey] != null) {
        return selectedActivities[srvKey][activityKey];
      }
    }
    return 1;
  }

  /** Ensures finishing materials for a specific activityKey are loaded. */
  async function ensureFinishingMaterialsLoaded(activityKey: string) {
    if (finishingMaterialsMapAll[activityKey]) return;

    const dot = convertServiceIdToApiFormat(activityKey);
    try {
      const data = await fetchFinishingMaterials(dot);
      finishingMaterialsMapAll[activityKey] = data;

      // If finishingMaterialSelections[activityKey] is not set, pick the first from each section
      if (!finishingMaterialSelections[activityKey]) {
        const picks: Record<string, string> = {};
        for (const [sectionName, arr] of Object.entries(data.sections || {})) {
          if (Array.isArray(arr) && arr.length > 0) {
            picks[sectionName] = arr[0].external_id;
          }
        }
        finishingMaterialSelections[activityKey] = picks;
      }

      setFinishingMaterialsMapAll({ ...finishingMaterialsMapAll });
      setFinishingMaterialSelections({ ...finishingMaterialSelections });
    } catch (err) {
      console.error("Error fetching finishing materials:", err);
    }
  }

  /** Toggles expansion of a service block. */
  function handleToggleExpand(serviceKey: string) {
    setExpandedServices((old) => {
      const next = new Set(old);
      if (next.has(serviceKey)) next.delete(serviceKey);
      else next.add(serviceKey);
      return next;
    });
  }

  /** Toggles a single activity in a service. */
  function handleActivityToggle(serviceKey: string, activityKey: string) {
    const foundActivity = ALL_SERVICES.find((x) => x.id === activityKey);
    const minQ = foundActivity?.min_quantity ?? 1;

    setSelectedActivities((prev) => {
      const current = prev[serviceKey] || {};

      if (current[activityKey] != null) {
        // Unselect activity
        const copy = { ...current };
        delete copy[activityKey];
        return { ...prev, [serviceKey]: copy };
      }

      // Select activity
      return { ...prev, [serviceKey]: { ...current, [activityKey]: minQ } };
    });

    // Reset manual input
    setManualInputValue((old) => ({
      ...old,
      [serviceKey]: { ...old[serviceKey], [activityKey]: null },
    }));

    setWarningMessage(null);
  }

  /** Increments or decrements activity quantity. */
  function handleQuantityChange(
    serviceKey: string,
    activityKey: string,
    increment: boolean
  ) {
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

    setManualInputValue((old) => ({
      ...old,
      [serviceKey]: { ...old[serviceKey], [activityKey]: null },
    }));
  }

  /** Handles manual input for quantity. */
  function handleManualQuantityChange(
    serviceKey: string,
    activityKey: string,
    value: string
  ) {
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
      [serviceKey]: {
        ...prev[serviceKey],
        [activityKey]: Math.round(parsedVal),
      },
    }));

    setWarningMessage(null);
  }

  /** If user leaves input empty, revert to stored quantity. */
  function handleBlurInput(serviceKey: string, activityKey: string) {
    const val = manualInputValue[serviceKey]?.[activityKey];
    if (!val) {
      setManualInputValue((old) => ({
        ...old,
        [serviceKey]: { ...old[serviceKey], [activityKey]: null },
      }));
    }
  }

  /** Clears all selections. */
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

    setSessionItem("selectedActivities", {});
  }

  /** Returns the total of serviceCosts. */
  function calculateTotal() {
    return Object.values(serviceCosts).reduce((acc, v) => acc + v, 0);
  }

  /** Navigates to the next step. */
  function handleNext() {
    const hasAny = Object.values(selectedActivities).some(
      (obj) => Object.keys(obj).length > 0
    );
    if (!hasAny) {
      setWarningMessage(
        "Please select at least one service before proceeding."
      );
      return;
    }
    if (!fullAddress.trim()) {
      setWarningMessage("Please enter your address before proceeding.");
      return;
    }
    router.push("/emergency/estimate");
  }

  /** Builds a list of services from the first step. */
  const servicesList = Object.entries(selectedServices).flatMap(
    ([category, arr]) => {
      return arr.map((srvKey) => {
        const activities =
          EMERGENCY_SERVICES[category]?.services[srvKey]?.activities || {};
        return { service: srvKey, category, activities };
      });
    }
  );

  /** Toggles cost breakdown details for a single activity. */
  function toggleActivityDetails(activityKey: string) {
    setExpandedServiceDetails((old) => {
      const next = new Set(old);
      if (next.has(activityKey)) {
        next.delete(activityKey);
      } else {
        next.add(activityKey);
      }
      return next;
    });
  }

  /** Finds a finishing material object by external_id. */
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

  /** User picks a finishing material for a given section. */
  function pickMaterial(
    activityKey: string,
    sectionName: string,
    externalId: string
  ) {
    if (!finishingMaterialSelections[activityKey]) {
      finishingMaterialSelections[activityKey] = {};
    }
    finishingMaterialSelections[activityKey][sectionName] = externalId;
    setFinishingMaterialSelections({ ...finishingMaterialSelections });
  }

  /** User marks a material as client-owned. */
  function userHasOwnMaterial(activityKey: string, externalId: string) {
    if (!clientOwnedMaterials[activityKey]) {
      clientOwnedMaterials[activityKey] = new Set();
    }
    clientOwnedMaterials[activityKey].add(externalId);
    setClientOwnedMaterials({ ...clientOwnedMaterials });
  }

  /** Closes finishing materials modal. */
  function closeModal() {
    setShowModalServiceId(null);
    setShowModalSectionName(null);
  }

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto relative">
        <BreadCrumb items={EMERGENCY_STEPS} />

        {/* Top header: title + Next button */}
        <div className="flex flex-col xl:flex-row justify-between items-start mt-8">
          <div>
            <SectionBoxTitle>Emergency Details</SectionBoxTitle>
          </div>
          <div className="w-full xl:w-auto flex justify-end mt-2 xl:mt-0">
            <Button onClick={handleNext}>Next →</Button>
          </div>
        </div>

        {/* "No service" + Clear */}
        <div className="flex justify-between items-center text-sm text-gray-500 mt-8 w-full xl:max-w-[600px]">
          <span>
            No service?{" "}
            <a
              href="#"
              className="text-blue-600 hover:underline focus:outline-none"
            >
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
      </div>

      {/* Main content: two columns on xl, one column on mobile */}
      <div className="container mx-auto relative flex flex-col xl:flex-row mt-4">
        {/* LEFT column */}
        <div className="w-full xl:flex-1">
          <div className="flex flex-col gap-4 mt-4 w-full xl:max-w-[600px]">
            {servicesList.map(({ service, category, activities }) => {
              const serviceLabel = capitalizeAndTransform(service);
              const isExpanded = expandedServices.has(service);
              const chosenCount = Object.keys(
                selectedActivities[service] || {}
              ).length;

              return (
                <div
                  key={`${category}-${service}`}
                  className="p-4 border rounded-xl bg-white border-gray-300"
                >
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => handleToggleExpand(service)}
                  >
                    <span
                      className={`text-xl sm:text-2xl font-semibold sm:font-medium ${
                        chosenCount > 0 ? "text-blue-600" : "text-gray-800"
                      }`}
                    >
                      {serviceLabel}
                      {chosenCount > 0 && (
                        <span className="text-sm text-gray-500 ml-2">
                          ({chosenCount} 
                            <span className="hidden sm:inline"> selected</span>)
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
                      {Object.entries(activities).map(
                        ([activityKey, activityData]) => {
                          const isSelected =
                            selectedActivities[service]?.[activityKey] != null;
                          const activityLabel = capitalizeAndTransform(
                            activityData.activity
                          );
                          const foundActivity = ALL_SERVICES.find(
                            (x) => x.id === activityKey
                          );
                          const finalCost = serviceCosts[activityKey] || 0;
                          const calcResult = calculationResultsMap[activityKey];
                          const detailsExpanded =
                            expandedServiceDetails.has(activityKey);

                          // Показываем кнопку Surface Calc, если единицы измерения "sq ft" / "K sq ft"
                          const showSurfaceCalcButton = foundActivity
                            ? ["sq ft", "K sq ft"].includes(
                                foundActivity.unit_of_measurement
                              )
                            : false;

                          return (
                            <div key={activityKey} className="space-y-2">
                              {/* Activity toggle */}
                              <div className="flex justify-between items-center">
                                <span
                                  className={`text-lg transition-colors duration-300 ${
                                    isSelected
                                      ? "text-blue-600"
                                      : "text-gray-800"
                                  }`}
                                >
                                  {activityLabel}
                                </span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() =>
                                      handleActivityToggle(service, activityKey)
                                    }
                                    className="sr-only peer"
                                  />
                                  <div className="w-[50px] h-[26px] bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors duration-300"></div>
                                  <div className="absolute top-[2px] left-[2px] w-[22px] h-[22px] bg-white rounded-full shadow-md peer-checked:translate-x-[24px] transform transition-transform duration-300"></div>
                                </label>
                              </div>

                              {isSelected && foundActivity && (
                                <>
                                  <ServiceImage activityKey={activityKey} />

                                  {foundActivity.description && (
                                    <p className="text-sm text-gray-500">
                                      {foundActivity.description}
                                    </p>
                                  )}

                                  {/* Quantity row */}
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() =>
                                          handleQuantityChange(
                                            service,
                                            activityKey,
                                            false
                                          )
                                        }
                                        className="w-8 h-8 bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg rounded"
                                      >
                                        −
                                      </button>
                                      <input
                                        type="text"
                                        value={
                                          manualInputValue[service]?.[
                                            activityKey
                                          ] != null
                                            ? manualInputValue[service][
                                                activityKey
                                              ]!
                                            : (
                                                selectedActivities[service]?.[
                                                  activityKey
                                                ] || 1
                                              ).toString()
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
                                        onBlur={() =>
                                          handleBlurInput(service, activityKey)
                                        }
                                        onChange={(e) =>
                                          handleManualQuantityChange(
                                            service,
                                            activityKey,
                                            e.target.value
                                          )
                                        }
                                        className="w-20 text-center px-2 py-1 border rounded"
                                      />
                                      <button
                                        onClick={() =>
                                          handleQuantityChange(
                                            service,
                                            activityKey,
                                            true
                                          )
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
                                      <span className="text-lg text-blue-600 font-semibold text-right">
                                        ${formatWithSeparator(finalCost)}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Buttons row: optional "Surface Calc" + "Cost Breakdown" */}
                                  <div className="mt-2 mb-3 flex items-center">
                                    {showSurfaceCalcButton ? (
                                      <>
                                        <button
                                          onClick={() =>
                                            openSurfaceCalc(
                                              service,
                                              activityKey
                                            )
                                          }
                                          className="text-blue-600 text-sm font-medium hover:underline mr-auto"
                                        >
                                          Surface Calc
                                        </button>
                                        <button
                                          onClick={() =>
                                            toggleActivityDetails(activityKey)
                                          }
                                          className={`text-blue-600 text-sm font-medium mb-0 ${
                                            detailsExpanded ? "" : "underline"
                                          }`}
                                        >
                                          Cost Breakdown
                                        </button>
                                      </>
                                    ) : (
                                      <button
                                        onClick={() =>
                                          toggleActivityDetails(activityKey)
                                        }
                                        className={`ml-auto text-blue-600 text-sm font-medium mb-0 ${
                                          detailsExpanded ? "" : "underline"
                                        }`}
                                      >
                                        Cost Breakdown
                                      </button>
                                    )}
                                  </div>

                                  {/* Cost breakdown */}
                                  {calcResult && detailsExpanded && (
                                    <div className="mt-4 p-2 sm:p-4 bg-gray-50 border rounded">
                                      <div className="flex flex-col gap-2 mb-4">
                                        <div className="flex justify-between">
                                          <span className="text-md font-semibold sm:font-medium text-gray-700">
                                            Labor
                                          </span>
                                          <span className="text-md font-semibold text-gray-700">
                                            {calcResult.work_cost
                                              ? `$${calcResult.work_cost}`
                                              : "—"}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-md font-semibold sm:font-medium text-gray-700">
                                            Materials, tools & equipment
                                          </span>
                                          <span className="text-md font-semibold text-gray-700">
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
                                                {calcResult.materials.map(
                                                  (m: any, i: number) => {
                                                    const fmObj =
                                                      findFinishingMaterialObj(
                                                        activityKey,
                                                        m.external_id
                                                      );
                                                    const hasImage = fmObj
                                                      ?.image?.length
                                                      ? true
                                                      : false;
                                                    const isClientOwned =
                                                      clientOwnedMaterials[
                                                        activityKey
                                                      ]?.has(m.external_id);

                                                    let rowClass = "";
                                                    if (isClientOwned) {
                                                      rowClass =
                                                        "border border-red-500 bg-red-50";
                                                    } else if (hasImage) {
                                                      rowClass =
                                                        "border border-blue-300 bg-white cursor-pointer";
                                                    }

                                                    return (
                                                      <tr
                                                        key={`${m.external_id}-${i}`}
                                                        className={`last:border-0 ${rowClass}`}
                                                        onClick={() => {
                                                          if (
                                                            hasImage &&
                                                            !isClientOwned
                                                          ) {
                                                            let foundSection:
                                                              | string
                                                              | null = null;
                                                            const fmData =
                                                              finishingMaterialsMapAll[
                                                                activityKey
                                                              ];
                                                            if (
                                                              fmData &&
                                                              fmData.sections
                                                            ) {
                                                              for (const [
                                                                secName,
                                                                list,
                                                              ] of Object.entries(
                                                                fmData.sections
                                                              )) {
                                                                if (
                                                                  Array.isArray(
                                                                    list
                                                                  ) &&
                                                                  list.some(
                                                                    (xx) =>
                                                                      xx.external_id ===
                                                                      m.external_id
                                                                  )
                                                                ) {
                                                                  foundSection =
                                                                    secName;
                                                                  break;
                                                                }
                                                              }
                                                            }
                                                            setShowModalServiceId(
                                                              activityKey
                                                            );
                                                            setShowModalSectionName(
                                                              foundSection
                                                            );
                                                          }
                                                        }}
                                                      >
                                                        <td className="py-3 px-1">
                                                          {hasImage ? (
                                                            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                                                              <img
                                                                src={
                                                                  fmObj?.image
                                                                }
                                                                alt={m.name}
                                                                className="w-24 h-24 object-cover rounded"
                                                              />
                                                              <span className="break-words">
                                                                {m.name}
                                                              </span>
                                                            </div>
                                                          ) : (
                                                            m.name
                                                          )}
                                                        </td>
                                                        <td className="py-3 px-1">
                                                          ${m.cost_per_unit}
                                                        </td>
                                                        <td className="py-3 px-3">
                                                          {m.quantity}
                                                        </td>
                                                        <td className="py-3 px-3">
                                                          ${m.cost}
                                                        </td>
                                                      </tr>
                                                    );
                                                  }
                                                )}
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
                        }
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT column: summary, address, photos, description */}
        <div className="w-full xl:w-1/2 xl:ml-auto mt-8 xl:mt-0 pt-1">
          {/* Summary */}
          <div className="w-full xl:max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden">
            <SectionBoxSubtitle>Summary</SectionBoxSubtitle>
            {Object.keys(selectedActivities).length === 0 ? (
              <div className="text-left text-gray-500 text-medium mt-4">
                No services selected
              </div>
            ) : (
              <>
                <ul className="mt-4 space-y-2 pb-4">
                  {Object.entries(selectedActivities).flatMap(
                    ([srvKey, acts]) =>
                      Object.entries(acts).map(([activityKey, quantity]) => {
                        const foundAct = ALL_SERVICES.find(
                          (x) => x.id === activityKey
                        );
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
                  <span className="text-2xl font-semibold text-gray-800">
                    Subtotal:
                  </span>
                  <span className="text-2xl font-semibold text-blue-600">
                    ${formatWithSeparator(calculateTotal())}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Address */}
          <div className="hidden sm:block w-full xl:max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden mt-6">
            <h2 className="text-2xl font-semibold sm:font-medium text-gray-800 mb-4">Address</h2>
            <p className="text-gray-500 text-medium">
              {fullAddress || "No address provided"}
            </p>
          </div>

          {/* Photos */}
          <div className="hidden sm:block w-full xl:max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden mt-6">
            <h2 className="text-2xl font-semibold sm:font-medium text-gray-800 mb-4">
              Uploaded Photos
            </h2>
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
              <p className="text-medium text-gray-500 mt-2">
                No photos uploaded
              </p>
            )}
          </div>

          {/* Description */}
          <div className="hidden sm:block w-full xl:max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden mt-6">
            <h2 className="text-2xl font-semibold sm:font-medium text-gray-800 mb-4">
              Problem Description
            </h2>
            <p className="text-gray-500 text-medium whitespace-pre-wrap">
              {description || "No description provided"}
            </p>
          </div>
        </div>
      </div>

      {/* Finishing materials modal */}
      <FinishingMaterialsModal
        showModalServiceId={showModalServiceId}
        showModalSectionName={showModalSectionName}
        finishingMaterialsMapAll={finishingMaterialsMapAll}
        finishingMaterialSelections={finishingMaterialSelections}
        setFinishingMaterialSelections={setFinishingMaterialSelections}
        closeModal={closeModal}
        userHasOwnMaterial={userHasOwnMaterial}
        formatWithSeparator={formatWithSeparator}
      />

      {/* Surface Calculator modal */}
      <SurfaceCalculatorModal
        show={surfaceCalcOpen}
        onClose={() => setSurfaceCalcOpen(false)}
        serviceId={surfaceCalcServiceKey}
        onApplySquareFeet={handleApplySquareFeet}
      />
    </main>
  );
}
