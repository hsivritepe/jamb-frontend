"use client";

import { useState, useEffect, ChangeEvent } from "react";
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

// AddressSection for address, zip, stateName, etc.
import AddressSection from "@/components/ui/AddressSection";

// Reuse PhotosAndDescription for images and extra info
import PhotosAndDescription from "@/components/ui/PhotosAndDescription";

interface FinishingMaterial {
  id: number;
  image?: string;
  unit_of_measurement: string;
  name: string;
  external_id: string;
  cost: string;
}

/** Format numeric values with commas + 2 decimals, e.g. 1,234.56 */
function formatWithSeparator(value: number): string {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(value);
}

/** sessionStorage helpers */
function saveToSession(key: string, value: any) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(key, JSON.stringify(value));
  }
}
function loadFromSession<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  const savedValue = sessionStorage.getItem(key);
  try {
    return savedValue ? JSON.parse(savedValue) : defaultValue;
  } catch (error) {
    console.error(`Error parsing sessionStorage key "${key}":`, error);
    return defaultValue;
  }
}

/** Convert "1-1-1" into "1.1.1" for the server */
function convertServiceIdToApiFormat(serviceId: string) {
  return serviceId.replaceAll("-", ".");
}

/** Read base API URL from env or fallback */
function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://dev.thejamb.com";
}

/** fetchFinishingMaterials: POST /work/finishing_materials */
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
    throw new Error(`Failed to fetch finishing materials (work_code=${workCode}).`);
  }
  return res.json();
}

/** calculatePrice: POST /calculate */
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
    throw new Error(`Failed to calculate price (work_code=${params.work_code}).`);
  }
  return res.json();
}

/**
 * ensureFinishingMaterialsLoaded:
 * If we haven't fetched finishing materials for this service yet, do so,
 * and pick default finishing material in each section if none selected.
 */
async function ensureFinishingMaterialsLoaded(
  serviceId: string,
  finishingMaterialsMapAll: Record<string, { sections: Record<string, FinishingMaterial[]> }>,
  setFinishingMaterialsMapAll: React.Dispatch<
    React.SetStateAction<Record<string, { sections: Record<string, FinishingMaterial[]> }>>
  >,
  finishingMaterialSelections: Record<string, string[]>,
  setFinishingMaterialSelections: React.Dispatch<React.SetStateAction<Record<string, string[]>>>
) {
  try {
    // If not loaded yet => fetch
    if (!finishingMaterialsMapAll[serviceId]) {
      const dot = convertServiceIdToApiFormat(serviceId);
      const data = await fetchFinishingMaterials(dot);

      finishingMaterialsMapAll[serviceId] = data;
      setFinishingMaterialsMapAll({ ...finishingMaterialsMapAll });
    }

    // If none chosen => pick the first in each section
    if (!finishingMaterialSelections[serviceId]) {
      const data = finishingMaterialsMapAll[serviceId];
      if (!data) return;

      const singleSelections: string[] = [];
      for (const arr of Object.values(data.sections || {})) {
        if (Array.isArray(arr) && arr.length > 0) {
          singleSelections.push(arr[0].external_id);
        }
      }
      finishingMaterialSelections[serviceId] = singleSelections;
      setFinishingMaterialSelections({ ...finishingMaterialSelections });
    }
  } catch (err) {
    console.error("Error in ensureFinishingMaterialsLoaded:", err);
  }
}

/**
 * fetchFinishingMaterialsForCategory:
 * For all services in a category, fetch finishing materials if not loaded
 */
