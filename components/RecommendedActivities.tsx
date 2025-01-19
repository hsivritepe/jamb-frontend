"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useLocation } from "@/context/LocationContext";
import { ALL_SERVICES } from "@/constants/services";
import { servicesRecommendations } from "@/components/ServicesRecommendations";
import { setSessionItem } from "@/utils/session";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Helper: format a number with commas + two decimals. */
function formatWithSeparator(value: number): string {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(value);
}

/** Convert "1-1-1" => "1.1.1". */
function dashToDot(s: string): string {
  return s.replaceAll("-", ".");
}

/** Base API or fallback. */
function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://dev.thejamb.com";
}

/** POST /calculate => get cost for recommended. */
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

/** Simple image for recommended items. */
function ServiceImage({ serviceId }: { serviceId: string }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    const [firstSegment] = serviceId.split("-");
    const dot = dashToDot(serviceId);
    const src = `http://dev.thejamb.com/images/${firstSegment}/${dot}.jpg`;
    setImageSrc(src);
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

/**
 * RecommendedActivities:
 * - Gathers recommended items for each selected service.
 * - Shows them in pages of 2 with a fade transition.
 * - Input logic is never “uncontrolled” => we coalesce `undefined` to `null`.
 */
export default function RecommendedActivities({
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

  // 1) Build a map from each “origin” service to an array of recommended IDs.
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
      let recIds = Object.keys(recs).map((k) => k.replaceAll(".", "-"));

      // Exclude if already selected
      recIds = recIds.filter((rId) => selectedServicesState[rId] == null);
      out[originDash] = recIds;
    }
    return out;
  }, [selectedServicesState]);

  // 2) Flatten into an array of recommended items
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

      recIds.forEach((rDash) => {
        const recSvc = ALL_SERVICES.find((x) => x.id === rDash);
        if (!recSvc) return;

        const minQ = recSvc.min_quantity ?? 1;
        let recommendedQty = minQ;

        // If same unit => sync
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
      });
    }
    return arr;
  }, [originToRecommendedIds, selectedServicesState]);

  // recommendedQuantities => recId => number
  const [recommendedQuantities, setRecommendedQuantities] = useState<Record<string, number>>({});
  // manualRecInput => recId => string|null
  const [manualRecInput, setManualRecInput] = useState<Record<string, string | null>>({});
  // recommendedCosts => recId => number
  const [recommendedCosts, setRecommendedCosts] = useState<Record<string, number>>({});
  // fade transition
  const [isFading, setIsFading] = useState(false);

  // Initialize recommendedQuantities if missing
  useEffect(() => {
    const copy = { ...recommendedQuantities };
    let changed = false;
    for (const item of flatRecommended) {
      if (copy[item.recommendedId] == null) {
        copy[item.recommendedId] = item.recommendedQty;
        changed = true;
      }
    }
    if (changed) {
      setRecommendedQuantities(copy);
    }
  }, [flatRecommended, recommendedQuantities]);

  // Recompute cost whenever recommendedQuantities or location changes
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
            // ignore or handle error
          }
        })
      );
      setRecommendedCosts(nextCosts);
    })();
  }, [flatRecommended, recommendedQuantities, location]);

  /** + / - for recommended quantity */
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
    setManualRecInput((prev) => ({ ...prev, [recId]: null }));
  }

  /** typed recommended quantity input */
  function handleRecManualChange(recId: string, val: string, unit: string, minQ: number) {
    // Coalesce typed value to a string (never undefined)
    setManualRecInput((prev) => ({ ...prev, [recId]: val }));

    let numericVal = parseFloat(val.replace(/,/g, "")) || 0;
    if (numericVal < minQ) numericVal = minQ;

    setRecommendedQuantities((prev) => ({
      ...prev,
      [recId]: unit === "each" ? Math.round(numericVal) : numericVal,
    }));
  }

  /** If user leaves the field blank on blur => revert to numeric next render. */
  function handleRecBlur(recId: string) {
    if (manualRecInput[recId] === "") {
      setManualRecInput((prev) => ({ ...prev, [recId]: null }));
    }
  }

  function handleRecClick(recId: string) {
    // Clear to "" so user can type
    setManualRecInput((prev) => ({ ...prev, [recId]: "" }));
  }

  /** Add or remove a recommended item => update parent's selected state. */
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

      // If that rec's category isn't yet in left side => add it
      const catPrefix = recId.split("-").slice(0, 2).join("-");
      if (!selectedCategories.includes(catPrefix)) {
        const nextCats = [...selectedCategories, catPrefix];
        setSelectedCategories(nextCats);
        setSessionItem("services_selectedCategories", nextCats);
      }
    }
  }

  // Pagination => 2 items per page
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex >= flatRecommended.length) {
      setCurrentIndex(0);
    }
  }, [flatRecommended, currentIndex]);

  const pageItems = useMemo(() => {
    return flatRecommended.slice(currentIndex, currentIndex + 2);
  }, [flatRecommended, currentIndex]);

  function handlePrev() {
    if (currentIndex <= 0) return;
    setIsFading(true);
    setTimeout(() => {
      setCurrentIndex((prev) => prev - 2);
      setIsFading(false);
    }, 300);
  }

  function handleNext() {
    if (currentIndex + 2 >= flatRecommended.length) return;
    setIsFading(true);
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 2);
      setIsFading(false);
    }, 300);
  }

  if (flatRecommended.length === 0) {
    // no recommended
    return (
      <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden mt-6">
        <h2 className="text-2xl font-medium text-gray-800 mb-4">Maybe You Also Need</h2>
        <p className="text-md text-gray-500 mt-4">No additional recommendations</p>
      </div>
    );
  }

  // Render
  return (
    <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden mt-6">
      {/* Title / Pagination */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-medium text-gray-800">Maybe you also need</h2>
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

      <div
        className={`grid grid-cols-2 gap-4 transition-opacity duration-300 ${
          isFading ? "opacity-0" : "opacity-100"
        }`}
      >
        {pageItems.map((item) => {
          const costVal = recommendedCosts[item.recommendedId] || 0;
          // numeric fallback
          const numericVal = recommendedQuantities[item.recommendedId] ?? item.min_quantity;
          // typed or numeric => coalesced
          const typedVal = manualRecInput[item.recommendedId] ?? null;
          const displayVal = typedVal !== null ? typedVal : String(numericVal);

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

              {/* Quantity row */}
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
                  <span className="text-xs text-gray-600 ml-1">
                    {item.unit_of_measurement}
                  </span>
                </div>
              </div>

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