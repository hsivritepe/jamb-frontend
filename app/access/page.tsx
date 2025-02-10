"use client";

import { useState } from "react";

export default function AccessPage() {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit() {
    // Our "secret" code is "2025"
    if (code === "2025") {
      // Show a short success message
      setMessage("Access code accepted! Redirecting...");

      // Set cookie 'hasAccess=true' for 1 day (86400 seconds)
      document.cookie = "hasAccess=true; path=/; max-age=86400";

      // Redirect to homepage after a brief delay (optional)
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } else {
      setMessage("Invalid access code. Please try again.");
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FB] p-4">
      {/* Access form */}
      <div className="max-w-md w-full bg-brand-light p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-semibold mb-4 text-gray-800">
          Please enter the access code
        </h1>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter code"
          className="w-full border px-3 py-2 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white font-medium py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Submit
        </button>

        {/* Message area */}
        {message && (
          <p className="text-center mt-4 text-gray-600 font-medium">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}