"use client";

import React, { useState, useEffect } from "react";

/** Props for the SurfaceCalculatorModal. */
interface SurfaceCalculatorModalProps {
  /** Whether to show the modal. If false => return null. */
  show: boolean;
  /** Callback to close the modal without saving. */
  onClose: () => void;
  /** Current service ID, so we know where to apply the result. May be null if none selected. */
  serviceId: string | null;
  /** Function to apply the chosen square footage into the "quantity" field for that service. */
  onApplySquareFeet: (serviceId: string, sqFeet: number) => void;
}

/**
 * A modal that helps the user calculate surface area in sq ft,
 * either from length x width or from an already known area in sq meters, etc.
 */
export default function SurfaceCalculatorModal({
  show,
  onClose,
  serviceId,
  onApplySquareFeet,
}: SurfaceCalculatorModalProps) {
  // If show is false, do not render the modal
  if (!show) {
    return null;
  }

  // We can skip checking serviceId in the return statement and instead do it right before calling onApplySquareFeet.

  // States for the units system, length, width, and known area (in m²)
  const [system, setSystem] = useState<"ft" | "m">("ft");
  const [lengthVal, setLengthVal] = useState<string>("");
  const [widthVal, setWidthVal] = useState<string>("");
  const [squareMeters, setSquareMeters] = useState<string>("");

  function computeSqFt(): number {
    const lengthNum = parseFloat(lengthVal) || 0;
    const widthNum = parseFloat(widthVal) || 0;
    if (system === "m") {
      // Convert area from m^2 to ft^2
      return lengthNum * widthNum * 10.7639;
    } else {
      // system = "ft"
      return lengthNum * widthNum;
    }
  }

  function computeSqFtFromSquareMeters(): number {
    const sqM = parseFloat(squareMeters) || 0;
    return sqM * 10.7639;
  }

  const mainArea = computeSqFt();
  const altArea = computeSqFtFromSquareMeters();

  function handleApplyClick() {
    // If serviceId is indeed null => simply close
    if (!serviceId) {
      onClose();
      return;
    }

    let finalVal = altArea;
    if (!squareMeters.trim()) {
      finalVal = mainArea;
    }
    if (finalVal < 1) {
      finalVal = 1;
    }
    // Now TypeScript knows serviceId is a string
    onApplySquareFeet(serviceId, Math.round(finalVal));
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-md rounded-md overflow-hidden relative p-4">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-2 mb-3">
          <h2 className="text-xl font-semibold text-gray-800">
            Surface Area Calculator
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 px-2"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Short instructions */}
        <p className="text-sm text-gray-600 mb-4">
          Measure length and width of your surface in meters or feet, or just
          enter known square meters, then convert to sq ft automatically.
        </p>

        {/* System toggle */}
        <div className="mb-4">
          <span className="text-sm font-medium text-gray-700 mr-3">
            Units for length/width:
          </span>
          <button
            onClick={() => setSystem("ft")}
            className={`px-3 py-1 border rounded-l ${
              system === "ft"
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300"
            }`}
          >
            ft
          </button>
          <button
            onClick={() => setSystem("m")}
            className={`px-3 py-1 border rounded-r ${
              system === "m"
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300"
            }`}
          >
            m
          </button>
        </div>

        {/* length x width row */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">Length</label>
            <input
              type="number"
              className="w-full border rounded px-2 py-1"
              placeholder={`0 (${system})`}
              value={lengthVal}
              onChange={(e) => setLengthVal(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">Width</label>
            <input
              type="number"
              className="w-full border rounded px-2 py-1"
              placeholder={`0 (${system})`}
              value={widthVal}
              onChange={(e) => setWidthVal(e.target.value)}
            />
          </div>
        </div>

        {/* Display result in sq ft */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Estimated area:{" "}
            <span className="font-semibold text-gray-800">
              {Math.round(mainArea)} sq ft
            </span>
          </p>
        </div>

        {/* Alternatively, user can type known sq meters */}
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">
            Or known area in square meters:
          </label>
          <input
            type="number"
            className="w-full border rounded px-2 py-1"
            placeholder="0 m²"
            value={squareMeters}
            onChange={(e) => setSquareMeters(e.target.value)}
          />
          {squareMeters.trim() && (
            <p className="text-sm text-gray-600 mt-1">
              = {Math.round(altArea)} sq ft
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApplyClick}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}