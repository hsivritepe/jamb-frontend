"use client";

export const dynamic = "force-dynamic";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, AlertTriangle, ChevronDown, User } from "lucide-react";
import { NavigationItem } from "@/types/common";
import { useLocation } from "@/context/LocationContext";
import PreferencesModal from "@/components/ui/PreferencesModal";

/**
 * Header component with logo, location info, and navigation.
 * The PreferencesModal only supports ENG, Feet, and US for now.
 */
const navigation: NavigationItem[] = [
  { name: "Services", href: "/calculate" },
  { name: "Rooms", href: "/rooms" },
  { name: "Packages", href: "/packages" },
  { name: "About", href: "/about" },
];

const languageMap: Record<string, string> = {
  ENG: "ENG",
  FRA: "FRA",
  ESP: "ESP",
  GER: "GER",
  ITA: "ITA",
  RUS: "RUS",
  JPN: "JPN",
  CHN: "CHN",
  IND: "IND",
  TUR: "TUR",
  KOR: "KOR",
  POR: "POR",
};

/**
 * Truncates text to a maximum length.
 */
function truncateText(text: string, maxLength: number) {
  if (text.length > maxLength) {
    return text.slice(0, maxLength) + "...";
  }
  return text;
}

/**
 * Gets the city name from Google geocode components.
 */
function parseCityFromComponents(components: any[]): string {
  let cityObj = components.find((c: any) => c.types.includes("locality"));
  if (cityObj) {
    return cityObj.long_name;
  }
  cityObj = components.find((c: any) =>
    c.types.includes("administrative_area_level_2")
  );
  if (cityObj) {
    return cityObj.long_name;
  }
  return "Unknown City";
}

/**
 * Gets the state short name from Google geocode components.
 */
function parseStateFromComponents(components: any[]): string {
  const stateObj = components.find((c: any) =>
    c.types.includes("administrative_area_level_1")
  );
  if (stateObj && stateObj.short_name) {
    return stateObj.short_name;
  }
  return "??";
}

/**
 * Returns initials (e.g., from firstName + lastName).
 */
function getInitials(firstName: string, lastName: string): string {
  const f = firstName.trim();
  const s = lastName.trim();
  if (!f && !s) return "";
  const i1 = f ? f[0].toUpperCase() : "";
  const i2 = s ? s[0].toUpperCase() : "";
  return i1 + i2;
}

/**
 * Mobile nav subcomponent for menu logic.
 */
