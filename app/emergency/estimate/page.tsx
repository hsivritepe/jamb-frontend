"use client";

import { useRouter, useSearchParams } from "next/navigation";
import BreadCrumb from "@/components/ui/BreadCrumb";
import { EMERGENCY_STEPS } from "@/constants/navigation";
import { SectionBoxTitle } from "@/components/ui/SectionBoxTitle";
import { SectionBoxSubtitle } from "@/components/ui/SectionBoxSubtitle";
import { EMERGENCY_SERVICES } from "@/constants/emergency";
import { ALL_SERVICES } from "@/constants/services";
import Image from "next/image";

// Utility function to format numbers with thousand separators
const formatWithSeparator = (value: number): string => {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(
    value
  );
};

// Utility function to capitalize and transform text
const capitalizeAndTransform = (text: string): string => {
  return text
    .replace(/([A-Z])/g, " $1") // Add spaces before capital letters
    .trim()
    .replace(/^./, (char) => char.toUpperCase()); // Capitalize the first letter
};

// EmergencyServices Type Interface
interface Step {
  title: string;
  description: string;
}

interface EmergencyService {
  steps?: Step[];
}

export default function EmergencyEstimate() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse URL parameters for dynamic data
  const selectedActivities = JSON.parse(
    searchParams.get("selectedActivities") || "{}"
  ) as Record<string, Record<string, number>>;
  const address = searchParams.get("address") || "No address provided";
  const photos = JSON.parse(searchParams.get("photos") || "[]") as string[];
  const description = searchParams.get("description") || "No description provided";

  // Calculate total price dynamically
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
  const salesTax = subtotal * 0.0825; // Example 8.25% tax
  const total = subtotal + salesTax;

  return (
    <main className="min-h-screen pt-24">
      {/* Breadcrumb Navigation */}
      <div className="container mx-auto">
        <BreadCrumb items={EMERGENCY_STEPS} />
      </div>

      <div className="container mx-auto py-12">
        <div className="flex gap-12">
          {/* Left Column - Steps */}
          <div className="flex-1">
            <SectionBoxTitle>Next Steps for Selected Services</SectionBoxTitle>

            {/* Loop through all selected services */}
            <div className="mt-8 space-y-8 bg-gray-100 p-6 rounded-xl">
              {Object.entries(selectedActivities).map(([service]) => {
                const steps: Step[] =
                  (EMERGENCY_SERVICES as Record<string, EmergencyService>)[
                    service
                  ]?.steps || [];
                return (
                  <div key={service} className="space-y-4">
                    <h3 className="text-xl font-medium text-gray-800">
                      {capitalizeAndTransform(service)}
                    </h3>
                    {steps.length > 0 ? (
                      steps.map((step, index) => (
                        <div key={index} className="space-y-2">
                          <h4 className="text-lg font-medium">
                            {index + 1}. {step.title}
                          </h4>
                          <p className="text-gray-600">{step.description}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600">No steps available.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column - Estimate */}
          <div className="w-[400px]">
            <div className="bg-brand-light p-6 rounded-xl">
              <SectionBoxSubtitle>Estimate</SectionBoxSubtitle>

              {/* Selected Activities List */}
              <div className="mt-4 space-y-4">
                {Object.entries(selectedActivities).flatMap(
                  ([service, activities]) =>
                    Object.entries(activities).map(([activityKey, quantity]) => {
                      const activity = ALL_SERVICES.find(
                        (s) => s.id === activityKey
                      );
                      if (!activity) return null;

                      return (
                        <div
                          key={activityKey}
                          className="flex items-start gap-2"
                        >
                          <span className="text-brand">•</span>
                          <div>
                            <h3 className="font-medium">{activity.title}</h3>
                            <div className="text-sm text-gray-500">
                              <span>{activity.description}</span>
                              <span> • </span>
                              <span>Qty: {quantity}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>

              {/* Summary Section */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${formatWithSeparator(subtotal)}</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="text-gray-600">Sales tax (8.25%)</span>
                  <span>${formatWithSeparator(salesTax)}</span>
                </div>
                <div className="flex justify-between text-xl font-semibold">
                  <span>Total</span>
                  <span>${formatWithSeparator(total)}</span>
                </div>
              </div>

              {/* Address Section */}
              <div className="mt-6">
                <SectionBoxSubtitle>Address</SectionBoxSubtitle>
                <p className="text-gray-500 mt-2">{address}</p>
              </div>

              {/* Uploaded Photos */}
              <div className="mt-6">
                <SectionBoxSubtitle>Uploaded Photos</SectionBoxSubtitle>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {photos.map((photo, index) => (
                    <Image
                      key={index}
                      src={photo}
                      alt={`Uploaded Photo ${index + 1}`}
                      width={100}
                      height={100}
                      className="object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>

              {/* Problem Description */}
              <div className="mt-6">
                <SectionBoxSubtitle>Problem Description</SectionBoxSubtitle>
                <p className="text-gray-500 mt-2 whitespace-pre-wrap">
                  {description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-4">
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium">
                  Add to order &nbsp;→
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