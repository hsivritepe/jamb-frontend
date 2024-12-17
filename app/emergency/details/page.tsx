"use client";

import { useRouter, useSearchParams } from "next/navigation";
import BreadCrumb from "@/components/ui/BreadCrumb";
import Button from "@/components/ui/Button";
import { SectionBoxTitle } from "@/components/ui/SectionBoxTitle";
import { SectionBoxSubtitle } from "@/components/ui/SectionBoxSubtitle";
import { EMERGENCY_STEPS } from "@/constants/navigation";
import { EMERGENCY_SERVICES } from "@/constants/emergency";
import { ALL_SERVICES } from "@/constants/services";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

// Utility function to transform text
const capitalizeAndTransform = (text: string): string => {
  return text
    .replace(/([A-Z])/g, " $1") // Add spaces before capital letters
    .trim() // Remove extra spaces
    .replace(/^./, (char) => char.toUpperCase()); // Capitalize the first letter
};

// Utility function to format numbers with thousand separators
const formatWithSeparator = (value: number): string => {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(
    value
  );
};

export default function EmergencyDetails() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [expandedServices, setExpandedServices] = useState<Set<string>>(
    new Set()
  );
  const [selectedActivities, setSelectedActivities] = useState<
    Record<string, Record<string, number>>
  >({});
  const [manualInputValue, setManualInputValue] = useState<
    Record<string, Record<string, string | null>>
  >({});

  const selectedServices: Record<string, string[]> = searchParams.get(
    "services"
  )
    ? JSON.parse(searchParams.get("services") as string)
    : {};

  const handleToggleExpand = (service: string) => {
    setExpandedServices((prev) => {
      const updated = new Set(prev);
      if (updated.has(service)) updated.delete(service);
      else updated.add(service);
      return updated;
    });
  };

  const handleActivityToggle = (service: string, activityKey: string) => {
    setSelectedActivities((prev) => {
      const serviceActivities = prev[service] || {};
      if (serviceActivities[activityKey]) {
        const updatedActivities = { ...serviceActivities };
        delete updatedActivities[activityKey];
        return { ...prev, [service]: updatedActivities };
      } else {
        return {
          ...prev,
          [service]: { ...serviceActivities, [activityKey]: 1 },
        };
      }
    });
    setManualInputValue((prev) => ({
      ...prev,
      [service]: { ...prev[service], [activityKey]: null },
    }));
  };

  const handleQuantityChange = (
    service: string,
    activityKey: string,
    increment: boolean,
    unit: string
  ) => {
    setSelectedActivities((prev) => {
      const currentValue = prev[service]?.[activityKey] || 1;
      const updatedValue = increment
        ? currentValue + 1
        : Math.max(1, currentValue - 1);

      return {
        ...prev,
        [service]: {
          ...prev[service],
          [activityKey]:
            unit === "each" ? Math.round(updatedValue) : updatedValue,
        },
      };
    });
    setManualInputValue((prev) => ({
      ...prev,
      [service]: { ...prev[service], [activityKey]: null },
    }));
  };

  const handleManualQuantityChange = (
    service: string,
    activityKey: string,
    value: string,
    unit: string
  ) => {
    const numericValue = parseFloat(value.replace(/,/g, "")) || 0;

    setManualInputValue((prev) => ({
      ...prev,
      [service]: { ...prev[service], [activityKey]: value },
    }));

    if (!isNaN(numericValue)) {
      setSelectedActivities((prev) => ({
        ...prev,
        [service]: {
          ...prev[service],
          [activityKey]:
            unit === "each" ? Math.round(numericValue) : numericValue,
        },
      }));
    }
  };

  const handleBlurInput = (service: string, activityKey: string) => {
    if (!manualInputValue[service]?.[activityKey]) {
      setManualInputValue((prev) => ({
        ...prev,
        [service]: { ...prev[service], [activityKey]: null },
      }));
    }
  };

  const handleClearSelection = () => {
    setSelectedActivities({});
    setManualInputValue({});
  };

  const calculateTotal = (): number => {
    let total = 0;
    for (const service in selectedActivities) {
      for (const activityKey in selectedActivities[service]) {
        const activity = ALL_SERVICES.find((s) => s.id === activityKey);
        if (activity) {
          total +=
            activity.price * (selectedActivities[service][activityKey] || 1);
        }
      }
    }
    return total;
  };

  const handleNext = () => {
    const selectedActivitiesEncoded = encodeURIComponent(
      JSON.stringify(selectedActivities)
    );
    
    const address = searchParams.get("address") || "";
    const photos = searchParams.get("photos") || "[]";
    const description = searchParams.get("description") || "";

    router.push(
      `/emergency/estimate?selectedActivities=${selectedActivitiesEncoded}` +
      `&address=${encodeURIComponent(address)}` +
      `&photos=${encodeURIComponent(photos)}` +
      `&description=${encodeURIComponent(description)}`
    );
  };

  const servicesList = Object.entries(selectedServices).flatMap(
    ([category, services]) =>
      services.map((service) => ({
        service,
        category,
        activities:
          EMERGENCY_SERVICES[category]?.services[service]?.activities || {},
      }))
  );

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto relative">
        <BreadCrumb items={EMERGENCY_STEPS} />

        {/* Header and Next Button */}
        <div className="flex justify-between items-start mt-8">
          <SectionBoxTitle>Emergency Details</SectionBoxTitle>
          <Button onClick={handleNext}>Next →</Button>
        </div>
        <div className="container mx-auto relative flex">
          {/* Left Section */}
          <div className="flex-1">
            {/* No Service / Clear */}
            <div className="flex justify-between items-center text-sm text-gray-500 mt-8 w-full max-w-[600px]">
              <span>
                No service?{" "}
                <a
                  href="#"
                  className="text-blue-600 hover:underline focus:outline-none"
                >
                  Contact emergency support
                </a>
              </span>
              <button
                onClick={handleClearSelection}
                className="text-blue-600 hover:underline focus:outline-none"
              >
                Clear
              </button>
            </div>

            {/* Render Selected Services */}
            <div className="flex flex-col gap-4 mt-8 w-full max-w-[600px]">
              {servicesList.map(({ service, category, activities }, index) => {
                const serviceLabel = capitalizeAndTransform(service);
                const isExpanded = expandedServices.has(service);

                return (
                  <div
                    key={index}
                    className="p-4 border rounded-xl bg-white border-gray-300"
                  >
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => handleToggleExpand(service)}
                    >
                      <span className="text-2xl font-medium text-gray-800">
                        {serviceLabel}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 transform transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                    {isExpanded && (
                      <div className="mt-4 flex flex-col gap-4">
                        {Object.entries(activities).map(
                          ([activityKey, activityData], idx) => {
                            const isSelected =
                              selectedActivities[service]?.[activityKey] !==
                              undefined;
                            const activityLabel = capitalizeAndTransform(
                              activityData.activity
                            );
                            const activityDetails = ALL_SERVICES.find(
                              (s) => s.id === activityKey
                            );

                            return (
                              <div key={activityKey} className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-lg text-gray-800">
                                    {activityLabel}
                                  </span>
                                  <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() =>
                                        handleActivityToggle(
                                          service,
                                          activityKey
                                        )
                                      }
                                      className="sr-only peer"
                                    />
                                    <div className="w-[50px] h-[26px] bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors duration-300"></div>
                                    <div className="absolute top-[2px] left-[2px] w-[22px] h-[22px] bg-white rounded-full shadow-md peer-checked:translate-x-[24px] transform transition-transform duration-300"></div>
                                  </label>
                                </div>
                                {isSelected && activityDetails && (
                                  <>
                                    <div className="flex flex-col gap-2">
                                      <p className="text-sm text-gray-500 pr-16 pb-2">
                                        {activityDetails.description}
                                      </p>
                                      <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-1">
                                          <button
                                            onClick={() =>
                                              handleQuantityChange(
                                                service,
                                                activityKey,
                                                false,
                                                activityDetails.unit_of_measurement
                                              )
                                            }
                                            className="w-8 h-8 bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg rounded"
                                          >
                                            −
                                          </button>
                                          <input
                                            type="text"
                                            value={
                                              manualInputValue[service]?.[
                                                activityKey
                                              ] !== null
                                                ? manualInputValue[service][
                                                    activityKey
                                                  ] || ""
                                                : selectedActivities[service][
                                                    activityKey
                                                  ]?.toString() || ""
                                            }
                                            onClick={() =>
                                              setManualInputValue((prev) => ({
                                                ...prev,
                                                [service]: {
                                                  ...prev[service],
                                                  [activityKey]: "",
                                                },
                                              }))
                                            }
                                            onBlur={() =>
                                              handleBlurInput(
                                                service,
                                                activityKey
                                              )
                                            }
                                            onChange={(e) =>
                                              handleManualQuantityChange(
                                                service,
                                                activityKey,
                                                e.target.value,
                                                activityDetails.unit_of_measurement
                                              )
                                            }
                                            className="w-20 text-center px-2 py-1 border rounded"
                                            placeholder="1"
                                          />
                                          <button
                                            onClick={() =>
                                              handleQuantityChange(
                                                service,
                                                activityKey,
                                                true,
                                                activityDetails.unit_of_measurement
                                              )
                                            }
                                            className="w-8 h-8 bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg rounded"
                                          >
                                            +
                                          </button>
                                          <span className="text-sm text-gray-600">
                                            {
                                              activityDetails.unit_of_measurement
                                            }
                                          </span>
                                        </div>
                                        <span className="text-lg text-blue-600 font-medium text-right">
                                          $
                                          {formatWithSeparator(
                                            activityDetails.price *
                                              (selectedActivities[service][
                                                activityKey
                                              ] || 1)
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                    {idx !==
                                      Object.keys(activities).length - 1 && (
                                      <hr className="mt-4 border-gray-200" />
                                    )}
                                  </>
                                )}
                              </div>
                            );
                          }
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Section */}
          <div className="w-1/2 ml-auto mt-20 pt-1">
            {/* Summary Section */}
            <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden">
              <SectionBoxSubtitle>Summary</SectionBoxSubtitle>
              {Object.keys(selectedActivities).length === 0 ? (
                <div className="text-left text-gray-500 text-lg mt-4">
                  No services selected
                </div>
              ) : (
                <>
                  <ul className="mt-4 space-y-2 pb-4">
                    {Object.entries(selectedActivities).flatMap(
                      ([service, activities]) =>
                        Object.entries(activities).map(
                          ([activityKey, quantity]) => {
                            const activity = ALL_SERVICES.find(
                              (s) => s.id === activityKey
                            );
                            if (!activity) return null;
                            return (
                              <li
                                key={activityKey}
                                className="grid grid-cols-3 gap-2 text-sm text-gray-600"
                                style={{
                                  gridTemplateColumns: "46% 25% 25%",
                                  width: "100%",
                                }}
                              >
                                <span className="truncate overflow-hidden">
                                  {activity.title}
                                </span>
                                <span className="text-right">
                                  {quantity} x $
                                  {formatWithSeparator(activity.price)}
                                </span>
                                <span className="text-right">
                                  $
                                  {formatWithSeparator(
                                    activity.price * quantity
                                  )}
                                </span>
                              </li>
                            );
                          }
                        )
                    )}
                  </ul>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xl font-semibold text-gray-800">
                      Subtotal:
                    </span>
                    <span className="text-2xl font-semibold text-blue-600">
                      ${formatWithSeparator(calculateTotal())}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Address Section */}
            <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden mt-6">
              <h2 className="text-2xl font-medium text-gray-800 mb-4">
                Address
              </h2>
              <p className="text-gray-500 text-lg">
                {searchParams.get("address") || "No address provided"}
              </p>
            </div>

            {/* Photo Section */}
            <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden mt-6">
              <h2 className="text-2xl font-medium text-gray-800 mb-4">
                Uploaded Photos
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {JSON.parse(searchParams.get("photos") || "[]").map(
                  (photo: string, index: number) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`Uploaded photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )
                )}
              </div>
              {JSON.parse(searchParams.get("photos") || "[]").length === 0 && (
                <p className="text-lg text-gray-500 mt-2">No photos uploaded</p>
              )}
            </div>

            {/* Problem Description Section */}
            <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden mt-6">
              <h2 className="text-2xl font-medium text-gray-800 mb-4">
                Problem Description
              </h2>
              <p className="text-gray-500 text-lg whitespace-pre-wrap">
                {searchParams.get("description") || "No description provided"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
