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
  return (Object.values(INDOOR_SERVICE_SECTIONS) as string[]).includes(
    sectionValue
  );
}

/** Check if the section is an outdoor one. */
function isOutdoorSection(sectionValue: string): boolean {
  return (Object.values(OUTDOOR_SERVICE_SECTIONS) as string[]).includes(
    sectionValue
  );
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

/** Get base URL for API calls. */
function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "https://your-api.example.com";
}

/** Convert "1-1-2" => "1.1.2" so the backend recognizes it. */
function convertServiceIdToApiFormat(serviceId: string) {
  return serviceId.replaceAll("-", ".");
}

/** Fetch finishing materials (POST /work/finishing_materials). */
async function fetchFinishingMaterials(workCode: string) {
  const url = `${getApiBaseUrl()}/work/finishing_materials`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ work_code: workCode }),
  });
  if (!res.ok) {
    throw new Error(
      `Failed to fetch finishing materials (work_code=${workCode}).`
    );
  }
  return res.json();
}

/** Calculate cost breakdown (POST /calculate). */
async function calculatePrice(params: {
  work_code: string;
  zipcode: string;
  unit_of_measurement: string;
  square: number;
  finishing_materials: string[];
}) {
  const url = `${getApiBaseUrl()}/calculate`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error(
      `Failed to calculate price (work_code=${params.work_code}).`
    );
  }
  return res.json();
}

/** Ensure finishing materials for a service are loaded. */
async function ensureFinishingMaterialsLoaded(
  serviceId: string,
  finishingMaterialsMap: Record<string, any>,
  setFinishingMaterialsMap: React.Dispatch<
    React.SetStateAction<Record<string, any>>
  >,
  finishingMaterialSelections: Record<string, string[]>,
  setFinishingMaterialSelections: React.Dispatch<
    React.SetStateAction<Record<string, string[]>>
  >
) {
  try {
    if (!finishingMaterialsMap[serviceId]) {
      const dot = convertServiceIdToApiFormat(serviceId);
      const data = await fetchFinishingMaterials(dot);
      finishingMaterialsMap[serviceId] = data;
      setFinishingMaterialsMap({ ...finishingMaterialsMap });
    }
    // If no selection for this service => pick default in each sub-section
    if (!finishingMaterialSelections[serviceId]) {
      const data = finishingMaterialsMap[serviceId];
      if (!data) return;
      const picks: string[] = [];
      const sections = data.sections || {};
      for (const arr of Object.values(sections)) {
        if (Array.isArray(arr) && arr.length > 0) {
          picks.push(arr[0].external_id);
        }
      }
      finishingMaterialSelections[serviceId] = picks;
      setFinishingMaterialSelections({ ...finishingMaterialSelections });
    }
  } catch (err) {
    console.error("Error ensureFinishingMaterialsLoaded:", err);
  }
}

/** Pre-load finishing materials for all services in a category. */
async function fetchFinishingMaterialsForCategory(
  services: (typeof ALL_SERVICES)[number][],
  finishingMaterialsMap: Record<string, any>,
  setFinishingMaterialsMap: React.Dispatch<
    React.SetStateAction<Record<string, any>>
  >,
  finishingMaterialSelections: Record<string, string[]>,
  setFinishingMaterialSelections: React.Dispatch<
    React.SetStateAction<Record<string, string[]>>
  >
) {
  const promises = services.map(async (svc) => {
    if (!finishingMaterialsMap[svc.id]) {
      try {
        const dot = convertServiceIdToApiFormat(svc.id);
        const data = await fetchFinishingMaterials(dot);
        finishingMaterialsMap[svc.id] = data;

        // pick the first from each sub-section
        const picks: string[] = [];
        for (const arr of Object.values(data.sections || {})) {
          if (Array.isArray(arr) && arr.length > 0) {
            picks.push(arr[0].external_id);
          }
        }
        finishingMaterialSelections[svc.id] = picks;
      } catch (err) {
        console.error("Error fetchFinishingMaterialsForCategory:", err);
      }
    }
  });

  try {
    await Promise.all(promises);
    setFinishingMaterialsMap({ ...finishingMaterialsMap });
    setFinishingMaterialSelections({ ...finishingMaterialSelections });
  } catch (err) {
    console.error("Error in fetchFinishingMaterialsForCategory:", err);
  }
}

