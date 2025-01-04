"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { NavigationItem } from "@/types/common";
import { useLocation } from "@/context/LocationContext";

// ← Импортируем наш новый компонент!
import PreferencesModal from "@/components/ui/PreferencesModal";

// Example array for top navigation
const navigation: NavigationItem[] = [
  { name: "Services", href: "/calculate" },
  { name: "Rooms", href: "/rooms" },
  { name: "Packages", href: "/packages" },
  { name: "About", href: "/about" },
];

const languageMap: Record<string, string> = {
  ENG: "English",
  FRA: "Français",
  ESP: "Español",
  // ...
};

// Helper function to truncate text if it exceeds a maximum length
function truncateText(text: string, maxLength: number) {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

/**
 * Utility functions to parse the city and state from the Google Geocoding "address_components".
 */
function parseCityFromComponents(components: any[]): string {
  let cityObj = components.find((c: any) => c.types.includes("locality"));
  if (cityObj) return cityObj.long_name;

  cityObj = components.find((c: any) =>
    c.types.includes("administrative_area_level_2")
  );
  if (cityObj) return cityObj.long_name;

  return "Unknown City";
}

function parseStateFromComponents(components: any[]): string {
  const stateObj = components.find((c: any) =>
    c.types.includes("administrative_area_level_1")
  );
  return stateObj?.short_name || "??";
}

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // LOCATION from our custom context
  const { location, setLocation } = useLocation();

  // Location modal state
  const [showLocationModal, setShowLocationModal] = useState(false);
  const locationModalRef = useRef<HTMLDivElement>(null);

  // Local state for manual city/zip/state input
  const [manualLocation, setManualLocation] = useState({
    city: "",
    zip: "",
    state: "",
  });

  // Preferences modal state (не трогаем!)
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const preferencesModalRef = useRef<HTMLDivElement>(null);

  // Language, units, currency
  const [selectedLanguage, setSelectedLanguage] = useState("ENG");
  const [selectedUnit, setSelectedUnit] = useState("Feet");
  const [selectedCurrency, setSelectedCurrency] = useState("US");
  const languages = Object.keys(languageMap);
  const units = ["Feet", "Meters"];
  const currencies = ["US", "CAD", "GBP", "EUR", "JPY", "CNY"];

  /**
   * Saves user preferences (language, units, currency).
   */
  const handlePreferencesSave = () => {
    console.log("Saved preferences:", {
      language: selectedLanguage,
      unit: selectedUnit,
      currency: selectedCurrency,
    });
    setShowPreferencesModal(false);
  };

  const pathname = usePathname();
  const isEmergencyActive = pathname.startsWith("/emergency");

  /**
   * Called when the user clicks "Save" in the location modal.
   */
  const handleManualLocationSave = () => {
    const newLoc = {
      city: manualLocation.city || "City",
      zip: manualLocation.zip.trim() || "00000",
      country: "United States",
      state: manualLocation.state || "",
    };

    setLocation(newLoc);
    localStorage.setItem("userLocation", JSON.stringify(newLoc));
    setShowLocationModal(false);
  };

  const handleAutoFill = async () => {
    try {
      const response = await fetch("https://ipapi.co/json/");
      if (!response.ok) throw new Error("Failed to fetch location data");

      const data = await response.json();
      const city = data.city || "City";
      const zip = data.postal || "00000";
      const st = data.region_code || ""; // ipapi.co can provide state code (e.g. CA)

      setManualLocation({ city, zip, state: st });
      setLocation({ city, zip, state: st, country: data.country_name || "USA" });

      localStorage.setItem(
        "userLocation",
        JSON.stringify({ city, zip, state: st, country: data.country_name || "USA" })
      );
    } catch (error) {
      console.error("Error fetching location:", error);
      alert("Failed to fetch location automatically.");
    }
  };

  const handleZipLookup = async () => {
    if (!manualLocation.zip.trim()) {
      alert("Please enter a ZIP code");
      return;
    }
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error("Missing Google Maps API key");
      return;
    }
    const zip = manualLocation.zip.trim();
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${zip}&components=country:US&key=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const comps = data.results[0].address_components;
        const cityFound = parseCityFromComponents(comps);
        const stateFound = parseStateFromComponents(comps);
        setManualLocation((prev) => ({
          ...prev,
          city: cityFound,
          state: stateFound,
        }));
      } else {
        alert("No city/state found for this ZIP in the US.");
      }
    } catch (err) {
      console.error("Error in handleZipLookup:", err);
      alert("Failed to look up city and state from ZIP.");
    }
  };

  const handleClearLocation = () => {
    setManualLocation({ city: "", zip: "", state: "" });
  };

  /**
   * Closes modals if user clicks outside of them.
   */
  const handleOutsideClick = (e: MouseEvent) => {
    if (
      showLocationModal &&
      locationModalRef.current &&
      !locationModalRef.current.contains(e.target as Node)
    ) {
      setShowLocationModal(false);
    }
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

  return (
    <>
      <header className="fixed w-full z-50 bg-gray-100/50 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="bg-white rounded-2xl">
            <div className="flex justify-between items-center h-16 px-6">
              {/* Logo */}
              <Link href="/" prefetch={false} className="flex-shrink-0">
                <img src="/images/logo.png" alt="Jamb" className="h-8 w-auto" />
              </Link>

              {/* Location: city, zip, state */}
              <div
                className="flex flex-col items-start w-[220px] overflow-hidden text-ellipsis whitespace-normal"
                title="Click to change location"
              >
                <span className="text-sm font-medium text-gray-500">
                  Are you here?
                </span>
                <strong
                  onClick={() => setShowLocationModal(true)}
                  className="text-[1.15rem] font-medium text-black cursor-pointer transition-colors duration-200 hover:text-blue-600"
                >
                  {truncateText(location.city, 10)}, {location.state ?? "--"},{" "}
                  {truncateText(location.zip, 10)}
                </strong>
              </div>

              {/* Desktop navigation */}
              <div className="hidden md:flex items-center gap-8">
                {navigation.map((item) => {
                  const isActive = usePathname().startsWith(item.href);
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

              {/* Right side of the header */}
              <div className="hidden md:flex items-center gap-4">
                {/* Emergency link */}
                <Link
                  href="/emergency"
                  prefetch={false}
                  className={`flex items-center gap-2 text-red-600 font-medium px-4 py-2 rounded-lg 
                    transition-colors duration-200 bg-red-50 hover:bg-red-100 border-2 ${
                      usePathname().startsWith("/emergency")
                        ? "border-red-600"
                        : "border-transparent"
                    }`}
                >
                  <span>🚨</span>
                  Emergency
                </Link>

                {/* Preferences button */}
                <button
                  onClick={() => setShowPreferencesModal(true)}
                  className="w-[110px] inline-flex items-center justify-between gap-1 text-gray-700 bg-[rgba(0,0,0,0.03)] px-3 py-2 rounded-lg transition-colors duration-200 hover:bg-[rgba(0,0,0,0.08)]"
                >
                  <span className="truncate">{languageMap[selectedLanguage] ?? "English"}</span>
                  <ChevronDown className="w-4 h-4 shrink-0" />
                </button>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen((prev) => !prev)}
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
                    const isActive = usePathname().startsWith(item.href);
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
                      usePathname().startsWith("/emergency")
                        ? "border-red-600"
                        : "border-transparent"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>🚨</span>
                    Emergency
                  </Link>

                  {/* Preferences link for mobile */}
                  <button
                    className="w-[110px] inline-flex items-center justify-between gap-1 text-gray-700 
                    bg-[rgba(0,0,0,0.03)] px-3 py-2 rounded-lg hover:bg-[rgba(0,0,0,0.08)]"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setShowPreferencesModal(true);
                    }}
                  >
                    <span className="truncate">{languageMap[selectedLanguage] ?? "English"}</span>
                    <ChevronDown className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* LOCATION MODAL (не меняем!) */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[9999]">
          <div
            ref={locationModalRef}
            className="bg-white p-8 rounded-xl shadow-lg max-w-[400px] w-[90%] text-center"
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Set Your Location
            </h2>

            {/* City field */}
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

            {/* ZIP field */}
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

            {/* State (short code) */}
            <label
              htmlFor="state-input"
              className="block text-left text-sm font-medium text-gray-600 mb-1"
            >
              State
            </label>
            <input
              id="state-input"
              name="state"
              type="text"
              placeholder="CA, TX, NY..."
              value={manualLocation.state}
              onChange={(e) =>
                setManualLocation({ ...manualLocation, state: e.target.value })
              }
              className="w-full max-w-[360px] p-3 mb-4 border border-gray-300 rounded-lg text-base"
            />

            <div className="flex flex-wrap justify-between gap-4 mt-6">
              <button
                className="flex-1 p-3 font-medium border rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 border-gray-300"
                onClick={handleAutoFill}
              >
                Auto
              </button>

              <button
                className="flex-1 p-3 font-medium border rounded-lg bg-green-100 text-green-700 border-green-300 hover:bg-green-200"
                onClick={handleZipLookup}
              >
                ZIP
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

      {/* PREFERENCES MODAL (теперь отдельный компонент) */}
      <PreferencesModal
        show={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
        onSave={handlePreferencesSave}
        preferencesModalRef={preferencesModalRef}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
        selectedUnit={selectedUnit}
        setSelectedUnit={setSelectedUnit}
        selectedCurrency={selectedCurrency}
        setSelectedCurrency={setSelectedCurrency}
        languages={languages}
        units={units}
        currencies={currencies}
        languageMap={languageMap}
      />
    </>
  );
}