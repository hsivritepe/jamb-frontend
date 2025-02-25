"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import BreadCrumb from "@/components/ui/BreadCrumb";
import Button from "@/components/ui/Button";
import { SectionBoxTitle } from "@/components/ui/SectionBoxTitle";
import { SectionBoxSubtitle } from "@/components/ui/SectionBoxSubtitle";
import { CALCULATE_STEPS } from "@/constants/navigation";
import { useLocation } from "@/context/LocationContext";
import { ALL_CATEGORIES } from "@/constants/categories";
import { ALL_SERVICES } from "@/constants/services";
import { ChevronDown } from "lucide-react";
import { setSessionItem, getSessionItem } from "@/utils/session";
import RecommendedActivities from "@/components/RecommendedActivities";
import FinishingMaterialsModal from "@/components/FinishingMaterialsModal";

/** Interface describing finishing materials returned by /work/finishing_materials. */
interface FinishingMaterial {
  id: number;
  image?: string;
  unit_of_measurement: string;
  name: string;
  external_id: string;
  cost: string;
}

/** Formats numeric values with commas and two decimals. */
function formatWithSeparator(value: number): string {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(
    value
  );
}

/** Converts "1-1-1" => "1.1.1". */
function convertServiceIdToApiFormat(serviceId: string): string {
  return serviceId.replaceAll("-", ".");
}

/** Returns the base API URL or fallback. */
function getApiBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://dev.thejamb.com"
  );
}

