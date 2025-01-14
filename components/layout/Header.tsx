"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { NavigationItem } from "@/types/common";
import { useLocation } from "@/context/LocationContext";

// Example array for top navigation
const navigation: NavigationItem[] = [
  { name: "Services", href: "/calculate" },
  { name: "Rooms", href: "/rooms" },
  { name: "Packages", href: "/packages" },
  { name: "About", href: "/about" },
];

// Mapping language codes to localized display text
const languageMap: Record<string, string> = {
  ENG: "English",
  FRA: "Français",
  ESP: "Español",
  CHN: "中文",
  RUS: "Русский",
  KOR: "한국어",
  TUR: "Türkçe",
  POR: "Português",
  JPN: "日本語",
  GER: "Deutsch",
  HEB: "עברית",
  ARB: "العربية",
};

// Helper: truncates text to a max length
function truncateText(text: string, maxLength: number) {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ---------- LOCATION ----------
  const { location, setLocation } = useLocation();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const locationModalRef = useRef<HTMLDivElement>(null);

  // For the location input fields
  const [manualLocation, setManualLocation] = useState({ city: "", zip: "" });

  // ---------- PREFERENCES MODAL (LANGUAGE, UNITS, CURRENCY) ----------
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const preferencesModalRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const isEmergencyActive = pathname.startsWith("/emergency");

  // ---------- LOCATION HANDLERS ----------
  const handleManualLocationSave = () => {
    setLocation({
      city: manualLocation.city || "Enter City",
      zip: manualLocation.zip.trim() || "and ZIP",
    });
    setShowLocationModal(false);
  };

  const handleAutoFill = async () => {
    try {
      const response = await fetch("https://ipapi.co/json/");
      if (!response.ok) throw new Error("Failed to fetch location data");

      const data = await response.json();
      const fullZip = data.postal || "0000000";

      setManualLocation({
        city: data.city || "City",
        zip: fullZip,
      });
      setLocation({
        city: data.city || "City",
        zip: fullZip,
      });
    } catch (error) {
      console.error("Error fetching location:", error);
      alert("Failed to fetch location automatically.");
    }
  };

  const handleClearLocation = () => {
    setManualLocation({ city: "", zip: "" });
  };

  // ---------- PREFERENCES STATE & HANDLERS ----------
  const [selectedLanguage, setSelectedLanguage] = useState("ENG");
  const [selectedUnit, setSelectedUnit] = useState("Feet");
  const [selectedCurrency, setSelectedCurrency] = useState("US");

  // Example arrays
  const languages = Object.keys(languageMap); // e.g. ["ENG","FRA","ESP" ...]
  const units = ["Feet", "Meters"];
  const currencies = ["US", "CAD", "GBP", "EUR", "JPY", "CNY"];

  const handlePreferencesSave = () => {
    // You could store these in sessionStorage, context, or user profile
    console.log("Saved preferences:", {
      language: selectedLanguage,
      unit: selectedUnit,
      currency: selectedCurrency,
    });
    setShowPreferencesModal(false);
  };

  // ---------- OUTSIDE CLICK HANDLER FOR MODALS ----------
  const handleOutsideClick = (e: MouseEvent) => {
    // Location modal
    if (
      showLocationModal &&
      locationModalRef.current &&
      !locationModalRef.current.contains(e.target as Node)
    ) {
      setShowLocationModal(false);
    }
    // Preferences modal
    if (
      showPreferencesModal &&
      preferencesModalRef.current &&
      !preferencesModalRef.current.contains(e.target as Node)
    ) {
      setShowPreferencesModal(false);
    }
  };

  useEffect(() => {
    if (showLocationModal || showPreferencesModal) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showLocationModal, showPreferencesModal]);

  // ---------- RENDER ----------
  return (
    <>
      <header className="fixed w-full z-50 bg-gray-100/50 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="bg-white rounded-2xl">
            <div className="flex justify-between items-center h-16 px-6">
              {/* Logo */}
              <Link href="/" prefetch={false} className="flex-shrink-0">
                <img
                  src="/images/logo.png"
                  alt="Jamb"
                  className="h-8 w-auto"
                />
              </Link>

              {/* Location chunk */}
              <div
                className="flex flex-col items-start w-[200px] overflow-hidden text-ellipsis whitespace-normal"
                title="Click to change location"
              >
                <span className="text-sm font-medium text-gray-500">
                  Are you here?
                </span>
                <strong
                  onClick={() => setShowLocationModal(true)}
                  className="text-[1.15rem] font-medium text-black cursor-pointer transition-colors duration-200 hover:text-blue-600"
                >
                  {truncateText(location.city, 10)},{" "}
                  {truncateText(location.zip, 10)}
                </strong>
              </div>

              {/* Desktop navigation */}
              <div className="hidden md:flex items-center gap-8">
                {navigation.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`font-medium transition-colors duration-200 ${
                        isActive
                          ? "text-blue-600"
                          : "text-gray-700 hover:text-blue-600"
                      }`}
                      prefetch={false}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>

              {/* Right side (desktop) */}
              <div className="hidden md:flex items-center gap-4">
                {/* Emergency */}
                <Link
                  href="/emergency"
                  prefetch={false}
                  className={`flex items-center gap-2 text-red-600 font-medium px-4 py-2 rounded-lg transition-colors duration-200 bg-red-50 hover:bg-red-100
                    border-2 ${
                      isEmergencyActive ? "border-red-600" : "border-transparent"
                    }`}
                >
                  <span>🚨</span>
                  Emergency
                </Link>

                {/* Preferences button: fixed width so it doesn't resize */}
                <button
                  onClick={() => setShowPreferencesModal(true)}
                  className="w-[110px] inline-flex items-center justify-between gap-1 text-gray-700 bg-[rgba(0,0,0,0.03)] px-3 py-2 rounded-lg transition-colors duration-200 hover:bg-[rgba(0,0,0,0.08)]"
                >
                  <span className="truncate">
                    {languageMap[selectedLanguage] ?? "English"}
                  </span>
                  <ChevronDown className="w-4 h-4 shrink-0" />
                </button>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-gray-700 p-2"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>

            {/* Mobile navigation */}
            {isMobileMenuOpen && (
              <div className="md:hidden py-4 px-6 border-t">
                <div className="flex flex-col gap-4">
                  {navigation.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`font-medium transition-colors duration-200 ${
                          isActive
                            ? "text-blue-600"
                            : "text-gray-700 hover:text-blue-600"
                        }`}
                        prefetch={false}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    );
                  })}

                  {/* Emergency link for mobile */}
                  <Link
                    href="/emergency"
                    prefetch={false}
                    className={`flex items-center gap-2 text-red-600 font-medium border-2 ${
                      isEmergencyActive ? "border-red-600" : "border-transparent"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>🚨</span>
                    Emergency
                  </Link>

                  {/* Preferences link for mobile */}
                  <button
                    className="w-[110px] inline-flex items-center justify-between gap-1 text-gray-700 bg-[rgba(0,0,0,0.03)] px-3 py-2 rounded-lg hover:bg-[rgba(0,0,0,0.08)]"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setShowPreferencesModal(true);
                    }}
                  >
                    <span className="truncate">
                      {languageMap[selectedLanguage] ?? "English"}
                    </span>
                    <ChevronDown className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* ---------- LOCATION MODAL ---------- */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[9999]">
          <div
            ref={locationModalRef}
            className="bg-white p-8 rounded-xl shadow-lg max-w-[400px] w-[90%] text-center"
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Set Your Location
            </h2>

            {/* City */}
            <label
              htmlFor="city-input"
              className="block text-left text-sm font-medium text-gray-600 mb-1"
            >
              City
            </label>
            <input
              id="city-input"
              name="city"
              type="text"
              placeholder="Enter your city"
              value={manualLocation.city}
              onChange={(e) =>
                setManualLocation({ ...manualLocation, city: e.target.value })
              }
              className="w-full max-w-[360px] p-3 mb-4 border border-gray-300 rounded-lg text-base"
            />

            {/* ZIP */}
            <label
              htmlFor="zip-input"
              className="block text-left text-sm font-medium text-gray-600 mb-1"
            >
              ZIP Code
            </label>
            <input
              id="zip-input"
              name="zip"
              type="text"
              placeholder="Enter your ZIP code"
              value={manualLocation.zip}
              onChange={(e) =>
                setManualLocation({ ...manualLocation, zip: e.target.value })
              }
              className="w-full max-w-[360px] p-3 mb-4 border border-gray-300 rounded-lg text-base"
            />

            <div className="flex justify-between gap-4 mt-6">
              <button
                className="flex-1 p-3 font-medium border rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 border-gray-300"
                onClick={handleAutoFill}
              >
                Auto
              </button>
              <button
                className="flex-1 p-3 font-medium border rounded-lg bg-red-100 text-red-700 border-red-300 hover:bg-red-200"
                onClick={handleClearLocation}
              >
                Clear
              </button>
              <button
                className="flex-1 p-3 font-medium border-none rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                onClick={handleManualLocationSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- PREFERENCES MODAL ---------- */}
      {showPreferencesModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[9999]">
          <div
            ref={preferencesModalRef}
            className="bg-white p-6 rounded-xl shadow-lg max-w-[500px] w-[90%]"
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Preferences
            </h2>

            {/* Language */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-2">Language</h3>
              <div className="flex flex-wrap gap-2">
                {languages.map((langCode) => {
                  const label = languageMap[langCode];
                  return (
                    <button
                      key={langCode}
                      onClick={() => setSelectedLanguage(langCode)}
                      className={`px-3 py-1 rounded border transition-colors 
                      ${
                        selectedLanguage === langCode
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Units */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-2">
                Measurement Units
              </h3>
              <div className="flex gap-4">
                {units.map((u) => (
                  <button
                    key={u}
                    onClick={() => setSelectedUnit(u)}
                    className={`px-3 py-1 rounded border transition-colors 
                      ${
                        selectedUnit === u
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                      }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            {/* Currency */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-2">Currency</h3>
              <div className="flex flex-wrap gap-2">
                {currencies.map((cur) => (
                  <button
                    key={cur}
                    onClick={() => setSelectedCurrency(cur)}
                    className={`px-3 py-1 rounded border transition-colors 
                      ${
                        selectedCurrency === cur
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                      }`}
                  >
                    {cur}
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowPreferencesModal(false)}
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePreferencesSave}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}