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

// Utility function to format numbers with thousand separators
const formatWithSeparator = (value: number): string => {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(
    value
  );
};

// Utility function to capitalize and transform camelCase or PascalCase text
const capitalizeAndTransform = (text: string): string => {
  return text
    .replace(/([A-Z])/g, " $1")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
};

const loadFromSession = (key: string, defaultValue: any = {}) => {
  const savedValue = sessionStorage.getItem(key);
  return savedValue ? JSON.parse(savedValue) : defaultValue;
};

const saveToSession = (key: string, value: any) => {
  sessionStorage.setItem(key, JSON.stringify(value));
};

export default function EmergencyEstimate() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [timeCoefficient, setTimeCoefficient] = useState<number>(1);

  const selectedActivities: Record<string, Record<string, number>> = loadFromSession(
    "selectedActivities",
    {}
  );
  const address: string = loadFromSession("address", "");
  const photos: string[] = loadFromSession("photos", []);
  const description: string = loadFromSession("description", "");

  useEffect(() => {
    if (
      !selectedActivities ||
      Object.keys(selectedActivities).length === 0 ||
      !address
    ) {
      router.push("/emergency");
    }
  }, [selectedActivities, address, router]);

  useEffect(() => {
    saveToSession("selectedTime", selectedTime);
  }, [selectedTime]);

  useEffect(() => {
    saveToSession("timeCoefficient", timeCoefficient);
  }, [timeCoefficient]);

  const calculateTotal = () => {
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

  const subtotal = calculateTotal();
  const adjustedSubtotal = subtotal * timeCoefficient;
  const salesTax = adjustedSubtotal * 0.0825;
  const total = adjustedSubtotal + salesTax;

  // Формируем список сервисов со степами
  const shownServices = new Set<string>();
  const stepsList = Object.entries(selectedActivities).flatMap(
    ([, activities]) =>
      Object.keys(activities).map((activityKey) => {
        let matchedService = null;
        let matchedServiceKey = "";

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

        // Возвращаем объект с именем сервиса и его шагами
        return {
          serviceName: capitalizeAndTransform(matchedServiceKey),
          steps: matchedService.steps && matchedService.steps.length > 0 ? matchedService.steps : []
        };
      })
  ).filter(Boolean) as { serviceName: string; steps: any[] }[];

  // Сохраняем отфильтрованные шаги в sessionStorage
  useEffect(() => {
    saveToSession("filteredSteps", stepsList);
  }, [stepsList]);

  const handleProceedToCheckout = () => {
    router.push("/emergency/checkout");
  };

  return (
    <main className="min-h-screen pt-24">
      <div className="container mx-auto">
        <BreadCrumb items={EMERGENCY_STEPS} />
      </div>

      <div className="container mx-auto py-12">
        <div className="flex gap-12">
          {/* Left Column: Steps */}
          <div className="flex-1">
            <SectionBoxTitle>
              Immediate Steps for Selected Services
            </SectionBoxTitle>
            <div className="mt-8 space-y-8">
              {stepsList.map((serviceObj, index) => {
                if (serviceObj && serviceObj.steps.length > 0) {
                  return (
                    <div
                      key={serviceObj.serviceName + index}
                      className="bg-white p-6 rounded-lg border border-gray-200"
                    >
                      <SectionBoxSubtitle>
                        {serviceObj.serviceName}
                      </SectionBoxSubtitle>
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
                      <SectionBoxSubtitle>
                        {serviceObj?.serviceName}
                      </SectionBoxSubtitle>
                      <p className="text-gray-600 mt-4">No steps available.</p>
                    </div>
                  );
                }
              })}
            </div>
          </div>

          {/* Right Column: Estimate Summary */}
          <div className="w-[500px]">
            <div className="bg-brand-light p-6 rounded-xl">
              <SectionBoxSubtitle>Estimate</SectionBoxSubtitle>
              <div className="mt-4 space-y-4">
                {Object.entries(selectedActivities).flatMap(
                  ([, activities]) =>
                    Object.entries(activities).map(([activityKey, quantity]) => {
                      const activity = ALL_SERVICES.find(
                        (s) => s.id === activityKey
                      );
                      if (!activity) return null;

                      return (
                        <div
                          key={activityKey}
                          className="flex justify-between items-start gap-4 border-b pb-2"
                        >
                          <div>
                            <h3 className="font-medium text-lg text-gray-800">
                              {activity.title}
                            </h3>
                            <div className="text-sm text-gray-500 mt-1">
                              <span>{activity.description}</span>
                            </div>
                            <div className="text-medium font-medium text-gray-800 mt-2">
                              <span>{quantity} </span>
                              <span>{activity.unit_of_measurement}</span>
                            </div>
                          </div>
                          <div className="text-right mt-auto">
                            <span className="block text-gray-800 font-medium">
                              ${formatWithSeparator(activity.price * quantity)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>

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
                      {formatWithSeparator(
                        Math.abs(subtotal * (timeCoefficient - 1))
                      )}
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
                    Selected Date:{" "}
                    <span className="text-blue-600">{selectedTime}</span>
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

              <div className="mt-6">
                <h3 className="font-semibold text-xl text-gray-800">Address</h3>
                <p className="text-gray-500 mt-2">{address}</p>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold text-xl text-gray-800">
                  Uploaded Photos
                </h3>
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

              <div className="mt-6">
                <h3 className="font-semibold text-xl text-gray-800">
                  Problem Description
                </h3>
                <p className="text-gray-500 mt-2 whitespace-pre-wrap">
                  {description}
                </p>
              </div>

              <div className="mt-6 space-y-4">
                <button
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium"
                  onClick={handleProceedToCheckout}
                >
                  Proceed to Checkout &nbsp;→
                </button>
                <button
                  onClick={() => router.back()}
                  className="w-full text-brand border border-brand py-3 rounded-lg font-medium"
                >
                  Add more services &nbsp;→
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}