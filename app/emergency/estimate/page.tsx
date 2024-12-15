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

// Utility function to capitalize and transform camelCase or PascalCase text
const capitalizeAndTransform = (text: string): string => {
  return text
    .replace(/([A-Z])/g, " $1") // Add spaces before capital letters
    .trim()
    .replace(/^./, (char) => char.toUpperCase()); // Capitalize the first letter
};

// Interface for the steps of an emergency service
interface Step {
  title: string;
  description: string;
}

// Interface for an emergency service
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
  const description =
    searchParams.get("description") || "No description provided";

  // Function to calculate the total cost of selected activities
  const calculateTotal = () => {
    let total = 0;

    // Loop through all selected activities and calculate total price
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
  const salesTax = subtotal * 0.0825; // 8.25% sales tax
  const total = subtotal + salesTax;

  return (
    <main className="min-h-screen pt-24">
      {/* Breadcrumb Navigation */}
      <div className="container mx-auto">
        <BreadCrumb items={EMERGENCY_STEPS} />
      </div>

      <div className="container mx-auto py-12">
        <div className="flex gap-12">
          {/* Left Column: Steps for Selected Services */}
          <div className="flex-1">
            <SectionBoxTitle>Next Steps for Selected Services</SectionBoxTitle>

            {/* Display steps for each unique service */}
            <div className="mt-8 space-y-8">
              {(() => {
                const shownServices = new Set<string>(); // Tracks already displayed services

                return Object.entries(selectedActivities).flatMap(
                  ([, activities]) =>
                    Object.keys(activities).map((activityKey) => {
                      let matchedService = null;
                      let matchedServiceKey = "";

                      // Find the matching service for the current activity
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

                      // Skip already displayed services
                      if (
                        !matchedService ||
                        shownServices.has(matchedServiceKey)
                      )
                        return null;

                      shownServices.add(matchedServiceKey);

                      return (
                        // Service Card Container
                        <div
                          key={matchedServiceKey}
                          className="bg-white p-6 rounded-lg border border-gray-200"
                        >
                          {/* Service Subtitle */}
                          <SectionBoxSubtitle>
                            {capitalizeAndTransform(matchedServiceKey)}
                          </SectionBoxSubtitle>

                          {/* Steps for the Service */}
                          <div className="mt-4 space-y-4">
                            {matchedService.steps?.length > 0 ? (
                              matchedService.steps.map((step) => (
                                <div key={step.title} className="space-y-2">
                                  {/* Step Number and Title in One Line */}
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-lg font-medium">
                                      {step.step_number}.
                                    </h4>
                                    <h4 className="text-lg font-medium">
                                      {step.title}
                                    </h4>
                                  </div>
                                  {/* Step Description */}
                                  <p className="text-gray-600">
                                    {step.description}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-600">
                                No steps available.
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })
                );
              })()}
            </div>
          </div>

          {/* Right Column: Estimate Summary */}
          <div className="w-[500px]">
            <div className="bg-brand-light p-6 rounded-xl">
              <SectionBoxSubtitle>Estimate</SectionBoxSubtitle>

              {/* List all selected activities */}
              <div className="mt-4 space-y-4">
                {Object.entries(selectedActivities).flatMap(
                  ([service, activities]) =>
                    Object.entries(activities).map(
                      ([activityKey, quantity]) => {
                        const activity = ALL_SERVICES.find(
                          (s) => s.id === activityKey
                        );
                        if (!activity) return null;

                        return (
                          <div
                            key={activityKey}
                            className="flex justify-between items-start gap-4 border-b pb-2"
                          >
                            {/* Left: Activity Title */}
                            <div>
                              <h3 className="font-medium text-lg text-gray-800">
                                {activity.title}
                              </h3>
                              <div className="text-sm text-gray-500 mt-1">
                                {/* Description */}
                                <span>{activity.description}</span>
                              </div>
                              <div className="text-medium font-medium text-gray-800 mt-2">
                                {/* Quantity and Units */}
                                <span>{quantity} </span>
                                <span>
                                  {activity.unit_of_measurement}
                                </span>
                              </div>
                            </div>

                            {/* Right: Price Information */}
                            <div className="text-right mt-auto">
                              <span className="block text-gray-800 font-medium">
                                $
                                {formatWithSeparator(activity.price * quantity)}
                              </span>
                            </div>
                          </div>
                        );
                      }
                    )
                )}
              </div>
              {/* Summary of costs */}
              <div className="pt-4 mt-4">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-lg text-gray-800">Subtotal</span>
                  <span className="font-semibold text-lg text-gray-800">${formatWithSeparator(subtotal)}</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="text-gray-600">Sales tax (8.25%)</span>
                  <span>${formatWithSeparator(salesTax)}</span>
                </div>
                <div className="flex justify-between text-2xl font-semibold">
                  <span>Total</span>
                  <span>${formatWithSeparator(total)}</span>
                </div>
              </div>

              {/* Address Display */}
              <div className="mt-6">
                <h3 className="font-semibold text-xl text-gray-800">Address</h3>
                <p className="text-gray-500 mt-2">{address}</p>
              </div>

              {/* Uploaded Photos Display */}
              <div className="mt-6">
              <h3 className="font-semibold text-xl text-gray-800">Uploaded Photos</h3>
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
              <h3 className="font-semibold text-xl text-gray-800">Problem Description</h3>
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
