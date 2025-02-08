"use client";

import React, { useState, MouseEvent } from "react";
import type { FinishingMaterial } from "@/types/FinishingMaterial";

/** Converts an integer to an ordinal like "1st", "2nd", "3rd". */
function toOrdinal(num: number): string {
  if (num === 1) return "1st";
  if (num === 2) return "2nd";
  if (num === 3) return "3rd";
  return `${num}th`;
}

/** Helper to parse a cost string that may contain commas (e.g. "1,962"). */
function parseCostString(costStr: string | undefined): number {
  if (!costStr) return 0;
  // Remove commas before parsing
  const cleaned = costStr.replace(/,/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/** Props for the FinishingMaterialsModal component. */
interface FinishingMaterialsModalProps {
  showModalServiceId: string | null;
  showModalSectionName: string | null;
  finishingMaterialsMapAll: Record<
    string,
    { sections: Record<string, FinishingMaterial[]> }
  >;
  finishingMaterialSelections: Record<string, Record<string, string>>;
  setFinishingMaterialSelections: React.Dispatch<
    React.SetStateAction<Record<string, Record<string, string>>>
  >;
  closeModal: () => void;
  userHasOwnMaterial: (serviceId: string, extId: string) => void;
  formatWithSeparator: (value: number) => string;
}

/**
 * A modal component to pick finishing materials or equipment.
 * Adapts to screen sizes:
 * - On mobile/tablet => full-screen overlay
 * - On desktop => pinned to the right at 2/3 width and full height
 *   with a 3 or 4-column grid for materials
 *
 * Now also closes on click outside (backdrop) if screen ≥ 1024px.
 */
export default function FinishingMaterialsModal({
  showModalServiceId,
  showModalSectionName,
  finishingMaterialsMapAll,
  finishingMaterialSelections,
  setFinishingMaterialSelections,
  closeModal,
  userHasOwnMaterial,
  formatWithSeparator,
}: FinishingMaterialsModalProps) {
  // Early return if data is invalid
  if (
    !showModalServiceId ||
    !showModalSectionName ||
    !finishingMaterialsMapAll[showModalServiceId] ||
    !finishingMaterialsMapAll[showModalServiceId].sections[showModalSectionName]
  ) {
    return null;
  }

  // Convert sectionName to an ordinal if numeric (e.g. "1" => "1st")
  let sectionOrdinalStr = showModalSectionName;
  {
    const parsed = parseInt(showModalSectionName, 10);
    if (!isNaN(parsed) && parsed > 0) {
      sectionOrdinalStr = toOrdinal(parsed);
    }
  }

  const serviceId = showModalServiceId;
  const sectionName = showModalSectionName;

  // Finishing materials data
  const fmData = finishingMaterialsMapAll[serviceId];
  const picksObj = finishingMaterialSelections[serviceId] || {};
  const currentExtId = picksObj[sectionName] || null;

  // If nothing is selected or no data
  if (!currentExtId || !fmData) {
    return (
      <div
        className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
        // Desktop click-outside check
        onClick={(e: MouseEvent<HTMLDivElement>) => {
          // Only close if user clicked the backdrop (not a child)
          // AND if screen width is >= 1024px
          if (
            e.target === e.currentTarget &&
            typeof window !== "undefined" &&
            window.innerWidth >= 1024
          ) {
            closeModal();
          }
        }}
      >
        <div className="bg-white w-full h-full lg:w-2/3 lg:h-screen lg:fixed lg:top-0 lg:right-0 overflow-hidden relative flex flex-col">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
            <h2 className="text-xl font-semibold">
              Choose {sectionOrdinalStr} finishing material or equipment
            </h2>
            <button
              onClick={closeModal}
              className="text-gray-700 hover:text-red-500 px-2 py-1"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
          <div className="overflow-auto p-4 flex-1">
            <p className="text-sm text-gray-500">No data found</p>
          </div>
        </div>
      </div>
    );
  }

  // Flatten sections
  const allMats = Object.values(fmData.sections || {}).flat() as FinishingMaterial[];
  const curMat = allMats.find((x) => x.external_id === currentExtId) || null;
  // Fix: parse cost with commas removed
  const curCost = parseCostString(curMat?.cost);

  // Determine base cost of the currently selected
  const arr = fmData.sections[sectionName] || [];
  let currentBaseCost = 0;
  const foundMat = arr.find((m) => m.external_id === currentExtId);
  if (foundMat) {
    currentBaseCost = parseCostString(foundMat.cost);
  }

  // Lightbox for zoom
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  function handleImageClick(imageUrl: string) {
    setZoomedImage((old) => (old === imageUrl ? null : imageUrl));
  }

  // Handler for backdrop click (desktop-only)
  function handleBackdropClick(e: MouseEvent<HTMLDivElement>) {
    // If user clicked the exact backdrop AND is on desktop (≥1024px), close
    if (
      e.target === e.currentTarget &&
      typeof window !== "undefined" &&
      window.innerWidth >= 1024
    ) {
      closeModal();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex bg-black/40"
      onClick={handleBackdropClick}
    >
      {/* Main container => pinned on desktop */}
      <div className="bg-white w-full h-full lg:w-2/3 lg:h-screen lg:ml-auto overflow-hidden relative flex flex-col">
        {/* Sticky header with "Choose nth material/equipment" */}
        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold">
            Choose {sectionOrdinalStr} material/equipment
          </h2>
          <button
            onClick={closeModal}
            className="text-gray-700 hover:text-red-500 px-2 py-1"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {curMat && (
          <div
            className="
              border-b bg-white z-10 sticky top-[52px]
              px-4 py-2
              flex flex-col gap-1
              sm:flex-row sm:items-center
            "
          >
            {/* 1) Name => up to 2 lines, left aligned */}
            <div className="flex-1 overflow-hidden pr-3">
              <div
                className="
                  text-md font-semibold text-gray-700 
                  line-clamp-2 leading-tight text-left
                "
                title={curMat.name}
              >
                {curMat.name}
              </div>
            </div>

            {/* 2) On mobile => next line with price & button separated by "justify-between" */}
            <div className="w-full sm:w-auto flex justify-between items-center">
              {/* bigger bold price */}
              <div className="mr-2 text-xl font-bold text-gray-800">
                ${formatWithSeparator(curCost)}
              </div>
              {/* "I have my own" button */}
              <button
                onClick={() => userHasOwnMaterial(serviceId, currentExtId)}
                className="
                  text-xs px-2 py-1 rounded border border-red-500 text-red-500
                  hover:bg-red-500 hover:text-white
                  active:bg-red-600
                "
              >
                I have my own
              </button>
            </div>
          </div>
        )}

        {/* Scrollable => all materials */}
        <div className="overflow-auto p-4 flex-1">
          {(!Array.isArray(arr) || arr.length === 0) && (
            <p className="text-sm text-gray-500">
              No materials in this section
            </p>
          )}

          {Array.isArray(arr) && arr.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
              {arr.map((material, i) => {
                if (!material.image) return null;

                // Fix: parse with commas removed
                const costNum = parseCostString(material.cost);
                const isSelected = currentExtId === material.external_id;
                const diff = costNum - currentBaseCost;
                let diffStr = "";
                let diffColor = "";
                if (diff > 0) {
                  diffStr = `+${formatWithSeparator(diff)}`;
                  diffColor = "text-red-500";
                } else if (diff < 0) {
                  diffStr = `-${formatWithSeparator(Math.abs(diff))}`;
                  diffColor = "text-green-600";
                }

                function handleSelectClick() {
                  const serviceObj =
                    finishingMaterialSelections[serviceId] || {};
                  serviceObj[sectionName] = material.external_id;
                  finishingMaterialSelections[serviceId] = serviceObj;
                  setFinishingMaterialSelections({
                    ...finishingMaterialSelections,
                  });
                }

                return (
                  <div
                    key={`${material.external_id}-${i}`}
                    className={`
                      border rounded flex flex-col
                      min-h-[300px] sm:min-h-[320px]
                      ${isSelected ? "border-red-600" : "border-gray-300"}
                    `}
                  >
                    {/* Image at the top without padding */}
                    <div
                      className="w-full overflow-hidden cursor-pointer"
                      onClick={() => handleImageClick(material.image!)}
                    >
                      <img
                        src={material.image}
                        alt={material.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Padded content below the image */}
                    <div className="flex-1 p-2 sm:p-4 flex flex-col">
                      {/* Name */}
                      <h3
                        className="mt-2 text-sm text-left text-gray-800 line-clamp-3 sm:line-clamp-4 leading-snug"
                        title={material.name}
                      >
                        {material.name}
                      </h3>

                      {/* Bottom section holds price + diff and the "Select" button */}
                      <div className="mt-auto">
                        {/* Price row */}
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-base font-bold text-gray-800">
                            ${formatWithSeparator(costNum)}
                          </span>
                          {diff !== 0 && (
                            <span
                              className={`text-sm sm:text-base font-normal ${diffColor}`}
                            >
                              {diffStr}
                            </span>
                          )}
                        </div>

                        {/* Select button */}
                        <button
                          onClick={handleSelectClick}
                          className={`
                            w-full
                            px-3 py-2 text-sm font-semibold rounded
                            ${
                              isSelected
                                ? "bg-red-500 text-white"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                            }
                          `}
                        >
                          {isSelected ? "Selected" : "Select"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox if zoomed */}
      {zoomedImage && (
        <div
          className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center cursor-pointer"
          onClick={() => setZoomedImage(null)}
        >
          <img
            src={zoomedImage}
            alt="Zoomed"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
}