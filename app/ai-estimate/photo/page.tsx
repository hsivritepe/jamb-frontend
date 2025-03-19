"use client";

import React, { useState, useEffect, ChangeEvent, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLocation } from "@/context/LocationContext";
import { setSessionItem } from "@/utils/session";
import { ALL_SERVICES } from "@/constants/services";

const PREDICT_URL = "/api/predict";

function normalizeCategory(str: string) {
  return str.trim().toLowerCase();
}

function findServicesFromCategories(categories: string[]) {
  const catSet = new Set(categories.map((c) => normalizeCategory(c)));
  return ALL_SERVICES.filter((svc) =>
    catSet.has((svc.category || "").toLowerCase())
  );
}

function createPreviewUrl(file: File) {
  return URL.createObjectURL(file);
}

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "https://dev.thejamb.com";
}

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

function dashToDot(str: string) {
  return str.replaceAll("-", ".");
}

function formatWithSeparator(value: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

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
  const [recommendedServices, setRecommendedServices] = useState<
    typeof ALL_SERVICES
  >([]);
  const [selectedServices, setSelectedServices] = useState<
    Record<string, boolean>
  >({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [costs, setCosts] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (error) {
      alert(error);
      setError(null);
    }
  }, [error]);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const newFiles = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length + newFiles.length > 4) {
      setError("You can upload up to 4 photos.");
      return;
    }
    setFiles((prev) => [...prev, ...newFiles]);
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleAnalyze() {
    if (files.length === 0) {
      setError("Please upload at least 1 photo.");
      return;
    }
    setLoading(true);

    try {
      const uniqueCats = new Set<string>();
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);

        const resp = await fetch(PREDICT_URL, { method: "POST", body: fd });
        if (!resp.ok) {
          throw new Error(`Predict error: ${resp.status}`);
        }
        const data = await resp.json();
        for (const c of data.categories || []) {
          uniqueCats.add(c);
        }
      }

      const recognizedArr = Array.from(uniqueCats);
      const matched = findServicesFromCategories(recognizedArr);
      setRecommendedServices(matched);
      setShowAll(false);

      const initQty: Record<string, number> = {};
      const initSel: Record<string, boolean> = {};
      matched.forEach((svc) => {
        initQty[svc.id] = svc.min_quantity ?? 1;
        initSel[svc.id] = false;
      });
      setQuantities(initQty);
      setSelectedServices(initSel);
    } catch (err: any) {
      setError(err.message || "Error analyzing images");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function recalcAll() {
      if (recommendedServices.length === 0) {
        setCosts({});
        return;
      }
      const { zip } = location;
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

  function handleManualChange(
    svcId: string,
    val: string,
    unit: string,
    minQ: number
  ) {
    let n = parseFloat(val.replace(/,/g, "")) || 0;
    if (n < minQ) n = minQ;
    const found = recommendedServices.find((x) => x.id === svcId);
    if (!found) return;
    const maxQ = found.max_quantity ?? 9999;
    if (n > maxQ) n = maxQ;
    setQuantities((prev) => ({ ...prev, [svcId]: n }));
  }

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
      return { ...prev, [svcId]: newVal };
    });
  }

  function toggleSelected(svcId: string) {
    setSelectedServices((old) => ({ ...old, [svcId]: !old[svcId] }));
  }

  function handleContinue() {
    const chosen = recommendedServices.filter((svc) => selectedServices[svc.id]);
    if (chosen.length === 0) {
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

  const sortedServices = useMemo(() => {
    return [...recommendedServices];
  }, [recommendedServices]);

  const hasMoreThan10 = sortedServices.length > 10;
  const displayServices = showAll
    ? sortedServices
    : sortedServices.slice(0, 10);

  return (
    <div className="p-0">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        AI Image Recognition
      </h1>
      <p className="text-gray-600 mb-4">
        Upload up to 4 photos and we'll suggest relevant services with prices.
      </p>

      <div className="mb-4">
        <label
          htmlFor="ai-photos"
          className="
            inline-block
            w-full 
            md:w-[300px]
            border
            border-blue-600
            text-blue-600
            text-center
            py-2
            rounded
            cursor-pointer
            hover:bg-blue-50
          "
        >
          {files.length === 0 ? "Choose up to 4 photos" : "Add more photos"}
        </label>
        <input
          type="file"
          id="ai-photos"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {files.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-3">
            {files.map((file, idx) => (
              <div key={idx} className="relative w-[40%] sm:w-40 h-40">
                <img
                  src={createPreviewUrl(file)}
                  alt={`photo ${idx + 1}`}
                  className="w-full h-full object-cover rounded"
                />
                <button
                  onClick={() => removeFile(idx)}
                  className="absolute top-0 right-0 bg-gray-500 text-white w-6 h-6 rounded-full flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-4">
        {loading ? (
          <p className="text-gray-500">Analyzing...</p>
        ) : (
          files.length > 0 && (
            <button
              onClick={handleAnalyze}
              className="w-full md:w-[300px] bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Analyze Images
            </button>
          )
        )}
      </div>

      {displayServices.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-medium text-gray-800 mb-3">
            Recommended Services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayServices.map((svc) => {
              const qty = quantities[svc.id] ?? svc.min_quantity ?? 1;
              const costVal = costs[svc.id] ?? 0;
              const isSelected = !!selectedServices[svc.id];
              const minQ = svc.min_quantity ?? 1;
              const displayVal = String(qty);

              return (
                <div
                  key={svc.id}
                  className="border rounded p-3 bg-white shadow-sm flex flex-col"
                >
                  <div className="h-32 w-full overflow-hidden mb-2">
                    <ServiceImage serviceId={svc.id} />
                  </div>

                  <h3 className="text-md font-semibold text-gray-800">
                    {svc.title}
                  </h3>
                  <p className="text-xs text-gray-500">{svc.category}</p>

                  <div className="mt-auto">
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
                        onChange={(e) =>
                          handleManualChange(
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

                    <div className="flex justify-between items-center">
                      <span className="text-blue-600 font-bold">
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
                className="w-full md:w-[200px] bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-sm text-gray-700"
              >
                Show More Services
              </button>
            </div>
          )}
        </div>
      )}

      {displayServices.length > 0 && (
        <div className="mt-6">
          <button
            onClick={handleContinue}
            className="w-full md:w-[200px] px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}