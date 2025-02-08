'use client';

import { ChevronDown } from 'lucide-react';

// Interface defining the props for the ServicesAccordion component
interface ServicesAccordionProps {
    serviceKey: string; // Key representing the unique identifier for the service
    service: {
        tools: string[]; // Array of tools required for completing the service
        steps: { step_number: number; title: string; description: string }[]; // Array of step objects with details
        activities: Record<string, { activity: string; unit_of_measurement: string }>; // Object mapping activities to their details
    };
    isSelected: boolean; // Indicates whether the accordion is currently selected/open
    onToggle: () => void; // Callback function to toggle the accordion's state
}

// Component to render a collapsible accordion for a single service
export default function ServicesAccordion({
    serviceKey,
    service,
    isSelected,
    onToggle,
}: ServicesAccordionProps) {
    return (
        <div className="border rounded-lg">
            {/* Header section of the accordion */}
            <button
                onClick={onToggle} // Toggle the accordion's open/close state
                className={`w-full p-4 flex justify-between items-center ${
                    isSelected ? 'bg-blue-100' : 'bg-gray-50 hover:bg-gray-100'
                }`}
            >
                <h3 className="font-medium text-md">{serviceKey}</h3> {/* Display the service's key as the title */}
                <ChevronDown
                    className={`transform transition-transform ${
                        isSelected ? 'rotate-180' : '' // Add rotation effect if the accordion is open
                    }`}
                />
            </button>

            {/* Content section of the accordion, rendered only if the accordion is selected */}
            {isSelected && (
                <div className="p-4 space-y-2">
                    {/* Section to display the list of tools */}
                    <h4 className="font-medium">Tools:</h4>
                    <ul className="list-disc pl-5">
                        {service.tools.map((tool, idx) => (
                            <li key={idx}>{tool}</li> // Render each tool in the list
                        ))}
                    </ul>

                    {/* Section to display the step-by-step instructions */}
                    <h4 className="font-medium mt-4">Steps:</h4>
                    <ol className="list-decimal pl-5">
                        {service.steps.map((step) => (
                            <li key={step.step_number}>
                                <strong>{step.title}:</strong> {step.description} {/* Render each step's title and description */}
                            </li>
                        ))}
                    </ol>
                </div>
            )}
        </div>
    );
}