async function fetchFinishingMaterialsForCategory(
  services: (typeof ALL_SERVICES)[number][],
  finishingMaterialsMapAll: Record<string, { sections: Record<string, FinishingMaterial[]> }>,
  setFinishingMaterialsMapAll: React.Dispatch<
    React.SetStateAction<Record<string, { sections: Record<string, FinishingMaterial[]> }>>
  >,
  finishingMaterialSelections: Record<string, string[]>,
  setFinishingMaterialSelections: React.Dispatch<React.SetStateAction<Record<string, string[]>>>
) {
  const promises = services.map(async (svc) => {
    if (!finishingMaterialsMapAll[svc.id]) {
      try {
        const dot = convertServiceIdToApiFormat(svc.id);
        const data = await fetchFinishingMaterials(dot);

        finishingMaterialsMapAll[svc.id] = data;
        // pick the first item from each section
        const singleSelections: string[] = [];
        for (const arr of Object.values(data.sections || {})) {
          if (Array.isArray(arr) && arr.length > 0) {
            singleSelections.push(arr[0].external_id);
          }
        }
        finishingMaterialSelections[svc.id] = singleSelections;
      } catch (err) {
        console.error("Error fetching finishing materials:", err);
      }
    }
  });

  try {
    await Promise.all(promises);
    setFinishingMaterialsMapAll({ ...finishingMaterialsMapAll });
    setFinishingMaterialSelections({ ...finishingMaterialSelections });
  } catch (err) {
    console.error("Error fetchFinishingMaterialsForCategory:", err);
  }
}

