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

import { setSessionItem, getSessionItem } from "@/utils/session";
import { formatWithSeparator } from "@/utils/format";

import FinishingMaterialsModal from "@/components/FinishingMaterialsModal";
import SurfaceCalculatorModal from "@/components/SurfaceCalculatorModal";
import { usePhotos } from "@/context/PhotosContext";

interface FinishingMaterial {
  id: number;
  image?: string;
  unit_of_measurement: string;
  name: string;
  external_id: string;
  cost: string;
}

/**
 * Converts a service ID (e.g. "1-1-1") into API format (e.g. "1.1.1").
 */
function convertServiceIdToApiFormat(serviceId: string) {
  return serviceId.replaceAll("-", ".");
}

/**
 * Returns the base API URL or a default dev URL.
 */
function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "https://dev.thejamb.com";
}

/**
 * Sends a POST to /calculate to get labor/materials costs.
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
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error(
      `Failed to calculate price (work_code=${params.work_code}).`
    );
  }
  return res.json();
}

/**
 * Fetches finishing materials for a given work code.
 */
async function fetchFinishingMaterials(workCode: string) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/work/finishing_materials`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ work_code: workCode }),
  });
  if (!res.ok) {
    throw new Error(
      `Failed to fetch finishing materials (work_code=${workCode}).`
    );
  }
  return res.json();
}

/**
 * Displays a service image based on activityKey.
 */
function ServiceImage({ activityKey }: { activityKey: string }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    const firstSegment = activityKey.split("-")[0];
    const code = convertServiceIdToApiFormat(activityKey);
    setImageSrc(`https://dev.thejamb.com/images/${firstSegment}/${code}.jpg`);
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

/**
 * Capitalizes and inserts spaces before uppercase letters.
 */
function capitalizeAndTransform(text: string): string {
  return text
    .replace(/([A-Z])/g, " $1")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());
}

