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
import AddressSection from "@/components/ui/AddressSection";
import PhotosAndDescription from "@/components/ui/PhotosAndDescription";

import {
  setSessionItem,
  getSessionItem,
} from "@/utils/session";

/** 
 * Interface for finishing materials returned by /work/finishing_materials
 */
interface FinishingMaterial {
  id: number;
  image?: string;
  unit_of_measurement: string;
  name: string;
  external_id: string;
  cost: string;
}

/**
 * Formats a numeric value with commas and two decimals.
 */
function formatWithSeparator(value: number): string {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(value);
}

/**
 * Replaces hyphens ("1-1-1") with dots ("1.1.1").
 */
function convertServiceIdToApiFormat(serviceId: string) {
  return serviceId.replaceAll("-", ".");
}

/**
 * Returns the base API URL from env variable or a default.
 */
function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://dev.thejamb.com";
}

/**
 * Fetch finishing materials via POST /work/finishing_materials.
 */
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

/**
 * Calls POST /calculate to get labor + materials cost for a service.
 */
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

export default function RoomDetails() {
  const router = useRouter();
  const { location } = useLocation();

  // Basic states
  const [searchQuery, setSearchQuery] = useState<string>(getSessionItem("rooms_searchQuery", ""));
  const [photos, setPhotos] = useState<string[]>(() => getSessionItem("photos", []));
  const [description, setDescription] = useState<string>(getSessionItem("description", ""));
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Address states
  const [address, setAddress] = useState<string>(getSessionItem("address", ""));
  const [zip, setZip] = useState<string>(getSessionItem("zip", ""));
  const [stateName, setStateName] = useState<string>(getSessionItem("stateName", ""));

  // Additional city/country
  const [city, setCity] = useState<string>(getSessionItem("city", ""));
  const [country, setCountry] = useState<string>(getSessionItem("country", ""));

  // Persist new states into session storage
  useEffect(() => setSessionItem("city", city), [city]);
  useEffect(() => setSessionItem("country", country), [country]);

  // Rooms selected from the previous page
  const selectedRooms: string[] = getSessionItem("rooms_selectedSections", []);
  useEffect(() => {
    if (selectedRooms.length === 0) {
      router.push("/rooms");
    }
  }, [selectedRooms, router]);

  // Keep everything in sync with session
  useEffect(() => setSessionItem("rooms_searchQuery", searchQuery), [searchQuery]);
  useEffect(() => setSessionItem("photos", photos), [photos]);
  useEffect(() => setSessionItem("description", description), [description]);
  useEffect(() => setSessionItem("address", address), [address]);
  useEffect(() => setSessionItem("zip", zip), [zip]);
  useEffect(() => setSessionItem("stateName", stateName), [stateName]);

  // Merge all indoor + outdoor rooms
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

  // We'll build data structures to know which categories & services belong to each chosen room
  type RoomData = {
    categoriesBySection: Record<string, string[]>;
    categoryServicesMap: Record<string, (typeof ALL_SERVICES)[number][]>;
  };
  const roomsData: Record<string, RoomData> = {};

  for (const room of chosenRooms) {
    // gather service IDs
    const chosenRoomServiceIDs = room.services.map((s) => s.id);

    // compute categories
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
      // ensure no duplicates
      if (!categoriesBySection[cat.section].includes(cat.id)) {
        categoriesBySection[cat.section].push(cat.id);
      }
    });

    // build cat->services map for this room
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

    // filter by search query
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

  // Main selection => { roomId: { serviceId: quantity } }
  const [selectedServicesState, setSelectedServicesState] = useState<
    Record<string, Record<string, number>>
  >(getSessionItem("rooms_selectedServicesWithQuantity", {}));

  useEffect(() => {
    setSessionItem("rooms_selectedServicesWithQuantity", selectedServicesState);
  }, [selectedServicesState]);

  // For user typed quantity
  const [manualInputValue, setManualInputValue] = useState<Record<string, string | null>>({});

  // finishingMaterialsMapAll => serviceId -> { sections: {...} }
  const [finishingMaterialsMapAll, setFinishingMaterialsMapAll] = useState<
    Record<string, { sections: Record<string, FinishingMaterial[]> }>
  >({});

  // finishingMaterialSelections => serviceId -> array of external_ids
  const [finishingMaterialSelections, setFinishingMaterialSelections] = useState<
    Record<string, string[]>
  >({});

  // cost for each service => (serviceId -> number)
  const [serviceCosts, setServiceCosts] = useState<Record<string, number>>({});
  // full JSON for cost breakdown => (serviceId -> object)
  const [calculationResultsMap, setCalculationResultsMap] = useState<Record<string, any>>({});

  // expanded categories => { roomId: Set<catId> }
  const [expandedCategoriesByRoom, setExpandedCategoriesByRoom] = useState<
    Record<string, Set<string>>
  >({});

  // expanded service details => set of serviceId
  const [expandedServiceDetails, setExpandedServiceDetails] = useState<Set<string>>(new Set());

  // user-owned materials => (serviceId -> Set<externalId>)
  const [clientOwnedMaterials, setClientOwnedMaterials] = useState<Record<string, Set<string>>>({});

  // This is the new "finishingAllLoaded" flag to handle race conditions:
  const [finishingAllLoaded, setFinishingAllLoaded] = useState<boolean>(false);

  /**
   * Step 1: On mount, load finishing materials for all selected services,
   * pick defaults if not present, then set finishingAllLoaded = true
   */
  useEffect(() => {
    async function loadAllFinishingMaterials() {
      try {
        // Gather all serviceId from selectedServicesState
        const allServiceIds: string[] = [];
        Object.values(selectedServicesState).forEach((roomServices) => {
          Object.keys(roomServices).forEach((svcId) => {
            allServiceIds.push(svcId);
          });
        });

        if (allServiceIds.length === 0) {
          // If no services are selected, we're trivially done
          setFinishingAllLoaded(true);
          return;
        }

        // For each serviceId => ensure finishing materials are loaded
        for (const svcId of allServiceIds) {
          if (!finishingMaterialsMapAll[svcId]) {
            try {
              const dot = convertServiceIdToApiFormat(svcId);
              const data = await fetchFinishingMaterials(dot);
              finishingMaterialsMapAll[svcId] = data;

              // If no finishingMaterialSelections => pick the first item in each sub-section
              if (!finishingMaterialSelections[svcId]) {
                const picks: string[] = [];
                for (const arr of Object.values(data.sections || {})) {
                  if (Array.isArray(arr) && arr.length > 0) {
                    picks.push(arr[0].external_id);
                  }
                }
                finishingMaterialSelections[svcId] = picks;
              }
            } catch (err) {
              console.error("Error in loadAllFinishingMaterials:", err);
            }
          }
        }

        setFinishingMaterialsMapAll({ ...finishingMaterialsMapAll });
        setFinishingMaterialSelections({ ...finishingMaterialSelections });
      } catch (err) {
        console.error("Error loading finishing materials globally:", err);
      }
      // done => mark finishingAllLoaded
      setFinishingAllLoaded(true);
    }

    loadAllFinishingMaterials();
  }, []);

  /**
   * Step 2: Recompute cost on toggles, but only if finishingAllLoaded = true
   * and we have a valid ZIP code.
   */
  useEffect(() => {
    // If we haven't loaded finishing materials yet, skip
    if (!finishingAllLoaded) return;

    const { zip: userZip, country } = location;
    if (country !== "United States" || !/^\d{5}$/.test(userZip)) {
      setWarningMessage("Currently, our service is only available for US ZIP codes (5 digits).");
      return;
    }

    Object.keys(selectedServicesState).forEach((roomId) => {
      const roomServices = selectedServicesState[roomId];
      Object.keys(roomServices).forEach(async (serviceId) => {
        try {
          const quantity = roomServices[serviceId];
          const fmSelections = finishingMaterialSelections[serviceId] || [];
          const foundSvc = ALL_SERVICES.find((x) => x.id === serviceId);
          if (!foundSvc) return;
          const dot = convertServiceIdToApiFormat(serviceId);

          // at this point finishing materials are presumably loaded
          const resp = await calculatePrice({
            work_code: dot,
            zipcode: userZip,
            unit_of_measurement: foundSvc.unit_of_measurement || "each",
            square: quantity,
            finishing_materials: fmSelections,
          });

          const laborCost = parseFloat(resp.work_cost) || 0;
          const matCost = parseFloat(resp.material_cost) || 0;
          const total = laborCost + matCost;

          setServiceCosts((old) => ({ ...old, [serviceId]: total }));
          setCalculationResultsMap((old) => ({ ...old, [serviceId]: resp }));
        } catch (err) {
          console.error("Error calculating price:", err);
        }
      });
    });
  }, [
    finishingAllLoaded,
    selectedServicesState,
    finishingMaterialSelections,
    location,
  ]);

  // Save calculationResultsMap to session
  useEffect(() => {
    setSessionItem("calculationResultsMap", calculationResultsMap);
  }, [calculationResultsMap]);

  // Toggling categories in the UI
  function toggleCategory(roomId: string, catId: string) {
    setExpandedCategoriesByRoom((prev) => {
      const next = { ...prev };
      const expansions = next[roomId] ? new Set(next[roomId]) : new Set<string>();
      if (expansions.has(catId)) expansions.delete(catId);
      else expansions.add(catId);
      next[roomId] = expansions;
      return next;
    });
  }

  // Toggling a service
  async function handleServiceToggle(roomId: string, serviceId: string) {
    const roomServices = { ...(selectedServicesState[roomId] || {}) };
    const isOn = !!roomServices[serviceId];

    if (isOn) {
      // Turn off => remove references
      delete roomServices[serviceId];

      const fmCopy = { ...finishingMaterialSelections };
      delete fmCopy[serviceId];
      setFinishingMaterialSelections(fmCopy);

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

      // Make sure finishing materials are loaded for this service
      if (!finishingMaterialsMapAll[serviceId]) {
        try {
          const dot = convertServiceIdToApiFormat(serviceId);
          const data = await fetchFinishingMaterials(dot);
          finishingMaterialsMapAll[serviceId] = data;
          setFinishingMaterialsMapAll({ ...finishingMaterialsMapAll });

          if (!finishingMaterialSelections[serviceId]) {
            const picks: string[] = [];
            for (const arr of Object.values(data.sections || {})) {
              if (Array.isArray(arr) && arr.length > 0) {
                picks.push(arr[0].external_id);
              }
            }
            finishingMaterialSelections[serviceId] = picks;
            setFinishingMaterialSelections({ ...finishingMaterialSelections });
          }
        } catch (err) {
          console.error("Error ensuring finishing materials for service:", err);
        }
      }
      setManualInputValue((mOld) => ({ ...mOld, [serviceId]: String(minQ) }));
    }
    setSelectedServicesState((old) => ({ ...old, [roomId]: roomServices }));
    setWarningMessage(null);
  }

  // increment/decrement quantity
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

  // typed quantity
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
    roomServices[serviceId] = unit === "each" ? Math.round(parsedVal) : parsedVal;
    setSelectedServicesState((old) => ({ ...old, [roomId]: roomServices }));
  }

  function handleBlurInput(serviceId: string) {
    if (!manualInputValue[serviceId]) {
      setManualInputValue((old) => ({ ...old, [serviceId]: null }));
    }
  }

  // Clear all
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

  // Calculate total across all rooms
  function calculateTotalAllRooms() {
    let sum = 0;
    for (const cost of Object.values(serviceCosts)) {
      sum += cost;
    }
    return sum;
  }

  // Next => verify everything
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

    // Flatten service IDs
    const allSelected: string[] = [];
    for (const rId of Object.keys(selectedServicesState)) {
      allSelected.push(...Object.keys(selectedServicesState[rId]));
    }
    setSessionItem("rooms_selectedServices", allSelected);

    // Also store city, country
    setSessionItem("city", city);
    setSessionItem("country", country);

    // Navigate
    router.push("/rooms/estimate");
  }

  // toggle details
  function toggleServiceDetails(serviceId: string) {
    setExpandedServiceDetails((old) => {
      const copy = new Set(old);
      if (copy.has(serviceId)) copy.delete(serviceId);
      else copy.add(serviceId);
      return copy;
    });
  }

  // Find finishing material by external_id
  function findFinishingMaterialObj(serviceId: string, externalId: string): FinishingMaterial | null {
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

  // pick a new finishing material
  function pickMaterial(serviceId: string, externalId: string) {
    finishingMaterialSelections[serviceId] = [externalId];
    setFinishingMaterialSelections({ ...finishingMaterialSelections });
  }

  // user has own material
  function userHasOwnMaterial(serviceId: string, externalId: string) {
    if (!clientOwnedMaterials[serviceId]) {
      clientOwnedMaterials[serviceId] = new Set();
    }
    clientOwnedMaterials[serviceId].add(externalId);
    setClientOwnedMaterials({ ...clientOwnedMaterials });
  }

  // finishing-material modal states
  const [showModalServiceId, setShowModalServiceId] = useState<string | null>(null);
  const [showModalSectionName, setShowModalSectionName] = useState<string | null>(null);

  function closeModal() {
    setShowModalServiceId(null);
    setShowModalSectionName(null);
  }

  useEffect(() => {
    setSessionItem("calculationResultsMap", calculationResultsMap);
  }, [calculationResultsMap]);

  function getCategoryNameById(catId: string) {
    const found = ALL_CATEGORIES.find((x) => x.id === catId);
    return found ? found.title : catId;
  }

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto">
        <BreadCrumb items={ROOMS_STEPS} />

        {/* Top row */}
        <div className="flex justify-between items-start mt-8">
          {chosenRooms.length > 1 ? (
            <SectionBoxTitle>Select Services and Quantity</SectionBoxTitle>
          ) : (
            <SectionBoxTitle>
              {chosenRooms[0].title}: Services and Quantity
            </SectionBoxTitle>
          )}
          <Button onClick={handleNext}>Next →</Button>
        </div>

        {/* Clear / No service */}
        <div className="flex justify-between items-center text-sm text-gray-500 mt-8 w-full max-w-[600px]">
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

        {/* Warning */}
        <div className="h-6 mt-4 text-left">
          {warningMessage && <p className="text-red-500">{warningMessage}</p>}
        </div>

        {/* Search */}
        <div className="w-full max-w-[600px] mt-8 mb-4">
          <SearchServices
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            placeholder="Search for services in your selected rooms..."
          />
        </div>

        <div className="container mx-auto relative flex mt-8">
          {/* LEFT column: the chosen rooms */}
          <div className="flex-1 space-y-8">
            {chosenRooms.map((room) => {
              const { categoriesBySection, categoryServicesMap } = roomsData[room.id];
              const roomServices = selectedServicesState[room.id] || {};

              return (
                <div key={room.id}>
                  {/* Banner for the room */}
                  <div className="max-w-[600px] mx-auto">
                    <div
                      className="relative overflow-hidden rounded-xl border border-gray-300 h-32 bg-center bg-cover"
                      style={{
                        backgroundImage: `url(/images/rooms/${room.id}.jpg)`,
                      }}
                    >
                      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                      <div className="relative z-10 flex items-center justify-center h-full">
                        <SectionBoxTitle className="text-white">{room.title}</SectionBoxTitle>
                      </div>
                    </div>

                    {Object.entries(categoriesBySection).map(([sectionName, catIds]) => (
                      <div key={sectionName} className="mb-8 mt-4">
                        <SectionBoxSubtitle>{sectionName}</SectionBoxSubtitle>
                        <div className="flex flex-col gap-4 mt-4">
                          {catIds.map((catId) => {
                            const servicesForCategory = categoryServicesMap[catId] || [];
                            if (servicesForCategory.length === 0) return null;

                            // count how many are selected
                            const selectedCount = servicesForCategory.filter((svc) =>
                              Object.keys(roomServices).includes(svc.id)
                            ).length;

                            const catName = getCategoryNameById(catId);
                            const expansions = expandedCategoriesByRoom[room.id] || new Set();
                            const isExpanded = expansions.has(catId);

                            return (
                              <div
                                key={catId}
                                className={`p-4 border rounded-xl bg-white ${
                                  selectedCount > 0 ? "border-blue-500" : "border-gray-300"
                                }`}
                              >
                                <button
                                  onClick={() => toggleCategory(room.id, catId)}
                                  className="flex justify-between items-center w-full"
                                >
                                  <h3
                                    className={`font-medium text-2xl ${
                                      selectedCount > 0 ? "text-blue-600" : "text-black"
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
                                      const isSelected = roomServices[svc.id] != null;
                                      const quantity = roomServices[svc.id] || 1;
                                      const rawVal = manualInputValue[svc.id];
                                      const manualVal =
                                        rawVal !== null ? rawVal || "" : quantity.toString();
                                      const foundSvc = ALL_SERVICES.find((x) => x.id === svc.id);
                                      const minQ = foundSvc?.min_quantity ?? 1;

                                      const finalCost = serviceCosts[svc.id] || 0;
                                      const calcResult = calculationResultsMap[svc.id];
                                      const detailsExpanded = expandedServiceDetails.has(svc.id);

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
                                                onChange={() => handleServiceToggle(room.id, svc.id)}
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
                                                                      if (!isClientOwned && hasImage) {
                                                                        let foundSection: string | null =
                                                                          null;
                                                                        const fmData =
                                                                          finishingMaterialsMapAll[
                                                                            svc.id
                                                                          ];
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

          {/* RIGHT column => summary, address, photos, description */}
          <div className="w-1/2 ml-auto pt-0 space-y-6">
            {/* Summary */}
            <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden">
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

                return (
                  <>
                    {chosenRooms.map((room) => {
                      const { categoriesBySection, categoryServicesMap } = roomsData[room.id];
                      const roomServices = selectedServicesState[room.id] || {};
                      const hasAny = Object.keys(roomServices).length > 0;
                      if (!hasAny) return null;

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
                                  const chosenServices = arr.filter((svc) => roomServices[svc.id]);
                                  if (chosenServices.length === 0) return null;

                                  return (
                                    <div key={catId} className="mb-4 ml-4">
                                      <h5 className="text-md font-medium text-gray-700 mb-2">
                                        {catName}
                                      </h5>
                                      <ul className="space-y-2 pb-4">
                                        {chosenServices.map((svc) => {
                                          const cost = serviceCosts[svc.id] || 0;
                                          const qty = roomServices[svc.id];
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
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-2xl font-semibold text-gray-800">Subtotal:</span>
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
                  setAddress(location.city);
                  setCity(location.city || "");
                  setStateName(location.state);
                  setCountry(location.country || "");
                  setZip(location.zip);
                } else {
                  setWarningMessage("Location data is unavailable. Please enter manually.");
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

      {/* Modal for finishing materials */}
      {showModalServiceId &&
        showModalSectionName &&
        finishingMaterialsMapAll[showModalServiceId] &&
        finishingMaterialsMapAll[showModalServiceId].sections[showModalSectionName] && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-[700px] h-[750px] overflow-hidden relative flex flex-col">
              {/* Modal header */}
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
                              setFinishingMaterialSelections({
                                ...finishingMaterialSelections,
                              });
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