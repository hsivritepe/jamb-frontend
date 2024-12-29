"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import BreadCrumb from "@/components/ui/BreadCrumb";
import { EMERGENCY_STEPS } from "@/constants/navigation";
import { SectionBoxTitle } from "@/components/ui/SectionBoxTitle";
import { SectionBoxSubtitle } from "@/components/ui/SectionBoxSubtitle";
import { EMERGENCY_SERVICES } from "@/constants/emergency";
import { ALL_SERVICES } from "@/constants/services";
import ServiceTimePicker from "@/components/ui/ServiceTimePicker";

/**
 * Formats a numeric value with two decimal places and thousand separators.
 */
const formatWithSeparator = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Transforms a camelCase or PascalCase string into a more readable label,
 * by inserting a space before uppercase letters and capitalizing the first letter.
 */
const capitalizeAndTransform = (text: string): string => {
  return text
    .replace(/([A-Z])/g, " $1")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
};

/**
 * Loads a value from sessionStorage, or returns defaultValue if not found or parse error.
 */
const loadFromSession = (key: string, defaultValue: any = {}) => {
  const savedValue = sessionStorage.getItem(key);
  return savedValue ? JSON.parse(savedValue) : defaultValue;
};

/**
 * Saves a value to sessionStorage as JSON.
 */
const saveToSession = (key: string, value: any) => {
  sessionStorage.setItem(key, JSON.stringify(value));
};

