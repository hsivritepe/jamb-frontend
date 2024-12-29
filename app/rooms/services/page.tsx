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

// Reuse your existing AddressSection if you have it.
import AddressSection from "@/components/ui/AddressSection";

// Import the existing PhotosAndDescription component that uses `onSetPhotos` and `onSetDescription` props.
import PhotosAndDescription from "@/components/ui/PhotosAndDescription";

// Utility function to format numbers nicely for prices
const formatWithSeparator = (value: number): string =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(value);

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

export default function RoomDetails() {
  const router = useRouter();
  const { location } = useLocation();

  // Basic states: searchQuery, address, description, photos
  const [searchQuery, setSearchQuery] = useState<string>(
    loadFromSession("rooms_searchQuery", "")
  );
  const [address, setAddress] = useState<string>(
    loadFromSession("address", "")
  );
  const [description, setDescription] = useState<string>(
    loadFromSession("description", "")
  );
  const [photos, setPhotos] = useState<string[]>(loadFromSession("photos", []));
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // The list of room IDs the user selected on the first page
  const selectedRooms: string[] = loadFromSession("rooms_selectedSections", []);

  // If no rooms were selected, go back
  useEffect(() => {
    if (selectedRooms.length === 0) {
      router.push("/rooms");
    }
  }, [selectedRooms, router]);

  // Save changes to sessionStorage on state updates
  useEffect(() => saveToSession("rooms_searchQuery", searchQuery), [searchQuery]);
  useEffect(() => saveToSession("address", address), [address]);
  useEffect(() => saveToSession("description", description), [description]);
  useEffect(() => saveToSession("photos", photos), [photos]);

  // Gather all rooms (indoor + outdoor) for quick lookup
  const allRooms = [...ROOMS.indoor, ...ROOMS.outdoor];

  // Filter only the rooms that match the selected IDs
  const chosenRooms = selectedRooms
    .map((roomId) => allRooms.find((r) => r.id === roomId))
    .filter((r): r is Exclude<typeof r, undefined> => r !== undefined);

  // If any selected room wasn't found in ROOMS, redirect back
  useEffect(() => {
    if (chosenRooms.length !== selectedRooms.length) {
      router.push("/rooms");
    }
  }, [chosenRooms, selectedRooms, router]);

  // If still no chosen rooms, show loading or redirect
  if (chosenRooms.length === 0) {
    return <p>Loading...</p>;
  }

  // We'll create a type that holds categoriesBySection and categoryServicesMap for each room
  type RoomData = {
    categoriesBySection: Record<string, string[]>;
    categoryServicesMap: Record<string, (typeof ALL_SERVICES)[number][]>;
  };

  // We'll store that data in roomsData keyed by room.id
  const roomsData: Record<string, RoomData> = {};

  // Prepare the categories and services for each chosen room
  for (const room of chosenRooms) {
    const chosenRoomServiceIDs = room.services.map((s) => s.id);

    // First, figure out the categories that appear in this room
    const categoriesWithSection = room.services
      .map((s) => {
        const catId = s.id.split("-").slice(0, 2).join("-");
        return ALL_CATEGORIES.find((c) => c.id === catId) || null;
      })
      .filter(Boolean) as (typeof ALL_CATEGORIES)[number][];

    // Group these categories by their section name
    const categoriesBySection: Record<string, string[]> = {};
    categoriesWithSection.forEach((cat) => {
      if (!categoriesBySection[cat.section]) {
        categoriesBySection[cat.section] = [];
      }
      if (!categoriesBySection[cat.section].includes(cat.id)) {
        categoriesBySection[cat.section].push(cat.id);
      }
    });

    // Next, map categories to their actual services (IDs)
    const categoryServicesMap: Record<string, (typeof ALL_SERVICES)[number][]> =
      {};
    chosenRoomServiceIDs.forEach((serviceId) => {
      const catId = serviceId.split("-").slice(0, 2).join("-");
      if (!categoryServicesMap[catId]) {
        categoryServicesMap[catId] = [];
      }
      const svc = ALL_SERVICES.find((s) => s.id === serviceId);
      if (svc) {
        categoryServicesMap[catId].push(svc);
      }
    });

    // If there's a search query, filter services by it
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

    roomsData[room.id] = {
      categoriesBySection,
      categoryServicesMap,
    };
  }

  // Our main state for selected services: { [roomId]: { [serviceId]: quantity } }
  const [selectedServicesState, setSelectedServicesState] = useState<
    Record<string, Record<string, number>>
  >(() => loadFromSession("rooms_selectedServicesWithQuantity", {}));

  // Persist changes to session whenever selectedServicesState changes
  useEffect(() => {
    saveToSession("rooms_selectedServicesWithQuantity", selectedServicesState);
  }, [selectedServicesState]);

  // Store manual input for each service ID. This is global, but we only track input for the currently changed service
  const [manualInputValue, setManualInputValue] = useState<
    Record<string, string | null>
  >({});

  // Here we store expansion states for categories on a **per-room** basis:
  // expandedCategoriesByRoom[roomId] = Set<catId>
  const [expandedCategoriesByRoom, setExpandedCategoriesByRoom] = useState<
    Record<string, Set<string>>
  >({});

  // Helper to initialize expansion sets if not present
  function getRoomExpansions(roomId: string): Set<string> {
    if (!expandedCategoriesByRoom[roomId]) {
      expandedCategoriesByRoom[roomId] = new Set<string>();
    }
    return expandedCategoriesByRoom[roomId];
  }

  // Toggle expanded state for a category in a specific room
  function toggleCategory(roomId: string, catId: string) {
    setExpandedCategoriesByRoom((prev) => {
      const newObj = { ...prev };
      const expansions = newObj[roomId]
        ? new Set(newObj[roomId])
        : new Set<string>();
      if (expansions.has(catId)) {
        expansions.delete(catId);
      } else {
        expansions.add(catId);
      }
      newObj[roomId] = expansions;
      return newObj;
    });
  }

  // Helper to retrieve the services object for a room
  function getRoomServices(roomId: string) {
    if (!selectedServicesState[roomId]) {
      selectedServicesState[roomId] = {};
    }
    return selectedServicesState[roomId];
  }

  // Helper to set the services object for a room
  function setRoomServices(roomId: string, services: Record<string, number>) {
    setSelectedServicesState((prev) => ({
      ...prev,
      [roomId]: services,
    }));
  }

  // Handler for toggling a service in a specific room
  const handleServiceToggle = (roomId: string, serviceId: string) => {
    const roomServices = { ...getRoomServices(roomId) };
    if (roomServices[serviceId]) {
      delete roomServices[serviceId];
    } else {
      roomServices[serviceId] = 1;
    }
    setRoomServices(roomId, roomServices);
    setWarningMessage(null);
  };

  // Handler for increment/decrement quantity
  const handleQuantityChange = (
    roomId: string,
    serviceId: string,
    increment: boolean,
    unit: string
  ) => {
    const roomServices = { ...getRoomServices(roomId) };
    const currentValue = roomServices[serviceId] || 1;
    const updatedValue = increment
      ? currentValue + 1
      : Math.max(1, currentValue - 1);

    roomServices[serviceId] =
      unit === "each" ? Math.round(updatedValue) : updatedValue;
    setRoomServices(roomId, roomServices);

    // If quantity changed via plus/minus, reset any manual input
    setManualInputValue((prev) => ({
      ...prev,
      [serviceId]: null,
    }));
  };

  // Handler for manual quantity changes in the text field
  const handleManualQuantityChange = (
    roomId: string,
    serviceId: string,
    value: string,
    unit: string
  ) => {
    setManualInputValue((prev) => ({
      ...prev,
      [serviceId]: value,
    }));

    const numericValue = parseFloat(value.replace(/,/g, "")) || 0;
    if (!isNaN(numericValue)) {
      const roomServices = { ...getRoomServices(roomId) };
      roomServices[serviceId] =
        unit === "each" ? Math.round(numericValue) : numericValue;
      setRoomServices(roomId, roomServices);
    }
  };

  // Handler for onBlur event in the manual input
  const handleBlurInput = (serviceId: string) => {
    if (!manualInputValue[serviceId]) {
      setManualInputValue((prev) => ({
        ...prev,
        [serviceId]: null,
      }));
    }
  };

  // Clear all services in all rooms, plus close all categories
  const handleClearAll = () => {
    // Confirm the action
    const confirmed = window.confirm(
      "Are you sure you want to clear all selections?"
    );
    if (!confirmed) return;

    // Clear all selected services
    const cleared: Record<string, Record<string, number>> = {};
    for (const room of chosenRooms) {
      cleared[room.id] = {};
    }
    setSelectedServicesState(cleared);

    // Reset all expansions
    setExpandedCategoriesByRoom({});
  };

  // Calculate the total for a single room
  const calculateTotalForRoom = (roomId: string): number => {
    let total = 0;
    const roomServices = selectedServicesState[roomId] || {};
    for (const [serviceId, quantity] of Object.entries(roomServices)) {
      const svc = ALL_SERVICES.find((s) => s.id === serviceId);
      if (svc) {
        total += svc.price * (quantity || 1);
      }
    }
    return total;
  };

  // Calculate the overall subtotal for all rooms
  const calculateTotalAllRooms = (): number => {
    let total = 0;
    for (const room of chosenRooms) {
      total += calculateTotalForRoom(room.id);
    }
    return total;
  };

  // Handler for Next → button
  const handleNext = () => {
    // Check if there's at least one service selected
    const anySelected = chosenRooms.some((room) => {
      const roomServices = selectedServicesState[room.id] || {};
      return Object.keys(roomServices).length > 0;
    });

    if (!anySelected) {
      setWarningMessage(
        "Please select at least one service before proceeding."
      );
      return;
    }
    if (!address.trim()) {
      setWarningMessage("Please enter your address before proceeding.");
      return;
    }

    // Collect all selected service IDs across all rooms
    const allSelectedServices: string[] = [];
    for (const room of chosenRooms) {
      const roomServices = selectedServicesState[room.id] || {};
      allSelectedServices.push(...Object.keys(roomServices));
    }
    saveToSession("rooms_selectedServices", allSelectedServices);

    // Go to the estimate page
    router.push("/rooms/estimate");
  };

  // For display of category name
  function getCategoryNameById(catId: string) {
    const categoryObj = ALL_CATEGORIES.find((c) => c.id === catId);
    return categoryObj ? categoryObj.title : catId;
  }

  // For address changes
  const handleAddressChangeLocal = (e: ChangeEvent<HTMLInputElement>) =>
    setAddress(e.target.value);

  // Attempt using location data if available
  const handleUseMyLocation = () => {
    if (location?.city && location?.zip) {
      setAddress(
        `${location.city}, ${location.zip}, ${location.country || ""}`
      );
    } else {
      setWarningMessage("Location data is unavailable. Please enter manually.");
    }
  };

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto">
        {/* Breadcrumb for the rooms flow */}
        <BreadCrumb items={ROOMS_STEPS} />

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

        {/* Clear button with confirmation */}
        <div className="flex justify-between items-center text-sm text-gray-500 mt-8 w-full max-w-[600px]">
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

        {/* Warning message if any */}
        <div className="h-6 mt-4 text-left">
          {warningMessage && <p className="text-red-500">{warningMessage}</p>}
        </div>

        {/* Search Bar for services */}
        <div className="w-full max-w-[600px] mt-8 mb-4">
          <SearchServices
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
            placeholder="Search for services in your selected rooms..."
          />
        </div>

        <div className="container mx-auto relative flex mt-8">
          {/* Left column: one section for each chosen room */}
          <div className="flex-1 space-y-8">
            {chosenRooms.map((room) => {
              const { categoriesBySection, categoryServicesMap } = roomsData[room.id];
              const roomServices = selectedServicesState[room.id] || {};

              return (
                <div key={room.id}>
                  {/* Background image header with room title */}
                  <div className="max-w-[600px] mx-auto">
                    <div
                      className="relative overflow-hidden rounded-xl border border-gray-300 h-32 bg-center bg-cover"
                      style={{
                        backgroundImage: `url(/images/rooms/${room.id}.jpg)`,
                      }}
                    >
                      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                      <div className="relative z-10 flex items-center justify-center h-full">
                        {/* Room title over the image */}
                        <SectionBoxTitle className="text-white">
                          {room.title}
                        </SectionBoxTitle>
                      </div>
                    </div>

                    {/* Display each section of categories for this room */}
                    {Object.entries(categoriesBySection).map(
                      ([sectionName, catIds]) => (
                        <div key={sectionName} className="mb-8 mt-4">
                          <SectionBoxSubtitle>{sectionName}</SectionBoxSubtitle>
                          <div className="flex flex-col gap-4 mt-4">
                            {catIds.map((catId) => {
                              const servicesForCategory =
                                categoryServicesMap[catId] || [];
                              if (servicesForCategory.length === 0) return null;

                              const selectedInThisCategory =
                                servicesForCategory.filter((svc) =>
                                  Object.keys(roomServices).includes(svc.id)
                                ).length;

                              const categoryName = getCategoryNameById(catId);

                              // Check if this category is expanded for this specific room
                              const expandedSet = getRoomExpansions(room.id);
                              const isExpanded = expandedSet.has(catId);

                              return (
                                <div
                                  key={catId}
                                  className={`p-4 border rounded-xl bg-white ${
                                    selectedInThisCategory > 0
                                      ? "border-blue-500"
                                      : "border-gray-300"
                                  }`}
                                >
                                  {/* Toggle expansion for this catId in this specific room */}
                                  <button
                                    onClick={() =>
                                      toggleCategory(room.id, catId)
                                    }
                                    className="flex justify-between items-center w-full"
                                  >
                                    <h3
                                      className={`font-medium text-2xl ${
                                        selectedInThisCategory > 0
                                          ? "text-blue-600"
                                          : "text-black"
                                      }`}
                                    >
                                      {categoryName}
                                      {selectedInThisCategory > 0 && (
                                        <span className="text-sm text-gray-500 ml-2">
                                          ({selectedInThisCategory} selected)
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
                                          roomServices[svc.id] !== undefined;
                                        const quantity =
                                          roomServices[svc.id] || 1;
                                        const manualValue =
                                          manualInputValue[svc.id] !== null
                                            ? manualInputValue[svc.id] || ""
                                            : quantity.toString();

                                        return (
                                          <div
                                            key={svc.id}
                                            className="space-y-2"
                                          >
                                            {/* Row for a single service */}
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
                                                {/* Service description */}
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
                                                      value={manualValue}
                                                      onClick={() =>
                                                        setManualInputValue(
                                                          (prev) => ({
                                                            ...prev,
                                                            [svc.id]: "",
                                                          })
                                                        )
                                                      }
                                                      onBlur={() =>
                                                        handleBlurInput(
                                                          svc.id
                                                        )
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
                                                      placeholder="1"
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
                                                  <span className="text-lg text-blue-600 font-medium text-right">
                                                    $
                                                    {formatWithSeparator(
                                                      svc.price * quantity
                                                    )}
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
                        </div>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right column: summary, address section, photos+description */}
          <div className="w-1/2 ml-auto pt-0 space-y-6">
            {/* Summary */}
            <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden">
              <SectionBoxSubtitle>Summary</SectionBoxSubtitle>
              {chosenRooms.every((room) => {
                const roomServices = selectedServicesState[room.id] || {};
                return Object.keys(roomServices).length === 0;
              }) ? (
                <div className="text-left text-gray-500 text-medium mt-4">
                  No services selected
                </div>
              ) : (
                <>
                  {chosenRooms.map((room) => {
                    const { categoriesBySection, categoryServicesMap } =
                      roomsData[room.id];
                    const roomServices = selectedServicesState[room.id] || {};
                    const hasSelectedInRoom =
                      Object.keys(roomServices).length > 0;
                    if (!hasSelectedInRoom) return null;

                    const roomTotal = Object.entries(roomServices).reduce(
                      (sum, [serviceId, qty]) => {
                        const svc = ALL_SERVICES.find(
                          (s) => s.id === serviceId
                        );
                        return svc ? sum + svc.price * qty : sum;
                      },
                      0
                    );

                    return (
                      <div key={room.id} className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                          {room.title}
                        </h3>
                        {Object.entries(categoriesBySection).map(
                          ([sectionName, catIds]) => {
                            const categoriesWithSelected = catIds.filter(
                              (catId) =>
                                (categoryServicesMap[catId] || []).some(
                                  (svc) => roomServices[svc.id] !== undefined
                                )
                            );
                            if (categoriesWithSelected.length === 0)
                              return null;

                            return (
                              <div key={sectionName} className="mb-4 ml-2">
                                <h4 className="text-lg font-medium text-gray-700 mb-2">
                                  {sectionName}
                                </h4>
                                {categoriesWithSelected.map((catId) => {
                                  const servicesForCategory =
                                    categoryServicesMap[catId] || [];
                                  const chosenServices = servicesForCategory.filter(
                                    (svc) =>
                                      roomServices[svc.id] !== undefined
                                  );
                                  if (chosenServices.length === 0) return null;

                                  const catObj = ALL_CATEGORIES.find(
                                    (c) => c.id === catId
                                  );
                                  const catName = catObj ? catObj.title : catId;

                                  return (
                                    <div key={catId} className="mb-4 ml-4">
                                      <h5 className="text-md font-medium text-gray-700 mb-2">
                                        {catName}
                                      </h5>
                                      <ul className="space-y-2 pb-4">
                                        {chosenServices.map((svc) => {
                                          const quantity =
                                            roomServices[svc.id] || 1;
                                          return (
                                            <li
                                              key={svc.id}
                                              className="grid grid-cols-3 gap-2 text-sm text-gray-600"
                                              style={{
                                                gridTemplateColumns:
                                                  "40% 30% 25%",
                                                width: "100%",
                                              }}
                                            >
                                              <span className="truncate overflow-hidden">
                                                {svc.title}
                                              </span>
                                              <span className="text-right">
                                                {quantity}{" "}
                                                {svc.unit_of_measurement} x $
                                                {formatWithSeparator(svc.price)}
                                              </span>
                                              <span className="text-right">
                                                $
                                                {formatWithSeparator(
                                                  svc.price * quantity
                                                )}
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
                    <span className="text-2xl font-semibold text-gray-800">
                      Subtotal:
                    </span>
                    <span className="text-2xl font-semibold text-blue-600">
                      ${formatWithSeparator(calculateTotalAllRooms())}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Reusable address section */}
            <AddressSection
              address={address}
              onAddressChange={handleAddressChangeLocal}
              onUseMyLocation={handleUseMyLocation}
            />

            {/* Reusable Photos and Description section */}
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