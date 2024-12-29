"use client";

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

// Reusable components
import AddressSection from "@/components/ui/AddressSection";
import PhotosAndDescription from "@/components/ui/PhotosAndDescription";

// Session storage helpers
const saveToSession = (key: string, value: any) => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(key, JSON.stringify(value));
  }
};

const loadFromSession = (key: string, defaultValue: any) => {
  if (typeof window === "undefined") return defaultValue;
  const savedValue = sessionStorage.getItem(key);
  try {
    return savedValue ? JSON.parse(savedValue) : defaultValue;
  } catch (error) {
    console.error(`Error parsing sessionStorage for key "${key}"`, error);
    return defaultValue;
  }
};

export default function Services() {
  const router = useRouter();
  const { location } = useLocation();

  // 1) Load previously chosen "sections"
  const selectedSections: string[] = loadFromSession("services_selectedSections", []);
  useEffect(() => {
    if (selectedSections.length === 0) {
      router.push("/calculate");
    }
  }, [selectedSections, router]);

  // 2) States from session
  const [searchQuery, setSearchQuery] = useState<string>(
    loadFromSession("services_searchQuery", "")
  );
  const [address, setAddress] = useState<string>(loadFromSession("address", ""));
  const [description, setDescription] = useState<string>(
    loadFromSession("description", "")
  );
  const [photos, setPhotos] = useState<string[]>(loadFromSession("photos", []));
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // 3) Build map: section -> categories
  const categoriesBySection: Record<string, { id: string; title: string }[]> = {};
  ALL_CATEGORIES.forEach((cat) => {
    if (!categoriesBySection[cat.section]) {
      categoriesBySection[cat.section] = [];
    }
    categoriesBySection[cat.section].push({ id: cat.id, title: cat.title });
  });

  // 4) Setup selected categories
  const storedSelectedCategories = loadFromSession("selectedCategoriesMap", null);
  const initialSelectedCategories: Record<string, string[]> =
    storedSelectedCategories ||
    (() => {
      const init: Record<string, string[]> = {};
      selectedSections.forEach((section) => {
        init[section] = [];
      });
      return init;
    })();

  const [selectedCategories, setSelectedCategories] = useState<
    Record<string, string[]>
  >(initialSelectedCategories);

  // 5) Persist changes
  useEffect(() => saveToSession("services_searchQuery", searchQuery), [searchQuery]);
  useEffect(() => saveToSession("address", address), [address]);
  useEffect(() => saveToSession("description", description), [description]);
  useEffect(() => saveToSession("photos", photos), [photos]);
  useEffect(
    () => saveToSession("selectedCategoriesMap", selectedCategories),
    [selectedCategories]
  );

  // 6) Filter categories
  const filteredCategoriesBySection = Object.fromEntries(
    selectedSections.map((section) => {
      const allCats = categoriesBySection[section] || [];
      const filtered = searchQuery
        ? allCats.filter((c) =>
            c.title.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : allCats;
      return [section, filtered];
    })
  ) as Record<string, { id: string; title: string }[]>;

  // 7) Track expansions
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const toggleCategory = (section: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  // 8) Toggle a category
  const handleCategorySelect = (section: string, catId: string) => {
    setSelectedCategories((prev) => {
      const currentCatIds = prev[section] || [];
      const isSelected = currentCatIds.includes(catId);
      if (!isSelected) setWarningMessage(null);

      return {
        ...prev,
        [section]: isSelected
          ? currentCatIds.filter((id) => id !== catId)
          : [...currentCatIds, catId],
      };
    });
  };

  // 9) Clear all
  const handleClearSelection = () => {
    const userConfirmed = window.confirm(
      "Are you sure you want to clear all selections? This will also collapse all categories."
    );
    if (!userConfirmed) return;

    const cleared: Record<string, string[]> = {};
    selectedSections.forEach((section) => {
      cleared[section] = [];
    });
    setSelectedCategories(cleared);
    setExpandedCategories(new Set());
  };

  // 10) Next
  const handleNext = () => {
    const totalChosen = Object.values(selectedCategories).flat().length;
    if (totalChosen === 0) {
      setWarningMessage("Please select at least one category before proceeding.");
      return;
    }
    if (!address.trim()) {
      setWarningMessage("Please enter your address before proceeding.");
      return;
    }

    const chosenCategoryIDs = Object.values(selectedCategories).flat();
    saveToSession("services_selectedCategories", chosenCategoryIDs);

    router.push("/calculate/details");
  };

  // 11) Address
  const handleAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
  };
  const handleUseMyLocation = () => {
    if (location?.city && location?.zip) {
      setAddress(`${location.city}, ${location.zip}, ${location.country || ""}`);
    } else {
      setWarningMessage("Location data is unavailable. Please enter manually.");
    }
  };

  // 12) Photo removal
  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto">
        <BreadCrumb items={CALCULATE_STEPS} />

        <div className="flex justify-between items-start mt-8">
          <SectionBoxTitle>Select Your Categories</SectionBoxTitle>
          <Button onClick={handleNext}>Next →</Button>
        </div>

        {/* Search bar */}
        <div className="flex flex-col gap-4 mt-8 w-full max-w-[600px]">
          <SearchServices
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            placeholder="Search within selected sections..."
          />
          <div className="flex justify-between items-center text-sm text-gray-500 mt-2">
            <span>
              No service?{" "}
              <a href="#" className="text-blue-600 hover:underline focus:outline-none">
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

        {/* Warning */}
        <div className="h-6 mt-4 text-left">
          {warningMessage && <p className="text-red-500">{warningMessage}</p>}
        </div>

        <div className="flex container mx-auto relative">
          {/* Left side: sections & categories */}
          <div className="flex-1">
            <div className="flex flex-col gap-3 mt-5 w-full max-w-[600px]">
              {selectedSections.map((section) => {
                const allCats = filteredCategoriesBySection[section] || [];
                const selectedCount = (selectedCategories[section] || []).length;

                return (
                  <div
                    key={section}
                    className={`p-4 border rounded-xl bg-white ${
                      selectedCount > 0 ? "border-blue-500" : "border-gray-300"
                    }`}
                  >
                    <button
                      onClick={() => toggleCategory(section)}
                      className="flex justify-between items-center w-full"
                    >
                      <h3
                        className={`font-medium text-2xl ${
                          selectedCount > 0 ? "text-blue-600" : "text-black"
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
                          expandedCategories.has(section) ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {expandedCategories.has(section) && (
                      <div className="mt-4 flex flex-col gap-3">
                        {allCats.length === 0 ? (
                          <p className="text-sm text-gray-500">
                            No categories match your search.
                          </p>
                        ) : (
                          allCats.map((cat) => {
                            const isSelected =
                              selectedCategories[section]?.includes(cat.id) ||
                              false;
                            return (
                              <div key={cat.id} className="flex justify-between items-center">
                                <span
                                  className={`text-lg transition-colors duration-300 ${
                                    isSelected ? "text-blue-600" : "text-gray-800"
                                  }`}
                                >
                                  {cat.title}
                                </span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleCategorySelect(section, cat.id)}
                                    className="sr-only peer"
                                  />
                                  <div className="w-[50px] h-[26px] bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors duration-300"></div>
                                  <div className="absolute top-[2px] left-[2px] w-[22px] h-[22px] bg-white rounded-full shadow-md peer-checked:translate-x-[24px] transform transition-transform duration-300"></div>
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

          {/* Right side */}
          <div className="w-1/2 ml-auto mt-4 pt-0">
            {/* Address */}
            <AddressSection
              address={address}
              onAddressChange={handleAddressChange}
              onUseMyLocation={handleUseMyLocation}
            />

            {/* Reusable PhotosAndDescription component */}
            <PhotosAndDescription
              photos={photos}
              description={description}
              onSetPhotos={setPhotos}
              onSetDescription={setDescription}
            />
          </div>
        </div>
      </div>
    </main>
  );
}