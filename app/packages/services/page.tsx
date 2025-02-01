"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
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
import { getSessionItem, setSessionItem } from "@/utils/session";

/** Formats a numeric value with two decimals and comma separators. */
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

/** Convert "1-1-2" => "1.1.2" so the backend recognizes it. */
function convertServiceIdToApiFormat(serviceId: string) {
  return serviceId.replaceAll("-", ".");
}

/** Returns the base API URL or fallback. */
function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "https://your-api.example.com";
}

/** POST /work/finishing_materials => fetch finishing materials. */
async function fetchFinishingMaterials(workCode: string) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/work/finishing_materials`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ work_code: workCode }),
  });
  if (!res.ok) {
    throw new Error(
      `Failed to fetch finishing materials (work_code=${workCode}).`
    );
  }
  return res.json();
}

/** POST /calculate => compute labor+materials cost. */
async function calculatePrice(params: {
  work_code: string;
  zipcode: string;
  unit_of_measurement: string;
  square: number;
  finishing_materials: string[];
}) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/calculate`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error(
      `Failed to calculate price (work_code=${params.work_code}).`
    );
  }
  return res.json();
}

/** Simple image component for a service, full width for phone/tablet. */
function ServiceImage({ serviceId }: { serviceId: string }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    const firstSegment = serviceId.split("-")[0];
    const code = convertServiceIdToApiFormat(serviceId);
    const url = `http://dev.thejamb.com/images/${firstSegment}/${code}.jpg`;
    setImageSrc(url);
  }, [serviceId]);

  if (!imageSrc) return null;

  return (
    <div className="mb-2 border rounded overflow-hidden w-full">
      <Image
        src={imageSrc}
        alt="Service"
        width={600}
        height={400}
        style={{ objectFit: "cover", width: "100%", height: "auto" }}
      />
    </div>
  );
}

/**
 * Ensure finishing materials for a service are loaded
 * and initialize finishingMaterialSelections if missing.
 */
