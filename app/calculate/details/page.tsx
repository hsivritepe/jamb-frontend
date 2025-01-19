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
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { setSessionItem, getSessionItem } from "@/utils/session";
import { servicesRecommendations } from "@/components/ServicesRecommendations";

/** A finishing-material shape from /work/finishing_materials. */
interface FinishingMaterial {
  id: number;
  image?: string;
  unit_of_measurement: string;
  name: string;
  external_id: string;
  cost: string;
}

/** Formats a numeric value with commas and two decimals. */
function formatWithSeparator(value: number): string {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(value);
}

/** Converts "1-1-1" => "1.1.1". */
function convertServiceIdToApiFormat(serviceId: string): string {
  return serviceId.replaceAll("-", ".");
}

/** Returns base API URL or fallback. */
function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://dev.thejamb.com";
}

/** POST /work/finishing_materials => fetch finishing materials data. */
async function fetchFinishingMaterials(workCode: string) {
  const url = `${getApiBaseUrl()}/work/finishing_materials`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ work_code: workCode }),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch finishing materials (work_code=${workCode}).`);
  }
  return res.json();
}

/** POST /calculate => compute labor+materials cost. */
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
    throw new Error(`Failed to calculate price (work_code=${params.work_code}).`);
  }
  return res.json();
}

/** Renders an image for a given service ID, e.g. "1-1-1" => "1.1.1". */
function ServiceImage({ serviceId }: { serviceId: string }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    const firstSegment = serviceId.split("-")[0];
    const code = convertServiceIdToApiFormat(serviceId);
    const url = `http://dev.thejamb.com/images/${firstSegment}/${code}.jpg`;
    setImageSrc(url);
  }, [serviceId]);

  if (!imageSrc) return null;

  return (
    <Image
      src={imageSrc}
      alt="Service"
      width={600}
      height={400}
      className="w-full h-full object-cover"
    />
  );
}

/** "1-1-1" <-> "1.1.1" */
function dashToDot(s: string) {
  return s.replaceAll("-", ".");
}
function dotToDash(s: string) {
  return s.replaceAll(".", "-");
}

/**
 * RecommendedActivities:
 * - Gathers all recommended services (from each selected service).
 * - Uses pagination (2 per page) with a fade effect.
 * - Makes sure the input is never uncontrolled.
 */
