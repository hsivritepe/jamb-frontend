"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SectionBoxTitle } from "@/components/ui/SectionBoxTitle";
import { SectionBoxSubtitle } from "@/components/ui/SectionBoxSubtitle";
import BreadCrumb from "@/components/ui/BreadCrumb";
import { EMERGENCY_STEPS } from "@/constants/navigation";
import { ALL_SERVICES } from "@/constants/services";

const saveToSession = (key: string, value: any) => {
  sessionStorage.setItem(key, JSON.stringify(value));
};

const loadFromSession = (key: string) => {
  const savedValue = sessionStorage.getItem(key);
  return savedValue ? JSON.parse(savedValue) : null;
};

const formatWithSeparator = (value: number): string =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(value);

interface SelectedActivities {
  [service: string]: {
    [activityKey: string]: number;
  };
}

export default function CheckoutPage() {
  const router = useRouter();

  const [checkoutData, setCheckoutData] = useState<{
    address: string;
    photos: string[];
    description: string;
    date: string | null;
    selectedActivities: SelectedActivities;
  } | null>(null);


  const filteredSteps =
    (loadFromSession("filteredSteps") as {
      serviceName: string;
      steps: any[];
    }[]) || [];

  useEffect(() => {
    const selectedActivities: SelectedActivities =
      loadFromSession("selectedActivities") || {};
    const address: string = loadFromSession("address") || "";
    const photos: string[] = loadFromSession("photos") || [];
    const description: string = loadFromSession("description") || "";
    const date: string | null =
      loadFromSession("selectedTime") || "No date selected";

    if (
      !selectedActivities ||
      Object.keys(selectedActivities).length === 0 ||
      !address
    ) {
      router.push("/emergency/estimate");
      return;
    }

    const data = {
      address,
      photos,
      description,
      date: date || "No date selected",
      selectedActivities,
    };

    setCheckoutData(data);
    saveToSession("checkoutData", data);
  }, [router]);

  if (!checkoutData) return <p>Loading...</p>;

  const selectedActivities = checkoutData.selectedActivities;
  const timeCoefficient: number = loadFromSession("timeCoefficient") || 1;

  const calculateSubtotal = (): number => {
    let total = 0;
    for (const service in selectedActivities) {
      for (const activityKey in selectedActivities[service]) {
        const activity = ALL_SERVICES.find((a) => a.id === activityKey);
        if (activity) {
          total +=
            activity.price * (selectedActivities[service][activityKey] || 1);
        }
      }
    }
    return total;
  };

  const subtotal = calculateSubtotal();
  const adjustedSubtotal = subtotal * timeCoefficient;
  const salesTax = adjustedSubtotal * 0.0825;
  const total = adjustedSubtotal + salesTax;

  const hasSurchargeOrDiscount = timeCoefficient !== 1;
  const surchargeOrDiscountAmount = hasSurchargeOrDiscount
    ? Math.abs(subtotal * (timeCoefficient - 1))
    : 0;

  return (
    <main className="min-h-screen py-24">
      <div className="container mx-auto">
        <BreadCrumb items={EMERGENCY_STEPS} />

        {/* Upper block with Back и Place your order */}
        <div className="flex justify-between items-center mt-8">
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => router.back()}
          >
            ← Back
          </span>
          <button
            className="bg-yellow-400 hover:bg-yellow-500 text-black py-3 px-6 rounded-md font-semibold text-lg shadow-sm transition-colors duration-200"
            onClick={() => {}}
          >
            Place your order
          </button>
        </div>
      </div>

      <div className="container mx-auto py-12">
        <SectionBoxTitle>Checkout</SectionBoxTitle>

        <div className="bg-white border-gray-300 mt-8 p-6 rounded-lg space-y-6">
          {/* Estimate */}
          <div>
            <SectionBoxSubtitle>Estimate</SectionBoxSubtitle>
            <div className="mt-4 space-y-4">
              {Object.entries(selectedActivities).flatMap(([, activities]) =>
                Object.entries(activities).map(([activityKey, quantity]) => {
                  const activity = ALL_SERVICES.find(
                    (a) => a.id === activityKey
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
              {hasSurchargeOrDiscount && (
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
                    {formatWithSeparator(surchargeOrDiscountAmount)}
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

              <div className="flex justify-between text-2xl font-semibold mt-4">
                <span>Total</span>
                <span>${formatWithSeparator(total)}</span>
              </div>
            </div>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* Date */}
          <div>
            <SectionBoxSubtitle>Date of Service</SectionBoxSubtitle>
            <p className="text-gray-800">{checkoutData.date}</p>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* Problem Description */}
          <div>
            <SectionBoxSubtitle>Problem Description</SectionBoxSubtitle>
            <p className="text-gray-700">{checkoutData.description}</p>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* Address */}
          <div>
            <SectionBoxSubtitle>Address</SectionBoxSubtitle>
            <p className="text-gray-800">{checkoutData.address}</p>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* Uploaded Photos */}
          <div>
            <SectionBoxSubtitle>Uploaded Photos</SectionBoxSubtitle>
            <div className="grid grid-cols-6 gap-2">
              {checkoutData.photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-24 object-cover rounded"
                />
              ))}
            </div>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* Emergency Steps from filteredSteps */}
          <div>
            <SectionBoxSubtitle>Emergency Steps</SectionBoxSubtitle>
            {filteredSteps.length > 0 ? (
              <div className="space-y-6 mt-4">
                {filteredSteps.map((service) => (
                  <div
                    key={service.serviceName}
                    className="bg-white p-6 rounded-lg border border-gray-200"
                  >
                    <h3 className="text-xl font-semibold text-gray-800">
                      {service.serviceName}
                    </h3>
                    <div className="mt-4 space-y-4">
                      {service.steps.map((step) => (
                        <div key={step.step_number} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="text-lg font-medium">
                              {step.step_number}.
                            </h4>
                            <h4 className="text-lg font-medium">
                              {step.title}
                            </h4>
                          </div>
                          <p className="text-gray-600">{step.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 mt-4">No steps available.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