async function ensureFinishingMaterialsLoaded(
  serviceId: string,
  finishingMaterialsMap: Record<string, any>,
  setFinishingMaterialsMap: React.Dispatch<
    React.SetStateAction<Record<string, any>>
  >,
  finishingMaterialSelections: Record<string, Record<string, string>>,
  setFinishingMaterialSelections: React.Dispatch<
    React.SetStateAction<Record<string, Record<string, string>>>
  >
) {
  try {
    if (!finishingMaterialsMap[serviceId]) {
      const dot = convertServiceIdToApiFormat(serviceId);
      const data = await fetchFinishingMaterials(dot);
      finishingMaterialsMap[serviceId] = data;
      setFinishingMaterialsMap({ ...finishingMaterialsMap });
    }
    // If no selection object for this service => create it
    if (!finishingMaterialSelections[serviceId]) {
      const fmData = finishingMaterialsMap[serviceId];
      if (!fmData) return;
      const newObj: Record<string, string> = {};
      for (const [secName, arr] of Object.entries(fmData.sections || {})) {
        if (Array.isArray(arr) && arr.length > 0) {
          newObj[secName] = arr[0].external_id;
        }
      }
      finishingMaterialSelections[serviceId] = newObj;
      setFinishingMaterialSelections({ ...finishingMaterialSelections });
    }
  } catch (err) {
    console.error("Error ensureFinishingMaterialsLoaded:", err);
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

  // selectedServices => { indoor: { serviceId: qty }, outdoor: { serviceId: qty } }
  const [selectedServices, setSelectedServices] = useState<{
    indoor: Record<string, number>;
    outdoor: Record<string, number>;
  }>(() =>
    getSessionItem("packages_selectedServices", { indoor: {}, outdoor: {} })
  );
  useEffect(() => {
    setSessionItem("packages_selectedServices", selectedServices);
  }, [selectedServices]);

  // House info
  const [houseInfo] = useState(() =>
    getSessionItem("packages_houseInfo", {
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
    getSessionItem("packages_searchQuery", "")
  );
  useEffect(() => {
    setSessionItem("packages_searchQuery", searchQuery);
  }, [searchQuery]);

  // For toggling categories
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

  // finishingMaterialsMap => { [serviceId]: { sections: {...} } }
  const [finishingMaterialsMap, setFinishingMaterialsMap] = useState<
    Record<string, any>
  >({});
  // finishingMaterialSelections => { [serviceId]: { [sectionName]: externalId } }
  const [finishingMaterialSelections, setFinishingMaterialSelections] =
    useState<Record<string, Record<string, string>>>({});

  // cost breakdown
  const [calculationResultsMap, setCalculationResultsMap] = useState<
    Record<string, any>
  >({});
  // serviceCosts => final numeric cost (labor + materials) for each service
  const [serviceCosts, setServiceCosts] = useState<Record<string, number>>({});

  // For toggling details
  const [expandedCostBreakdown, setExpandedCostBreakdown] = useState<
    Set<string>
  >(new Set());
  function toggleCostBreakdown(svcId: string) {
    setExpandedCostBreakdown((old) => {
      const copy = new Set(old);
      if (copy.has(svcId)) copy.delete(svcId);
      else copy.add(svcId);
      return copy;
    });
  }

  // manual input => serviceId => string
  const [manualInputValue, setManualInputValue] = useState<
    Record<string, string>
  >({});

  // finishing-material modal
  const [showModalServiceId, setShowModalServiceId] = useState<string | null>(
    null
  );
  const [showModalSectionName, setShowModalSectionName] = useState<
    string | null
  >(null);

  // user-owned materials => serviceId => set of externalIds
  const [clientOwnedMaterials, setClientOwnedMaterials] = useState<
    Record<string, Set<string>>
  >({});

  // Keep packageId in session
  useEffect(() => {
    setSessionItem("packages_currentPackageId", packageId);
  }, [packageId]);

  /** Clear all services. */
  function handleClearAll() {
    const sure = window.confirm(
      "Are you sure you want to clear all selections?"
    );
    if (!sure) return;

    setSelectedServices({ indoor: {}, outdoor: {} });
    setExpandedCategories(new Set());
    setFinishingMaterialsMap({});
    setFinishingMaterialSelections({});
    setCalculationResultsMap({});
    setServiceCosts({});
    setManualInputValue({});
    setClientOwnedMaterials({});
  }

  /** Select all services from the chosen package. */
  async function handleSelectAll() {
    const sure = window.confirm("Select all services from this package?");
    if (!sure) return;

    const allCatIds = new Set<string>();
    chosenPackage.services.indoor.forEach((x) => {
      const catId = x.id.split("-").slice(0, 2).join("-");
      allCatIds.add(catId);
    });
    chosenPackage.services.outdoor.forEach((x) => {
      const catId = x.id.split("-").slice(0, 2).join("-");
      allCatIds.add(catId);
    });

    const nextIndoor: Record<string, number> = {};
    const nextOutdoor: Record<string, number> = {};

    async function selectService(serviceId: string, isIndoor: boolean) {
      const found = ALL_SERVICES.find((s) => s.id === serviceId);
      const minQ = found?.min_quantity || 1;
      if (isIndoor) {
        nextIndoor[serviceId] = minQ;
      } else {
        nextOutdoor[serviceId] = minQ;
      }
      await ensureFinishingMaterialsLoaded(
        serviceId,
        finishingMaterialsMap,
        setFinishingMaterialsMap,
        finishingMaterialSelections,
        setFinishingMaterialSelections
      );
      setManualInputValue((prev) => ({ ...prev, [serviceId]: String(minQ) }));
    }

    // indoor
    for (const it of chosenPackage.services.indoor) {
      await selectService(it.id, true);
    }
    // outdoor
    for (const it of chosenPackage.services.outdoor) {
      await selectService(it.id, false);
    }

    setSelectedServices({ indoor: nextIndoor, outdoor: nextOutdoor });
    setExpandedCategories((old) => {
      const copy = new Set(old);
      for (const c of Array.from(allCatIds)) {
        copy.add(c);
      }
      return copy;
    });
  }

  /** Toggle a service in selectedServices. */
  async function toggleService(serviceId: string) {
    const isIndoor = !!chosenPackage.services.indoor.find(
      (x) => x.id === serviceId
    );
    const sideKey = isIndoor ? "indoor" : "outdoor";

    const copy = { ...selectedServices[sideKey] };
    const isOn = !!copy[serviceId];

    if (isOn) {
      delete copy[serviceId];
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
      setClientOwnedMaterials((old) => {
        const c = { ...old };
        delete c[serviceId];
        return c;
      });
    } else {
      // Turn on
      const svcObj = ALL_SERVICES.find((s) => s.id === serviceId);
      const minQ = svcObj?.min_quantity || 1;
      copy[serviceId] = minQ;
      await ensureFinishingMaterialsLoaded(
        serviceId,
        finishingMaterialsMap,
        setFinishingMaterialsMap,
        finishingMaterialSelections,
        setFinishingMaterialSelections
      );
      setManualInputValue((old) => ({ ...old, [serviceId]: String(minQ) }));
    }
    setSelectedServices((old) => ({ ...old, [sideKey]: copy }));
  }

  /** +/- quantity. */
  function handleQuantityChange(
    serviceId: string,
    increment: boolean,
    unit: string
  ) {
    const isIndoor = !!chosenPackage.services.indoor.find(
      (x) => x.id === serviceId
    );
    const sideKey = isIndoor ? "indoor" : "outdoor";
    const copy = { ...selectedServices[sideKey] };
    const oldVal = copy[serviceId] || 1;

    const svcObj = ALL_SERVICES.find((s) => s.id === serviceId);
    const minQ = svcObj?.min_quantity || 1;
    const maxQ = svcObj?.max_quantity || 999999;

    let newVal = increment ? oldVal + 1 : oldVal - 1;
    if (newVal < minQ) newVal = minQ;
    if (newVal > maxQ) newVal = maxQ;

    copy[serviceId] = unit === "each" ? Math.round(newVal) : newVal;
    setSelectedServices((old) => ({ ...old, [sideKey]: copy }));
    setManualInputValue((old) => ({
      ...old,
      [serviceId]: String(copy[serviceId]),
    }));
  }

  /** typed quantity. */
  function handleManualQuantityChange(
    serviceId: string,
    value: string,
    unit: string
  ) {
    setManualInputValue((old) => ({ ...old, [serviceId]: value }));
  }

  function handleBlurInput(serviceId: string, unit: string) {
    const isIndoor = !!chosenPackage.services.indoor.find(
      (x) => x.id === serviceId
    );
    const sideKey = isIndoor ? "indoor" : "outdoor";

    const copy = { ...selectedServices[sideKey] };
    const strVal = manualInputValue[serviceId] || "1";
    let parsed = parsePositiveNumber(strVal);

    const svcObj = ALL_SERVICES.find((s) => s.id === serviceId);
    const minQ = svcObj?.min_quantity || 1;
    const maxQ = svcObj?.max_quantity || 999999;
    if (parsed < minQ) parsed = minQ;
    if (parsed > maxQ) parsed = maxQ;

    copy[serviceId] = unit === "each" ? Math.round(parsed) : parsed;
    setSelectedServices((old) => ({ ...old, [sideKey]: copy }));
    setManualInputValue((old) => ({
      ...old,
      [serviceId]: String(copy[serviceId]),
    }));
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
        if (
          !svcObj.title.toLowerCase().includes(lower) &&
          !svcObj.description?.toLowerCase().includes(lower)
        ) {
          return;
        }
      }
      combinedServices.push(svcObj);
    });
  }
  processSide(true);
  processSide(false);

  // Group by section => cat => ...
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

  // catServicesMap => catId -> array of services
  const catServicesMap: Record<string, (typeof ALL_SERVICES)[number][]> = {};
  for (const svc of combinedServices) {
    const catId = svc.id.split("-").slice(0, 2).join("-");
    if (!catServicesMap[catId]) {
      catServicesMap[catId] = [];
    }
    catServicesMap[catId].push(svc);
  }

  // Recalc cost whenever user changes selected services or finishing materials
  useEffect(() => {
    async function recalcAll() {
      const merged = {
        ...selectedServices.indoor,
        ...selectedServices.outdoor,
      };
      const userZip = houseInfo?.zip || "";
      if (!userZip || userZip.length < 5) return; // skip if no valid ZIP

      for (const [svcId, qty] of Object.entries(merged)) {
        await ensureFinishingMaterialsLoaded(
          svcId,
          finishingMaterialsMap,
          setFinishingMaterialsMap,
          finishingMaterialSelections,
          setFinishingMaterialSelections
        );
        const foundSvc = ALL_SERVICES.find((s) => s.id === svcId);
        if (!foundSvc) continue;

        const picksObj = finishingMaterialSelections[svcId] || {};
        const finishingIds = Object.values(picksObj);

        try {
          const resp = await calculatePrice({
            work_code: convertServiceIdToApiFormat(svcId),
            zipcode: userZip,
            unit_of_measurement: foundSvc.unit_of_measurement || "each",
            square: qty,
            finishing_materials: finishingIds,
          });
          const labor = parseFloat(resp.work_cost) || 0;
          const mat = parseFloat(resp.material_cost) || 0;
          setCalculationResultsMap((old) => ({ ...old, [svcId]: resp }));
          setServiceCosts((old) => ({ ...old, [svcId]: labor + mat }));
        } catch (err) {
          console.error("Error calculating cost for", svcId, err);
        }
      }
    }
    recalcAll();
  }, [
    selectedServices,
    finishingMaterialSelections,
    finishingMaterialsMap,
    setFinishingMaterialsMap,
    setFinishingMaterialSelections,
    houseInfo,
  ]);

  // Save cost data in session
  useEffect(() => {
    setSessionItem("packages_calculationResultsMap", calculationResultsMap);
    setSessionItem("packages_serviceCosts", serviceCosts);
  }, [calculationResultsMap, serviceCosts]);

  // Next button => go to /packages/estimate
  function handleNext() {
    const anyIndoor = Object.keys(selectedServices.indoor).length > 0;
    const anyOutdoor = Object.keys(selectedServices.outdoor).length > 0;
    if (!anyIndoor && !anyOutdoor) {
      alert("Please select at least one service before continuing.");
      return;
    }
    router.push("/packages/estimate");
  }

  // Compute total
  function calculateAnnualPrice(): number {
    let sum = 0;
    for (const cost of Object.values(serviceCosts)) {
      sum += cost;
    }
    return sum;
  }
  const annualPrice = calculateAnnualPrice();

  // Merge indoor + outdoor
  const mergedSelected: Record<string, number> = {
    ...selectedServices.indoor,
    ...selectedServices.outdoor,
  };

  // Build summary structure => section => cat => ...
  interface ServiceItem {
    svcObj: (typeof ALL_SERVICES)[number];
    qty: number;
  }
  const summaryStructure: Record<string, Record<string, ServiceItem[]>> = {};

  for (const [svcId, qty] of Object.entries(mergedSelected)) {
    const svcObj = ALL_SERVICES.find((s) => s.id === svcId);
    if (!svcObj) continue;
    const catId = svcObj.id.split("-").slice(0, 2).join("-");
    const catObj = ALL_CATEGORIES.find((c) => c.id === catId);
    if (!catObj) continue;

    const sectionName = catObj.section;
    if (!summaryStructure[sectionName]) summaryStructure[sectionName] = {};
    if (!summaryStructure[sectionName][catId]) {
      summaryStructure[sectionName][catId] = [];
    }
    summaryStructure[sectionName][catId].push({ svcObj, qty });
  }

  // Switch package ID
  function handlePackageToggle(newPkgId: string) {
    router.push(`/packages/services?packageId=${newPkgId}`);
  }

  function userHasOwnMaterial(serviceId: string, extId: string) {
    if (!clientOwnedMaterials[serviceId]) {
      clientOwnedMaterials[serviceId] = new Set();
    }
    clientOwnedMaterials[serviceId].add(extId);
    setClientOwnedMaterials({ ...clientOwnedMaterials });
  }

  // pick a finishing material => finishingMaterialSelections[serviceId][showModalSectionName] = extId
  function pickMaterial(serviceId: string, sectionName: string, extId: string) {
    const existing = finishingMaterialSelections[serviceId] || {};
    existing[sectionName] = extId;
    finishingMaterialSelections[serviceId] = existing;
    setFinishingMaterialSelections({ ...finishingMaterialSelections });
  }

  // find finishing material object
  function findFinishingMaterialObj(
    serviceId: string,
    extId: string
  ): {
    name: string;
    cost: string;
    image?: string;
    unit_of_measurement: string;
  } | null {
    const data = finishingMaterialsMap[serviceId];
    if (!data) return null;
    for (const arr of Object.values(data.sections || {})) {
      if (Array.isArray(arr)) {
        const found = arr.find((fm) => fm.external_id === extId);
        if (found) return found;
      }
    }
    return null;
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
        {/* Toggler + Next (stack vertically on smaller screens, side by side on xl) */}
        <div className="flex flex-col xl:flex-row justify-between items-start gap-4 mt-11">
          {/* Package switcher - full width on phone/tablet, 600px on desktop */}
          <div
            className="
    inline-flex flex-nowrap items-center justify-start overflow-x-auto
    rounded-lg p-1 w-full xl:w-[600px] h-12 md:h-14 border border-gray-300 bg-white
    text-sm md:text-base lg:text-lg
  "
          >
            {packageIdsInOrder.map((pkgId) => {
              const pkgObj = PACKAGES.find((p) => p.id === pkgId);
              if (!pkgObj) return null;
              const displayTitle = getShortTitle(pkgId);
              const isActive = pkgId === packageId;

              return (
                <button
                  key={pkgId}
                  onClick={() => handlePackageToggle(pkgId)}
                  /*
          - On phones (<768px): "grow basis-0" ensures each button expands 
            to remove leftover space, and if total width > screen, horizontal scroll kicks in.
          - From md: we revert to "flex-1 px-4" for the original layout (equal-sized buttons).
          - "whitespace-nowrap" keeps "all-inclusive" on a single line.
        */
                  className={`
          grow basis-0 md:flex-1
          px-2 md:px-4 py-2
          rounded-md font-semibold transition-colors whitespace-nowrap
          ${
            isActive
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }
        `}
                >
                  {displayTitle}
                </button>
              );
            })}
          </div>

          {/* Next button => align right */}
          <div className="w-full xl:w-auto flex justify-end">
            <Button onClick={handleNext} variant="primary">
              Next →
            </Button>
          </div>
        </div>

        {/* Search => full width on smaller screens, 600px on desktop */}
        <div className="w-full xl:max-w-[600px] mt-6 mb-4">
          <SearchServices
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
            placeholder="Search for services..."
          />
        </div>

        {/* "Select all" / "Clear" => full width on smaller screens, 600px on desktop */}
        <div className="flex justify-between items-center text-sm text-gray-500 mt-6 w-full xl:max-w-[600px]">
          <span>
            No service?{" "}
            <a
              href="#"
              className="text-blue-600 hover:underline focus:outline-none"
            >
              Contact support.
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

        {/* Main layout => stacked on phone/tablet, side by side on xl */}
        <div className="container mx-auto relative flex flex-col xl:flex-row mt-8 gap-8">
          {/* LEFT column => full width on smaller screens */}
          <div className="w-full xl:flex-1 space-y-12">
            {/* For Home */}
            {Object.keys(homeSectionsMap).length > 0 && (
              <div className="w-full">
                <div className="w-full mx-auto">
                  <div
                    className="relative overflow-hidden rounded-xl border border-gray-300 h-32 bg-center bg-cover"
                    style={{ backgroundImage: `url(/images/rooms/attic.jpg)` }}
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                    <div className="relative z-10 flex items-center justify-center h-full">
                      <SectionBoxTitle className="text-white">
                        For Home
                      </SectionBoxTitle>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-6 w-full">
                  {Object.keys(homeSectionsMap).map((sectionName) => {
                    const catIdsSet = homeSectionsMap[sectionName];
                    if (!catIdsSet?.size) return null;
                    const catIdsArray = Array.from(catIdsSet);

                    return (
                      <div key={sectionName} className="mt-4 w-full">
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

                          const catObj = ALL_CATEGORIES.find(
                            (c) => c.id === catId
                          );
                          const catName = catObj ? catObj.title : catId;

                          return (
                            <div
                              key={catId}
                              className={`p-4 border rounded-xl bg-white mt-4 ${
                                selectedInCat > 0
                                  ? "border-blue-500"
                                  : "border-gray-300"
                              }`}
                            >
                              <button
                                onClick={() => toggleCategory(catId)}
                                className="flex justify-between items-center w-full"
                              >
                                <h3
                                  className={`font-medium text-2xl ${
                                    selectedInCat > 0
                                      ? "text-blue-600"
                                      : "text-black"
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
                                    expandedCategories.has(catId)
                                      ? "rotate-180"
                                      : ""
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

                                    const calcResult =
                                      calculationResultsMap[svc.id];
                                    const finalCost = serviceCosts[svc.id] || 0;
                                    const isBreakdownOpen =
                                      expandedCostBreakdown.has(svc.id);

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
                                              onChange={() =>
                                                toggleService(svc.id)
                                              }
                                              className="sr-only peer"
                                            />
                                            <div className="w-[50px] h-[26px] bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors duration-300"></div>
                                            <div className="absolute top-[2px] left-[2px] w-[22px] h-[22px] bg-white rounded-full shadow-md peer-checked:translate-x-[24px] transform transition-transform duration-300"></div>
                                          </label>
                                        </div>

                                        {isSelected && (
                                          <>
                                            <ServiceImage serviceId={svc.id} />
                                            {svc.description && (
                                              <p className="text-sm text-gray-500">
                                                {svc.description}
                                              </p>
                                            )}

                                            {/* Quantity row */}
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
                                                    setManualInputValue(
                                                      (old) => ({
                                                        ...old,
                                                        [svc.id]: "",
                                                      })
                                                    )
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
                                              <div className="flex items-center gap-2">
                                                <span className="text-lg text-blue-600 font-semibold text-right">
                                                  $
                                                  {formatWithSeparator(
                                                    finalCost
                                                  )}
                                                </span>
                                              </div>
                                            </div>

                                            {/* "Details" button*/}
                                            <div className="mt-2 flex justify-end">
                                              <button
                                                onClick={() =>
                                                  toggleCostBreakdown(svc.id)
                                                }
                                                className={`text-blue-600 text-sm font-medium mb-3 ${
                                                  isBreakdownOpen
                                                    ? ""
                                                    : "underline"
                                                }`}
                                              >
                                                Cost Breakdown
                                              </button>
                                            </div>

                                            {isBreakdownOpen && calcResult && (
                                              <div className="mt-4 p-4 bg-gray-50 border rounded">
                                                <div className="flex flex-col gap-2 mb-2">
                                                  <div className="flex justify-between">
                                                    <span className="text-md font-medium text-gray-700">
                                                      Labor
                                                    </span>
                                                    <span className="text-md font-semibold text-gray-700">
                                                      {calcResult.work_cost
                                                        ? `$${calcResult.work_cost}`
                                                        : "—"}
                                                    </span>
                                                  </div>
                                                  <div className="flex justify-between">
                                                    <span className="text-md font-medium text-gray-700">
                                                      Materials, tools &amp;
                                                      equipment
                                                    </span>
                                                    <span className="text-md font-semibold text-gray-700">
                                                      {calcResult.material_cost
                                                        ? `$${calcResult.material_cost}`
                                                        : "—"}
                                                    </span>
                                                  </div>
                                                </div>

                                                {Array.isArray(
                                                  calcResult.materials
                                                ) &&
                                                  calcResult.materials.length >
                                                    0 && (
                                                    <div className="mt-2">
                                                      <table className="table-auto w-full text-sm text-left text-gray-700">
                                                        <thead>
                                                          <tr className="border-b">
                                                            <th className="py-2 px-1">
                                                              Name
                                                            </th>
                                                            <th className="py-2 px-1">
                                                              Price
                                                            </th>
                                                            <th className="py-2 px-1">
                                                              Qty
                                                            </th>
                                                            <th className="py-2 px-1">
                                                              Subtotal
                                                            </th>
                                                          </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-200">
                                                          {calcResult.materials.map(
                                                            (
                                                              m: any,
                                                              idx2: number
                                                            ) => {
                                                              const fmObj =
                                                                findFinishingMaterialObj(
                                                                  svc.id,
                                                                  m.external_id
                                                                );
                                                              const hasImage =
                                                                fmObj?.image
                                                                  ?.length
                                                                  ? true
                                                                  : false;
                                                              const isClientOwned =
                                                                clientOwnedMaterials[
                                                                  svc.id
                                                                ]?.has(
                                                                  m.external_id
                                                                );
                                                              let rowClass = "";
                                                              if (
                                                                isClientOwned
                                                              ) {
                                                                rowClass =
                                                                  "border border-red-500 bg-red-50";
                                                              } else if (
                                                                hasImage
                                                              ) {
                                                                rowClass =
                                                                  "border bg-white cursor-pointer";
                                                              }
                                                              return (
                                                                <tr
                                                                  key={`${m.external_id}-${idx2}`}
                                                                  className={`last:border-0 ${rowClass}`}
                                                                  onClick={() => {
                                                                    if (
                                                                      !isClientOwned &&
                                                                      hasImage
                                                                    ) {
                                                                      let foundSection:
                                                                        | string
                                                                        | null =
                                                                        null;
                                                                      const fmData =
                                                                        finishingMaterialsMap[
                                                                          svc.id
                                                                        ];
                                                                      if (
                                                                        fmData?.sections
                                                                      ) {
                                                                        for (const [
                                                                          sName,
                                                                          arr,
                                                                        ] of Object.entries(
                                                                          fmData.sections
                                                                        )) {
                                                                          if (
                                                                            Array.isArray(
                                                                              arr
                                                                            ) &&
                                                                            arr.some(
                                                                              (
                                                                                xx
                                                                              ) =>
                                                                                xx.external_id ===
                                                                                m.external_id
                                                                            )
                                                                          ) {
                                                                            foundSection =
                                                                              sName;
                                                                            break;
                                                                          }
                                                                        }
                                                                      }
                                                                      setShowModalServiceId(
                                                                        svc.id
                                                                      );
                                                                      setShowModalSectionName(
                                                                        foundSection
                                                                      );
                                                                    }
                                                                  }}
                                                                >
                                                                  <td className="py-3 px-1">
                                                                    {hasImage ? (
                                                                      <div className="flex items-center gap-2">
                                                                        <img
                                                                          src={
                                                                            fmObj?.image
                                                                          }
                                                                          alt={
                                                                            m.name
                                                                          }
                                                                          className="w-8 h-8 object-cover rounded"
                                                                        />
                                                                        <span>
                                                                          {
                                                                            m.name
                                                                          }
                                                                        </span>
                                                                      </div>
                                                                    ) : (
                                                                      m.name
                                                                    )}
                                                                  </td>
                                                                  <td className="py-3 px-1">
                                                                    $
                                                                    {
                                                                      m.cost_per_unit
                                                                    }
                                                                  </td>
                                                                  <td className="py-3 px-1">
                                                                    {m.quantity}
                                                                  </td>
                                                                  <td className="py-3 px-1">
                                                                    ${m.cost}
                                                                  </td>
                                                                </tr>
                                                              );
                                                            }
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
              <div className="w-full">
                <div className="w-full mx-auto">
                  <div
                    className="relative overflow-hidden rounded-xl border border-gray-300 h-32 bg-center bg-cover"
                    style={{
                      backgroundImage: `url(/images/rooms/landscape.jpg)`,
                    }}
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                    <div className="relative z-10 flex items-center justify-center h-full">
                      <SectionBoxTitle className="text-white">
                        For Garden
                      </SectionBoxTitle>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-6 w-full">
                  {Object.keys(gardenSectionsMap).map((sectionName) => {
                    const catIdsSet = gardenSectionsMap[sectionName];
                    if (!catIdsSet?.size) return null;
                    const catIdsArr = Array.from(catIdsSet);

                    return (
                      <div key={sectionName} className="mt-4 w-full">
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

                          const catObj = ALL_CATEGORIES.find(
                            (c) => c.id === catId
                          );
                          const catName = catObj ? catObj.title : catId;

                          return (
                            <div
                              key={catId}
                              className={`p-4 border rounded-xl bg-white mt-4 ${
                                selectedInCat > 0
                                  ? "border-blue-500"
                                  : "border-gray-300"
                              }`}
                            >
                              <button
                                onClick={() => toggleCategory(catId)}
                                className="flex justify-between items-center w-full"
                              >
                                <h3
                                  className={`font-medium text-2xl ${
                                    selectedInCat > 0
                                      ? "text-blue-600"
                                      : "text-black"
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
                                    expandedCategories.has(catId)
                                      ? "rotate-180"
                                      : ""
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

                                    const calcResult =
                                      calculationResultsMap[svc.id];
                                    const finalCost = serviceCosts[svc.id] || 0;
                                    const isBreakdownOpen =
                                      expandedCostBreakdown.has(svc.id);

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
                                              onChange={() =>
                                                toggleService(svc.id)
                                              }
                                              className="sr-only peer"
                                            />
                                            <div className="w-[50px] h-[26px] bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors duration-300"></div>
                                            <div className="absolute top-[2px] left-[2px] w-[22px] h-[22px] bg-white rounded-full shadow-md peer-checked:translate-x-[24px] transform transition-transform duration-300"></div>
                                          </label>
                                        </div>

                                        {isSelected && (
                                          <>
                                            <ServiceImage serviceId={svc.id} />
                                            {svc.description && (
                                              <p className="text-sm text-gray-500">
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
                                                    setManualInputValue(
                                                      (old) => ({
                                                        ...old,
                                                        [svc.id]: "",
                                                      })
                                                    )
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
                                              <div className="flex items-center gap-2">
                                                <span className="text-lg text-blue-600 font-medium text-right">
                                                  $
                                                  {formatWithSeparator(
                                                    finalCost
                                                  )}
                                                </span>
                                              </div>
                                            </div>

                                            {/* "Details" button => below, right for phone/tablet */}
                                            <div className="mt-2 flex justify-end">
                                              <button
                                                onClick={() =>
                                                  toggleCostBreakdown(svc.id)
                                                }
                                                className={`text-blue-500 text-sm ${
                                                  isBreakdownOpen
                                                    ? ""
                                                    : "underline"
                                                }`}
                                              >
                                                Details
                                              </button>
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
                                                      Materials, tools &amp;
                                                      equipment
                                                    </span>
                                                    <span>
                                                      {calcResult.material_cost
                                                        ? `$${calcResult.material_cost}`
                                                        : "—"}
                                                    </span>
                                                  </div>
                                                </div>

                                                {Array.isArray(
                                                  calcResult.materials
                                                ) &&
                                                  calcResult.materials.length >
                                                    0 && (
                                                    <div className="mt-2">
                                                      <table className="table-auto w-full text-sm text-left text-gray-700">
                                                        <thead>
                                                          <tr className="border-b">
                                                            <th className="py-2 px-1">
                                                              Name
                                                            </th>
                                                            <th className="py-2 px-1">
                                                              Price
                                                            </th>
                                                            <th className="py-2 px-1">
                                                              Qty
                                                            </th>
                                                            <th className="py-2 px-1">
                                                              Subtotal
                                                            </th>
                                                          </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-200">
                                                          {calcResult.materials.map(
                                                            (
                                                              m: any,
                                                              idx2: number
                                                            ) => {
                                                              const fmObj =
                                                                findFinishingMaterialObj(
                                                                  svc.id,
                                                                  m.external_id
                                                                );
                                                              const hasImage =
                                                                fmObj?.image
                                                                  ?.length
                                                                  ? true
                                                                  : false;
                                                              const isClientOwned =
                                                                clientOwnedMaterials[
                                                                  svc.id
                                                                ]?.has(
                                                                  m.external_id
                                                                );
                                                              let rowClass = "";
                                                              if (
                                                                isClientOwned
                                                              ) {
                                                                rowClass =
                                                                  "border border-red-500 bg-red-50";
                                                              } else if (
                                                                hasImage
                                                              ) {
                                                                rowClass =
                                                                  "border bg-white cursor-pointer";
                                                              }
                                                              return (
                                                                <tr
                                                                  key={`${m.external_id}-${idx2}`}
                                                                  className={`last:border-0 ${rowClass}`}
                                                                  onClick={() => {
                                                                    if (
                                                                      !isClientOwned &&
                                                                      hasImage
                                                                    ) {
                                                                      let foundSection:
                                                                        | string
                                                                        | null =
                                                                        null;
                                                                      const fmData =
                                                                        finishingMaterialsMap[
                                                                          svc.id
                                                                        ];
                                                                      if (
                                                                        fmData?.sections
                                                                      ) {
                                                                        for (const [
                                                                          sName,
                                                                          arr,
                                                                        ] of Object.entries(
                                                                          fmData.sections
                                                                        )) {
                                                                          if (
                                                                            Array.isArray(
                                                                              arr
                                                                            ) &&
                                                                            arr.some(
                                                                              (
                                                                                xx
                                                                              ) =>
                                                                                xx.external_id ===
                                                                                m.external_id
                                                                            )
                                                                          ) {
                                                                            foundSection =
                                                                              sName;
                                                                            break;
                                                                          }
                                                                        }
                                                                      }
                                                                      setShowModalServiceId(
                                                                        svc.id
                                                                      );
                                                                      setShowModalSectionName(
                                                                        foundSection
                                                                      );
                                                                    }
                                                                  }}
                                                                >
                                                                  <td className="py-3 px-1">
                                                                    {hasImage ? (
                                                                      <div className="flex items-center gap-2">
                                                                        <img
                                                                          src={
                                                                            fmObj?.image
                                                                          }
                                                                          alt={
                                                                            m.name
                                                                          }
                                                                          className="w-8 h-8 object-cover rounded"
                                                                        />
                                                                        <span>
                                                                          {
                                                                            m.name
                                                                          }
                                                                        </span>
                                                                      </div>
                                                                    ) : (
                                                                      m.name
                                                                    )}
                                                                  </td>
                                                                  <td className="py-3 px-1">
                                                                    $
                                                                    {
                                                                      m.cost_per_unit
                                                                    }
                                                                  </td>
                                                                  <td className="py-3 px-1">
                                                                    {m.quantity}
                                                                  </td>
                                                                  <td className="py-3 px-1">
                                                                    ${m.cost}
                                                                  </td>
                                                                </tr>
                                                              );
                                                            }
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
          <div className="w-full xl:w-1/2 xl:ml-auto pt-0 space-y-6 mt-8 xl:mt-0">
            {/* Summary Card */}
            <div className="w-full xl:max-w-[500px] ml-auto bg-white p-4 rounded-lg border border-gray-300 overflow-hidden">
              <SectionBoxSubtitle>
                Your {chosenPackage.title}
              </SectionBoxSubtitle>
              {Object.keys(mergedSelected).length === 0 ? (
                <div className="text-left text-gray-500 text-medium mt-4">
                  No services selected.
                </div>
              ) : (
                <>
                  <p className="text-gray-700 mb-4">
                    These are the services you selected, grouped by section
                    &amp; category:
                  </p>

                  <div className="space-y-6">
                    {/* Summary structure => show section -> cat -> items */}
                    {(() => {
                      interface ServiceItem {
                        svcObj: (typeof ALL_SERVICES)[number];
                        qty: number;
                      }
                      return Object.entries(summaryStructure).map(
                        ([sectionName, cats]) => {
                          if (!Object.keys(cats).length) return null;
                          return (
                            <div key={sectionName}>
                              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                {sectionName}
                              </h3>
                              {Object.entries(cats).map(([catId, arr]) => {
                                const catObj = ALL_CATEGORIES.find(
                                  (c) => c.id === catId
                                );
                                const catName = catObj ? catObj.title : catId;
                                if (!arr.length) return null;

                                return (
                                  <div key={catId} className="ml-4 mb-4">
                                    <h4 className="text-lg font-medium text-gray-700 mb-2">
                                      {catName}
                                    </h4>
                                    <ul className="space-y-1">
                                      {arr.map(({ svcObj, qty }) => {
                                        const cost =
                                          serviceCosts[svcObj.id] || 0;
                                        return (
                                          <li
                                            key={svcObj.id}
                                            className="flex justify-between items-center text-sm text-gray-600"
                                          >
                                            <span className="truncate w-1/2 pr-2">
                                              {svcObj.title}
                                            </span>
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
                        }
                      );
                    })()}
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
            <div className="w-full xl:max-w-[500px] ml-auto bg-white p-4 rounded-lg border border-gray-300 overflow-hidden">
              <SectionBoxSubtitle>Home Details</SectionBoxSubtitle>
              <div className="mt-2 space-y-1 text-sm text-gray-700">
                <p>
                  <strong>Address:</strong>{" "}
                  {houseInfo.addressLine ? `${houseInfo.addressLine}.` : "N/A."}
                </p>
                <p>
                  <strong>City / Zip:</strong>{" "}
                  {houseInfo.city
                    ? `${houseInfo.city}, ${houseInfo.zip || "?"}`
                    : "? , ?"}
                </p>
                <p>
                  <strong>Country:</strong>{" "}
                  {houseInfo.country ? `${houseInfo.country}.` : "?."}
                </p>
                <hr className="my-2" />
                <p>
                  <strong>House Type:</strong>{" "}
                  {formatHouseType(houseInfo.houseType)}.
                </p>
                <p>
                  <strong>Floors:</strong> {houseInfo.floors}.
                </p>
                <p>
                  <strong>Square ft:</strong>{" "}
                  {houseInfo.squareFootage > 0
                    ? `${houseInfo.squareFootage}.`
                    : "?."}
                </p>
                <p>
                  <strong>Bedrooms:</strong> {houseInfo.bedrooms}.
                </p>
                <p>
                  <strong>Bathrooms:</strong> {houseInfo.bathrooms}.
                </p>
                <p>
                  <strong>Appliances:</strong> {houseInfo.applianceCount}.
                </p>
                <p>
                  <strong>AC Units:</strong> {houseInfo.airConditioners}.
                </p>
                <p>
                  <strong>Boiler/Heater:</strong>{" "}
                  {houseInfo.hasBoiler
                    ? `${houseInfo.boilerType || "Yes"}.`
                    : "No / None."}
                </p>
                <hr className="my-2" />
                <p>
                  <strong>Garage:</strong>{" "}
                  {houseInfo.hasGarage ? `${houseInfo.garageCount}.` : "No."}
                </p>
                <p>
                  <strong>Yard:</strong>{" "}
                  {houseInfo.hasYard
                    ? `${houseInfo.yardArea} sq ft.`
                    : "No yard/garden."}
                </p>
                <p>
                  <strong>Pool:</strong>{" "}
                  {houseInfo.hasPool
                    ? `${houseInfo.poolArea} sq ft.`
                    : "No pool."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Finishing-material modal => one section at a time */}
      {showModalServiceId &&
        showModalSectionName &&
        finishingMaterialsMap[showModalServiceId] &&
        finishingMaterialsMap[showModalServiceId].sections[
          showModalSectionName
        ] && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-[90vw] h-[90vh] md:w-[80vw] md:h-[80vh] xl:w-[70vw] xl:h-[70vh] overflow-hidden relative flex flex-col">
              {/* Sticky header */}
              <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-xl font-semibold">
                  Choose a finishing material (section {showModalSectionName})
                </h2>
                <button
                  onClick={() => {
                    setShowModalServiceId(null);
                    setShowModalSectionName(null);
                  }}
                  className="text-red-500 border border-red-500 px-2 py-1 rounded"
                >
                  Close
                </button>
              </div>

              {(() => {
                const picksObj =
                  finishingMaterialSelections[showModalServiceId] || {};
                const currentExtId = picksObj[showModalSectionName] || null;
                if (!currentExtId) return null;

                const fmData = finishingMaterialsMap[showModalServiceId];
                if (!fmData) return null;

                const allMats = Object.values(
                  fmData.sections || {}
                ).flat() as any[];
                const curMat = allMats.find(
                  (x: any) => x.external_id === currentExtId
                );
                if (!curMat) return null;

                const curCost = parseFloat(curMat.cost || "0") || 0;
                return (
                  <div className="text-sm text-gray-600 border-b p-4 bg-white sticky top-[61px] z-10">
                    Current material:{" "}
                    <strong>
                      {curMat.name} (${formatWithSeparator(curCost)})
                    </strong>
                    <button
                      onClick={() =>
                        userHasOwnMaterial(showModalServiceId!, currentExtId)
                      }
                      className="ml-4 text-xs text-red-500 border border-red-500 px-2 py-1 rounded"
                    >
                      I have my own (Remove later)
                    </button>
                  </div>
                );
              })()}

              <div className="overflow-auto p-4 flex-1">
                {(() => {
                  const data = finishingMaterialsMap[showModalServiceId];
                  if (!data) {
                    return (
                      <p className="text-sm text-gray-500">No data found.</p>
                    );
                  }
                  const arr = data.sections[showModalSectionName] || [];
                  if (!Array.isArray(arr) || arr.length === 0) {
                    return (
                      <p className="text-sm text-gray-500">
                        No finishing materials in section {showModalSectionName}
                        .
                      </p>
                    );
                  }

                  const picksObj =
                    finishingMaterialSelections[showModalServiceId] || {};
                  const currentExtId = picksObj[showModalSectionName] || null;
                  let currentBaseCost = 0;
                  if (currentExtId) {
                    const fmObj = arr.find(
                      (m: any) => m.external_id === currentExtId
                    );
                    if (fmObj) {
                      currentBaseCost = parseFloat(fmObj.cost || "0") || 0;
                    }
                  }

                  return (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {arr.map((material: any, i: number) => {
                        if (!material.image) return null;
                        const costNum = parseFloat(material.cost || "0") || 0;
                        const isSelected =
                          currentExtId === material.external_id;
                        const diff = costNum - currentBaseCost;
                        let diffStr = "";
                        let diffColor = "";
                        if (diff > 0) {
                          diffStr = `+${formatWithSeparator(diff)}`;
                          diffColor = "text-red-500";
                        } else if (diff < 0) {
                          diffStr = `-${formatWithSeparator(Math.abs(diff))}`;
                          diffColor = "text-green-600";
                        }

                        return (
                          <div
                            key={`${material.external_id}-${i}`}
                            className={`border rounded p-3 flex flex-col items-center cursor-pointer ${
                              isSelected ? "border-blue-500" : "border-gray-300"
                            }`}
                            onClick={() => {
                              pickMaterial(
                                showModalServiceId!,
                                showModalSectionName!,
                                material.external_id
                              );
                            }}
                          >
                            <img
                              src={material.image}
                              alt={material.name}
                              className="w-32 h-32 object-cover rounded"
                            />
                            <h3 className="text-sm font-medium mt-2 text-center line-clamp-2">
                              {material.name}
                            </h3>
                            <p className="text-xs text-gray-700">
                              ${formatWithSeparator(costNum)} /{" "}
                              {material.unit_of_measurement}
                            </p>
                            {diff !== 0 && (
                              <p
                                className={`text-xs mt-1 font-medium ${diffColor}`}
                              >
                                {diffStr}
                              </p>
                            )}
                            {isSelected && (
                              <span className="text-xs text-blue-600 font-semibold mt-1">
                                Currently Selected
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
    </main>
  );
}
