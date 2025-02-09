"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useLocation } from "@/context/LocationContext";
import { ALL_SERVICES } from "@/constants/services";
import { servicesRecommendations } from "@/components/ServicesRecommendations";
import { setSessionItem } from "@/utils/session";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Formats a number with commas and two decimals. */
function formatWithSeparator(value: number): string {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(
    value
  );
}

/** Convert "1-1-1" => "1.1.1". */
function dashToDot(s: string): string {
  return s.replaceAll("-", ".");
}

/** Base API or fallback. */
function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://dev.thejamb.com";
}

/**
 * POST /work/finishing_materials => fetch finishing materials for a given work_code.
 */
async function fetchFinishingMaterials(workCode: string) {
  const url = `${getApiBaseUrl()}/work/finishing_materials`;
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

/**
 * POST /calculate => compute labor+materials cost.
 */
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
    throw new Error(
      `Failed to calculate price (work_code=${params.work_code}).`
    );
  }
  return res.json();
}

/** A small image component for recommended items. */
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
 * - Gathers recommended items for each selected service
 * - Prevents duplicates
 * - Loads finishing materials, allows adjusting quantity, etc.
 *
 * On different screen widths:
 *   - < 768px: 1 card per page
 *   - 768px <= width < 1024px: 3 cards per page
 *   - 1024px <= width < 1280px: 4 cards per page
 *   - >= 1280px: 2 cards per page
 *
 * Also for desktop we keep max-w-[500px], for phone/tablet => w-full
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

  // origin -> recommended IDs
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

      // Exclude if user already selected them
      recIds = recIds.filter((rId) => selectedServicesState[rId] == null);
      out[originDash] = recIds;
    }
    return out;
  }, [selectedServicesState]);

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
    const used = new Set<string>();

    for (const [originId, recIds] of Object.entries(originToRecommendedIds)) {
      const originQty = selectedServicesState[originId] ?? 1;
      const originSvc = ALL_SERVICES.find((x) => x.id === originId);
      const originUnit = originSvc?.unit_of_measurement || "each";

      for (const rDash of recIds) {
        if (used.has(rDash)) continue;
        used.add(rDash);

        const recSvc = ALL_SERVICES.find((x) => x.id === rDash);
        if (!recSvc) continue;

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
      }
    }
    return arr;
  }, [originToRecommendedIds, selectedServicesState]);

  // finishing materials for recommended => recId => { sections: ... }
  const [
    recommendedFinishingMaterialsMap,
    setRecommendedFinishingMaterialsMap,
  ] = useState<Record<string, { sections: Record<string, any[]> }>>({});
  // finishingMaterialSelections => recId => string[]
  const [
    recommendedFinishingMaterialSelections,
    setRecommendedFinishingMaterialSelections,
  ] = useState<Record<string, string[]>>({});

  const [recommendedQuantities, setRecommendedQuantities] = useState<
    Record<string, number>
  >({});
  const [manualRecInput, setManualRecInput] = useState<
    Record<string, string | null>
  >({});
  const [recommendedCosts, setRecommendedCosts] = useState<
    Record<string, number>
  >({});
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

  // Load finishing materials
  useEffect(() => {
    async function loadAll() {
      const neededIds = flatRecommended.map((item) => item.recommendedId);

      await Promise.all(
        neededIds.map(async (recId) => {
          if (!recommendedFinishingMaterialsMap[recId]) {
            try {
              const dot = dashToDot(recId);
              const data = await fetchFinishingMaterials(dot);
              recommendedFinishingMaterialsMap[recId] = data;
            } catch (err) {
              console.error("Error fetching finishing materials:", recId, err);
            }
          }
        })
      );

      const newSelections = { ...recommendedFinishingMaterialSelections };
      let updated = false;

      for (const recId of neededIds) {
        if (!newSelections[recId]) {
          const fmData = recommendedFinishingMaterialsMap[recId];
          if (fmData?.sections) {
            const picks: string[] = [];
            for (const arr of Object.values(fmData.sections)) {
              if (Array.isArray(arr) && arr.length > 0) {
                picks.push(arr[0].external_id);
              }
            }
            newSelections[recId] = picks;
            updated = true;
          }
        }
      }
      if (updated) {
        setRecommendedFinishingMaterialSelections(newSelections);
      }

      setRecommendedFinishingMaterialsMap({
        ...recommendedFinishingMaterialsMap,
      });
    }

    if (flatRecommended.length > 0) {
      loadAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flatRecommended]);

  // Recompute recommendedCosts
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
            const finishingIds =
              recommendedFinishingMaterialSelections[recId] || [];

            const dot = dashToDot(recId);
            const resp = await calculatePrice({
              work_code: dot,
              zipcode: zip,
              unit_of_measurement: item.unit_of_measurement,
              square: qty,
              finishing_materials: finishingIds,
            });
            const labor = parseFloat(resp.work_cost) || 0;
            const mat = parseFloat(resp.material_cost) || 0;
            nextCosts[recId] = labor + mat;
          } catch (err) {
            // ignore
          }
        })
      );
      setRecommendedCosts(nextCosts);
    })();
  }, [
    flatRecommended,
    recommendedQuantities,
    recommendedFinishingMaterialSelections,
    location,
  ]);

  /** +/- quantity */
  function handleRecQuantityChange(
    recId: string,
    increment: boolean,
    unit: string,
    minQ: number
  ) {
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

  /** typed quantity */
  function handleRecManualChange(
    recId: string,
    val: string,
    unit: string,
    minQ: number
  ) {
    setManualRecInput((prev) => ({ ...prev, [recId]: val }));
    let numericVal = parseFloat(val.replace(/,/g, "")) || 0;
    if (numericVal < minQ) numericVal = minQ;

    setRecommendedQuantities((prev) => ({
      ...prev,
      [recId]: unit === "each" ? Math.round(numericVal) : numericVal,
    }));
  }

  function handleRecBlur(recId: string) {
    if (manualRecInput[recId] === "") {
      setManualRecInput((prev) => ({ ...prev, [recId]: null }));
    }
  }

  function handleRecClick(recId: string) {
    setManualRecInput((prev) => ({ ...prev, [recId]: "" }));
  }

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

      // add category if missing
      const catPrefix = recId.split("-").slice(0, 2).join("-");
      if (!selectedCategories.includes(catPrefix)) {
        const nextCats = [...selectedCategories, catPrefix];
        setSelectedCategories(nextCats);
        setSessionItem("services_selectedCategories", nextCats);
      }
    }
  }

  /**
   * Items per page logic:
   *   - phone (<768px): 1
   *   - iPad mini range (768 <= width < 1024): 3
   *   - bigger tablets (1024 <= width < 1280): 4
   *   - desktop (>=1280px): 2
   */
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(1); // default phone = 1

  useEffect(() => {
    if (typeof window !== "undefined") {
      const screenWidth = window.innerWidth;
      if (screenWidth < 768) {
        setItemsPerPage(1); // phone
      } else if (screenWidth < 1024) {
        setItemsPerPage(3); // iPad Mini range
      } else if (screenWidth < 1280) {
        setItemsPerPage(4); // bigger tablets
      } else {
        setItemsPerPage(2); // desktop
      }
    }
  }, []);

  useEffect(() => {
    if (currentIndex >= flatRecommended.length) {
      setCurrentIndex(0);
    }
  }, [flatRecommended, currentIndex]);

  const pageItems = useMemo(() => {
    return flatRecommended.slice(currentIndex, currentIndex + itemsPerPage);
  }, [flatRecommended, currentIndex, itemsPerPage]);

  function handlePrev() {
    if (currentIndex <= 0) return;
    setIsFading(true);
    setTimeout(() => {
      setCurrentIndex((prev) => prev - itemsPerPage);
      setIsFading(false);
    }, 300);
  }

  function handleNext() {
    if (currentIndex + itemsPerPage >= flatRecommended.length) return;
    setIsFading(true);
    setTimeout(() => {
      setCurrentIndex((prev) => prev + itemsPerPage);
      setIsFading(false);
    }, 300);
  }

  // If no recommended => show "No additional recommendations"
  if (flatRecommended.length === 0) {
    return (
      <div
        className="
          ml-auto
          bg-brand-light
          p-4
          rounded-lg
          border
          border-gray-300
          overflow-hidden
          mt-6
          w-full
          xl:max-w-[500px]
        "
      >
        <h2 className="text-2xl font-bold sm:font-medium text-gray-800 mb-4">
          Maybe You Also Need
        </h2>
        <p className="text-md text-gray-500 mt-4">
          No additional recommendations
        </p>
      </div>
    );
  }

  // Container: w-full on phone/tablet, max-w-[500px] on desktop
  return (
    <div
      className="
        ml-auto
        bg-brand-light
        p-4
        rounded-lg
        border
        border-gray-300
        overflow-hidden
        mt-6
        w-full
        xl:max-w-[500px]
      "
    >
      {/* Title / Pagination */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold sm:font-medium text-gray-800">
          Maybe You Also Need
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`p-2 rounded border transition-colors ${
              currentIndex === 0
                ? "text-gray-300 border-gray-200"
                : "text-black border-gray-400"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex + itemsPerPage >= flatRecommended.length}
            className={`p-2 rounded border transition-colors ${
              currentIndex + itemsPerPage >= flatRecommended.length
                ? "text-gray-300 border-gray-200"
                : "text-black border-gray-400"
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid layout based on itemsPerPage */}
      <div
        className={`
          transition-opacity 
          duration-300 
          ${isFading ? "opacity-0" : "opacity-100"} 
          grid 
          gap-4
          ${
            itemsPerPage === 1
              ? "grid-cols-1"
              : itemsPerPage === 2
              ? "grid-cols-2"
              : itemsPerPage === 3
              ? "grid-cols-3"
              : "grid-cols-4"
          }
        `}
      >
        {pageItems.map((item) => {
          const recId = item.recommendedId;
          const costVal = recommendedCosts[recId] || 0;
          const numeric = recommendedQuantities[recId] ?? item.min_quantity;
          const typedVal = manualRecInput[recId] ?? null;
          const displayVal = typedVal !== null ? typedVal : String(numeric);

          const isSelected = selectedServicesState[recId] != null;

          return (
            <div
              key={`${item.originId}-${recId}`}
              className="
    bg-white
    border
    border-gray-200
    rounded
    shadow-sm
    flex
    flex-col
    h-[350px]
    overflow-hidden
  "
            >
              {/* Full-width image at the top */}
              <div className="w-full h-40 overflow-hidden">
                <ServiceImage serviceId={recId} />
              </div>

              {/* Card content with padding, using flex-col to separate top vs. bottom */}
              <div className="flex-1 p-4 flex flex-col">
                <h4 className="text-medium font-semibold text-gray-800 mt-0 line-clamp-2">
                  {item.title}
                </h4>
                {item.description && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                )}

                {/* Place quantity controls + cost row at the bottom */}
                <div className="mt-auto">
                  {/* Quantity controls */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        handleRecQuantityChange(
                          recId,
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
                      onClick={() => handleRecClick(recId)}
                      onBlur={() => handleRecBlur(recId)}
                      onChange={(e) =>
                        handleRecManualChange(
                          recId,
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
                          recId,
                          true,
                          item.unit_of_measurement,
                          item.min_quantity
                        )
                      }
                      className="w-8 h-8 bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg rounded"
                    >
                      +
                    </button>
                    <span className="text-sm text-gray-600 ml-1">
                      {item.unit_of_measurement}
                    </span>
                  </div>

                  {/* Cost + Add/Remove */}
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-medium text-blue-600 font-bold">
                      ${formatWithSeparator(costVal)}
                    </span>
                    <button
                      onClick={() =>
                        handleAddRecommended(recId, item.min_quantity)
                      }
                      className={`text-sm font-semibold px-3 py-1 rounded ${
                        isSelected
                          ? "bg-red-600 text-white hover:bg-red-700"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {isSelected ? "Remove" : "Add"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
