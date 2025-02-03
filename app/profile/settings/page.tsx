"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// 1) Helper function for greeting
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function SettingsPage() {
  const router = useRouter();
  const [token, setToken] = useState("");

  // Example user preferences
  const [language, setLanguage] = useState("English");
  const [measurement, setMeasurement] = useState("Feet");
  const [currency, setCurrency] = useState("US $");

  const [showEditModal, setShowEditModal] = useState(false);
  const editModalRef = useRef<HTMLDivElement>(null);

  // 2) State to hold user’s name (if any) from session
  const [userName, setUserName] = useState("");
  const [hasName, setHasName] = useState(false);

  // Fetch token (and optionally preferences) on mount
  useEffect(() => {
    const storedToken = sessionStorage.getItem("authToken");
    if (!storedToken) {
      router.push("/login");
      return;
    }
    setToken(storedToken);

    // Attempt to read user’s name from "profileData"
    const storedProfile = sessionStorage.getItem("profileData");
    if (storedProfile) {
      try {
        const parsed = JSON.parse(storedProfile);
        const name = parsed?.name?.trim();
        if (name) {
          setUserName(name);
          setHasName(true);
        }
      } catch (err) {
        console.warn("Failed to parse profileData in Settings:", err);
      }
    }
  }, [router]);

  // For logout
  function handleLogout() {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("profileData"); // also remove cached profile
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
    alert("Preferences saved!");
    setShowEditModal(false);
  };

  // ========== Delete account ==========
  async function handleDeleteAccount() {
    const confirmMsg = "Are you sure you want to delete your account? This cannot be undone.";
    if (!window.confirm(confirmMsg)) {
      return; // user canceled
    }

    if (!token) {
      alert("No token found. Please log in first.");
      return;
    }

    try {
      const response = await fetch("http://dev.thejamb.com/user/delete", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        alert("Account deleted successfully. Goodbye!");
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("profileData");
        window.dispatchEvent(new Event("authChange"));
        router.push("/login");
      } else if (response.status === 400) {
        const data = await response.json();
        alert("Delete error: " + data.error);
      } else if (response.status === 404) {
        const data = await response.json();
        alert("Delete error: " + data.error);
      } else {
        alert("Unknown error deleting account. Status: " + response.status);
      }
    } catch (err) {
      console.error("Delete account error:", err);
      alert("Failed to delete account. Check console.");
    }
  }

  // 3) Build greeting
  const greetingText = getGreeting();

  return (
    <div className="pt-24 min-h-screen w-full bg-gray-50 pb-10">
      <div className="max-w-7xl mx-0 sm:mx-auto px-0 sm:px-4">
        {/* Greeting */}
        <h1 className="text-2xl sm:text-3xl font-bold mt-6 mb-2">
          {greetingText}, {hasName ? userName : "Guest"}!
        </h1>

        {/* Nav row => includes "Messages" */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-8">
            <Link href="/profile" className="text-gray-600 hover:text-blue-600">
              Profile
            </Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-blue-600">
              Orders
            </Link>
            <Link href="/profile/messages" className="text-gray-600 hover:text-blue-600">
              Messages
            </Link>
            {/* Active => Settings */}
            <Link
              href="/profile/settings"
              className="text-blue-600 border-b-2 border-blue-600"
            >
              Settings
            </Link>
          </div>
        </div>

        {/* Preferences block */}
        <h2 className="text-xl font-semibold mb-3">Details</h2>

        <div
          className="
            bg-white p-4 rounded-md shadow-sm
            flex flex-col sm:flex-row
            items-start sm:items-center
            justify-between
            mb-4
          "
        >
          <div
            className="
              flex flex-col sm:flex-row
              gap-4 sm:gap-12
              text-sm text-gray-700
            "
          >
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

          <button
            onClick={() => setShowEditModal(true)}
            className="text-blue-600 hover:underline text-sm mt-3 sm:mt-0"
          >
            Edit
          </button>
        </div>

        {/* Logout button */}
        <div className="bg-white p-4 rounded-md shadow-sm mb-4">
          <button
            onClick={handleLogout}
            className="border border-red-500 text-red-500 font-medium px-12 py-2 rounded hover:bg-red-50"
          >
            Log out
          </button>
        </div>

        {/* Delete Account button */}
        <div className="bg-white p-4 rounded-md shadow-sm">
          <button
            onClick={handleDeleteAccount}
            className="bg-red-500 text-white font-medium px-5 py-2 rounded hover:bg-red-600"
          >
            Delete Account
          </button>
        </div>
      </div>

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