/** POST /work/finishing_materials => fetch finishing materials. */
async function fetchFinishingMaterials(workCode: string) {
  const url = `${getApiBaseUrl()}/work/finishing_materials`;
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

/** POST /calculate => compute labor + materials cost. */
async function calculatePrice(params: {
  work_code: string;
  zipcode: string;
  unit_of_measurement: string;
  square: number;
  finishing_materials: string[];
}) {
  const url = `${getApiBaseUrl()}/calculate`;
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

/** Simple image component for a service ID, adapted for responsiveness. */
function ServiceImage({ serviceId }: { serviceId: string }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    const firstSegment = serviceId.split("-")[0];
    const code = convertServiceIdToApiFormat(serviceId);
    const url = `https://dev.thejamb.com/images/${firstSegment}/${code}.jpg`;
    setImageSrc(url);
  }, [serviceId]);

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
 * A modal to help user calculate square footage from length & width
 * or directly from square meters.
 */
interface SurfaceCalculatorModalProps {
  show: boolean;
  onClose: () => void;
  serviceId: string | null;
  onApplySquareFeet: (serviceId: string | null, sqFeet: number) => void;
}

function SurfaceCalculatorModal({
  show,
  onClose,
  serviceId,
  onApplySquareFeet,
}: SurfaceCalculatorModalProps) {
  if (!show) return null;

  // internal states
  const [system, setSystem] = useState<"ft" | "m">("ft");
  const [lengthVal, setLengthVal] = useState("");
  const [widthVal, setWidthVal] = useState("");
  const [sqMetersVal, setSqMetersVal] = useState("");

  // compute area from length*width => always in sq ft
  function computeAreaSqFt(): number {
    const lengthNum = parseFloat(lengthVal) || 0;
    const widthNum = parseFloat(widthVal) || 0;
    if (system === "m") {
      // each dimension in meters => area in m^2 => convert to ft^2
      // 1 m^2 = 10.7639 ft^2
      return lengthNum * widthNum * 10.7639;
    }
    // system = ft => direct
    return lengthNum * widthNum;
  }

  // compute from known sq meters
  function computeAreaFromSqMeters(): number {
    const val = parseFloat(sqMetersVal) || 0;
    return val * 10.7639; // 1 m^2 = 10.7639 ft^2
  }

  function handleApply() {
    if (!serviceId) {
      onClose();
      return;
    }
    // decide which area to take
    let areaFt = computeAreaSqFt();
    // if user typed sq meters => prefer that
    if (sqMetersVal.trim()) {
      areaFt = computeAreaFromSqMeters();
    }
    if (areaFt < 1) areaFt = 1; // minimal
    onApplySquareFeet(serviceId, Math.round(areaFt));
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md overflow-hidden relative p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-3 border-b pb-2">
          <h2 className="text-lg font-semibold text-gray-800">
            Surface Calculator
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 px-2"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* short instructions */}
        <p className="text-sm text-gray-600 mb-4">
          Enter length & width in meters or feet, or a known m² area to convert
          to sq ft automatically.
        </p>

        {/* system toggle */}
        <div className="mb-4">
          <span className="text-sm text-gray-700 mr-2">Units (LxW):</span>
          <button
            onClick={() => setSystem("ft")}
            className={`px-3 py-1 border rounded-l ${
              system === "ft"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300"
            }`}
          >
            ft
          </button>
          <button
            onClick={() => setSystem("m")}
            className={`px-3 py-1 border rounded-r ${
              system === "m"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300"
            }`}
          >
            m
          </button>
        </div>

        {/* length + width */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">Length</label>
            <input
              type="number"
              placeholder={`0 (${system})`}
              value={lengthVal}
              onChange={(e) => setLengthVal(e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">Width</label>
            <input
              type="number"
              placeholder={`0 (${system})`}
              value={widthVal}
              onChange={(e) => setWidthVal(e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
        </div>

        {/* or known sq meters */}
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">
            Or known area (m²):
          </label>
          <input
            type="number"
            className="w-full border rounded px-2 py-1"
            placeholder="0 m²"
            value={sqMetersVal}
            onChange={(e) => setSqMetersVal(e.target.value)}
          />
        </div>

        {/* Calculated results */}
        <div className="mb-4 text-sm text-gray-700">
          <p className="mb-1">
            Calculated from length & width:{" "}
            <span className="font-medium">
              {Math.round(computeAreaSqFt())} sq ft
            </span>
          </p>
          {sqMetersVal.trim() && (
            <p>
              From known m²:{" "}
              <span className="font-medium">
                {Math.round(computeAreaFromSqMeters())} sq ft
              </span>
            </p>
          )}
        </div>

        {/* Footer buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * The main "Details" page component
 */
export default function Details() {
  const router = useRouter();
  const { location } = useLocation();

  // Load from session
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() =>
    getSessionItem("services_selectedCategories", [])
  );
  const [address, setAddress] = useState<string>(() =>
    getSessionItem("address", "")
  );
  const description = getSessionItem<string>("description", "");
  const photos = getSessionItem<string[]>("photos", []);
  const searchQuery = getSessionItem<string>("services_searchQuery", "");

  useEffect(() => {
    // If no selected categories or no address => redirect
    if (selectedCategories.length === 0 || !address) {
      router.push("/calculate");
    }
  }, [selectedCategories, address, router]);

  // Update address if location changes
  useEffect(() => {
    const newAddr = [
      location.city,
      location.state,
      location.zip,
      location.country,
    ]
      .filter(Boolean)
      .join(", ");
    if (newAddr.trim()) {
      setAddress(newAddr);
      setSessionItem("address", newAddr);
    }
  }, [location]);

  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  useEffect(() => {
    if (warningMessage) {
      alert(warningMessage);
      setWarningMessage(null);
    }
  }, [warningMessage]);

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  // Build categories by section
  const categoriesWithSection = useMemo(() => {
    return selectedCategories
      .map((id) => ALL_CATEGORIES.find((x) => x.id === id) || null)
      .filter(Boolean) as (typeof ALL_CATEGORIES)[number][];
  }, [selectedCategories]);

  const categoriesBySection: Record<string, string[]> = useMemo(() => {
    const out: Record<string, string[]> = {};
    for (const cat of categoriesWithSection) {
      if (!out[cat.section]) {
        out[cat.section] = [];
      }
      out[cat.section].push(cat.id);
    }
    return out;
  }, [categoriesWithSection]);

  // category => array of services
  const categoryServicesMap: Record<string, (typeof ALL_SERVICES)[number][]> =
    useMemo(() => {
      const map: Record<string, (typeof ALL_SERVICES)[number][]> = {};
      for (const catId of selectedCategories) {
        let arr = ALL_SERVICES.filter((svc) => svc.id.startsWith(`${catId}-`));
        if (searchQuery) {
          arr = arr.filter((svc) =>
            (svc.title || "").toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        map[catId] = arr;
      }
      return map;
    }, [selectedCategories, searchQuery]);

  // selectedServices => { [serviceId]: quantity }
  const [selectedServicesState, setSelectedServicesState] = useState<
    Record<string, number>
  >(() => getSessionItem("selectedServicesWithQuantity", {}));
  useEffect(() => {
    setSessionItem("selectedServicesWithQuantity", selectedServicesState);
  }, [selectedServicesState]);

  // finishingMaterialsMapAll => data from /work/finishing_materials
  const [finishingMaterialsMapAll, setFinishingMaterialsMapAll] = useState<
    Record<string, { sections: Record<string, FinishingMaterial[]> }>
  >({});

  // finishingMaterialSelections => { [serviceId]: { [sectionName]: external_id } }
  const [finishingMaterialSelections, setFinishingMaterialSelections] =
    useState<Record<string, Record<string, string>>>({});

  const [manualInputValue, setManualInputValue] = useState<
    Record<string, string | null>
  >({});
  const [serviceCosts, setServiceCosts] = useState<Record<string, number>>({});
  const [calculationResultsMap, setCalculationResultsMap] = useState<
    Record<string, any>
  >({});
  const [expandedServiceDetails, setExpandedServiceDetails] = useState<
    Set<string>
  >(new Set());
  const [clientOwnedMaterials, setClientOwnedMaterials] = useState<
    Record<string, Set<string>>
  >({});

  // State for the finishing-material modal
  const [showModalServiceId, setShowModalServiceId] = useState<string | null>(
    null
  );
  const [showModalSectionName, setShowModalSectionName] = useState<
    string | null
  >(null);

  // State for the surface calculator
  const [showSurfaceCalc, setShowSurfaceCalc] = useState(false);
  const [calcServiceId, setCalcServiceId] = useState<string | null>(null);

  // This is triggered from SurfaceCalculatorModal's "Apply" button
  function handleApplySquareFeet(serviceId: string | null, sqFeet: number) {
    if (!serviceId) return;
    // If the user hasn't turned on the service yet, we could auto-enable,
    // or just skip. Below we assume the service is already toggled on.
    setSelectedServicesState((old) => {
      if (!(serviceId in old)) {
        return old; // do nothing if not toggled
      }
      return {
        ...old,
        [serviceId]: sqFeet,
      };
    });
    setManualInputValue((old) => ({
      ...old,
      [serviceId]: String(sqFeet),
    }));
  }

  useEffect(() => {
    setSessionItem("calculationResultsMap", calculationResultsMap);
  }, [calculationResultsMap]);

  /** Expand/collapse a category => possibly fetch finishing materials. */
  function toggleCategory(catId: string) {
    setExpandedCategories((old) => {
      const next = new Set(old);
      if (next.has(catId)) {
        next.delete(catId);
      } else {
        next.add(catId);
        const arr = categoryServicesMap[catId] || [];
        fetchFinishingMaterialsForCategory(arr);
      }
      return next;
    });
  }

  /** Toggle a service. */
  function handleServiceToggle(serviceId: string) {
    setSelectedServicesState((old) => {
      const isOn = old[serviceId] != null;
      if (isOn) {
        // remove
        const copy = { ...old };
        delete copy[serviceId];

        const fmCopy = { ...finishingMaterialSelections };
        delete fmCopy[serviceId];

        const muCopy = { ...manualInputValue };
        delete muCopy[serviceId];

        const crCopy = { ...calculationResultsMap };
        delete crCopy[serviceId];

        const scCopy = { ...serviceCosts };
        delete scCopy[serviceId];

        const coCopy = { ...clientOwnedMaterials };
        delete coCopy[serviceId];

        setSelectedServicesState(copy);
        setFinishingMaterialSelections(fmCopy);
        setManualInputValue(muCopy);
        setCalculationResultsMap(crCopy);
        setServiceCosts(scCopy);
        setClientOwnedMaterials(coCopy);

        return copy;
      } else {
        // add
        const found = ALL_SERVICES.find((x) => x.id === serviceId);
        const minQ = found?.min_quantity ?? 1;
        const newObj = { ...old, [serviceId]: minQ };

        setManualInputValue((prev) => ({ ...prev, [serviceId]: String(minQ) }));
        ensureFinishingMaterialsLoaded(serviceId);
        return newObj;
      }
    });
    setWarningMessage(null);
  }

  /** Increment or decrement quantity. */
  function handleQuantityChange(
    serviceId: string,
    increment: boolean,
    unit: string
  ) {
    const found = ALL_SERVICES.find((x) => x.id === serviceId);
    if (!found) return;
    const minQ = found.min_quantity ?? 1;
    const maxQ = found.max_quantity ?? 999999;

    setSelectedServicesState((old) => {
      const curVal = old[serviceId] ?? minQ;
      let newVal = increment ? curVal + 1 : curVal - 1;
      if (newVal < minQ) newVal = minQ;
      if (newVal > maxQ) {
        newVal = maxQ;
        setWarningMessage(`Maximum quantity for "${found.title}" is ${maxQ}.`);
      }
      return {
        ...old,
        [serviceId]: unit === "each" ? Math.round(newVal) : newVal,
      };
    });

    setManualInputValue((old) => ({ ...old, [serviceId]: null }));
  }

  /** Manual input change. */
  function handleManualQuantityChange(
    serviceId: string,
    val: string,
    unit: string
  ) {
    const found = ALL_SERVICES.find((x) => x.id === serviceId);
    if (!found) return;

    const minQ = found.min_quantity ?? 1;
    const maxQ = found.max_quantity ?? 999999;

    setManualInputValue((old) => ({ ...old, [serviceId]: val }));

    let numericVal = parseFloat(val.replace(/,/g, "")) || 0;
    if (numericVal < minQ) numericVal = minQ;
    if (numericVal > maxQ) {
      numericVal = maxQ;
      setWarningMessage(`Maximum quantity for "${found.title}" is ${maxQ}.`);
    }

    setSelectedServicesState((old) => ({
      ...old,
      [serviceId]: unit === "each" ? Math.round(numericVal) : numericVal,
    }));
  }

  /** If user leaves input blank => revert. */
  function handleBlurInput(serviceId: string) {
    if (!manualInputValue[serviceId]) {
      setManualInputValue((old) => ({ ...old, [serviceId]: null }));
    }
  }

  /** Clear all selections. */
  function clearAllSelections() {
    if (!window.confirm("Are you sure you want to clear all services?")) return;

    setSelectedServicesState({});
    setExpandedCategories(new Set());
    setFinishingMaterialsMapAll({});
    setFinishingMaterialSelections({});
    setManualInputValue({});
    setCalculationResultsMap({});
    setServiceCosts({});
    setClientOwnedMaterials({});
  }

  /** Load finishing materials for a single service. */
  async function ensureFinishingMaterialsLoaded(serviceId: string) {
    try {
      if (!finishingMaterialsMapAll[serviceId]) {
        const dot = convertServiceIdToApiFormat(serviceId);
        const data = await fetchFinishingMaterials(dot);
        finishingMaterialsMapAll[serviceId] = data;
        setFinishingMaterialsMapAll({ ...finishingMaterialsMapAll });
      }
      if (!finishingMaterialSelections[serviceId]) {
        const fmData = finishingMaterialsMapAll[serviceId];
        if (fmData?.sections) {
          const picksObj: Record<string, string> = {};
          for (const [secName, arr] of Object.entries(fmData.sections)) {
            if (Array.isArray(arr) && arr.length > 0) {
              picksObj[secName] = arr[0].external_id;
            }
          }
          finishingMaterialSelections[serviceId] = picksObj;
          setFinishingMaterialSelections({ ...finishingMaterialSelections });
        }
      }
    } catch (err) {
      console.error("Error ensuring finishing materials for:", serviceId, err);
    }
  }

  /** Load finishing materials for all services in a category. */
  async function fetchFinishingMaterialsForCategory(
    servicesArr: (typeof ALL_SERVICES)[number][]
  ) {
    try {
      await Promise.all(
        servicesArr.map(async (svc) => {
          if (!finishingMaterialsMapAll[svc.id]) {
            const dot = convertServiceIdToApiFormat(svc.id);
            const data = await fetchFinishingMaterials(dot);
            finishingMaterialsMapAll[svc.id] = data;

            if (!finishingMaterialSelections[svc.id]) {
              if (data?.sections) {
                const picksObj: Record<string, string> = {};
                for (const [secName, arr] of Object.entries(data.sections)) {
                  if (Array.isArray(arr) && arr.length > 0) {
                    picksObj[secName] = arr[0].external_id;
                  }
                }
                finishingMaterialSelections[svc.id] = picksObj;
              }
            }
          }
        })
      );
      setFinishingMaterialsMapAll({ ...finishingMaterialsMapAll });
      setFinishingMaterialSelections({ ...finishingMaterialSelections });
    } catch (err) {
      console.error("Error in fetchFinishingMaterialsForCategory:", err);
    }
  }

  /** Recompute cost whenever user changes selected services or ZIP changes. */
  useEffect(() => {
    async function recalcAll() {
      const svcIds = Object.keys(selectedServicesState);
      if (svcIds.length === 0) {
        setServiceCosts({});
        setCalculationResultsMap({});
        return;
      }

      const { zip, country } = location;
      if (!/^\d{5}$/.test(zip) || country !== "United States") {
        setWarningMessage(
          "Currently, our service is only available for US ZIP codes (5 digits)."
        );
        return;
      }

      const nextCosts: Record<string, number> = {};
      const nextCalc: Record<string, any> = {};

      await Promise.all(
        svcIds.map(async (svcId) => {
          try {
            await ensureFinishingMaterialsLoaded(svcId);

            const quantity = selectedServicesState[svcId];
            const picksObj = finishingMaterialSelections[svcId] || {};
            const finishingIds = Object.values(picksObj);

            const foundSvc = ALL_SERVICES.find((x) => x.id === svcId);
            if (!foundSvc) return;

            const dot = convertServiceIdToApiFormat(svcId);
            const resp = await calculatePrice({
              work_code: dot,
              zipcode: location.zip,
              unit_of_measurement: foundSvc.unit_of_measurement ?? "each",
              square: quantity,
              finishing_materials: finishingIds,
            });

            const labor = parseFloat(resp.work_cost) || 0;
            const mat = parseFloat(resp.material_cost) || 0;
            nextCosts[svcId] = labor + mat;
            nextCalc[svcId] = resp;
          } catch (err) {
            console.error("Error computing cost for service:", svcId, err);
          }
        })
      );

      setServiceCosts(nextCosts);
      setCalculationResultsMap(nextCalc);
    }

    recalcAll();
  }, [selectedServicesState, finishingMaterialSelections, location]);

  /** Summation of service costs. */
  function calculateTotal() {
    return Object.values(serviceCosts).reduce((a, b) => a + b, 0);
  }

  /** Next => validate selections and go to estimate page. */
  function handleNext() {
    if (Object.keys(selectedServicesState).length === 0) {
      setWarningMessage(
        "Please select at least one service before proceeding."
      );
      return;
    }
    if (!address.trim()) {
      setWarningMessage("Please enter your address before proceeding.");
      return;
    }
    router.push("/calculate/estimate");
  }

  /** Toggle expanded service details. */
  function toggleServiceDetails(serviceId: string) {
    setExpandedServiceDetails((old) => {
      const copy = new Set(old);
      if (copy.has(serviceId)) {
        copy.delete(serviceId);
      } else {
        copy.add(serviceId);
      }
      return copy;
    });
  }

  /** Find finishing material object. */
  function findFinishingMaterialObj(
    serviceId: string,
    extId: string
  ): FinishingMaterial | null {
    const data = finishingMaterialsMapAll[serviceId];
    if (!data) return null;
    for (const arr of Object.values(data.sections || {})) {
      if (Array.isArray(arr)) {
        const found = arr.find((xx) => xx.external_id === extId);
        if (found) return found;
      }
    }
    return null;
  }

  /** pickMaterial => finishingMaterialSelections[serviceId][sectionName] = externalId. */
  function pickMaterial(
    serviceId: string,
    sectionName: string,
    externalId: string
  ) {
    const serviceObj = finishingMaterialSelections[serviceId] || {};
    serviceObj[sectionName] = externalId;
    finishingMaterialSelections[serviceId] = serviceObj;
    setFinishingMaterialSelections({ ...finishingMaterialSelections });
  }

  /** userHasOwnMaterial => client highlights that item in red. */
  function userHasOwnMaterial(serviceId: string, extId: string) {
    if (!clientOwnedMaterials[serviceId]) {
      clientOwnedMaterials[serviceId] = new Set();
    }
    clientOwnedMaterials[serviceId].add(extId);
    setClientOwnedMaterials({ ...clientOwnedMaterials });
  }

  /** Close finishing materials modal. */
  function closeModal() {
    setShowModalServiceId(null);
    setShowModalSectionName(null);
  }

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto">
        <BreadCrumb items={CALCULATE_STEPS} />
      </div>

      <div className="container mx-auto">
        {/* Top row */}
        <div className="flex flex-col xl:flex-row justify-between items-start mt-8">
          <div className="w-full xl:w-auto">
            <SectionBoxTitle>Choose a Service and Quantity</SectionBoxTitle>
          </div>
          <div className="w-full xl:w-auto flex justify-end mt-2 xl:mt-0">
            <Button onClick={handleNext}>Next →</Button>
          </div>
        </div>

        {/* "No service?" + "Clear" */}
        <div className="flex justify-between items-center text-sm text-gray-500 mt-4 sm:mt-2 w-full xl:max-w-[600px]">
          <span>
            No service?{" "}
            <a
              href="#"
              className="text-blue-600 hover:underline focus:outline-none"
            >
              Contact support
            </a>
          </span>
          <button
            onClick={clearAllSelections}
            className="text-blue-600 hover:underline focus:outline-none"
          >
            Clear
          </button>
        </div>

        {/* Main layout */}
        <div className="container mx-auto relative flex flex-col xl:flex-row mt-8">
          {/* LEFT column */}
          <div className="w-full xl:flex-1">
            {Object.entries(categoriesBySection).map(
              ([sectionName, catIds]) => (
                <div key={sectionName} className="mb-4">
                  <SectionBoxSubtitle>{sectionName}</SectionBoxSubtitle>
                  <div className="flex flex-col gap-4 mt-4 w-full xl:max-w-[600px]">
                    {catIds.map((catId) => {
                      const servicesArr = categoryServicesMap[catId] || [];
                      const selectedInCat = servicesArr.filter(
                        (svc) => selectedServicesState[svc.id] != null
                      ).length;
                      const catTitle =
                        ALL_CATEGORIES.find((x) => x.id === catId)?.title ||
                        catId;

                      return (
                        <div
                          key={catId}
                          className={`p-4 border rounded-xl bg-white ${
                            selectedInCat > 0
                              ? "border-blue-500"
                              : "border-gray-300"
                          }`}
                        >
                          {/* Category toggler */}
                          <button
                            onClick={() => toggleCategory(catId)}
                            className="flex justify-between items-center w-full"
                          >
                            <h3
                              className={`font-semibold sm:font-medium text-xl sm:text-2xl ${
                                selectedInCat > 0
                                  ? "text-blue-600"
                                  : "text-gray-800"
                              }`}
                            >
                              {catTitle}
                              {selectedInCat > 0 && (
                                <span className="text-sm text-gray-500 ml-2">
                                  ({selectedInCat} 
                                  <span className="hidden sm:inline"> selected</span>)
                                </span>
                              )}
                            </h3>
                            <ChevronDown
                              className={`h-5 w-5 transform transition-transform ${
                                expandedCategories.has(catId)
                                  ? "rotate-180"
                                  : ""
                              }`}
                            />
                          </button>

                          {expandedCategories.has(catId) && (
                            <div className="mt-4 flex flex-col gap-3">
                              {servicesArr.map((svc) => {
                                const isSelected =
                                  selectedServicesState[svc.id] != null;
                                const q =
                                  selectedServicesState[svc.id] ??
                                  svc.min_quantity ??
                                  1;
                                const rawVal = manualInputValue[svc.id] ?? null;
                                const displayVal =
                                  rawVal !== null ? rawVal : String(q);

                                const finalCost = serviceCosts[svc.id] || 0;
                                const calcResult =
                                  calculationResultsMap[svc.id];
                                const detailsExpanded =
                                  expandedServiceDetails.has(svc.id);

                                // Let's define a helper to open the surface calc
                                function openSurfaceCalc() {
                                  setCalcServiceId(svc.id);
                                  setShowSurfaceCalc(true);
                                }

                                const showSurfaceCalcButton =
                                  svc.unit_of_measurement
                                    .toLowerCase()
                                    .includes("sq ft");

                                return (
                                  <div key={svc.id} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                      <span
                                        className={`text-lg transition-colors duration-300 ${
                                          isSelected
                                            ? "text-blue-600"
                                            : "text-gray-800"
                                        }`}
                                      >
                                        {svc.title}
                                      </span>
                                      <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={isSelected}
                                          onChange={() =>
                                            handleServiceToggle(svc.id)
                                          }
                                          className="sr-only peer"
                                        />
                                        <div className="w-[50px] h-[26px] bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors duration-300"></div>
                                        <div className="absolute top-[2px] left-[2px] w-[22px] h-[22px] bg-white rounded-full shadow-md peer-checked:translate-x-[24px] transform transition-transform duration-300"></div>
                                      </label>
                                    </div>

                                    {isSelected && (
                                      <>
                                        <ServiceImage serviceId={svc.id} />

                                        {svc.description && (
                                          <p className="text-sm text-gray-500">
                                            {svc.description}
                                          </p>
                                        )}

                                        {/* Quantity row */}
                                        <div className="flex justify-between items-center">
                                          <div className="flex items-center gap-1">
                                            <button
                                              onClick={() =>
                                                handleQuantityChange(
                                                  svc.id,
                                                  false,
                                                  svc.unit_of_measurement
                                                )
                                              }
                                              className="w-8 h-8 bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg rounded"
                                            >
                                              −
                                            </button>
                                            <input
                                              type="text"
                                              value={displayVal}
                                              onClick={() =>
                                                setManualInputValue((old) => ({
                                                  ...old,
                                                  [svc.id]: "",
                                                }))
                                              }
                                              onBlur={() =>
                                                handleBlurInput(svc.id)
                                              }
                                              onChange={(e) =>
                                                handleManualQuantityChange(
                                                  svc.id,
                                                  e.target.value,
                                                  svc.unit_of_measurement
                                                )
                                              }
                                              className="w-20 text-center px-2 py-1 border rounded"
                                            />
                                            <button
                                              onClick={() =>
                                                handleQuantityChange(
                                                  svc.id,
                                                  true,
                                                  svc.unit_of_measurement
                                                )
                                              }
                                              className="w-8 h-8 bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg rounded"
                                            >
                                              +
                                            </button>
                                            <span className="text-sm text-gray-600">
                                              {svc.unit_of_measurement}
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
                                                onClick={openSurfaceCalc}
                                                className="text-blue-600 text-sm font-medium hover:underline mr-auto"
                                              >
                                                Surface Calc
                                              </button>
                                              <button
                                                onClick={() =>
                                                  toggleServiceDetails(svc.id)
                                                }
                                                className={`text-blue-600 text-sm font-medium mb-3 ${
                                                  detailsExpanded
                                                    ? ""
                                                    : "underline"
                                                }`}
                                              >
                                                Cost Breakdown
                                              </button>
                                            </>
                                          ) : (
                                            <button
                                              onClick={() =>
                                                toggleServiceDetails(svc.id)
                                              }
                                              className={`ml-auto text-blue-600 text-sm font-medium mb-3 ${
                                                detailsExpanded
                                                  ? ""
                                                  : "underline"
                                              }`}
                                            >
                                              Cost Breakdown
                                            </button>
                                          )}
                                        </div>

                                        {/* Cost breakdown menu*/}
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
                                                  Materials, tools and equipment
                                                </span>
                                                <span className="text-md font-semibold text-gray-700">
                                                  {calcResult.material_cost
                                                    ? `$${calcResult.material_cost}`
                                                    : "—"}
                                                </span>
                                              </div>
                                            </div>

                                            {Array.isArray(
                                              calcResult.materials
                                            ) &&
                                              calcResult.materials.length >
                                                0 && (
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
                                                              svc.id,
                                                              m.external_id
                                                            );
                                                          const hasImage = fmObj
                                                            ?.image?.length
                                                            ? true
                                                            : false;
                                                          const isClientOwned =
                                                            clientOwnedMaterials[
                                                              svc.id
                                                            ]?.has(
                                                              m.external_id
                                                            );

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
                                                                  !isClientOwned &&
                                                                  hasImage
                                                                ) {
                                                                  let foundSection:
                                                                    | string
                                                                    | null =
                                                                    null;
                                                                  const fmData =
                                                                    finishingMaterialsMapAll[
                                                                      svc.id
                                                                    ];
                                                                  if (
                                                                    fmData?.sections
                                                                  ) {
                                                                    for (const [
                                                                      sKey,
                                                                      sArr,
                                                                    ] of Object.entries(
                                                                      fmData.sections
                                                                    )) {
                                                                      if (
                                                                        Array.isArray(
                                                                          sArr
                                                                        ) &&
                                                                        sArr.some(
                                                                          (
                                                                            xx
                                                                          ) =>
                                                                            xx.external_id ===
                                                                            m.external_id
                                                                        )
                                                                      ) {
                                                                        foundSection =
                                                                          sKey;
                                                                        break;
                                                                      }
                                                                    }
                                                                  }
                                                                  setShowModalServiceId(
                                                                    svc.id
                                                                  );
                                                                  setShowModalSectionName(
                                                                    foundSection
                                                                  );
                                                                }
                                                              }}
                                                            >
                                                              <td className="py-3 px-1">
                                                                {hasImage ? (
                                                                  //
                                                                  // On phones => vertical stack, on bigger => horizontal
                                                                  <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center break-words">
                                                                    <img
                                                                      src={
                                                                        fmObj?.image
                                                                      }
                                                                      alt={
                                                                        m.name
                                                                      }
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
                                                                $
                                                                {
                                                                  m.cost_per_unit
                                                                }
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
              )
            )}
          </div>

          {/* RIGHT column => summary + recommended */}
          <div className="w-full xl:w-1/2 xl:ml-auto mt-2 sm:mt-0">
            {/* Summary */}
            <div className="w-full xl:max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden">
              <SectionBoxSubtitle>Summary</SectionBoxSubtitle>
              {Object.keys(selectedServicesState).length === 0 ? (
                <div className="text-left text-gray-500 text-md mt-4">
                  No services selected
                </div>
              ) : (
                <>
                  {Object.entries(categoriesBySection).map(
                    ([secName, catIds]) => {
                      const relevantCatIds = catIds.filter((catId) => {
                        const arr = categoryServicesMap[catId] || [];
                        return arr.some(
                          (svc) => selectedServicesState[svc.id] != null
                        );
                      });
                      if (relevantCatIds.length === 0) return null;

                      return (
                        <div key={secName} className="mb-6">
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            {secName}
                          </h3>
                          {relevantCatIds.map((catId) => {
                            const catObj = ALL_CATEGORIES.find(
                              (c) => c.id === catId
                            );
                            const catTitle = catObj ? catObj.title : catId;
                            const arr = categoryServicesMap[catId] || [];
                            const chosenServices = arr.filter(
                              (svc) => selectedServicesState[svc.id] != null
                            );
                            if (chosenServices.length === 0) return null;

                            return (
                              <div key={catId} className="mb-4 ml-4">
                                <h4 className="text-lg font-medium text-gray-700 mb-2">
                                  {catTitle}
                                </h4>
                                <ul className="space-y-2 pb-4">
                                  {chosenServices.map((svc) => {
                                    const qty =
                                      selectedServicesState[svc.id] || 1;
                                    const cost = serviceCosts[svc.id] || 0;
                                    return (
                                      <li
                                        key={svc.id}
                                        className="grid grid-cols-3 gap-2 text-sm text-gray-600"
                                        style={{
                                          gridTemplateColumns: "40% 30% 25%",
                                        }}
                                      >
                                        <span>{svc.title}</span>
                                        <span className="text-right">
                                          {qty} {svc.unit_of_measurement}
                                        </span>
                                        <span className="text-right">
                                          ${formatWithSeparator(cost)}
                                        </span>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            );
                          })}
                        </div>
                      );
                    }
                  )}

                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xl font-semibold text-gray-800">
                      Subtotal:
                    </span>
                    <span className="text-xl sm:text-2xl font-bold sm:font-semibold text-blue-600">
                      ${formatWithSeparator(calculateTotal())}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Address block */}
            <div className="hidden sm:block w-full xl:max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden mt-6">
              <h2 className="text-2xl font-medium text-gray-800 mb-4">
                Address
              </h2>
              <p className="text-gray-500 text-medium">
                {address || "No address provided"}
              </p>
            </div>

            {/* Photos block */}
            <div className="hidden sm:block w-full xl:max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden mt-6">
              <h2 className="text-2xl font-medium text-gray-800 mb-4">
                Uploaded Photos
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {photos.map((ph, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={ph}
                      alt={`Uploaded photo ${i + 1}`}
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

            {/* Additional details */}
            <div className="hidden sm:block w-full xl:max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden mt-6">
              <h2 className="text-2xl font-medium text-gray-800 mb-4">
                Additional details
              </h2>
              <p className="text-gray-500 text-medium whitespace-pre-wrap">
                {description || "No details provided"}
              </p>
            </div>

            {/* RecommendedActivities */}
            <RecommendedActivities
              selectedServicesState={selectedServicesState}
              onUpdateSelectedServicesState={setSelectedServicesState}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
            />
          </div>
        </div>
      </div>

      {/* Finishing-material modal */}
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

      {/* SurfaceCalculatorModal */}
      <SurfaceCalculatorModal
        show={showSurfaceCalc}
        onClose={() => setShowSurfaceCalc(false)}
        serviceId={calcServiceId}
        onApplySquareFeet={handleApplySquareFeet}
      />
    </main>
  );
}