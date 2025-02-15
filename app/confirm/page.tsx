"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Attempt to read ?email=... and ?next=... from the URL
  const emailFromQuery = searchParams.get("email") || "";
  const nextUrl = searchParams.get("next") || "";

  const [email, setEmail] = useState(emailFromQuery);

  // 6 code digits
  const [codeDigits, setCodeDigits] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<HTMLInputElement[]>([]);

  // On mount => focus the first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // handleChangeDigit => numeric only, 1 char, auto-focus next
  function handleChangeDigit(index: number, rawValue: string) {
    const cleanValue = rawValue.replace(/\D/g, "").slice(0, 1);
    const updated = [...codeDigits];
    updated[index] = cleanValue;
    setCodeDigits(updated);

    if (cleanValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  async function handleConfirm() {
    const code = codeDigits.join("");
    if (!email.trim()) {
      alert("Email is required.");
      return;
    }
    if (code.length < 6) {
      alert("Please enter the full 6-digit code.");
      return;
    }

    try {
      // local route => /api/user/confirm
      const res = await fetch("/api/user/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      if (res.ok) {
        alert("User activated successfully!");

        // after success => we push to login with the same next param
        let loginUrl = "/login";
        if (nextUrl) {
          loginUrl += `?next=${encodeURIComponent(nextUrl)}`;
        }
        router.push(loginUrl);
      } else if (res.status === 404) {
        const data = await res.json();
        alert(`User not found: ${data.error}`);
      } else if (res.status === 400) {
        const data = await res.json();
        alert(`Bad code: ${data.error}`);
      } else {
        alert(`Unknown error: status ${res.status}`);
      }
    } catch (error) {
      console.error("Confirmation error:", error);
      alert("Failed to confirm user. Check console for details.");
    }
  }

  async function handleResendCode() {
    if (!email.trim()) {
      alert("Email is required.");
      return;
    }
    try {
      const res = await fetch("/api/user/resend-activation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        alert("Code resent! Check your inbox.");
      } else {
        const data = await res.json();
        alert(`Resend error: ${data.error}`);
      }
    } catch (err) {
      console.error("Resend code error:", err);
      alert("Failed to resend code. Check console.");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-4">Confirm Your Account</h1>

        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Email</label>
          <input
            type="email"
            value={email}
            placeholder="user@example.com"
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <label className="block text-sm text-gray-600 mb-2">
          Enter the 6-digit code from your email
        </label>
        <div className="flex gap-2 mb-4 justify-center">
          {codeDigits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                if (el) {
                  inputRefs.current[index] = el;
                }
              }}
              type="text"
              value={digit}
              onChange={(e) => handleChangeDigit(index, e.target.value)}
              onKeyDown={(e) => {
                // if backspace on empty => go prev
                if (e.key === "Backspace" && !digit && index > 0) {
                  e.preventDefault();
                  const updated = [...codeDigits];
                  updated[index - 1] = "";
                  setCodeDigits(updated);
                  inputRefs.current[index - 1]?.focus();
                }
              }}
              maxLength={1}
              className="
                w-12 h-12 border border-gray-300
                text-center text-2xl
                rounded
                focus:outline-none
                focus:border-blue-500
              "
            />
          ))}
        </div>

        <button
          onClick={handleConfirm}
          className="w-full bg-blue-600 text-white py-3 rounded font-medium hover:bg-blue-700"
        >
          Confirm
        </button>
        <button
          onClick={handleResendCode}
          className="w-full mt-3 bg-gray-200 text-gray-800 py-2 rounded font-medium hover:bg-gray-300"
        >
          Resend Code
        </button>
      </div>
    </main>
  );
}