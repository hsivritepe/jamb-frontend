"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, ChangeEvent } from "react";
import BreadCrumb from "@/components/ui/BreadCrumb";
import { PACKAGES_STEPS } from "@/constants/navigation";
import { PACKAGES } from "@/constants/packages";
import { ALL_SERVICES } from "@/constants/services";
import { SectionBoxTitle } from "@/components/ui/SectionBoxTitle";
import { SectionBoxSubtitle } from "@/components/ui/SectionBoxSubtitle";
import Button from "@/components/ui/Button";
import SearchServices from "@/components/SearchServices";

/**
 * Save data to sessionStorage as JSON (client side only).
 */
function saveToSession(key: string, value: any) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(key, JSON.stringify(value));
  }
}

/**
 * Load data from sessionStorage, parse JSON, or return default if error or SSR.
 */
function loadFromSession<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  const saved = sessionStorage.getItem(key);
  try {
    return saved ? JSON.parse(saved) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Format a number with 2 decimals (and comma separators).
 */
function formatWithSeparator(num: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export default function PackagesDetailsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 1) Grab packageId from the query string
  const packageId = searchParams.get("packageId");

  // If no packageId, or if the chosen package is invalid, store a boolean “invalidPackage”
  // so we know we will redirect or not show content.
  const [invalidPackage, setInvalidPackage] = useState<boolean>(false);

  // 2) If no packageId, we’ll mark invalid
  useEffect(() => {
    if (!packageId) {
      setInvalidPackage(true);
    }
  }, [packageId]);

  // 3) Attempt to find the package
  const foundPackage = packageId
    ? PACKAGES.find((p) => p.id === packageId) ?? null
    : null;

  // 4) If the package does not exist, also mark invalid
  useEffect(() => {
    if (packageId && !foundPackage) {
      setInvalidPackage(true);
    }
  }, [packageId, foundPackage]);

  // If we have an invalid package, do a redirect or simply return null
  useEffect(() => {
    if (invalidPackage) {
      router.push("/packages");
    }
  }, [invalidPackage, router]);

  // If we’ve determined the package is invalid or not found, end early
  if (invalidPackage || !foundPackage) {
    // We could also display a loading spinner or a short message here
    return null;
  }

  // ---- Now TypeScript is certain “foundPackage” is not undefined. ----
  //     We can rename it as “chosenPackage” (not undefined).
  const chosenPackage = foundPackage;

  // ----- Local states for search, address, description, photos, warnings -----
  const [searchQuery, setSearchQuery] = useState<string>(() =>
    loadFromSession("packages_searchQuery", "")
  );
  const [address, setAddress] = useState<string>(() =>
    loadFromSession("address", "")
  );
  const [description, setDescription] = useState<string>(() =>
    loadFromSession("description", "")
  );
  const [photos, setPhotos] = useState<string[]>(() =>
    loadFromSession("photos", [])
  );
  const [warning, setWarning] = useState<string | null>(null);

  // Selected services: { indoor: {serviceId: quantity}, outdoor: {serviceId: quantity} }
  const [selectedServices, setSelectedServices] = useState<{
    indoor: Record<string, number>;
    outdoor: Record<string, number>;
  }>(() => loadFromSession("packages_selectedServices", { indoor: {}, outdoor: {} }));

  // Persist states to session
  useEffect(() => {
    saveToSession("packages_searchQuery", searchQuery);
  }, [searchQuery]);
  useEffect(() => {
    saveToSession("address", address);
  }, [address]);
  useEffect(() => {
    saveToSession("description", description);
  }, [description]);
  useEffect(() => {
    saveToSession("photos", photos);
  }, [photos]);
  useEffect(() => {
    saveToSession("packages_selectedServices", selectedServices);
  }, [selectedServices]);

  // Manual input for quantity
  const [manualInput, setManualInput] = useState<Record<string, string | null>>({});

  // Tab: indoor/outdoor
  const [selectedTab, setSelectedTab] = useState<"indoor" | "outdoor">("indoor");

  // Return array of services from ALL_SERVICES that are in the chosen package (indoor or outdoor), filtered by search
  function getServices(isIndoor: boolean) {
    const sideKey = isIndoor ? "indoor" : "outdoor";
    const pkgServices = chosenPackage.services[sideKey]; // e.g. [{id, title, quantityPerYear}, ...]
    // Map them to actual service objects from ALL_SERVICES
    return pkgServices
      .map((p) => ALL_SERVICES.find((s) => s.id === p.id))
      .filter((svc): svc is typeof ALL_SERVICES[number] => !!svc)
      .filter((svc) => {
        if (!searchQuery) return true;
        const lower = searchQuery.toLowerCase();
        if (svc.title.toLowerCase().includes(lower)) return true;
        if (svc.description && svc.description.toLowerCase().includes(lower)) return true;
        return false;
      });
  }

  const indoorServices = getServices(true);
  const outdoorServices = getServices(false);

  // Handlers for toggling, inc/dec, clearing, etc.
  function toggleService(svcId: string, isIndoor: boolean) {
    const key = isIndoor ? "indoor" : "outdoor";
    const sideCopy = { ...selectedServices[key] };
    if (sideCopy[svcId]) {
      delete sideCopy[svcId];
    } else {
      sideCopy[svcId] = 1;
    }
    setSelectedServices((prev) => ({ ...prev, [key]: sideCopy }));
    setWarning(null);
  }

  function incOrDec(svcId: string, inc: boolean, isIndoor: boolean, unit: string) {
    const key = isIndoor ? "indoor" : "outdoor";
    const copy = { ...selectedServices[key] };
    const oldVal = copy[svcId] || 1;
    const newVal = inc ? oldVal + 1 : Math.max(1, oldVal - 1);
    copy[svcId] = unit === "each" ? Math.round(newVal) : newVal;
    setSelectedServices((prev) => ({ ...prev, [key]: copy }));

    // Clear manual input if using +/- buttons
    setManualInput((prev) => ({ ...prev, [svcId]: null }));
  }

  function handleManualChange(
    svcId: string,
    value: string,
    isIndoor: boolean,
    unit: string
  ) {
    setManualInput((prev) => ({ ...prev, [svcId]: value }));
    const numeric = parseFloat(value.replace(/,/g, "")) || 0;
    if (!isNaN(numeric)) {
      const key = isIndoor ? "indoor" : "outdoor";
      const copy = { ...selectedServices[key] };
      copy[svcId] = unit === "each" ? Math.round(numeric) : numeric;
      setSelectedServices((prev) => ({ ...prev, [key]: copy }));
    }
  }

  function onBlurInput(svcId: string) {
    if (!manualInput[svcId]) {
      // If empty, revert to null -> use the existing quantity
      setManualInput((prev) => ({ ...prev, [svcId]: null }));
    }
  }

  function clearAll() {
    if (!confirm("Are you sure you want to clear all?")) return;
    setSelectedServices({ indoor: {}, outdoor: {} });
    setManualInput({});
  }

  function calcSubtotal(): number {
    let total = 0;
    // Check both sides
    function processSide(isIndoor: boolean) {
      const sideKey = isIndoor ? "indoor" : "outdoor";
      const items = selectedServices[sideKey];
      Object.entries(items).forEach(([svcId, qty]) => {
        const svc = ALL_SERVICES.find((x) => x.id === svcId);
        if (svc) {
          total += svc.price * qty;
        }
      });
    }
    processSide(true);
    processSide(false);
    return total;
  }

  const subTotal = calcSubtotal();

  function handleNext() {
    // Must have at least 1 service and an address
    const indoorCount = Object.keys(selectedServices.indoor).length;
    const outdoorCount = Object.keys(selectedServices.outdoor).length;
    if (indoorCount === 0 && outdoorCount === 0) {
      setWarning("Please select at least one service.");
      return;
    }
    if (!address.trim()) {
      setWarning("Please enter your address first.");
      return;
    }
    // If all is good, go to estimate
    router.push("/packages/estimate");
  }

  // Photo uploading
  function addPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length > 12 || photos.length + files.length > 12) {
      alert("You can upload up to 12 photos total.");
      e.target.value = "";
      return;
    }
    const urls = files.map((file) => URL.createObjectURL(file));
    setPhotos((prev) => [...prev, ...urls]);
  }
  function removePhoto(idx: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  }

  // For using location data from some location context if available
  function useMyLocation() {
    // In your original code, you had something like location?.city/zip
    // We'll just do a minimal stub or skip
    // setAddress(locationString) or show warning
  }

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto">
        <BreadCrumb items={PACKAGES_STEPS} />
      </div>

      <div className="container mx-auto">
        <div className="flex justify-between items-start mt-8">
          <SectionBoxTitle>{chosenPackage.title}: Services</SectionBoxTitle>
          <Button onClick={handleNext}>Next →</Button>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-500 mt-8 w-full max-w-[600px]">
          <span>
            No service?{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Contact support
            </a>
          </span>
          <button onClick={clearAll} className="text-blue-600 hover:underline">
            Clear
          </button>
        </div>
        <div className="h-6 mt-4 text-left">
          {warning && <p className="text-red-500">{warning}</p>}
        </div>

        {/* Search */}
        <div className="w-full max-w-[600px] mt-8 mb-4">
          <SearchServices
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            placeholder="Search for services in this package..."
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-4 my-4">
          <button
            onClick={() => setSelectedTab("indoor")}
            className={`px-4 py-2 rounded ${
              selectedTab === "indoor" ? "bg-blue-600 text-white" : "bg-gray-200 text-black"
            }`}
          >
            Indoor
          </button>
          <button
            onClick={() => setSelectedTab("outdoor")}
            className={`px-4 py-2 rounded ${
              selectedTab === "outdoor" ? "bg-blue-600 text-white" : "bg-gray-200 text-black"
            }`}
          >
            Outdoor
          </button>
        </div>

        {/* Services list */}
        <div>
          {selectedTab === "indoor"
            ? indoorServices.map((svc) => {
                const isSelected = !!selectedServices.indoor[svc.id];
                const qty = selectedServices.indoor[svc.id] || 1;
                const manualVal =
                  manualInput[svc.id] !== null && manualInput[svc.id] !== undefined
                    ? manualInput[svc.id]!
                    : String(qty);

                return (
                  <div
                    key={svc.id}
                    className={`p-4 mb-4 border rounded-xl bg-white ${
                      isSelected ? "border-blue-500" : "border-gray-300"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-lg ${isSelected ? "text-blue-600" : "text-gray-800"}`}>
                        {svc.title}
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleService(svc.id, true)}
                          className="sr-only peer"
                        />
                        <div className="w-[50px] h-[26px] bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors duration-300"></div>
                        <div className="absolute top-[2px] left-[2px] w-[22px] h-[22px] bg-white rounded-full shadow-md peer-checked:translate-x-[24px] transform transition-transform duration-300"></div>
                      </label>
                    </div>

                    {isSelected && (
                      <div className="mt-2">
                        {svc.description && (
                          <p className="text-sm text-gray-500 mb-2">{svc.description}</p>
                        )}
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => incOrDec(svc.id, false, true, svc.unit_of_measurement)}
                              className="w-8 h-8 bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg rounded"
                            >
                              −
                            </button>
                            <input
                              type="text"
                              value={manualVal}
                              onClick={() =>
                                setManualInput((prev) => ({ ...prev, [svc.id]: "" }))
                              }
                              onBlur={() => onBlurInput(svc.id)}
                              onChange={(e) =>
                                handleManualChange(svc.id, e.target.value, true, svc.unit_of_measurement)
                              }
                              className="w-20 text-center px-2 py-1 border rounded"
                            />
                            <button
                              onClick={() => incOrDec(svc.id, true, true, svc.unit_of_measurement)}
                              className="w-8 h-8 bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg rounded"
                            >
                              +
                            </button>
                            <span className="text-sm text-gray-600">
                              {svc.unit_of_measurement}
                            </span>
                          </div>
                          <span className="text-lg text-blue-600 font-medium">
                            ${formatWithSeparator(svc.price * qty)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            : /* OUTDOOR */
              outdoorServices.map((svc) => {
                const isSelected = !!selectedServices.outdoor[svc.id];
                const qty = selectedServices.outdoor[svc.id] || 1;
                const manualVal =
                  manualInput[svc.id] !== null && manualInput[svc.id] !== undefined
                    ? manualInput[svc.id]!
                    : String(qty);

                return (
                  <div
                    key={svc.id}
                    className={`p-4 mb-4 border rounded-xl bg-white ${
                      isSelected ? "border-blue-500" : "border-gray-300"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-lg ${isSelected ? "text-blue-600" : "text-gray-800"}`}>
                        {svc.title}
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleService(svc.id, false)}
                          className="sr-only peer"
                        />
                        <div className="w-[50px] h-[26px] bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors duration-300"></div>
                        <div className="absolute top-[2px] left-[2px] w-[22px] h-[22px] bg-white rounded-full shadow-md peer-checked:translate-x-[24px] transform transition-transform duration-300"></div>
                      </label>
                    </div>

                    {isSelected && (
                      <div className="mt-2">
                        {svc.description && (
                          <p className="text-sm text-gray-500 mb-2">{svc.description}</p>
                        )}
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                incOrDec(svc.id, false, false, svc.unit_of_measurement)
                              }
                              className="w-8 h-8 bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg rounded"
                            >
                              −
                            </button>
                            <input
                              type="text"
                              value={manualVal}
                              onClick={() => setManualInput((prev) => ({ ...prev, [svc.id]: "" }))}
                              onBlur={() => onBlurInput(svc.id)}
                              onChange={(e) =>
                                handleManualChange(svc.id, e.target.value, false, svc.unit_of_measurement)
                              }
                              className="w-20 text-center px-2 py-1 border rounded"
                            />
                            <button
                              onClick={() =>
                                incOrDec(svc.id, true, false, svc.unit_of_measurement)
                              }
                              className="w-8 h-8 bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg rounded"
                            >
                              +
                            </button>
                            <span className="text-sm text-gray-600">
                              {svc.unit_of_measurement}
                            </span>
                          </div>
                          <span className="text-lg text-blue-600 font-medium">
                            ${formatWithSeparator(svc.price * qty)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
        </div>

        {/* Right-side: Summary, Address, Photos, Extra details */}
        <div className="flex mt-8 gap-8">
          <div className="max-w-[500px] bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden">
            <SectionBoxSubtitle>Summary</SectionBoxSubtitle>

            {Object.keys(selectedServices.indoor).length === 0 &&
            Object.keys(selectedServices.outdoor).length === 0 ? (
              <p className="text-gray-500 mt-4">No services selected</p>
            ) : (
              <>
                <h3 className="text-lg font-semibold mt-2">{chosenPackage.title}</h3>
                <ul className="mt-4 space-y-2 pb-4 text-sm text-gray-600">
                  {Object.entries(selectedServices.indoor).map(([svcId, quantity]) => {
                    const svc = ALL_SERVICES.find((s) => s.id === svcId);
                    if (!svc) return null;
                    return (
                      <li key={svcId} className="flex justify-between items-center">
                        <span className="truncate w-[50%]">{svc.title}</span>
                        <span>
                          {quantity} × ${formatWithSeparator(svc.price)}
                        </span>
                        <span className="w-[20%] text-right">
                          ${formatWithSeparator(svc.price * quantity)}
                        </span>
                      </li>
                    );
                  })}

                  {Object.entries(selectedServices.outdoor).map(([svcId, quantity]) => {
                    const svc = ALL_SERVICES.find((s) => s.id === svcId);
                    if (!svc) return null;
                    return (
                      <li key={svcId} className="flex justify-between items-center">
                        <span className="truncate w-[50%]">{svc.title}</span>
                        <span>
                          {quantity} × ${formatWithSeparator(svc.price)}
                        </span>
                        <span className="w-[20%] text-right">
                          ${formatWithSeparator(svc.price * quantity)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <div className="flex justify-between font-semibold text-lg mt-2">
                  <span>Subtotal:</span>
                  <span>${formatWithSeparator(subTotal)}</span>
                </div>
              </>
            )}
          </div>

          <div className="max-w-[500px] bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden">
            <SectionBoxSubtitle>We Need Your Address</SectionBoxSubtitle>
            <input
              type="text"
              value={address}
              placeholder="Enter your address"
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md mt-2"
            />
            <button onClick={useMyLocation} className="text-blue-600 mt-2 text-sm">
              Use my location
            </button>

            <SectionBoxSubtitle className="mt-6">Upload Photos</SectionBoxSubtitle>
            <label
              htmlFor="photo-upload"
              className="block w-full px-4 py-2 text-center bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600 mt-2"
            >
              Choose Files
            </label>
            <input
              type="file"
              id="photo-upload"
              accept="image/*"
              multiple
              onChange={addPhotos}
              className="hidden"
            />
            <p className="text-sm text-gray-500 mt-1">
              Maximum 12 images. Supported formats: JPG, PNG.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-4">
              {photos.map((url, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={url}
                    alt={`Photo ${idx + 1}`}
                    className="w-full h-24 object-cover rounded-md border border-gray-300"
                  />
                  <button
                    onClick={() => removePhoto(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <SectionBoxSubtitle className="mt-6">Additional Details</SectionBoxSubtitle>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Anything extra to mention..."
              className="w-full mt-2 px-3 py-2 border border-gray-300 rounded"
            />
          </div>
        </div>
      </div>
    </main>
  );
}