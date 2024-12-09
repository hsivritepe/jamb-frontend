"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import Image from "next/image";
import { NavigationItem } from "@/types/common";
import { useLocation } from "@/context/LocationContext";

// Navigation items (no automatic fetching here, just static navigation links)
const navigation: NavigationItem[] = [
  { name: "Services", href: "/services" },
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

  /**
   * Handles saving the manually entered location:
   * - Updates the global location context with the entered city and ZIP.
   * - Closes the modal afterwards.
   */
  const handleManualLocationSave = () => {
    setLocation({
      city: manualLocation.city || "Enter City",
      zip: manualLocation.zip.trim() || "and ZIP",
    });
    setShowModal(false);
  };

  /**
   * Handles fetching the location automatically when the "Auto" button is clicked:
   * - Fetches user's location from the API.
   * - Updates local manualLocation and global location context with fetched data.
   * - NOTE: This is triggered only by user action (button click), not on navigation.
   */
  const handleAutoFill = async () => {
    try {
      const response = await fetch("https://ipapi.co/json/");
      if (!response.ok) {
        throw new Error("Failed to fetch location data");
      }
      const data = await response.json();
      const fullZip = data.postal || "0000000";

      // Update local state and global context only once, on user request
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

  /**
   * Clears the manual location inputs in the modal.
   */
  const handleClear = () => {
    setManualLocation({ city: "", zip: "" });
  };

  /**
   * Closes the modal if the user clicks outside of it.
   */
  const handleOutsideClick = (e: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setShowModal(false);
    }
  };

  /**
   * Adds or removes the outside click listener depending on whether the modal is shown.
   * This ensures that clicking outside the modal closes it, but no unnecessary listeners remain active.
   */
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

  // NOTE: We do not automatically fetch location data on navigation.
  // The handleAutoFill function is only called when the user explicitly clicks the "Auto" button in the modal.
  // Hence, no automatic API calls are made just by page navigation or link clicks.

  return (
    <>
      <header className="fixed w-full z-50 bg-gray-100/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="bg-white rounded-2xl shadow-sm">
            <div className="flex justify-between items-center h-16 px-6">
              {/* Logo - Static link, no automatic fetch */}
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

              {/* Desktop Navigation - no automatic fetch here */}
              <div className="hidden md:flex items-center gap-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-gray-700 hover:text-blue-600 font-medium"
                    prefetch={false} 
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Right Section */}
              <div className="hidden md:flex items-center gap-4">
                <Link
                  href="/emergency"
                  prefetch={false}
                  className="flex items-center gap-2 text-red-600 font-medium bg-red-100/50 px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-red-200"
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

            {/* Mobile Navigation (no automatic fetch) */}
            {isMobileMenuOpen && (
              <div className="md:hidden py-4 px-6 border-t">
                <div className="flex flex-col gap-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-gray-700 hover:text-blue-600 font-medium"
                      prefetch={false}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}

                  <Link
                    href="/emergency"
                    prefetch={false}
                    className="flex items-center gap-2 text-red-600 font-medium"
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
        // Modal placed outside the header to avoid clipping or partial visibility
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[9999]">
          <div
            ref={modalRef}
            className="bg-white p-8 rounded-xl shadow-lg max-w-[400px] w-[90%] text-center"
          >
            <h2 className="text-xl font-semibold mb-4">Set Your Location</h2>
            {/* City Input */}
            <input
              id="city-autocomplete"
              type="text"
              placeholder="Enter your city"
              value={manualLocation.city}
              onChange={(e) =>
                setManualLocation({ ...manualLocation, city: e.target.value })
              }
              className="w-full max-w-[360px] p-3 mb-4 border border-gray-300 rounded-lg text-base"
            />
            {/* ZIP Code Input */}
            <input
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