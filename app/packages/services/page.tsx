"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect, ChangeEvent } from "react";
import BreadCrumb from "@/components/ui/BreadCrumb";
import SearchServices from "@/components/SearchServices";
import Button from "@/components/ui/Button";
import { SectionBoxTitle } from "@/components/ui/SectionBoxTitle";
import { SectionBoxSubtitle } from "@/components/ui/SectionBoxSubtitle";

import { PACKAGES_STEPS } from "@/constants/navigation";
import { PACKAGES } from "@/constants/packages";
import { ALL_SERVICES } from "@/constants/services";
import { ALL_CATEGORIES } from "@/constants/categories";
import {
  INDOOR_SERVICE_SECTIONS,
  OUTDOOR_SERVICE_SECTIONS,
} from "@/constants/categories";

import { ChevronDown } from "lucide-react";

/** Save data to sessionStorage as JSON */
function saveToSession(key: string, value: any) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(key, JSON.stringify(value));
  }
}

/** Load data from sessionStorage or return defaultValue if SSR/not found. */
function loadFromSession<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  const stored = sessionStorage.getItem(key);
  try {
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/** Formats a numeric value with 2 decimals and comma separators. */
function formatWithSeparator(num: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/** Safely parse user input to a positive number. Returns 1 if invalid. */
function parsePositiveNumber(value: string): number {
  const parsed = parseFloat(value);
  if (isNaN(parsed) || parsed <= 0) return 1;
  return parsed;
}

/** Convert a houseType code into a more human-readable label. */
function formatHouseType(ht: string): string {
  switch (ht) {
    case "single_family":
      return "Single Family";
    case "townhouse":
      return "Townhouse";
    case "apartment":
      return "Apartment / Condo";
    default:
      return ht || "N/A";
  }
}

/** Check if the section is an indoor one. */
function isIndoorSection(sectionValue: string): boolean {
  return (Object.values(INDOOR_SERVICE_SECTIONS) as string[]).includes(sectionValue);
}

/** Check if the section is an outdoor one. */
function isOutdoorSection(sectionValue: string): boolean {
  return (Object.values(OUTDOOR_SERVICE_SECTIONS) as string[]).includes(sectionValue);
}

/** Return a shorter label for each package ID (for the toggler). */
function getShortTitle(pkgId: string): string {
  switch (pkgId) {
    case "basic_package":
      return "Basic";
    case "enhanced_package":
      return "Enhanced";
    case "all_inclusive_package":
      return "All-Inclusive";
    case "configure_your_own_package":
      return "Custom";
    default:
      return "Other";
  }
}

export default function PackageServicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1) Determine the packageId from the query. If invalid, show a loading or handle error
  const packageId = searchParams.get("packageId");
  const chosenPackage = PACKAGES.find((pkg) => pkg.id === packageId) || null;
  if (!packageId || !chosenPackage) {
    return <p>Loading package...</p>;
  }
  const safePackage = chosenPackage;

  // Store the current packageId in session so that the next page (Estimate) knows about it
  useEffect(() => {
    saveToSession("packages_currentPackageId", packageId);
  }, [packageId]);

  // 2) Load existing selected services from session, or create default
  const [selectedServices, setSelectedServices] = useState<{
    indoor: Record<string, number>;
    outdoor: Record<string, number>;
  }>(() =>
    loadFromSession("packages_selectedServices", {
      indoor: {},
      outdoor: {},
    })
  );

  // 3) Also load houseInfo to display on the summary side, if needed
  const [houseInfo] = useState(() =>
    loadFromSession("packages_houseInfo", {
      country: "",
      city: "",
      zip: "",
      addressLine: "",
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
    })
  );

  // 4) Manage a search filter to quickly find services by name or description
  const [searchQuery, setSearchQuery] = useState<string>(() =>
    loadFromSession("packages_searchQuery", "")
  );
  // Keep search query in session so user doesn't lose it on refresh
  useEffect(() => {
    saveToSession("packages_searchQuery", searchQuery);
  }, [searchQuery]);

  // 5) Whenever selectedServices changes, save it to session
  useEffect(() => {
    saveToSession("packages_selectedServices", selectedServices);
  }, [selectedServices]);

  // 6) For quantity inputs that user might type into manually
  const [manualInputValue, setManualInputValue] = useState<Record<string, string>>({});

  // 7) Track which categories are expanded
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Combine all services from the chosen package (indoor + outdoor) into a single array for filtering
  const combinedServices: (typeof ALL_SERVICES)[number][] = [];

  // Helper function to process indoor or outdoor from the chosen package
  function processSide(isIndoor: boolean) {
    const sideKey = isIndoor ? "indoor" : "outdoor";
    safePackage.services[sideKey].forEach((pkgItem) => {
      const svcObj = ALL_SERVICES.find((s) => s.id === pkgItem.id);
      if (!svcObj) return;

      // If there's a search query, match against title or description
      if (searchQuery) {
        const lower = searchQuery.toLowerCase();
        const matchTitle = svcObj.title.toLowerCase().includes(lower);
        const matchDesc =
          svcObj.description && svcObj.description.toLowerCase().includes(lower);
        if (!matchTitle && !matchDesc) return;
      }
      combinedServices.push(svcObj);
    });
  }
  // Process indoor
  processSide(true);
  // Process outdoor
  processSide(false);

  // Build up sets of category IDs for "For Home" (indoor) or "For Garden" (outdoor)
  const homeSectionsMap: Record<string, Set<string>> = {};
  const gardenSectionsMap: Record<string, Set<string>> = {};

  for (const svc of combinedServices) {
    // The category ID might be something like "indoor-kitchen"
    const catId = svc.id.split("-").slice(0, 2).join("-");
    const catObj = ALL_CATEGORIES.find((c) => c.id === catId);
    if (!catObj) continue;

    const sectionName = catObj.section;
    if (isIndoorSection(sectionName)) {
      if (!homeSectionsMap[sectionName]) {
        homeSectionsMap[sectionName] = new Set();
      }
      homeSectionsMap[sectionName].add(catId);
    } else if (isOutdoorSection(sectionName)) {
      if (!gardenSectionsMap[sectionName]) {
        gardenSectionsMap[sectionName] = new Set();
      }
      gardenSectionsMap[sectionName].add(catId);
    }
  }

  // Create a map of catId => array of services
  const catServicesMap: Record<string, (typeof ALL_SERVICES)[number][]> = {};
  for (const svc of combinedServices) {
    const catId = svc.id.split("-").slice(0, 2).join("-");
    if (!catServicesMap[catId]) {
      catServicesMap[catId] = [];
    }
    catServicesMap[catId].push(svc);
  }

  // Expand/collapse a category
  function toggleCategory(catId: string) {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  }

  // Toggle whether a service is selected or not
  function toggleService(serviceId: string) {
    // Determine whether it's an indoor or outdoor service by searching the chosen package
    const isIndoor = !!safePackage.services.indoor.find((it) => it.id === serviceId);
    const sideKey = isIndoor ? "indoor" : "outdoor";

    const copy = { ...selectedServices[sideKey] };
    if (copy[serviceId]) {
      // If it was selected, unselect it
      delete copy[serviceId];
    } else {
      // If it wasn't, set a default quantity
      copy[serviceId] = 1;
    }
    setSelectedServices((prev) => ({ ...prev, [sideKey]: copy }));
  }

  // Handle increment/decrement of the quantity for a service
  function handleQuantityChange(serviceId: string, increment: boolean, unit: string) {
    const isIndoor = !!safePackage.services.indoor.find((it) => it.id === serviceId);
    const sideKey = isIndoor ? "indoor" : "outdoor";
    const copy = { ...selectedServices[sideKey] };

    const oldVal = copy[serviceId] || 1;
    // If incrementing, add 1. If decrementing, sub 1 but not below 1
    let newVal = increment ? oldVal + 1 : Math.max(1, oldVal - 1);

    // If the unit is "each", keep it an integer
    if (unit === "each") {
      newVal = Math.round(newVal);
    }

    // Update state
    copy[serviceId] = newVal;
    setSelectedServices((prev) => ({ ...prev, [sideKey]: copy }));
    setManualInputValue((prev) => ({ ...prev, [serviceId]: String(newVal) }));
  }

  // Handle the user manually typing a quantity in an input
  function handleManualQuantityChange(serviceId: string, value: string, unit: string) {
    setManualInputValue((prev) => ({ ...prev, [serviceId]: value }));
  }

  // On blur, parse the typed quantity and update the state
  function handleBlurInput(serviceId: string, unit: string) {
    const isIndoor = !!safePackage.services.indoor.find((it) => it.id === serviceId);
    const sideKey = isIndoor ? "indoor" : "outdoor";
    const copy = { ...selectedServices[sideKey] };

    const currentVal = manualInputValue[serviceId] ?? "";
    const parsed = parsePositiveNumber(currentVal);

    copy[serviceId] = unit === "each" ? Math.round(parsed) : parsed;

    setSelectedServices((prev) => ({ ...prev, [sideKey]: copy }));
    setManualInputValue((prev) => ({
      ...prev,
      [serviceId]: String(copy[serviceId]),
    }));
  }

  // Calculate the annual price from all selected services
  function calculateAnnualPrice(): number {
    let total = 0;
    for (const [svcId, qty] of Object.entries(selectedServices.indoor)) {
      const svcObj = ALL_SERVICES.find((s) => s.id === svcId);
      if (svcObj) total += svcObj.price * qty;
    }
    for (const [svcId, qty] of Object.entries(selectedServices.outdoor)) {
      const svcObj = ALL_SERVICES.find((s) => s.id === svcId);
      if (svcObj) total += svcObj.price * qty;
    }
    return total;
  }
  const annualPrice = calculateAnnualPrice();

  // Move on to the next page (estimate)
  function handleNext() {
    const hasAnySelected = Object.keys(mergedSelected).length > 0;
    if (!hasAnySelected) {
      alert("You haven't selected any services. Please choose at least one before continuing.");
      return; 
    }
    router.push("/packages/estimate");
  }

  // Clear all selections
  function handleClearAll() {
    const confirmed = window.confirm("Are you sure you want to clear all selections?");
    if (!confirmed) return;
    setSelectedServices({ indoor: {}, outdoor: {} });
    setExpandedCategories(new Set());
  }

  // Select all available services in this package
  function handleSelectAll() {
    const confirmed = window.confirm("Are you sure you want to select all services?");
    if (!confirmed) return;

    const nextIndoor: Record<string, number> = {};
    for (const it of safePackage.services.indoor) {
      nextIndoor[it.id] = 1;
    }
    const nextOutdoor: Record<string, number> = {};
    for (const it of safePackage.services.outdoor) {
      nextOutdoor[it.id] = 1;
    }
    setSelectedServices({ indoor: nextIndoor, outdoor: nextOutdoor });
  }

  // Toggle package from the top toggler
  function handlePackageToggle(pkgId: string) {
    // If user selects a different package, navigate there
    router.push(`/packages/services?packageId=${pkgId}`);
  }
  const packageIdsInOrder = [
    "basic_package",
    "enhanced_package",
    "all_inclusive_package",
    "configure_your_own_package",
  ];

  // Combine both indoor & outdoor into one object for summary
  const mergedSelected: Record<string, number> = {
    ...selectedServices.indoor,
    ...selectedServices.outdoor,
  };

  // We'll build a structure grouped by: section -> category -> [services]
  type ServiceItem = {
    svcObj: (typeof ALL_SERVICES)[number];
    qty: number;
  };
  const summaryStructure: Record<string, Record<string, ServiceItem[]>> = {};

  for (const [svcId, qty] of Object.entries(mergedSelected)) {
    const svcObj = ALL_SERVICES.find((s) => s.id === svcId);
    if (!svcObj) continue;

    const catId = svcObj.id.split("-").slice(0, 2).join("-");
    const catObj = ALL_CATEGORIES.find((c) => c.id === catId);
    if (!catObj) continue;

    const sectionName = catObj.section;
    if (!summaryStructure[sectionName]) {
      summaryStructure[sectionName] = {};
    }
    if (!summaryStructure[sectionName][catId]) {
      summaryStructure[sectionName][catId] = [];
    }
    summaryStructure[sectionName][catId].push({ svcObj, qty });
  }

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto">
        <BreadCrumb items={PACKAGES_STEPS} />
      </div>

      <div className="container mx-auto">
        {/* Top row: package toggler + Next button */}
        <div className="flex justify-between items-center mt-11">
          {/* Package toggler: Basic | Enhanced | All-inclusive | Custom */}
          <div className="inline-flex rounded-lg p-1 w-full max-w-[624px] h-14 border border-gray-200">
            {packageIdsInOrder.map((pkgId) => {
              const pkgObj = PACKAGES.find((p) => p.id === pkgId);
              if (!pkgObj) return null;
              const displayTitle = getShortTitle(pkgId);
              const isActive = pkgId === packageId;
              return (
                <button
                  key={pkgId}
                  onClick={() => handlePackageToggle(pkgId)}
                  className={`flex-1 px-4 py-2 rounded-md font-semibold transition-colors text-lg ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {displayTitle}
                </button>
              );
            })}
          </div>

          <Button onClick={handleNext} variant="primary">
            Next →
          </Button>
        </div>

        {/* Search bar */}
        <div className="w-full max-w-[624px] mt-6 mb-4">
          <SearchServices
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
            placeholder="Search for services..."
          />
        </div>

        {/* "Select all" and "Clear" buttons, plus a link for missing services */}
        <div className="flex justify-between items-center text-sm text-gray-500 mt-6 w-full max-w-[624px]">
          <span>
            No service?{" "}
            <a href="#" className="text-blue-600 hover:underline focus:outline-none">
              Contact support
            </a>
          </span>
          <div className="flex gap-4">
            <button
              onClick={handleSelectAll}
              className="text-green-600 hover:underline focus:outline-none"
            >
              Select all
            </button>
            <button
              onClick={handleClearAll}
              className="text-blue-600 hover:underline focus:outline-none"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Layout: left column (services) + right column (summary) */}
        <div className="container mx-auto relative flex mt-8">
          {/* LEFT COLUMN */}
          <div className="flex-1 space-y-12">
            {/* For Home (if any indoor sections exist) */}
            {Object.keys(homeSectionsMap).length > 0 && (
              <div>
                <div className="w-full max-w-[624px] mx-auto">
                  <div
                    className="relative overflow-hidden rounded-xl border border-gray-300 h-32 bg-center bg-cover"
                    style={{ backgroundImage: `url(/images/rooms/attic.jpg)` }}
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                    <div className="relative z-10 flex items-center justify-center h-full">
                      <SectionBoxTitle className="text-white">For Home</SectionBoxTitle>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-6">
                  {Object.keys(homeSectionsMap).map((sectionName) => {
                    const catIdsSet = homeSectionsMap[sectionName];
                    if (!catIdsSet || catIdsSet.size === 0) return null;
                    const catIdsArray = Array.from(catIdsSet);

                    return (
                      <div key={sectionName} className="mt-4">
                        <SectionBoxSubtitle>{sectionName}</SectionBoxSubtitle>

                        {catIdsArray.map((catId) => {
                          const servicesForCat = catServicesMap[catId] || [];
                          let selectedInCat = 0;
                          for (const svc of servicesForCat) {
                            if (
                              selectedServices.indoor[svc.id] ||
                              selectedServices.outdoor[svc.id]
                            ) {
                              selectedInCat++;
                            }
                          }

                          const catObj = ALL_CATEGORIES.find((c) => c.id === catId);
                          const catName = catObj ? catObj.title : catId;

                          return (
                            <div
                              key={catId}
                              className={`p-4 border rounded-xl bg-white mt-4 ${
                                selectedInCat > 0 ? "border-blue-500" : "border-gray-300"
                              }`}
                            >
                              {/* Category header (clickable to expand/collapse) */}
                              <button
                                onClick={() => toggleCategory(catId)}
                                className="flex justify-between items-center w-full"
                              >
                                <h3
                                  className={`font-medium text-2xl ${
                                    selectedInCat > 0 ? "text-blue-600" : "text-black"
                                  }`}
                                >
                                  {catName}
                                  {selectedInCat > 0 && (
                                    <span className="text-sm text-gray-500 ml-2">
                                      ({selectedInCat} selected)
                                    </span>
                                  )}
                                </h3>
                                <ChevronDown
                                  className={`h-5 w-5 transform transition-transform ${
                                    expandedCategories.has(catId) ? "rotate-180" : ""
                                  }`}
                                />
                              </button>

                              {/* Render the services if expanded */}
                              {expandedCategories.has(catId) && (
                                <div className="mt-4 flex flex-col gap-3">
                                  {servicesForCat.map((svc) => {
                                    const isIndoorSelected = !!selectedServices.indoor[svc.id];
                                    const isOutdoorSelected = !!selectedServices.outdoor[svc.id];
                                    const isSelected = isIndoorSelected || isOutdoorSelected;

                                    const quantity = isIndoorSelected
                                      ? selectedServices.indoor[svc.id]
                                      : isOutdoorSelected
                                      ? selectedServices.outdoor[svc.id]
                                      : 1;

                                    const inputValue =
                                      manualInputValue[svc.id] !== undefined
                                        ? manualInputValue[svc.id]
                                        : String(quantity);

                                    return (
                                      <div key={svc.id} className="space-y-2">
                                        {/* Service title + toggle */}
                                        <div className="flex justify-between items-center">
                                          <span
                                            className={`text-lg transition-colors duration-300 ${
                                              isSelected ? "text-blue-600" : "text-gray-800"
                                            }`}
                                          >
                                            {svc.title}
                                          </span>
                                          <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                              type="checkbox"
                                              checked={isSelected}
                                              onChange={() => toggleService(svc.id)}
                                              className="sr-only peer"
                                            />
                                            <div className="w-[50px] h-[26px] bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors duration-300"></div>
                                            <div className="absolute top-[2px] left-[2px] w-[22px] h-[22px] bg-white rounded-full shadow-md peer-checked:translate-x-[24px] transform transition-transform duration-300"></div>
                                          </label>
                                        </div>

                                        {/* If selected, show details: description, quantity, price */}
                                        {isSelected && (
                                          <>
                                            {svc.description && (
                                              <p className="text-sm text-gray-500 pr-16">
                                                {svc.description}
                                              </p>
                                            )}
                                            <div className="flex justify-between items-center">
                                              <div className="flex items-center gap-1">
                                                {/* Decrement button */}
                                                <button
                                                  onClick={() =>
                                                    handleQuantityChange(
                                                      svc.id,
                                                      false,
                                                      svc.unit_of_measurement
                                                    )
                                                  }
                                                  className="w-8 h-8 bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg rounded"
                                                >
                                                  −
                                                </button>
                                                {/* Text input for manual quantity */}
                                                <input
                                                  type="text"
                                                  value={inputValue}
                                                  onClick={() =>
                                                    setManualInputValue((prev) => ({
                                                      ...prev,
                                                      [svc.id]: "",
                                                    }))
                                                  }
                                                  onBlur={() =>
                                                    handleBlurInput(svc.id, svc.unit_of_measurement)
                                                  }
                                                  onChange={(e) =>
                                                    handleManualQuantityChange(
                                                      svc.id,
                                                      e.target.value,
                                                      svc.unit_of_measurement
                                                    )
                                                  }
                                                  className="w-20 text-center px-2 py-1 border rounded"
                                                  placeholder="1"
                                                />
                                                {/* Increment button */}
                                                <button
                                                  onClick={() =>
                                                    handleQuantityChange(
                                                      svc.id,
                                                      true,
                                                      svc.unit_of_measurement
                                                    )
                                                  }
                                                  className="w-8 h-8 bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg rounded"
                                                >
                                                  +
                                                </button>
                                                <span className="text-sm text-gray-600">
                                                  {svc.unit_of_measurement}
                                                </span>
                                              </div>
                                              <span className="text-lg text-blue-600 font-medium text-right">
                                                ${formatWithSeparator(svc.price * quantity)}
                                              </span>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* For Garden (if any outdoor sections exist) */}
            {Object.keys(gardenSectionsMap).length > 0 && (
              <div>
                <div className="w-full max-w-[624px] mx-auto">
                  <div
                    className="relative overflow-hidden rounded-xl border border-gray-300 h-32 bg-center bg-cover"
                    style={{ backgroundImage: `url(/images/rooms/landscape.jpg)` }}
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                    <div className="relative z-10 flex items-center justify-center h-full">
                      <SectionBoxTitle className="text-white">For Garden</SectionBoxTitle>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-6">
                  {Object.keys(gardenSectionsMap).map((sectionName) => {
                    const catIdsSet = gardenSectionsMap[sectionName];
                    if (!catIdsSet?.size) return null;

                    const catIdsArray = Array.from(catIdsSet);

                    return (
                      <div key={sectionName} className="mt-4">
                        <SectionBoxSubtitle>{sectionName}</SectionBoxSubtitle>

                        {catIdsArray.map((catId) => {
                          const servicesForCat = catServicesMap[catId] || [];
                          let selectedInCat = 0;
                          for (const svc of servicesForCat) {
                            if (
                              selectedServices.indoor[svc.id] ||
                              selectedServices.outdoor[svc.id]
                            ) {
                              selectedInCat++;
                            }
                          }

                          const catObj = ALL_CATEGORIES.find((c) => c.id === catId);
                          const catName = catObj ? catObj.title : catId;

                          return (
                            <div
                              key={catId}
                              className={`p-4 border rounded-xl bg-white mt-4 ${
                                selectedInCat > 0 ? "border-blue-500" : "border-gray-300"
                              }`}
                            >
                              {/* Category header (clickable to expand/collapse) */}
                              <button
                                onClick={() => toggleCategory(catId)}
                                className="flex justify-between items-center w-full"
                              >
                                <h3
                                  className={`font-medium text-2xl ${
                                    selectedInCat > 0 ? "text-blue-600" : "text-black"
                                  }`}
                                >
                                  {catName}
                                  {selectedInCat > 0 && (
                                    <span className="text-sm text-gray-500 ml-2">
                                      ({selectedInCat} selected)
                                    </span>
                                  )}
                                </h3>
                                <ChevronDown
                                  className={`h-5 w-5 transform transition-transform ${
                                    expandedCategories.has(catId) ? "rotate-180" : ""
                                  }`}
                                />
                              </button>

                              {/* Render services if expanded */}
                              {expandedCategories.has(catId) && (
                                <div className="mt-4 flex flex-col gap-3">
                                  {servicesForCat.map((svc) => {
                                    const inIndoor = selectedServices.indoor[svc.id];
                                    const inOutdoor = selectedServices.outdoor[svc.id];
                                    const isSelected = !!inIndoor || !!inOutdoor;

                                    const quantity = inIndoor
                                      ? inIndoor
                                      : inOutdoor
                                      ? inOutdoor
                                      : 1;

                                    const inputValue =
                                      manualInputValue[svc.id] !== undefined
                                        ? manualInputValue[svc.id]
                                        : String(quantity);

                                    return (
                                      <div key={svc.id} className="space-y-2">
                                        <div className="flex justify-between items-center">
                                          <span
                                            className={`text-lg transition-colors duration-300 ${
                                              isSelected
                                                ? "text-blue-600"
                                                : "text-gray-800"
                                            }`}
                                          >
                                            {svc.title}
                                          </span>
                                          <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                              type="checkbox"
                                              checked={isSelected}
                                              onChange={() => toggleService(svc.id)}
                                              className="sr-only peer"
                                            />
                                            <div className="w-[50px] h-[26px] bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors duration-300"></div>
                                            <div className="absolute top-[2px] left-[2px] w-[22px] h-[22px] bg-white rounded-full shadow-md peer-checked:translate-x-[24px] transform transition-transform duration-300"></div>
                                          </label>
                                        </div>

                                        {isSelected && (
                                          <>
                                            {svc.description && (
                                              <p className="text-sm text-gray-500 pr-16">
                                                {svc.description}
                                              </p>
                                            )}
                                            <div className="flex justify-between items-center">
                                              <div className="flex items-center gap-1">
                                                {/* Decrement */}
                                                <button
                                                  onClick={() =>
                                                    handleQuantityChange(
                                                      svc.id,
                                                      false,
                                                      svc.unit_of_measurement
                                                    )
                                                  }
                                                  className="w-8 h-8 bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg rounded"
                                                >
                                                  −
                                                </button>
                                                {/* Text input */}
                                                <input
                                                  type="text"
                                                  value={inputValue}
                                                  onClick={() =>
                                                    setManualInputValue((prev) => ({
                                                      ...prev,
                                                      [svc.id]: "",
                                                    }))
                                                  }
                                                  onBlur={() =>
                                                    handleBlurInput(svc.id, svc.unit_of_measurement)
                                                  }
                                                  onChange={(e) =>
                                                    handleManualQuantityChange(
                                                      svc.id,
                                                      e.target.value,
                                                      svc.unit_of_measurement
                                                    )
                                                  }
                                                  className="w-20 text-center px-2 py-1 border rounded"
                                                  placeholder="1"
                                                />
                                                {/* Increment */}
                                                <button
                                                  onClick={() =>
                                                    handleQuantityChange(
                                                      svc.id,
                                                      true,
                                                      svc.unit_of_measurement
                                                    )
                                                  }
                                                  className="w-8 h-8 bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg rounded"
                                                >
                                                  +
                                                </button>
                                                <span className="text-sm text-gray-600">
                                                  {svc.unit_of_measurement}
                                                </span>
                                              </div>
                                              <span className="text-lg text-blue-600 font-medium text-right">
                                                ${formatWithSeparator(svc.price * quantity)}
                                              </span>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: summary of selected services + house info */}
          <div className="w-1/2 ml-auto pt-0 space-y-6">
            <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden">
              <SectionBoxSubtitle>Your {safePackage.title}</SectionBoxSubtitle>

              {Object.keys(mergedSelected).length === 0 ? (
                <div className="text-left text-gray-500 text-medium mt-4">
                  No services selected
                </div>
              ) : (
                <>
                  <p className="text-gray-700 mb-4">
                    These are the services you selected, grouped by section &amp; category:
                  </p>

                  <div className="space-y-6">
                    {Object.entries(summaryStructure).map(([sectionName, cats]) => {
                      if (!Object.keys(cats).length) return null;
                      return (
                        <div key={sectionName}>
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            {sectionName}
                          </h3>

                          {Object.entries(cats).map(([catId, arr]) => {
                            const catObj = ALL_CATEGORIES.find((c) => c.id === catId);
                            const catName = catObj ? catObj.title : catId;
                            if (!arr.length) return null;

                            return (
                              <div key={catId} className="ml-4 mb-4">
                                <h4 className="text-lg font-medium text-gray-700 mb-2">
                                  {catName}
                                </h4>
                                <ul className="space-y-1">
                                  {arr.map(({ svcObj, qty }) => (
                                    <li
                                      key={svcObj.id}
                                      className="flex justify-between items-center text-sm text-gray-600"
                                    >
                                      <span className="truncate w-1/2 pr-2">
                                        {svcObj.title}
                                      </span>
                                      <span>
                                        {qty} x ${formatWithSeparator(svcObj.price)}
                                      </span>
                                      <span className="text-right w-1/4">
                                        ${formatWithSeparator(svcObj.price * qty)}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>

                  {/* Price totals */}
                  <div className="flex flex-col gap-2 items-end mt-6">
                    <div className="flex justify-between w-full">
                      <span className="text-2xl font-semibold text-gray-800">
                        Annual price:
                      </span>
                      <span className="text-2xl font-semibold text-blue-600">
                        ${formatWithSeparator(annualPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between w-full">
                      <span className="text-lg font-medium text-gray-700">
                        Monthly payment:
                      </span>
                      <span className="text-lg font-medium text-blue-600">
                        ${formatWithSeparator(annualPrice / 12)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* House info summary */}
            <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden">
              <SectionBoxSubtitle>Home Details</SectionBoxSubtitle>

              <div className="mt-2 space-y-1 text-sm text-gray-700">
                <p>
                  <strong>Address:</strong>{" "}
                  {houseInfo.addressLine ? houseInfo.addressLine : "N/A"}
                </p>
                <p>
                  <strong>City / Zip:</strong> {houseInfo.city || "?"},{" "}
                  {houseInfo.zip || "?"}
                </p>
                <p>
                  <strong>Country:</strong> {houseInfo.country || "?"}
                </p>
                <hr className="my-2" />

                <p>
                  <strong>House Type:</strong> {formatHouseType(houseInfo.houseType)}
                </p>
                <p>
                  <strong>Floors:</strong> {houseInfo.floors}
                </p>
                <p>
                  <strong>Square ft:</strong>{" "}
                  {houseInfo.squareFootage > 0 ? houseInfo.squareFootage : "?"}
                </p>
                <p>
                  <strong>Bedrooms:</strong> {houseInfo.bedrooms}
                </p>
                <p>
                  <strong>Bathrooms:</strong> {houseInfo.bathrooms}
                </p>
                <p>
                  <strong>Appliances:</strong> {houseInfo.applianceCount}
                </p>
                <p>
                  <strong>AC Units:</strong> {houseInfo.airConditioners}
                </p>
                <p>
                  <strong>Boiler/Heater:</strong>{" "}
                  {houseInfo.hasBoiler
                    ? houseInfo.boilerType || "Yes"
                    : "No / None"}
                </p>
                <hr className="my-2" />

                <p>
                  <strong>Garage:</strong>{" "}
                  {houseInfo.hasGarage ? houseInfo.garageCount : "No"}
                </p>
                <p>
                  <strong>Yard:</strong>{" "}
                  {houseInfo.hasYard
                    ? `${houseInfo.yardArea} sq ft`
                    : "No yard/garden"}
                </p>
                <p>
                  <strong>Pool:</strong>{" "}
                  {houseInfo.hasPool
                    ? `${houseInfo.poolArea} sq ft`
                    : "No pool"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}