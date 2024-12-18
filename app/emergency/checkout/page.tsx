"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SectionBoxTitle } from "@/components/ui/SectionBoxTitle";
import { SectionBoxSubtitle } from "@/components/ui/SectionBoxSubtitle";
import BreadCrumb from "@/components/ui/BreadCrumb";
import Button from "@/components/ui/Button";
import { EMERGENCY_STEPS } from "@/constants/navigation";
import { EMERGENCY_SERVICES } from "@/constants/emergency";
import { ALL_SERVICES } from "@/constants/services";

// Utility functions
const saveToSession = (key: string, value: any) => {
  sessionStorage.setItem(key, JSON.stringify(value));
};

const loadFromSession = (key: string) => {
  const savedValue = sessionStorage.getItem(key);
  return savedValue ? JSON.parse(savedValue) : null;
};

const formatWithSeparator = (value: number): string =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(value);

const capitalizeAndTransform = (text: string): string =>
  text
    .replace(/([A-Z])/g, " $1")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());

interface SelectedActivities {
  [service: string]: {
    [activityKey: string]: number;
  };
}

interface Step {
  title: string;
  description: string;
  step_number: number;
}

interface ServiceStep {
  serviceName: string;
  steps: Step[];
}

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [checkoutData, setCheckoutData] = useState<{
    address: string;
    photos: string[];
    description: string;
    date: string;
    selectedActivities: SelectedActivities;
  } | null>(null);

  useEffect(() => {
    const dataFromSearchParams = {
      address: searchParams.get("address") || "No address provided",
      photos: JSON.parse(searchParams.get("photos") || "[]") as string[],
      description: searchParams.get("description") || "No description provided",
      date: searchParams.get("date") || "No date selected",
      selectedActivities: JSON.parse(
        searchParams.get("selectedActivities") || "{}"
      ) as SelectedActivities,
    };

    const storedSessionData = loadFromSession("checkoutData");

    if (
      dataFromSearchParams.selectedActivities &&
      Object.keys(dataFromSearchParams.selectedActivities).length > 0
    ) {
      setCheckoutData(dataFromSearchParams);
      saveToSession("checkoutData", dataFromSearchParams);
    } else if (storedSessionData) {
      setCheckoutData(storedSessionData);
    } else {
      router.push("/emergency/estimate");
    }
  }, [searchParams, router]);

  if (!checkoutData) return <p>Loading...</p>;

  const generateSteps = (): ServiceStep[] => {
    const steps: ServiceStep[] = [];
    const shownServices = new Set<string>();

    Object.entries(checkoutData.selectedActivities).forEach(
      ([service, activities]) => {
        Object.keys(activities).forEach((activityKey) => {
          for (const category of Object.keys(EMERGENCY_SERVICES)) {
            const services = EMERGENCY_SERVICES[category]?.services || {};
            for (const serviceKey in services) {
              if (
                services[serviceKey]?.activities?.[activityKey] &&
                !shownServices.has(serviceKey)
              ) {
                steps.push({
                  serviceName: capitalizeAndTransform(serviceKey),
                  steps: services[serviceKey]?.steps || [],
                });
                shownServices.add(serviceKey);
              }
            }
          }
        });
      }
    );

    return steps;
  };

  const stepsList = generateSteps();

  const calculateTotal = (): number => {
    let total = 0;
    Object.entries(checkoutData.selectedActivities).forEach(
      ([_, activities]) => {
        Object.entries(activities).forEach(([activityKey, quantity]) => {
          const activity = ALL_SERVICES.find((a) => a.id === activityKey);
          if (activity) {
            total += activity.price * quantity;
          }
        });
      }
    );
    return total;
  };

  const total = calculateTotal();

  return (
    <main className="min-h-screen py-24">
      <div className="container mx-auto">
        <BreadCrumb items={EMERGENCY_STEPS} />
        <div className="text-right mb-4">
          <Button onClick={() => router.back()} className="py-2 px-4">
            ← Back to Estimate
          </Button>
        </div>
      </div>

      <div className="container mx-auto py-12">
        <SectionBoxTitle>Checkout</SectionBoxTitle>

        <div className="bg-white border-gray-300 mt-8 p-6 rounded-lg space-y-6">
          {/* Estimate */}
          <div>
            <SectionBoxSubtitle>Estimate</SectionBoxSubtitle>
            {Object.entries(checkoutData.selectedActivities).map(
              ([, activities]) =>
                Object.entries(activities).map(([activityKey, quantity]) => {
                  const activity = ALL_SERVICES.find(
                    (a) => a.id === activityKey
                  );
                  return (
                    <div
                      key={activityKey}
                      className="flex justify-between border-b py-2"
                    >
                      <span className="text-gray-800">
                        {activity?.title || "Unknown Activity"}
                      </span>
                      <span>
                        {quantity} x $
                        {formatWithSeparator(activity?.price || 0)}
                      </span>
                    </div>
                  );
                })
            )}
            <div className="text-lg font-semibold text-right mt-4">
              Total: ${formatWithSeparator(total)}
            </div>
          </div>

          {/* Date */}
          <div>
            <SectionBoxSubtitle>Date of Service</SectionBoxSubtitle>
            <p className="text-gray-800">{checkoutData.date}</p>
          </div>

          {/* Problem Description */}
          <div>
            <SectionBoxSubtitle>Problem Description</SectionBoxSubtitle>
            <p className="text-gray-700">{checkoutData.description}</p>
          </div>

          {/* Address */}
          <div>
            <SectionBoxSubtitle>Address</SectionBoxSubtitle>
            <p className="text-gray-800">{checkoutData.address}</p>
          </div>

          {/* Uploaded Photos */}
          <div>
            <SectionBoxSubtitle>Uploaded Photos</SectionBoxSubtitle>
            <div className="grid grid-cols-3 gap-4">
              {checkoutData.photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-32 object-cover rounded-md border"
                />
              ))}
            </div>
          </div>

          {/* Emergency Steps */}
          <div>
            <SectionBoxSubtitle>Emergency Steps</SectionBoxSubtitle>
            {stepsList.length > 0 ? (
              stepsList.map((service) => (
                <div key={service.serviceName} className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {service.serviceName}
                  </h3>
                  {service.steps.map((step) => (
                    <p key={step.step_number} className="text-gray-600">
                      {step.step_number}. {step.title}: {step.description}
                    </p>
                  ))}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No steps available.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
