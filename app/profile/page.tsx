"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface UserProfile {
  email: string;
  name: string;
  surname: string;
  phone: string;
}

interface UserAddress {
  country: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
}

interface UserCard {
  number: string;
  surname: string;
  name: string;
  expiredTo: string;
  cvv: string;
  zipcode: string;
}

/**
 * Modifications:
 * 1) Dispatch "authChange" on logout and use `router.push("/login")`
 *    instead of a full page reload.
 * 2) Rest of the file remains the same.
 */

export default function UserCabinetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [token, setToken] = useState("");

  const [profile, setProfile] = useState<UserProfile>({
    email: "",
    name: "",
    surname: "",
    phone: ""
  });

  const [address, setAddress] = useState<UserAddress>({
    country: "",
    address: "",
    city: "",
    state: "",
    zipcode: ""
  });

  const [card, setCard] = useState<UserCard>({
    number: "",
    surname: "",
    name: "",
    expiredTo: "",
    cvv: "",
    zipcode: ""
  });

  // On mount => read token from sessionStorage
  useEffect(() => {
    const storedToken = sessionStorage.getItem("authToken");
    if (storedToken) {
      setToken(storedToken);
    } else {
      // If no token => user not logged in => go to /login
      router.push("/login");
    }
  }, [router]);

  // =================== (1) PROFILE ===================
  const loadProfile = async () => {
    if (!token) {
      setErrorMsg("No token found. Please log in first.");
      return;
    }
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("http://dev.thejamb.com/api/user/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile({
          email: data.email || "",
          name: data.name || "",
          surname: data.surname || "",
          phone: data.phone || ""
        });
      } else {
        if (res.status === 400 || res.status === 401) {
          const errData = await res.json();
          setErrorMsg(errData.error || "Bad request/Unauthorized");
        } else {
          setErrorMsg(`Unknown error: ${res.status}`);
        }
      }
    } catch (error) {
      console.error("loadProfile error:", error);
      setErrorMsg("Error loading profile. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!token) {
      setErrorMsg("No token found.");
      return;
    }
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("http://dev.thejamb.com/api/user/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          email: profile.email,
          name: profile.name,
          surname: profile.surname,
          phone: profile.phone
        }),
      });

      if (res.ok) {
        alert("Profile saved successfully!");
      } else {
        if (res.status === 400 || res.status === 401) {
          const errData = await res.json();
          setErrorMsg(errData.error || "Bad request/Unauthorized");
        } else {
          setErrorMsg(`Unknown error saving profile. ${res.status}`);
        }
      }
    } catch (error) {
      console.error("saveProfile error:", error);
      setErrorMsg("Error saving profile. Check console.");
    } finally {
      setLoading(false);
    }
  };

  // =================== (2) ADDRESS ===================
  const saveAddress = async () => {
    if (!token) {
      setErrorMsg("No token found.");
      return;
    }
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("http://dev.thejamb.com/api/user/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          country: address.country,
          address: address.address,
          city: address.city,
          state: address.state,
          zipcode: address.zipcode
        }),
      });

      if (res.ok) {
        alert("Address saved successfully!");
      } else {
        if (res.status === 400) {
          const errData = await res.json();
          setErrorMsg(`Error saving address: ${errData.error}`);
        } else {
          setErrorMsg(`Unknown error: ${res.status}`);
        }
      }
    } catch (error) {
      console.error("saveAddress error:", error);
      setErrorMsg("Error saving address. See console.");
    } finally {
      setLoading(false);
    }
  };

  // =================== (3) CARD ===================
  const saveCard = async () => {
    if (!token) {
      setErrorMsg("No token found.");
      return;
    }
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("http://dev.thejamb.com/api/user/card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          number: card.number,
          surname: card.surname,
          name: card.name,
          expiredTo: card.expiredTo,
          cvv: card.cvv,
          zipcode: card.zipcode
        }),
      });

      if (res.ok) {
        alert("Card saved successfully!");
      } else {
        if (res.status === 400) {
          const errData = await res.json();
          setErrorMsg(`Error saving card: ${errData.error}`);
        } else {
          setErrorMsg(`Unknown error: ${res.status}`);
        }
      }
    } catch (error) {
      console.error("saveCard error:", error);
      setErrorMsg("Error saving card. See console.");
    } finally {
      setLoading(false);
    }
  };

  // =================== LOGOUT ===================
  const handleLogout = () => {
    // 1) Remove token from sessionStorage
    sessionStorage.removeItem("authToken");

    // 2) Dispatch the custom event so the Header sees we're logged out
    window.dispatchEvent(new Event("authChange"));

    // 3) Navigate to /login without refreshing the entire site
    router.push("/login");
  };

  // =================== INPUT HANDLERS ===================
  const handleProfileChange = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field: keyof UserAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handleCardChange = (field: keyof UserCard, value: string) => {
    setCard((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-start p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">User Cabinet</h1>

      {/* Logout button */}
      <div className="mt-16 mb-4">
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {errorMsg && (
        <div className="mb-4 text-red-600">
          <p>{errorMsg}</p>
        </div>
      )}

      {/* Profile info */}
      <div className="w-full max-w-md bg-white p-4 rounded shadow mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Profile Info</h2>
          <button
            onClick={loadProfile}
            disabled={loading}
            className="bg-blue-600 text-white py-1 px-3 rounded text-sm"
          >
            {loading ? "Loading..." : "Load Profile"}
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Email</label>
          <input
            type="email"
            value={profile.email}
            readOnly
            onChange={(e) => handleProfileChange("email", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded bg-gray-100"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Name</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => handleProfileChange("name", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Surname</label>
          <input
            type="text"
            value={profile.surname}
            onChange={(e) => handleProfileChange("surname", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Phone</label>
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) => handleProfileChange("phone", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <button
          onClick={saveProfile}
          disabled={loading}
          className="bg-green-600 text-white py-2 px-4 rounded"
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </div>

      {/* Address info */}
      <div className="w-full max-w-md bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Address Info</h2>
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Country</label>
          <input
            type="text"
            value={address.country}
            onChange={(e) => handleAddressChange("country", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Address</label>
          <input
            type="text"
            placeholder="123 Main St"
            value={address.address}
            onChange={(e) => handleAddressChange("address", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">City</label>
          <input
            type="text"
            value={address.city}
            onChange={(e) => handleAddressChange("city", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">State</label>
          <input
            type="text"
            value={address.state}
            onChange={(e) => handleAddressChange("state", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Zipcode</label>
          <input
            type="text"
            value={address.zipcode}
            onChange={(e) => handleAddressChange("zipcode", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <button
          onClick={saveAddress}
          disabled={loading}
          className="bg-green-600 text-white py-2 px-4 rounded"
        >
          {loading ? "Saving..." : "Save Address"}
        </button>
      </div>

      {/* Payment Card */}
      <div className="w-full max-w-md bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Payment Card</h2>
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Card Number</label>
          <input
            type="text"
            placeholder="1234 5678 1234 5678"
            value={card.number}
            onChange={(e) => handleCardChange("number", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Cardholder Surname</label>
          <input
            type="text"
            value={card.surname}
            onChange={(e) => handleCardChange("surname", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Cardholder Name</label>
          <input
            type="text"
            value={card.name}
            onChange={(e) => handleCardChange("name", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Expires (MM/YY)</label>
          <input
            type="text"
            placeholder="12/25"
            value={card.expiredTo}
            onChange={(e) => handleCardChange("expiredTo", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">CVV</label>
          <input
            type="text"
            placeholder="123"
            value={card.cvv}
            onChange={(e) => handleCardChange("cvv", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Billing Zipcode</label>
          <input
            type="text"
            placeholder="90210"
            value={card.zipcode}
            onChange={(e) => handleCardChange("zipcode", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <button
          onClick={saveCard}
          disabled={loading}
          className="bg-green-600 text-white py-2 px-4 rounded"
        >
          {loading ? "Saving..." : "Save Card"}
        </button>
      </div>
    </main>
  );
}