"use client";

export const dynamic = "force-dynamic";
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

import { setSessionItem, getSessionItem } from "@/utils/session";
import FinishingMaterialsModal from "@/components/FinishingMaterialsModal";
import SurfaceCalculatorModal from "@/components/SurfaceCalculatorModal"; // <-- NEW IMPORT

/**
 * Describes the shape of a finishing material as returned by /work/finishing_materials.
 */
interface FinishingMaterial {
  id: number;
  image?: string;
  unit_of_measurement: string;
  name: string;
  external_id: string;
  cost: string;
}

/** Formats a numeric value with two decimals + comma separators. */
function formatWithSeparator(value: number): string {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(
    value
  );
}

/** Convert "1-1-1" to "1.1.1" so the backend recognizes it. */
function convertServiceIdToApiFormat(serviceId: string) {
  return serviceId.replaceAll("-", ".");
}

/** Returns base API URL or fallback. */
function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://dev.thejamb.com";
}

/** Fetch finishing materials for a single work_code. */
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

/** Calculate price => returns labor + materials cost. */
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

/**
 * A sample image component for a service,
 * using Next.js <Image> with a ratio container.
 */
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

  // Keep these address fields in session
  useEffect(() => setSessionItem("city", city), [city]);
  useEffect(() => setSessionItem("country", country), [country]);
  useEffect(() => setSessionItem("rooms_searchQuery", searchQuery), [searchQuery]);
  useEffect(() => setSessionItem("photos", photos), [photos]);
  useEffect(() => setSessionItem("description", description), [description]);
  useEffect(() => setSessionItem("address", address), [address]);
  useEffect(() => setSessionItem("zip", zip), [zip]);
  useEffect(() => setSessionItem("stateName", stateName), [stateName]);

  // The user-selected room IDs
  const selectedRooms: string[] = getSessionItem("rooms_selectedSections", []);
  useEffect(() => {
    // If no rooms => redirect
    if (selectedRooms.length === 0) {
      router.push("/rooms");
    }
  }, [selectedRooms, router]);

  // Merge indoor/outdoor from ROOMS
  const allRooms = [...ROOMS.indoor, ...ROOMS.outdoor];
  const chosenRooms = selectedRooms
    .map((roomId) => allRooms.find((r) => r.id === roomId))
    .filter((r): r is Exclude<typeof r, undefined> => r !== undefined);

  useEffect(() => {
    // If any mismatch => redirect
    if (chosenRooms.length !== selectedRooms.length) {
      router.push("/rooms");
    }
  }, [chosenRooms, selectedRooms, router]);

  if (chosenRooms.length === 0) {
    return <p>Loading...</p>;
  }

  // Build data => categoriesBySection, categoryServicesMap
  type RoomData = {
    categoriesBySection: Record<string, string[]>;
    categoryServicesMap: Record<string, (typeof ALL_SERVICES)[number][]>;
  };
  const roomsData: Record<string, RoomData> = {};

  // For each chosen room
  for (const room of chosenRooms) {
    const chosenRoomServiceIDs = room.services.map((s) => s.id);

    // 1) build categories => section => catIds
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

    // 2) cat->services
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

    // 3) filter by searchQuery
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

  // selectedServicesState => { roomId: { serviceId: quantity } }
  const [selectedServicesState, setSelectedServicesState] = useState<
    Record<string, Record<string, number>>
  >(getSessionItem("rooms_selectedServicesWithQuantity", {}));

  useEffect(() => {
    setSessionItem("rooms_selectedServicesWithQuantity", selectedServicesState);
  }, [selectedServicesState]);

  // For typed quantity => serviceId => string
  const [manualInputValue, setManualInputValue] = useState<
    Record<string, string | null>
  >({});

  // finishingMaterialsMapAll => { [serviceId]: { sections: {...} } }
  const [finishingMaterialsMapAll, setFinishingMaterialsMapAll] = useState<
    Record<string, { sections: Record<string, FinishingMaterial[]> }>
  >({});

  // finishingMaterialSelections => { [serviceId]: { [sectionName]: externalId } }
  const [finishingMaterialSelections, setFinishingMaterialSelections] =
    useState<Record<string, Record<string, string>>>(
      getSessionItem("finishingMaterialSelections", {})
    );

  useEffect(() => {
    setSessionItem("finishingMaterialSelections", finishingMaterialSelections);
  }, [finishingMaterialSelections]);

  // user-owned materials => serviceId -> set of externalIds
  const [clientOwnedMaterials, setClientOwnedMaterials] = useState<
    Record<string, Set<string>>
  >({});

  // For each service => final cost
  const [serviceCosts, setServiceCosts] = useState<Record<string, number>>({});
  // Detailed cost breakdown => serviceId => object
  const [calculationResultsMap, setCalculationResultsMap] = useState<
    Record<string, any>
  >(getSessionItem("calculationResultsMap", {}));

  useEffect(() => {
    setSessionItem("calculationResultsMap", calculationResultsMap);
  }, [calculationResultsMap]);

  // For toggling categories => { roomId => setOfCatIds }
  const [expandedCategoriesByRoom, setExpandedCategoriesByRoom] = useState<
    Record<string, Set<string>>
  >({});

  // For toggling "Cost Breakdown" => set of serviceIds
  const [expandedServiceDetails, setExpandedServiceDetails] = useState<
    Set<string>
  >(new Set());

  /**
   * Ensure finishing materials are loaded for a single service.
   */
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
    // If no finishingMaterialSelections => pick defaults
    if (!finishingMaterialSelections[serviceId]) {
      const data = finishingMaterialsMapAll[serviceId];
      if (!data) return;
      const newObj: Record<string, string> = {};
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

  /**
   * Load finishing materials for all services in a category if needed.
   */
  async function fetchFinishingMaterialsForCategory(
    services: (typeof ALL_SERVICES)[number][]
  ) {
    try {
      await Promise.all(
        services.map(async (svc) => {
          if (!finishingMaterialsMapAll[svc.id]) {
            const dot = convertServiceIdToApiFormat(svc.id);
            const data = await fetchFinishingMaterials(dot);
            finishingMaterialsMapAll[svc.id] = data;
            // pick default finishing materials
            if (!finishingMaterialSelections[svc.id]) {
              const newObj: Record<string, string> = {};
              for (const [secName, arr] of Object.entries(data.sections || {})) {
                if (Array.isArray(arr) && arr.length > 0) {
                  newObj[secName] = arr[0].external_id;
                }
              }
              finishingMaterialSelections[svc.id] = newObj;
            }
          }
        })
      );
      setFinishingMaterialsMapAll({ ...finishingMaterialsMapAll });
      setFinishingMaterialSelections({ ...finishingMaterialSelections });
    } catch (err) {
      console.error("Error fetchFinishingMaterialsForCategory:", err);
    }
  }

  /**
   * Recompute costs whenever user toggles services or modifies finishing materials or location changes.
   */
  useEffect(() => {
    const { zip: userZip, country } = location;
    if (country !== "United States" || !/^\d{5}$/.test(userZip)) {
      setWarningMessage(
        "Currently, our service is only available for US ZIP codes (5 digits)."
      );
      return;
    }

    // Recompute for each service in each room
    for (const roomId of Object.keys(selectedServicesState)) {
      const roomServices = selectedServicesState[roomId];
      for (const serviceId of Object.keys(roomServices)) {
        (async () => {
          try {
            const quantity = roomServices[serviceId];
            const found = ALL_SERVICES.find((s) => s.id === serviceId);
            if (!found) return;

            // Ensure finishing materials are loaded
            await ensureFinishingMaterialsLoaded(serviceId);

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

  /** Toggle expansion of a category block (room-based). */
  function toggleCategory(roomId: string, catId: string) {
    setExpandedCategoriesByRoom((prev) => {
      const copy = { ...prev };
      const expansions = copy[roomId] ? new Set(copy[roomId]) : new Set<string>();
      if (expansions.has(catId)) expansions.delete(catId);
      else expansions.add(catId);
      copy[roomId] = expansions;
      return copy;
    });
  }

  /** Toggle a service on/off. */
  async function handleServiceToggle(roomId: string, serviceId: string) {
    const roomServices = { ...(selectedServicesState[roomId] || {}) };
    const isOn = !!roomServices[serviceId];

    if (isOn) {
      // remove
      delete roomServices[serviceId];
      // also remove finishing material picks
      const fmCopy = { ...finishingMaterialSelections };
      delete fmCopy[serviceId];
      setFinishingMaterialSelections(fmCopy);

      // remove from manualInputValue, cost map, etc.
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
      // add => default quantity = minQ
      const foundSvc = ALL_SERVICES.find((s) => s.id === serviceId);
      const minQ = foundSvc?.min_quantity ?? 1;
      roomServices[serviceId] = minQ;

      await ensureFinishingMaterialsLoaded(serviceId);

      // initialize manual input
      setManualInputValue((old) => ({ ...old, [serviceId]: String(minQ) }));
    }

    setSelectedServicesState((old) => ({ ...old, [roomId]: roomServices }));
    setWarningMessage(null);
  }

  /** +/- quantity. */
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

  /** typed quantity => store in state, clamp on blur. */
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

  /** if user leaves input empty => revert. */
  function handleBlurInput(serviceId: string) {
    if (!manualInputValue[serviceId]) {
      setManualInputValue((old) => ({ ...old, [serviceId]: null }));
    }
  }

  /** Clear all services from all chosen rooms. */
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

  /** Sum up all serviceCosts. */
  function calculateTotalAllRooms(): number {
    let sum = 0;
    for (const cost of Object.values(serviceCosts)) {
      sum += cost;
    }
    return sum;
  }

  /** Proceed to next => validate. */
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

    // optionally store all service IDs
    const allSelected: string[] = [];
    for (const rId of Object.keys(selectedServicesState)) {
      allSelected.push(...Object.keys(selectedServicesState[rId]));
    }
    setSessionItem("rooms_selectedServices", allSelected);
    setSessionItem("city", city);
    setSessionItem("country", country);

    router.push("/rooms/estimate");
  }

  /** Toggle cost breakdown for a single service. */
  function toggleServiceDetails(serviceId: string) {
    setExpandedServiceDetails((old) => {
      const copy = new Set(old);
      if (copy.has(serviceId)) {
        copy.delete(serviceId);
      } else {
        copy.add(serviceId);
      }
      return copy;
    });
  }

  /** Return a finishing material object by externalId. */
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

  /** pickMaterial => finishingMaterialSelections[serviceId][sectionName] = externalId */
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

  /** userHasOwnMaterial => highlight item in red. */
  function userHasOwnMaterial(serviceId: string, externalId: string) {
    if (!clientOwnedMaterials[serviceId]) {
      clientOwnedMaterials[serviceId] = new Set();
    }
    clientOwnedMaterials[serviceId].add(externalId);
    setClientOwnedMaterials((old) => ({ ...old }));
  }

  // Finishing-materials modal states
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

  // =============== SURFACE CALCULATOR LOGIC ===============
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [calcModalRoomId, setCalcModalRoomId] = useState<string | null>(null);
  const [calcModalServiceId, setCalcModalServiceId] = useState<string | null>(
    null
  );

  /**
   * Opens the surface calculator for a specific (roomId, serviceId).
   */
  function openSurfaceCalc(roomId: string, serviceId: string) {
    setCalcModalRoomId(roomId);
    setCalcModalServiceId(serviceId);
    setShowCalcModal(true);
  }

  /**
   * Called when user clicks "Apply" in the calculator modal => set the new sq ft.
   */
  function handleApplySquareFeet(roomId: string, serviceId: string, sqFeet: number) {
    // Update selectedServicesState
    const roomServices = { ...(selectedServicesState[roomId] || {}) };
    roomServices[serviceId] = sqFeet;
    setSelectedServicesState((old) => ({ ...old, [roomId]: roomServices }));

    // Also update manualInputValue
    setManualInputValue((old) => ({ ...old, [serviceId]: String(sqFeet) }));
  }

  /**
   * Utility to get category name by ID.
   */
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
            <a
              href="#"
              className="text-blue-600 hover:underline focus:outline-none"
            >
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
          {/* LEFT column => show each chosen room */}
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

                              // how many are selected in this cat
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
                                  {/* Toggle category */}
                                  <button
                                    onClick={() => toggleCategory(room.id, catId)}
                                    className="flex justify-between items-center w-full"
                                  >
                                    <h3
                                      className={`font-semibold sm:font-medium text-2xl ${
                                        selectedCount > 0
                                          ? "text-blue-600"
                                          : "text-gray-800"
                                      }`}
                                    >
                                      {catName}
                                      {selectedCount > 0 && (
                                        <span className="text-sm text-gray-500 ml-2">
                                          ({selectedCount} 
                                            <span className="hidden sm:inline"> selected</span>)
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
                                            : String(quantity);

                                        const finalCost =
                                          serviceCosts[svc.id] || 0;
                                        const calcResult =
                                          calculationResultsMap[svc.id];
                                        const detailsExpanded =
                                          expandedServiceDetails.has(svc.id);

                                        // Show "Surface Calc" only if unit = "sq ft"
                                        const showSurfaceCalcButton =
                                          svc.unit_of_measurement === "sq ft";

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

                                                {/* Quantity row */}
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
                                                      placeholder={
                                                        svc.min_quantity
                                                          ? String(svc.min_quantity)
                                                          : "1"
                                                      }
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
                                                      ${formatWithSeparator(finalCost)}
                                                    </span>
                                                  </div>
                                                </div>

                                                {/* Buttons row: optional "Surface Calc" + "Cost Breakdown" */}
                                                <div className="mt-2 mb-3 flex items-center">
                                                  {showSurfaceCalcButton ? (
                                                    <>
                                                      <button
                                                        onClick={() =>
                                                          openSurfaceCalc(
                                                            room.id,
                                                            svc.id
                                                          )
                                                        }
                                                        className="text-blue-600 text-sm font-medium hover:underline mr-auto"
                                                      >
                                                        Surface Calc
                                                      </button>

                                                      <button
                                                        onClick={() =>
                                                          toggleServiceDetails(
                                                            svc.id
                                                          )
                                                        }
                                                        className={`text-blue-600 text-sm font-medium mb-0 ${
                                                          detailsExpanded
                                                            ? ""
                                                            : "underline"
                                                        }`}
                                                      >
                                                        Cost Breakdown
                                                      </button>
                                                    </>
                                                  ) : (
                                                    // If no surface calc => keep cost breakdown on right
                                                    <button
                                                      onClick={() =>
                                                        toggleServiceDetails(svc.id)
                                                      }
                                                      className={`ml-auto text-blue-600 text-sm font-medium mb-0 ${
                                                        detailsExpanded
                                                          ? ""
                                                          : "underline"
                                                      }`}
                                                    >
                                                      Cost Breakdown
                                                    </button>
                                                  )}
                                                </div>

                                                {/* Cost breakdown */}
                                                {calcResult && detailsExpanded && (
                                                  <div className="mt-4 p-2 sm:p-4 bg-gray-50 border rounded">
                                                    <div className="flex flex-col gap-2 mb-4">
                                                      <div className="flex justify-between">
                                                        <span className="text-md font-semibold sm:font-medium text-gray-700">
                                                          Labor
                                                        </span>
                                                        <span className="text-md font-semibold text-gray-700">
                                                          {calcResult.work_cost
                                                            ? `$${calcResult.work_cost}`
                                                            : "—"}
                                                        </span>
                                                      </div>
                                                      <div className="flex justify-between">
                                                        <span className="text-md font-semibold sm:font-medium text-gray-700">
                                                          Materials, tools, equipment
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
                                                                  i: number
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

                                                                  let rowClass =
                                                                    "";
                                                                  if (isClientOwned) {
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
                                                                        // open finishing materials modal
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
                                                                              svc.id
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
                                                                          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                                                                            <img
                                                                              src={
                                                                                fmObj?.image
                                                                              }
                                                                              alt={
                                                                                m.name
                                                                              }
                                                                              className="w-24 h-24 object-cover rounded"
                                                                            />
                                                                            <span className="break-words">
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
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT column => summary + address + photos */}
          <div className="w-full xl:w-1/2 xl:ml-auto pt-0 space-y-6 mt-8 xl:mt-0">
            {/* Summary */}
            <div className="w-full xl:max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden">
              <SectionBoxSubtitle>Summary</SectionBoxSubtitle>
              {(() => {
                // check if anything is selected
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
                              // filter catIds => only ones with selected services
                              const relevantCats = catIds.filter((catId) => {
                                const arr = categoryServicesMap[catId] || [];
                                return arr.some((svc) => roomServices[svc.id]);
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
                                    if (chosenServices.length === 0) return null;

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

      {/* FinishingMaterialsModal => for choosing finishing materials */}
      <FinishingMaterialsModal
        showModalServiceId={showModalServiceId}
        showModalSectionName={showModalSectionName}
        finishingMaterialsMapAll={finishingMaterialsMapAll}
        finishingMaterialSelections={finishingMaterialSelections}
        setFinishingMaterialSelections={setFinishingMaterialSelections}
        closeModal={closeModal}
        userHasOwnMaterial={userHasOwnMaterial}
        formatWithSeparator={formatWithSeparator}
      />

      {/* SurfaceCalculatorModal => for computing sq ft */}
      <SurfaceCalculatorModal
        show={showCalcModal}
        onClose={() => setShowCalcModal(false)}
        serviceId={calcModalServiceId}
        onApplySquareFeet={(svcId, sqFeet) => {
          // we need roomId to set the quantity
          if (!calcModalRoomId || !svcId) return;
          handleApplySquareFeet(calcModalRoomId, svcId, sqFeet);
          setShowCalcModal(false);
        }}
      />
    </main>
  );
}