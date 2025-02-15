"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

/**
 * Preserves only "authToken" and "profileData" in sessionStorage.
 * Clears everything else (order data, search queries, etc.).
 */
function preserveAuthAndClearOthers() {
  const authToken = sessionStorage.getItem("authToken");
  const profileData = sessionStorage.getItem("profileData");

  // Clear all session storage
  sessionStorage.clear();

  // Restore only auth items
  if (authToken) {
    sessionStorage.setItem("authToken", authToken);
  }
  if (profileData) {
    sessionStorage.setItem("profileData", profileData);
  }
}

// Time (in milliseconds) before session data (except auth) is cleared
// and header/footer become clickable again.
const CLEAR_DELAY_MS = 3000;

export default function ThankYouPage() {
  const router = useRouter();

  // Local state for displaying order info
  const [orderCode, setOrderCode] = useState("");
  const [orderTotal, setOrderTotal] = useState("");

  useEffect(() => {
    // 1) Retrieve order details from sessionStorage on mount
    const codeFromSession = sessionStorage.getItem("orderCode") || "";
    const totalFromSession = sessionStorage.getItem("orderTotal") || "";
    setOrderCode(codeFromSession);
    setOrderTotal(totalFromSession);

    // 2) Temporarily disable clicking in header/footer
    const header = document.querySelector("header");
    const footer = document.querySelector("footer");
    if (header) header.style.pointerEvents = "none";
    if (footer) footer.style.pointerEvents = "none";

    // 3) Set a timer to clear session (except auth) and restore pointer events
    const timer = setTimeout(() => {
      preserveAuthAndClearOthers();
      if (header) header.style.pointerEvents = "auto";
      if (footer) footer.style.pointerEvents = "auto";
    }, CLEAR_DELAY_MS);

    // 4) Cleanup: if user leaves this page earlier (unmount),
    //    clear the timer and restore pointer events in header/footer.
    return () => {
      clearTimeout(timer);
      if (header) header.style.pointerEvents = "auto";
      if (footer) footer.style.pointerEvents = "auto";
    };
  }, []);

  /**
   * If the user clicks "Go to Dashboard" before the timer,
   * we immediately clear the session (except auth) and navigate to /dashboard.
   * On unmount, the pointer events are restored anyway.
   */
  const handleGoToDashboard = () => {
    preserveAuthAndClearOthers();
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen pt-24 pb-10 bg-gray-50 flex items-center">
      <div className="max-w-xl mx-auto px-4 w-full">
        {/* Container for the thank-you card */}
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          {/* Icon */}
          <CheckCircle className="text-blue-600 w-16 h-16 mx-auto mb-4" />

          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Thank you for your order!
          </h1>
          <p className="text-gray-700 mb-6">
            We have successfully saved your order details.
          </p>

          {/* Show order number and total if they exist */}
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