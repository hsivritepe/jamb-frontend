"use client";

export const dynamic = "force-dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GoogleIcon from "@/components/icons/GoogleIcon";
import FacebookIcon from "@/components/icons/FacebookIcon";
import AppleIcon from "@/components/icons/AppleIcon";

export default function LoginOrRegisterPage() {
  const router = useRouter();

  // Registration form
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTos, setAgreedToTos] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Toggles
  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Forgot password email
  const [resetEmail, setResetEmail] = useState("");

  // =============== REGISTER ===============
  const handleRegister = async () => {
    if (!agreedToTos) {
      alert("Please agree to the terms and conditions.");
      return;
    }

    try {
      const res = await fetch("https://dev.thejamb.com/user/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          phone_number: phoneNumber,
          password,
        }),
      });

      if (res.ok) {
        // Instead of just alerting, navigate to the confirm page:
        router.push(`/confirm?email=${encodeURIComponent(email)}`);
      } else if (res.status === 400) {
        const data = await res.json();
        alert(`Registration error: ${data.error}`);
      } else {
        alert(`Registration error: ${res.status}`);
      }
    } catch (error) {
      alert("Registration failed. Check console for details.");
      console.error("Registration error:", error);
    }
  };

  // =============== LOGIN ===============
  const handleLogin = async () => {
    try {
      const res = await fetch("https://dev.thejamb.com/user/auth/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      if (res.ok) {
        const data = await res.json();

        // 1) Store token in sessionStorage
        sessionStorage.setItem("authToken", data.token);

        // 2) Fetch user info so we can store it in sessionStorage
        try {
          const userRes = await fetch("https://dev.thejamb.com/user/info", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: data.token }),
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            sessionStorage.setItem("profileData", JSON.stringify(userData));
          }
        } catch (err) {
          console.error("Error fetching user info after login:", err);
        }

        // 3) Dispatch the custom "authChange" event so the Header updates
        window.dispatchEvent(new Event("authChange"));

        // 4) Navigate to /profile
        router.push("/profile");
      } else if (res.status === 400) {
        const data = await res.json();
        alert(`Login error: ${data.error}`);
      } else if (res.status === 401) {
        const data = await res.json();
        alert(`Unauthorized: ${data.error}`);
      } else {
        alert(`Login error. Status: ${res.status}`);
      }
    } catch (error) {
      alert("Login failed. Check console.");
      console.error("Login error:", error);
    }
  };

  // =============== FORGOT PASSWORD ===============
  const handleForgotPassword = async () => {
    if (!resetEmail.trim()) {
      alert("Please enter your email for password reset.");
      return;
    }

    try {
      const res = await fetch("https://dev.thejamb.com/user/change-password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      if (res.ok) {
        alert("Email has been sent with reset instructions!");
        router.push(`/password-reset?email=${encodeURIComponent(resetEmail)}`);
      } else if (res.status === 400) {
        const data = await res.json();
        alert(`Reset error: ${data.error}`);
      } else if (res.status === 404) {
        const data = await res.json();
        alert(`Reset error: ${data.error}`);
      } else if (res.status === 500) {
        const data = await res.json();
        alert(`Reset error: ${data.error}`);
      } else {
        alert(`Reset error: status ${res.status}`);
      }
    } catch (error) {
      alert("Failed to request a password reset. Check console.");
      console.error("Forgot Password error:", error);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-10">
      {showRegister ? (
        // ================= REGISTER FORM =================
        <div className="w-full max-w-md bg-white p-8 mt-20 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">
              Email address
            </label>
            <input
              type="email"
              placeholder="E.g. hello@thejamb.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded"
            />
          </div>

          {/* Phone */}
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">
              Phone number
            </label>
            <input
              type="tel"
              placeholder="+1"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded"
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">Password</label>
            <input
              type="password"
              placeholder="At least 6 chars"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded"
            />
          </div>

          {/* TOS */}
          <div className="mb-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="agreeTos"
              checked={agreedToTos}
              onChange={(e) => setAgreedToTos(e.target.checked)}
            />
            <label htmlFor="agreeTos" className="text-sm text-gray-600">
              By creating an account you agree to our{" "}
              <Link href="/terms" className="underline text-blue-600">
                terms and conditions
              </Link>
            </label>
          </div>

          <button
            onClick={handleRegister}
            className="w-full bg-blue-600 text-white py-3 rounded text-center font-medium hover:bg-blue-700"
          >
            Confirm →
          </button>

          <div className="text-center mt-4">
            <span className="text-sm text-gray-700">
              Already have an account?
            </span>{" "}
            <button
              onClick={() => setShowRegister(false)}
              className="text-blue-600 underline text-sm"
            >
              Login
            </button>
          </div>

          {/* Social login icons */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm mb-2">Sign with</p>
            <div className="flex justify-center gap-4">
              <button className="border p-3 rounded hover:bg-gray-100 flex items-center justify-center">
                <GoogleIcon className="w-6 h-6" />
              </button>
              <button className="border p-3 rounded hover:bg-gray-100 flex items-center justify-center">
                <FacebookIcon className="w-6 h-6" />
              </button>
              <button className="border p-3 rounded hover:bg-gray-100 flex items-center justify-center">
                <AppleIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        // ================= LOGIN FORM =================
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow">
          {!showForgotPassword ? (
            <>
              <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

              {/* Email */}
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="E.g. hello@thejamb.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded"
                />
              </div>

              {/* Password */}
              <div className="mb-2">
                <label className="block text-sm text-gray-600 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded"
                />
              </div>

              <div className="mb-6 text-right">
                <button
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-blue-600 underline"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                onClick={handleLogin}
                className="w-full bg-blue-600 text-white py-3 rounded text-center font-medium hover:bg-blue-700"
              >
                Login
              </button>

              <div className="text-center mt-4">
                <span className="text-sm text-gray-700">No account yet?</span>{" "}
                <button
                  onClick={() => setShowRegister(true)}
                  className="text-blue-600 underline text-sm"
                >
                  Create Account
                </button>
              </div>
            </>
          ) : (
            // =============== FORGOT PASSWORD ===============
            <>
              <h1 className="text-2xl font-bold mb-6 text-center">
                Forgot Password
              </h1>
              <p className="mb-4 text-sm text-gray-700">
                Enter your email below. We'll send a reset code if your account
                exists.
              </p>

              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="E.g. hello@jamb.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded"
                />
              </div>

              <button
                onClick={handleForgotPassword}
                className="w-full bg-blue-600 text-white py-3 rounded text-center font-medium hover:bg-green-700 mb-3"
              >
                Send Reset Code
              </button>

              <button
                onClick={() => setShowForgotPassword(false)}
                className="w-full bg-gray-200 text-gray-800 py-3 rounded text-center font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      )}
    </main>
  );
}