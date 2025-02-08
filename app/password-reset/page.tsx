"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PasswordResetPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // We'll try to read ?email=... from the URL
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // On mount, if there's an ?email= param => setEmail
  useEffect(() => {
    const paramEmail = searchParams.get("email") || "";
    if (paramEmail) {
      setEmail(paramEmail);
    }
  }, [searchParams]);

  // ------------- RESEND CODE -------------
  const handleResendCode = async () => {
    if (!email.trim()) {
      alert("Please enter your email before resending code.");
      return;
    }
    setLoading(true);
    setErrorMsg("");

    try {
      // We call /api/user/resend-activation
      const res = await fetch("http://dev.thejamb.com/user/resend-activation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        alert("Activation code resent to your email!");
      } else if (res.status === 400) {
        const errData = await res.json();
        setErrorMsg(`Resend error: ${errData.error}`);
      } else if (res.status === 404) {
        const errData = await res.json();
        setErrorMsg(`User not found: ${errData.error}`);
      } else if (res.status === 500) {
        const errData = await res.json();
        setErrorMsg(`Error sending code: ${errData.error}`);
      } else {
        setErrorMsg(`Unknown error: status ${res.status}`);
      }
    } catch (error) {
      console.error("Resend code error:", error);
      setErrorMsg("Failed to resend code. Check console.");
    } finally {
      setLoading(false);
    }
  };

  // ------------- CHANGE PASSWORD -------------
  const handleChangePassword = async () => {
    if (!email.trim() || !code.trim() || !newPassword.trim()) {
      alert("Please fill in email, code, and new password.");
      return;
    }
    setLoading(true);
    setErrorMsg("");

    try {
      // POST /user/change-password
      const res = await fetch("http://dev.thejamb.com/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, password: newPassword }),
      });

      if (res.ok) {
        // 200 => { "success": "ok" }
        alert("Password changed successfully!");

        // Optionally auto-login:
        await autoLogin();
      } else if (res.status === 400) {
        const errData = await res.json();
        setErrorMsg(`Bad request: ${errData.error}`);
      } else if (res.status === 401) {
        const errData = await res.json();
        setErrorMsg(`Unauthorized: ${errData.error}`);
      } else {
        setErrorMsg(`Unknown error: status ${res.status}`);
      }
    } catch (error) {
      console.error("Change Password error:", error);
      setErrorMsg("Error changing password. Check console.");
    } finally {
      setLoading(false);
    }
  };

  // After success, we optionally call /user/auth/credentials to auto login
  const autoLogin = async () => {
    try {
      const res = await fetch("http://dev.thejamb.com/user/auth/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: newPassword }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("authToken", data.token);
        router.push("/profile");
      } else {
        // If auto-login fails, fallback => just redirect them to login
        router.push("/login");
      }
    } catch (error) {
      console.error("Auto-login error:", error);
      router.push("/login");
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md bg-white p-6 rounded-md shadow">
        <h1 className="text-2xl font-bold mb-4 text-center">Reset Your Password</h1>

        {errorMsg && (
          <div className="text-red-600 mb-3">
            {errorMsg}
          </div>
        )}

        {/* Email Field */}
        <div className="mb-4">
          <label className="block text-sm text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {/* 6-digit Code Field */}
        <div className="mb-4">
          <label className="block text-sm text-gray-700 mb-1">Verification Code (6 digits)</label>
          <input
            type="text"
            placeholder="123456"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {/* New Password Field */}
        <div className="mb-6">
          <label className="block text-sm text-gray-700 mb-1">New Password</label>
          <input
            type="password"
            placeholder="Your new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <button
          onClick={handleChangePassword}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded text-center font-medium hover:bg-blue-700 mb-3"
        >
          {loading ? "Working..." : "Change Password"}
        </button>

        <button
          onClick={handleResendCode}
          disabled={loading}
          className="w-full bg-gray-200 text-gray-800 py-3 rounded text-center font-medium hover:bg-gray-300"
        >
          {loading ? "Working..." : "Resend Code"}
        </button>
      </div>
    </main>
  );
}