export default function EmergencyEstimate() {
  const router = useRouter();

  // Whether the date/time picker modal is open
  const [showModal, setShowModal] = useState(false);
  // The chosen date/time
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  // A coefficient that might affect the price (e.g., surcharge or discount)
  const [timeCoefficient, setTimeCoefficient] = useState<number>(1);

  // Load data from sessionStorage
  const selectedActivities: Record<string, Record<string, number>> = loadFromSession(
    "selectedActivities",
    {}
  );
  const address: string = loadFromSession("address", "");
  const photos: string[] = loadFromSession("photos", []);
  const description: string = loadFromSession("description", "");

  // Redirect if no activities or address
  useEffect(() => {
    if (!selectedActivities || Object.keys(selectedActivities).length === 0 || !address) {
      router.push("/emergency");
    }
  }, [selectedActivities, address, router]);

  // Save modal state and coefficient in session whenever they change
  useEffect(() => {
    saveToSession("selectedTime", selectedTime);
  }, [selectedTime]);

  useEffect(() => {
    saveToSession("timeCoefficient", timeCoefficient);
  }, [timeCoefficient]);

  // Calculate total cost
  const calculateTotal = () => {
    let total = 0;
    for (const service in selectedActivities) {
      for (const activityKey in selectedActivities[service]) {
        const foundActivity = ALL_SERVICES.find((s) => s.id === activityKey);
        if (foundActivity) {
          total += foundActivity.price * (selectedActivities[service][activityKey] || 1);
        }
      }
    }
    return total;
  };

  const subtotal = calculateTotal();
  const adjustedSubtotal = subtotal * timeCoefficient;
  const salesTax = adjustedSubtotal * 0.0825;
  const total = adjustedSubtotal + salesTax;

  // Build a list of immediate steps for selected services
  const shownServices = new Set<string>();
  const stepsList = Object.entries(selectedActivities).flatMap(([, activities]) =>
    Object.keys(activities).map((activityKey) => {
      let matchedService = null;
      let matchedServiceKey = "";

      // Find which EMERGENCY_SERVICES item contains this activity
      for (const category of Object.keys(EMERGENCY_SERVICES)) {
        const services = EMERGENCY_SERVICES[category]?.services;
        for (const serviceKey in services) {
          if (services[serviceKey]?.activities?.[activityKey]) {
            matchedService = services[serviceKey];
            matchedServiceKey = serviceKey;
            break;
          }
        }
        if (matchedService) break;
      }

      if (!matchedService || shownServices.has(matchedServiceKey)) return null;
      shownServices.add(matchedServiceKey);

      return {
        serviceName: capitalizeAndTransform(matchedServiceKey),
        steps: matchedService.steps && matchedService.steps.length > 0
          ? matchedService.steps
          : [],
      };
    })
  ).filter(Boolean) as { serviceName: string; steps: any[] }[];

  // Save the steps in session for the next page
  useEffect(() => {
    saveToSession("filteredSteps", stepsList);
  }, [stepsList]);

  // Checkout action
  const handleProceedToCheckout = () => {
    router.push("/emergency/checkout");
  };

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto">
        <BreadCrumb items={EMERGENCY_STEPS} />
      </div>

      <div className="container mx-auto py-12">
        <div className="flex gap-12">
          {/* LEFT COLUMN: Estimate, Address, Photos, etc. */}
          <div className="w-[700px]">
            <div className="bg-brand-light p-6 rounded-xl border border-gray-300 overflow-hidden">
              <SectionBoxSubtitle>Estimate</SectionBoxSubtitle>

              {/* List selected activities and cost */}
              <div className="mt-4 space-y-4">
                {Object.entries(selectedActivities).flatMap(([, activities]) =>
                  Object.entries(activities).map(([activityKey, quantity]) => {
                    const activityObj = ALL_SERVICES.find((s) => s.id === activityKey);
                    if (!activityObj) return null;

                    return (
                      <div
                        key={activityKey}
                        className="flex justify-between items-start gap-4 border-b pb-2"
                      >
                        <div>
                          <h3 className="font-medium text-lg text-gray-800">
                            {activityObj.title}
                          </h3>
                          {activityObj.description && (
                            <div className="text-sm text-gray-500 mt-1">
                              {activityObj.description}
                            </div>
                          )}
                          <div className="text-medium font-medium text-gray-800 mt-2">
                            <span>{quantity} </span>
                            <span>{activityObj.unit_of_measurement}</span>
                          </div>
                        </div>
                        <div className="text-right mt-auto">
                          <span className="block text-gray-800 font-medium">
                            ${formatWithSeparator(activityObj.price * quantity)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Price summary section */}
              <div className="pt-4 mt-4">
                {timeCoefficient !== 1 && (
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">
                      {timeCoefficient > 1 ? "Surcharge" : "Discount"}
                    </span>
                    <span
                      className={`font-semibold text-lg ${
                        timeCoefficient > 1 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {timeCoefficient > 1 ? "+" : "-"}$
                      {formatWithSeparator(Math.abs(subtotal * (timeCoefficient - 1)))}
                    </span>
                  </div>
                )}

                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-lg text-gray-800">
                    Subtotal
                  </span>
                  <span className="font-semibold text-lg text-gray-800">
                    ${formatWithSeparator(adjustedSubtotal)}
                  </span>
                </div>

                <div className="flex justify-between mb-4">
                  <span className="text-gray-600">Sales tax (8.25%)</span>
                  <span>${formatWithSeparator(salesTax)}</span>
                </div>

                <button
                  onClick={() => setShowModal(true)}
                  className={`w-full py-3 rounded-lg font-medium mt-4 border ${
                    selectedTime
                      ? "text-red-500 border-red-500"
                      : "text-brand border-brand"
                  }`}
                >
                  {selectedTime ? "Change Date" : "Select Available Time"}
                </button>

                {selectedTime && (
                  <p className="mt-2 text-gray-700 text-center font-medium">
                    Selected Date: <span className="text-blue-600">{selectedTime}</span>
                  </p>
                )}

                {showModal && (
                  <ServiceTimePicker
                    subtotal={subtotal}
                    onClose={() => setShowModal(false)}
                    onConfirm={(date, coefficient) => {
                      setSelectedTime(date);
                      setTimeCoefficient(coefficient);
                      setShowModal(false);
                    }}
                  />
                )}

                <div className="flex justify-between text-2xl font-semibold mt-4">
                  <span>Total</span>
                  <span>${formatWithSeparator(total)}</span>
                </div>
              </div>

              {/* Address */}
              <div className="mt-6">
                <h3 className="font-semibold text-xl text-gray-800">Address</h3>
                <p className="text-gray-500 mt-2">{address}</p>
              </div>

              {/* Photos */}
              <div className="mt-6">
                <h3 className="font-semibold text-xl text-gray-800">Uploaded Photos</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`Uploaded photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-300 transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <span className="text-white font-medium">
                          Photo {index + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <h3 className="font-semibold text-xl text-gray-800">
                  Problem Description
                </h3>
                <p className="text-gray-500 mt-2 whitespace-pre-wrap">
                  {description}
                </p>
              </div>

              {/* Action buttons */}
              <div className="mt-6 space-y-4">
                <button
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium"
                  onClick={handleProceedToCheckout}
                >
                  Proceed to Checkout →
                </button>
                <button
                  onClick={() => router.back()}
                  className="w-full text-brand border border-brand py-3 rounded-lg font-medium"
                >
                  Add more services →
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Immediate Steps */}
          <div className="flex-1">
            <SectionBoxTitle>Immediate Steps for Selected Services</SectionBoxTitle>
            <div className="mt-8 space-y-8">
              {stepsList.map((serviceObj, index) => {
                if (serviceObj && serviceObj.steps.length > 0) {
                  return (
                    <div
                      key={serviceObj.serviceName + index}
                      className="bg-white p-6 rounded-lg border border-gray-200"
                    >
                      <SectionBoxSubtitle>{serviceObj.serviceName}</SectionBoxSubtitle>
                      <div className="mt-4 space-y-4">
                        {serviceObj.steps.map((step) => (
                          <div key={step.title} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="text-lg font-medium">
                                {step.step_number}.
                              </h4>
                              <h4 className="text-lg font-medium">{step.title}</h4>
                            </div>
                            <p className="text-gray-600">{step.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div
                      key={serviceObj?.serviceName + index}
                      className="bg-white p-6 rounded-lg border border-gray-200"
                    >
                      <SectionBoxSubtitle>{serviceObj?.serviceName}</SectionBoxSubtitle>
                      <p className="text-gray-600 mt-4">No steps available.</p>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}