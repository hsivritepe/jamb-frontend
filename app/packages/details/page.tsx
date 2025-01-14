"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, ChangeEvent } from "react";
import BreadCrumb from "@/components/ui/BreadCrumb";
import { PACKAGES_STEPS } from "@/constants/navigation";
import Button from "@/components/ui/Button";
import { SectionBoxTitle } from "@/components/ui/SectionBoxTitle";
import { SectionBoxSubtitle } from "@/components/ui/SectionBoxSubtitle";

/**
 * Utility function: Save a key/value pair to sessionStorage as JSON (client side).
 */
function saveToSession(key: string, value: any) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(key, JSON.stringify(value));
  }
}

/**
 * Utility function: Load data from sessionStorage, or return a default if not found or SSR.
 */
function loadFromSession<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  const stored = sessionStorage.getItem(key);
  try {
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/** 
 * Safely parse a string to a number. If invalid, return 0.
 */
function parseNumberOrZero(val: string): number {
  const num = parseFloat(val);
  return Number.isNaN(num) ? 0 : num;
}

/**
 * Default shape of the house/apartment info we want to collect.
 */
const defaultHouseInfo = {
  country: "",
  city: "",
  zip: "",
  addressLine: "",
  houseType: "",
  floors: 1,
  squareFootage: 0,
  bedrooms: 1,
  bathrooms: 1,
  hasGarage: false,
  garageCount: 0,
  hasYard: false,
  yardArea: 0,
  hasPool: false,
  poolArea: 0,
  hasBoiler: false,
  boilerType: "",
  applianceCount: 1,
  airConditioners: 0,
};

export default function PackagesDetailsHomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Grab the packageId if it was passed in the query (e.g. from "Read more" link).
  const packageId = searchParams.get("packageId") || ""; 

  // If there's no packageId, you could optionally redirect the user back to /packages
  useEffect(() => {
    if (!packageId) {
      // e.g. router.push("/packages");
    }
  }, [packageId]);

  // State to keep track of house info. It loads from session if available.
  const [houseInfo, setHouseInfo] = useState(() =>
    loadFromSession("packages_houseInfo", defaultHouseInfo)
  );

  // Whenever houseInfo changes, we persist it to sessionStorage
  useEffect(() => {
    saveToSession("packages_houseInfo", houseInfo);
  }, [houseInfo]);

  /**
   * For text or select inputs that store string values in `houseInfo`.
   */
  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setHouseInfo((prev) => ({ ...prev, [name]: value }));
  }

  /**
   * For numeric-based inputs or selects. We parse to number.
   */
  function handleNumber(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setHouseInfo((prev) => ({
      ...prev,
      [name]: parseNumberOrZero(value),
    }));
  }

  /**
   * Attempt to auto-detect city/zip/country from ipapi.co 
   * and fill them into the form.
   */
  async function handleAutoFillLocation() {
    try {
      const response = await fetch("https://ipapi.co/json/");
      if (!response.ok) {
        throw new Error("Failed to fetch location data");
      }
      const data = await response.json();
      const city = data.city || "City";
      const zip = data.postal || "00000";
      const country = data.country_name || "";

      setHouseInfo((prev) => ({
        ...prev,
        city,
        zip,
        country,
      }));
    } catch (error) {
      console.error("Error fetching location:", error);
      alert("Failed to auto-detect location.");
    }
  }

  /**
   * Validate required fields, then proceed to the next step (services selection).
   */
  function handleNext() {
    if (!houseInfo.addressLine.trim()) {
      alert("Please enter your street address before proceeding.");
      return;
    }
    if (!houseInfo.city.trim() || !houseInfo.zip.trim()) {
      alert("Please enter city & ZIP (or auto-fill) before proceeding.");
      return;
    }
    if (!houseInfo.houseType) {
      alert("Please select your house type.");
      return;
    }

    // Navigate to /packages/services, preserving the packageId in the URL query
    router.push(`/packages/services?packageId=${packageId}`);
  }

  /**
   * Reset the entire form to the defaultHouseInfo state.
   */
  function handleClearAll() {
    const confirmed = window.confirm("Are you sure you want to clear all data?");
    if (!confirmed) return;
    setHouseInfo(defaultHouseInfo);
  }

  /**
   * Toggle the "hasGarage" boolean. If turning it off, reset garageCount to 0.
   */
  function toggleGarage() {
    setHouseInfo((prev) => ({
      ...prev,
      hasGarage: !prev.hasGarage,
      garageCount: !prev.hasGarage ? 1 : 0,
    }));
  }

  /**
   * Toggle the "hasYard" boolean. If turning it off, reset yardArea to 0.
   */
  function toggleYard() {
    setHouseInfo((prev) => ({
      ...prev,
      hasYard: !prev.hasYard,
      yardArea: 0,
    }));
  }

  /**
   * Toggle the "hasPool" boolean. If turning it off, reset poolArea to 0.
   */
  function togglePool() {
    setHouseInfo((prev) => ({
      ...prev,
      hasPool: !prev.hasPool,
      poolArea: 0,
    }));
  }

  /**
   * Toggle the "hasBoiler" boolean. If turning it off, reset boilerType to "".
   */
  function toggleBoiler() {
    setHouseInfo((prev) => ({
      ...prev,
      hasBoiler: !prev.hasBoiler,
      boilerType: !prev.hasBoiler ? "gas" : "",
    }));
  }

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto">
        {/* Breadcrumb nav */}
        <BreadCrumb items={PACKAGES_STEPS} />

        {/* Top row: page title + Next button */}
        <div className="flex justify-between items-center mt-8">
          <SectionBoxTitle>Home / Apartment Information</SectionBoxTitle>
          <Button onClick={handleNext}>Next →</Button>
        </div>

        {/* Small description and a "Clear" button */}
        <div className="flex justify-between items-center mt-2 max-w-3xl">
          <p className="text-gray-600">
            Please provide details about your home so we can tailor the package properly.
          </p>
          <button
            onClick={handleClearAll}
            className="text-sm text-blue-600 border border-blue-400 bg-blue-50 px-3 py-1 rounded hover:bg-blue-100 transition-colors"
          >
            Clear
          </button>
        </div>

        {/* Main form container */}
        <div className="bg-white border border-gray-300 mt-6 p-6 rounded-lg space-y-6 max-w-3xl">
          {/* Address & Location Section */}
          <div>
            <SectionBoxSubtitle>Address & Location</SectionBoxSubtitle>

            {/* Street address */}
            <label className="block text-sm font-medium text-gray-700 mt-2">
              Street Address
            </label>
            <input
              type="text"
              name="addressLine"
              value={houseInfo.addressLine}
              onChange={handleChange}
              onFocus={(e) => (e.target.placeholder = "")}
              onBlur={(e) => (e.target.placeholder = "Your street address")}
              placeholder="Your street address"
              className="w-full px-4 py-2 border border-gray-300 rounded mt-1"
            />

            <div className="flex gap-4 mt-4">
              {/* City */}
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={houseInfo.city}
                  onChange={handleChange}
                  onFocus={(e) => (e.target.placeholder = "")}
                  onBlur={(e) => (e.target.placeholder = "City")}
                  placeholder="City"
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                />
              </div>

              {/* ZIP */}
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  name="zip"
                  value={houseInfo.zip}
                  onChange={handleChange}
                  onFocus={(e) => (e.target.placeholder = "")}
                  onBlur={(e) => (e.target.placeholder = "ZIP Code")}
                  placeholder="ZIP Code"
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                />
              </div>
            </div>

            {/* Country + auto-detect button */}
            <div className="flex gap-4 mt-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <select
                  name="country"
                  value={houseInfo.country}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                >
                  <option value="">-- Select --</option>
                  <option value="USA">USA</option>
                  <option value="Canada">Canada</option>
                  {/* Add more countries as needed */}
                </select>
              </div>

              <div className="w-1/2 flex items-end">
                <button
                  type="button"
                  onClick={handleAutoFillLocation}
                  className="px-4 py-2 bg-blue-100 text-blue-600 border border-blue-400 rounded hover:bg-blue-200 transition-colors h-10"
                >
                  Auto Detect Location
                </button>
              </div>
            </div>
          </div>

          {/* Indoor Details Section */}
          <div>
            <SectionBoxSubtitle>Indoor Details</SectionBoxSubtitle>

            <div className="flex gap-4 mt-2">
              {/* House Type */}
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  House Type
                </label>
                <select
                  name="houseType"
                  value={houseInfo.houseType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                >
                  <option value="">-- Select --</option>
                  <option value="single_family">Single Family</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="apartment">Apartment / Condo</option>
                </select>
              </div>

              {/* Floors */}
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Floors
                </label>
                <select
                  name="floors"
                  value={houseInfo.floors}
                  onChange={handleNumber}
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3+</option>
                  {/* Adjust as needed */}
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-4">
              {/* Total Square Footage */}
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Square Footage
                </label>
                <input
                  type="text"
                  name="squareFootage"
                  value={houseInfo.squareFootage === 0 ? "" : houseInfo.squareFootage}
                  onChange={(e) => {
                    const val = parseNumberOrZero(e.target.value);
                    setHouseInfo((prev) => ({ ...prev, squareFootage: val }));
                  }}
                  onFocus={(e) => (e.target.placeholder = "")}
                  onBlur={(e) => (e.target.placeholder = "e.g. 1800")}
                  placeholder="e.g. 1800"
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                />
              </div>

              {/* Bedrooms */}
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bedrooms
                </label>
                <select
                  name="bedrooms"
                  value={houseInfo.bedrooms}
                  onChange={handleNumber}
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5+</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-4">
              {/* Bathrooms */}
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bathrooms
                </label>
                <select
                  name="bathrooms"
                  value={houseInfo.bathrooms}
                  onChange={handleNumber}
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5+</option>
                </select>
              </div>

              {/* Major Appliances */}
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Major Appliances
                </label>
                <select
                  name="applianceCount"
                  value={houseInfo.applianceCount}
                  onChange={handleNumber}
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5+</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-4">
              {/* Air Conditioners */}
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Air Conditioners (AC units)
                </label>
                <select
                  name="airConditioners"
                  value={houseInfo.airConditioners}
                  onChange={handleNumber}
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                >
                  <option value="0">None</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3+</option>
                </select>
              </div>

              {/* Boiler / Heater */}
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Boiler / Heater
                </label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="hasBoiler"
                    checked={houseInfo.hasBoiler}
                    onChange={toggleBoiler}
                    className="w-5 h-5 text-blue-600 cursor-pointer"
                  />
                  <label htmlFor="hasBoiler" className="cursor-pointer">
                    I have a boiler/furnace
                  </label>
                </div>
                {houseInfo.hasBoiler && (
                  <div className="mt-2">
                    <select
                      name="boilerType"
                      value={houseInfo.boilerType}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded"
                    >
                      <option value="">-- Select Type --</option>
                      <option value="gas">Gas</option>
                      <option value="electric">Electric</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Outdoor Details */}
          <div>
            <SectionBoxSubtitle>Outdoor Details</SectionBoxSubtitle>

            {/* Garage */}
            <div className="mt-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasGarage"
                  checked={houseInfo.hasGarage}
                  onChange={toggleGarage}
                  className="w-5 h-5 text-blue-600 cursor-pointer"
                />
                <label htmlFor="hasGarage" className="cursor-pointer">
                  I have a garage
                </label>
              </div>
              {houseInfo.hasGarage && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of garage spaces
                  </label>
                  <select
                    name="garageCount"
                    value={houseInfo.garageCount}
                    onChange={handleNumber}
                    className="w-1/2 px-4 py-2 border border-gray-300 rounded"
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5+</option>
                  </select>
                </div>
              )}
            </div>

            {/* Yard */}
            <div className="mt-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasYard"
                  checked={houseInfo.hasYard}
                  onChange={toggleYard}
                  className="w-5 h-5 text-blue-600 cursor-pointer"
                />
                <label htmlFor="hasYard" className="cursor-pointer">
                  I have a yard / lot / garden
                </label>
              </div>
              {houseInfo.hasYard && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Yard area (sq ft)
                  </label>
                  <input
                    type="text"
                    name="yardArea"
                    value={houseInfo.yardArea === 0 ? "" : houseInfo.yardArea}
                    onChange={(e) => {
                      const val = parseNumberOrZero(e.target.value);
                      setHouseInfo((prev) => ({ ...prev, yardArea: val }));
                    }}
                    onFocus={(e) => (e.target.placeholder = "")}
                    onBlur={(e) => (e.target.placeholder = "e.g. 300")}
                    placeholder="e.g. 300"
                    className="w-1/2 px-4 py-2 border border-gray-300 rounded"
                  />
                </div>
              )}
            </div>

            {/* Pool */}
            <div className="mt-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasPool"
                  checked={houseInfo.hasPool}
                  onChange={togglePool}
                  className="w-5 h-5 text-blue-600 cursor-pointer"
                />
                <label htmlFor="hasPool" className="cursor-pointer">
                  I have a pool
                </label>
              </div>
              {houseInfo.hasPool && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pool area (sq ft)
                  </label>
                  <input
                    type="text"
                    name="poolArea"
                    value={houseInfo.poolArea === 0 ? "" : houseInfo.poolArea}
                    onChange={(e) => {
                      const val = parseNumberOrZero(e.target.value);
                      setHouseInfo((prev) => ({ ...prev, poolArea: val }));
                    }}
                    onFocus={(e) => (e.target.placeholder = "")}
                    onBlur={(e) => (e.target.placeholder = "e.g. 250")}
                    placeholder="e.g. 250"
                    className="w-1/2 px-4 py-2 border border-gray-300 rounded"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}