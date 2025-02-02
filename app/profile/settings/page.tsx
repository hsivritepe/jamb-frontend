"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SettingsPage() {
  const router = useRouter();
  const [token, setToken] = useState("");

  // Example user preferences
  const [language, setLanguage] = useState("English");
  const [measurement, setMeasurement] = useState("Feet");
  const [currency, setCurrency] = useState("US $");

  const [showEditModal, setShowEditModal] = useState(false);
  const editModalRef = useRef<HTMLDivElement>(null);

  // Fetch token (and optionally preferences) on mount
  useEffect(() => {
    const storedToken = sessionStorage.getItem("authToken");
    if (!storedToken) {
      router.push("/login");
      return;
    }
    setToken(storedToken);
    // If needed, fetch preferences from server with this token
  }, [router]);

  function handleLogout() {
    sessionStorage.removeItem("authToken");
    window.dispatchEvent(new Event("authChange"));
    router.push("/login");
  }

  // Close modal on outside click
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (showEditModal && editModalRef.current) {
        if (!editModalRef.current.contains(e.target as Node)) {
          setShowEditModal(false);
        }
      }
    }
    if (showEditModal) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showEditModal]);

  // Example "save" handler
  const handleSave = () => {
    // Possibly do a PATCH request to update preferences on server
    alert("Preferences saved!");
    setShowEditModal(false);
  };

  return (
    <div className="pt-24 min-h-screen w-full bg-gray-50 pb-10">
      <div className="max-w-7xl mx-0 sm:mx-auto px-0 sm:px-4">
        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold mt-6 mb-2">Settings</h1>

        {/* Sub navigation row */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-8">
            <Link href="/profile" className="text-gray-600 hover:text-blue-600">
              Profile
            </Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-blue-600">
              Orders
            </Link>
            {/* Active page => Settings => text-blue + underline */}
            <Link
              href="/profile/settings"
              className="text-blue-600 border-b-2 border-blue-600"
            >
              Settings
            </Link>
          </div>
          <button
            onClick={handleLogout}
            className="text-red-500 hover:text-red-600"
          >
            Log out
          </button>
        </div>

        {/* Main content => preference block */}
        <h2 className="text-xl font-semibold mb-3">Details</h2>

        {/*
          "flex flex-col sm:flex-row ..." makes the content stacked in a column on mobile,
          and side by side on larger screens.
          We do the same for the "items-start sm:items-center justify-between" to align the button.
        */}
        <div className="
          bg-white p-4 rounded-md shadow-sm
          flex flex-col sm:flex-row
          items-start sm:items-center
          justify-between
          mb-10
        ">
          {/* Left side: the 3 preferences => stack on mobile, row on larger */}
          <div className="
            flex flex-col sm:flex-row
            gap-4 sm:gap-12
            text-sm text-gray-700
          ">
            <div>
              <p className="font-medium text-gray-500">Language</p>
              <p>{language}</p>
            </div>
            <div>
              <p className="font-medium text-gray-500">Measurement system</p>
              <p>{measurement}</p>
            </div>
            <div>
              <p className="font-medium text-gray-500">Currency</p>
              <p>{currency}</p>
            </div>
          </div>

          {/* Right side: Edit button */}
          <button
            onClick={() => setShowEditModal(true)}
            className="text-blue-600 hover:underline text-sm mt-3 sm:mt-0"
          >
            Edit
          </button>
        </div>

        {/* Additional links (demo) */}
        <div className="space-y-4 text-gray-800">
          <div className="flex items-center gap-2">
            <a href="/about-us" className="hover:text-blue-600">
              About us
            </a>
          </div>
          <div className="flex items-center gap-2">
            <a href="/become-a-pro" className="hover:text-blue-600">
              Become a Professional
            </a>
          </div>
        </div>
      </div>

      {/* Edit details side modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex justify-end">
          <div
            ref={editModalRef}
            className="bg-white w-full sm:w-[400px] h-full p-6 flex flex-col relative"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit details</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-800 text-xl"
              >
                &times;
              </button>
            </div>

            {/* Form fields: Language, Measurement, Currency */}
            <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
              {/* Language */}
              <div>
                <label className="block text-sm mb-1 text-gray-600">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-3 border rounded-md"
                >
                  <option>English</option>
                  <option>French</option>
                  <option>Spanish</option>
                  <option>German</option>
                </select>
              </div>
              {/* Measurement */}
              <div>
                <label className="block text-sm mb-1 text-gray-600">
                  Measurement system
                </label>
                <select
                  value={measurement}
                  onChange={(e) => setMeasurement(e.target.value)}
                  className="w-full p-3 border rounded-md"
                >
                  <option>Feet</option>
                  <option>Meters</option>
                </select>
              </div>
              {/* Currency */}
              <div>
                <label className="block text-sm mb-1 text-gray-600">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full p-3 border rounded-md"
                >
                  <option>US $</option>
                  <option>CAD $</option>
                  <option>€ EUR</option>
                  <option>£ GBP</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSave}
              className="mt-6 bg-blue-600 text-white font-semibold p-3 rounded-md hover:bg-blue-700"
            >
              Save →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}