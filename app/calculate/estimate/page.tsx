"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BreadCrumb from "@/components/ui/BreadCrumb";
import { SectionBoxTitle } from "@/components/ui/SectionBoxTitle";
import { SectionBoxSubtitle } from "@/components/ui/SectionBoxSubtitle";
import { CALCULATE_STEPS } from "@/constants/navigation";
import { ALL_CATEGORIES } from "@/constants/categories";
import { ALL_SERVICES } from "@/constants/services";
import ServiceTimePicker from "@/components/ui/ServiceTimePicker";

// Utility function to format numbers with commas and two decimal places
const formatWithSeparator = (value: number): string =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(value);
const formatQuantity = (value: number): string =>
  new Intl.NumberFormat("en-US").format(value);

// Session storage helpers with environment checks
const saveToSession = (key: string, value: any) => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(key, JSON.stringify(value));
  }
};

const loadFromSession = (key: string, defaultValue: any) => {
  if (typeof window === "undefined") return defaultValue;
  const savedValue = sessionStorage.getItem(key);
  try {
    return savedValue ? JSON.parse(savedValue) : defaultValue;
  } catch (error) {
    console.error(`Error parsing sessionStorage for key "${key}"`, error);
    return defaultValue;
  }
};

export default function Estimate() {
  const router = useRouter();

  // Load data from the session saved on the 'details' page
  const selectedServicesState: Record<string, number> = loadFromSession(
    "selectedServicesWithQuantity",
    {}
  );
  const address: string = loadFromSession("address", "");
  const photos: string[] = loadFromSession("photos", []);
  const description: string = loadFromSession("description", "");

  // Also load categories and searchQuery for grouping services by section/category
  const selectedCategories: string[] = loadFromSession(
    "services_selectedCategories",
    []
  );
  const searchQuery: string = loadFromSession("services_searchQuery", "");

  // If no services or no address, go back
  useEffect(() => {
    if (
      Object.keys(selectedServicesState).length === 0 ||
      !address ||
      selectedCategories.length === 0
    ) {
      router.push("/calculate");
    }
  }, [selectedServicesState, address, selectedCategories, router]);

  // Compute categoriesBySection and categoryServicesMap to group services
  const categoriesWithSection = selectedCategories
    .map((catId) => ALL_CATEGORIES.find((c) => c.id === catId) || null)
    .filter(Boolean) as (typeof ALL_CATEGORIES)[number][];

  const categoriesBySection: Record<string, string[]> = {};
  categoriesWithSection.forEach((cat) => {
    if (!categoriesBySection[cat.section]) {
      categoriesBySection[cat.section] = [];
    }
    categoriesBySection[cat.section].push(cat.id);
  });

  const categoryServicesMap: Record<string, (typeof ALL_SERVICES)[number][]> =
    {};
  selectedCategories.forEach((catId) => {
    let matchedServices = ALL_SERVICES.filter((svc) =>
      svc.id.startsWith(`${catId}-`)
    );
    if (searchQuery) {
      matchedServices = matchedServices.filter((svc) =>
        svc.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    categoryServicesMap[catId] = matchedServices;
  });

  // State for handling the modal, selected time, and time coefficient
  const [showModal, setShowModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(() =>
    loadFromSession("selectedTime", null)
  );
  const [timeCoefficient, setTimeCoefficient] = useState<number>(() =>
    loadFromSession("timeCoefficient", 1)
  );

  useEffect(() => {
    saveToSession("selectedTime", selectedTime);
  }, [selectedTime]);

  useEffect(() => {
    saveToSession("timeCoefficient", timeCoefficient);
  }, [timeCoefficient]);

  // Calculate total cost
  const calculateTotal = (): number => {
    let total = 0;
    for (const [serviceId, quantity] of Object.entries(selectedServicesState)) {
      const svc = ALL_SERVICES.find((s) => s.id === serviceId);
      if (svc) {
        total += svc.price * (quantity || 1);
      }
    }
    return total;
  };

  // Compute subtotal and then tax and total
  const subtotal = calculateTotal();
  const adjustedSubtotal = subtotal * timeCoefficient;
  const salesTax = adjustedSubtotal * 0.0825;
  const total = adjustedSubtotal + salesTax;

  const handleProceedToCheckout = () => {
    saveToSession("selectedTime", selectedTime);
    saveToSession("timeCoefficient", timeCoefficient);
    router.push("/calculate/checkout");
  };

  const getCategoryNameById = (catId: string): string => {
    const categoryObj = ALL_CATEGORIES.find((c) => c.id === catId);
    return categoryObj ? categoryObj.title : catId;
  };

  return (
    <main className="min-h-screen pt-24">
      <div className="container mx-auto">
        {/* Breadcrumb navigation */}
        <BreadCrumb items={CALCULATE_STEPS} />
      </div>

      <div className="container mx-auto py-12">
        <div className="flex gap-12">
          {/* Left column showing Estimate with section/category grouping but same appearance */}
          <div className="w-[700px]">
            <div className="bg-brand-light p-6 rounded-xl border border-gray-300 overflow-hidden">
              <SectionBoxSubtitle>Estimate</SectionBoxSubtitle>

              {/* Services grouped by section and category */}
              <div className="mt-4 space-y-4">
                {Object.entries(categoriesBySection).map(
                  ([sectionName, catIds]) => {
                    // Filter categories that have selected services
                    const categoriesWithSelected = catIds.filter((catId) => {
                      const servicesForCategory =
                        categoryServicesMap[catId] || [];
                      return servicesForCategory.some(
                        (svc) => selectedServicesState[svc.id] !== undefined
                      );
                    });
                    if (categoriesWithSelected.length === 0) return null;

                    return (
                      <div key={sectionName} className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-800">
                          {sectionName}
                        </h3>
                        {categoriesWithSelected.map((catId) => {
                          const categoryName = getCategoryNameById(catId);
                          const servicesForCategory =
                            categoryServicesMap[catId] || [];
                          const chosenServices = servicesForCategory.filter(
                            (svc) => selectedServicesState[svc.id] !== undefined
                          );

                          if (chosenServices.length === 0) return null;

                          return (
                            <div key={catId} className="ml-4 space-y-4">
                              <h4 className="text-lg font-semibold text-gray-700">
                                {categoryName}
                              </h4>
                              {chosenServices.map((activity) => {
                                const quantity =
                                  selectedServicesState[activity.id] || 1;
                                return (
                                  <div
                                    key={activity.id}
                                    className="flex justify-between items-start gap-4 border-b pb-2"
                                  >
                                    <div>
                                      <h3 className="font-medium text-lg text-gray-800">
                                        {activity.title}
                                      </h3>
                                      {activity.description && (
                                        <div className="text-sm text-gray-500 mt-1">
                                          <span>{activity.description}</span>
                                        </div>
                                      )}
                                      <div className="text-medium font-medium text-gray-800 mt-2">
                                        <span>{formatQuantity(quantity)} </span>
                                        <span>
                                          {activity.unit_of_measurement}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="text-right mt-auto">
                                      <span className="block text-gray-800 font-medium">
                                        $
                                        {formatWithSeparator(
                                          activity.price * quantity
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    );
                  }
                )}
              </div>

              {/* Summary of costs including time coefficient and sales tax */}
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

                {/* Button to open modal for selecting time and adjusting coefficient */}
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

                {/* Modal component to pick date/time and adjust timeCoefficient */}
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

                {/* Total after adjustments */}
                <div className="flex justify-between text-2xl font-semibold mt-4">
                  <span>Total</span>
                  <span>${formatWithSeparator(total)}</span>
                </div>
              </div>

              {/* Address */}
              <div className="mt-6">
                <h3 className="font-semibold text-xl text-gray-800">Address</h3>
                <p className="text-gray-500 mt-2">
                  {address || "No address provided"}
                </p>
              </div>

              {/* Uploaded Photos */}
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
                {photos.length === 0 && (
                  <p className="text-medium text-gray-500 mt-2">
                    No photos uploaded
                  </p>
                )}
              </div>

              {/* Additional details */}
              <div className="mt-6">
                <h3 className="font-semibold text-xl text-gray-800">
                  Additional details
                </h3>
                <p className="text-gray-500 mt-2 whitespace-pre-wrap">
                  {description || "No details provided"}
                </p>
              </div>

              {/* Action buttons */}
              <div className="mt-6 space-y-4">
                <button
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium"
                  onClick={handleProceedToCheckout}
                >
                  Proceed to Checkout &nbsp;→
                </button>
                <button
                  onClick={() => router.push("/calculate/details")}
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