export default function EmergencyDetails() {
  const router = useRouter();

  // Retrieve session data (photos now come from context)
  const { photos } = usePhotos(); // <-- from context
  const selectedServices = getSessionItem<Record<string, string[]>>(
    "selectedServices",
    {}
  );
  const fullAddress = getSessionItem<string>("fullAddress", "");
  const zip = getSessionItem<string>("zip", "");
  const description = getSessionItem<string>("description", "");

  // Activity selection and quantities
  const [selectedActivities, setSelectedActivities] = useState<
    Record<string, Record<string, number>>
  >(() => getSessionItem("selectedActivities", {}));
  const [manualInputValue, setManualInputValue] = useState<
    Record<string, Record<string, string | null>>
  >({});
  const [expandedServices, setExpandedServices] = useState<Set<string>>(
    new Set()
  );

  // Use alert for warnings
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  useEffect(() => {
    if (warningMessage) {
      alert(warningMessage);
      setWarningMessage(null);
    }
  }, [warningMessage]);

  // Cost calculations and results
  const [serviceCosts, setServiceCosts] = useState<Record<string, number>>({});
  const [calculationResultsMap, setCalculationResultsMap] = useState<
    Record<string, any>
  >({});

  // Finishing materials
  const [finishingMaterialsMapAll, setFinishingMaterialsMapAll] = useState<
    Record<string, { sections: Record<string, FinishingMaterial[]> }>
  >({});
  // finishingMaterialSelections[activityKey] = { [sectionName]: externalId }
  const [finishingMaterialSelections, setFinishingMaterialSelections] =
    useState<Record<string, Record<string, string>>>({});

  // Materials owned by the client
  const [clientOwnedMaterials, setClientOwnedMaterials] = useState<
    Record<string, Set<string>>
  >({});

  // Modals: finishing materials, surface calculator
  const [showModalServiceId, setShowModalServiceId] = useState<string | null>(
    null
  );
  const [showModalSectionName, setShowModalSectionName] = useState<
    string | null
  >(null);
  const [expandedServiceDetails, setExpandedServiceDetails] = useState<
    Set<string>
  >(new Set());

  // Surface calculator
  const [surfaceCalcOpen, setSurfaceCalcOpen] = useState(false);
  const [surfaceCalcServiceKey, setSurfaceCalcServiceKey] = useState<
    string | null
  >(null);
  const [surfaceCalcActivityKey, setSurfaceCalcActivityKey] = useState<
    string | null
  >(null);

  // Persist data to session
  useEffect(() => {
    setSessionItem("selectedActivities", selectedActivities);
  }, [selectedActivities]);
  useEffect(() => {
    setSessionItem("calculationResultsMap", calculationResultsMap);
  }, [calculationResultsMap]);

  /**
   * Opens the surface calculator for a specific service/activity.
   */
  function openSurfaceCalc(serviceKey: string, activityKey: string) {
    setSurfaceCalcServiceKey(serviceKey);
    setSurfaceCalcActivityKey(activityKey);
    setSurfaceCalcOpen(true);
  }

  /**
   * Applies the calculated area from surface calculator.
   */
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

    setSelectedActivities((prev) => {
      const copy = { ...prev };
      if (!copy[surfaceCalcServiceKey]) {
        copy[surfaceCalcServiceKey] = {};
      }
      copy[surfaceCalcServiceKey][surfaceCalcActivityKey] = finalVal;
      return copy;
    });
    setSurfaceCalcOpen(false);
  }

  /**
   * Updates calculations when selected activities change or ZIP changes.
   */
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

    allActivityKeys.forEach(async (activityKey) => {
      const found = ALL_SERVICES.find((x) => x.id === activityKey);
      if (!found) return;

      const qty = getQuantityForActivity(activityKey);
      const dot = convertServiceIdToApiFormat(activityKey);

      await ensureFinishingMaterialsLoaded(activityKey);

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

  /**
   * Returns the user-selected quantity for a specific activity.
   */
  function getQuantityForActivity(activityKey: string): number {
    for (const srvKey in selectedActivities) {
      if (selectedActivities[srvKey][activityKey] != null) {
        return selectedActivities[srvKey][activityKey];
      }
    }
    return 1;
  }

  /**
   * Ensures finishing materials are loaded for a given activityKey.
   */
  async function ensureFinishingMaterialsLoaded(activityKey: string) {
    if (finishingMaterialsMapAll[activityKey]) return;

    const dot = convertServiceIdToApiFormat(activityKey);
    try {
      const data = await fetchFinishingMaterials(dot);
      finishingMaterialsMapAll[activityKey] = data;

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

  /**
   * Expands or collapses a service block.
   */
  function handleToggleExpand(serviceKey: string) {
    setExpandedServices((old) => {
      const next = new Set(old);
      next.has(serviceKey) ? next.delete(serviceKey) : next.add(serviceKey);
      return next;
    });
  }

  /**
   * Toggles a specific activity within a service.
   */
  function handleActivityToggle(serviceKey: string, activityKey: string) {
    const foundActivity = ALL_SERVICES.find((x) => x.id === activityKey);
    const minQ = foundActivity?.min_quantity ?? 1;

    setSelectedActivities((prev) => {
      const current = prev[serviceKey] || {};
      if (current[activityKey] != null) {
        const copy = { ...current };
        delete copy[activityKey];
        return { ...prev, [serviceKey]: copy };
      }
      return { ...prev, [serviceKey]: { ...current, [activityKey]: minQ } };
    });

    setManualInputValue((old) => ({
      ...old,
      [serviceKey]: { ...old[serviceKey], [activityKey]: null },
    }));
    setWarningMessage(null);
  }

  /**
   * Increments or decrements the quantity of an activity.
   */
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

  /**
   * Updates activity quantity based on manual input.
   */
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

  /**
   * Restores input if user clears field completely.
   */
  function handleBlurInput(serviceKey: string, activityKey: string) {
    const val = manualInputValue[serviceKey]?.[activityKey];
    if (!val) {
      setManualInputValue((old) => ({
        ...old,
        [serviceKey]: { ...old[serviceKey], [activityKey]: null },
      }));
    }
  }

  /**
   * Clears all selected activities.
   */
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

  /**
   * Calculates subtotal from all selected activities.
   */
  function calculateTotal() {
    return Object.values(serviceCosts).reduce((acc, v) => acc + v, 0);
  }

  /**
   * Moves to the next step after validation.
   */
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

  /**
   * Builds a list of user-selected services from the first step.
   */
  const servicesList = Object.entries(selectedServices).flatMap(
    ([category, arr]) => {
      return arr.map((srvKey) => {
        const activities =
          EMERGENCY_SERVICES[category]?.services[srvKey]?.activities || {};
        return { service: srvKey, category, activities };
      });
    }
  );

  /**
   * Toggles the cost breakdown for a single activity.
   */
  function toggleActivityDetails(activityKey: string) {
    setExpandedServiceDetails((old) => {
      const next = new Set(old);
      next.has(activityKey) ? next.delete(activityKey) : next.add(activityKey);
      return next;
    });
  }

  /**
   * Finds a finishing material by external_id.
   */
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

  /**
   * Picks a finishing material for a given section.
   */
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

  /**
   * Marks a material as user-owned.
   * (Original logic. We'll enhance in the FinishingMaterialsModal prop.)
   */
  function userHasOwnMaterial(activityKey: string, externalId: string) {
    if (!clientOwnedMaterials[activityKey]) {
      clientOwnedMaterials[activityKey] = new Set();
    }
    clientOwnedMaterials[activityKey].add(externalId);
    setClientOwnedMaterials({ ...clientOwnedMaterials });
  }

  /**
   * Closes the finishing materials modal.
   */
  function closeModal() {
    setShowModalServiceId(null);
    setShowModalSectionName(null);
  }

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto relative">
        <BreadCrumb items={EMERGENCY_STEPS} />

        {/* Top header: Title + Next button */}
        <div className="flex flex-col xl:flex-row justify-between items-start mt-8">
          <div>
            <SectionBoxTitle>Emergency Details</SectionBoxTitle>
          </div>
          <div className="hidden sm:flex w-full xl:w-auto justify-end mt-2 xl:mt-0">
            <Button onClick={handleNext}>Next →</Button>
          </div>
        </div>

        {/* "No service" + Clear */}
        <div className="flex justify-between items-center text-sm text-gray-500 mt-2 sm:mt-8 w-full xl:max-w-[600px]">
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
      </div>

      {/* Main content */}
      <div className="container mx-auto relative flex flex-col xl:flex-row mt-4">
        {/* LEFT: Services list */}
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
                      {Object.entries(activities).map(([activityKey, activityData]) => {
                        const isSelected =
                          selectedActivities[service]?.[activityKey] != null;
                        const foundActivity = ALL_SERVICES.find(
                          (x) => x.id === activityKey
                        );
                        const activityLabel = capitalizeAndTransform(
                          activityData.activity
                        );
                        const finalCost = serviceCosts[activityKey] || 0;
                        const calcResult = calculationResultsMap[activityKey];
                        const detailsExpanded =
                          expandedServiceDetails.has(activityKey);

                        const showSurfaceCalcButton = foundActivity
                          ? ["sq ft", "K sq ft"].includes(
                              foundActivity.unit_of_measurement
                            )
                          : false;

                        return (
                          <div key={activityKey} className="space-y-2">
                            {/* Toggle */}
                            <div className="flex justify-between items-center">
                              <span
                                className={`text-lg ${
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
                                <div className="w-[52px] h-[31px] bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors duration-300"></div>
                                <div className="absolute top-[2px] left-[2px] w-[27px] h-[27px] bg-white rounded-full shadow-md transform transition-transform duration-300 peer-checked:translate-x-[21px]"></div>
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

                                {/* Quantity */}
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() =>
                                        handleQuantityChange(service, activityKey, false)
                                      }
                                      className="w-8 h-8 bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg rounded"
                                    >
                                      −
                                    </button>
                                    <input
                                      type="text"
                                      value={
                                        manualInputValue[service]?.[activityKey] !=
                                        null
                                          ? manualInputValue[service]![activityKey]!
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
                                    <span className="text-lg text-blue-600 font-semibold">
                                      ${formatWithSeparator(finalCost)}
                                    </span>
                                  </div>
                                </div>

                                {/* Surface calc / breakdown */}
                                <div className="mt-2 mb-3 flex items-center">
                                  {showSurfaceCalcButton ? (
                                    <>
                                      <button
                                        onClick={() =>
                                          openSurfaceCalc(service, activityKey)
                                        }
                                        className="text-blue-600 text-sm font-medium hover:underline mr-auto"
                                      >
                                        Surface Calc
                                      </button>
                                      <button
                                        onClick={() =>
                                          toggleActivityDetails(activityKey)
                                        }
                                        className={`text-blue-600 text-sm font-medium ${
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
                                      className={`ml-auto text-blue-600 text-sm font-medium ${
                                        detailsExpanded ? "" : "underline"
                                      }`}
                                    >
                                      Cost Breakdown
                                    </button>
                                  )}
                                </div>

                                {/* Cost breakdown info */}
                                {calcResult && detailsExpanded && (
                                  <div className="mt-4 p-2 sm:p-4 bg-gray-50 border rounded">
                                    <div className="flex flex-col gap-2 mb-4">
                                      <div className="flex justify-between">
                                        <span className="text-md font-semibold text-gray-700">
                                          Labor
                                        </span>
                                        <span className="text-md font-semibold text-gray-700">
                                          {calcResult.work_cost
                                            ? `$${calcResult.work_cost}`
                                            : "—"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-md font-semibold text-gray-700">
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
                                                  const hasImage =
                                                    fmObj?.image?.length
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
                                                              src={fmObj?.image}
                                                              alt={m.name}
                                                              className="w-24 h-24 object-cover rounded"
                                                            />
                                                            <span className="break-words text-blue-600">
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
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: summary, address, photos, description */}
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
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Address
            </h2>
            <p className="text-gray-500 text-medium">
              {fullAddress || "No address provided"}
            </p>
          </div>

          {/* Photos => from context */}
          <div className="hidden sm:block w-full xl:max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden mt-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
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
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Problem Description
            </h2>
            <p className="text-gray-500 text-medium whitespace-pre-wrap">
              {description || "No description provided"}
            </p>
          </div>
        </div>
      </div>

      <div className="block sm:hidden mt-6">
            <Button onClick={handleNext} className="w-full justify-center">
              Next →
            </Button>
          </div>

      {/* Finishing Materials Modal */}
      <FinishingMaterialsModal
        showModalServiceId={showModalServiceId}
        showModalSectionName={showModalSectionName}
        finishingMaterialsMapAll={finishingMaterialsMapAll}
        finishingMaterialSelections={finishingMaterialSelections}
        setFinishingMaterialSelections={setFinishingMaterialSelections}
        closeModal={closeModal}
        formatWithSeparator={formatWithSeparator}
        userHasOwnMaterial={(activityKey, externalId) => {
          if (!clientOwnedMaterials[activityKey]) {
            clientOwnedMaterials[activityKey] = new Set();
          }
          clientOwnedMaterials[activityKey].add(externalId);
          setClientOwnedMaterials({ ...clientOwnedMaterials });

          // Remove from finishingMaterialSelections => no longer used in pricing
          if (showModalSectionName) {
            const picksObj = finishingMaterialSelections[activityKey] || {};
            if (picksObj[showModalSectionName] === externalId) {
              delete picksObj[showModalSectionName];
              finishingMaterialSelections[activityKey] = { ...picksObj };
              setFinishingMaterialSelections({ ...finishingMaterialSelections });
            }
          }

          // Finally close the modal
          closeModal();
        }}
      />

      {/* Surface Calculator Modal */}
      <SurfaceCalculatorModal
        show={surfaceCalcOpen}
        onClose={() => setSurfaceCalcOpen(false)}
        serviceId={surfaceCalcServiceKey}
        onApplySquareFeet={handleApplySquareFeet}
      />
    </main>
  );
}