function RecommendedActivities({
  selectedServicesState,
  onUpdateSelectedServicesState,
  selectedCategories,
  setSelectedCategories,
}: {
  selectedServicesState: Record<string, number>;
  onUpdateSelectedServicesState: (newState: Record<string, number>) => void;
  selectedCategories: string[];
  setSelectedCategories: (cats: string[]) => void;
}) {
  const { location } = useLocation();

  // Build origin -> recommended IDs
  const originToRecommendedIds = useMemo(() => {
    const out: Record<string, string[]> = {};
    for (const originDash of Object.keys(selectedServicesState)) {
      const dotId = dashToDot(originDash);
      const [sec, cat, act] = dotId.split(".");
      if (!sec || !cat || !act) continue;

      const secObj = servicesRecommendations[sec];
      if (!secObj) continue;
      const catObj = secObj.categories[`${sec}.${cat}`];
      if (!catObj) continue;
      const actObj = catObj.activities[dotId];
      if (!actObj) continue;

      const recs = actObj.recommendedActivities || {};
      let recIds = Object.keys(recs).map(dotToDash);

      // exclude ones already on the left side
      recIds = recIds.filter((rId) => selectedServicesState[rId] == null);
      out[originDash] = recIds;
    }
    return out;
  }, [selectedServicesState]);

  // We'll flatten these into an array
  interface FlatRec {
    originId: string;
    recommendedId: string;
    title: string;
    description: string;
    min_quantity: number;
    unit_of_measurement: string;
    recommendedQty: number;
  }
  const flatRecommended: FlatRec[] = useMemo(() => {
    const arr: FlatRec[] = [];
    for (const [originId, recIds] of Object.entries(originToRecommendedIds)) {
      const originQty = selectedServicesState[originId] ?? 1;
      const originSvc = ALL_SERVICES.find((x) => x.id === originId);
      const originUnit = originSvc?.unit_of_measurement || "each";

      for (const rDash of recIds) {
        const rDot = dashToDot(rDash);
        const recSvc = ALL_SERVICES.find((x) => x.id === rDash);
        if (!recSvc) continue;

        const minQ = recSvc.min_quantity ?? 1;
        let recommendedQty = minQ;

        // if same unit => sync
        if (recSvc.unit_of_measurement === originUnit) {
          recommendedQty = Math.max(minQ, originQty);
        }

        arr.push({
          originId,
          recommendedId: rDash,
          title: recSvc.title || rDash,
          description: recSvc.description || "",
          min_quantity: minQ,
          unit_of_measurement: recSvc.unit_of_measurement || "each",
          recommendedQty,
        });
      }
    }
    return arr;
  }, [originToRecommendedIds, selectedServicesState]);

  // recommendedQuantities => recId => number
  const [recommendedQuantities, setRecommendedQuantities] = useState<Record<string, number>>({});
  // manualRecInput => recId => string|null
  const [manualRecInput, setManualRecInput] = useState<Record<string, string | null>>({});
  // recommendedCosts => recId => number
  const [recommendedCosts, setRecommendedCosts] = useState<Record<string, number>>({});
  // fade
  const [isFading, setIsFading] = useState(false);

  /** On mount or if flatRecommended changes, fill recommendedQuantities if missing. */
  useEffect(() => {
    const copy = { ...recommendedQuantities };
    let changed = false;

    flatRecommended.forEach((item) => {
      if (copy[item.recommendedId] == null) {
        copy[item.recommendedId] = item.recommendedQty;
        changed = true;
      }
    });
    if (changed) {
      setRecommendedQuantities(copy);
    }
  }, [flatRecommended, recommendedQuantities]);

  /** Recompute cost if recommendedQuantities changes or location changes. */
  useEffect(() => {
    (async () => {
      const { zip, country } = location;
      if (!/^\d{5}$/.test(zip) || country !== "United States") {
        return;
      }
      const nextCosts: Record<string, number> = {};
      await Promise.all(
        flatRecommended.map(async (item) => {
          try {
            const recId = item.recommendedId;
            const qty = recommendedQuantities[recId] ?? item.min_quantity;
            const dot = dashToDot(recId);
            const resp = await calculatePrice({
              work_code: dot,
              zipcode: zip,
              unit_of_measurement: item.unit_of_measurement,
              square: qty,
              finishing_materials: [],
            });
            const labor = parseFloat(resp.work_cost) || 0;
            const mat = parseFloat(resp.material_cost) || 0;
            nextCosts[recId] = labor + mat;
          } catch {
            // ignore
          }
        })
      );
      setRecommendedCosts(nextCosts);
    })();
  }, [flatRecommended, recommendedQuantities, location]);

  /** +/− quantity in recommended. */
  function handleRecQuantityChange(recId: string, increment: boolean, unit: string, minQ: number) {
    setRecommendedQuantities((prev) => {
      const oldVal = prev[recId] ?? minQ;
      let newVal = increment ? oldVal + 1 : oldVal - 1;
      if (newVal < minQ) newVal = minQ;
      return {
        ...prev,
        [recId]: unit === "each" ? Math.round(newVal) : newVal,
      };
    });
    // clear manual input
    setManualRecInput((prev) => ({ ...prev, [recId]: null }));
  }

  /** typed quantity. Same logic as left side: clamp to min, etc. */
  function handleRecManualChange(recId: string, val: string, unit: string, minQ: number) {
    setManualRecInput((prev) => ({ ...prev, [recId]: val }));

    let numericVal = parseFloat(val.replace(/,/g, "")) || 0;
    if (numericVal < minQ) numericVal = minQ;

    setRecommendedQuantities((prev) => ({
      ...prev,
      [recId]: unit === "each" ? Math.round(numericVal) : numericVal,
    }));
  }

  /** If empty on blur => revert to numeric display. */
  function handleRecBlur(recId: string) {
    if (manualRecInput[recId] === "") {
      setManualRecInput((prev) => ({ ...prev, [recId]: null }));
    }
  }

  /** onClick => clear input => "" */
  function handleRecClick(recId: string) {
    setManualRecInput((prev) => ({ ...prev, [recId]: "" }));
  }

  /** Add or remove recommended => updates left side. */
  function handleAddRecommended(recId: string, minQ: number) {
    const isSelected = selectedServicesState[recId] != null;
    if (isSelected) {
      // remove
      const copy = { ...selectedServicesState };
      delete copy[recId];
      onUpdateSelectedServicesState(copy);
    } else {
      // add
      const qty = recommendedQuantities[recId] ?? minQ;
      onUpdateSelectedServicesState({
        ...selectedServicesState,
        [recId]: qty,
      });

      // If this rec belongs to a category not in left side => add it
      const catPrefix = recId.split("-").slice(0, 2).join("-");
      if (!selectedCategories.includes(catPrefix)) {
        const newCats = [...selectedCategories, catPrefix];
        setSelectedCategories(newCats);
        setSessionItem("services_selectedCategories", newCats);
      }
    }
  }

  // Simple pagination => 2 items per page
  const [currentIndex, setCurrentIndex] = useState(0);

  // If data changes drastically => clamp
  useEffect(() => {
    if (currentIndex >= flatRecommended.length) {
      setCurrentIndex(0);
    }
  }, [flatRecommended, currentIndex]);

  const pageItems = useMemo(() => {
    return flatRecommended.slice(currentIndex, currentIndex + 2);
  }, [flatRecommended, currentIndex]);

  function handlePrev() {
    if (currentIndex > 0) {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex((prev) => prev - 2);
        setIsFading(false);
      }, 300);
    }
  }

  function handleNext() {
    if (currentIndex + 2 < flatRecommended.length) {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 2);
        setIsFading(false);
      }, 300);
    }
  }

  if (flatRecommended.length === 0) {
    return (
      <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden mt-6">
        <h2 className="text-2xl font-medium text-gray-800 mb-4">Maybe You Also Need</h2>
        <p className="text-md text-gray-500 mt-4">No additional recommendations</p>
      </div>
    );
  }

  return (
    <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden mt-6">
      {/* Title and nav buttons */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-medium text-gray-800">Maybe You Also Need</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`p-2 rounded border transition-colors ${
              currentIndex === 0 ? "text-gray-300 border-gray-200" : "text-black border-gray-400"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex + 2 >= flatRecommended.length}
            className={`p-2 rounded border transition-colors ${
              currentIndex + 2 >= flatRecommended.length
                ? "text-gray-300 border-gray-200"
                : "text-black border-gray-400"
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Fade container */}
      <div
        className={`grid grid-cols-2 gap-4 transition-opacity duration-300 ${
          isFading ? "opacity-0" : "opacity-100"
        }`}
      >
        {pageItems.map((item) => {
          // cost from recommendedCosts
          const costVal = recommendedCosts[item.recommendedId] || 0;
          // numeric quantity from recommendedQuantities or fallback
          const numeric = recommendedQuantities[item.recommendedId] ?? item.min_quantity;
          // typed => if null => display numeric, else typed string
          const typedVal = manualRecInput[item.recommendedId] ?? null;
          const displayVal = typedVal !== null ? typedVal : String(numeric);
          const isSelected = selectedServicesState[item.recommendedId] != null;

          return (
            <div
              key={`${item.originId}-${item.recommendedId}`}
              className="p-3 bg-white border border-gray-200 rounded shadow-sm flex flex-col justify-between h-[350px]"
            >
              <div className="w-full h-40 overflow-hidden mb-2 rounded">
                <ServiceImage serviceId={item.recommendedId} />
              </div>

              <h4 className="text-sm font-semibold text-gray-800 mt-0 line-clamp-2">
                {item.title}
              </h4>
              {item.description && (
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {item.description}
                </p>
              )}

              {/* quantity */}
              <div className="mt-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      handleRecQuantityChange(
                        item.recommendedId,
                        false,
                        item.unit_of_measurement,
                        item.min_quantity
                      )
                    }
                    className="w-8 h-8 bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg rounded"
                  >
                    −
                  </button>
                  <input
                    type="text"
                    value={displayVal}
                    onClick={() => handleRecClick(item.recommendedId)}
                    onBlur={() => handleRecBlur(item.recommendedId)}
                    onChange={(e) =>
                      handleRecManualChange(
                        item.recommendedId,
                        e.target.value,
                        item.unit_of_measurement,
                        item.min_quantity
                      )
                    }
                    className="w-16 text-center px-1 py-1 border rounded text-sm"
                  />
                  <button
                    onClick={() =>
                      handleRecQuantityChange(
                        item.recommendedId,
                        true,
                        item.unit_of_measurement,
                        item.min_quantity
                      )
                    }
                    className="w-8 h-8 bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg rounded"
                  >
                    +
                  </button>
                  <span className="text-xs text-gray-600 ml-1">{item.unit_of_measurement}</span>
                </div>
              </div>

              {/* cost + add/remove */}
              <div className="mt-2 flex justify-between items-center">
                <span className="text-sm text-blue-600 font-semibold">
                  ${formatWithSeparator(costVal)}
                </span>
                <button
                  onClick={() => handleAddRecommended(item.recommendedId, item.min_quantity)}
                  className={`text-xs px-2 py-1 rounded ${
                    isSelected
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isSelected ? "Remove" : "Add"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Main "Details" page component.
 */
export default function Details() {
  const router = useRouter();
  const { location } = useLocation();

  // 1) Load from session
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    () => getSessionItem("services_selectedCategories", [])
  );
  const [address, setAddress] = useState<string>(() => getSessionItem("address", ""));
  const description = getSessionItem<string>("description", "");
  const photos = getSessionItem<string[]>("photos", []);
  const searchQuery = getSessionItem<string>("services_searchQuery", "");

  // If no categories or address => redirect
  useEffect(() => {
    if (selectedCategories.length === 0 || !address) {
      router.push("/calculate");
    }
  }, [selectedCategories, address, router]);

  // Keep address in sync if location changes
  useEffect(() => {
    const newAddr = [location.city, location.state, location.zip, location.country]
      .filter(Boolean)
      .join(", ");
    if (newAddr.trim()) {
      setAddress(newAddr);
      setSessionItem("address", newAddr);
    }
  }, [location]);

  // potential warnings
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  // expanded categories
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Build categories by "section"
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
  const categoryServicesMap: Record<string, (typeof ALL_SERVICES)[number][]> = useMemo(() => {
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

  // 2) selectedServices => serviceId => quantity
  const [selectedServicesState, setSelectedServicesState] = useState<Record<string, number>>(
    () => getSessionItem("selectedServicesWithQuantity", {})
  );
  useEffect(() => {
    setSessionItem("selectedServicesWithQuantity", selectedServicesState);
  }, [selectedServicesState]);

  // finishing materials => serviceId => { sections: ... }
  const [finishingMaterialsMapAll, setFinishingMaterialsMapAll] = useState<
    Record<string, { sections: Record<string, FinishingMaterial[]> }>
  >({});
  // finishingMaterialSelections => serviceId => string[]
  const [finishingMaterialSelections, setFinishingMaterialSelections] = useState<
    Record<string, string[]>
  >({});

  // typed input => serviceId => string|null
  const [manualInputValue, setManualInputValue] = useState<Record<string, string | null>>({});
  // cost => serviceId => number
  const [serviceCosts, setServiceCosts] = useState<Record<string, number>>({});
  // breakdown => serviceId => any
  const [calculationResultsMap, setCalculationResultsMap] = useState<Record<string, any>>({});
  // expanded service details
  const [expandedServiceDetails, setExpandedServiceDetails] = useState<Set<string>>(new Set());
  // user-owned => serviceId => set of external IDs
  const [clientOwnedMaterials, setClientOwnedMaterials] = useState<Record<string, Set<string>>>({});

  // finishing-material modal
  const [showModalServiceId, setShowModalServiceId] = useState<string | null>(null);
  const [showModalSectionName, setShowModalSectionName] = useState<string | null>(null);

  // save breakdown to session
  useEffect(() => {
    setSessionItem("calculationResultsMap", calculationResultsMap);
  }, [calculationResultsMap]);

  /** Expand/collapse category => also fetch finishing materials. */
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

  /** Toggle a service on/off in left side. */
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

        // set the manual input to the numeric minQ
        setManualInputValue((prev) => ({ ...prev, [serviceId]: String(minQ) }));

        ensureFinishingMaterialsLoaded(serviceId);
        return newObj;
      }
    });
    setWarningMessage(null);
  }

  /** +/− quantity on left side. */
  function handleQuantityChange(serviceId: string, increment: boolean, unit: string) {
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

    // Clear manual input
    setManualInputValue((old) => ({ ...old, [serviceId]: null }));
  }

  /** typed quantity on left side. */
  function handleManualQuantityChange(serviceId: string, val: string, unit: string) {
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

  /** onBlur => if we see an empty string => revert to null => we show numeric next render. */
  function handleBlurInput(serviceId: string) {
    if (!manualInputValue[serviceId]) {
      setManualInputValue((old) => ({ ...old, [serviceId]: null }));
    }
  }

  /** Clear all selected services. */
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

  /** Ensure finishing materials for a service is loaded from the server. */
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
          const picks: string[] = [];
          for (const arr of Object.values(fmData.sections)) {
            if (Array.isArray(arr) && arr.length > 0) {
              picks.push(arr[0].external_id);
            }
          }
          finishingMaterialSelections[serviceId] = picks;
          setFinishingMaterialSelections({ ...finishingMaterialSelections });
        }
      }
    } catch (err) {
      console.error("Error ensuring finishing materials for:", serviceId, err);
    }
  }

  /** Fetch finishing materials for all services in a category. */
  async function fetchFinishingMaterialsForCategory(servicesArr: (typeof ALL_SERVICES)[number][]) {
    try {
      await Promise.all(
        servicesArr.map(async (svc) => {
          if (!finishingMaterialsMapAll[svc.id]) {
            const dot = convertServiceIdToApiFormat(svc.id);
            const data = await fetchFinishingMaterials(dot);

            finishingMaterialsMapAll[svc.id] = data;
            if (!finishingMaterialSelections[svc.id]) {
              const picks: string[] = [];
              for (const arr of Object.values(data.sections || {})) {
                if (Array.isArray(arr) && arr.length > 0) {
                  picks.push(arr[0].external_id);
                }
              }
              finishingMaterialSelections[svc.id] = picks;
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

  /**
   * Recompute cost for left side whenever user changes services or ZIP changes.
   */
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
        setWarningMessage("Currently, our service is only available for US ZIP codes (5 digits).");
        return;
      }

      const nextCosts: Record<string, number> = {};
      const nextCalc: Record<string, any> = {};

      await Promise.all(
        svcIds.map(async (svcId) => {
          try {
            await ensureFinishingMaterialsLoaded(svcId);

            const quantity = selectedServicesState[svcId];
            const finishingIds = finishingMaterialSelections[svcId] || [];
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

  function calculateTotal() {
    return Object.values(serviceCosts).reduce((acc, val) => acc + val, 0);
  }

  function handleNext() {
    if (Object.keys(selectedServicesState).length === 0) {
      setWarningMessage("Please select at least one service before proceeding.");
      return;
    }
    if (!address.trim()) {
      setWarningMessage("Please enter your address before proceeding.");
      return;
    }
    router.push("/calculate/estimate");
  }

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

  function findFinishingMaterialObj(serviceId: string, extId: string): FinishingMaterial | null {
    const data = finishingMaterialsMapAll[serviceId];
    if (!data) return null;
    for (const arr of Object.values(data.sections || {})) {
      if (Array.isArray(arr)) {
        const found = arr.find((fm) => fm.external_id === extId);
        if (found) return found;
      }
    }
    return null;
  }

  function pickMaterial(serviceId: string, newExtId: string) {
    finishingMaterialSelections[serviceId] = [newExtId];
    setFinishingMaterialSelections({ ...finishingMaterialSelections });
  }

  function userHasOwnMaterial(serviceId: string, extId: string) {
    if (!clientOwnedMaterials[serviceId]) {
      clientOwnedMaterials[serviceId] = new Set();
    }
    clientOwnedMaterials[serviceId].add(extId);
    setClientOwnedMaterials({ ...clientOwnedMaterials });
  }

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
        <div className="flex justify-between items-start mt-8">
          <SectionBoxTitle>Choose a Service and Quantity</SectionBoxTitle>
          <Button onClick={handleNext}>Next →</Button>
        </div>

        {/* "No service?" + "Clear" */}
        <div className="flex justify-between items-center text-sm text-gray-500 mt-8 w-full max-w-[600px]">
          <span>
            No service?{" "}
            <a href="#" className="text-blue-600 hover:underline focus:outline-none">
              Contact support
            </a>
          </span>
          <button onClick={clearAllSelections} className="text-blue-600 hover:underline focus:outline-none">
            Clear
          </button>
        </div>

        {/* Warnings */}
        <div className="h-6 mt-4 text-left">
          {warningMessage && <p className="text-red-500">{warningMessage}</p>}
        </div>

        <div className="container mx-auto relative flex mt-8">
          {/* LEFT side => categories + services */}
          <div className="flex-1">
            {Object.entries(categoriesBySection).map(([sectionName, catIds]) => (
              <div key={sectionName} className="mb-8">
                <SectionBoxSubtitle>{sectionName}</SectionBoxSubtitle>
                <div className="flex flex-col gap-4 mt-4 w-full max-w-[600px]">
                  {catIds.map((catId) => {
                    const servicesArr = categoryServicesMap[catId] || [];
                    const selectedInCat = servicesArr.filter((svc) => selectedServicesState[svc.id] != null).length;
                    const catTitle = ALL_CATEGORIES.find((x) => x.id === catId)?.title || catId;

                    return (
                      <div
                        key={catId}
                        className={`p-4 border rounded-xl bg-white ${
                          selectedInCat > 0 ? "border-blue-500" : "border-gray-300"
                        }`}
                      >
                        <button
                          onClick={() => toggleCategory(catId)}
                          className="flex justify-between items-center w-full"
                        >
                          <h3
                            className={`font-medium text-2xl ${
                              selectedInCat > 0 ? "text-blue-600" : "text-black"
                            }`}
                          >
                            {catTitle}
                            {selectedInCat > 0 && (
                              <span className="text-sm text-gray-500 ml-2">({selectedInCat} selected)</span>
                            )}
                          </h3>
                          <ChevronDown
                            className={`h-5 w-5 transform transition-transform ${
                              expandedCategories.has(catId) ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {expandedCategories.has(catId) && (
                          <div className="mt-4 flex flex-col gap-3">
                            {servicesArr.map((svc) => {
                              const isSelected = selectedServicesState[svc.id] != null;
                              const q = selectedServicesState[svc.id] ?? svc.min_quantity ?? 1;
                              const rawVal = manualInputValue[svc.id] ?? null;
                              const displayVal = rawVal !== null ? rawVal : String(q);

                              const finalCost = serviceCosts[svc.id] || 0;
                              const calcResult = calculationResultsMap[svc.id];
                              const detailsExpanded = expandedServiceDetails.has(svc.id);

                              return (
                                <div key={svc.id} className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span
                                      className={`text-lg transition-colors duration-300 ${
                                        isSelected ? "text-blue-600" : "text-gray-800"
                                      }`}
                                    >
                                      {svc.title}
                                    </span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => handleServiceToggle(svc.id)}
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
                                        <p className="text-sm text-gray-500 pr-16">{svc.description}</p>
                                      )}
                                      <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-1">
                                          <button
                                            onClick={() =>
                                              handleQuantityChange(svc.id, false, svc.unit_of_measurement)
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
                                            onBlur={() => handleBlurInput(svc.id)}
                                            onChange={(e) =>
                                              handleManualQuantityChange(svc.id, e.target.value, svc.unit_of_measurement)
                                            }
                                            className="w-20 text-center px-2 py-1 border rounded"
                                          />
                                          <button
                                            onClick={() =>
                                              handleQuantityChange(svc.id, true, svc.unit_of_measurement)
                                            }
                                            className="w-8 h-8 bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg rounded"
                                          >
                                            +
                                          </button>
                                          <span className="text-sm text-gray-600">{svc.unit_of_measurement}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-lg text-blue-600 font-medium text-right">
                                            ${formatWithSeparator(finalCost)}
                                          </span>
                                          <button
                                            onClick={() => {
                                              if (detailsExpanded) {
                                                setExpandedServiceDetails((old) => {
                                                  const copy = new Set(old);
                                                  copy.delete(svc.id);
                                                  return copy;
                                                });
                                              } else {
                                                setExpandedServiceDetails((old) => {
                                                  const copy = new Set(old);
                                                  copy.add(svc.id);
                                                  return copy;
                                                });
                                              }
                                            }}
                                            className={`text-blue-500 text-sm ml-2 ${
                                              detailsExpanded ? "" : "underline"
                                            }`}
                                          >
                                            Details
                                          </button>
                                        </div>
                                      </div>

                                      {calcResult && detailsExpanded && (
                                        <div className="mt-4 p-4 bg-gray-50 border rounded">
                                          <h4 className="text-lg font-semibold text-gray-800 mb-3">Cost Breakdown</h4>
                                          <div className="flex flex-col gap-2 mb-4">
                                            <div className="flex justify-between">
                                              <span className="text-md font-medium text-gray-700">Labor</span>
                                              <span className="text-md font-medium text-gray-700">
                                                {calcResult.work_cost ? `$${calcResult.work_cost}` : "—"}
                                              </span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-md font-medium text-gray-700">
                                                Materials, tools and equipment
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
                                                      const fmObj = findFinishingMaterialObj(svc.id, m.external_id);
                                                      const hasImage = fmObj?.image?.length ? true : false;
                                                      const isClientOwned =
                                                        clientOwnedMaterials[svc.id]?.has(m.external_id);

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
                                                            if (!isClientOwned && hasImage) {
                                                              let foundSection: string | null = null;
                                                              const fmData = finishingMaterialsMapAll[svc.id];
                                                              if (fmData?.sections) {
                                                                for (const [
                                                                  sKey,
                                                                  sArr,
                                                                ] of Object.entries(fmData.sections)) {
                                                                  if (
                                                                    Array.isArray(sArr) &&
                                                                    sArr.some(
                                                                      (xx) => xx.external_id === m.external_id
                                                                    )
                                                                  ) {
                                                                    foundSection = sKey;
                                                                    break;
                                                                  }
                                                                }
                                                              }
                                                              setShowModalServiceId(svc.id);
                                                              setShowModalSectionName(foundSection || null);
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
                                                          <td className="py-3 px-1">${m.cost_per_unit}</td>
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
            ))}
          </div>

          {/* RIGHT column => summary + recommended */}
          <div className="w-1/2 ml-auto mt-14 pt-1">
            {/* Summary */}
            <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden">
              <SectionBoxSubtitle>Summary</SectionBoxSubtitle>
              {Object.keys(selectedServicesState).length === 0 ? (
                <div className="text-left text-gray-500 text-medium mt-4">No services selected</div>
              ) : (
                <>
                  {Object.entries(categoriesBySection).map(([secName, catIds]) => {
                    const relevantCatIds = catIds.filter((catId) => {
                      const arr = categoryServicesMap[catId] || [];
                      return arr.some((svc) => selectedServicesState[svc.id] != null);
                    });
                    if (relevantCatIds.length === 0) return null;

                    return (
                      <div key={secName} className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{secName}</h3>
                        {relevantCatIds.map((catId) => {
                          const catObj = ALL_CATEGORIES.find((c) => c.id === catId);
                          const catTitle = catObj ? catObj.title : catId;
                          const arr = categoryServicesMap[catId] || [];
                          const chosenServices = arr.filter((svc) => selectedServicesState[svc.id] != null);
                          if (chosenServices.length === 0) return null;

                          return (
                            <div key={catId} className="mb-4 ml-4">
                              <h4 className="text-lg font-medium text-gray-700 mb-2">{catTitle}</h4>
                              <ul className="space-y-2 pb-4">
                                {chosenServices.map((svc) => {
                                  const qty = selectedServicesState[svc.id] || 1;
                                  const cost = serviceCosts[svc.id] || 0;
                                  return (
                                    <li
                                      key={svc.id}
                                      className="grid grid-cols-3 gap-2 text-sm text-gray-600"
                                      style={{ gridTemplateColumns: "40% 30% 25%" }}
                                    >
                                      <span>{svc.title}</span>
                                      <span className="text-right">
                                        {qty} {svc.unit_of_measurement}
                                      </span>
                                      <span className="text-right">${formatWithSeparator(cost)}</span>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}

                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xl font-semibold text-gray-800">Subtotal:</span>
                    <span className="text-2xl font-semibold text-blue-600">
                      ${formatWithSeparator(calculateTotal())}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Address block */}
            <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden mt-6">
              <h2 className="text-2xl font-medium text-gray-800 mb-4">Address</h2>
              <p className="text-gray-500 text-medium">{address || "No address provided"}</p>
            </div>

            {/* Photos block */}
            <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden mt-6">
              <h2 className="text-2xl font-medium text-gray-800 mb-4">Uploaded Photos</h2>
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
              {photos.length === 0 && <p className="text-medium text-gray-500 mt-2">No photos uploaded</p>}
            </div>

            {/* Additional details */}
            <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden mt-6">
              <h2 className="text-2xl font-medium text-gray-800 mb-4">Additional details</h2>
              <p className="text-gray-500 text-medium whitespace-pre-wrap">{description || "No details provided"}</p>
            </div>

            {/* Recommended activities */}
            <RecommendedActivities
              selectedServicesState={selectedServicesState}
              onUpdateSelectedServicesState={setSelectedServicesState}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
            />
          </div>
        </div>
      </div>

      {/* Finishing-material modal if user clicks an item w/ image */}
      {showModalServiceId &&
        showModalSectionName &&
        finishingMaterialsMapAll[showModalServiceId] &&
        finishingMaterialsMapAll[showModalServiceId].sections[showModalSectionName] && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-[700px] h-[750px] overflow-hidden relative flex flex-col">
              {/* Sticky header */}
              <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-xl font-semibold">
                  Choose a finishing material (section {showModalSectionName})
                </h2>
                <button onClick={closeModal} className="text-red-500 border border-red-500 px-2 py-1 rounded">
                  Close
                </button>
              </div>

              {/* Info about currently selected finishing material */}
              {(() => {
                const currentSel = finishingMaterialSelections[showModalServiceId] || [];
                if (currentSel.length === 0) return null;
                const currentExtId = currentSel[0];
                const fmData = finishingMaterialsMapAll[showModalServiceId];
                if (!fmData) return null;

                // flatten all finishing materials in fmData.sections
                const allMats = Object.values(fmData.sections || {}).flat() as FinishingMaterial[];
                const curMat = allMats.find((x) => x.external_id === currentExtId);
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

              {/* Scrollable body */}
              <div className="overflow-auto p-4 flex-1">
                {(() => {
                  const data = finishingMaterialsMapAll[showModalServiceId];
                  if (!data) {
                    return <p className="text-sm text-gray-500">No data found</p>;
                  }

                  const arr = data.sections[showModalSectionName] || [];
                  if (!Array.isArray(arr) || arr.length === 0) {
                    return (
                      <p className="text-sm text-gray-500">
                        No finishing materials in section {showModalSectionName}
                      </p>
                    );
                  }

                  const curSel = finishingMaterialSelections[showModalServiceId] || [];
                  const currentExtId = curSel[0] || null;
                  let currentCost = 0;
                  if (currentExtId) {
                    const matObj = arr.find((m) => m.external_id === currentExtId);
                    if (matObj) {
                      currentCost = parseFloat(matObj.cost || "0") || 0;
                    }
                  }

                  return (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {arr.map((material, i) => {
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
                              finishingMaterialSelections[showModalServiceId!] = [material.external_id];
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
                              <p className={`text-xs mt-1 font-medium ${diffColor}`}>{diffStr}</p>
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