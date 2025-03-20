"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useLocation } from "@/context/LocationContext";
import { setSessionItem, removeSessionItem } from "@/utils/session";
import { ALL_SERVICES } from "@/constants/services";
import { ALL_CATEGORIES } from "@/constants/categories";
import ServiceCard from "@/components/ui/ServiceCard";

function formatWithSeparator(value: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
function dashToDot(str: string) {
  return str.replaceAll("-", ".");
}
async function calculatePrice(params: {
  work_code: string;
  zipcode: string;
  unit_of_measurement: string;
  square: number;
}) {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://dev.thejamb.com";
  const url = `${baseUrl}/calculate`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      work_code: params.work_code,
      zipcode: params.zipcode,
      unit_of_measurement: params.unit_of_measurement,
      square: params.square,
      finishing_materials: [],
    }),
  });
  if (!res.ok) {
    throw new Error(`Failed to calculate price for code=${params.work_code}`);
  }
  return res.json();
}

type VectorSearchResult = {
  id: string;
  title: string;
  score: number;
};
type CombinedService = {
  id: string;
  title: string;
  score: number;
  description?: string;
  category?: string;
  unit_of_measurement?: string;
  min_quantity?: number;
  max_quantity?: number;
};

export default function AiEstimateTextPage() {
  const router = useRouter();
  const { location } = useLocation();

  const [userText, setUserText] = useState("");
  const [analysisDone, setAnalysisDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [recommendedServices, setRecommendedServices] = useState<CombinedService[]>([]);
  const [selectedServices, setSelectedServices] = useState<Record<string, boolean>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [manualInputs, setManualInputs] = useState<Record<string, string | null>>({});
  const [costs, setCosts] = useState<Record<string, number>>({});

  const [analysisDescription, setAnalysisDescription] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [visibleCount, setVisibleCount] = useState(8);

  useEffect(() => {
    if (error) {
      alert(error);
      setError(null);
    }
  }, [error]);

  useEffect(() => {
    async function recalcAll() {
      if (!recommendedServices.length) {
        setCosts({});
        return;
      }
      const { zip } = location;
      if (!/^\d{5}$/.test(zip)) return;

      const newCosts: Record<string, number> = {};
      for (const svc of recommendedServices) {
        const qty = quantities[svc.id] ?? svc.min_quantity ?? 1;
        const dotId = dashToDot(svc.id);
        const unit = svc.unit_of_measurement || "each";
        try {
          const calcResult = await calculatePrice({
            work_code: dotId,
            zipcode: zip,
            unit_of_measurement: unit,
            square: qty,
          });
          const labor = parseFloat(calcResult.work_cost || "0");
          const mat = parseFloat(calcResult.material_cost || "0");
          newCosts[svc.id] = labor + mat;
        } catch {
          newCosts[svc.id] = 0;
        }
      }
      setCosts(newCosts);
    }
    recalcAll();
  }, [recommendedServices, quantities, location]);

  function resetAllSessionData() {
    removeSessionItem("services_selectedSections");
    removeSessionItem("services_selectedCategories");
    removeSessionItem("selectedServicesWithQuantity");
  }

  async function handleAnalyze() {
    if (!userText.trim()) {
      setError("Please enter a description of your project.");
      return;
    }
    setAnalysisDone(false);
    setLoading(true);
    setRecommendedServices([]);
    setSelectedServices({});
    setQuantities({});
    setManualInputs({});
    setCosts({});
    setAnalysisDescription("");
    setRecommendation("");
    resetAllSessionData();

    try {
      const intentResp = await fetch("/api/ai-extract-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userText }),
      });
      if (!intentResp.ok) {
        throw new Error(`ai-extract-intent error: ${intentResp.status}`);
      }
      const intentData = await intentResp.json();
      let systemDescription = intentData.description || "";
      if (!systemDescription) {
        systemDescription = "We recognized some tasks from your request.";
      }

      const vecResp = await fetch("/api/vector-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userText }),
      });
      if (!vecResp.ok) {
        throw new Error(`Vector search error: ${vecResp.status}`);
      }
      const vecData = await vecResp.json();
      const topServices = (vecData.results || []) as VectorSearchResult[];

      let chatRec = "";
      try {
        const summarizeResp = await fetch("/api/chat-summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userInputText: userText,
            topServicesList: topServices.map((s) => ({
              title: s.title,
              similarityScore: s.score,
            })),
          }),
        });
        if (summarizeResp.ok) {
          const sumData = await summarizeResp.json();
          chatRec = sumData.recommendation || "";
        }
      } catch (_) {
        // optional catch
      }

      const joinedList: CombinedService[] = topServices.map((result) => {
        const found = ALL_SERVICES.find((x) => x.id === result.id);
        if (found) {
          return {
            id: found.id,
            title: found.title,
            score: result.score,
            description: found.description,
            category: found.category,
            unit_of_measurement: found.unit_of_measurement,
            min_quantity: found.min_quantity,
            max_quantity: found.max_quantity,
          };
        }
        return {
          id: result.id,
          title: result.title,
          score: result.score,
          description: "",
          category: "",
          unit_of_measurement: "each",
          min_quantity: 1,
          max_quantity: 9999,
        };
      });

      joinedList.sort((a, b) => b.score - a.score);
      setAnalysisDescription(systemDescription);
      setRecommendation(chatRec);

      const selMap: Record<string, boolean> = {};
      const qtyMap: Record<string, number> = {};
      for (const svc of joinedList) {
        selMap[svc.id] = false;
        qtyMap[svc.id] = svc.min_quantity ?? 1;
      }
      setSelectedServices(selMap);
      setQuantities(qtyMap);
      setRecommendedServices(joinedList);

      setAnalysisDone(true);
    } catch (err: any) {
      setError(err.message || "Error analyzing text");
    } finally {
      setLoading(false);
    }
  }

  function handleNewAnalysis() {
    const ok = window.confirm(
      "Start a new analysis? This will clear the current results."
    );
    if (!ok) return;
    setAnalysisDone(false);
    setLoading(false);
    setRecommendedServices([]);
    setSelectedServices({});
    setQuantities({});
    setManualInputs({});
    setCosts({});
    setAnalysisDescription("");
    setRecommendation("");
    setUserText("");
    resetAllSessionData();
  }

  function toggleSelected(svcId: string) {
    setSelectedServices((prev) => ({ ...prev, [svcId]: !prev[svcId] }));
  }

  function handlePlusMinus(
    svcId: string,
    increment: boolean,
    unit: string,
    minQ: number
  ) {
    setManualInputs((old) => ({ ...old, [svcId]: null }));
    setQuantities((old) => {
      const found = recommendedServices.find((x) => x.id === svcId);
      if (!found) return old;
      const maxQ = found.max_quantity ?? 9999;

      let val = old[svcId] ?? minQ;
      val = increment ? val + 1 : val - 1;
      if (val < minQ) val = minQ;
      if (val > maxQ) val = maxQ;

      return { ...old, [svcId]: unit === "each" ? Math.round(val) : val };
    });
  }

  function handleQuantityChange(
    svcId: string,
    typedValue: string,
    unit: string,
    minQ: number
  ) {
    setManualInputs((old) => ({ ...old, [svcId]: typedValue }));
    let numVal = parseFloat(typedValue.replace(/,/g, "")) || 0;
    if (numVal < minQ) numVal = minQ;
    const found = recommendedServices.find((x) => x.id === svcId);
    if (!found) return;
    const maxQ = found.max_quantity ?? 9999;
    if (numVal > maxQ) numVal = maxQ;

    setQuantities((old) => ({
      ...old,
      [svcId]: unit === "each" ? Math.round(numVal) : numVal,
    }));
  }

  function handleClickInput(svcId: string) {
    setManualInputs((old) => ({ ...old, [svcId]: "" }));
  }

  function handleBlurInput(svcId: string) {
    if (manualInputs[svcId] === "") {
      setManualInputs((old) => ({ ...old, [svcId]: null }));
    }
  }

  function handleProceed() {
    const chosen = recommendedServices.filter((svc) => selectedServices[svc.id]);
    if (!chosen.length) {
      alert("No services selected! Please pick at least one.");
      return;
    }
    const svcMap: Record<string, number> = {};
    const catSet = new Set<string>();
    const secSet = new Set<string>();

    for (const s of chosen) {
      svcMap[s.id] = quantities[s.id] ?? s.min_quantity ?? 1;
      const parts = s.id.split("-");
      if (parts.length >= 2) {
        const catId = parts.slice(0, 2).join("-");
        catSet.add(catId);
        const catObj = ALL_CATEGORIES.find((xx) => xx.id === catId);
        if (catObj) {
          secSet.add(catObj.section);
        }
      }
    }

    if (location.city) setSessionItem("address", location.city);
    if (location.state) setSessionItem("stateName", location.state);
    if (location.zip) setSessionItem("zip", location.zip);

    setSessionItem("selectedServicesWithQuantity", svcMap);
    setSessionItem("services_selectedCategories", Array.from(catSet));
    setSessionItem("services_selectedSections", Array.from(secSet));
    router.push("/calculate/details");
  }

  function showMore() {
    setVisibleCount((old) => old + 8);
  }
  const currentServices = recommendedServices.slice(0, visibleCount);

  function getSelectedCountAndTotal() {
    let count = 0;
    let total = 0;
    for (const s of recommendedServices) {
      if (selectedServices[s.id]) {
        count++;
        total += costs[s.id] || 0;
      }
    }
    return { count, total };
  }
  const { count: selectedCount, total: selectedTotal } = getSelectedCountAndTotal();

  // Wrappers for ServiceCard
  const onMinusClick = (serviceId: string) => {
    const svc = recommendedServices.find((x) => x.id === serviceId);
    if (!svc) return;
    handlePlusMinus(serviceId, false, svc.unit_of_measurement || "each", svc.min_quantity || 1);
  };
  const onPlusClick = (serviceId: string) => {
    const svc = recommendedServices.find((x) => x.id === serviceId);
    if (!svc) return;
    handlePlusMinus(serviceId, true, svc.unit_of_measurement || "each", svc.min_quantity || 1);
  };
  const onChangeQuantity = (serviceId: string, value: string) => {
    const svc = recommendedServices.find((x) => x.id === serviceId);
    if (!svc) return;
    handleQuantityChange(serviceId, value, svc.unit_of_measurement || "each", svc.min_quantity || 1);
  };
  const onFocusQuantity = (serviceId: string) => {
    handleClickInput(serviceId);
  };
  const onBlurQuantity = (serviceId: string) => {
    handleBlurInput(serviceId);
  };
  const onToggleSelect = (serviceId: string) => {
    toggleSelected(serviceId);
  };

  return (
    <main className="min-h-screen">
      <div className="container mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          AI Text Estimate
        </h1>
        <p className="text-gray-600 mb-4">
          Describe your home project, and we’ll suggest relevant services.
        </p>

        <div className="mb-4">
          <textarea
            rows={5}
            value={userText}
            onChange={(e) => setUserText(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none"
            placeholder='e.g. "Paint my living room walls, remove old carpet..."'
          />
        </div>

        <div className="mb-4">
          {!analysisDone && !loading && (
            <button
              onClick={handleAnalyze}
              className="w-full lg:w-[300px] px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Analyze
            </button>
          )}
          {loading && (
            <button
              disabled
              className="w-full lg:w-[300px] px-4 py-2 bg-gray-300 text-gray-600 rounded cursor-not-allowed"
            >
              Analyzing...
            </button>
          )}
          {analysisDone && !loading && (
            <button
              onClick={handleNewAnalysis}
              className="w-full lg:w-[300px] px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              New analysis
            </button>
          )}
        </div>

        {analysisDone && (analysisDescription || recommendation) && (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Analysis Results
            </h2>
            <p className="text-gray-700 mb-2">
              <strong>Description:</strong> {analysisDescription}
            </p>
            <p className="text-gray-700">
              <strong>Recommendation:</strong> {recommendation}
            </p>
          </div>
        )}

        {analysisDone && currentServices.length > 0 && (
          <div>
            <h2 className="text-xl font-medium text-gray-800 mb-3">
              Recommended Services
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {currentServices.map((svc) => {
                const isSelected = !!selectedServices[svc.id];
                const qty = quantities[svc.id] ?? svc.min_quantity ?? 1;
                const typedVal = manualInputs[svc.id];
                const costVal = costs[svc.id] ?? 0;

                return (
                  <ServiceCard
                    key={svc.id}
                    service={svc}
                    quantity={qty}
                    typedValue={typedVal}
                    cost={costVal}
                    isSelected={isSelected}
                    formatWithSeparator={formatWithSeparator}
                    onMinusClick={onMinusClick}
                    onPlusClick={onPlusClick}
                    onChangeQuantity={onChangeQuantity}
                    onFocusQuantity={onFocusQuantity}
                    onBlurQuantity={onBlurQuantity}
                    onToggleSelect={onToggleSelect}
                  />
                );
              })}
            </div>

            {visibleCount < recommendedServices.length && (
              <div className="mt-4">
                <button
                  onClick={showMore}
                  className="w-full lg:w-[300px] bg-gray-200 hover:bg-gray-300 px-4 py-2 mt-4 rounded text-base font-semibold text-gray-700"
                >
                  Show More Services
                </button>
              </div>
            )}

            {selectedCount > 0 && (
              <div className="mt-4 mb-4 text-gray-700 text-base font-semibold">
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
              onClick={handleProceed}
              className="w-full lg:w-[300px] px-4 py-2 bg-blue-600 text-white mt-4 font-semibold rounded hover:bg-blue-700"
            >
              Proceed
            </button>
          </div>
        )}

        {analysisDone && recommendedServices.length === 0 && (
          <div className="mt-6">
            <p className="text-gray-600">No relevant services found.</p>
          </div>
        )}
      </div>
    </main>
  );
}