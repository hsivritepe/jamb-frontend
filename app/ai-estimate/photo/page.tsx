"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useLocation } from "@/context/LocationContext";
import { setSessionItem, removeSessionItem } from "@/utils/session";
import { ALL_SERVICES } from "@/constants/services";
import { ALL_CATEGORIES } from "@/constants/categories";
import imageCompression from "browser-image-compression";

async function convertHeicFileToJpeg(file: File, quality = 0.6): Promise<File> {
  const { default: heic2any } = await import("heic2any");
  const converted = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality,
  });
  const blobs = Array.isArray(converted) ? converted : [converted];
  const jpegBlob = blobs[0] as Blob;
  return new File([jpegBlob], file.name.replace(/\.(heic|heif)$/i, ".jpg"), {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

const PREDICT_URL = "/api/predict";

/** Convert a string to lowercase+trim for category compare. */
function normalizeCategory(str: string) {
  return str.trim().toLowerCase();
}

/** Return all services whose `category` is in the recognized categories list. */
function findServicesFromCategories(categories: string[]) {
  const catSet = new Set(categories.map(normalizeCategory));
  return ALL_SERVICES.filter((svc) =>
    catSet.has((svc.category || "").toLowerCase())
  );
}

/** Local URL preview for a file. */
function createPreviewUrl(file: File) {
  return URL.createObjectURL(file);
}

/** Returns API base URL. */
function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "https://dev.thejamb.com";
}

/** Calculate labor+materials cost on the server. */
async function calculatePrice(params: {
  work_code: string;
  zipcode: string;
  unit_of_measurement: string;
  square: number;
}) {
  const url = `${getApiBaseUrl()}/calculate`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      work_code: params.work_code,
      zipcode: params.zipcode,
      unit_of_measurement: params.unit_of_measurement,
      square: params.square,
      finishing_materials: [],
    }),
  });
  if (!res.ok) {
    throw new Error(`Failed to calculate price (code=${params.work_code}).`);
  }
  return res.json();
}

/** Replace dashes with dots, e.g. "1-2-1" => "1.2.1". */
function dashToDot(str: string) {
  return str.replaceAll("-", ".");
}

/** Format a numeric value (commas + 2 decimals). */
function formatWithSeparator(value: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Displays a service image (with fallback). */
function ServiceImage({ serviceId }: { serviceId: string }) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const [firstSeg] = serviceId.split("-");
    const dotted = dashToDot(serviceId);
    const full = `https://dev.thejamb.com/images/${firstSeg}/${dotted}.jpg`;
    setImgSrc(full);
  }, [serviceId]);

  if (!imgSrc) return null;
  if (failed) {
    return (
      <img
        src="/images/fallback-service.jpg"
        alt="Service fallback"
        className="object-cover w-full h-full"
      />
    );
  }
  return (
    <img
      src={imgSrc}
      alt={serviceId}
      className="object-cover w-full h-full"
      onError={() => setFailed(true)}
    />
  );
}

