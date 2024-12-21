"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { NavigationItem } from "@/types/common";
import { useLocation } from "@/context/LocationContext";

// Navigation items
const navigation: NavigationItem[] = [
  { name: "Services", href: "/calculate" },
  { name: "Rooms", href: "/rooms" },
  { name: "Packages", href: "/packages" },
  { name: "About", href: "/about" },
];

// Utility function to truncate text for UI clarity
function truncateText(text: string, maxLength: number) {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

export default function Header() {
  // State for mobile menu visibility
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Accessing the location context (no automatic fetch triggered here)
  const { location, setLocation } = useLocation();

  // State for modal (for setting location manually)
  const [showModal, setShowModal] = useState(false);

  // Local state for manual location inputs (city and ZIP)
  const [manualLocation, setManualLocation] = useState({ city: "", zip: "" });

  // Reference to the modal element for outside-click detection
  const modalRef = useRef<HTMLDivElement>(null);

  // Get the current pathname to determine the active page
  const pathname = usePathname();

  // Handler: Save the manually entered location to context
  const handleManualLocationSave = () => {
    setLocation({
      city: manualLocation.city || "Enter City",
      zip: manualLocation.zip.trim() || "and ZIP",
    });
    setShowModal(false);
  };

  // Handler: Auto-fill location
  const handleAutoFill = async () => {
    try {
      const response = await fetch("https://ipapi.co/json/");
      if (!response.ok) {
        throw new Error("Failed to fetch location data");
      }
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

  // Handler: Clear manual location inputs
  const handleClear = () => {
    setManualLocation({ city: "", zip: "" });
  };

  // Outside-click handler to close modal
  const handleOutsideClick = (e: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setShowModal(false);
    }
  };

  // Attach/detach outside-click listener
  useEffect(() => {
    if (showModal) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showModal]);

  // Determine if user is in the /emergency section
  const isEmergencyActive = pathname.startsWith("/emergency");

  return (
    <>
      <header className="fixed w-full z-50 bg-gray-100/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="bg-white rounded-2xl shadow-sm">
            <div className="flex justify-between items-center h-16 px-6">
              {/* Logo */}
              <Link href="/" prefetch={false} className="flex-shrink-0">
                <img src="/images/logo.png" alt="Jamb" className="h-8 w-auto" />
              </Link>

              {/* Location display section */}
              <div
                className="flex flex-col items-start w-[200px] overflow-hidden text-ellipsis whitespace-normal"
                title="Click to change location"
              >
                <span className="text-sm font-medium text-gray-500">
                  Are you here?
                </span>
                <strong
                  onClick={() => setShowModal(true)}
                  className="text-[1.15rem] font-medium text-black cursor-pointer transition-colors duration-200 hover:text-[#1948f0]"
                >
                  {truncateText(location.city, 10)}, {truncateText(location.zip, 10)}
                </strong>
              </div>

              {/* Desktop Navigation */}
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

              {/* Right Section */}
              <div className="hidden md:flex items-center gap-4">
                {/* Emergency Link with a constant border-2 and toggling color */}
                <Link
                  href="/emergency"
                  prefetch={false}
                  className={`flex items-center gap-2 text-red-600 font-medium px-4 py-2 rounded-lg transition-colors duration-200 bg-red-100/50 hover:bg-red-200
                    border-2 ${
                      isEmergencyActive ? "border-red-600" : "border-transparent"
                    }
                  `}
                >
                  <span>🚨</span> Emergency
                </Link>

                <div className="relative">
                  <button className="flex items-center gap-2 text-gray-700 bg-[rgba(0,0,0,0.03)] px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-[rgba(0,0,0,0.08)]">
                    <span>EN</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
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

            {/* Mobile Navigation */}
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

                  {/* Mobile version of the Emergency link with border-2 */}
                  <Link
                    href="/emergency"
                    prefetch={false}
                    className={`flex items-center gap-2 text-red-600 font-medium
                      border-2 ${
                        isEmergencyActive ? "border-red-600" : "border-transparent"
                      }
                    `}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>🚨</span> Emergency
                  </Link>

                  <button
                    className="flex items-center gap-2 text-gray-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>EN</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Modal for Setting Location */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[9999]">
          <div
            ref={modalRef}
            className="bg-white p-8 rounded-xl shadow-lg max-w-[400px] w-[90%] text-center"
          >
            <h2 className="text-xl font-semibold mb-4">Set Your Location</h2>

            {/* Label for city */}
            <label htmlFor="city-input" className="sr-only">
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

            {/* Label for ZIP */}
            <label htmlFor="zip-input" className="sr-only">
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

            {/* Buttons for auto fill, clear, and save */}
            <div className="flex justify-between gap-4 mt-4">
              <button
                className="flex-1 p-3 font-medium border rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 border-gray-300"
                onClick={handleAutoFill}
              >
                Auto
              </button>
              <button
                className="flex-1 p-3 font-medium border rounded-lg bg-red-100 text-red-700 border-red-300 hover:bg-red-200"
                onClick={handleClear}
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
    </>
  );
}