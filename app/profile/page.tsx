"use client";
export const dynamic = "force-dynamic";

import { useEffect, useRef, useState } from "react";
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

export default function ProfilePage() {
  const router = useRouter();

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Auth token
  const [token, setToken] = useState("");

  // Basic profile info
  const [profile, setProfile] = useState<UserProfile>({
    email: "",
    name: "",
    surname: "",
    phone: "",
  });

  // Address info
  const [address, setAddress] = useState<UserAddress>({
    country: "",
    address: "",
    city: "",
    state: "",
    zipcode: "",
  });

  // Payment card info
  const [card, setCard] = useState<UserCard>({
    number: "",
    surname: "",
    name: "",
    expiredTo: "",
    cvv: "",
    zipcode: "",
  });

  // Modal visibility
  const [showContactModal, setShowContactModal] = useState(false);
  const [showPropertyModal, setShowPropertyModal] = useState(false);

  // Modal refs
  const contactModalRef = useRef<HTMLDivElement>(null);
  const propertyModalRef = useRef<HTMLDivElement>(null);

  // Static map URLs
  const [mapUrl, setMapUrl] = useState("");
  const [streetViewUrl, setStreetViewUrl] = useState("");
  const [greetingText, setGreetingText] = useState("");
  const [hasName, setHasName] = useState(false);

  useEffect(() => {
    const storedToken = sessionStorage.getItem("authToken");
    if (!storedToken) {
      router.push("/login");
      return;
    }
    setToken(storedToken);

    const storedProfileData = sessionStorage.getItem("profileData");
    if (storedProfileData) {
      try {
        const data = JSON.parse(storedProfileData);
        setProfile({
          email: data.email || "",
          name: data.name || "",
          surname: data.surname || "",
          phone: data.phone || "",
        });
        if (data.address) {
          setAddress({
            country: data.address.country || "",
            address: data.address.address || "",
            city: data.address.city || "",
            state: data.address.state || "",
            zipcode: data.address.zipcode?.toString() || "",
          });
        }
        if (data.card) {
          setCard({
            number: data.card.number || "",
            surname: data.card.surname || "",
            name: data.card.name || "",
            expiredTo: data.card.expired_to || "",
            cvv: data.card.cvv || "",
            zipcode: data.card.zipcode || "",
          });
        }
        if (data.mapUrl) setMapUrl(data.mapUrl);
        if (data.streetViewUrl) setStreetViewUrl(data.streetViewUrl);
      } catch (err) {
        console.error("Failed to parse profileData from sessionStorage:", err);
        fetchUserInfo(storedToken);
      }
    } else {
      fetchUserInfo(storedToken);
    }
  }, [router]);

  useEffect(() => {
    setGreetingText(getGreeting());
  }, []);

  useEffect(() => {
    setHasName(Boolean(profile.name.trim()));
  }, [profile.name]);

  async function fetchUserInfo(_token: string) {
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("https://dev.thejamb.com/user/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: _token }),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile({
          email: data.email || "",
          name: data.name || "",
          surname: data.surname || "",
          phone: data.phone || "",
        });
        if (data.address) {
          setAddress({
            country: data.address.country || "",
            address: data.address.address || "",
            city: data.address.city || "",
            state: data.address.state || "",
            zipcode: data.address.zipcode?.toString() || "",
          });
        }
        if (data.card) {
          setCard({
            number: data.card.number || "",
            surname: data.card.surname || "",
            name: data.card.name || "",
            expiredTo: data.card.expired_to || "",
            cvv: data.card.cvv || "",
            zipcode: data.card.zipcode || "",
          });
        }
        setMapUrl("");
        setStreetViewUrl("");

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
      setErrorMsg("Error fetching user info. Check console.");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Save contact details => PATCH /user/profile
   */
  async function saveContactDetails() {
    if (!token) {
      setErrorMsg("No token found.");
      return;
    }
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("https://dev.thejamb.com/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          name: profile.name,
          surname: profile.surname,
          // add phone/email if needed
        }),
      });

      if (res.ok) {
        alert("Contact details updated!");
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
      setErrorMsg("Error saving contact details. Check console.");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Save/update address => POST /user/address
   */
  async function saveAddressData() {
    if (!token) {
      setErrorMsg("No token found.");
      return;
    }
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("https://dev.thejamb.com/user/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          country: address.country,
          address: address.address,
          city: address.city,
          state: address.state,
          zipcode: address.zipcode,
        }),
      });

      if (res.ok) {
        alert("Address saved successfully!");
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
      setErrorMsg("Error saving address. Check console.");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Close modals if click is outside of them
   */
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

  // Check if the user has any address fields
  const hasAddress = Boolean(
    address.country.trim() ||
      address.address.trim() ||
      address.city.trim() ||
      address.state.trim() ||
      address.zipcode.trim()
  );

  /**
   * Geocode logic to get map images if the user has an address
   */
  useEffect(() => {
    if (!hasAddress) {
      setMapUrl("");
      setStreetViewUrl("");
      return;
    }

    const storedProfileData = sessionStorage.getItem("profileData");
    if (storedProfileData) {
      try {
        const pd = JSON.parse(storedProfileData);
        if (pd.mapUrl && pd.streetViewUrl) {
          setMapUrl(pd.mapUrl);
          setStreetViewUrl(pd.streetViewUrl);
          return;
        }
      } catch (err) {
        console.warn("Failed to parse existing profileData for map images:", err);
      }
    }

    const addressString = `${address.address}, ${address.city}, ${address.state} ${address.zipcode}, ${address.country}`;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn("Missing Google Maps API key => no static map or street view");
      return;
    }

    async function geocodeAndSaveImages() {
      try {
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          addressString
        )}&key=${apiKey}`;
        const response = await fetch(geocodeUrl);
        const data = await response.json();
        if (data.status === "OK" && data.results && data.results.length > 0) {
          const loc = data.results[0].geometry.location;
          const lat = loc.lat;
          const lng = loc.lng;

          // Static map
          const newMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=16&size=600x300&markers=color:blue%7C${lat},${lng}&language=en&key=${apiKey}`;
          setMapUrl(newMapUrl);

          // Street View
          const newStreetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${lat},${lng}&fov=80&heading=70&pitch=0&language=en&key=${apiKey}`;
          setStreetViewUrl(newStreetViewUrl);

          const stored = sessionStorage.getItem("profileData");
          if (stored) {
            const parsedData = JSON.parse(stored);
            parsedData.mapUrl = newMapUrl;
            parsedData.streetViewUrl = newStreetViewUrl;
            sessionStorage.setItem("profileData", JSON.stringify(parsedData));
          }
        } else {
          console.warn("No geocode results. Status:", data.status);
          setMapUrl("");
          setStreetViewUrl("");
        }
      } catch (err) {
        console.error("Error geocoding address:", err);
        setMapUrl("");
        setStreetViewUrl("");
      }
    }

    geocodeAndSaveImages();
  }, [hasAddress, address]);

  return (
    <div className="pt-24 min-h-screen w-full bg-gray-50 pb-10">
      <div className="max-w-7xl mx-auto px-0 sm:px-4">
        {/* Greeting */}
        <h1 className="text-2xl sm:text-3xl font-bold mt-6 mb-2">
          {greetingText}, {hasName ? profile.name : "Guest"}!
        </h1>

        {/* Navigation row */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-8">
            <Link
              href="/profile"
              className="text-blue-600 border-b-2 border-blue-600"
            >
              Profile
            </Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-blue-600">
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

        {errorMsg && (
          <div className="mb-4 text-red-600 font-medium">{errorMsg}</div>
        )}

        {/* Contact details */}
        <h2 className="text-xl font-semibold mb-3">Contact details</h2>
        <div className="bg-white p-4 rounded-md shadow-sm flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold mb-2 text-blue-600">
              {profile.name} {profile.surname}
            </h1>
            <div>
              <p className="text-gray-500 text-sm mt-1">Email address</p>
              <p className="mt-1">{profile.email || "—"}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm mt-1">Phone number</p>
              <p className="mt-1">{profile.phone || "—"}</p>
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
        <div className="bg-white p-4 rounded-md shadow-sm flex flex-col gap-4 mb-6 w-full">
          {/* Address + Edit */}
          <div className="flex flex-row items-center justify-between w-full gap-6">
            <div>
              <p className="text-gray-500 text-sm mb-1">Address</p>
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

          {/* Map & StreetView */}
          <div className="flex flex-col gap-4 lg:flex-row w-full lg:w-1/2 lg:gap-1">
            {mapUrl && (
              <img
                src={mapUrl}
                alt="Map of user address"
                className="w-full rounded-md border"
              />
            )}
            {streetViewUrl && (
              <img
                src={streetViewUrl}
                alt="Street View of user address"
                className="w-full rounded-md border"
              />
            )}
          </div>
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

            {/* Contact fields */}
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
                <label className="block text-sm mb-1 text-gray-600">
                  Last Name
                </label>
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
                <label className="block text-sm mb-1 text-gray-600">
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="hello@thejamb.com"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                  className="w-full p-3 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-600">
                  Phone number
                </label>
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
                <label className="block text-sm mb-1 text-gray-600">
                  Address line
                </label>
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