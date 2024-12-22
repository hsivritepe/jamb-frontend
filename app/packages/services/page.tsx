"use client";

import { useEffect, useState, ChangeEvent, FocusEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BreadCrumb from "@/components/ui/BreadCrumb";
import Button from "@/components/ui/Button";
import { SectionBoxTitle } from "@/components/ui/SectionBoxTitle";
import { SectionBoxSubtitle } from "@/components/ui/SectionBoxSubtitle";
import { PACKAGES_STEPS } from "@/constants/navigation";
import { useLocation } from "@/context/LocationContext";  // <-- Auto-detect location

/** Save data to sessionStorage as JSON (client side only). */
function saveToSession(key: string, value: any) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(key, JSON.stringify(value));
  }
}

/** Load data from sessionStorage or return a default if not found or SSR. */
function loadFromSession<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  const stored = sessionStorage.getItem(key);
  try {
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/** A small helper to parse numeric inputs (strings -> number) */
function parseNumberOrZero(val: string): number {
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

export default function PackagesDetailsHomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { location } = useLocation(); // from your LocationContext

  // If you pass packageId in query, we capture it (optional).
  const packageId = searchParams.get("packageId") || "";

  // Combined house info state
  const [houseInfo, setHouseInfo] = useState<{
    country: string;       // "US" | "CA"
    city: string;
    zip: string;
    addressLine: string;   // e.g., street, etc.
    houseType: string;     // single_family / townhouse / apartment
    floors: number;        // 1-3
    squareFootage: number; // manual entry
    hasGarage: boolean;
    garageCount: number;   // 1-5
    hasYard: boolean;
    yardArea: number;      // manual entry
    hasPool: boolean;
    poolArea: number;      // manual entry
    hasBoiler: boolean;
    boilerType: string;    // gas / electric / ...
    washers: number;       // 1..5
    dryers: number;        // 1..5
    dishwashers: number;   // 1..5
    refrigerators: number; // 1..5
    ACunits: number;       // 1..5
  }>(() =>
    loadFromSession("packages_houseInfo", {
      country: "US",
      city: "",
      zip: "",
      addressLine: "",
      houseType: "",
      floors: 1,
      squareFootage: 0,
      hasGarage: false,
      garageCount: 1,
      hasYard: false,
      yardArea: 0,
      hasPool: false,
      poolArea: 0,
      hasBoiler: false,
      boilerType: "",
      washers: 1,
      dryers: 1,
      dishwashers: 1,
      refrigerators: 1,
      ACunits: 1,
    })
  );

  // Persist changes to session whenever houseInfo changes
  useEffect(() => {
    saveToSession("packages_houseInfo", houseInfo);
  }, [houseInfo]);

  // Handlers for string fields (e.g., addressLine, city, boilerType, houseType)
  function handleStringField(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setHouseInfo((prev) => ({ ...prev, [name]: value }));
  }

  // Handler for numeric fields (floors, squareFootage, yardArea, etc.)
  function handleNumberField(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setHouseInfo((prev) => ({ ...prev, [name]: parseNumberOrZero(value) }));
  }

  // Toggles
  function toggleGarage() {
    setHouseInfo((prev) => ({
      ...prev,
      hasGarage: !prev.hasGarage,
      garageCount: !prev.hasGarage ? 1 : 1, // default to 1 if enabling
    }));
  }
  function toggleYard() {
    setHouseInfo((prev) => ({
      ...prev,
      hasYard: !prev.hasYard,
      yardArea: !prev.hasYard ? 100 : 0,
    }));
  }
  function togglePool() {
    setHouseInfo((prev) => ({
      ...prev,
      hasPool: !prev.hasPool,
      poolArea: !prev.hasPool ? 100 : 0,
    }));
  }
  function toggleBoiler() {
    setHouseInfo((prev) => ({
      ...prev,
      hasBoiler: !prev.hasBoiler,
      boilerType: !prev.hasBoiler ? "gas" : "",
    }));
  }

  // On focus: clear placeholder
  function clearPlaceholder(e: FocusEvent<HTMLInputElement>) {
    e.target.placeholder = "";
  }

  // If user wants to auto-fill from the location context
  function handleUseMyLocation() {
    if (location?.city && location?.zip) {
      // Example: fill city, zip, country from context
      setHouseInfo((prev) => ({
        ...prev,
        city: location.city,
        zip: location.zip,
        country: location.country ?? "US",
      }));
    } else {
      alert("Location data is unavailable. Please enter manually.");
    }
  }

  // Next step
  function handleNext() {
    // Minimal validation
    if (!houseInfo.city.trim() || !houseInfo.zip.trim()) {
      alert("Please specify City and ZIP code first.");
      return;
    }
    if (!houseInfo.houseType) {
      alert("Please choose your house type.");
      return;
    }
    // Then proceed
    router.push(`/packages/services?packageId=${packageId}`);
  }

  return (
    <main className="min-h-screen pt-24 pb-16">
      {/* Breadcrumbs */}
      <div className="container mx-auto">
        <BreadCrumb items={PACKAGES_STEPS} />
      </div>

      <div className="container mx-auto mt-8">
        {/* Title row with Next button on the right */}
        <div className="flex justify-between items-center">
          <SectionBoxTitle>Home / Apartment Information</SectionBoxTitle>
          <Button onClick={handleNext}>Next →</Button>
        </div>

        <p className="text-gray-600 mt-2">
          Provide key details about your home so we can tailor your package.
        </p>

        <div className="bg-white border border-gray-300 mt-6 p-6 rounded-lg space-y-6 max-w-3xl">
          {/* Address / Location block */}
          <SectionBoxSubtitle>Address / Location</SectionBoxSubtitle>
          <div className="grid grid-cols-2 gap-4">
            {/* COUNTRY */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Country</label>
              <select
                name="country"
                value={houseInfo.country}
                onChange={handleStringField}
                className="w-full px-4 py-2 border rounded"
              >
                <option value="US">USA</option>
                <option value="CA">Canada</option>
              </select>
            </div>
            {/* ZIP */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Zip / Postal</label>
              <input
                type="text"
                name="zip"
                value={houseInfo.zip}
                onChange={handleStringField}
                placeholder="e.g. 10001"
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            {/* City */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">City</label>
              <input
                type="text"
                name="city"
                value={houseInfo.city}
                onChange={handleStringField}
                placeholder="e.g. New York"
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            {/* "Auto" button */}
            <div className="flex items-end">
              <button
                onClick={handleUseMyLocation}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Auto
              </button>
            </div>
          </div>
          {/* Detailed address (line) */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">Address Line</label>
            <input
              type="text"
              name="addressLine"
              value={houseInfo.addressLine}
              onChange={handleStringField}
              placeholder="Street & number (optional)"
              className="w-full px-4 py-2 border rounded"
            />
          </div>

          {/* HOME SECTION */}
          <SectionBoxSubtitle>Home Details</SectionBoxSubtitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* House Type */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">House Type</label>
              <select
                name="houseType"
                value={houseInfo.houseType}
                onChange={handleStringField}
                className="w-full px-4 py-2 border rounded"
              >
                <option value="">-- Select --</option>
                <option value="single_family">Single Family</option>
                <option value="townhouse">Townhouse</option>
                <option value="apartment">Apartment / Condo</option>
              </select>
            </div>
            {/* Floors */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Floors</label>
              <select
                name="floors"
                value={houseInfo.floors}
                onChange={handleNumberField}
                className="w-full px-4 py-2 border rounded"
              >
                <option value="1">1 floor</option>
                <option value="2">2 floors</option>
                <option value="3">3 floors</option>
              </select>
            </div>
          </div>

          {/* Square Footage */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Total Square Footage
            </label>
            <input
              type="text"
              name="squareFootage"
              value={houseInfo.squareFootage || ""}
              onChange={handleNumberField}
              onFocus={clearPlaceholder}
              onBlur={(e) => (e.target.placeholder = "Enter sq ft")}
              placeholder="Enter sq ft"
              className="w-full px-4 py-2 border rounded"
            />
          </div>

          {/* Garage */}
          <SectionBoxSubtitle>Garage</SectionBoxSubtitle>
          <div className="flex items-center gap-2 mt-2">
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
              <label className="block text-sm text-gray-700 mb-1">
                Number of Garage Spaces (1-5)
              </label>
              <select
                name="garageCount"
                value={houseInfo.garageCount}
                onChange={handleNumberField}
                className="w-full px-4 py-2 border rounded"
              >
                {[1,2,3,4,5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Outdoor section */}
          <SectionBoxSubtitle>Outdoor Details</SectionBoxSubtitle>
          {/* Yard */}
          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="hasYard"
              checked={houseInfo.hasYard}
              onChange={toggleYard}
              className="w-5 h-5 text-blue-600 cursor-pointer"
            />
            <label htmlFor="hasYard" className="cursor-pointer">
              I have a yard / outdoor space
            </label>
          </div>
          {houseInfo.hasYard && (
            <div className="mt-2">
              <label className="block text-sm text-gray-700 mb-1">
                Yard Area (sq ft)
              </label>
              <input
                type="text"
                name="yardArea"
                value={houseInfo.yardArea || ""}
                onChange={handleNumberField}
                onFocus={clearPlaceholder}
                onBlur={(e) => (e.target.placeholder = "Enter yard area")}
                placeholder="Enter yard area"
                className="w-full px-4 py-2 border rounded"
              />
            </div>
          )}

          {/* Pool */}
          <div className="flex items-center gap-2 mt-4">
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
              <label className="block text-sm text-gray-700 mb-1">
                Pool Area (sq ft)
              </label>
              <input
                type="text"
                name="poolArea"
                value={houseInfo.poolArea || ""}
                onChange={handleNumberField}
                onFocus={clearPlaceholder}
                onBlur={(e) => (e.target.placeholder = "Enter pool area")}
                placeholder="Enter pool area"
                className="w-full px-4 py-2 border rounded"
              />
            </div>
          )}

          {/* Boiler */}
          <SectionBoxSubtitle>Boiler / Furnace</SectionBoxSubtitle>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="hasBoiler"
              checked={houseInfo.hasBoiler}
              onChange={toggleBoiler}
              className="w-5 h-5 text-blue-600 cursor-pointer"
            />
            <label htmlFor="hasBoiler" className="cursor-pointer">
              I have a separate boiler or furnace
            </label>
          </div>
          {houseInfo.hasBoiler && (
            <div className="mt-2">
              <label className="block text-sm text-gray-700 mb-1">
                Boiler Type
              </label>
              <select
                name="boilerType"
                value={houseInfo.boilerType}
                onChange={handleStringField}
                className="w-full px-4 py-2 border rounded"
              >
                <option value="">-- Select --</option>
                <option value="gas">Gas</option>
                <option value="electric">Electric</option>
              </select>
            </div>
          )}

          {/* Appliances & AC units */}
          <SectionBoxSubtitle>Appliances & Air Conditioners</SectionBoxSubtitle>
          <p className="text-sm text-gray-600">
            Please select how many of each (1 to 5).
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {/* Washers */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Washers
              </label>
              <select
                name="washers"
                value={houseInfo.washers}
                onChange={handleNumberField}
                className="w-full px-3 py-2 border rounded"
              >
                {[1,2,3,4,5].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            {/* Dryers */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Dryers
              </label>
              <select
                name="dryers"
                value={houseInfo.dryers}
                onChange={handleNumberField}
                className="w-full px-3 py-2 border rounded"
              >
                {[1,2,3,4,5].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            {/* Dishwashers */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Dishwashers
              </label>
              <select
                name="dishwashers"
                value={houseInfo.dishwashers}
                onChange={handleNumberField}
                className="w-full px-3 py-2 border rounded"
              >
                {[1,2,3,4,5].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            {/* Refrigerators */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Refrigerators
              </label>
              <select
                name="refrigerators"
                value={houseInfo.refrigerators}
                onChange={handleNumberField}
                className="w-full px-3 py-2 border rounded"
              >
                {[1,2,3,4,5].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            {/* AC units */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                AC Units
              </label>
              <select
                name="ACunits"
                value={houseInfo.ACunits}
                onChange={handleNumberField}
                className="w-full px-3 py-2 border rounded"
              >
                {[1,2,3,4,5].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          {/* (We already have the Next button up in the header row.) */}
        </div>
      </div>
    </main>
  );
}