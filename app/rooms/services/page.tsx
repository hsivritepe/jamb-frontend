"use client";

import { useState, useEffect, ChangeEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import BreadCrumb from "@/components/ui/BreadCrumb";
import SearchServices from "@/components/SearchServices";
import Button from "@/components/ui/Button";
import { SectionBoxTitle } from "@/components/ui/SectionBoxTitle";
import { SectionBoxSubtitle } from "@/components/ui/SectionBoxSubtitle";
import { ROOMS_STEPS } from "@/constants/navigation";
import { ALL_CATEGORIES } from "@/constants/categories";
import { ALL_SERVICES } from "@/constants/services";
import { ROOMS } from "@/constants/rooms";
import { useLocation } from "@/context/LocationContext";
import { ChevronDown } from "lucide-react";
import AddressSection from "@/components/ui/AddressSection";
import PhotosAndDescription from "@/components/ui/PhotosAndDescription";

// Unified session utilities
import { setSessionItem, getSessionItem, clearSession } from "@/utils/session";

interface FinishingMaterial {
  id: number;
  image?: string;
  unit_of_measurement: string;
  name: string;
  external_id: string;
  cost: string;
}

function formatWithSeparator(value: number): string {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(
    value
  );
}

function convertServiceIdToApiFormat(serviceId: string) {
  return serviceId.replaceAll("-", ".");
}

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://dev.thejamb.com";
}

