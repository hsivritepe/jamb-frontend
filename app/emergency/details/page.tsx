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

// Utility function to format numbers
const formatWithSeparator = (value: number): string =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(value);

// Save/load data from sessionStorage
const saveToSession = (key: string, value: any) => {
  sessionStorage.setItem(key, JSON.stringify(value));
};
const loadFromSession = (key: string, defaultValue: any = {}) => {
  const savedValue = sessionStorage.getItem(key);
  return savedValue ? JSON.parse(savedValue) : defaultValue;
};

export default function EmergencyDetails() {
  const router = useRouter();

  // Load data from session
  const selectedServices: Record<string, string[]> = loadFromSession("selectedServices", {});
  const address: string = loadFromSession("address", "");
  const photos: string[] = loadFromSession("photos", []);
  const description: string = loadFromSession("description", "");

  // Activities chosen: { [serviceKey]: { [activityKey]: quantity } }
  const [selectedActivities, setSelectedActivities] = useState<Record<string, Record<string, number>>>(
    () => loadFromSession("selectedActivities", {})
  );

  // For storing any text the user typed into a quantity field
  const [manualInputValue, setManualInputValue] = useState<Record<string, Record<string, string | null>>>({});

  // For toggling open/closed state of the service's activity lists
  const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set());

  // For showing an error if needed
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // We do NOT forcibly redirect if zero services are chosen. We'll handle that on Next.
  useEffect(() => {
    // If needed, we could show a local warning or do nothing
  }, [selectedServices]);

  // Persist changes to sessionStorage
  useEffect(() => {
    saveToSession("selectedActivities", selectedActivities);
  }, [selectedActivities]);

  // Toggle a service's expanded/collapsed state
  const handleToggleExpand = (service: string) => {
    setExpandedServices((prev) => {
      const updated = new Set(prev);
      updated.has(service) ? updated.delete(service) : updated.add(service);
      return updated;
    });
  };

  // Toggle an activity in or out of selectedActivities
  const handleActivityToggle = (service: string, activityKey: string) => {
    setSelectedActivities((prev) => {
      const serviceActivities = prev[service] || {};
      if (serviceActivities[activityKey]) {
        // Remove if already selected
        const updatedActivities = { ...serviceActivities };
        delete updatedActivities[activityKey];
        return { ...prev, [service]: updatedActivities };
      }
      // Otherwise add with default quantity 1
      return { ...prev, [service]: { ...serviceActivities, [activityKey]: 1 } };
    });
    // Reset manual input for that activity
    setManualInputValue((prev) => ({
      ...prev,
      [service]: { ...prev[service], [activityKey]: null },
    }));
    // Clear warning if a service is selected
    setWarningMessage(null);
  };

  // Increase or decrease quantity
  const handleQuantityChange = (
    service: string,
    activityKey: string,
    increment: boolean,
    unit: string
  ) => {
    setSelectedActivities((prev) => {
      const currentValue = prev[service]?.[activityKey] || 1;
      const newValue = increment ? currentValue + 1 : Math.max(1, currentValue - 1);

      return {
        ...prev,
        [service]: {
          ...prev[service],
          [activityKey]: unit === "each" ? Math.round(newValue) : newValue,
        },
      };
    });

    // Clear manual input
    setManualInputValue((prev) => ({
      ...prev,
      [service]: { ...prev[service], [activityKey]: null },
    }));
    // Also clear the warning
    setWarningMessage(null);
  };

  // Handle manual text input for quantity
  const handleManualQuantityChange = (
    service: string,
    activityKey: string,
    value: string,
    unit: string
  ) => {
    setManualInputValue((prev) => ({
      ...prev,
      [service]: { ...prev[service], [activityKey]: value },
    }));

    const numericValue = parseFloat(value.replace(/,/g, "")) || 0;
    if (!isNaN(numericValue)) {
      setSelectedActivities((prev) => ({
        ...prev,
        [service]: {
          ...prev[service],
          [activityKey]: unit === "each" ? Math.round(numericValue) : numericValue,
        },
      }));
    }
    // If user typed anything, presumably they've chosen a service, so remove warning
    setWarningMessage(null);
  };

  // On input blur, if no valid input, reset it
  const handleBlurInput = (service: string, activityKey: string) => {
    if (!manualInputValue[service]?.[activityKey]) {
      setManualInputValue((prev) => ({
        ...prev,
        [service]: { ...prev[service], [activityKey]: null },
      }));
    }
  };

  // Clear everything
  const handleClearSelection = () => {
    // Confirmation prompt
    const confirmed = confirm("Are you sure you want to clear all selections?");
    if (!confirmed) return;

    setSelectedActivities({});
    setManualInputValue({});
    saveToSession("selectedActivities", {});

    // Also close expansions
    setExpandedServices(new Set());
    // Remove warning if any
    setWarningMessage(null);
  };

  // Calculate total cost of all selected activities
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

  // On Next, ensure there's at least 1 service selected and an address
  const handleNext = () => {
    const anyChosen = Object.values(selectedActivities).some(
      (srvObj) => Object.keys(srvObj).length > 0
    );
    if (!anyChosen) {
      setWarningMessage("Please select at least one service before proceeding.");
      return;
    }
    if (!address.trim()) {
      setWarningMessage("Please enter your address before proceeding.");
      return;
    }

    // If OK, proceed
    saveToSession("selectedActivities", selectedActivities);
    saveToSession("address", address);
    saveToSession("photos", photos);
    saveToSession("description", description);

    router.push("/emergency/estimate");
  };

  // Create a list of all services user selected from the first page
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
          {/* Left column: show chosen services from the first page, + expand/collapse for activities */}
          <div className="flex-1">
            {/* Clear or contact support row */}
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

            {/* Warning message if user tries Next with no service */}
            <div className="h-6 mt-4 text-left">
              {warningMessage && <p className="text-red-500">{warningMessage}</p>}
            </div>

            {/* List of user-selected services from page 1 */}
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
                    {/* Service title row */}
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

                    {isExpanded && (
                      <div className="mt-4 flex flex-col gap-4">
                        {Object.entries(activities).map(([activityKey, activityData], idx) => {
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
                              {/* Activity name + toggle */}
                              <div className="flex justify-between items-center">
                                <span className="text-lg text-gray-800">
                                  {activityLabel}
                                </span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleActivityToggle(service, activityKey)}
                                    className="sr-only peer"
                                  />
                                  <div className="w-[50px] h-[26px] bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors duration-300"></div>
                                  <div className="absolute top-[2px] left-[2px] w-[22px] h-[22px] bg-white rounded-full shadow-md peer-checked:translate-x-[24px] transform transition-transform duration-300"></div>
                                </label>
                              </div>

                              {/* If chosen, show quantity and cost */}
                              {isSelected && activityDetails && (
                                <>
                                  <div className="flex flex-col gap-2">
                                    <p className="text-sm text-gray-500 pr-16 pb-2">
                                      {activityDetails.description}
                                    </p>
                                    <div className="flex justify-between items-center">
                                      <div className="flex items-center gap-1">
                                        {/* Decrement */}
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
                                        {/* Manual input */}
                                        <input
                                          type="text"
                                          value={
                                            manualInputValue[service]?.[activityKey] !== null
                                              ? manualInputValue[service]?.[activityKey] || ""
                                              : selectedActivities[service]?.[activityKey]?.toString() || ""
                                          }
                                          onClick={() =>
                                            setManualInputValue(prev => ({
                                              ...prev,
                                              [service]: {
                                                ...prev[service],
                                                [activityKey]: "",
                                              },
                                            }))
                                          }
                                          onBlur={() => handleBlurInput(service, activityKey)}
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
                                        {/* Increment */}
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
                                      <span className="text-lg text-blue-600 font-medium text-right">
                                        $
                                        {formatWithSeparator(
                                          activityDetails.price *
                                          (selectedActivities[service][activityKey] || 1)
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                  {idx !== Object.keys(activities).length - 1 && (
                                    <hr className="mt-4 border-gray-200" />
                                  )}
                                </>
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

          {/* Right side: summary, address, photos, description */}
          <div className="w-1/2 ml-auto mt-20 pt-1">
            {/* Summary */}
            <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden">
              <SectionBoxSubtitle>Summary</SectionBoxSubtitle>
              {Object.keys(selectedActivities).length === 0 ? (
                <div className="text-left text-gray-500 text-medium mt-4">
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

            {/* Address */}
            <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden mt-6">
              <h2 className="text-2xl font-medium text-gray-800 mb-4">Address</h2>
              <p className="text-gray-500 text-medium">{address || "No address provided"}</p>
            </div>

            {/* Photos */}
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
                <p className="text-medium text-gray-500 mt-2">No photos uploaded</p>
              )}
            </div>

            {/* Problem Description */}
            <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden mt-6">
              <h2 className="text-2xl font-medium text-gray-800 mb-4">
                Problem Description
              </h2>
              <p className="text-gray-500 text-medium whitespace-pre-wrap">
                {description || "No description provided"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}