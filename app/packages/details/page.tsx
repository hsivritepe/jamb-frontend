"use client";

export const dynamic = "force-dynamic";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, ChangeEvent } from "react";
import BreadCrumb from "@/components/ui/BreadCrumb";
import { PACKAGES_STEPS } from "@/constants/navigation";
import Button from "@/components/ui/Button";
import { SectionBoxTitle } from "@/components/ui/SectionBoxTitle";
import { SectionBoxSubtitle } from "@/components/ui/SectionBoxSubtitle";
import { taxRatesUSA } from "@/constants/taxRatesUSA";
import { taxRatesCanada } from "@/constants/taxRatesCanada";
import { getSessionItem, setSessionItem } from "@/utils/session";

/**
 * Safely converts a string to a number. Returns 0 if invalid.
 */
function parseNumberOrZero(val: string): number {
  const num = parseFloat(val);
  return Number.isNaN(num) ? 0 : num;
}

/**
 * Default house/apartment info if none is found in session.
 */
const defaultHouseInfo = {
  country: "",
  city: "",
  zip: "",
  addressLine: "",
  state: "",
  province: "",
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

  // Try reading the packageId from query or session
  let packageId = searchParams.get("packageId");
  if (!packageId) {
    packageId = getSessionItem("packages_currentPackageId", "");
  }

  // Optionally redirect if no packageId
  useEffect(() => {
    if (!packageId) {
      // router.push("/packages");
    }
  }, [packageId]);

  // Always store packageId in session
  useEffect(() => {
    if (packageId) {
      setSessionItem("packages_currentPackageId", packageId);
    }
  }, [packageId]);

  // Load or initialize house info
  const [houseInfo, setHouseInfo] = useState(() =>
    getSessionItem("packages_houseInfo", defaultHouseInfo)
  );

  // Whenever houseInfo changes, persist it
  useEffect(() => {
    setSessionItem("packages_houseInfo", houseInfo);
  }, [houseInfo]);

  // Handle basic text/select changes
  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setHouseInfo((prev) => ({ ...prev, [name]: value }));
  }

  // Handle numeric inputs
  function handleNumber(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setHouseInfo((prev) => ({
      ...prev,
      [name]: parseNumberOrZero(value),
    }));
  }

  /**
   * Auto-detect location from ipapi.co
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
      const regionCode = data.region_code || "";

      setHouseInfo((prev) => ({
        ...prev,
        city,
        zip,
        country,
        state: country === "United States" ? regionCode : "",
        province: country === "Canada" ? regionCode : "",
      }));
    } catch (error) {
      console.error("Error fetching location:", error);
      alert("Failed to auto-detect location.");
    }
  }

  /**
   * Validate and go to the next step.
   */
  function handleNext() {
    if (!houseInfo.addressLine.trim()) {
      alert("Please enter your street address before proceeding.");
      return;
    }
    if (!houseInfo.city.trim() || !houseInfo.zip.trim()) {
      alert("Please enter city & ZIP (or use auto-detect) before proceeding.");
      return;
    }
    if (!houseInfo.houseType) {
      alert("Please select your house type.");
      return;
    }
    router.push(`/packages/services?packageId=${packageId}`);
  }

  /**
   * Clear the entire form.
   */
  function handleClearAll() {
    const confirmed = window.confirm("Are you sure you want to clear all data?");
    if (!confirmed) return;
    setHouseInfo(defaultHouseInfo);
  }

  // Toggles
  function toggleGarage() {
    setHouseInfo((prev) => ({
      ...prev,
      hasGarage: !prev.hasGarage,
      garageCount: !prev.hasGarage ? 1 : 0,
    }));
  }
  function toggleYard() {
    setHouseInfo((prev) => ({
      ...prev,
      hasYard: !prev.hasYard,
      yardArea: 0,
    }));
  }
  function togglePool() {
    setHouseInfo((prev) => ({
      ...prev,
      hasPool: !prev.hasPool,
      poolArea: 0,
    }));
  }
  function toggleBoiler() {
    setHouseInfo((prev) => ({
      ...prev,
      hasBoiler: !prev.hasBoiler,
      boilerType: !prev.hasBoiler ? "gas" : "",
    }));
  }

  const isUS = houseInfo.country === "USA";
  const isCanada = houseInfo.country === "Canada";

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto xl:px-0">
        <BreadCrumb items={PACKAGES_STEPS} />

        {/* Top: Title + Next button (desktop view) */}
        <div className="flex justify-between items-center mt-8">
          <SectionBoxTitle>Home Details</SectionBoxTitle>
          {/* Next button hidden on mobile, shown on sm+ */}
          <div className="hidden sm:block">
            <Button onClick={handleNext}>Next →</Button>
          </div>
        </div>

        {/* Sub-header + Clear */}
        <div className="flex justify-between items-center mt-2 sm:mt-8 xl:max-w-3xl">
          <p className="text-gray-600">
            Please provide details about your home
          </p>
          <button
            onClick={handleClearAll}
            className="text-sm text-blue-600 border border-blue-400 bg-blue-50 px-3 py-1 rounded hover:bg-blue-100 transition-colors"
          >
            Clear
          </button>
        </div>

        {/* Main form container */}
        <div className="bg-white border border-gray-300 mt-6 p-6 rounded-lg space-y-6 w-full xl:max-w-3xl">
          {/* Address */}
          <div>
            <SectionBoxSubtitle>Address &amp; Location</SectionBoxSubtitle>

            <label className="block text-sm font-medium text-gray-700 mt-2">
              Street Address
            </label>
            <input
              type="text"
              name="addressLine"
              value={houseInfo.addressLine}
              onChange={handleChange}
              placeholder="Your street address"
              className="w-full px-4 py-2 border border-gray-300 rounded mt-1"
            />

            <div className="flex flex-col xl:flex-row gap-4 mt-4">
              {/* City */}
              <div className="w-full xl:w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={houseInfo.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                />
              </div>
              {/* ZIP */}
              <div className="w-full xl:w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  name="zip"
                  value={houseInfo.zip}
                  onChange={handleChange}
                  placeholder="ZIP Code"
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                />
              </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-4 mt-4">
              {/* Country */}
              <div className="w-full xl:w-1/3">
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
                </select>
              </div>

              {/* State => US */}
              {isUS && (
                <div className="w-full xl:w-1/3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State (Short Code)
                  </label>
                  <select
                    name="state"
                    value={houseInfo.state}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded"
                  >
                    <option value="">-- Select --</option>
                    {taxRatesUSA.taxRates.map((tr) => (
                      <option key={tr.state} value={tr.state}>
                        {tr.state}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Province => Canada */}
              {isCanada && (
                <div className="w-full xl:w-1/3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Province
                  </label>
                  <select
                    name="province"
                    value={houseInfo.province}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded"
                  >
                    <option value="">-- Select --</option>
                    {taxRatesCanada.taxRates.map((prov) => (
                      <option key={prov.province} value={prov.province}>
                        {prov.province}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Auto-detect */}
              <div className="w-full xl:w-1/3 flex items-end">
                <button
                  type="button"
                  onClick={handleAutoFillLocation}
                  className="px-4 py-2 bg-blue-100 text-blue-600 border border-blue-400 rounded hover:bg-blue-200 transition-colors h-10 w-full xl:w-auto"
                >
                  Auto Detect
                </button>
              </div>
            </div>
          </div>

          {/* Indoor Details */}
          <div>
            <SectionBoxSubtitle>Indoor Details</SectionBoxSubtitle>

            <div className="flex flex-col xl:flex-row gap-4 mt-2">
              {/* House Type */}
              <div className="w-full xl:w-1/2">
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
              <div className="w-full xl:w-1/2">
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
                </select>
              </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-4 mt-4">
              {/* Total Square Footage */}
              <div className="w-full xl:w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Square Footage
                </label>
                <input
                  type="text"
                  name="squareFootage"
                  value={
                    houseInfo.squareFootage === 0 ? "" : houseInfo.squareFootage
                  }
                  onChange={(e) =>
                    setHouseInfo((prev) => ({
                      ...prev,
                      squareFootage: parseNumberOrZero(e.target.value),
                    }))
                  }
                  placeholder="e.g. 1800"
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                />
              </div>

              {/* Bedrooms */}
              <div className="w-full xl:w-1/2">
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

            <div className="flex flex-col xl:flex-row gap-4 mt-4">
              {/* Bathrooms */}
              <div className="w-full xl:w-1/2">
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
              <div className="w-full xl:w-1/2">
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

            <div className="flex flex-col xl:flex-row gap-4 mt-4">
              {/* Air Conditioners */}
              <div className="w-full xl:w-1/2">
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
              <div className="w-full xl:w-1/2">
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
                    className="w-full xl:w-1/2 px-4 py-2 border border-gray-300 rounded"
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
                    onChange={(e) =>
                      setHouseInfo((prev) => ({
                        ...prev,
                        yardArea: parseNumberOrZero(e.target.value),
                      }))
                    }
                    placeholder="e.g. 300"
                    className="w-full xl:w-1/2 px-4 py-2 border border-gray-300 rounded"
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
                    onChange={(e) =>
                      setHouseInfo((prev) => ({
                        ...prev,
                        poolArea: parseNumberOrZero(e.target.value),
                      }))
                    }
                    placeholder="e.g. 250"
                    className="w-full xl:w-1/2 px-4 py-2 border border-gray-300 rounded"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Next button for mobile only, pinned at bottom, hidden on sm+ (new comment in English) */}
      <div className="block sm:hidden mt-6">
        <Button onClick={handleNext} className="w-full justify-center">
          Next →
        </Button>
      </div>
    </main>
  );
}