async function fetchFinishingMaterials(workCode: string) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/work/finishing_materials`;

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

/** Example image component with fill and ratio container. */
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
    <div
      className="mb-2 border rounded overflow-hidden relative w-full"
      style={{ paddingBottom: "66.666%" }}
    >
      <Image
        src={imageSrc}
        alt="Service"
        fill
        style={{ objectFit: "cover" }}
        sizes="(max-width: 768px) 100vw,
               (max-width: 1024px) 100vw,
               100vw"
      />
    </div>
  );
}

export default function RoomDetails() {
  const router = useRouter();
  const { location } = useLocation();

  // Basic states
  const [searchQuery, setSearchQuery] = useState<string>(
    getSessionItem("rooms_searchQuery", "")
  );
  const [photos, setPhotos] = useState<string[]>(() =>
    getSessionItem("photos", [])
  );
  const [description, setDescription] = useState<string>(
    getSessionItem("description", "")
  );
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Address states
  const [address, setAddress] = useState<string>(getSessionItem("address", ""));
  const [zip, setZip] = useState<string>(getSessionItem("zip", ""));
  const [stateName, setStateName] = useState<string>(
    getSessionItem("stateName", "")
  );

  // Additional city/country
  const [city, setCity] = useState<string>(getSessionItem("city", ""));
  const [country, setCountry] = useState<string>(getSessionItem("country", ""));

  // Keep these in session
  useEffect(() => setSessionItem("city", city), [city]);
  useEffect(() => setSessionItem("country", country), [country]);
  useEffect(() => setSessionItem("rooms_searchQuery", searchQuery), [searchQuery]);
  useEffect(() => setSessionItem("photos", photos), [photos]);
  useEffect(() => setSessionItem("description", description), [description]);
  useEffect(() => setSessionItem("address", address), [address]);
  useEffect(() => setSessionItem("zip", zip), [zip]);
  useEffect(() => setSessionItem("stateName", stateName), [stateName]);

  // Rooms selected
  const selectedRooms: string[] = getSessionItem("rooms_selectedSections", []);
  useEffect(() => {
    if (selectedRooms.length === 0) {
      router.push("/rooms");
    }
  }, [selectedRooms, router]);

  // Merge indoor/outdoor rooms
  const allRooms = [...ROOMS.indoor, ...ROOMS.outdoor];
  const chosenRooms = selectedRooms
    .map((roomId) => allRooms.find((r) => r.id === roomId))
    .filter((r): r is Exclude<typeof r, undefined> => r !== undefined);

  useEffect(() => {
    if (chosenRooms.length !== selectedRooms.length) {
      router.push("/rooms");
    }
  }, [chosenRooms, selectedRooms, router]);

  if (chosenRooms.length === 0) {
    return <p>Loading...</p>;
  }

  type RoomData = {
    categoriesBySection: Record<string, string[]>;
    categoryServicesMap: Record<string, (typeof ALL_SERVICES)[number][]>;
  };
  const roomsData: Record<string, RoomData> = {};

  for (const room of chosenRooms) {
    const chosenRoomServiceIDs = room.services.map((s) => s.id);

    // categories
    const categoriesWithSection = room.services
      .map((s) => {
        const catId = s.id.split("-").slice(0, 2).join("-");
        return ALL_CATEGORIES.find((c) => c.id === catId) || null;
      })
      .filter(Boolean) as (typeof ALL_CATEGORIES)[number][];

    const categoriesBySection: Record<string, string[]> = {};
    categoriesWithSection.forEach((cat) => {
      if (!categoriesBySection[cat.section]) {
        categoriesBySection[cat.section] = [];
      }
      if (!categoriesBySection[cat.section].includes(cat.id)) {
        categoriesBySection[cat.section].push(cat.id);
      }
    });

    // cat->services
    const categoryServicesMap: Record<string, (typeof ALL_SERVICES)[number][]> =
      {};
    chosenRoomServiceIDs.forEach((serviceId) => {
      const catId = serviceId.split("-").slice(0, 2).join("-");
      if (!categoryServicesMap[catId]) {
        categoryServicesMap[catId] = [];
      }
      const svc = ALL_SERVICES.find((x) => x.id === serviceId);
      if (svc) categoryServicesMap[catId].push(svc);
    });

    // apply searchQuery filter
    if (searchQuery) {
      for (const catId in categoryServicesMap) {
        categoryServicesMap[catId] = categoryServicesMap[catId].filter(
          (svc) =>
            svc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            svc.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
    }

    roomsData[room.id] = { categoriesBySection, categoryServicesMap };
  }

  // Main selection => { roomId: { serviceId: quantity } }
  const [selectedServicesState, setSelectedServicesState] = useState<
    Record<string, Record<string, number>>
  >(getSessionItem("rooms_selectedServicesWithQuantity", {}));

  useEffect(() => {
    setSessionItem("rooms_selectedServicesWithQuantity", selectedServicesState);
  }, [selectedServicesState]);

  // For user typed quantity
  const [manualInputValue, setManualInputValue] = useState<
    Record<string, string | null>
  >({});

  /**
   * Now we store finishing materials for each service as:
   * finishingMaterialsMapAll[serviceId]: { sections: { [sectionName]: FinishingMaterial[] } }
   *
   * finishingMaterialSelections[serviceId] is an object of type:
   *  {
   *    [sectionName]: externalIdOfChosenMaterial
   *  }
   */
  const [finishingMaterialsMapAll, setFinishingMaterialsMapAll] = useState<
    Record<string, { sections: Record<string, FinishingMaterial[]> }>
  >({});

  const [finishingMaterialSelections, setFinishingMaterialSelections] =
    useState<
      Record<
        string,
        {
          [sectionName: string]: string; // external_id
        }
      >
    >(getSessionItem("finishingMaterialSelections", {})); // optional: store in session

  // Keep finishingMaterialSelections in session if desired
  useEffect(() => {
    setSessionItem("finishingMaterialSelections", finishingMaterialSelections);
  }, [finishingMaterialSelections]);

  // user-owned materials => serviceId -> set of externalIds
  const [clientOwnedMaterials, setClientOwnedMaterials] = useState<
    Record<string, Set<string>>
  >({});

  // For each service, we hold a cost => labor + materials
  const [serviceCosts, setServiceCosts] = useState<Record<string, number>>({});
  // Detailed calculation breakdown => serviceId -> object
  const [calculationResultsMap, setCalculationResultsMap] = useState<
    Record<string, any>
  >(getSessionItem("calculationResultsMap", {}));

  useEffect(() => {
    setSessionItem("calculationResultsMap", calculationResultsMap);
  }, [calculationResultsMap]);

  // expanded categories => { roomId => Set of catIds }
  const [expandedCategoriesByRoom, setExpandedCategoriesByRoom] = useState<
    Record<string, Set<string>>
  >({});

  // expanded service details => set of serviceIds
  const [expandedServiceDetails, setExpandedServiceDetails] = useState<
    Set<string>
  >(new Set());

  // Helper: load finishing materials for a single service if missing
  async function ensureFinishingMaterialsLoaded(serviceId: string) {
    if (!finishingMaterialsMapAll[serviceId]) {
      try {
        const dot = convertServiceIdToApiFormat(serviceId);
        const data = await fetchFinishingMaterials(dot);
        finishingMaterialsMapAll[serviceId] = data;
        setFinishingMaterialsMapAll((old) => ({ ...old }));
      } catch (err) {
        console.error("Error in ensureFinishingMaterialsLoaded:", err);
        return;
      }
    }
    // If there's no selection object for this service, initialize
    if (!finishingMaterialSelections[serviceId]) {
      const data = finishingMaterialsMapAll[serviceId];
      if (!data) return;
      const newObj: Record<string, string> = {};
      // For each section, pick the first item if available
      for (const [secName, arr] of Object.entries(data.sections || {})) {
        if (Array.isArray(arr) && arr.length > 0) {
          newObj[secName] = arr[0].external_id;
        }
      }
      setFinishingMaterialSelections((old) => ({
        ...old,
        [serviceId]: newObj,
      }));
    }
  }

  // Load finishing materials for each service in a category
  async function fetchFinishingMaterialsForCategory(
    services: (typeof ALL_SERVICES)[number][]
  ) {
    const promises = services.map(async (svc) => {
      if (!finishingMaterialsMapAll[svc.id]) {
        try {
          const dot = convertServiceIdToApiFormat(svc.id);
          const data = await fetchFinishingMaterials(dot);
          finishingMaterialsMapAll[svc.id] = data;

          // Initialize the selection object for each section if not present
          if (!finishingMaterialSelections[svc.id]) {
            const newObj: Record<string, string> = {};
            for (const [secName, arr] of Object.entries(data.sections || {})) {
              if (Array.isArray(arr) && arr.length > 0) {
                newObj[secName] = arr[0].external_id;
              }
            }
            finishingMaterialSelections[svc.id] = newObj;
          }
        } catch (err) {
          console.error("Error fetching finishing materials:", err);
        }
      }
    });

    try {
      await Promise.all(promises);
      setFinishingMaterialsMapAll((old) => ({ ...old }));
      setFinishingMaterialSelections((old) => ({ ...old }));
    } catch (err) {
      console.error("Error fetchFinishingMaterialsForCategory:", err);
    }
  }

  /**
   * Whenever service toggles or location changes or finishing-material picks change,
   * recalculate cost by calling /calculate with:
   * - The service's chosen finishing materials for *all* sections (flattened).
   */
  useEffect(() => {
    const { zip: userZip, country } = location;
    if (country !== "United States" || !/^\d{5}$/.test(userZip)) {
      setWarningMessage(
        "Currently, our service is only available for US ZIP codes (5 digits)."
      );
      return;
    }

    // For each room, for each service
    for (const roomId of Object.keys(selectedServicesState)) {
      const roomServices = selectedServicesState[roomId];
      for (const serviceId of Object.keys(roomServices)) {
        (async () => {
          try {
            const quantity = roomServices[serviceId];
            const found = ALL_SERVICES.find((s) => s.id === serviceId);
            if (!found) return;

            // Ensure finishing materials are loaded first
            await ensureFinishingMaterialsLoaded(serviceId);

            // Flatten the picks from finishingMaterialSelections[serviceId]
            // example: { walls: "extA", trim: "extB" } => ["extA", "extB"]
            const picksObj = finishingMaterialSelections[serviceId] || {};
            const finishingIds = Object.values(picksObj);

            const dot = convertServiceIdToApiFormat(serviceId);
            const resp = await calculatePrice({
              work_code: dot,
              zipcode: userZip,
              unit_of_measurement: found.unit_of_measurement || "each",
              square: quantity,
              finishing_materials: finishingIds,
            });

            const laborCost = parseFloat(resp.work_cost) || 0;
            const matCost = parseFloat(resp.material_cost) || 0;
            setServiceCosts((old) => ({
              ...old,
              [serviceId]: laborCost + matCost,
            }));
            setCalculationResultsMap((old) => ({ ...old, [serviceId]: resp }));
          } catch (err) {
            console.error("Error calculating price:", err);
          }
        })();
      }
    }
  }, [
    selectedServicesState,
    finishingMaterialSelections,
    location,
    finishingMaterialsMapAll,
  ]);

  /** Expand/collapse a category panel */
  function toggleCategory(roomId: string, catId: string) {
    setExpandedCategoriesByRoom((prev) => {
      const next = { ...prev };
      const expansions = next[roomId]
        ? new Set(next[roomId])
        : new Set<string>();
      if (expansions.has(catId)) expansions.delete(catId);
      else expansions.add(catId);
      next[roomId] = expansions;
      return next;
    });
  }

  /** Turn a service ON/OFF */
  async function handleServiceToggle(roomId: string, serviceId: string) {
    const roomServices = { ...(selectedServicesState[roomId] || {}) };
    const isOn = !!roomServices[serviceId];

    if (isOn) {
      // Turn off
      delete roomServices[serviceId];

      // Clean up finishingMaterialSelections for this service
      const fmCopy = { ...finishingMaterialSelections };
      delete fmCopy[serviceId];
      setFinishingMaterialSelections(fmCopy);

      // Clean up quantity inputs, cost breakdown, etc.
      setManualInputValue((old) => {
        const cpy = { ...old };
        delete cpy[serviceId];
        return cpy;
      });
      setCalculationResultsMap((old) => {
        const cpy = { ...old };
        delete cpy[serviceId];
        return cpy;
      });
      setServiceCosts((old) => {
        const cpy = { ...old };
        delete cpy[serviceId];
        return cpy;
      });
      setClientOwnedMaterials((old) => {
        const cpy = { ...old };
        delete cpy[serviceId];
        return cpy;
      });
    } else {
      // Turn on => set quantity = minQ
      const foundSvc = ALL_SERVICES.find((s) => s.id === serviceId);
      const minQ = foundSvc?.min_quantity ?? 1;
      roomServices[serviceId] = minQ;

      // Load finishing materials
      await ensureFinishingMaterialsLoaded(serviceId);

      // Initialize manual input
      setManualInputValue((mOld) => ({ ...mOld, [serviceId]: String(minQ) }));
    }

    setSelectedServicesState((old) => ({ ...old, [roomId]: roomServices }));
    setWarningMessage(null);
  }

  /** +/- quantity */
  function handleQuantityChange(
    roomId: string,
    serviceId: string,
    increment: boolean,
    unit: string
  ) {
    const found = ALL_SERVICES.find((x) => x.id === serviceId);
    if (!found) return;

    const minQ = found.min_quantity ?? 1;
    const maxQ = found.max_quantity ?? 999999;

    const roomServices = { ...(selectedServicesState[roomId] || {}) };
    const currentVal = roomServices[serviceId] || minQ;

    let newVal = increment ? currentVal + 1 : currentVal - 1;
    if (newVal < minQ) newVal = minQ;
    if (newVal > maxQ) {
      newVal = maxQ;
      setWarningMessage(`Maximum quantity for "${found.title}" is ${maxQ}.`);
    }

    roomServices[serviceId] = unit === "each" ? Math.round(newVal) : newVal;
    setSelectedServicesState((old) => ({ ...old, [roomId]: roomServices }));
    setManualInputValue((old) => ({ ...old, [serviceId]: null }));
  }

  /** user typed quantity */
  function handleManualQuantityChange(
    roomId: string,
    serviceId: string,
    value: string,
    unit: string
  ) {
    setManualInputValue((old) => ({ ...old, [serviceId]: value }));

    const found = ALL_SERVICES.find((x) => x.id === serviceId);
    if (!found) return;

    const minQ = found.min_quantity ?? 1;
    const maxQ = found.max_quantity ?? 999999;

    let parsedVal = parseFloat(value.replace(/,/g, "")) || 0;
    if (parsedVal < minQ) parsedVal = minQ;
    if (parsedVal > maxQ) {
      parsedVal = maxQ;
      setWarningMessage(`Maximum quantity for "${found.title}" is ${maxQ}.`);
    }

    const roomServices = { ...(selectedServicesState[roomId] || {}) };
    roomServices[serviceId] =
      unit === "each" ? Math.round(parsedVal) : parsedVal;
    setSelectedServicesState((old) => ({ ...old, [roomId]: roomServices }));
  }

  /** if user leaves input empty => revert to null in manualInputValue */
  function handleBlurInput(serviceId: string) {
    if (!manualInputValue[serviceId]) {
      setManualInputValue((old) => ({ ...old, [serviceId]: null }));
    }
  }

  /** clear all selections */
  function handleClearAll() {
    const ok = window.confirm("Are you sure you want to clear all selections?");
    if (!ok) return;

    const cleared: Record<string, Record<string, number>> = {};
    for (const r of chosenRooms) {
      cleared[r.id] = {};
    }
    setSelectedServicesState(cleared);
    setExpandedCategoriesByRoom({});
    setFinishingMaterialsMapAll({});
    setFinishingMaterialSelections({});
    setManualInputValue({});
    setCalculationResultsMap({});
    setServiceCosts({});
    setClientOwnedMaterials({});
  }

  function calculateTotalAllRooms() {
    let sum = 0;
    for (const cost of Object.values(serviceCosts)) {
      sum += cost;
    }
    return sum;
  }

  function handleNext() {
    let anySelected = false;
    for (const roomId of Object.keys(selectedServicesState)) {
      if (Object.keys(selectedServicesState[roomId]).length > 0) {
        anySelected = true;
        break;
      }
    }
    if (!anySelected) {
      setWarningMessage("Please select at least one service before proceeding.");
      return;
    }
    if (!address.trim()) {
      setWarningMessage("Please enter your address before proceeding.");
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

    const allSelected: string[] = [];
    for (const rId of Object.keys(selectedServicesState)) {
      allSelected.push(...Object.keys(selectedServicesState[rId]));
    }
    setSessionItem("rooms_selectedServices", allSelected);
    setSessionItem("city", city);
    setSessionItem("country", country);

    router.push("/rooms/estimate");
  }

  function toggleServiceDetails(serviceId: string) {
    setExpandedServiceDetails((old) => {
      const copy = new Set(old);
      if (copy.has(serviceId)) copy.delete(serviceId);
      else copy.add(serviceId);
      return copy;
    });
  }

  /**
   * Return a FinishingMaterial object from finishingMaterialsMapAll by externalId
   */
  function findFinishingMaterialObj(
    serviceId: string,
    externalId: string
  ): FinishingMaterial | null {
    const data = finishingMaterialsMapAll[serviceId];
    if (!data) return null;
    for (const arr of Object.values(data.sections || {})) {
      if (Array.isArray(arr)) {
        const found = arr.find((fm) => fm.external_id === externalId);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * pickMaterial => only updates the chosen section in finishingMaterialSelections[serviceId]
   */
  function pickMaterial(
    serviceId: string,
    sectionName: string,
    externalId: string
  ) {
    const existing = finishingMaterialSelections[serviceId] || {};
    const updated = { ...existing, [sectionName]: externalId };

    setFinishingMaterialSelections((old) => ({
      ...old,
      [serviceId]: updated,
    }));
  }

  function userHasOwnMaterial(serviceId: string, externalId: string) {
    if (!clientOwnedMaterials[serviceId]) {
      clientOwnedMaterials[serviceId] = new Set();
    }
    clientOwnedMaterials[serviceId].add(externalId);
    setClientOwnedMaterials((old) => ({ ...old }));
  }

  // finishing-material modal states
  const [showModalServiceId, setShowModalServiceId] = useState<string | null>(
    null
  );
  const [showModalSectionName, setShowModalSectionName] = useState<
    string | null
  >(null);

  function closeModal() {
    setShowModalServiceId(null);
    setShowModalSectionName(null);
  }

  function getCategoryNameById(catId: string) {
    const found = ALL_CATEGORIES.find((x) => x.id === catId);
    return found ? found.title : catId;
  }

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto">
        <BreadCrumb items={ROOMS_STEPS} />

        {/* Top row */}
        <div className="flex flex-col xl:flex-row justify-between items-start mt-8">
          <div className="w-full xl:w-auto">
            {chosenRooms.length > 1 ? (
              <SectionBoxTitle>Select Services and Quantity</SectionBoxTitle>
            ) : (
              <SectionBoxTitle>
                {chosenRooms[0].title}: Services and Quantity
              </SectionBoxTitle>
            )}
          </div>
          <div className="w-full xl:w-auto flex justify-end mt-2 xl:mt-0">
            <Button onClick={handleNext}>Next →</Button>
          </div>
        </div>

        {/* Clear / No service */}
        <div className="flex justify-between items-center text-sm text-gray-500 mt-8 w-full xl:max-w-[600px]">
          <span>
            No service?{" "}
            <a href="#" className="text-blue-600 hover:underline focus:outline-none">
              Contact support
            </a>
          </span>
          <button
            onClick={handleClearAll}
            className="text-blue-600 hover:underline focus:outline-none"
          >
            Clear
          </button>
        </div>

        {/* Warnings */}
        <div className="h-6 mt-4 text-left">
          {warningMessage && <p className="text-red-500">{warningMessage}</p>}
        </div>

        {/* Search */}
        <div className="w-full xl:max-w-[600px] mt-8 mb-4">
          <SearchServices
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
            placeholder="Search for services in your selected rooms..."
          />
        </div>

        <div className="container mx-auto relative flex flex-col xl:flex-row mt-8">
          {/* LEFT column */}
          <div className="w-full xl:flex-1 space-y-8">
            {chosenRooms.map((room) => {
              const { categoriesBySection, categoryServicesMap } =
                roomsData[room.id];
              const roomServices = selectedServicesState[room.id] || {};

              return (
                <div key={room.id}>
                  {/* Banner */}
                  <div className="md:max-w-full max-w-[600px] mx-0">
                    <div
                      className="relative overflow-hidden rounded-xl border border-gray-300 h-32 bg-center bg-cover"
                      style={{
                        backgroundImage: `url(/images/rooms/${room.id}.jpg)`,
                      }}
                    >
                      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                      <div className="relative z-10 flex items-center justify-center h-full">
                        <SectionBoxTitle className="text-white">
                          {room.title}
                        </SectionBoxTitle>
                      </div>
                    </div>

                    {Object.entries(categoriesBySection).map(
                      ([sectionName, catIds]) => (
                        <div key={sectionName} className="mb-8 mt-4">
                          <SectionBoxSubtitle>{sectionName}</SectionBoxSubtitle>
                          <div className="flex flex-col gap-4 mt-4">
                            {catIds.map((catId) => {
                              const servicesForCategory =
                                categoryServicesMap[catId] || [];
                              if (servicesForCategory.length === 0) return null;

                              const selectedCount = servicesForCategory.filter(
                                (svc) => Object.keys(roomServices).includes(svc.id)
                              ).length;

                              const catName = getCategoryNameById(catId);
                              const expansions =
                                expandedCategoriesByRoom[room.id] || new Set();
                              const isExpanded = expansions.has(catId);

                              return (
                                <div
                                  key={catId}
                                  className={`p-4 border rounded-xl bg-white ${
                                    selectedCount > 0
                                      ? "border-blue-500"
                                      : "border-gray-300"
                                  }`}
                                >
                                  <button
                                    onClick={() =>
                                      toggleCategory(room.id, catId)
                                    }
                                    className="flex justify-between items-center w-full"
                                  >
                                    <h3
                                      className={`font-medium text-2xl ${
                                        selectedCount > 0
                                          ? "text-blue-600"
                                          : "text-black"
                                      }`}
                                    >
                                      {catName}
                                      {selectedCount > 0 && (
                                        <span className="text-sm text-gray-500 ml-2">
                                          ({selectedCount} selected)
                                        </span>
                                      )}
                                    </h3>
                                    <ChevronDown
                                      className={`h-5 w-5 transform transition-transform ${
                                        isExpanded ? "rotate-180" : ""
                                      }`}
                                    />
                                  </button>

                                  {isExpanded && (
                                    <div className="mt-4 flex flex-col gap-3">
                                      {servicesForCategory.map((svc) => {
                                        const isSelected =
                                          roomServices[svc.id] != null;
                                        const quantity =
                                          roomServices[svc.id] || 1;
                                        const rawVal = manualInputValue[svc.id];
                                        const manualVal =
                                          rawVal !== null
                                            ? rawVal || ""
                                            : quantity.toString();
                                        const foundSvc = ALL_SERVICES.find(
                                          (x) => x.id === svc.id
                                        );
                                        const minQ =
                                          foundSvc?.min_quantity ?? 1;

                                        const finalCost =
                                          serviceCosts[svc.id] || 0;
                                        const calcResult =
                                          calculationResultsMap[svc.id];
                                        const detailsExpanded =
                                          expandedServiceDetails.has(svc.id);

                                        return (
                                          <div
                                            key={svc.id}
                                            className="space-y-2"
                                          >
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
                                                    handleServiceToggle(
                                                      room.id,
                                                      svc.id
                                                    )
                                                  }
                                                  className="sr-only peer"
                                                />
                                                <div className="w-[50px] h-[26px] bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors duration-300"></div>
                                                <div className="absolute top-[2px] left-[2px] w-[22px] h-[22px] bg-white rounded-full shadow-md peer-checked:translate-x-[24px] transform transition-transform duration-300"></div>
                                              </label>
                                            </div>

                                            {isSelected && (
                                              <>
                                                <ServiceImage
                                                  serviceId={svc.id}
                                                />

                                                {svc.description && (
                                                  <p className="text-sm text-gray-500">
                                                    {svc.description}
                                                  </p>
                                                )}

                                                {/* Quantity + cost + details button */}
                                                <div className="flex justify-between items-center">
                                                  <div className="flex items-center gap-1">
                                                    <button
                                                      onClick={() =>
                                                        handleQuantityChange(
                                                          room.id,
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
                                                      value={manualVal}
                                                      placeholder={String(minQ)}
                                                      onClick={() =>
                                                        setManualInputValue(
                                                          (old) => ({
                                                            ...old,
                                                            [svc.id]: "",
                                                          })
                                                        )
                                                      }
                                                      onBlur={() =>
                                                        handleBlurInput(svc.id)
                                                      }
                                                      onChange={(e) =>
                                                        handleManualQuantityChange(
                                                          room.id,
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
                                                          room.id,
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

                                                {/* "Details" button */}
                                                <div className="mt-2 flex justify-end">
                                                  <button
                                                    onClick={() =>
                                                      toggleServiceDetails(
                                                        svc.id
                                                      )
                                                    }
                                                    className={`text-blue-600 text-sm font-medium mb-3 ${
                                                      detailsExpanded
                                                        ? ""
                                                        : "underline"
                                                    }`}
                                                  >
                                                    Cost Breakdown
                                                  </button>
                                                </div>

                                                {/* Cost breakdown */}
                                                {calcResult &&
                                                  detailsExpanded && (
                                                    <div className="mt-4 p-4 bg-gray-50 border rounded">
                                                      <div className="flex flex-col gap-2 mb-4">
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
                                                            Material, tools and
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
                                                        calcResult.materials
                                                          .length > 0 && (
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
                                                                    i: number
                                                                  ) => {
                                                                    const fmObj =
                                                                      findFinishingMaterialObj(
                                                                        svc.id,
                                                                        m.external_id
                                                                      );
                                                                    const hasImage =
                                                                      fmObj
                                                                        ?.image
                                                                        ?.length
                                                                        ? true
                                                                        : false;
                                                                    const isClientOwned =
                                                                      clientOwnedMaterials[
                                                                        svc.id
                                                                      ]?.has(
                                                                        m.external_id
                                                                      );

                                                                    let rowClass =
                                                                      "";
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
                                                                        key={`${m.external_id}-${i}`}
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
                                                                              finishingMaterialsMapAll[
                                                                                svc
                                                                                  .id
                                                                              ];
                                                                            if (
                                                                              fmData?.sections
                                                                            ) {
                                                                              for (const [
                                                                                secName,
                                                                                list,
                                                                              ] of Object.entries(
                                                                                fmData.sections
                                                                              )) {
                                                                                if (
                                                                                  Array.isArray(
                                                                                    list
                                                                                  ) &&
                                                                                  list.some(
                                                                                    (
                                                                                      xx
                                                                                    ) =>
                                                                                      xx.external_id ===
                                                                                      m.external_id
                                                                                  )
                                                                                ) {
                                                                                  foundSection =
                                                                                    secName;
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
                                                                        <td className="py-3 px-3">
                                                                          {
                                                                            m.quantity
                                                                          }
                                                                        </td>
                                                                        <td className="py-3 px-3">
                                                                          $
                                                                          {
                                                                            m.cost
                                                                          }
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
                        </div>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT column => summary, address, photos */}
          <div className="w-full xl:w-1/2 xl:ml-auto pt-0 space-y-6 mt-8 xl:mt-0">
            {/* Summary */}
            <div className="w-full xl:max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden">
              <SectionBoxSubtitle>Summary</SectionBoxSubtitle>
              {(() => {
                let anythingSelected = false;
                for (const roomId of Object.keys(selectedServicesState)) {
                  if (Object.keys(selectedServicesState[roomId]).length > 0) {
                    anythingSelected = true;
                    break;
                  }
                }
                if (!anythingSelected) {
                  return (
                    <div className="text-left text-gray-500 text-medium mt-4">
                      No services selected
                    </div>
                  );
                }

                let totalAll = 0;
                return (
                  <>
                    {chosenRooms.map((room) => {
                      const { categoriesBySection, categoryServicesMap } =
                        roomsData[room.id];
                      const roomServices = selectedServicesState[room.id] || {};
                      const hasAny = Object.keys(roomServices).length > 0;
                      if (!hasAny) return null;

                      let roomTotal = 0;
                      Object.keys(roomServices).forEach((svcId) => {
                        roomTotal += serviceCosts[svcId] || 0;
                      });
                      totalAll += roomTotal;

                      return (
                        <div key={room.id} className="mb-6">
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            {room.title}
                          </h3>
                          {Object.entries(categoriesBySection).map(
                            ([secName, catIds]) => {
                              const relevantCats = catIds.filter((catId) => {
                                const arr = categoryServicesMap[catId] || [];
                                return arr.some(
                                  (svc) => roomServices[svc.id] != null
                                );
                              });
                              if (relevantCats.length === 0) return null;

                              return (
                                <div key={secName} className="mb-4 ml-0 sm:ml-2">
                                  <h4 className="text-lg font-medium text-gray-700 mb-2">
                                    {secName}
                                  </h4>
                                  {relevantCats.map((catId) => {
                                    const catObj = ALL_CATEGORIES.find(
                                      (x) => x.id === catId
                                    );
                                    const catName = catObj
                                      ? catObj.title
                                      : catId;
                                    const arr =
                                      categoryServicesMap[catId] || [];
                                    const chosenServices = arr.filter(
                                      (svc) => roomServices[svc.id]
                                    );
                                    if (chosenServices.length === 0)
                                      return null;

                                    return (
                                      <div key={catId} className="mb-4 ml-0 sm:ml-4">
                                        <h5 className="text-md font-medium text-gray-700 mb-2">
                                          {catName}
                                        </h5>
                                        <ul className="space-y-2 pb-4">
                                          {chosenServices.map((svc) => {
                                            const cost =
                                              serviceCosts[svc.id] || 0;
                                            const qty = roomServices[svc.id];
                                            return (
                                              <li
                                                key={svc.id}
                                                className="grid grid-cols-3 gap-2 text-sm text-gray-600"
                                                style={{
                                                  gridTemplateColumns:
                                                    "40% 30% 25%",
                                                }}
                                              >
                                                <span>{svc.title}</span>
                                                <span className="text-right">
                                                  {qty}{" "}
                                                  {svc.unit_of_measurement}
                                                </span>
                                                <span className="text-right">
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
                          )}
                          <div className="flex justify-between items-center mb-2 ml-0 sm:ml-2">
                            <span className="font-medium text-gray-800">
                              {room.title} Total:
                            </span>
                            <span className="font-medium text-blue-600">
                              ${formatWithSeparator(roomTotal)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-2xl font-semibold text-gray-800">
                        Subtotal:
                      </span>
                      <span className="text-2xl font-semibold text-blue-600">
                        ${formatWithSeparator(totalAll)}
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Address */}
            <AddressSection
              address={address}
              onAddressChange={(e) => setAddress(e.target.value)}
              zip={zip}
              onZipChange={(e) => setZip(e.target.value)}
              stateName={stateName}
              onStateChange={(e) => setStateName(e.target.value)}
              onUseMyLocation={() => {
                if (location?.city && location?.state && location?.zip) {
                  setAddress(location.city);
                  setCity(location.city || "");
                  setStateName(location.state);
                  setCountry(location.country || "");
                  setZip(location.zip);
                } else {
                  setWarningMessage(
                    "Location data is unavailable. Please enter manually."
                  );
                }
              }}
            />

            {/* Photos & description */}
            <PhotosAndDescription
              photos={photos}
              description={description}
              onSetPhotos={setPhotos}
              onSetDescription={setDescription}
            />
          </div>
        </div>
      </div>

      {/* Modal for finishing materials (one section at a time) */}
      {showModalServiceId &&
        showModalSectionName &&
        finishingMaterialsMapAll[showModalServiceId] &&
        finishingMaterialsMapAll[showModalServiceId].sections[
          showModalSectionName
        ] && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-[90vw] h-[90vh] md:w-[80vw] md:h-[80vh] lg:w-[70vw] lg:h-[70vh] overflow-hidden relative flex flex-col">
              {/* Header */}
              <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-xl font-semibold">
                  Choose a finishing material (section {showModalSectionName})
                </h2>
                <button
                  onClick={closeModal}
                  className="text-red-500 border border-red-500 px-2 py-1 rounded"
                >
                  Close
                </button>
              </div>

              {(() => {
                // If we haven't initialized any picks for this service, do nothing
                const picksObj = finishingMaterialSelections[showModalServiceId];
                if (!picksObj) return null;

                const currentExtId = picksObj[showModalSectionName] || null;
                if (!currentExtId) return null;

                const curMat = findFinishingMaterialObj(
                  showModalServiceId,
                  currentExtId
                );
                if (!curMat) return null;

                const curCost = parseFloat(curMat.cost || "0") || 0;
                return (
                  <div className="text-sm text-gray-600 border-b p-4 bg-white sticky top-[61px] z-10">
                    Current material: <strong>{curMat.name}</strong> ($
                    {formatWithSeparator(curCost)})
                    <button
                      onClick={() =>
                        userHasOwnMaterial(showModalServiceId, currentExtId)
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
                  const data = finishingMaterialsMapAll[showModalServiceId];
                  if (!data)
                    return (
                      <p className="text-sm text-gray-500">No data found</p>
                    );

                  const arr = data.sections[showModalSectionName] || [];
                  if (!Array.isArray(arr) || arr.length === 0) {
                    return (
                      <p className="text-sm text-gray-500">
                        No finishing materials in section {showModalSectionName}
                      </p>
                    );
                  }

                  const picksObj =
                    finishingMaterialSelections[showModalServiceId] || {};
                  const currentExtId = picksObj[showModalSectionName] || null;
                  let currentBaseCost = 0;
                  if (currentExtId) {
                    const fmObj = findFinishingMaterialObj(
                      showModalServiceId,
                      currentExtId
                    );
                    if (fmObj) {
                      currentBaseCost = parseFloat(fmObj.cost || "0") || 0;
                    }
                  }

                  return (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {arr.map((material, i) => {
                        if (!material.image) return null;
                        const costNum = parseFloat(material.cost || "0") || 0;
                        const isSelected = currentExtId === material.external_id;
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
                              // Only update the one section
                              pickMaterial(
                                showModalServiceId,
                                showModalSectionName,
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
                              <p className={`text-xs mt-1 font-medium ${diffColor}`}>
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