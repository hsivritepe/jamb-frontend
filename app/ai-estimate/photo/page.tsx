"use client";

import React, {
  useState,
  useEffect,
  ChangeEvent,
  useMemo,
  FocusEvent,
} from "react";
import { useRouter } from "next/navigation";
import { useLocation } from "@/context/LocationContext";
import { setSessionItem } from "@/utils/session";
import { ALL_SERVICES } from "@/constants/services";
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

function normalizeCategory(str: string) {
  return str.trim().toLowerCase();
}

/** Finds services that match a set of normalized categories. */
function findServicesFromCategories(categories: string[]) {
  const catSet = new Set(categories.map((c) => normalizeCategory(c)));
  return ALL_SERVICES.filter((svc) =>
    catSet.has((svc.category || "").toLowerCase())
  );
}

/** Creates a local URL for previewing a File. */
function createPreviewUrl(file: File) {
  return URL.createObjectURL(file);
}

/** Base API or fallback. */
function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "https://dev.thejamb.com";
}

/** POST /calculate => compute labor+materials cost. */
async function calculatePrice(params: {
  work_code: string;
  zipcode: string;
  unit_of_measurement: string;
  square: number;
}): Promise<{ work_cost?: string; material_cost?: string }> {
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

/** Converts dashes in an ID string to dots (e.g. "1-1-1" => "1.1.1"). */
function dashToDot(str: string) {
  return str.replaceAll("-", ".");
}

/** Formats a numeric value with commas and two decimals. */
function formatWithSeparator(value: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Displays the service image or falls back if loading fails. */
function ServiceImage({ serviceId }: { serviceId: string }) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const [firstSeg] = serviceId.split("-");
    const dot = dashToDot(serviceId);
    const full = `https://dev.thejamb.com/images/${firstSeg}/${dot}.jpg`;
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

export default function AiEstimatePhotoPage() {
  const router = useRouter();
  const { location } = useLocation();
  const [files, setFiles] = useState<File[]>([]);
  const [recommendedServices, setRecommendedServices] =
    useState<typeof ALL_SERVICES>([]);
  const [selectedServices, setSelectedServices] = useState<
    Record<string, boolean>
  >({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [manualInputs, setManualInputs] = useState<Record<string, string | null>>(
    {}
  );
  const [costs, setCosts] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [analysisDescription, setAnalysisDescription] = useState("");

  useEffect(() => {
    if (error) {
      alert(error);
      setError(null);
    }
  }, [error]);

  /**
   * Convert or compress new files to get them ready for preview/analysis.
   */
  async function processFilesForPreview(newFiles: File[]): Promise<File[]> {
    const processed: File[] = [];
    for (const rawFile of newFiles) {
      try {
        let fileToUse = rawFile;

        // Step 1) convert HEIC => JPEG if needed
        const lower = fileToUse.name.toLowerCase();
        const isHeic =
          lower.endsWith(".heic") ||
          lower.endsWith(".heif") ||
          fileToUse.type.includes("heic") ||
          fileToUse.type.includes("heif");

        if (isHeic) {
          fileToUse = await convertHeicFileToJpeg(fileToUse, 0.6);
        }

        // Step 2) compress the image to ~0.3MB
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

  /**
   * Handle user file selection (up to 4 images).
   */
  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []);
    // Clear the input so user can re-select the same file if needed
    e.target.value = "";

    if (!selected.length) return;

    if (files.length + selected.length > 4) {
      setError("You can upload up to 4 photos.");
      return;
    }

    // If we've already done an analysis, reset everything
    if (analysisDone) {
      setFiles([]);
      setRecommendedServices([]);
      setSelectedServices({});
      setQuantities({});
      setCosts({});
      setAnalysisDescription("");
      setAnalysisDone(false);
    }

    // Convert/compress the new files
    const processed = await processFilesForPreview(selected);
    setFiles((prev) => [...prev, ...processed]);
  }

  /**
   * Remove a photo from the preview list.
   */
  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  /**
   * Send images to /api/predict to get categories, then match to services.
   */
  async function handleAnalyze() {
    if (files.length === 0) {
      setError("Please upload at least 1 photo.");
      return;
    }
    setLoading(true);
    setAnalysisDone(false);
    setAnalysisDescription("");

    try {
      const uniqueCategories = new Set<string>();
      let descAcc = "";

      // For each file, call /api/predict
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

      // Match recognized categories => known services
      const recognizedArr = Array.from(uniqueCategories);
      const matched = findServicesFromCategories(recognizedArr);
      setRecommendedServices(matched);
      setShowAll(false);

      // Initialize quantity + selection state
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

  /**
   * Recompute costs whenever recommendedServices or quantity or location changes.
   */
  useEffect(() => {
    async function recalcAll() {
      if (!recommendedServices.length) {
        setCosts({});
        return;
      }
      const { zip } = location;
      if (!/^\d{5}$/.test(zip)) return;

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

  /**
   * Similar logic to RecommendedActivities:
   * We store the typed input separately in `manualInputs` so the user
   * can type partial numbers without being forced to minQuantity on every keystroke.
   */
  function handleSvcManualChange(
    svcId: string,
    val: string,
    unit: string,
    minQ: number
  ) {
    // Always store the raw typed string so user sees exactly what they typed
    setManualInputs((prev) => ({ ...prev, [svcId]: val }));

    // Attempt to parse and clamp
    let numericVal = parseFloat(val.replace(/,/g, "")) || 0;
    if (numericVal < minQ) numericVal = minQ;

    const found = recommendedServices.find((x) => x.id === svcId);
    if (!found) return;

    const maxQ = found.max_quantity ?? 9999;
    if (numericVal > maxQ) numericVal = maxQ;

    // If it's "each", round it
    setQuantities((prev) => ({
      ...prev,
      [svcId]: unit === "each" ? Math.round(numericVal) : numericVal,
    }));
  }

  /** If user clicks inside the input, reset the stored string to empty (""). */
  function handleSvcClickInput(svcId: string) {
    setManualInputs((prev) => ({ ...prev, [svcId]: "" }));
  }

  /** On blur, if the user ended up with an empty typed string, revert to null. */
  function handleSvcBlur(svcId: string) {
    if (manualInputs[svcId] === "") {
      setManualInputs((prev) => ({ ...prev, [svcId]: null }));
    }
  }

  /** Increment or decrement. After that, we reset manualInputs to null so it shows numeric. */
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

      return { ...prev, [svcId]: unit === "each" ? Math.round(newVal) : newVal };
    });
    // After a manual +/- click, we clear the manual input so we display the new numeric
    setManualInputs((prev) => ({ ...prev, [svcId]: null }));
  }

  /** Toggle whether a service is selected or not. */
  function toggleSelected(svcId: string) {
    setSelectedServices((old) => ({ ...old, [svcId]: !old[svcId] }));
  }

  /** On "Proceed", store selected services + their quantities, then go to the next page. */
  function handleContinue() {
    const chosen = recommendedServices.filter((svc) => selectedServices[svc.id]);
    if (!chosen.length) {
      alert("No services selected. Please pick at least one service.");
      return;
    }
    const svcMap: Record<string, number> = {};
    for (const s of chosen) {
      svcMap[s.id] = quantities[s.id] ?? s.min_quantity ?? 1;
    }
    setSessionItem("selectedServicesWithQuantity", svcMap);
    router.push("/calculate/details");
  }

  /** A sorted array of recommended services to display. */
  const sortedServices = useMemo(() => {
    return [...recommendedServices];
  }, [recommendedServices]);

  const hasMoreThan10 = sortedServices.length > 10;
  const displayServices = showAll ? sortedServices : sortedServices.slice(0, 10);

  /** Calculate how many are selected and the total cost. */
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

      {/* Upload UI */}
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

              // If user typed something in manualInputs, show that string, else show the numeric
              const typedVal = manualInputs[svc.id];
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
                        // Similar to the recommendedActivities "onClick -> set input to ''"
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
                        onFocus={(e) => e.target.select()}
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

      {/* Selected summary + "Proceed" button */}
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
                equipment, and set up scheduling to finalize your estimate.
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