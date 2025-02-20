"use client";

import { ChevronDown } from "lucide-react";

interface ServicesAccordionProps {
  serviceKey: string;
  service: {
    tools: string[];
    steps: { step_number: number; title: string; description: string }[];
    activities: Record<string, { activity: string; unit_of_measurement: string }>;
  };
  isSelected: boolean;
  onToggle: () => void;
}

export default function ServicesAccordion({
  serviceKey,
  service,
  isSelected,
  onToggle,
}: ServicesAccordionProps) {
  return (
    <div className="border rounded-lg">
      {/* Header */}
      <button
        onClick={onToggle}
        className={`w-full p-4 flex justify-between items-center ${
          isSelected ? "bg-blue-100" : "bg-gray-50 hover:bg-gray-100"
        }`}
      >
        <h3 className="font-medium text-md">{serviceKey}</h3>
        <ChevronDown
          className={`transform transition-transform ${isSelected ? "rotate-180" : ""}`}
        />
      </button>
      {/* Body */}
      {isSelected && (
        <div className="p-4 space-y-2">
          <h4 className="font-medium">Tools:</h4>
          <ul className="list-disc pl-5">
            {service.tools.map((tool, idx) => (
              <li key={idx}>{tool}</li>
            ))}
          </ul>
          <h4 className="font-medium mt-4">Steps:</h4>
          <ol className="list-decimal pl-5">
            {service.steps.map((step) => (
              <li key={step.step_number}>
                <strong>{step.title}:</strong> {step.description}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}