export default function RoomDetails() {
  const router = useRouter();
  const { location } = useLocation();

  // Basic states
  const [searchQuery, setSearchQuery] = useState<string>(() =>
    loadFromSession("rooms_searchQuery", "")
  );
  const [photos, setPhotos] = useState<string[]>(() =>
    loadFromSession("photos", [])
  );
  const [description, setDescription] = useState<string>(() =>
    loadFromSession("description", "")
  );
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Address states
  const [address, setAddress] = useState<string>(() =>
    loadFromSession("address", "")
  );
  const [zip, setZip] = useState<string>(() => loadFromSession("zip", ""));
  const [stateName, setStateName] = useState<string>(() =>
    loadFromSession("stateName", "")
  );

  // NEW city/country states
  const [city, setCity] = useState<string>(() => loadFromSession("city", ""));
  const [country, setCountry] = useState<string>(() => loadFromSession("country", ""));

  // Save them to session
  useEffect(() => saveToSession("city", city), [city]);
  useEffect(() => saveToSession("country", country), [country]);

  // Selected rooms
  const selectedRooms: string[] = loadFromSession("rooms_selectedSections", []);
  useEffect(() => {
    if (selectedRooms.length === 0) {
      router.push("/rooms");
    }
  }, [selectedRooms, router]);

  // Save to session whenever these change
  useEffect(() => saveToSession("rooms_searchQuery", searchQuery), [searchQuery]);
  useEffect(() => saveToSession("photos", photos), [photos]);
  useEffect(() => saveToSession("description", description), [description]);
  useEffect(() => saveToSession("address", address), [address]);
  useEffect(() => saveToSession("zip", zip), [zip]);
  useEffect(() => saveToSession("stateName", stateName), [stateName]);

  // Merge indoor + outdoor => find chosen rooms
  const allRooms = [...ROOMS.indoor, ...ROOMS.outdoor];
  const chosenRooms = selectedRooms
    .map((roomId) => allRooms.find((r) => r.id === roomId))
    .filter((r): r is Exclude<typeof r, undefined> => r !== undefined);

  // If mismatch => redirect
  useEffect(() => {
    if (chosenRooms.length !== selectedRooms.length) {
      router.push("/rooms");
    }
  }, [chosenRooms, selectedRooms, router]);

  // If no valid rooms => fallback
  if (chosenRooms.length === 0) {
    return <p>Loading...</p>;
  }

  // Build categories & services for each chosen room
  type RoomData = {
    categoriesBySection: Record<string, string[]>;
    categoryServicesMap: Record<string, (typeof ALL_SERVICES)[number][]>;
  };
  const roomsData: Record<string, RoomData> = {};

  for (const room of chosenRooms) {
    const chosenRoomServiceIDs = room.services.map((s) => s.id);

    // 1) figure out categories
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

    // 2) Build cat->services map
    const categoryServicesMap: Record<string, (typeof ALL_SERVICES)[number][]> = {};
    chosenRoomServiceIDs.forEach((serviceId) => {
      const catId = serviceId.split("-").slice(0, 2).join("-");
      if (!categoryServicesMap[catId]) {
        categoryServicesMap[catId] = [];
      }
      const svc = ALL_SERVICES.find((x) => x.id === serviceId);
      if (svc) {
        categoryServicesMap[catId].push(svc);
      }
    });

    // 3) Filter by search query
    if (searchQuery) {
      for (const catId in categoryServicesMap) {
        categoryServicesMap[catId] = categoryServicesMap[catId].filter(
          (svc) =>
            svc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (svc.description &&
              svc.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }
    }

    roomsData[room.id] = { categoriesBySection, categoryServicesMap };
  }

  // Our main selection state => { [roomId]: { [serviceId]: quantity } }
  const [selectedServicesState, setSelectedServicesState] = useState<
    Record<string, Record<string, number>>
  >(() => loadFromSession("rooms_selectedServicesWithQuantity", {}));

  useEffect(() => {
    saveToSession("rooms_selectedServicesWithQuantity", selectedServicesState);
  }, [selectedServicesState]);

  // We'll store user typed quantity strings
  const [manualInputValue, setManualInputValue] = useState<Record<string, string | null>>({});

  // finishingMaterialsMapAll => (serviceId -> { sections: Record<string, FinishingMaterial[]> })
  const [finishingMaterialsMapAll, setFinishingMaterialsMapAll] = useState<
    Record<string, { sections: Record<string, FinishingMaterial[]> }>
  >({});

  // finishingMaterialSelections => (serviceId -> string[] of external_ids)
  const [finishingMaterialSelections, setFinishingMaterialSelections] = useState<
    Record<string, string[]>
  >({});

  // For storing final cost per service
  const [serviceCosts, setServiceCosts] = useState<Record<string, number>>({});
  // For storing full JSON from /calculate
  const [calculationResultsMap, setCalculationResultsMap] = useState<Record<string, any>>({});

  // We'll track expanded categories per room
  const [expandedCategoriesByRoom, setExpandedCategoriesByRoom] = useState<
    Record<string, Set<string>>
  >({});

  // We'll track expanded details for cost breakdown
  const [expandedServiceDetails, setExpandedServiceDetails] = useState<Set<string>>(new Set());

  // clientOwnedMaterials => highlight if user already owns that finishing material
  const [clientOwnedMaterials, setClientOwnedMaterials] = useState<Record<string, Set<string>>>({});

  /** expand/collapse a category in a specific room */
  function toggleCategory(roomId: string, catId: string) {
    setExpandedCategoriesByRoom((prev) => {
      const next = { ...prev };
      const expansions = next[roomId] ? new Set(next[roomId]) : new Set<string>();
      if (expansions.has(catId)) {
        expansions.delete(catId);
      } else {
        expansions.add(catId);

        // load finishing materials for all services in this cat
        const { categoryServicesMap } = roomsData[roomId];
        const services = categoryServicesMap[catId] || [];
        fetchFinishingMaterialsForCategory(
          services,
          finishingMaterialsMapAll,
          setFinishingMaterialsMapAll,
          finishingMaterialSelections,
          setFinishingMaterialSelections
        );
      }
      next[roomId] = expansions;
      return next;
    });
  }

  async function handleServiceToggle(roomId: string, serviceId: string) {
    const roomServices = { ...(selectedServicesState[roomId] || {}) };
    const isOn = !!roomServices[serviceId];

    if (isOn) {
      // Turn OFF => remove references
      delete roomServices[serviceId];

      const fmCopy = { ...finishingMaterialSelections };
      delete fmCopy[serviceId];
      setFinishingMaterialSelections(fmCopy);

      setManualInputValue((old) => {
        const copy = { ...old };
        delete copy[serviceId];
        return copy;
      });

      setCalculationResultsMap((old) => {
        const copy = { ...old };
        delete copy[serviceId];
        return copy;
      });
      setServiceCosts((old) => {
        const copy = { ...old };
        delete copy[serviceId];
        return copy;
      });
      setClientOwnedMaterials((old) => {
        const copy = { ...old };
        delete copy[serviceId];
        return copy;
      });
    } else {
      // Turn ON => quantity = minQ (fixed)
      const foundService = ALL_SERVICES.find((s) => s.id === serviceId);
      const minQ = foundService?.min_quantity ?? 1;

      roomServices[serviceId] = minQ;
      // ensure finishing materials are loaded
      await ensureFinishingMaterialsLoaded(
        serviceId,
        finishingMaterialsMapAll,
        setFinishingMaterialsMapAll,
        finishingMaterialSelections,
        setFinishingMaterialSelections
      );
      // Also update manualInputValue to show minQ if it's > 1
      setManualInputValue((mOld) => ({ ...mOld, [serviceId]: String(minQ) }));
    }

    setSelectedServicesState((old) => ({
      ...old,
      [roomId]: roomServices,
    }));
    setWarningMessage(null);
  }

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
    const curVal = roomServices[serviceId] || minQ;
    let nextVal = increment ? curVal + 1 : curVal - 1;
    if (nextVal < minQ) nextVal = minQ;
    if (nextVal > maxQ) {
      nextVal = maxQ;
      setWarningMessage(`Maximum quantity for "${found.title}" is ${maxQ}.`);
    }

    roomServices[serviceId] = unit === "each" ? Math.round(nextVal) : nextVal;

    setSelectedServicesState((old) => ({
      ...old,
      [roomId]: roomServices,
    }));
    setManualInputValue((old) => ({ ...old, [serviceId]: null }));
  }

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

    let numericVal = parseFloat(value.replace(/,/g, "")) || 0;
    if (numericVal < minQ) numericVal = minQ;
    if (numericVal > maxQ) {
      numericVal = maxQ;
      setWarningMessage(`Maximum quantity for "${found.title}" is ${maxQ}.`);
    }

    const roomServices = { ...(selectedServicesState[roomId] || {}) };
    roomServices[serviceId] = unit === "each" ? Math.round(numericVal) : numericVal;

    setSelectedServicesState((old) => ({
      ...old,
      [roomId]: roomServices,
    }));
  }

  function handleBlurInput(serviceId: string) {
    if (!manualInputValue[serviceId]) {
      setManualInputValue((old) => ({ ...old, [serviceId]: null }));
    }
  }

  function handleClearAll() {
    const ok = window.confirm("Are you sure you want to clear all selections?");
    if (!ok) return;

    const cleared: Record<string, Record<string, number>> = {};
    for (const room of chosenRooms) {
      cleared[room.id] = {};
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

  // Recalculate price whenever user toggles or location changes
  useEffect(() => {
    const { zip, country } = location;
    // If invalid ZIP => skip
    if (country !== "United States" || !/^\d{5}$/.test(zip)) {
      setWarningMessage("Currently, our service is only available for US ZIP codes (5 digits).");
      return;
    }

    // For each room => for each service => recalc
    Object.keys(selectedServicesState).forEach((roomId) => {
      const roomServices = selectedServicesState[roomId];
      Object.keys(roomServices).forEach(async (serviceId) => {
        try {
          const quantity = roomServices[serviceId];
          const finishingIds = finishingMaterialSelections[serviceId] || [];
          const foundSvc = ALL_SERVICES.find((x) => x.id === serviceId);
          if (!foundSvc) return;
          const dot = convertServiceIdToApiFormat(serviceId);

          // Ensure finishing materials are loaded
          await ensureFinishingMaterialsLoaded(
            serviceId,
            finishingMaterialsMapAll,
            setFinishingMaterialsMapAll,
            finishingMaterialSelections,
            setFinishingMaterialSelections
          );

          // call /calculate
          const resp = await calculatePrice({
            work_code: dot,
            zipcode: zip,
            unit_of_measurement: foundSvc.unit_of_measurement || "each",
            square: quantity,
            finishing_materials: finishingIds,
          });

          const labor = parseFloat(resp.work_cost) || 0;
          const mat = parseFloat(resp.material_cost) || 0;
          const tot = labor + mat;

          setServiceCosts((old) => ({ ...old, [serviceId]: tot }));
          setCalculationResultsMap((old) => ({ ...old, [serviceId]: resp }));
        } catch (err) {
          console.error("Error calculating price:", err);
        }
      });
    });
  }, [
    selectedServicesState,
    finishingMaterialSelections,
    location,
    finishingMaterialsMapAll,
    setFinishingMaterialsMapAll,
    setFinishingMaterialSelections,
  ]);

  function calculateTotalAllRooms() {
    let sum = 0;
    for (const val of Object.values(serviceCosts)) {
      sum += val;
    }
    return sum;
  }

  function handleNext() {
    // Check if ANY service is chosen
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

    // Flatten all selected service IDs
    const allSelectedServices: string[] = [];
    for (const roomId of Object.keys(selectedServicesState)) {
      allSelectedServices.push(...Object.keys(selectedServicesState[roomId]));
    }
    saveToSession("rooms_selectedServices", allSelectedServices);

    // We also store city/country so the next page can read them
    saveToSession("city", city);
    saveToSession("country", country);

    // Go to /rooms/estimate
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

  function findFinishingMaterialObj(serviceId: string, externalId: string): FinishingMaterial | null {
    const data = finishingMaterialsMapAll[serviceId];
    if (!data) return null;
    for (const arr of Object.values(data.sections || {})) {
      if (Array.isArray(arr)) {
        const found = arr.find((x) => x.external_id === externalId);
        if (found) return found;
      }
    }
    return null;
  }

  function pickMaterial(serviceId: string, newExtId: string) {
    finishingMaterialSelections[serviceId] = [newExtId];
    setFinishingMaterialSelections({ ...finishingMaterialSelections });
  }

  function userHasOwnMaterial(serviceId: string, externalId: string) {
    if (!clientOwnedMaterials[serviceId]) {
      clientOwnedMaterials[serviceId] = new Set();
    }
    clientOwnedMaterials[serviceId].add(externalId);
    setClientOwnedMaterials({ ...clientOwnedMaterials });
  }

  // For the finishing-materials modal
  const [showModalServiceId, setShowModalServiceId] = useState<string | null>(null);
  const [showModalSectionName, setShowModalSectionName] = useState<string | null>(null);

  function closeModal() {
    setShowModalServiceId(null);
    setShowModalSectionName(null);
  }

  // Save calculationResultsMap to session
  useEffect(() => {
    saveToSession("calculationResultsMap", calculationResultsMap);
  }, [calculationResultsMap]);

  function getCategoryNameById(catId: string) {
    const c = ALL_CATEGORIES.find((x) => x.id === catId);
    return c ? c.title : catId;
  }

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto">
        <BreadCrumb items={ROOMS_STEPS} />

        <div className="flex justify-between items-start mt-8">
          {chosenRooms.length > 1 ? (
            <SectionBoxTitle>Select Services and Quantity</SectionBoxTitle>
          ) : (
            <SectionBoxTitle>{chosenRooms[0].title}: Services and Quantity</SectionBoxTitle>
          )}
          <Button onClick={handleNext}>Next →</Button>
        </div>

        {/* Clear + no service link */}
        <div className="flex justify-between items-center text-sm text-gray-500 mt-8 w-full max-w-[600px]">
          <span>
            No service?{" "}
            <a href="#" className="text-blue-600 hover:underline focus:outline-none">
              Contact support
            </a>
          </span>
          <button onClick={handleClearAll} className="text-blue-600 hover:underline focus:outline-none">
            Clear
          </button>
        </div>

        {/* Warnings */}
        <div className="h-6 mt-4 text-left">
          {warningMessage && <p className="text-red-500">{warningMessage}</p>}
        </div>

        {/* Search bar */}
        <div className="w-full max-w-[600px] mt-8 mb-4">
          <SearchServices
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            placeholder="Search for services in your selected rooms..."
          />
        </div>

        <div className="container mx-auto relative flex mt-8">
          {/* LEFT: For each chosen room => show categories, services, etc. */}
          <div className="flex-1 space-y-8">
            {chosenRooms.map((room) => {
              const { categoriesBySection, categoryServicesMap } = roomsData[room.id];
              const roomServices = selectedServicesState[room.id] || {};

              return (
                <div key={room.id}>
                  {/* Room image header */}
                  <div className="max-w-[600px] mx-auto">
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

                    {Object.entries(categoriesBySection).map(([sectionName, catIds]) => (
                      <div key={sectionName} className="mb-8 mt-4">
                        <SectionBoxSubtitle>{sectionName}</SectionBoxSubtitle>
                        <div className="flex flex-col gap-4 mt-4">
                          {catIds.map((catId) => {
                            const servicesForCategory = categoryServicesMap[catId] || [];
                            if (servicesForCategory.length === 0) return null;

                            // Check how many are selected
                            const selectedInThisCat = servicesForCategory.filter((svc) =>
                              Object.keys(roomServices).includes(svc.id)
                            ).length;

                            const catName = getCategoryNameById(catId);

                            const expansions = expandedCategoriesByRoom[room.id] || new Set<string>();
                            const isExpanded = expansions.has(catId);

                            return (
                              <div
                                key={catId}
                                className={`p-4 border rounded-xl bg-white ${
                                  selectedInThisCat > 0 ? "border-blue-500" : "border-gray-300"
                                }`}
                              >
                                <button
                                  onClick={() => toggleCategory(room.id, catId)}
                                  className="flex justify-between items-center w-full"
                                >
                                  <h3
                                    className={`font-medium text-2xl ${
                                      selectedInThisCat > 0 ? "text-blue-600" : "text-black"
                                    }`}
                                  >
                                    {catName}
                                    {selectedInThisCat > 0 && (
                                      <span className="text-sm text-gray-500 ml-2">
                                        ({selectedInThisCat} selected)
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
                                      const isSelected = roomServices[svc.id] != null;
                                      const quantity = roomServices[svc.id] || 1;
                                      const rawVal = manualInputValue[svc.id];
                                      const manualVal =
                                        rawVal !== null ? rawVal || "" : quantity.toString();

                                      // We already have the min quantity logic above,
                                      // so here we just add the placeholder = minQ
                                      const foundService = ALL_SERVICES.find((x) => x.id === svc.id);
                                      const minQ = foundService?.min_quantity ?? 1;

                                      const finalCost = serviceCosts[svc.id] || 0;
                                      const calcResult = calculationResultsMap[svc.id];
                                      const detailsExpanded = expandedServiceDetails.has(svc.id);

                                      return (
                                        <div key={svc.id} className="space-y-2">
                                          {/* Service row */}
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
                                                onChange={() =>
                                                  handleServiceToggle(room.id, svc.id)
                                                }
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
                                              {/* Quantity controls */}
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
                                                      setManualInputValue((old) => ({
                                                        ...old,
                                                        [svc.id]: "",
                                                      }))
                                                    }
                                                    onBlur={() => handleBlurInput(svc.id)}
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
                                                {/* Show final cost + "Details" */}
                                                <div className="flex items-center gap-2">
                                                  <span className="text-lg text-blue-600 font-medium text-right">
                                                    ${formatWithSeparator(finalCost)}
                                                  </span>
                                                  <button
                                                    onClick={() => toggleServiceDetails(svc.id)}
                                                    className={`text-blue-500 text-sm ml-2 ${
                                                      detailsExpanded ? "" : "underline"
                                                    }`}
                                                  >
                                                    Details
                                                  </button>
                                                </div>
                                              </div>

                                              {/* Cost breakdown if expanded */}
                                              {calcResult && detailsExpanded && (
                                                <div className="mt-4 p-4 bg-gray-50 border rounded">
                                                  <h4 className="text-lg font-semibold text-gray-800 mb-3">
                                                    Cost Breakdown
                                                  </h4>
                                                  <div className="flex flex-col gap-2 mb-4">
                                                    <div className="flex justify-between">
                                                      <span className="text-md font-medium text-gray-700">
                                                        Labor
                                                      </span>
                                                      <span className="text-md font-medium text-gray-700">
                                                        {calcResult.work_cost
                                                          ? `$${calcResult.work_cost}`
                                                          : "—"}
                                                      </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                      <span className="text-md font-medium text-gray-700">
                                                        Material, tools and equipment
                                                      </span>
                                                      <span className="text-md font-medium text-gray-700">
                                                        {calcResult.material_cost
                                                          ? `$${calcResult.material_cost}`
                                                          : "—"}
                                                      </span>
                                                    </div>
                                                  </div>

                                                  {/* Materials table */}
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
                                                              (m: any, i: number) => {
                                                                const fmObj =
                                                                  findFinishingMaterialObj(
                                                                    svc.id,
                                                                    m.external_id
                                                                  );
                                                                const hasImage = fmObj?.image?.length
                                                                  ? true
                                                                  : false;
                                                                const isClientOwned =
                                                                  clientOwnedMaterials[svc.id]?.has(
                                                                    m.external_id
                                                                  );

                                                                let rowClass = "";
                                                                if (isClientOwned) {
                                                                  rowClass =
                                                                    "border border-red-500 bg-red-50";
                                                                } else if (hasImage) {
                                                                  rowClass =
                                                                    "border bg-white cursor-pointer";
                                                                }

                                                                return (
                                                                  <tr
                                                                    key={`${m.external_id}-${i}`}
                                                                    className={`last:border-0 ${rowClass}`}
                                                                    onClick={() => {
                                                                      // If not client-owned + has image => open modal
                                                                      if (!isClientOwned && hasImage) {
                                                                        let foundSection: string | null =
                                                                          null;
                                                                        const fmData =
                                                                          finishingMaterialsMapAll[svc.id];
                                                                        if (fmData?.sections) {
                                                                          for (const [
                                                                            secName,
                                                                            list,
                                                                          ] of Object.entries(
                                                                            fmData.sections
                                                                          )) {
                                                                            if (
                                                                              Array.isArray(list) &&
                                                                              list.some(
                                                                                (xx) =>
                                                                                  xx.external_id ===
                                                                                  m.external_id
                                                                              )
                                                                            ) {
                                                                              foundSection = secName;
                                                                              break;
                                                                            }
                                                                          }
                                                                        }
                                                                        setShowModalServiceId(svc.id);
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
                                                                            src={fmObj?.image}
                                                                            alt={m.name}
                                                                            className="w-8 h-8 object-cover rounded"
                                                                          />
                                                                          <span>{m.name}</span>
                                                                        </div>
                                                                      ) : (
                                                                        m.name
                                                                      )}
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
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT: summary, address, photos, etc. */}
          <div className="w-1/2 ml-auto pt-0 space-y-6">
            {/* Summary */}
            <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden">
              <SectionBoxSubtitle>Summary</SectionBoxSubtitle>

              {(() => {
                // check if there's ANY selection
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

                // Otherwise show a breakdown by room
                return (
                  <>
                    {chosenRooms.map((room) => {
                      const { categoriesBySection, categoryServicesMap } = roomsData[room.id];
                      const roomServices = selectedServicesState[room.id] || {};
                      const hasAny = Object.keys(roomServices).length > 0;
                      if (!hasAny) return null;

                      // sum the final cost from serviceCosts
                      let roomTotal = 0;
                      Object.keys(roomServices).forEach((svcId) => {
                        roomTotal += serviceCosts[svcId] || 0;
                      });

                      return (
                        <div key={room.id} className="mb-6">
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            {room.title}
                          </h3>
                          {Object.entries(categoriesBySection).map(([secName, catIds]) => {
                            const relevantCats = catIds.filter((catId) => {
                              const arr = categoryServicesMap[catId] || [];
                              return arr.some((svc) => roomServices[svc.id] != null);
                            });
                            if (relevantCats.length === 0) return null;

                            return (
                              <div key={secName} className="mb-4 ml-2">
                                <h4 className="text-lg font-medium text-gray-700 mb-2">
                                  {secName}
                                </h4>
                                {relevantCats.map((catId) => {
                                  const catObj = ALL_CATEGORIES.find((x) => x.id === catId);
                                  const catName = catObj ? catObj.title : catId;
                                  const arr = categoryServicesMap[catId] || [];
                                  const chosenServices = arr.filter(
                                    (svc) => roomServices[svc.id] != null
                                  );
                                  if (chosenServices.length === 0) return null;

                                  return (
                                    <div key={catId} className="mb-4 ml-4">
                                      <h5 className="text-md font-medium text-gray-700 mb-2">
                                        {catName}
                                      </h5>
                                      <ul className="space-y-2 pb-4">
                                        {chosenServices.map((svc) => {
                                          const cost = serviceCosts[svc.id] || 0;
                                          const qty = roomServices[svc.id] || 1;
                                          return (
                                            <li
                                              key={svc.id}
                                              className="grid grid-cols-3 gap-2 text-sm text-gray-600"
                                              style={{ gridTemplateColumns: "40% 30% 25%" }}
                                            >
                                              <span>{svc.title}</span>
                                              <span className="text-right">
                                                {qty} {svc.unit_of_measurement}
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
                          })}
                          {/* Show room total */}
                          <div className="flex justify-between items-center mb-2 ml-2">
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
                    {/* overall total */}
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-2xl font-semibold text-gray-800">
                        Subtotal:
                      </span>
                      <span className="text-2xl font-semibold text-blue-600">
                        ${formatWithSeparator(calculateTotalAllRooms())}
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
                  // also setCity/country
                  setAddress(location.city);
                  setCity(location.city || "");      // new
                  setStateName(location.state);
                  setCountry(location.country || ""); // new
                  setZip(location.zip);
                } else {
                  setWarningMessage("Location data is unavailable. Please enter manually.");
                }
              }}
            />

            {/* Photos & Description */}
            <PhotosAndDescription
              photos={photos}
              description={description}
              onSetPhotos={setPhotos}
              onSetDescription={setDescription}
            />
          </div>
        </div>
      </div>

      {/* Modal for finishing materials selection if user clicks an item with an image */}
      {showModalServiceId &&
        showModalSectionName &&
        finishingMaterialsMapAll[showModalServiceId] &&
        finishingMaterialsMapAll[showModalServiceId].sections[showModalSectionName] && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-[700px] h-[750px] overflow-hidden relative flex flex-col">
              {/* Sticky header */}
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
                const currentSel = finishingMaterialSelections[showModalServiceId] || [];
                if (currentSel.length === 0) return null;
                const currentExtId = currentSel[0];
                const curMat = findFinishingMaterialObj(showModalServiceId, currentExtId);
                if (!curMat) return null;

                const curCost = parseFloat(curMat.cost || "0") || 0;
                return (
                  <div className="text-sm text-gray-600 border-b p-4 bg-white sticky top-[61px] z-10">
                    Current material: <strong>{curMat.name}</strong> ($
                    {formatWithSeparator(curCost)})
                    <button
                      onClick={() => userHasOwnMaterial(showModalServiceId, currentExtId)}
                      className="ml-4 text-xs text-red-500 border border-red-500 px-2 py-1 rounded"
                    >
                      I have my own (Remove later)
                    </button>
                  </div>
                );
              })()}

              {/* Scrollable content */}
              <div className="overflow-auto p-4 flex-1">
                {(() => {
                  const data = finishingMaterialsMapAll[showModalServiceId];
                  if (!data) return <p className="text-sm text-gray-500">No data found</p>;

                  const arr = data.sections[showModalSectionName] || [];
                  if (!Array.isArray(arr) || arr.length === 0) {
                    return (
                      <p className="text-sm text-gray-500">
                        No finishing materials in section {showModalSectionName}
                      </p>
                    );
                  }

                  const curSel = finishingMaterialSelections[showModalServiceId] || [];
                  const currentExtId = curSel[0] || null;
                  let currentBaseCost = 0;
                  if (currentExtId) {
                    const cfm = findFinishingMaterialObj(showModalServiceId, currentExtId);
                    if (cfm) currentBaseCost = parseFloat(cfm.cost || "0") || 0;
                  }

                  return (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {arr.map((material, i) => {
                        // show only with image
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
                              finishingMaterialSelections[showModalServiceId] = [
                                material.external_id,
                              ];
                              setFinishingMaterialSelections({ ...finishingMaterialSelections });
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
                              ${formatWithSeparator(costNum)} / {material.unit_of_measurement}
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