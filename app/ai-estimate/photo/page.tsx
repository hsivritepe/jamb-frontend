"use client";

import React, { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { setSessionItem } from "@/utils/session";
import { ALL_SERVICES } from "@/constants/services";

const PREDICT_URL = "/api/predict";

function findServicesFromCategories(categories: string[]) {
  const catSet = new Set(categories.map((c) => c.toLowerCase()));
  return ALL_SERVICES.filter((svc) => {
    const catStr = (svc.category || "").toLowerCase();
    return catSet.has(catStr);
  });
}

function createPreviewUrl(file: File) {
  return URL.createObjectURL(file);
}

export default function AiEstimatePhotoPage() {
  const router = useRouter();

  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recognizedCategories, setRecognizedCategories] = useState<string[]>([]);
  const [recommendedServices, setRecommendedServices] = useState<
    typeof ALL_SERVICES
  >([]);
  const [selectedServices, setSelectedServices] = useState<
    Record<string, boolean>
  >({});

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const arr = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length + arr.length > 4) {
      setError("You can upload up to 4 photos.");
      return;
    }
    setFiles((prev) => [...prev, ...arr]);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleAnalyze() {
    if (files.length === 0) {
      setError("Please upload at least 1 photo.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const uniqueCategories = new Set<string>();

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const resp = await fetch(PREDICT_URL, { method: "POST", body: formData });
        if (!resp.ok) {
          throw new Error(`Predict error: ${resp.status}`);
        }
        const data = await resp.json();
        for (const cat of data.categories || []) {
          uniqueCategories.add(cat);
        }
      }

      const catArr = Array.from(uniqueCategories);
      setRecognizedCategories(catArr);

      const matchedServices = findServicesFromCategories(catArr);
      setRecommendedServices(matchedServices);

      const selObj: Record<string, boolean> = {};
      matchedServices.forEach((svc) => {
        selObj[svc.id] = false;
      });
      setSelectedServices(selObj);
    } catch (err: any) {
      setError(err.message || "Error analyzing images");
    } finally {
      setLoading(false);
    }
  }

  function toggleService(svcId: string) {
    setSelectedServices((prev) => ({
      ...prev,
      [svcId]: !prev[svcId],
    }));
  }

  function handleContinue() {
    const chosen = recommendedServices.filter((svc) => selectedServices[svc.id]);
    if (chosen.length === 0) {
      alert("No services selected. Please pick at least one service.");
      return;
    }
    const svcMap: Record<string, number> = {};
    for (const s of chosen) {
      svcMap[s.id] = s.min_quantity ?? 1;
    }
    setSessionItem("selectedServicesWithQuantity", svcMap);

    router.push("/calculate/details");
  }

  return (
    <>
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        Photo Analysis
      </h1>
      <p className="text-gray-600 mb-4">
        Upload up to 4 photos, and we'll detect relevant categories.
      </p>

      <div className="mb-4">
        <label
          htmlFor="ai-photos"
          className="
            inline-block 
            border 
            border-blue-600 
            text-blue-600 
            px-4 
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
              <div key={idx} className="relative w-24 h-24">
                <img
                  src={createPreviewUrl(file)}
                  alt={`Photo ${idx + 1}`}
                  className="object-cover w-24 h-24 rounded"
                />
                <button
                  onClick={() => removeFile(idx)}
                  className="
                    absolute 
                    top-0 right-0 
                    bg-red-500 
                    text-white 
                    w-6 h-6 
                    rounded-full 
                    text-sm 
                    flex 
                    items-center 
                    justify-center
                  "
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
          <button
            onClick={handleAnalyze}
            className="
              px-4 py-2 
              bg-green-600 
              text-white 
              rounded 
              hover:bg-green-700
            "
          >
            Analyze Images
          </button>
        )}
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {recognizedCategories.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Found Categories</h2>
          <ul className="list-disc ml-5 text-gray-700 text-sm mt-1">
            {recognizedCategories.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {recommendedServices.length > 0 && (
        <div className="border-t pt-3 mt-4">
          <h2 className="text-lg font-semibold text-gray-800">Recommended Services</h2>
          <div className="max-h-60 overflow-auto pr-2 mt-2">
            {recommendedServices.map((svc) => {
              const isSelected = selectedServices[svc.id] || false;
              return (
                <label
                  key={svc.id}
                  className="flex items-center space-x-2 mb-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleService(svc.id)}
                  />
                  <span className="text-gray-700">
                    {svc.title}{" "}
                    <span className="text-xs text-gray-500 ml-1">
                      ({svc.category})
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {recommendedServices.length > 0 && (
        <div className="mt-6">
          <button
            onClick={handleContinue}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Continue
          </button>
        </div>
      )}
    </>
  );
}