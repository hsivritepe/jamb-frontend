"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SectionBoxTitle } from "@/components/ui/SectionBoxTitle";
import { SectionBoxSubtitle } from "@/components/ui/SectionBoxSubtitle";
import BreadCrumb from "@/components/ui/BreadCrumb";
import Button from "@/components/ui/Button";
import { EMERGENCY_STEPS } from "@/constants/navigation";

// Utility functions
const saveToSession = (key: string, value: any) => {
  sessionStorage.setItem(key, JSON.stringify(value));
};

const loadFromSession = (key: string) => {
  const savedValue = sessionStorage.getItem(key);
  return savedValue ? JSON.parse(savedValue) : null;
};

// Function to calculate total price
const calculateTotal = (activities: Record<string, any>) => {
  let total = 0;
  for (const service in activities) {
    for (const price of Object.values(activities[service])) {
      total += Number(price);
    }
  }
  return total.toFixed(2);
};

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State to store the data passed from the previous page
  const [checkoutData, setCheckoutData] = useState<any>(null);

  useEffect(() => {
    const data = {
      address: searchParams.get("address") || "No address provided",
      photos: JSON.parse(searchParams.get("photos") || "[]"),
      description: searchParams.get("description") || "No description provided",
      date: searchParams.get("date") || "No date selected",
      selectedActivities: JSON.parse(
        searchParams.get("selectedActivities") || "{}"
      ),
    };

    setCheckoutData(data);
    saveToSession("checkoutData", data);
  }, [searchParams]);

  const storedData = checkoutData || loadFromSession("checkoutData");

  if (!storedData) return <p>Loading...</p>;

  return (
    <main className="min-h-screen py-24">
      {/* Breadcrumb Navigation */}
      <div className="container mx-auto">
        <BreadCrumb items={EMERGENCY_STEPS} />
      </div>

      <div className="container mx-auto py-12">
        {/* Page Title */}
        <SectionBoxTitle>Checkout</SectionBoxTitle>

        {/* Place Order Button */}
        <div className="text-center mt-6">
          <Button className="px-6 py-3 text-lg" disabled>
            Place Your Order
          </Button>
        </div>

        {/* Checkout Content */}
        <div className="bg-white border-gray-300 mt-8 p-6 rounded-lg space-y-6">
          {/* Emergency Steps */}
          <div>
            <SectionBoxSubtitle>Emergency Steps</SectionBoxSubtitle>
            <p className="text-gray-600">
              Steps have been pre-selected based on your services.
            </p>
          </div>

          {/* Address */}
          <div>
            <SectionBoxSubtitle>Address</SectionBoxSubtitle>
            <p className="text-gray-800">{storedData.address}</p>
          </div>

          {/* Uploaded Photos */}
          <div>
            <SectionBoxSubtitle>Uploaded Photos</SectionBoxSubtitle>
            <div className="grid grid-cols-3 gap-4">
              {storedData.photos.length > 0 ? (
                storedData.photos.map((photo: string, index: number) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Uploaded photo ${index + 1}`}
                    className="w-full h-32 object-cover rounded-md border"
                  />
                ))
              ) : (
                <p className="text-gray-500">No photos uploaded.</p>
              )}
            </div>
          </div>

          {/* Problem Description */}
          <div>
            <SectionBoxSubtitle>Description</SectionBoxSubtitle>
            <p className="text-gray-700 whitespace-pre-wrap">
              {storedData.description}
            </p>
          </div>

          {/* Date */}
          <div>
            <SectionBoxSubtitle>Date of Service</SectionBoxSubtitle>
            <p className="text-gray-800">{storedData.date}</p>
          </div>

          {/* Estimate Section */}
          <div>
            <SectionBoxSubtitle>Estimate</SectionBoxSubtitle>
            <div className="p-4 border rounded-md bg-gray-50">
              <p className="text-gray-800 text-lg">
                Total:{" "}
                <span className="font-bold text-green-600">
                  ${calculateTotal(storedData.selectedActivities)}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}