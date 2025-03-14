"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { usePhotos } from "@/context/PhotosContext";

function preserveAuthAndClearOthers() {
  const authToken = sessionStorage.getItem("authToken");
  const profileData = sessionStorage.getItem("profileData");
  const userEmail = sessionStorage.getItem("userEmail");
  sessionStorage.clear();
  if (authToken) sessionStorage.setItem("authToken", authToken);
  if (profileData) sessionStorage.setItem("profileData", profileData);
  if (userEmail) sessionStorage.setItem("userEmail", userEmail);
}

const CLEAR_DELAY_MS = 3000;

export default function ThankYouPage() {
  const router = useRouter();
  const [orderCode, setOrderCode] = useState("");
  const [orderTotal, setOrderTotal] = useState("");
  const { setPhotos } = usePhotos();

  useEffect(() => {
    const codeFromSession = sessionStorage.getItem("orderCode") || "";
    const totalFromSession = sessionStorage.getItem("orderTotal") || "";
    setOrderCode(codeFromSession);
    setOrderTotal(totalFromSession);

    // Clear all photos from context
    setPhotos([]);

    const header = document.querySelector("header");
    const footer = document.querySelector("footer");
    if (header) header.style.pointerEvents = "none";
    if (footer) footer.style.pointerEvents = "none";

    const timer = setTimeout(() => {
      preserveAuthAndClearOthers();
      if (header) header.style.pointerEvents = "auto";
      if (footer) footer.style.pointerEvents = "auto";
    }, CLEAR_DELAY_MS);

    return () => {
      clearTimeout(timer);
      if (header) header.style.pointerEvents = "auto";
      if (footer) footer.style.pointerEvents = "auto";
    };
  }, [setPhotos]);

  const handleGoToDashboard = () => {
    preserveAuthAndClearOthers();
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen pt-24 pb-10 bg-gray-50 flex items-center">
      <div className="max-w-xl mx-auto px-4 w-full">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <CheckCircle className="text-blue-600 w-16 h-16 mx-auto mb-4" />
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Thank you for your order!
          </h1>
          <p className="text-gray-700 mb-6">
            We have successfully saved your order details.
          </p>

          {orderCode && (
            <div className="mb-6">
              <p className="mb-1 text-gray-800">
                <strong>Order Number:</strong> {orderCode}
              </p>
              <p className="text-gray-800">
                <strong>Total Amount:</strong>{" "}
                {orderTotal ? `$${orderTotal}` : "--"}
              </p>
            </div>
          )}

          <button
            onClick={handleGoToDashboard}
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded font-medium hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </main>
  );
}