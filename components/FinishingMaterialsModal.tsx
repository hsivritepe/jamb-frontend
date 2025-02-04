"use client";

import React from "react";
import type { FinishingMaterial } from "@/types/FinishingMaterial";

/**
 * Formats numeric values with commas and two decimals.
 * If you already have this function in the parent file, you can remove or replace it here.
 * Otherwise, keep it as is. Or pass it in as a prop from the parent if needed.
 */
function localFormatWithSeparator(value: number): string {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(
    value
  );
}

/**
 * Props for the FinishingMaterialsModal component.
 */
interface FinishingMaterialsModalProps {
  showModalServiceId: string | null;
  showModalSectionName: string | null;
  finishingMaterialsMapAll: Record<string, { sections: Record<string, FinishingMaterial[]> }>;
  finishingMaterialSelections: Record<string, Record<string, string>>;
  setFinishingMaterialSelections: React.Dispatch<
    React.SetStateAction<Record<string, Record<string, string>>>
  >;
  closeModal: () => void;
  userHasOwnMaterial: (serviceId: string, extId: string) => void;
  formatWithSeparator: (value: number) => string; // or use localFormatWithSeparator if you prefer
}

/**
 * A modal component that shows finishing materials to pick from.
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
  // If there's no valid serviceId or sectionName, or no data loaded, return null (no modal).
  if (
    !showModalServiceId ||
    !showModalSectionName ||
    !finishingMaterialsMapAll[showModalServiceId] ||
    !finishingMaterialsMapAll[showModalServiceId].sections[showModalSectionName]
  ) {
    return null;
  }

  // Rendering the modal if we have all needed data
  const picksObj = finishingMaterialSelections[showModalServiceId] || {};
  const currentExtId = picksObj[showModalSectionName] || null;
  const fmData = finishingMaterialsMapAll[showModalServiceId];

  // If no currentExtId or no data, we show minimal content
  if (!currentExtId || !fmData) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg w-[90vw] h-[90vh] md:w-[80vw] md:h-[80vh] xl:w-[70vw] xl:h-[70vh] overflow-hidden relative flex flex-col">
          {/* Sticky header */}
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
          <div className="overflow-auto p-4 flex-1">
            <p className="text-sm text-gray-500">No data found</p>
          </div>
        </div>
      </div>
    );
  }

  // Flatten all sections to find the "current" material object
  const allMats = Object.values(fmData.sections || {}).flat() as FinishingMaterial[];
  const curMat = allMats.find((x) => x.external_id === currentExtId) || null;
  const curCost = curMat ? parseFloat(curMat.cost || "0") || 0 : 0;

  // The array of materials we want to show in the modal
  const arr = fmData.sections[showModalSectionName] || [];
  // Find the base cost to show cost differences
  let currentBaseCost = 0;
  if (currentExtId) {
    const matObj = arr.find((m) => m.external_id === currentExtId);
    if (matObj) {
      currentBaseCost = parseFloat(matObj.cost || "0") || 0;
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-[90vw] h-[90vh] md:w-[80vw] md:h-[80vh] xl:w-[70vw] xl:h-[70vh] overflow-hidden relative flex flex-col">
        {/* Sticky header */}
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
        {curMat && (
          <div className="text-sm text-gray-600 border-b p-4 bg-white sticky top-[61px] z-10">
            Current material: <strong>{curMat.name}</strong> (
            ${formatWithSeparator(curCost)})
            <button
              onClick={() => userHasOwnMaterial(showModalServiceId, currentExtId)}
              className="ml-4 text-xs text-red-500 border border-red-500 px-2 py-1 rounded"
            >
              I have my own (Remove later)
            </button>
          </div>
        )}

        {/* Materials list */}
        <div className="overflow-auto p-4 flex-1">
          {(!Array.isArray(arr) || arr.length === 0) && (
            <p className="text-sm text-gray-500">
              No finishing materials in section {showModalSectionName}
            </p>
          )}

          {Array.isArray(arr) && arr.length > 0 && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              {arr.map((material, i) => {
                if (!material.image) return null;
                const costNum = parseFloat(material.cost || "0") || 0;
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

                return (
                  <div
                    key={`${material.external_id}-${i}`}
                    className={`border rounded p-3 flex flex-col items-center cursor-pointer ${
                      isSelected ? "border-blue-500" : "border-gray-300"
                    }`}
                    onClick={() => {
                      const serviceObj = finishingMaterialSelections[showModalServiceId] || {};
                      serviceObj[showModalSectionName] = material.external_id;
                      finishingMaterialSelections[showModalServiceId] = serviceObj;
                      setFinishingMaterialSelections({
                        ...finishingMaterialSelections,
                      });
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
          )}
        </div>
      </div>
    </div>
  );
}