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
import { usePhotos } from "@/context/PhotosContext"; // <-- Import our photos context

/**
 * This component handles the "Services" page,
 * where the user selects categories and can optionally upload photos and add a description.
 */
export default function Services() {
  const router = useRouter();
  const { location } = useLocation();

  /**
   * We retrieve 'services_selectedSections' from session.
   * If no sections are selected, we redirect to "/calculate".
   */
  const selectedSections: string[] = getSessionItem(
    "services_selectedSections",
    []
  );

  useEffect(() => {
    if (selectedSections.length === 0) {
      router.push("/calculate");
    }
  }, [selectedSections, router]);

  /**
   * State for our various form fields, still stored in session except for photos.
   * Search query, address, zip, stateName, and description remain in local state + session.
   */
  const [searchQuery, setSearchQuery] = useState(
    getSessionItem("services_searchQuery", "")
  );
  const [address, setAddress] = useState(getSessionItem("address", ""));
  const [zip, setZip] = useState(getSessionItem("zip", ""));
  const [stateName, setStateName] = useState(getSessionItem("stateName", ""));
  const [description, setDescription] = useState(
    getSessionItem("description", "")
  );

  /**
   * For photos, we now use our PhotosContext instead of storing them in session.
   * This prevents potential quota errors and keeps the code cleaner.
   */
  const { photos, setPhotos } = usePhotos();

  /**
   * We also maintain a warningMessage in local state
   * to display any validation or warning alerts.
   */
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  useEffect(() => {
    if (warningMessage) {
      alert(warningMessage);
      setWarningMessage(null);
    }
  }, [warningMessage]);

  /**
   * Build a map of categories (id + title) keyed by section.
   */
  const categoriesBySection: Record<string, { id: string; title: string }[]> = {};
  ALL_CATEGORIES.forEach((cat) => {
    if (!categoriesBySection[cat.section]) {
      categoriesBySection[cat.section] = [];
    }
    categoriesBySection[cat.section].push({ id: cat.id, title: cat.title });
  });

  /**
   * Load or initialize the selected categories from session.
   * If there's no storedSelectedCategories, each section starts with an empty array.
   */
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

  /**
   * Persist the various states to session whenever they change.
   * We keep these except for 'photos'.
   */
  useEffect(() => {
    setSessionItem("services_searchQuery", searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    setSessionItem("address", address);
  }, [address]);

  useEffect(() => {
    setSessionItem("zip", zip);
  }, [zip]);

  useEffect(() => {
    setSessionItem("stateName", stateName);
  }, [stateName]);

  useEffect(() => {
    setSessionItem("description", description);
  }, [description]);

  // We intentionally remove any "setSessionItem('photos', photos)" calls here.

  useEffect(() => {
    setSessionItem("selectedCategoriesMap", selectedCategoriesMap);
  }, [selectedCategoriesMap]);

  /**
   * Whenever address, stateName, or zip change, combine them and store in session as 'fullAddress'.
   */
  useEffect(() => {
    const combined = [address, stateName, zip].filter(Boolean).join(", ");
    setSessionItem("fullAddress", combined);
  }, [address, stateName, zip]);

  /**
   * Try to auto-fill the address/zip/state from the location context if they're empty.
   */
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

  /**
   * Filter categories in each section by the current search query.
   */
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

  /**
   * State that controls which sections are expanded/collapsed.
   * We default to all selected sections expanded on mobile per requirements.
   */
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(selectedSections)
  );

  /**
   * Toggles the expanded/collapsed state for a given section.
   */
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(section) ? next.delete(section) : next.add(section);
      return next;
    });
  };

  /**
   * Handler for (un)checking a category checkbox under a given section.
   * Also clears any previous "no selection" warnings if a new category is being selected.
   */
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

  /**
   * Clears all selected categories, also collapses all sections.
   */
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

  /**
   * Handler for the "Next" button. Validates that at least one category is selected
   * and that address/state/zip are all filled out.
   */
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

    // Save selected categories IDs in session, then move on
    const chosenCategoryIDs = Object.values(selectedCategoriesMap).flat();
    setSessionItem("services_selectedCategories", chosenCategoryIDs);

    router.push("/calculate/details");
  };

  /**
   * Simple input change handlers for city, state, and zip.
   */
  const handleAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
  };
  const handleZipChange = (e: ChangeEvent<HTMLInputElement>) => {
    setZip(e.target.value);
  };
  const handleStateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setStateName(e.target.value);
  };

  /**
   * If location context is available, use it to fill in the fields directly.
   * Otherwise, show a warning.
   */
  const handleUseMyLocation = () => {
    if (location?.city && location?.zip && location?.state) {
      setAddress(location.city);
      setStateName(location.state);
      setZip(location.zip);
    } else {
      setWarningMessage("Location data is unavailable. Please enter manually.");
    }
  };

  /**
   * Handler for removing a photo by index. This is passed down to PhotosAndDescription,
   * but we define it here for clarity.
   */
  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto">
        <BreadCrumb items={CALCULATE_STEPS} />

        {/* Top section title + Next button (desktop view) */}
        <div className="mt-8">
          <div className="flex flex-col md:flex-row justify-between gap-2">
            <SectionBoxTitle className="flex-shrink-0">
              Select Your Categories
            </SectionBoxTitle>
            {/* Next button hidden on mobile, shown on md+ */}
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
          {/* LEFT: categories list */}
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
                              selectedCategoriesMap[section]?.includes(cat.id) ||
                              false;
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

          {/* RIGHT: Address (desktop only) + Photos/Description */}
          <div className="w-full md:w-full xl:w-1/2">
            {/* AddressSection is hidden on phones/tablets, shown on xl+ */}
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

            {/*
              For photos and description, we pass in the PhotosContext values:
              - photos
              - setPhotos
              We also pass description state and setDescription as before.
            */}
            <PhotosAndDescription
              photos={photos}
              description={description}
              onSetPhotos={setPhotos}
              onSetDescription={setDescription}
            />
          </div>
        </div>
      </div>

      {/* Next button for mobile only, pinned at bottom, hidden on md+ */}
      <div className="block sm:hidden mt-6">
        <Button onClick={handleNext} className="w-full justify-center">
          Next →
        </Button>
      </div>
    </main>
  );
}