"use client";

export const dynamic = "force-dynamic";
import React from "react";
import { formatWithSeparator } from "@/utils/format";

interface PaymentOptionPanelProps {
  /**
   * The base labor cost (before any discount).
   */
  laborSubtotal: number;

  /**
   * The total materials (and equipment) cost.
   */
  materialsSubtotal: number;

  /**
   * Currently selected payment label, e.g. "Quarterly".
   */
  selectedOption: string | null;

  /**
   * Called when user picks a new payment method => parent adjusts coefficient.
   */
  onConfirm: (optionLabel: string, coefficient: number) => void;
}

export default function PaymentOptionPanel({
  laborSubtotal,
  materialsSubtotal,
  selectedOption,
  onConfirm,
}: PaymentOptionPanelProps) {
  const options = [
    {
      label: "100% Prepayment",
      description: "Pay everything upfront and get a 15% discount (labor only).",
      coefficient: 0.85,
    },
    {
      label: "Quarterly",
      description: "Pay every 3 months and get an 8% discount (labor only).",
      coefficient: 0.92,
    },
    {
      label: "Monthly",
      description: "Pay monthly (no discount on labor).",
      coefficient: 1.0,
    },
  ];

  return (
    <div className="w-full xl:w-[500px] bg-white border border-gray-300 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold sm:font-semibold text-gray-800">
          Payment Option
        </h2>
      </div>

      <p className="text-gray-600 mb-4">
        Choose how you want to pay. 
        <br />
        The discount or surcharge is <strong>only</strong> applied to labor.
      </p>

      <div className="space-y-4">
        {options.map((opt) => {
          const isSelected = selectedOption === opt.label;

          // Calculate final labor cost, fees, and new subtotal for this option:
          const finalLabor = laborSubtotal * opt.coefficient;
          const serviceFeeOnLabor = finalLabor * 0.15; 
          const serviceFeeOnMaterials = materialsSubtotal * 0.05; 
          const newSubtotal =
            finalLabor + materialsSubtotal + serviceFeeOnLabor + serviceFeeOnMaterials;

          return (
            <div
              key={opt.label}
              className={`p-3 border rounded-lg flex flex-col gap-2 transition-colors
                ${
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 bg-white"
                }`}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold sm:font-semibold text-gray-800">
                  {opt.label}
                </h3>
              </div>
              <p className="text-sm text-gray-500">{opt.description}</p>

              <p className="text-sm text-gray-700 mt-1">
                <strong>Labor Cost:</strong>{" "}
                <span className="text-blue-600 font-medium">
                  ${formatWithSeparator(finalLabor)}
                </span>
                <span className="ml-2 text-gray-500">
                  (was ${formatWithSeparator(laborSubtotal)})
                </span>
              </p>
              <p className="text-sm text-gray-700">
                <strong>New Subtotal:</strong>{" "}
                <span className="font-medium text-blue-600">
                  ${formatWithSeparator(newSubtotal)}
                </span>
              </p>

              <button
                onClick={() => onConfirm(opt.label, opt.coefficient)}
                className={`mt-2 px-3 py-2 text-sm font-semibold sm:font-medium rounded transition-colors ${
                  isSelected
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isSelected ? "Selected" : "Select"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}