export default function PackageServicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Identify the package
  const packageId = searchParams.get("packageId");
  const chosenPackageRaw = PACKAGES.find((pkg) => pkg.id === packageId) || null;

  if (!packageId || !chosenPackageRaw) {
    return <p>Loading package...</p>;
  }

  const chosenPackage = chosenPackageRaw;

  // State: selectedServices => { indoor: {svcId: qty}, outdoor: {svcId: qty} }
  const [selectedServices, setSelectedServices] = useState<{
    indoor: Record<string, number>;
    outdoor: Record<string, number>;
  }>(() =>
    loadFromSession("packages_selectedServices", { indoor: {}, outdoor: {} })
  );

  useEffect(() => {
    saveToSession("packages_selectedServices", selectedServices);
  }, [selectedServices]);

  // House info
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

  // Search query
  const [searchQuery, setSearchQuery] = useState(() =>
    loadFromSession("packages_searchQuery", "")
  );
  useEffect(() => {
    saveToSession("packages_searchQuery", searchQuery);
  }, [searchQuery]);

  // Expanded categories
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  function toggleCategory(catId: string) {
    setExpandedCategories((prev) => {
      const copy = new Set(prev);
      copy.has(catId) ? copy.delete(catId) : copy.add(catId);
      return copy;
    });
  }

  // Materials & cost breakdown states
  const [finishingMaterialsMap, setFinishingMaterialsMap] = useState<
    Record<string, any>
  >({});
  const [finishingMaterialSelections, setFinishingMaterialSelections] =
    useState<Record<string, string[]>>({});

  // calculationResultsMap => server response for each service
  const [calculationResultsMap, setCalculationResultsMap] = useState<
    Record<string, any>
  >({});
  // serviceCosts => final numeric cost (labor + materials) for each service
  const [serviceCosts, setServiceCosts] = useState<Record<string, number>>({});

  // For toggling cost breakdown UI
  const [expandedCostBreakdown, setExpandedCostBreakdown] = useState<
    Set<string>
  >(new Set());
  function toggleCostBreakdown(svcId: string) {
    setExpandedCostBreakdown((old) => {
      const copy = new Set(old);
      copy.has(svcId) ? copy.delete(svcId) : copy.add(svcId);
      return copy;
    });
  }

  // Manual input quantity
  const [manualInputValue, setManualInputValue] = useState<
    Record<string, string>
  >({});

  // Keep packageId in session
  useEffect(() => {
    saveToSession("packages_currentPackageId", packageId);
  }, [packageId]);

  // "Select all" and "Clear all"
  function handleClearAll() {
    const sure = window.confirm("Are you sure you want to clear all selections?");
    if (!sure) return;
    setSelectedServices({ indoor: {}, outdoor: {} });
    setExpandedCategories(new Set());
    setFinishingMaterialsMap({});
    setFinishingMaterialSelections({});
    setCalculationResultsMap({});
    setServiceCosts({});
    setManualInputValue({});
  }

  async function handleSelectAll() {
    const sure = window.confirm("Select all services from this package?");
    if (!sure) return;

    // Gather catIds => expand them
    const allCatIds = new Set<string>();
    for (const it of chosenPackage.services.indoor) {
      const catId = it.id.split("-").slice(0, 2).join("-");
      allCatIds.add(catId);
    }
    for (const it of chosenPackage.services.outdoor) {
      const catId = it.id.split("-").slice(0, 2).join("-");
      allCatIds.add(catId);
    }

    const nextIndoor: Record<string, number> = {};
    const nextOutdoor: Record<string, number> = {};

    async function selectServiceWithMinQuantity(svcId: string, isIndoor: boolean) {
      const foundSvc = ALL_SERVICES.find((s) => s.id === svcId);
      const minQ = foundSvc?.min_quantity || 1;
      if (isIndoor) {
        nextIndoor[svcId] = minQ;
      } else {
        nextOutdoor[svcId] = minQ;
      }
      // load finishing materials
      await ensureFinishingMaterialsLoaded(
        svcId,
        finishingMaterialsMap,
        setFinishingMaterialsMap,
        finishingMaterialSelections,
        setFinishingMaterialSelections
      );
      // set manual input
      setManualInputValue((prev) => ({ ...prev, [svcId]: String(minQ) }));
    }

    // select all indoor
    for (const it of chosenPackage.services.indoor) {
      await selectServiceWithMinQuantity(it.id, true);
    }
    // select all outdoor
    for (const it of chosenPackage.services.outdoor) {
      await selectServiceWithMinQuantity(it.id, false);
    }

    setSelectedServices({ indoor: nextIndoor, outdoor: nextOutdoor });

    // expand categories by converting Set => Array
    setExpandedCategories((prev) => {
      const merged = new Set(prev);
      for (const catId of Array.from(allCatIds)) {
        merged.add(catId);
      }
      return merged;
    });
  }

  // Toggle a service on/off
  async function toggleService(serviceId: string) {
    const isIndoor = !!chosenPackage.services.indoor.find((x) => x.id === serviceId);
    const sideKey = isIndoor ? "indoor" : "outdoor";
    const copy = { ...selectedServices[sideKey] };
    const isOn = !!copy[serviceId];

    if (isOn) {
      // turn off => remove from state
      delete copy[serviceId];
      // remove from results
      setCalculationResultsMap((old) => {
        const c = { ...old };
        delete c[serviceId];
        return c;
      });
      setServiceCosts((old) => {
        const c = { ...old };
        delete c[serviceId];
        return c;
      });
      setFinishingMaterialSelections((old) => {
        const c = { ...old };
        delete c[serviceId];
        return c;
      });
      setManualInputValue((old) => {
        const c = { ...old };
        delete c[serviceId];
        return c;
      });
    } else {
      // turn on => minQ
      const foundSvc = ALL_SERVICES.find((s) => s.id === serviceId);
      const minQ = foundSvc?.min_quantity || 1;
      copy[serviceId] = minQ;
      // load materials
      await ensureFinishingMaterialsLoaded(
        serviceId,
        finishingMaterialsMap,
        setFinishingMaterialsMap,
        finishingMaterialSelections,
        setFinishingMaterialSelections
      );
      setManualInputValue((m) => ({ ...m, [serviceId]: String(minQ) }));
    }
    setSelectedServices((prev) => ({ ...prev, [sideKey]: copy }));
  }

  // increment/decrement
  function handleQuantityChange(
    serviceId: string,
    increment: boolean,
    unit: string
  ) {
    const isIndoor = !!chosenPackage.services.indoor.find((x) => x.id === serviceId);
    const sideKey = isIndoor ? "indoor" : "outdoor";
    const copy = { ...selectedServices[sideKey] };
    const oldVal = copy[serviceId] || 1;

    const foundSvc = ALL_SERVICES.find((s) => s.id === serviceId);
    const minQ = foundSvc?.min_quantity || 1;

    let newVal = increment ? oldVal + 1 : oldVal - 1;
    if (newVal < minQ) newVal = minQ;
    copy[serviceId] = unit === "each" ? Math.round(newVal) : newVal;
    setSelectedServices((prev) => ({ ...prev, [sideKey]: copy }));
    setManualInputValue((m) => ({ ...m, [serviceId]: String(copy[serviceId]) }));
  }

  // manual input
  function handleManualQuantityChange(serviceId: string, value: string, unit: string) {
    setManualInputValue((m) => ({ ...m, [serviceId]: value }));
  }
  function handleBlurInput(serviceId: string, unit: string) {
    const isIndoor = !!chosenPackage.services.indoor.find((x) => x.id === serviceId);
    const sideKey = isIndoor ? "indoor" : "outdoor";
    const copy = { ...selectedServices[sideKey] };

    const valStr = manualInputValue[serviceId] || "1";
    let parsed = parsePositiveNumber(valStr);

    const foundSvc = ALL_SERVICES.find((s) => s.id === serviceId);
    const minQ = foundSvc?.min_quantity || 1;
    if (parsed < minQ) {
      parsed = minQ;
    }

    copy[serviceId] = unit === "each" ? Math.round(parsed) : parsed;
    setSelectedServices((prev) => ({ ...prev, [sideKey]: copy }));
    setManualInputValue((m) => ({ ...m, [serviceId]: String(copy[serviceId]) }));
  }

  // Build a combined list of services from chosenPackage, apply search filter
  const combinedServices: (typeof ALL_SERVICES)[number][] = [];
  function processSide(isIndoor: boolean) {
    const sideKey = isIndoor ? "indoor" : "outdoor";
    chosenPackage.services[sideKey].forEach((pkgItem) => {
      const svcObj = ALL_SERVICES.find((s) => s.id === pkgItem.id);
      if (!svcObj) return;
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
  processSide(true);
  processSide(false);

  // Group by indoor/outdoor => by section => by category
  const homeSectionsMap: Record<string, Set<string>> = {};
  const gardenSectionsMap: Record<string, Set<string>> = {};

  for (const svc of combinedServices) {
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

  // catServicesMap => catId => array of services
  const catServicesMap: Record<string, (typeof ALL_SERVICES)[number][]> = {};
  for (const svc of combinedServices) {
    const catId = svc.id.split("-").slice(0, 2).join("-");
    if (!catServicesMap[catId]) {
      catServicesMap[catId] = [];
    }
    catServicesMap[catId].push(svc);
  }

  // Recalculate cost after any selection changes
  const userZip = houseInfo?.zip || "";
  useEffect(() => {
    async function recalcAll() {
      for (const [svcId, qty] of Object.entries({
        ...selectedServices.indoor,
        ...selectedServices.outdoor,
      })) {
        await ensureFinishingMaterialsLoaded(
          svcId,
          finishingMaterialsMap,
          setFinishingMaterialsMap,
          finishingMaterialSelections,
          setFinishingMaterialSelections
        );
        const svcObj = ALL_SERVICES.find((s) => s.id === svcId);
        if (!svcObj) continue;
        const finishingIds = finishingMaterialSelections[svcId] || [];
        try {
          const result = await calculatePrice({
            work_code: convertServiceIdToApiFormat(svcId),
            zipcode: userZip,
            unit_of_measurement: svcObj.unit_of_measurement || "each",
            square: qty,
            finishing_materials: finishingIds,
          });
          const labor = parseFloat(result.work_cost) || 0;
          const mat = parseFloat(result.material_cost) || 0;
          const tot = labor + mat;
          setCalculationResultsMap((old) => ({ ...old, [svcId]: result }));
          setServiceCosts((old) => ({ ...old, [svcId]: tot }));
        } catch (err) {
          console.error("Error in recalcAll =>", err);
        }
      }
    }
    recalcAll();
  }, [
    selectedServices,
    finishingMaterialSelections,
    userZip,
    finishingMaterialsMap,
    setFinishingMaterialsMap,
    setFinishingMaterialSelections,
  ]);

  // IMPORTANT: save results to session so that the Estimate page can read them
  useEffect(() => {
    saveToSession("packages_calculationResultsMap", calculationResultsMap);
    saveToSession("packages_serviceCosts", serviceCosts);
  }, [calculationResultsMap, serviceCosts]);

  // Next => /packages/estimate
  function handleNext() {
    const anyIndoor = Object.keys(selectedServices.indoor).length > 0;
    const anyOutdoor = Object.keys(selectedServices.outdoor).length > 0;
    if (!anyIndoor && !anyOutdoor) {
      alert("Please select at least one service before continuing.");
      return;
    }
    router.push("/packages/estimate");
  }

  // compute "annualPrice" = sum of all real costs
  function calculateAnnualPrice(): number {
    let sum = 0;
    for (const cost of Object.values(serviceCosts)) {
      sum += cost;
    }
    return sum;
  }
  const annualPrice = calculateAnnualPrice();

  // Merge indoor+outdoor for summary
  const mergedSelected: Record<string, number> = {
    ...selectedServices.indoor,
    ...selectedServices.outdoor,
  };

  // Build summary structure
  type ServiceItem = { svcObj: (typeof ALL_SERVICES)[number]; qty: number };
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

  // Toggle package
  function handlePackageToggle(pkgId: string) {
    router.push(`/packages/services?packageId=${pkgId}`);
  }
  const packageIdsInOrder = [
    "basic_package",
    "enhanced_package",
    "all_inclusive_package",
    "configure_your_own_package",
  ];

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto">
        <BreadCrumb items={PACKAGES_STEPS} />
      </div>

      <div className="container mx-auto">
        {/* Toggler + Next */}
        <div className="flex justify-between items-center mt-11">
          <div className="inline-flex rounded-lg p-1 w-full max-w-[624px] h-14 border border-gray-300 bg-white">
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
                    isActive ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
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

        {/* Search */}
        <div className="w-full max-w-[624px] mt-6 mb-4">
          <SearchServices
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
            placeholder="Search for services..."
          />
        </div>

        {/* "Select all" / "Clear" */}
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

        {/* Layout: left=services, right=summary */}
        <div className="container mx-auto relative flex mt-8">
          {/* LEFT column */}
          <div className="flex-1 space-y-12">
            {/* For Home */}
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
                          servicesForCat.forEach((svc) => {
                            if (
                              selectedServices.indoor[svc.id] ||
                              selectedServices.outdoor[svc.id]
                            ) {
                              selectedInCat++;
                            }
                          });

                          const catObj = ALL_CATEGORIES.find((c) => c.id === catId);
                          const catName = catObj ? catObj.title : catId;

                          return (
                            <div
                              key={catId}
                              className={`p-4 border rounded-xl bg-white mt-4 ${
                                selectedInCat > 0 ? "border-blue-500" : "border-gray-300"
                              }`}
                            >
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

                              {expandedCategories.has(catId) && (
                                <div className="mt-4 flex flex-col gap-3">
                                  {servicesForCat.map((svc) => {
                                    const isIndoorSelected =
                                      selectedServices.indoor[svc.id] != null;
                                    const isOutdoorSelected =
                                      selectedServices.outdoor[svc.id] != null;
                                    const isSelected =
                                      isIndoorSelected || isOutdoorSelected;

                                    const quantity = isIndoorSelected
                                      ? selectedServices.indoor[svc.id]
                                      : isOutdoorSelected
                                      ? selectedServices.outdoor[svc.id]
                                      : 1;

                                    const inputValue =
                                      manualInputValue[svc.id] !== undefined
                                        ? manualInputValue[svc.id]
                                        : String(quantity);

                                    const calcResult = calculationResultsMap[svc.id];
                                    const finalCost = serviceCosts[svc.id] || 0;
                                    const isBreakdownOpen = expandedCostBreakdown.has(svc.id);

                                    return (
                                      <div key={svc.id} className="space-y-2">
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

                                        {isSelected && (
                                          <>
                                            {svc.description && (
                                              <p className="text-sm text-gray-500 pr-16">
                                                {svc.description}
                                              </p>
                                            )}
                                            <div className="flex justify-between items-center">
                                              <div className="flex items-center gap-1">
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
                                                    handleBlurInput(
                                                      svc.id,
                                                      svc.unit_of_measurement
                                                    )
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
                                              {/* cost + breakdown toggle */}
                                              <div className="flex items-center gap-2">
                                                <span className="text-lg text-blue-600 font-medium text-right">
                                                  ${formatWithSeparator(finalCost)}
                                                </span>
                                                <button
                                                  onClick={() => toggleCostBreakdown(svc.id)}
                                                  className={`text-blue-500 text-sm ml-2 ${
                                                    isBreakdownOpen ? "" : "underline"
                                                  }`}
                                                >
                                                  Details
                                                </button>
                                              </div>
                                            </div>

                                            {isBreakdownOpen && calcResult && (
                                              <div className="mt-4 p-4 bg-gray-50 border rounded">
                                                <h4 className="text-md font-semibold text-gray-800 mb-3">
                                                  Cost Breakdown
                                                </h4>
                                                <div className="flex flex-col gap-2 mb-2">
                                                  <div className="flex justify-between">
                                                    <span className="text-md font-medium text-gray-700">
                                                      Labor
                                                    </span>
                                                    <span>
                                                      {calcResult.work_cost
                                                        ? `$${calcResult.work_cost}`
                                                        : "—"}
                                                    </span>
                                                  </div>
                                                  <div className="flex justify-between">
                                                    <span className="text-md font-medium text-gray-700">
                                                      Materials, tools, &amp; equipment
                                                    </span>
                                                    <span>
                                                      {calcResult.material_cost
                                                        ? `$${calcResult.material_cost}`
                                                        : "—"}
                                                    </span>
                                                  </div>
                                                </div>

                                                {Array.isArray(calcResult.materials) &&
                                                  calcResult.materials.length > 0 && (
                                                    <div className="mt-2">
                                                      <table className="table-auto w-full text-sm text-left text-gray-700">
                                                        <thead>
                                                          <tr className="border-b">
                                                            <th className="py-2 px-1 text-left">Name</th>
                                                            <th className="py-2 px-1">Price</th>
                                                            <th className="py-2 px-1">Qty</th>
                                                            <th className="py-2 px-1">Subtotal</th>
                                                          </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-200">
                                                          {calcResult.materials.map(
                                                            (m: any, idx2: number) => (
                                                              <tr
                                                                key={`${m.external_id}-${idx2}`}
                                                              >
                                                                <td className="py-3 px-1">
                                                                  {m.name}
                                                                </td>
                                                                <td className="py-3 px-1">
                                                                  ${m.cost_per_unit}
                                                                </td>
                                                                <td className="py-3 px-3">
                                                                  {m.quantity}
                                                                </td>
                                                                <td className="py-3 px-3">
                                                                  ${m.cost}
                                                                </td>
                                                              </tr>
                                                            )
                                                          )}
                                                        </tbody>
                                                      </table>
                                                    </div>
                                                  )}
                                              </div>
                                            )}
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

            {/* For Garden */}
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
                    const catIdsArr = Array.from(catIdsSet);

                    return (
                      <div key={sectionName} className="mt-4">
                        <SectionBoxSubtitle>{sectionName}</SectionBoxSubtitle>

                        {catIdsArr.map((catId) => {
                          const servicesForCat = catServicesMap[catId] || [];
                          let selectedInCat = 0;
                          servicesForCat.forEach((svc) => {
                            if (
                              selectedServices.indoor[svc.id] ||
                              selectedServices.outdoor[svc.id]
                            ) {
                              selectedInCat++;
                            }
                          });

                          const catObj = ALL_CATEGORIES.find((c) => c.id === catId);
                          const catName = catObj ? catObj.title : catId;

                          return (
                            <div
                              key={catId}
                              className={`p-4 border rounded-xl bg-white mt-4 ${
                                selectedInCat > 0 ? "border-blue-500" : "border-gray-300"
                              }`}
                            >
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

                              {expandedCategories.has(catId) && (
                                <div className="mt-4 flex flex-col gap-3">
                                  {servicesForCat.map((svc) => {
                                    const isIndoorSelected =
                                      selectedServices.indoor[svc.id] != null;
                                    const isOutdoorSelected =
                                      selectedServices.outdoor[svc.id] != null;
                                    const isSelected =
                                      isIndoorSelected || isOutdoorSelected;

                                    const quantity = isIndoorSelected
                                      ? selectedServices.indoor[svc.id]
                                      : isOutdoorSelected
                                      ? selectedServices.outdoor[svc.id]
                                      : 1;

                                    const inputVal =
                                      manualInputValue[svc.id] !== undefined
                                        ? manualInputValue[svc.id]
                                        : String(quantity);

                                    const calcResult = calculationResultsMap[svc.id];
                                    const finalCost = serviceCosts[svc.id] || 0;
                                    const isBreakdownOpen = expandedCostBreakdown.has(svc.id);

                                    return (
                                      <div key={svc.id} className="space-y-2">
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

                                        {isSelected && (
                                          <>
                                            {svc.description && (
                                              <p className="text-sm text-gray-500 pr-16">
                                                {svc.description}
                                              </p>
                                            )}
                                            <div className="flex justify-between items-center">
                                              <div className="flex items-center gap-1">
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
                                                <input
                                                  type="text"
                                                  value={inputVal}
                                                  onClick={() =>
                                                    setManualInputValue((old) => ({
                                                      ...old,
                                                      [svc.id]: "",
                                                    }))
                                                  }
                                                  onBlur={() =>
                                                    handleBlurInput(
                                                      svc.id,
                                                      svc.unit_of_measurement
                                                    )
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
                                              {/* cost + breakdown toggle */}
                                              <div className="flex items-center gap-2">
                                                <span className="text-lg text-blue-600 font-medium text-right">
                                                  ${formatWithSeparator(finalCost)}
                                                </span>
                                                <button
                                                  onClick={() => toggleCostBreakdown(svc.id)}
                                                  className={`text-blue-500 text-sm ml-2 ${
                                                    isBreakdownOpen ? "" : "underline"
                                                  }`}
                                                >
                                                  Details
                                                </button>
                                              </div>
                                            </div>

                                            {isBreakdownOpen && calcResult && (
                                              <div className="mt-4 p-4 bg-gray-50 border rounded">
                                                <h4 className="text-md font-semibold text-gray-800 mb-3">
                                                  Cost Breakdown
                                                </h4>
                                                <div className="flex flex-col gap-2 mb-2">
                                                  <div className="flex justify-between">
                                                    <span className="text-md font-medium text-gray-700">
                                                      Labor
                                                    </span>
                                                    <span>
                                                      {calcResult.work_cost
                                                        ? `$${calcResult.work_cost}`
                                                        : "—"}
                                                    </span>
                                                  </div>
                                                  <div className="flex justify-between">
                                                    <span className="text-md font-medium text-gray-700">
                                                      Materials, tools, &amp; equipment
                                                    </span>
                                                    <span>
                                                      {calcResult.material_cost
                                                        ? `$${calcResult.material_cost}`
                                                        : "—"}
                                                    </span>
                                                  </div>
                                                </div>

                                                {Array.isArray(calcResult.materials) &&
                                                  calcResult.materials.length > 0 && (
                                                    <div className="mt-2">
                                                      <table className="table-auto w-full text-sm text-left text-gray-700">
                                                        <thead>
                                                          <tr className="border-b">
                                                            <th className="py-2 px-1">Name</th>
                                                            <th className="py-2 px-1">Price</th>
                                                            <th className="py-2 px-1">Qty</th>
                                                            <th className="py-2 px-1">Subtotal</th>
                                                          </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-200">
                                                          {calcResult.materials.map(
                                                            (m: any, idx2: number) => (
                                                              <tr
                                                                key={`${m.external_id}-${idx2}`}
                                                              >
                                                                <td className="py-3 px-1">
                                                                  {m.name}
                                                                </td>
                                                                <td className="py-3 px-1">
                                                                  ${m.cost_per_unit}
                                                                </td>
                                                                <td className="py-3 px-1">
                                                                  {m.quantity}
                                                                </td>
                                                                <td className="py-3 px-1">
                                                                  ${m.cost}
                                                                </td>
                                                              </tr>
                                                            )
                                                          )}
                                                        </tbody>
                                                      </table>
                                                    </div>
                                                  )}
                                              </div>
                                            )}
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

          {/* RIGHT column => summary */}
          <div className="w-1/2 ml-auto pt-0 space-y-6">
            <div className="max-w-[500px] ml-auto bg-white p-4 rounded-lg border border-gray-300 overflow-hidden">
              <SectionBoxSubtitle>Your {chosenPackage.title}</SectionBoxSubtitle>

              {Object.keys(mergedSelected).length === 0 ? (
                <div className="text-left text-gray-500 text-medium mt-4">
                  No services selected
                </div>
              ) : (
                <>
                  <p className="text-gray-700 mb-4">
                    These are the services you selected, grouped by section &amp; category:
                  </p>

                  {/* Build a local summary structure */}
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
                                  {arr.map(({ svcObj, qty }) => {
                                    const cost = serviceCosts[svcObj.id] || 0;
                                    return (
                                      <li
                                        key={svcObj.id}
                                        className="flex justify-between items-center text-sm text-gray-600"
                                      >
                                        <span className="truncate w-1/2 pr-2">{svcObj.title}</span>
                                        <span>
                                          {qty} {svcObj.unit_of_measurement}
                                        </span>
                                        <span className="text-right w-1/4">
                                          ${formatWithSeparator(cost)}
                                        </span>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>

                  {/* Price total */}
                  <div className="flex flex-col gap-2 items-end mt-6">
                    <div className="flex justify-between w-full">
                      <span className="text-2xl font-semibold text-gray-700">
                        Annual price:
                      </span>
                      <span className="text-2xl font-semibold text-blue-600">
                        ${formatWithSeparator(annualPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between w-full">
                      <span className="text-lg font-medium text-gray-600">
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

            {/* House info */}
            <div className="max-w-[500px] ml-auto bg-white p-4 rounded-lg border border-gray-300 overflow-hidden">
              <SectionBoxSubtitle>Home Details</SectionBoxSubtitle>
              <div className="mt-2 space-y-1 text-sm text-gray-700">
                <p>
                  <strong>Address:</strong> {houseInfo.addressLine || "N/A"}
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
                  {houseInfo.hasBoiler ? houseInfo.boilerType || "Yes" : "No / None"}
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
                  {houseInfo.hasPool ? `${houseInfo.poolArea} sq ft` : "No pool"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}