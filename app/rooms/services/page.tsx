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

const formatWithSeparator = (value: number): string =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(value);

const saveToSession = (key: string, value: any) => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(key, JSON.stringify(value));
  }
};

const loadFromSession = (key: string, defaultValue: any) => {
  if (typeof window === 'undefined') return defaultValue;
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

  const [searchQuery, setSearchQuery] = useState<string>(loadFromSession("rooms_searchQuery", ""));
  const [address, setAddress] = useState<string>(loadFromSession("address", ""));
  const [description, setDescription] = useState<string>(loadFromSession("description", ""));
  const [photos, setPhotos] = useState<string[]>(loadFromSession("photos", []));
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const selectedRooms: string[] = loadFromSession("rooms_selectedSections", []);

  useEffect(() => {
    if (selectedRooms.length === 0) {
      router.push("/rooms");
    }
  }, [selectedRooms, router]);

  useEffect(() => saveToSession("rooms_searchQuery", searchQuery), [searchQuery]);
  useEffect(() => saveToSession("address", address), [address]);
  useEffect(() => saveToSession("description", description), [description]);
  useEffect(() => saveToSession("photos", photos), [photos]);

  const allRooms = [...ROOMS.indoor, ...ROOMS.outdoor];
  const chosenRooms = selectedRooms
    .map(roomId => allRooms.find(r => r.id === roomId))
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
    categoryServicesMap: Record<string, typeof ALL_SERVICES[number][]>;
  };

  const roomsData: Record<string, RoomData> = {};

  for (const room of chosenRooms) {
    const chosenRoomServiceIDs = room.services.map(s => s.id);

    const categoriesWithSection = room.services
      .map(s => {
        const catId = s.id.split("-").slice(0,2).join("-");
        return ALL_CATEGORIES.find((c) => c.id === catId) || null;
      })
      .filter(Boolean) as typeof ALL_CATEGORIES[number][];

    const categoriesBySection: Record<string, string[]> = {};
    categoriesWithSection.forEach(cat => {
      if (!categoriesBySection[cat.section]) {
        categoriesBySection[cat.section] = [];
      }
      if (!categoriesBySection[cat.section].includes(cat.id)) {
        categoriesBySection[cat.section].push(cat.id);
      }
    });

    const categoryServicesMap: Record<string, typeof ALL_SERVICES[number][]> = {};
    chosenRoomServiceIDs.forEach((serviceId) => {
      const catId = serviceId.split("-").slice(0,2).join("-");
      if (!categoryServicesMap[catId]) {
        categoryServicesMap[catId] = [];
      }
      const svc = ALL_SERVICES.find(s => s.id === serviceId);
      if (svc) {
        categoryServicesMap[catId].push(svc);
      }
    });

    // Filter by searchQuery
    if (searchQuery) {
      for (const catId in categoryServicesMap) {
        categoryServicesMap[catId] = categoryServicesMap[catId].filter(svc =>
          svc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (svc.description && svc.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }
    }

    roomsData[room.id] = { categoriesBySection, categoryServicesMap };
  }

  // Изменяем структуру selectedServicesState:
  // { [roomId]: { [serviceId]: quantity } }
  const [selectedServicesState, setSelectedServicesState] = useState<Record<string, Record<string, number>>>(
    () => loadFromSession("rooms_selectedServicesWithQuantity", {})
  );

  useEffect(() => {
    saveToSession("rooms_selectedServicesWithQuantity", selectedServicesState);
  }, [selectedServicesState]);

  const [manualInputValue, setManualInputValue] = useState<Record<string, string | null>>({});

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (catId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.has(catId) ? next.delete(catId) : next.add(catId);
      return next;
    });
  };

  function getRoomServices(roomId: string) {
    if (!selectedServicesState[roomId]) {
      selectedServicesState[roomId] = {};
    }
    return selectedServicesState[roomId];
  }

  function setRoomServices(roomId: string, services: Record<string, number>) {
    setSelectedServicesState((prev) => ({
      ...prev,
      [roomId]: services,
    }));
  }

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

  const handleQuantityChange = (roomId: string, serviceId: string, increment: boolean, unit: string) => {
    const roomServices = { ...getRoomServices(roomId) };
    const currentValue = roomServices[serviceId] || 1;
    const updatedValue = increment ? currentValue + 1 : Math.max(1, currentValue - 1);
    roomServices[serviceId] = unit === "each" ? Math.round(updatedValue) : updatedValue;
    setRoomServices(roomId, roomServices);
    setManualInputValue((prev) => ({
      ...prev,
      [serviceId]: null,
    }));
  };

  const handleManualQuantityChange = (roomId: string, serviceId: string, value: string, unit: string) => {
    setManualInputValue((prev) => ({
      ...prev,
      [serviceId]: value,
    }));

    const numericValue = parseFloat(value.replace(/,/g, "")) || 0;
    if (!isNaN(numericValue)) {
      const roomServices = { ...getRoomServices(roomId) };
      roomServices[serviceId] = unit === "each" ? Math.round(numericValue) : numericValue;
      setRoomServices(roomId, roomServices);
    }
  };

  const handleBlurInput = (serviceId: string) => {
    if (!manualInputValue[serviceId]) {
      setManualInputValue((prev) => ({
        ...prev,
        [serviceId]: null,
      }));
    }
  };

  const clearAllSelections = () => {
    const cleared: Record<string, Record<string, number>> = {};
    for (const room of chosenRooms) {
      cleared[room.id] = {};
    }
    setSelectedServicesState(cleared);
  };

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

  const calculateTotalAllRooms = (): number => {
    let total = 0;
    for (const room of chosenRooms) {
      total += calculateTotalForRoom(room.id);
    }
    return total;
  };

  const handleNext = () => {
    const anySelected = chosenRooms.some(room => {
      const roomServices = selectedServicesState[room.id] || {};
      return Object.keys(roomServices).length > 0;
    });

    if (!anySelected) {
      setWarningMessage("Please select at least one service before proceeding.");
      return;
    }
    if (!address.trim()) {
      setWarningMessage("Please enter your address before proceeding.");
      return;
    }

    const allSelectedServices: string[] = [];
    for (const room of chosenRooms) {
      const roomServices = selectedServicesState[room.id] || {};
      allSelectedServices.push(...Object.keys(roomServices));
    }
    saveToSession("rooms_selectedServices", allSelectedServices);

    router.push("/rooms/estimate");
  };

  const handleAddressChange = (e: ChangeEvent<HTMLInputElement>) => setAddress(e.target.value);
  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value);

  const handleUseMyLocation = () => {
    if (location?.city && location?.zip) {
      setAddress(`${location.city}, ${location.zip}, ${location.country || ""}`);
    } else {
      setWarningMessage("Location data is unavailable. Please enter manually.");
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  function getCategoryNameById(catId: string) {
    const categoryObj = ALL_CATEGORIES.find((c) => c.id === catId);
    return categoryObj ? categoryObj.title : catId;
  }

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto">
        <BreadCrumb items={ROOMS_STEPS} />

        <div className="flex justify-between items-start mt-8">
          {chosenRooms.length > 1 ? (
            <SectionBoxTitle>
              Select Services and Quantity
            </SectionBoxTitle>
          ) : (
            <SectionBoxTitle>
              {chosenRooms[0].title}: Services and Quantity
            </SectionBoxTitle>
          )}
          <Button onClick={handleNext}>Next →</Button>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-500 mt-8 w-full max-w-[600px]">
          <span>
            No service?{" "}
            <a href="#" className="text-blue-600 hover:underline focus:outline-none">
              Contact support
            </a>
          </span>
          <button
            onClick={clearAllSelections}
            className="text-blue-600 hover:underline focus:outline-none"
          >
            Clear
          </button>
        </div>

        <div className="h-6 mt-4 text-left">
          {warningMessage && <p className="text-red-500">{warningMessage}</p>}
        </div>

        {/* Search Bar */}
        <div className="w-full max-w-[600px] mt-8 mb-4">
          <SearchServices
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            placeholder="Search for services in your selected rooms..."
          />
        </div>

        <div className="container mx-auto relative flex mt-8">
          <div className="flex-1 space-y-8">
            {chosenRooms.map((room) => {
              const { categoriesBySection, categoryServicesMap } = roomsData[room.id];
              const roomServices = selectedServicesState[room.id] || {};

              return (
                <div key={room.id}>
                  {chosenRooms.length > 1 && (
                    <SectionBoxTitle>{room.title}</SectionBoxTitle>
                  )}
                  {Object.entries(categoriesBySection).map(([sectionName, catIds]) => (
                    <div key={sectionName} className="mb-8 mt-4">
                      <SectionBoxSubtitle>{sectionName}</SectionBoxSubtitle>
                      <div className="flex flex-col gap-4 mt-4 w-full max-w-[600px]">
                        {catIds.map((catId) => {
                          const servicesForCategory = categoryServicesMap[catId] || [];
                          if (servicesForCategory.length === 0) return null;

                          const selectedInThisCategory = servicesForCategory.filter((svc) =>
                            Object.keys(roomServices).includes(svc.id)
                          ).length;

                          const categoryName = getCategoryNameById(catId);

                          return (
                            <div
                              key={catId}
                              className={`p-4 border rounded-xl bg-white ${
                                selectedInThisCategory > 0 ? "border-blue-500" : "border-gray-300"
                              }`}
                            >
                              <button
                                onClick={() => toggleCategory(catId)}
                                className="flex justify-between items-center w-full"
                              >
                                <h3
                                  className={`font-medium text-2xl ${
                                    selectedInThisCategory > 0 ? "text-blue-600" : "text-black"
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
                                    expandedCategories.has(catId) ? "rotate-180" : ""
                                  }`}
                                />
                              </button>

                              {expandedCategories.has(catId) && (
                                <div className="mt-4 flex flex-col gap-3">
                                  {servicesForCategory.map((svc) => {
                                    const isSelected = roomServices[svc.id] !== undefined;
                                    const quantity = roomServices[svc.id] || 1;
                                    const manualValue =
                                      manualInputValue[svc.id] !== null
                                        ? manualInputValue[svc.id] || ""
                                        : quantity.toString();

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
                                                  value={manualValue}
                                                  onClick={() =>
                                                    setManualInputValue((prev) => ({
                                                      ...prev,
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
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Right Column: Summary and other sections */}
          <div className="w-1/2 ml-auto pt-0 space-y-6">
            <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden">
              <SectionBoxSubtitle>Summary</SectionBoxSubtitle>
              {chosenRooms.every(room => {
                const roomServices = selectedServicesState[room.id] || {};
                return Object.keys(roomServices).length === 0;
              }) ? (
                <div className="text-left text-gray-500 text-medium mt-4">
                  No services selected
                </div>
              ) : (
                <>
                  {chosenRooms.map((room) => {
                    const { categoriesBySection, categoryServicesMap } = roomsData[room.id];
                    const roomServices = selectedServicesState[room.id] || {};
                    const hasSelectedInRoom = Object.keys(roomServices).length > 0;
                    if (!hasSelectedInRoom) return null;

                    const roomTotal = Object.entries(roomServices).reduce((sum, [serviceId, qty]) => {
                      const svc = ALL_SERVICES.find(s=>s.id===serviceId);
                      return svc ? sum + svc.price * qty : sum;
                    },0);

                    return (
                      <div key={room.id} className="mb-6">
                        {chosenRooms.length > 1 && (
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            {room.title}
                          </h3>
                        )}
                        {Object.entries(categoriesBySection).map(([sectionName, catIds]) => {
                          const categoriesWithSelected = catIds.filter(catId =>
                            (categoryServicesMap[catId]||[]).some(svc => roomServices[svc.id] !== undefined)
                          );
                          if (categoriesWithSelected.length===0) return null;

                          return (
                            <div key={sectionName} className="mb-4 ml-2">
                              <h4 className="text-lg font-medium text-gray-700 mb-2">
                                {sectionName}
                              </h4>
                              {categoriesWithSelected.map(catId => {
                                const categoryObj = ALL_CATEGORIES.find((c) => c.id===catId);
                                const categoryName = categoryObj?categoryObj.title:catId;
                                const servicesForCategory = categoryServicesMap[catId]||[];
                                const chosenServices = servicesForCategory.filter(svc=> roomServices[svc.id]!==undefined);

                                if(chosenServices.length===0) return null;

                                return (
                                  <div key={catId} className="mb-4 ml-4">
                                    <h5 className="text-md font-medium text-gray-700 mb-2">
                                      {categoryName}
                                    </h5>
                                    <ul className="space-y-2 pb-4">
                                      {chosenServices.map(svc=>{
                                        const quantity=roomServices[svc.id]||1;
                                        return (
                                          <li
                                            key={svc.id}
                                            className="grid grid-cols-3 gap-2 text-sm text-gray-600"
                                            style={{
                                              gridTemplateColumns:"40% 30% 25%",
                                              width:"100%",
                                            }}
                                          >
                                            <span className="truncate overflow-hidden">
                                              {svc.title}
                                            </span>
                                            <span className="text-right">
                                              {quantity} {svc.unit_of_measurement} x
                                              ${formatWithSeparator(svc.price)}
                                            </span>
                                            <span className="text-right">
                                              ${formatWithSeparator(svc.price*quantity)}
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
                          <span className="font-medium text-gray-800">Room Total:</span>
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

            <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden">
              <h2 className="text-2xl font-medium text-gray-800 mb-4">We Need Your Address</h2>
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  value={address}
                  onChange={handleAddressChange}
                  onFocus={(e) => (e.target.placeholder = "")}
                  onBlur={(e) => (e.target.placeholder = "Enter your address")}
                  placeholder="Enter your address"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button onClick={handleUseMyLocation} className="text-blue-600 text-left">
                  Use my location
                </button>
              </div>
            </div>

            <div className="max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden">
              <h2 className="text-2xl font-medium text-gray-800 mb-4">
                Upload Photos & Description
              </h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label
                    htmlFor="photo-upload"
                    className="block w-full px-4 py-2 text-center bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    Choose Files
                  </label>
                  <input
                    type="file"
                    id="photo-upload"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length > 12 || photos.length + files.length > 12) {
                        alert("You can upload up to 12 photos total.");
                        e.target.value = "";
                        return;
                      }
                      const fileUrls = files.map((file) => URL.createObjectURL(file));
                      setPhotos((prev) => [...prev, ...fileUrls]);
                    }}
                    className="hidden"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Maximum 12 images. Supported formats: JPG, PNG.
                  </p>

                  <div className="mt-4 grid grid-cols-3 gap-4">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={photo}
                          alt={`Uploaded preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md border border-gray-300"
                        />
                        <button
                          onClick={() => handleRemovePhoto(index)}
                          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remove photo"
                        >
                          <span className="text-sm">✕</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <textarea
                    id="details"
                    rows={5}
                    value={description}
                    onChange={handleDescriptionChange}
                    placeholder="Please provide more details about your issue (optional)..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}