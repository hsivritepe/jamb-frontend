"use client";

import { useState, useRef, ReactEventHandler, ChangeEvent, KeyboardEvent } from "react";

/**
 * Access page requiring a 4-digit code.
 * Shows a preview-mode notice and allows code submission.
 */
export default function AccessPage() {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  // Refs for the four input fields
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  /**
   * Updates the code state when a single digit is changed.
   * Moves focus to the next field automatically.
   */
  function handleDigitChange(e: ChangeEvent<HTMLInputElement>, index: number) {
    // Current digit (only last typed character if user pastes multiple)
    const val = e.target.value.replace(/\D/g, "").slice(-1);

    // Convert current code to array of 4 chars, pad if needed
    const digits = code.padEnd(4, " ").split("");

    digits[index] = val; // set the new digit at the correct position

    const newCode = digits.join("").trim();
    setCode(newCode);

    // If a digit was typed and not the last input, move to the next
    if (val && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  }

  /**
   * Handles keyboard navigation (Backspace to go to previous field).
   */
  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>, index: number) {
    // If Backspace pressed on an empty field, go to the previous
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  }

  /**
   * Validates the entered code and sets a cookie if correct.
   */
  function handleSubmit() {
    // "Secret" code is "2025"
    if (code === "2025") {
      setMessage("Access code accepted! Redirecting...");
      document.cookie = "hasAccess=true; path=/; max-age=86400"; // valid for 1 day
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } else {
      setMessage("Invalid access code. Please try again.");
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FB] p-4">
      {/* Preview mode notice */}
      <p className="mb-6 text-center text-sm text-gray-600">
        This site is currently in preview mode as we prepare for launch. If you need the access code,
        please email{" "}
        <a href="mailto:info@thejamb.com" className="text-blue-600 underline">
          info@thejamb.com
        </a>.
      </p>

      {/* Access form */}
      <div className="max-w-md w-full bg-brand-light p-6 rounded-lg">
        <h1 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800 text-center">
          Please enter the access code
        </h1>

        {/* Four separate digit inputs */}
        <div className="flex space-x-2 justify-center mb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <input
              key={i}
              ref={inputRefs[i]}
              type="text"
              maxLength={1}
              value={code[i] || ""}
              onChange={(e) => handleDigitChange(e, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              // Autofocus on the first input
              autoFocus={i === 0}
              className="w-12 h-12 border rounded text-center text-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ))}
        </div>

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