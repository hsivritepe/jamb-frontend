"use client";

export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/**
 * Helper for time-based greeting
 */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function OrdersPage() {
  const router = useRouter();
  const [token, setToken] = useState("");

  const [userName, setUserName] = useState("");
  const [hasName, setHasName] = useState(false);

  // Tab state: "active", "saved", or "past"
  const [tab, setTab] = useState<"active" | "saved" | "past">("active");

  useEffect(() => {
    const storedToken = sessionStorage.getItem("authToken");
    if (!storedToken) {
      router.push("/login");
      return;
    }
    setToken(storedToken);

    // Attempt to read user's name from "profileData"
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
        console.warn("Failed to parse profileData in Orders:", err);
      }
    }
  }, [router]);

  const greetingText = getGreeting();

  return (
    <div className="pt-24 min-h-screen w-full bg-gray-50 pb-10">
      <div className="max-w-7xl mx-auto px-0 sm:px-4">
        {/* Greeting heading */}
        <h1 className="text-2xl sm:text-3xl font-bold mt-6 mb-2">
          {greetingText}, {hasName ? userName : "Guest"}!
        </h1>

        {/* Navigation row => includes "Messages" */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-8">
            <Link href="/profile" className="text-gray-600 hover:text-blue-600">
              Profile
            </Link>
            {/* Active => Orders */}
            <Link href="/dashboard" className="text-blue-600 border-b-2 border-blue-600">
              Orders
            </Link>
            <Link href="/profile/messages" className="text-gray-600 hover:text-blue-600">
              Messages
            </Link>
            <Link href="/profile/settings" className="text-gray-600 hover:text-blue-600">
              Settings
            </Link>
          </div>
        </div>

        {/* Tabs: active, saved, past */}
        <div className="flex items-center gap-4 mb-6 text-sm font-medium">
          <button
            onClick={() => setTab("active")}
            className={`px-3 py-2 rounded 
              ${tab === "active" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"}`}
          >
            Active
          </button>
          <button
            onClick={() => setTab("saved")}
            className={`px-3 py-2 rounded 
              ${tab === "saved" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"}`}
          >
            Saved
          </button>
          <button
            onClick={() => setTab("past")}
            className={`px-3 py-2 rounded 
              ${tab === "past" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"}`}
          >
            Past
          </button>
        </div>

        {tab === "active" && (
          <div>
            <p className="text-gray-700">No active orders yet.</p>
          </div>
        )}
        {tab === "saved" && (
          <div>
            <p className="text-gray-700">No saved orders yet.</p>
          </div>
        )}
        {tab === "past" && (
          <div>
            <p className="text-gray-700">No past orders yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}