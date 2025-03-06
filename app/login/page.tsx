"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import GoogleIcon from "@/components/icons/GoogleIcon";
import FacebookIcon from "@/components/icons/FacebookIcon";
import AppleIcon from "@/components/icons/AppleIcon";
import { useGoogleLogin } from "@react-oauth/google";

export default function LoginOrRegisterPage() {
  // Router and query params
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "";

  // Registration states
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTos, setAgreedToTos] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // Login states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Forgot password
  const [resetEmail, setResetEmail] = useState("");

  // UI toggles
  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  /**
   * Creates a new user (registration).
   */
  const handleRegister = async () => {
    if (!agreedToTos) {
      alert("Please agree to the Terms & Conditions.");
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
        // Redirect to confirm page on success
        let confirmUrl = `/confirm?email=${encodeURIComponent(email)}`;
        if (nextUrl) {
          confirmUrl += `&next=${encodeURIComponent(nextUrl)}`;
        }
        router.push(confirmUrl);
      } else if (res.status === 400) {
        const data = await res.json();
        alert(`Registration error: ${data.error}`);
      } else {
        alert(`Registration error: ${res.status}`);
      }
    } catch (error) {
      alert("Registration failed. Try again, please.");
      console.error("Registration error:", error);
    }
  };

  /**
   * Logs in an existing user, storing the auth token.
   */
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
        // On success, get token
        const data = await res.json();
        sessionStorage.setItem("authToken", data.token);
        sessionStorage.setItem("userEmail", loginEmail);

        // Optionally fetch user info
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

        // Dispatch event so other parts of the app know auth changed
        window.dispatchEvent(new Event("authChange"));

        // Redirect to nextUrl or profile
        if (nextUrl) {
          router.push(nextUrl);
        } else {
          router.push("/profile");
        }
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
      alert("Login failed. Check console for details.");
      console.error("Login error:", error);
    }
  };

  /**
   * Requests a password reset for the given email.
   */
  const handleForgotPassword = async () => {
    if (!resetEmail.trim()) {
      alert("Please enter your email for password reset.");
      return;
    }

    try {
      const res = await fetch("/api/user/change-password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      if (res.ok) {
        alert("Email sent with reset instructions!");
        router.push(`/password-reset?email=${encodeURIComponent(resetEmail)}`);
      } else {
        const data = await res.json();
        alert(`Reset error: ${data.error || res.statusText}`);
      }
    } catch (error) {
      alert("Failed to request a password reset. Check the console.");
      console.error("Forgot Password error:", error);
    }
  };

  /**
   * Sends the access token for social login to our backend.
   */
  async function callServerSocialLogin(provider: "google" | "facebook" | "apple", token: string) {
    try {
      const res = await fetch(`https://dev.thejamb.com/connect/${provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(`Social login error: ${data.error || res.statusText}`);
        return null;
      }
      const data = await res.json();
      return data.token; // userToken from the server
    } catch (err) {
      console.error("Social login failed:", err);
      alert("Social login failed. Check console.");
      return null;
    }
  }

  // Google OAuth logic
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const serverToken = await callServerSocialLogin("google", tokenResponse.access_token);
      if (serverToken) {
        sessionStorage.setItem("authToken", serverToken);

        // Optionally fetch user info
        try {
          const userRes = await fetch("https://dev.thejamb.com/user/info", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: serverToken }),
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            sessionStorage.setItem("profileData", JSON.stringify(userData));
          }
        } catch (err) {
          console.error("Error fetching user info after Google login:", err);
        }

        window.dispatchEvent(new Event("authChange"));

        if (nextUrl) {
          router.push(nextUrl);
        } else {
          router.push("/profile");
        }
      }
    },
    onError: (errorResponse) => {
      console.error("Google login error:", errorResponse);
      alert("Google login error. Check console for details.");
    },
  });

  // Google button handler
  const handleGoogleLogin = () => {
    googleLogin();
  };

  // Facebook placeholder
  const handleFacebookLogin = () => {
    alert("Facebook login not implemented yet");
  };

  // Apple placeholder: we disable Apple login here
  const handleAppleLogin = () => {
    alert("Apple login not implemented yet");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-10">
      {showRegister ? (
        // =========================================
        //       REGISTRATION FORM SECTION
        // =========================================
        <div className="w-full max-w-md bg-white p-8 mt-20 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">Email address</label>
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
            <label className="block text-sm text-gray-600 mb-1">Phone number</label>
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
            <div className="relative">
              <input
                type={showRegisterPassword ? "text" : "password"}
                placeholder="At least 6 chars"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded pr-10"
              />
              <button
                type="button"
                onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showRegisterPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Terms & Conditions */}
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
            <span className="text-sm text-gray-700">Already have an account?</span>{" "}
            <button
              onClick={() => setShowRegister(false)}
              className="text-blue-600 underline text-sm"
            >
              Login
            </button>
          </div>

          {/* Social login icons */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm mb-2">Sign in with</p>
            <div className="flex justify-center gap-4">
              {/* Google */}
              <button
                className="border p-3 rounded hover:bg-gray-100 flex items-center justify-center"
                onClick={handleGoogleLogin}
              >
                <GoogleIcon className="w-6 h-6" />
              </button>
              {/* Facebook */}
              <button
                className="border p-3 rounded hover:bg-gray-100 flex items-center justify-center"
                onClick={handleFacebookLogin}
              >
                <FacebookIcon className="w-6 h-6" />
              </button>
              {/* Apple */}
              <button
                className="border p-3 rounded hover:bg-gray-100 flex items-center justify-center"
                onClick={handleAppleLogin}
              >
                <AppleIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        // =========================================
        //           LOGIN FORM SECTION
        // =========================================
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow">
          {!showForgotPassword ? (
            <>
              <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

              {/* Email */}
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">Email address</label>
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
                <label className="block text-sm text-gray-600 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="Your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {showLoginPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
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

              {/* Social login icons */}
              <div className="mt-8 text-center">
                <p className="text-gray-500 text-sm mb-2">Login with</p>
                <div className="flex justify-center gap-4">
                  {/* Google */}
                  <button
                    className="border p-3 rounded hover:bg-gray-100 flex items-center justify-center"
                    onClick={handleGoogleLogin}
                  >
                    <GoogleIcon className="w-6 h-6" />
                  </button>
                  {/* Facebook */}
                  <button
                    className="border p-3 rounded hover:bg-gray-100 flex items-center justify-center"
                    onClick={handleFacebookLogin}
                  >
                    <FacebookIcon className="w-6 h-6" />
                  </button>
                  {/* Apple (deactivated) */}
                  <button
                    className="border p-3 rounded hover:bg-gray-100 flex items-center justify-center"
                    onClick={handleAppleLogin}
                  >
                    <AppleIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            // =========================================
            //      FORGOT PASSWORD SECTION
            // =========================================
            <>
              <h1 className="text-2xl font-bold mb-6 text-center">
                Forgot Password
              </h1>
              <p className="mb-4 text-sm text-gray-700">
                Enter your email below. We'll send a reset code if your account exists.
              </p>

              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">Email address</label>
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