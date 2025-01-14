"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BreadCrumb from "@/components/ui/BreadCrumb";
import Button from "@/components/ui/Button";
import { SectionBoxTitle } from "@/components/ui/SectionBoxTitle";
import { SectionBoxSubtitle } from "@/components/ui/SectionBoxSubtitle";
import { EMERGENCY_STEPS } from "@/constants/navigation";
import { EMERGENCY_SERVICES } from "@/constants/emergency";
import { ALL_SERVICES } from "@/constants/services";
import { ChevronDown } from "lucide-react";

// Utility function to transform keys into a more readable format
const capitalizeAndTransform = (text: string): string =>
  text
    .replace(/([A-Z])/g, " $1")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());

// Utility function to format numbers with separators and decimal places
const formatWithSeparator = (value: number): string =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(value);

// Save and load data from sessionStorage for state persistence
const saveToSession = (key: string, value: any) => {
  sessionStorage.setItem(key, JSON.stringify(value));
};

const loadFromSession = (key: string, defaultValue: any = {}) => {
  const savedValue = sessionStorage.getItem(key);
  return savedValue ? JSON.parse(savedValue) : defaultValue;
};

export default function EmergencyDetails() {
  const router = useRouter();

  // Load all required data from sessionStorage
  const selectedServices: Record<string, string[]> = loadFromSession("selectedServices", {});
  const address: string = loadFromSession("address", "");
  const photos: string[] = loadFromSession("photos", []);
  const description: string = loadFromSession("description", "");

  // selectedActivities: User's chosen activities and their quantities
  const [selectedActivities, setSelectedActivities] = useState<
    Record<string, Record<string, number>>
  >(() => loadFromSession("selectedActivities", {}));

  // manualInputValue: Tracks manual text input for activity quantities
  const [manualInputValue, setManualInputValue] = useState<
    Record<string, Record<string, string | null>>
  >({});

  // expandedServices: Set of services that are currently expanded to show activities
  const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set());

  // If essential data is missing (e.g., no selected services or no address), redirect to the first page
  useEffect(() => {
    if (
      !selectedServices ||
      Object.values(selectedServices).flat().length === 0 ||
      !address
    ) {
      router.push("/emergency");
    }
  }, [selectedServices, address, router]);

  // Save selectedActivities to sessionStorage whenever they change
  useEffect(() => {
    saveToSession("selectedActivities", selectedActivities);
  }, [selectedActivities]);

  // Toggle the expansion of a service to show/hide its activities
  const handleToggleExpand = (service: string) => {
    setExpandedServices((prev) => {
      const updated = new Set(prev);
      updated.has(service) ? updated.delete(service) : updated.add(service);
      return updated;
    });
  };

  // Add or remove an activity from selectedActivities when toggled
  const handleActivityToggle = (service: string, activityKey: string) => {
    setSelectedActivities((prev) => {
      const serviceActivities = prev[service] || {};
      if (serviceActivities[activityKey]) {
        // If activity is already selected, remove it
        const updatedActivities = { ...serviceActivities };
        delete updatedActivities[activityKey];
        return { ...prev, [service]: updatedActivities };
      }
      // Otherwise, add it with a default quantity of 1
      return { ...prev, [service]: { ...serviceActivities, [activityKey]: 1 } };
    });
    // Reset manual input value for this activity
    setManualInputValue((prev) => ({
      ...prev,
      [service]: { ...prev[service], [activityKey]: null },
    }));
  };

  // Increment or decrement the activity quantity
  const handleQuantityChange = (
    service: string,
    activityKey: string,
    increment: boolean,
    unit: string
  ) => {
    setSelectedActivities((prev) => {
      const currentValue = prev[service]?.[activityKey] || 1;
      const updatedValue = increment ? currentValue + 1 : Math.max(1, currentValue - 1);

      return {
        ...prev,
        [service]: {
          ...prev[service],
          [activityKey]: unit === "each" ? Math.round(updatedValue) : updatedValue,
        },
      };
    });
    // Clear any manual input since we used buttons now
    setManualInputValue((prev) => ({
      ...prev,
      [service]: { ...prev[service], [activityKey]: null },
    }));
  };

  // Handle manual input in the quantity field
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
      // Update the selectedActivities with the parsed numeric value
      setSelectedActivities((prev) => ({
        ...prev,
        [service]: {
          ...prev[service],
          [activityKey]: unit === "each" ? Math.round(numericValue) : numericValue,
        },
      }));
    }
  };

  // When input loses focus, if no valid input is there, reset manual input to null
  const handleBlurInput = (service: string, activityKey: string) => {
    if (!manualInputValue[service]?.[activityKey]) {
      setManualInputValue((prev) => ({
        ...prev,
        [service]: { ...prev[service], [activityKey]: null },
      }));
    }
  };

  // Clear all selected activities
  const handleClearSelection = () => {
    setSelectedActivities({});
    setManualInputValue({});
    saveToSession("selectedActivities", {});
  };

  // Calculate the subtotal cost of all selected activities
  const calculateTotal = (): number => {
    let total = 0;
    for (const service in selectedActivities) {
      for (const activityKey in selectedActivities[service]) {
        const activity = ALL_SERVICES.find((s) => s.id === activityKey);
        if (activity) {
          total += activity.price * (selectedActivities[service][activityKey] || 1);
        }
      }
    }
    return total;
  };

  // Save current state and proceed to the next page
  const handleNext = () => {
    saveToSession("selectedActivities", selectedActivities);
    saveToSession("address", address);
    saveToSession("photos", photos);
    saveToSession("description", description);

    router.push("/emergency/estimate");
  };

  // Prepare a list of services the user selected on the first page
  const servicesList = Object.entries(selectedServices).flatMap(
    ([category, services]) =>
      services.map((service) => ({
        service,
        category,
        activities: EMERGENCY_SERVICES[category]?.services[service]?.activities || {},
      }))
  );

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto relative">
        <BreadCrumb items={EMERGENCY_STEPS} />

        {/* Page Title and Next Button */}
        <div className="flex justify-between items-start mt-8">
          <SectionBoxTitle>Emergency Details</SectionBoxTitle>
          <Button onClick={handleNext}>Next →</Button>
        </div>

        <div className="container mx-auto relative flex">
          {/* Left Section: Allows user to select activities and quantities */}
          <div className="flex-1">
            {/* If no suitable service, option to clear or contact support */}
            <div className="flex justify-between items-center text-sm text-gray-500 mt-8 w-full max-w-[600px]">
              <span>
                No service?{" "}
                <a href="#" className="text-blue-600 hover:underline focus:outline-none">
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

            {/* Display selected services and their activities */}
            <div className="flex flex-col gap-4 mt-8 w-full max-w-[600px]">
              {servicesList.map(({ service, category, activities }, index) => {
                const serviceLabel = capitalizeAndTransform(service);
                const isExpanded = expandedServices.has(service);
                const selectedCount = Object.keys(selectedActivities[service] || {}).length;

                return (
                  <div
                    key={index}
                    className="p-4 border rounded-xl bg-white border-gray-300"
                  >
                    {/* Service header (click to expand/collapse) */}
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => handleToggleExpand(service)}
                    >
                      <span
                        className={`text-2xl font-medium ${
                          selectedCount > 0 ? "text-blue-600" : "text-gray-800"
                        }`}
                      >
                        {serviceLabel}
                        {selectedCount > 0 && (
                          <span className="text-sm text-gray-500 ml-2">
                            ({selectedCount} selected)
                          </span>
                        )}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 transform transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </div>

                    {/* If expanded, show activities inside this service */}
                    {isExpanded && (
                      <div className="mt-4 flex flex-col gap-4">
                        {Object.entries(activities).map(
                          ([activityKey, activityData], idx) => {
                            const isSelected =
                              selectedActivities[service]?.[activityKey] !== undefined;
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
                                        handleActivityToggle(service, activityKey)
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
                                      {/* Activity description */}
                                      <p className="text-sm text-gray-500 pr-16 pb-2">
                                        {activityDetails.description}
                                      </p>
                                      {/* Quantity and Price Controls */}
                                      <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-1">
                                          {/* Decrement button */}
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
                                          {/* Manual input field */}
                                          <input
                                            type="text"
                                            value={
                                              manualInputValue[service]?.[activityKey] !== null
                                                ? manualInputValue[service]?.[activityKey] || ""
                                                : selectedActivities[service]?.[activityKey]
                                                    ?.toString() || ""
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
                                              handleBlurInput(service, activityKey)
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
                                          {/* Increment button */}
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
                                            {activityDetails.unit_of_measurement}
                                          </span>
                                        </div>
                                        {/* Display calculated price for the activity */}
                                        <span className="text-lg text-blue-600 font-medium text-right">
                                          $
                                          {formatWithSeparator(
                                            activityDetails.price *
                                              (selectedActivities[service][activityKey] || 1)
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                    {/* Separator between activities */}
                                    {idx !== Object.keys(activities).length - 1 && (
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

          {/* Right Section: Summary, Address, Photos, and Description */}
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
                        Object.entries(activities).map(([activityKey, quantity]) => {
                          const activity = ALL_SERVICES.find((s) => s.id === activityKey);
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
                                {quantity} x ${formatWithSeparator(activity.price)}
                              </span>
                              <span className="text-right">
                                ${formatWithSeparator(activity.price * quantity)}
                              </span>
                            </li>
                          );
                        })
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
              <h2 className="text-2xl font-medium text-gray-800 mb-4">Address</h2>
              <p className="text-gray-500 text-lg">{address || "No address provided"}</p>
            </div>

            {/* Photos Section */}
            <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden mt-6">
              <h2 className="text-2xl font-medium text-gray-800 mb-4">
                Uploaded Photos
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {photos.map((photo: string, index: number) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`Uploaded photo ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
              {photos.length === 0 && (
                <p className="text-lg text-gray-500 mt-2">No photos uploaded</p>
              )}
            </div>

            {/* Problem Description Section */}
            <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden mt-6">
              <h2 className="text-2xl font-medium text-gray-800 mb-4">
                Problem Description
              </h2>
              <p className="text-gray-500 text-lg whitespace-pre-wrap">
                {description || "No description provided"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}