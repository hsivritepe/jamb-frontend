"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
 * Helper function for time-based greeting
 */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function ProfilePage() {
  const router = useRouter();

  // Loading/error states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Auth token
  const [token, setToken] = useState("");

  // Basic user profile
  const [profile, setProfile] = useState<UserProfile>({
    email: "",
    name: "",
    surname: "",
    phone: ""
  });

  // Address info
  const [address, setAddress] = useState<UserAddress>({
    country: "",
    address: "",
    city: "",
    state: "",
    zipcode: ""
  });

  // Card data (if needed later)
  const [card, setCard] = useState<UserCard>({
    number: "",
    surname: "",
    name: "",
    expiredTo: "",
    cvv: "",
    zipcode: ""
  });

  // Whether to show modals
  const [showContactModal, setShowContactModal] = useState(false);
  const [showPropertyModal, setShowPropertyModal] = useState(false);

  // Refs for modals
  const contactModalRef = useRef<HTMLDivElement>(null);
  const propertyModalRef = useRef<HTMLDivElement>(null);

  // On mount => check token => if none => /login => else load from session or server
  useEffect(() => {
    const storedToken = sessionStorage.getItem("authToken");
    if (!storedToken) {
      router.push("/login");
      return;
    }
    setToken(storedToken);

    // 1) Check if we have "profileData" in sessionStorage
    const storedProfileData = sessionStorage.getItem("profileData");
    if (storedProfileData) {
      // If so, parse and load it
      try {
        const data = JSON.parse(storedProfileData);
        // e.g. data.email, data.name, data.surname, data.address, data.card, etc.
        setProfile({
          email: data.email || "",
          name: data.name || "",
          surname: data.surname || "",
          phone: data.phone || ""
        });
        if (data.address) {
          setAddress({
            country: data.address.country || "",
            address: data.address.address || "",
            city: data.address.city || "",
            state: data.address.state || "",
            zipcode: data.address.zipcode?.toString() || ""
          });
        }
        if (data.card) {
          setCard({
            number: data.card.number || "",
            surname: data.card.surname || "",
            name: data.card.name || "",
            expiredTo: data.card.expired_to || "",
            cvv: data.card.cvv || "",
            zipcode: data.card.zipcode || ""
          });
        }
      } catch (err) {
        console.error("Failed to parse profileData from sessionStorage:", err);
        // If parse fails, we can fetch from server
        fetchUserInfo(storedToken);
      }
    } else {
      // 2) If no profileData, fetch from server
      fetchUserInfo(storedToken);
    }
  }, [router]);

  /**
   * (Optional) If you want to forcibly refresh data from server,
   * call fetchUserInfo again. We'll do that after we update user info.
   */
  async function fetchUserInfo(_token: string) {
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("http://dev.thejamb.com/user/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: _token }),
      });

      if (res.ok) {
        const data = await res.json();
        // Store in state
        setProfile({
          email: data.email || "",
          name: data.name || "",
          surname: data.surname || "",
          phone: data.phone || ""
        });
        if (data.address) {
          setAddress({
            country: data.address.country || "",
            address: data.address.address || "",
            city: data.address.city || "",
            state: data.address.state || "",
            zipcode: data.address.zipcode?.toString() || ""
          });
        }
        if (data.card) {
          setCard({
            number: data.card.number || "",
            surname: data.card.surname || "",
            name: data.card.name || "",
            expiredTo: data.card.expired_to || "",
            cvv: data.card.cvv || "",
            zipcode: data.card.zipcode || ""
          });
        }

        // Also update "profileData" in sessionStorage
        sessionStorage.setItem("profileData", JSON.stringify(data));
      } else {
        if (res.status === 400 || res.status === 401) {
          const errData = await res.json();
          setErrorMsg(errData.error || "Bad request / Unauthorized");
        } else {
          setErrorMsg(`Unknown error fetching user info: ${res.status}`);
        }
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      setErrorMsg("Error fetching user info. See console.");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Save contact details => PATCH /user/profile
   * Then update local state + sessionStorage
   */
  async function saveContactDetails() {
    if (!token) {
      setErrorMsg("No token found.");
      return;
    }
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("http://dev.thejamb.com/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          name: profile.name,
          surname: profile.surname
          // phone, email, etc. if needed
        }),
      });

      if (res.ok) {
        alert("Contact details updated!");
        // We'll re-fetch from server => also re-update sessionStorage
        await fetchUserInfo(token);
        setShowContactModal(false);
      } else {
        if (res.status === 400 || res.status === 401) {
          const errData = await res.json();
          setErrorMsg(errData.error || "Bad request / Unauthorized");
        } else {
          setErrorMsg(`Unknown error updating contact: ${res.status}`);
        }
      }
    } catch (error) {
      console.error("saveContactDetails error:", error);
      setErrorMsg("Error saving contact details. See console.");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Save/update address => POST /user/address
   * Then update local state + sessionStorage
   */
  async function saveAddressData() {
    if (!token) {
      setErrorMsg("No token found.");
      return;
    }
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("http://dev.thejamb.com/user/address", {
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
        // Re-fetch => update sessionStorage
        await fetchUserInfo(token);
        setShowPropertyModal(false);
      } else {
        if (res.status === 400) {
          const errData = await res.json();
          setErrorMsg(`Error saving address: ${errData.error}`);
        } else {
          setErrorMsg(`Unknown error saving address: ${res.status}`);
        }
      }
    } catch (error) {
      console.error("saveAddressData error:", error);
      setErrorMsg("Error saving address. See console.");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Logout => remove token, remove profileData, dispatch event, navigate
   */
  function handleLogout() {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("profileData");
    window.dispatchEvent(new Event("authChange"));
    router.push("/login");
  }

  // Close modals on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (showContactModal && contactModalRef.current) {
        if (!contactModalRef.current.contains(e.target as Node)) {
          setShowContactModal(false);
        }
      }
      if (showPropertyModal && propertyModalRef.current) {
        if (!propertyModalRef.current.contains(e.target as Node)) {
          setShowPropertyModal(false);
        }
      }
    }

    if (showContactModal || showPropertyModal) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showContactModal, showPropertyModal]);

  // For greeting
  const greetingText = getGreeting();
  const hasName = Boolean(profile.name.trim());

  // Does user have address?
  const hasAddress = Boolean(
    address.country.trim() ||
    address.address.trim() ||
    address.city.trim() ||
    address.state.trim() ||
    address.zipcode.trim()
  );

  return (
    <div className="pt-24 min-h-screen w-full bg-gray-50 pb-10">
      <div className="max-w-7xl mx-auto px-0 sm:px-4">
        {/* Greeting */}
        <h1 className="text-2xl sm:text-3xl font-bold mt-6 mb-2">
          {greetingText}, {hasName ? profile.name : "Guest"}!
        </h1>

        {/* Nav row */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-8">
            <Link href="/profile" className="text-blue-600 border-b-2 border-blue-600">
              Profile
            </Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-blue-600">
              Orders
            </Link>
            <Link href="/profile/settings" className="text-gray-600 hover:text-blue-600">
              Settings
            </Link>
          </div>
          <button
            onClick={handleLogout}
            className="text-red-500 hover:text-red-600"
          >
            Log out
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 text-red-600 font-medium">
            {errorMsg}
          </div>
        )}

        {/* Contact details */}
        <h2 className="text-xl font-semibold mb-3">Contact details</h2>
        <div className="bg-white p-4 rounded-md shadow-sm flex items-center justify-between mb-6">
          <div>
            <p className="text-lg font-semibold">
              {profile.name} {profile.surname}
            </p>
            <div className="text-gray-500 text-sm mt-1">
              <p>Email address</p>
              <p>{profile.email || "—"}</p>
            </div>
            <div className="text-gray-500 text-sm mt-2">
              <p>Phone number</p>
              <p>{profile.phone || "—"}</p>
            </div>
          </div>
          <button
            onClick={() => setShowContactModal(true)}
            className="text-blue-600 hover:underline text-sm"
          >
            Edit
          </button>
        </div>

        {/* Property details */}
        <h2 className="text-xl font-semibold mb-3">Property details</h2>
        <div className="bg-white p-4 rounded-md shadow-sm flex items-center justify-between mb-6">
          <div>
            {hasAddress ? (
              <div className="text-gray-700 space-y-1">
                <p className="font-semibold">{address.address}</p>
                <p>
                  {address.city} {address.state} {address.zipcode}
                </p>
                <p>{address.country}</p>
              </div>
            ) : (
              <p className="text-gray-500">No property details yet</p>
            )}
          </div>
          <button
            onClick={() => setShowPropertyModal(true)}
            className="text-blue-600 hover:underline text-sm"
          >
            {hasAddress ? "Edit" : "+ Add new"}
          </button>
        </div>

        {/* Payment details */}
        <h2 className="text-xl font-semibold mb-3">Payment details</h2>
        <div className="bg-white p-4 rounded-md shadow-sm flex items-center justify-between">
          <p className="text-gray-500">No payment details yet</p>
          <button className="text-blue-600 hover:underline text-sm">
            + Add new
          </button>
        </div>
      </div>

      {/* CONTACT MODAL */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex justify-end">
          <div
            ref={contactModalRef}
            className="bg-white w-full sm:w-[400px] h-full p-6 flex flex-col relative"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold">Contact details</h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-gray-500 hover:text-gray-800 text-xl"
              >
                &times;
              </button>
            </div>

            <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
              <div>
                <label className="block text-sm mb-1 text-gray-600">Name</label>
                <input
                  type="text"
                  placeholder="Name"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                  className="w-full p-3 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-600">Last Name</label>
                <input
                  type="text"
                  placeholder="Last Name"
                  value={profile.surname}
                  onChange={(e) =>
                    setProfile({ ...profile, surname: e.target.value })
                  }
                  className="w-full p-3 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-600">Email address</label>
                <input
                  type="email"
                  placeholder="hello@thejamb.com"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                  className="w-full p-3 border rounded-md"
                />
                <button
                  type="button"
                  className="text-blue-600 text-sm mt-1 hover:underline"
                >
                  Add new email
                </button>
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-600">Phone number</label>
                <input
                  type="tel"
                  placeholder="+1 234 56 78 90"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                  className="w-full p-3 border rounded-md"
                />
              </div>
            </div>

            <button
              onClick={saveContactDetails}
              disabled={loading}
              className="mt-6 bg-blue-600 text-white font-semibold p-3 rounded-md hover:bg-blue-700"
            >
              {loading ? "Saving..." : "Save →"}
            </button>
          </div>
        </div>
      )}

      {/* PROPERTY MODAL */}
      {showPropertyModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex justify-end">
          <div
            ref={propertyModalRef}
            className="bg-white w-full sm:w-[400px] h-full p-6 flex flex-col relative"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold">Property details</h3>
              <button
                onClick={() => setShowPropertyModal(false)}
                className="text-gray-500 hover:text-gray-800 text-xl"
              >
                &times;
              </button>
            </div>

            <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
              <div>
                <label className="block text-sm mb-1 text-gray-600">Country</label>
                <input
                  type="text"
                  placeholder="USA"
                  value={address.country}
                  onChange={(e) =>
                    setAddress({ ...address, country: e.target.value })
                  }
                  className="w-full p-3 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-600">Address line</label>
                <input
                  type="text"
                  placeholder="123 Main St"
                  value={address.address}
                  onChange={(e) =>
                    setAddress({ ...address, address: e.target.value })
                  }
                  className="w-full p-3 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-600">City</label>
                <input
                  type="text"
                  placeholder="Los Angeles"
                  value={address.city}
                  onChange={(e) =>
                    setAddress({ ...address, city: e.target.value })
                  }
                  className="w-full p-3 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-600">State</label>
                <input
                  type="text"
                  placeholder="California"
                  value={address.state}
                  onChange={(e) =>
                    setAddress({ ...address, state: e.target.value })
                  }
                  className="w-full p-3 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-600">Zipcode</label>
                <input
                  type="text"
                  placeholder="90210"
                  value={address.zipcode}
                  onChange={(e) =>
                    setAddress({ ...address, zipcode: e.target.value })
                  }
                  className="w-full p-3 border rounded-md"
                />
              </div>
            </div>

            <button
              onClick={saveAddressData}
              disabled={loading}
              className="mt-6 bg-blue-600 text-white font-semibold p-3 rounded-md hover:bg-blue-700"
            >
              {loading ? "Saving..." : "Save →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}