'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import BreadCrumb from '@/components/ui/BreadCrumb';
import Button from '@/components/ui/Button';
import { SectionBoxTitle } from '@/components/ui/SectionBoxTitle';
import { EMERGENCY_STEPS } from '@/constants/navigation';
import { EMERGENCY_SERVICES } from '@/constants/emergency';
import { ALL_SERVICES } from '@/constants/services';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

// Utility function to transform text
const capitalizeAndTransform = (text: string): string => {
  return text
    .replace(/([A-Z])/g, ' $1') // Add spaces before capital letters
    .trim() // Remove extra spaces
    .replace(/^./, (char) => char.toUpperCase()); // Capitalize the first letter
};

// Utility function to format numbers with thousand separators
const formatWithSeparator = (value: number): string => {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(value);
};

export default function EmergencyDetails() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set());
  const [selectedActivities, setSelectedActivities] = useState<Record<string, Record<string, number>>>({});
  const [expandedActivityDetails, setExpandedActivityDetails] = useState<string | null>(null);

  const selectedServices: Record<string, string[]> = searchParams.get('services')
    ? JSON.parse(searchParams.get('services') as string)
    : {};

  const handleToggleExpand = (service: string) => {
    setExpandedServices((prev) => {
      const updated = new Set(prev);
      if (updated.has(service)) updated.delete(service);
      else updated.add(service);
      return updated;
    });
  };

  const handleActivityToggle = (service: string, activity: string) => {
    setSelectedActivities((prev) => {
      const serviceActivities = prev[service] || {};
      if (serviceActivities[activity]) {
        const updatedActivities = { ...serviceActivities };
        delete updatedActivities[activity];
        return { ...prev, [service]: updatedActivities };
      } else {
        return {
          ...prev,
          [service]: { ...serviceActivities, [activity]: 1 },
        };
      }
    });
    setExpandedActivityDetails((prev) => (prev === activity ? null : activity));
  };

  const handleQuantityChange = (service: string, activity: string, increment: boolean) => {
    setSelectedActivities((prev) => ({
      ...prev,
      [service]: {
        ...prev[service],
        [activity]: Math.max(1, (prev[service]?.[activity] || 1) + (increment ? 1 : -1)),
      },
    }));
  };

  const handleManualQuantityChange = (service: string, activity: string, value: string) => {
    const numericValue = parseFloat(value.replace(/,/g, '')) || 1;
    setSelectedActivities((prev) => ({
      ...prev,
      [service]: {
        ...prev[service],
        [activity]: numericValue,
      },
    }));
  };

  const handleClearSelection = () => {
    setSelectedActivities({});
    setExpandedActivityDetails(null);
  };

  const handleNext = () => {
    router.push('/emergency/estimate');
  };

  const servicesList = Object.entries(selectedServices).flatMap(([category, services]) =>
    services.map((service) => ({
      service,
      category,
      activities: EMERGENCY_SERVICES[category]?.services[service]?.activities || {},
    }))
  );

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto">
        <BreadCrumb items={EMERGENCY_STEPS} />

        {/* Header and Next Button */}
        <div className="flex justify-between items-start mt-8">
          <SectionBoxTitle>Details</SectionBoxTitle>
          <Button onClick={handleNext}>Next →</Button>
        </div>

        {/* No Service / Clear */}
        <div className="flex justify-between items-center text-sm text-gray-500 mt-8 w-full max-w-[550px]">
          <span>
            No service?{' '}
            <a href="#" className="text-blue-600 hover:underline focus:outline-none">
              Contact emergency support
            </a>
          </span>
          <button onClick={handleClearSelection} className="text-blue-600 hover:underline focus:outline-none">
            Clear
          </button>
        </div>

        {/* Render Selected Services */}
        <div className="flex flex-col gap-4 mt-8 w-full max-w-[550px]">
          {servicesList.map(({ service, category, activities }, index) => {
            const serviceLabel = capitalizeAndTransform(service);
            const isExpanded = expandedServices.has(service);

            return (
              <div key={index} className="p-4 border rounded-xl bg-white border-gray-300">
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => handleToggleExpand(service)}
                >
                  <span className="text-2xl font-medium text-gray-800">{serviceLabel}</span>
                  <ChevronDown
                    className={`w-5 h-5 transform transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                {isExpanded && (
                  <div className="mt-4 flex flex-col gap-4">
                    {Object.entries(activities).map(([activityKey, activityData]) => {
                      const isSelected = selectedActivities[service]?.[activityKey] !== undefined;
                      const activityLabel = capitalizeAndTransform(activityData.activity);
                      const activityDetails = ALL_SERVICES.find((s) => s.id === activityKey);

                      return (
                        <div key={activityKey} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-lg text-gray-800">{activityLabel}</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleActivityToggle(service, activityKey)}
                                className="sr-only peer"
                              />
                              <div className="w-[50px] h-[26px] bg-gray-300 rounded-full peer-checked:bg-[#1948F0] transition-colors duration-300"></div>
                              <div className="absolute top-[2px] left-[2px] w-[22px] h-[22px] bg-white rounded-full shadow-md peer-checked:translate-x-[24px] transform transition-transform duration-300"></div>
                            </label>
                          </div>
                          {isSelected && activityDetails && (
                            <div className="flex flex-col gap-2">
                              <p className="text-sm text-gray-500 pr-16 pb-2">{activityDetails.description}</p>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center border rounded-lg gap-2">
                                  <button
                                    onClick={() => handleQuantityChange(service, activityKey, false)}
                                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-l-lg"
                                  >
                                    −
                                  </button>
                                  <input
                                    type="text"
                                    value={formatWithSeparator(selectedActivities[service][activityKey])}
                                    onChange={(e) =>
                                      handleManualQuantityChange(service, activityKey, e.target.value)
                                    }
                                    className="w-20 text-center px-2"
                                    placeholder="1"
                                  />
                                  <button
                                    onClick={() => handleQuantityChange(service, activityKey, true)}
                                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-r-lg"
                                  >
                                    +
                                  </button>
                                </div>
                                <span className="text-sm text-gray-600">
                                  {activityDetails.unit_of_measurement}
                                </span>
                                <span className="text-lg text-gray-600 font-medium text-right">
                                  ${formatWithSeparator(
                                    activityDetails.price * selectedActivities[service][activityKey]
                                  )}
                                </span>
                              </div>
                            </div>
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
    </main>
  );
}