"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/**
 * Returns a greeting based on the current hour.
 */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function MessagesPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [userName, setUserName] = useState("");
  const [hasName, setHasName] = useState(false);

  // "inbox" or "outbox"
  const [tab, setTab] = useState<"inbox" | "outbox">("inbox");

  useEffect(() => {
    const storedToken = sessionStorage.getItem("authToken");
    if (!storedToken) {
      router.push("/login");
      return;
    }
    setToken(storedToken);

    // Attempt to read user's name from profileData
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
        console.warn("Failed to parse profileData in Messages:", err);
      }
    }
  }, [router]);

  const greetingText = getGreeting();

  return (
    <div className="pt-24 min-h-screen w-full bg-gray-50 pb-10">
      <div className="max-w-7xl mx-auto px-0 sm:px-4">
        {/* Greeting */}
        <h1 className="text-2xl sm:text-3xl font-bold mt-6 mb-2">
          {greetingText}, {hasName ? userName : "Guest"}!
        </h1>

        {/* Navigation row */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-8">
            <Link href="/profile" className="text-gray-600 hover:text-blue-600">
              Profile
            </Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-blue-600">
              Orders
            </Link>
            {/* Active => Messages */}
            <Link href="/messages" className="text-blue-600 border-b-2 border-blue-600">
              Messages
            </Link>
            <Link href="/profile/settings" className="text-gray-600 hover:text-blue-600">
              Settings
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 mb-6 text-sm font-medium">
          <button
            onClick={() => setTab("inbox")}
            className={`px-3 py-2 rounded 
              ${tab === "inbox" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"}`}
          >
            Inbox
          </button>
          <button
            onClick={() => setTab("outbox")}
            className={`px-3 py-2 rounded 
              ${tab === "outbox" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"}`}
          >
            Outbox
          </button>
        </div>

        {/* Content */}
        {tab === "inbox" && (
          <div>
            <p className="text-gray-700">No inbox messages yet.</p>
          </div>
        )}
        {tab === "outbox" && (
          <div>
            <p className="text-gray-700">No outbox messages yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}