/** Main component for AI photo recognition => recommended services. */
export default function AiEstimatePhotoPage() {
  const router = useRouter();
  const { location } = useLocation();

  // Uploaded files
  const [files, setFiles] = useState<File[]>([]);
  // AI-recommended services
  const [recommendedServices, setRecommendedServices] = useState<
    typeof ALL_SERVICES
  >([]);
  // Which services are selected
  const [selectedServices, setSelectedServices] = useState<
    Record<string, boolean>
  >({});
  // Quantity for each service
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  // Manually typed input strings
  const [manualInputs, setManualInputs] = useState<Record<string, string | null>>(
    {}
  );
  // Computed cost for each
  const [costs, setCosts] = useState<Record<string, number>>({});
  // Error + loading flags
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Whether analysis is done
  const [analysisDone, setAnalysisDone] = useState(false);
  // Show all recommended services or only the first N
  const [showAll, setShowAll] = useState(false);
  // AI textual description
  const [analysisDescription, setAnalysisDescription] = useState("");

  // Show an alert on error, then clear error
  useEffect(() => {
    if (error) {
      alert(error);
      setError(null);
    }
  }, [error]);

  /** 
   * Clears session keys that might conflict with a new AI analysis. 
   * Called whenever we start a brand-new "Analyze".
   */
  function resetAllSessionData() {
    removeSessionItem("services_selectedSections");
    removeSessionItem("services_selectedCategories");
    removeSessionItem("selectedServicesWithQuantity");
    // optionally also remove address/zip if that helps
  }

  /** Convert/compress new files for preview. */
  async function processFilesForPreview(newFiles: File[]): Promise<File[]> {
    const processed: File[] = [];
    for (const rawFile of newFiles) {
      try {
        let fileToUse = rawFile;

        // (1) convert HEIC => JPEG if needed
        const lower = fileToUse.name.toLowerCase();
        const isHeic =
          lower.endsWith(".heic") ||
          lower.endsWith(".heif") ||
          fileToUse.type.includes("heic") ||
          fileToUse.type.includes("heif");
        if (isHeic) {
          fileToUse = await convertHeicFileToJpeg(fileToUse, 0.6);
        }

        // (2) compress
        const opts = {
          maxWidthOrHeight: 1024,
          maxSizeMB: 0.3,
          useWebWorker: true,
        };
        const compressed = await imageCompression(fileToUse, opts);
        processed.push(compressed);
      } catch (err: any) {
        setError(err.message || "File conversion/compression error");
      }
    }
    return processed;
  }

  /** Handle file input changes (max 4 images). */
  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []);
    // Reset input so user can reselect the same file if needed
    e.target.value = "";

    if (!selected.length) return;
    if (files.length + selected.length > 4) {
      setError("You can upload up to 4 photos.");
      return;
    }

    // If we already did analysis, reset
    if (analysisDone) {
      setFiles([]);
      setRecommendedServices([]);
      setSelectedServices({});
      setQuantities({});
      setCosts({});
      setAnalysisDescription("");
      setAnalysisDone(false);
    }

    // Convert/compress
    const processed = await processFilesForPreview(selected);
    setFiles((prev) => [...prev, ...processed]);
  }

  /** Remove a file from the list. */
  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  /** Post images => /api/predict => recognized categories => matched services. */
  async function handleAnalyze() {
    if (files.length === 0) {
      setError("Please upload at least 1 photo.");
      return;
    }
    resetAllSessionData();

    setLoading(true);
    setAnalysisDone(false);
    setAnalysisDescription("");

    try {
      const uniqueCategories = new Set<string>();
      let descAcc = "";

      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);

        const resp = await fetch(PREDICT_URL, { method: "POST", body: fd });
        if (!resp.ok) {
          throw new Error(`Predict error: ${resp.status}`);
        }
        const data = await resp.json();

        for (const c of data.categories || []) {
          uniqueCategories.add(c);
        }
        if (data.description) {
          descAcc += data.description.trim() + " ";
        }
      }

      setAnalysisDescription(descAcc.trim());

      // Match recognized => known services
      const recognizedArr = Array.from(uniqueCategories);
      const matched = findServicesFromCategories(recognizedArr);
      setRecommendedServices(matched);
      setShowAll(false);

      // Initialize quantity + selected states
      const initQty: Record<string, number> = {};
      const initSel: Record<string, boolean> = {};
      matched.forEach((svc) => {
        initQty[svc.id] = svc.min_quantity ?? 1;
        initSel[svc.id] = false;
      });
      setQuantities(initQty);
      setSelectedServices(initSel);

      setAnalysisDone(true);
    } catch (err: any) {
      setError(err.message || "Error analyzing images");
    } finally {
      setLoading(false);
    }
  }

  /** Recompute costs if recommendedServices, quantities, or location changes. */
  useEffect(() => {
    async function recalcAll() {
      if (!recommendedServices.length) {
        setCosts({});
        return;
      }
      const { zip } = location;
      // If no valid 5-digit zip, skip
      if (!/^\d{5}$/.test(zip)) {
        return;
      }

      const nextCosts: Record<string, number> = {};
      for (const svc of recommendedServices) {
        const q = quantities[svc.id] ?? svc.min_quantity ?? 1;
        const code = dashToDot(svc.id);
        try {
          const resp = await calculatePrice({
            work_code: code,
            zipcode: zip,
            unit_of_measurement: svc.unit_of_measurement,
            square: q,
          });
          const labor = parseFloat(resp.work_cost || "0");
          const mat = parseFloat(resp.material_cost || "0");
          nextCosts[svc.id] = labor + mat;
        } catch {
          nextCosts[svc.id] = 0;
        }
      }
      setCosts(nextCosts);
    }
    recalcAll();
  }, [recommendedServices, quantities, location]);

  /** On typed changes in the quantity <input>. */
  function handleSvcManualChange(
    svcId: string,
    val: string,
    unit: string,
    minQ: number
  ) {
    setManualInputs((prev) => ({ ...prev, [svcId]: val }));

    let numericVal = parseFloat(val.replace(/,/g, "")) || 0;
    if (numericVal < minQ) numericVal = minQ;

    const found = recommendedServices.find((x) => x.id === svcId);
    if (!found) return;
    const maxQ = found.max_quantity ?? 9999;
    if (numericVal > maxQ) numericVal = maxQ;

    setQuantities((prev) => ({
      ...prev,
      [svcId]: unit === "each" ? Math.round(numericVal) : numericVal,
    }));
  }

  /** When the user clicks inside input, set raw typed value to "". */
  function handleSvcClickInput(svcId: string) {
    setManualInputs((prev) => ({ ...prev, [svcId]: "" }));
  }

  /** If user leaves input blank on blur, revert to null => show numeric again. */
  function handleSvcBlur(svcId: string) {
    if (manualInputs[svcId] === "") {
      setManualInputs((prev) => ({ ...prev, [svcId]: null }));
    }
  }

  /** + and - buttons to increment/decrement quantity. */
  function handlePlusMinus(
    svcId: string,
    increment: boolean,
    unit: string,
    minQ: number
  ) {
    setQuantities((prev) => {
      const found = recommendedServices.find((x) => x.id === svcId);
      if (!found) return prev;
      const maxQ = found.max_quantity ?? 9999;

      const oldVal = prev[svcId] ?? minQ;
      let newVal = increment ? oldVal + 1 : oldVal - 1;
      if (newVal < minQ) newVal = minQ;
      if (newVal > maxQ) newVal = maxQ;

      return {
        ...prev,
        [svcId]: unit === "each" ? Math.round(newVal) : newVal,
      };
    });
    setManualInputs((prev) => ({ ...prev, [svcId]: null }));
  }

  /** Toggle selected vs. not selected. */
  function toggleSelected(svcId: string) {
    setSelectedServices((old) => ({ ...old, [svcId]: !old[svcId] }));
  }

  /**
   * When user clicks "Proceed", we store the chosen services,
   * plus categories/sections, plus address data, then go to /calculate/details.
   */
  function handleContinue() {
    // Which services are chosen
    const chosen = recommendedServices.filter((svc) => selectedServices[svc.id]);
    if (!chosen.length) {
      alert("No services selected. Please pick at least one service.");
      return;
    }

    // Build map of { serviceId => quantity }, plus sets for categories & sections
    const svcMap: Record<string, number> = {};
    const catSet = new Set<string>();
    const sectionSet = new Set<string>();

    for (const s of chosen) {
      svcMap[s.id] = quantities[s.id] ?? s.min_quantity ?? 1;

      // E.g. "1-2-1" => category "1-2"
      const parts = s.id.split("-");
      if (parts.length >= 2) {
        const catId = parts.slice(0, 2).join("-");
        catSet.add(catId);

        // Now find that cat in ALL_CATEGORIES to get the 'section'
        const catObj = ALL_CATEGORIES.find((xx) => xx.id === catId);
        if (catObj) {
          sectionSet.add(catObj.section);
        }
      }
    }

    // If user has location with city/state/zip, store that too
    if (location.city) setSessionItem("address", location.city);
    if (location.state) setSessionItem("stateName", location.state);
    if (location.zip) setSessionItem("zip", location.zip);
    const combinedAddress = [location.city, location.state, location.zip]
      .filter(Boolean)
      .join(", ");
    if (combinedAddress) {
      setSessionItem("fullAddress", combinedAddress);
    }

    // Now store in session
    setSessionItem("selectedServicesWithQuantity", svcMap);
    setSessionItem("services_selectedCategories", Array.from(catSet));
    setSessionItem("services_selectedSections", Array.from(sectionSet));

    router.push("/calculate/details");
  }

  /** Return up to 10 recommended services unless user clicked "showAll". */
  const sortedServices = [...recommendedServices];
  const hasMoreThan10 = sortedServices.length > 10;
  const displayServices = showAll ? sortedServices : sortedServices.slice(0, 10);

  /** Compute how many are selected, plus total cost. */
  function getSelectedCountAndTotal() {
    let count = 0;
    let total = 0;
    for (const svc of recommendedServices) {
      if (selectedServices[svc.id]) {
        count++;
        total += costs[svc.id] || 0;
      }
    }
    return { count, total };
  }
  const { count: selectedCount, total: selectedTotal } = getSelectedCountAndTotal();

  return (
    <div className="p-0">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        AI Image Recognition
      </h1>
      <p className="text-gray-600 mb-4">
        Upload up to 4 photos and we'll suggest relevant services with prices.
      </p>

      {/* Upload */}
      <div className="mb-4">
        <label
          htmlFor="ai-photos"
          className="
            inline-block
            w-full 
            lg:w-[300px]
            border
            border-blue-600
            text-blue-600
            text-center
            py-2
            mb-2
            rounded
            cursor-pointer
            hover:bg-blue-50
          "
        >
          {analysisDone
            ? "New recognition"
            : files.length === 0
            ? "Choose up to 4 photos"
            : "Add more photos"}
        </label>
        <input
          type="file"
          id="ai-photos"
          multiple
          accept="image/*,.heic,.heif"
          className="hidden"
          onChange={handleFileChange}
        />

        {files.length > 0 && (
          <div className="my-3 flex flex-wrap gap-3">
            {files.map((file, idx) => (
              <div key={idx} className="relative w-[40%] sm:w-40 h-40">
                <img
                  src={createPreviewUrl(file)}
                  alt={`photo ${idx + 1}`}
                  className="w-full h-full object-cover rounded"
                />
                <button
                  onClick={() => removeFile(idx)}
                  className="absolute top-1 right-1 bg-gray-500 text-white w-6 h-6 rounded-full flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Analyze / Loading / Done */}
      <div className="my-3">
        {!analysisDone && !loading && files.length > 0 && (
          <button
            onClick={handleAnalyze}
            className="w-full lg:w-[300px] bg-blue-600 text-white px-4 py-2 my-2 rounded hover:bg-blue-700"
          >
            Analyze Images
          </button>
        )}
        {loading && (
          <button
            disabled
            className="w-full lg:w-[300px] bg-gray-300 text-gray-600 px-4 py-2 my-2 rounded cursor-not-allowed"
          >
            Analyzing<span className="ml-1 animate-pulse">...</span>
          </button>
        )}
        {!loading && analysisDone && (
          <button
            disabled
            className="w-full lg:w-[300px] bg-gray-300 text-gray-600 px-4 py-2 my-2 rounded cursor-not-allowed"
          >
            See results below
          </button>
        )}
      </div>

      {/* AI Observations */}
      {analysisDescription && (
        <div className="mb-6 bg-gray-50 p-3 border border-gray-200 rounded">
          <h2 className="text-xl font-medium text-gray-800 mb-2">
            AI Observations
          </h2>
          <p className="text-base text-gray-700 whitespace-pre-wrap">
            {analysisDescription}
          </p>
        </div>
      )}

      {/* Recommended Services */}
      {displayServices.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-medium text-gray-800 mb-3">
            Recommended Services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayServices.map((svc) => {
              const qty = quantities[svc.id] ?? svc.min_quantity ?? 1;
              const costVal = costs[svc.id] ?? 0;
              const isSelected = !!selectedServices[svc.id];
              const minQ = svc.min_quantity ?? 1;

              const typedVal = manualInputs[svc.id];
              // If user typed something, show that; otherwise show numeric
              const displayVal =
                typedVal !== null && typedVal !== undefined
                  ? typedVal
                  : String(qty);

              const borderClass = isSelected
                ? "border-blue-500"
                : "border-gray-300";

              return (
                <div
                  key={svc.id}
                  className={`border ${borderClass} rounded p-3 bg-white shadow-sm flex flex-col`}
                >
                  <div className="h-32 w-full overflow-hidden mb-2">
                    <ServiceImage serviceId={svc.id} />
                  </div>

                  <h3 className="text-md font-semibold text-gray-800">
                    {svc.title}
                  </h3>
                  <p className="text-xs text-gray-500">{svc.category}</p>

                  <div className="mt-auto">
                    {/* Quantity controls */}
                    <div className="flex items-center gap-1 mt-2 mb-2">
                      <button
                        onClick={() =>
                          handlePlusMinus(
                            svc.id,
                            false,
                            svc.unit_of_measurement,
                            minQ
                          )
                        }
                        className="w-8 h-8 bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg rounded"
                      >
                        −
                      </button>
                      <input
                        type="text"
                        value={displayVal}
                        onClick={() => handleSvcClickInput(svc.id)}
                        onBlur={() => handleSvcBlur(svc.id)}
                        onChange={(e) =>
                          handleSvcManualChange(
                            svc.id,
                            e.target.value,
                            svc.unit_of_measurement,
                            minQ
                          )
                        }
                        className="w-16 text-center px-1 py-1 border rounded text-sm"
                      />
                      <button
                        onClick={() =>
                          handlePlusMinus(
                            svc.id,
                            true,
                            svc.unit_of_measurement,
                            minQ
                          )
                        }
                        className="w-8 h-8 bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg rounded"
                      >
                        +
                      </button>
                      <span className="text-sm text-gray-600 ml-1">
                        {svc.unit_of_measurement}
                      </span>
                    </div>

                    {/* Cost + Add/Remove */}
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-800">
                        ${formatWithSeparator(costVal)}
                      </span>
                      <button
                        onClick={() => toggleSelected(svc.id)}
                        className={`
                          text-sm font-semibold px-3 py-1 rounded
                          ${
                            isSelected
                              ? "bg-red-600 text-white hover:bg-red-700"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }
                        `}
                      >
                        {isSelected ? "Remove" : "Add"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {hasMoreThan10 && !showAll && (
            <div className="mt-4">
              <button
                onClick={() => setShowAll(true)}
                className="w-full lg:w-[300px] bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-base font-semibold text-gray-700"
              >
                Show More Services
              </button>
            </div>
          )}
        </div>
      )}

      {/* "Proceed" button + total cost */}
      {displayServices.length > 0 && (
        <div className="mt-4">
          {selectedCount > 0 && (
            <div className="mb-4 text-gray-700 text-base font-semibold">
              You selected {selectedCount} services totaling{" "}
              <span className="text-red-600">
                ${formatWithSeparator(selectedTotal)}
              </span>
              <p className="text-base font-normal text-gray-600 mt-1">
                On the next page, you can pick finishing materials, needed
                equipment, and finalize your estimate.
              </p>
            </div>
          )}

          <button
            onClick={handleContinue}
            className="w-full lg:w-[300px] px-4 py-2 bg-blue-600 text-white mt-2 font-semibold rounded hover:bg-blue-700"
          >
            Proceed
          </button>
        </div>
      )}
    </div>
  );
}