"use client";

// This page is dynamically imported by Next.js
export const dynamic = "force-dynamic";

import { useState, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import BreadCrumb from "@/components/ui/BreadCrumb";
import SearchServices from "@/components/SearchServices";
import Button from "@/components/ui/Button";
import { CALCULATE_STEPS } from "@/constants/navigation";
import { SectionBoxTitle } from "@/components/ui/SectionBoxTitle";
import { ChevronDown } from "lucide-react";
import { useLocation } from "@/context/LocationContext";
import { ALL_CATEGORIES } from "@/constants/categories";
import AddressSection from "@/components/ui/AddressSection";
import PhotosAndDescription from "@/components/ui/PhotosAndDescription";
import { setSessionItem, getSessionItem } from "@/utils/session";

export default function Services() {
  const router = useRouter();
  const { location } = useLocation();

  // Retrieve selected sections from session; if none, redirect to "/calculate"
  const selectedSections: string[] = getSessionItem(
    "services_selectedSections",
    []
  );

  // If there are no selected sections, redirect to "/calculate"
  useEffect(() => {
    if (selectedSections.length === 0) {
      router.push("/calculate");
    }
  }, [selectedSections, router]);

  // Form states
  const [searchQuery, setSearchQuery] = useState<string>(
    getSessionItem("services_searchQuery", "")
  );
  const [address, setAddress] = useState<string>(getSessionItem("address", ""));
  const [zip, setZip] = useState<string>(getSessionItem("zip", ""));
  const [stateName, setStateName] = useState<string>(
    getSessionItem("stateName", "")
  );
  const [description, setDescription] = useState<string>(
    getSessionItem("description", "")
  );
  const [photos, setPhotos] = useState<string[]>(getSessionItem("photos", []));
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Display warnings as alerts
  useEffect(() => {
    if (warningMessage) {
      alert(warningMessage);
      setWarningMessage(null);
    }
  }, [warningMessage]);

  // Build a map of categories by each section
  const categoriesBySection: Record<string, { id: string; title: string }[]> =
    {};
  ALL_CATEGORIES.forEach((cat) => {
    if (!categoriesBySection[cat.section]) {
      categoriesBySection[cat.section] = [];
    }
    categoriesBySection[cat.section].push({ id: cat.id, title: cat.title });
  });

  // Load or initialize selected categories for each section from session
  const storedSelectedCategories = getSessionItem("selectedCategoriesMap", null);
  const initialSelectedCategories: Record<string, string[]> =
    storedSelectedCategories ||
    (() => {
      const init: Record<string, string[]> = {};
      selectedSections.forEach((section) => {
        init[section] = [];
      });
      return init;
    })();

  const [selectedCategoriesMap, setSelectedCategoriesMap] = useState<
    Record<string, string[]>
  >(initialSelectedCategories);

  // Persist form states to session whenever they change
  useEffect(
    () => setSessionItem("services_searchQuery", searchQuery),
    [searchQuery]
  );
  useEffect(() => setSessionItem("address", address), [address]);
  useEffect(() => setSessionItem("zip", zip), [zip]);
  useEffect(() => setSessionItem("stateName", stateName), [stateName]);
  useEffect(() => setSessionItem("description", description), [description]);
  useEffect(() => setSessionItem("photos", photos), [photos]);
  useEffect(
    () => setSessionItem("selectedCategoriesMap", selectedCategoriesMap),
    [selectedCategoriesMap]
  );

  // Combine city, state, and ZIP into one string and store it
  useEffect(() => {
    const combined = [address, stateName, zip].filter(Boolean).join(", ");
    setSessionItem("fullAddress", combined);
  }, [address, stateName, zip]);

  // Attempt to auto-fill address fields from location context if empty
  useEffect(() => {
    if (
      !address &&
      !stateName &&
      !zip &&
      location?.city &&
      location?.zip &&
      location?.state
    ) {
      setAddress(location.city);
      setStateName(location.state);
      setZip(location.zip);
    }
  }, [location, address, stateName, zip]);

  // Filter categories by the search query
  const filteredCategoriesBySection = Object.fromEntries(
    selectedSections.map((section) => {
      const allCats = categoriesBySection[section] || [];
      const filtered = searchQuery
        ? allCats.filter((cat) =>
            cat.title.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : allCats;
      return [section, filtered];
    })
  ) as Record<string, { id: string; title: string }[]>;

  // State for which sections are expanded; for phones, we expand all by default
  // to satisfy the requirement that categories are expanded upon page load.
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(selectedSections)
  );

  // Toggle expand/collapse for a given section
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(section) ? next.delete(section) : next.add(section);
      return next;
    });
  };

  // Handle category selection within a section
  const handleCategorySelect = (section: string, catId: string) => {
    setSelectedCategoriesMap((prev) => {
      const current = prev[section] || [];
      const isSelected = current.includes(catId);
      if (!isSelected) setWarningMessage(null);
      return {
        ...prev,
        [section]: isSelected
          ? current.filter((id) => id !== catId)
          : [...current, catId],
      };
    });
  };

  // Clear all category selections
  const handleClearSelection = () => {
    const userConfirmed = window.confirm(
      "Are you sure you want to clear all selections? This will also collapse all sections."
    );
    if (!userConfirmed) return;

    const cleared: Record<string, string[]> = {};
    selectedSections.forEach((section) => {
      cleared[section] = [];
    });
    setSelectedCategoriesMap(cleared);
    setExpandedSections(new Set());
  };

  // Move to the next step, with validations
  const handleNext = () => {
    const totalChosen = Object.values(selectedCategoriesMap).flat().length;
    if (totalChosen === 0) {
      setWarningMessage("Please select at least one category before proceeding.");
      return;
    }
    if (!address.trim()) {
      setWarningMessage("Please enter your city name before proceeding.");
      return;
    }
    if (!stateName.trim()) {
      setWarningMessage("Please enter your state before proceeding.");
      return;
    }
    if (!zip.trim()) {
      setWarningMessage("Please enter your ZIP code before proceeding.");
      return;
    }

    const chosenCategoryIDs = Object.values(selectedCategoriesMap).flat();
    setSessionItem("services_selectedCategories", chosenCategoryIDs);
    router.push("/calculate/details");
  };

  // Handlers for address input changes
  const handleAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
  };
  const handleZipChange = (e: ChangeEvent<HTMLInputElement>) => {
    setZip(e.target.value);
  };
  const handleStateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setStateName(e.target.value);
  };

  // Attempt to use the location context if available
  const handleUseMyLocation = () => {
    if (location?.city && location?.zip && location?.state) {
      setAddress(location.city);
      setStateName(location.state);
      setZip(location.zip);
    } else {
      setWarningMessage("Location data is unavailable. Please enter manually.");
    }
  };

  // Remove photo by index (functionality used inside PhotosAndDescription)
  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto">
        <BreadCrumb items={CALCULATE_STEPS} />

        {/* Top section title and Next button (visible on md+ screens) */}
        <div className="mt-8">
          <div className="flex flex-col md:flex-row justify-between gap-2">
            <SectionBoxTitle className="flex-shrink-0">
              Select Your Categories
            </SectionBoxTitle>
            {/* Hide this Next button on small screens, show on md+ */}
            <div className="hidden md:flex flex-col items-end md:items-center md:flex-row md:justify-end">
              <Button onClick={handleNext} className="mt-2 md:mt-0">
                Next →
              </Button>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="flex flex-col gap-4 mt-2 sm:mt-8 w-full xl:w-[600px]">
          <SearchServices
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
            placeholder="Search within selected categories"
          />
          <div className="flex justify-between items-center text-sm text-gray-500 mt-2">
            <span>
              No service?{" "}
              <a
                href="#"
                className="text-blue-600 hover:underline focus:outline-none"
              >
                Contact support
              </a>
            </span>
            <button
              onClick={handleClearSelection}
              className="text-blue-600 hover:underline focus:outline-none"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Main content area: categories on the left, address + photos on the right */}
        <div className="container mx-auto flex flex-col xl:flex-row items-start mt-8 gap-6">
          {/* Left side: categories */}
          <div className="w-full xl:flex-1">
            <div className="flex flex-col gap-3">
              {selectedSections.map((section) => {
                const allCats = filteredCategoriesBySection[section] || [];
                const selectedCount = (selectedCategoriesMap[section] || [])
                  .length;

                return (
                  <div
                    key={section}
                    className={`p-4 border rounded-xl bg-white ${
                      selectedCount > 0 ? "border-blue-500" : "border-gray-300"
                    }`}
                  >
                    <button
                      onClick={() => toggleSection(section)}
                      className="flex justify-between items-center w-full"
                    >
                      <h3
                        className={`font-semibold sm:font-medium text-xl sm:text-2xl ${
                          selectedCount > 0 ? "text-blue-600" : "text-gray-800"
                        }`}
                      >
                        {section}
                        {selectedCount > 0 && (
                          <span className="text-sm text-gray-500 ml-2">
                            ({selectedCount} selected)
                          </span>
                        )}
                      </h3>
                      <ChevronDown
                        className={`h-5 w-5 transform transition-transform ${
                          expandedSections.has(section) ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {expandedSections.has(section) && (
                      <div className="mt-4 flex flex-col gap-3">
                        {allCats.length === 0 ? (
                          <p className="text-sm text-gray-500">
                            No categories match your search.
                          </p>
                        ) : (
                          allCats.map((cat) => {
                            const isSelected =
                              selectedCategoriesMap[section]?.includes(
                                cat.id
                              ) || false;
                            return (
                              <div
                                key={cat.id}
                                className="flex justify-between items-center"
                              >
                                <span
                                  className={`text-lg font-medium ${
                                    isSelected
                                      ? "text-blue-600"
                                      : "text-gray-800"
                                  }`}
                                >
                                  {cat.title}
                                </span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() =>
                                      handleCategorySelect(section, cat.id)
                                    }
                                    className="sr-only peer"
                                  />
                                  <div className="w-[52px] h-[31px] bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors duration-300"></div>
                                  <div className="absolute top-[2px] left-[2px] w-[27px] h-[27px] bg-white rounded-full shadow-md transform transition-transform duration-300 peer-checked:translate-x-[21px]"></div>
                                </label>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right side: Address (desktop only) + Photos and Description */}
          <div className="w-full md:w-full xl:w-1/2">
            {/* AddressSection is hidden on phones and tablets, only shown on xl+ */}
            <div className="hidden xl:block">
              <AddressSection
                address={address}
                onAddressChange={handleAddressChange}
                zip={zip}
                onZipChange={handleZipChange}
                stateName={stateName}
                onStateChange={handleStateChange}
                onUseMyLocation={handleUseMyLocation}
              />
            </div>

            <PhotosAndDescription
              photos={photos}
              description={description}
              onSetPhotos={setPhotos}
              onSetDescription={setDescription}
            />
          </div>
        </div>
      </div>

      {/* Next button for mobile: pinned at the bottom, full width, hidden on md+ */}
      <div className="block sm:hidden mt-6">
        <Button onClick={handleNext} className="w-full justify-center">
          Next →
        </Button>
      </div>
    </main>
  );
}