function MobileNav({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  navigation,
  pathname,
  languageMap,
  selectedLanguage,
  setShowPreferencesModal,
  isLoggedIn,
  userName,
  userSurname,
}: {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (v: boolean) => void;
  navigation: NavigationItem[];
  pathname: string;
  languageMap: Record<string, string>;
  selectedLanguage: string;
  setShowPreferencesModal: (v: boolean) => void;
  isLoggedIn: boolean;
  userName: string;
  userSurname: string;
}) {
  if (!isMobileMenuOpen) return null;

  let mobileLoggedInLabel = "My Account";
  const fullName = (userName + " " + userSurname).trim();
  if (fullName.length > 1) {
    mobileLoggedInLabel = fullName;
  }

  return (
    <div className="lg:hidden py-4 px-6 border-t">
      <div className="flex flex-col gap-4 items-center text-center">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`font-semibold sm:font-medium transition-colors duration-200 ${
                isActive ? "text-blue-600" : "text-gray-700 hover:text-blue-600"
              }`}
              prefetch={false}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          );
        })}

        {/* Emergency link */}
        <Link
          href="/emergency"
          prefetch={false}
          className={`flex items-center gap-2 font-semibold sm:font-medium text-gray-700 ${
            pathname.startsWith("/emergency")
              ? "text-red-600 font-semibold"
              : "border-transparent"
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <AlertTriangle size={18} className="text-red-600" />
          Emergency
        </Link>

        {/* Preferences */}
        <button
          className="w-[110px] inline-flex items-center justify-between gap-1 text-gray-700 
            bg-[rgba(0,0,0,0.03)] px-3 py-2 rounded-lg hover:bg-[rgba(0,0,0,0.08)]"
          onClick={() => {
            setIsMobileMenuOpen(false);
            setShowPreferencesModal(true);
          }}
        >
          <span className="truncate">
            {languageMap[selectedLanguage] ?? "ENG"}
          </span>
          <ChevronDown className="w-4 h-4 shrink-0" />
        </button>

        {/* Personal Account link */}
        {isLoggedIn ? (
          <Link
            href="/profile"
            className="text-gray-700 hover:text-blue-600 flex items-center gap-2"
            onClick={() => setIsMobileMenuOpen(false)}
            title="Go to your account"
          >
            <User className="w-5 h-5" />
            <span className="font-semibold sm:font-medium">{mobileLoggedInLabel}</span>
          </Link>
        ) : (
          <Link
            href="/login"
            className="text-gray-700 hover:text-blue-600 font-semibold sm:font-medium flex items-center gap-2"
            onClick={() => setIsMobileMenuOpen(false)}
            title="Login / Register"
          >
            <User className="w-5 h-5 font-semibold sm:font-medium" />
            <span>Login</span>
          </Link>
        )}
      </div>
    </div>
  );
}

/**
 * Main Header component.
 */
export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Location state
  const { location, setLocation } = useLocation();

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userSurname, setUserSurname] = useState("");

  // Handle "authChange" for login state
  useEffect(() => {
    const checkAuthToken = () => {
      const token = sessionStorage.getItem("authToken");
      if (token) {
        setIsLoggedIn(true);

        // Fetch user info
        fetch("https://dev.thejamb.com/user/info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })
          .then(async (res) => {
            if (res.ok) {
              const data = await res.json();
              if (data.name) setUserName(data.name);
              if (data.surname) setUserSurname(data.surname);
            } else {
              console.warn("Failed to fetch user info. Status:", res.status);
            }
          })
          .catch((err) => {
            console.error("Error fetching user info:", err);
          });
      } else {
        setIsLoggedIn(false);
        setUserName("");
        setUserSurname("");
      }
    };

    checkAuthToken();
    window.addEventListener("authChange", checkAuthToken);

    return () => {
      window.removeEventListener("authChange", checkAuthToken);
    };
  }, []);

  // Location modal
  const [showLocationModal, setShowLocationModal] = useState(false);
  const locationModalRef = useRef<HTMLDivElement>(null);

  // Preferences modal
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const preferencesModalRef = useRef<HTMLDivElement>(null);

  // Manual location input
  const [manualLocation, setManualLocation] = useState({
    city: "",
    zip: "",
    state: "",
  });

  // Preferences for language, units, currency
  const [selectedLanguage, setSelectedLanguage] = useState("ENG");
  const [selectedUnit, setSelectedUnit] = useState("Feet");
  const [selectedCurrency, setSelectedCurrency] = useState("US");

  const languages = Object.keys(languageMap);
  const units = ["Feet", "Meters"];
  const currencies = ["US", "CAD", "GBP", "EUR", "JPY", "CNY"];

  const handlePreferencesSave = () => {
    console.log("Saved preferences:", {
      language: selectedLanguage,
      unit: selectedUnit,
      currency: selectedCurrency,
    });
    setShowPreferencesModal(false);
  };

  const pathname = usePathname();

  const handleManualLocationSave = () => {
    const newLoc = {
      city: manualLocation.city || "New York",
      zip: manualLocation.zip.trim() || "10001",
      country: "United States",
      state: manualLocation.state || "NY",
    };
    setLocation(newLoc);
    localStorage.setItem("userLocation", JSON.stringify(newLoc));
    setShowLocationModal(false);
  };

  const handleAutoFill = async () => {
    try {
      const response = await fetch("https://ipapi.co/json/");
      if (!response.ok) {
        throw new Error("Failed to fetch location data");
      }
      const data = await response.json();
      const city = data.city || "City";
      const zip = data.postal || "00000";
      const st = data.region_code || "";
      setManualLocation({ city, zip, state: st });
      setLocation({
        city,
        zip,
        state: st,
        country: data.country_name || "USA",
      });
      localStorage.setItem(
        "userLocation",
        JSON.stringify({
          city,
          zip,
          state: st,
          country: data.country_name || "USA",
        })
      );
    } catch (error) {
      console.error("Error fetching location:", error);
      alert("Failed to fetch location automatically.");
    }
  };

  /**
   * Looks up city/state from a ZIP code. Ensures we always get the city in English.
   */
  const handleZipLookup = async (zipParam?: string) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const zipToUse = zipParam?.trim() || manualLocation.zip.trim();

    if (!zipToUse) {
      alert("Please enter a ZIP code");
      return;
    }
    if (!apiKey) {
      console.error("Missing Google Maps API key");
      return;
    }
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${zipToUse}&components=country:US&language=en&key=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const comps = data.results[0].address_components;
        const cityFound = comps.find((c: any) =>
          c.types.includes("locality")
        )?.long_name;
        const stateFound = comps.find((c: any) =>
          c.types.includes("administrative_area_level_1")
        )?.short_name;
        setManualLocation((prev) => ({
          ...prev,
          city: cityFound ?? prev.city,
          state: stateFound ?? prev.state,
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

  // Determine avatar for desktop
  let desktopAvatar: JSX.Element;
  if (isLoggedIn) {
    const initials = getInitials(userName, userSurname);
    if (initials) {
      desktopAvatar = (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm">
          {initials}
        </div>
      );
    } else {
      desktopAvatar = (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white">
          <User className="w-5 h-5" />
        </div>
      );
    }
  } else {
    desktopAvatar = (
      <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-400 bg-white text-gray-700">
        <User className="w-5 h-5" />
      </div>
    );
  }

  return (
    <>
      <header className="fixed w-full z-50 bg-gray-100/50 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4">
          <nav className="bg-white rounded-2xl">
            <div className="flex justify-between items-center h-16 px-6">
              {/* Logo */}
              <Link href="/" prefetch={false} className="flex-shrink-0">
                <img
                  src="/images/logo.png"
                  alt="Jamb"
                  className="h-6 w-auto md:h-7 lg:h-8 mr-4"
                />
              </Link>

              {/* Location */}
              <div
                className="
                  flex flex-col items-start
                  w-[160px]
                  sm:w-[220px]
                  overflow-hidden 
                  text-ellipsis
                  whitespace-normal
                "
                title="Click to change location"
              >
                <span className="text-xs font-semibold sm:font-medium text-gray-500 sm:text-sm">
                  Are you here?
                </span>
                <strong
                  onClick={() => setShowLocationModal(true)}
                  className="
                    text-sm
                    font-semibold
                    sm:font-medium
                    text-black 
                    cursor-pointer 
                    transition-colors 
                    duration-200 
                    hover:text-blue-600 
                    sm:text-[1.15rem]
                  "
                >
                  {truncateText(location.city, 10)}, {location.state ?? "--"},{" "}
                  {truncateText(location.zip, 10)}
                </strong>
              </div>

              {/* Desktop nav */}
              <div className="hidden lg:flex items-center gap-8 mx-2">
                {navigation.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`font-bold sm:font-medium transition-colors duration-200 ${
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
              <div className="hidden lg:flex items-center gap-4">
                {/* Emergency link */}
                <Link
                  href="/emergency"
                  prefetch={false}
                  className={`flex items-center gap-2 text-red-600 font-medium px-4 py-2 rounded-lg 
                    transition-colors duration-200 bg-red-50 hover:bg-red-100 border-2 ${
                      pathname.startsWith("/emergency")
                        ? "border-red-600"
                        : "border-transparent"
                    }`}
                >
                  <AlertTriangle size={18} className="text-red-600" />
                  Emergency
                </Link>

                {/* Preferences */}
                <button
                  onClick={() => setShowPreferencesModal(true)}
                  className="w-[80px] inline-flex items-center justify-between gap-1 text-gray-700 bg-[rgba(0,0,0,0.03)] px-3 py-2 rounded-lg transition-colors duration-200 hover:bg-[rgba(0,0,0,0.08)]"
                >
                  <span className="truncate">
                    {languageMap[selectedLanguage] ?? "ENG"}
                  </span>
                  <ChevronDown className="w-4 h-4 shrink-0" />
                </button>

                {/* Personal Account (icon) */}
                {isLoggedIn ? (
                  <Link
                    href="/profile"
                    className="text-gray-700 hover:text-blue-600 flex items-center"
                    title="Go to your account"
                  >
                    {desktopAvatar}
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-blue-600"
                    title="Login / Register"
                  >
                    {desktopAvatar}
                  </Link>
                )}
              </div>

              {/* Mobile/Tablet menu button */}
              <div className="lg:hidden">
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

            {/* Mobile/Tablet nav */}
            <MobileNav
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
              navigation={navigation}
              pathname={pathname}
              languageMap={languageMap}
              selectedLanguage={selectedLanguage}
              setShowPreferencesModal={setShowPreferencesModal}
              isLoggedIn={isLoggedIn}
              userName={userName}
              userSurname={userSurname}
            />
          </nav>
        </div>
      </header>

      {/* Location modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex justify-start">
          <div
            ref={locationModalRef}
            className="
              bg-white
              w-full
              sm:w-[400px]
              h-full
              p-6
              flex
              flex-col
              relative
              overflow-auto
            "
          >
            {/* Close (X) */}
            <button
              onClick={() => setShowLocationModal(false)}
              className="
                absolute
                top-3
                right-3
                text-gray-500
                hover:text-red-500
                p-1
                transition-colors
              "
              aria-label="Close location modal"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold sm:font-semibold mb-4 text-gray-800">
              Set Your Location
            </h2>

            {/* City */}
            <label
              htmlFor="city-input"
              className="block text-left text-sm font-semibold sm:font-medium text-gray-600 mb-1"
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
              className="w-full p-3 mb-4 border border-gray-300 rounded-lg text-base"
            />

            {/* ZIP */}
            <label
              htmlFor="zip-input"
              className="block text-left text-sm font-semibold sm:font-medium text-gray-600 mb-1"
            >
              ZIP Code
            </label>
            <input
              id="zip-input"
              name="zip"
              type="text"
              placeholder="Enter your ZIP code"
              value={manualLocation.zip}
              onChange={(e) => {
                const value = e.target.value;
                setManualLocation({ ...manualLocation, zip: value });
                // Trigger lookup immediately upon typing exactly 5 digits (all numeric)
                if (value.trim().length === 5 && /^[0-9]{5}$/.test(value.trim())) {
                  handleZipLookup(value);
                }
              }}
              className="w-full p-3 mb-4 border border-gray-300 rounded-lg text-base"
            />

            {/* State */}
            <label
              htmlFor="state-input"
              className="block text-left text-sm font-semibold sm:font-medium text-gray-600 mb-1"
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
              className="w-full p-3 mb-4 border border-gray-300 rounded-lg text-base"
            />

            <div className="flex flex-wrap justify-between gap-4 mt-6">
              <button
                className="flex-1 p-3 font-semibold sm:font-medium border rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 border-gray-300"
                onClick={handleAutoFill}
              >
                Auto
              </button>
              <button
                className="flex-1 p-3 font-semibold sm:font-medium border rounded-lg bg-green-100 text-green-700 border-green-300 hover:bg-green-200"
                onClick={() => handleZipLookup()}
              >
                ZIP
              </button>
              <button
                className="flex-1 p-3 font-semibold sm:font-medium border rounded-lg bg-red-100 text-red-700 border-red-300 hover:bg-red-200"
                onClick={handleClearLocation}
              >
                Clear
              </button>
              <button
                className="flex-1 p-3 font-semibold sm:font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 border-none"
                onClick={handleManualLocationSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preferences modal */}
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