"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useLocation } from "@/context/LocationContext";
import { setSessionItem, removeSessionItem } from "@/utils/session";
import { ALL_SERVICES } from "@/constants/services";
import { ALL_CATEGORIES } from "@/constants/categories";

/** Format a numeric value with commas and 2 decimals. */
function formatWithSeparator(value: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Convert dash notation ("1-2-3") into dot notation ("1.2.3"). */
function dashToDot(str: string) {
  return str.replaceAll("-", ".");
}

/** 
 * Renders a service image from dev.thejamb.com/images/{firstSeg}/{dottedId}.jpg 
 * If load fails, shows fallback.
 */
function ServiceImage({ serviceId }: { serviceId: string }) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const dottedId = dashToDot(serviceId);
    const firstSeg = serviceId.split("-")[0];
    const fullUrl = `https://dev.thejamb.com/images/${firstSeg}/${dottedId}.jpg`;
    setImgSrc(fullUrl);
  }, [serviceId]);

  if (!imgSrc) return null;
  if (failed) {
    return (
      <img
        src="/images/fallback-service.jpg"
        alt="Fallback"
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

/** POST /calculate to get labor+materials cost. */
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

/** Vector-search item shape. */
type VectorSearchResult = {
  id: string;    // "1-1-1" etc
  title: string; // "Battery-Operated Smoke Detector Installation"
  score: number;
};

/** Merged with ALL_SERVICES => full data. */
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

/** The main AI Text Estimate page. */
export default function AiEstimateTextPage() {
  const router = useRouter();
  const { location } = useLocation();

  // The user’s text describing the project
  const [userText, setUserText] = useState("");

  // Are we analyzing? Did we finish?
  const [analysisDone, setAnalysisDone] = useState(false);
  const [loading, setLoading] = useState(false);
  // Error
  const [error, setError] = useState<string | null>(null);

  // Final recommended services
  const [recommendedServices, setRecommendedServices] = useState<CombinedService[]>([]);
  const [selectedServices, setSelectedServices] = useState<Record<string, boolean>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [manualInputs, setManualInputs] = useState<Record<string, string | null>>({});
  const [costs, setCosts] = useState<Record<string, number>>({});

  // Additional analysis data: summary/description, recommendation
  const [analysisDescription, setAnalysisDescription] = useState("");
  const [recommendation, setRecommendation] = useState("");

  // If error => alert
  useEffect(() => {
    if (error) {
      alert(error);
      setError(null);
    }
  }, [error]);

  // Recompute cost if recommendedServices/quantities/zip changes
  useEffect(() => {
    async function recalcAll() {
      if (!recommendedServices.length) {
        setCosts({});
        return;
      }
      const { zip } = location;
      if (!/^\d{5}$/.test(zip)) {
        return;
      }

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

  /** Clear session data. */
  function resetAllSessionData() {
    removeSessionItem("services_selectedSections");
    removeSessionItem("services_selectedCategories");
    removeSessionItem("selectedServicesWithQuantity");
  }

  /** 
   * handleAnalyze:
   * 1) call /api/ai-extract-intent => parse user text => get "tasks" or synonyms
   * 2) call /api/vector-search => get top 10 matches
   * 3) call /api/chat-summarize => short marketing text
   * 4) combine => setRecommendedServices
   */
  async function handleAnalyze() {
    if (!userText.trim()) {
      setError("Please enter a description of your project.");
      return;
    }

    // Reset
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
      // 1) "Comprehend" the user text => GPT returns a simpler label or synonyms
      const intentResp = await fetch("/api/ai-extract-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userText }),
      });
      if (!intentResp.ok) {
        throw new Error(`ai-extract-intent error: ${intentResp.status}`);
      }
      const intentData = await intentResp.json();

      // We'll store "analysisDescription" from the returned text
      let systemDescription = intentData.description || "";
      if (systemDescription.length === 0) {
        systemDescription = "We recognized some tasks from your request.";
      }

      // 2) Now do the vector search using the entire userText (or the GPT synonyms)
      const vecResp = await fetch("/api/vector-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userText }), // or synonyms from intentData
      });
      if (!vecResp.ok) {
        throw new Error(`Vector search error: ${vecResp.status}`);
      }
      const vecData = await vecResp.json();
      const topServices = (vecData.results || []) as VectorSearchResult[];

      // 3) Summarize => short marketing text
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
      } catch (sumErr) {
        console.warn("chat-summarize failed:", sumErr);
      }

      // 4) Join each vector-search result with ALL_SERVICES
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
        } else {
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
        }
      });

      // Sort joinedList by score descending (optional)
      joinedList.sort((a, b) => b.score - a.score);

      // Set states
      setAnalysisDescription(systemDescription);
      setRecommendation(chatRec);

      // Initialize selection + quantity
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

  /** 
   * New analysis: confirm, then clear all states so user can do another query.
   */
  function handleNewAnalysis() {
    const ok = window.confirm(
      "Start a new analysis? This will clear the current results."
    );
    if (!ok) return;

    // Reset everything
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

    // Also clear session data if needed
    resetAllSessionData();
  }

  /** Toggle selected vs not. */
  function toggleSelected(svcId: string) {
    setSelectedServices((prev) => ({ ...prev, [svcId]: !prev[svcId] }));
  }

  /** Increment or decrement quantity. */
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

      return {
        ...old,
        [svcId]: unit === "each" ? Math.round(val) : val,
      };
    });
  }

  /** Manually typed quantity => parse to number. */
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

  /** If user clicks input => empty it. */
  function handleClickInput(svcId: string) {
    setManualInputs((old) => ({ ...old, [svcId]: "" }));
  }

  /** If user leaves it blank => revert. */
  function handleBlurInput(svcId: string) {
    if (manualInputs[svcId] === "") {
      setManualInputs((old) => ({ ...old, [svcId]: null }));
    }
  }

  /** On Proceed => store chosen services => go to /calculate/details */
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

      // "1-2-3" => "1-2" => find in ALL_CATEGORIES => get .section
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

    // Optionally store location
    if (location.city) setSessionItem("address", location.city);
    if (location.state) setSessionItem("stateName", location.state);
    if (location.zip) setSessionItem("zip", location.zip);

    // Now store in session
    setSessionItem("selectedServicesWithQuantity", svcMap);
    setSessionItem("services_selectedCategories", Array.from(catSet));
    setSessionItem("services_selectedSections", Array.from(secSet));

    router.push("/calculate/details");
  }

  /** Show more than 8 results. */
  const [visibleCount, setVisibleCount] = useState(8);
  function showMore() {
    setVisibleCount((old) => old + 8);
  }

  const currentServices = recommendedServices.slice(0, visibleCount);

  /** How many selected? total cost? */
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

  return (
    <main className="min-h-screen">
      <div className="container mx-auto">
        {/* Title */}
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          AI Text Estimate
        </h1>
        <p className="text-gray-600 mb-4">
          Describe your home project, and we’ll suggest relevant services.
        </p>

        {/* Text input */}
        <div className="mb-4">
          <textarea
            rows={5}
            value={userText}
            onChange={(e) => setUserText(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none"
            placeholder='e.g. "Paint my living room walls, remove old carpet, install laminate, and add a new ceiling fan."'
          />
        </div>

        {/* Analyze button(s) */}
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

        {/* Analysis info (optional) */}
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

        {/* The recommended services */}
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
                const displayVal =
                  typedVal !== null && typedVal !== undefined
                    ? typedVal
                    : String(qty);

                const minQ = svc.min_quantity ?? 1;
                const costVal = costs[svc.id] ?? 0;
                const borderClass = isSelected
                  ? "border-blue-500"
                  : "border-gray-300";

                return (
                  <div
                    key={svc.id}
                    className={`border ${borderClass} rounded p-3 bg-white shadow-sm flex flex-col`}
                  >
                    {/* Image */}
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
                              svc.unit_of_measurement || "each",
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
                          onClick={() => handleClickInput(svc.id)}
                          onBlur={() => handleBlurInput(svc.id)}
                          onChange={(e) =>
                            handleQuantityChange(
                              svc.id,
                              e.target.value,
                              svc.unit_of_measurement || "each",
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
                              svc.unit_of_measurement || "each",
                              minQ
                            )
                          }
                          className="w-8 h-8 bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg rounded"
                        >
                          +
                        </button>
                        <span className="text-sm text-gray-600 ml-1">
                          {svc.unit_of_measurement || "each"}
                        </span>
                      </div>

                      {/* Cost & Add/Remove */}
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-800">
                          ${formatWithSeparator(costVal)}
                        </span>
                        <button
                          onClick={() => toggleSelected(svc.id)}
                          className={
                            "text-sm font-semibold px-3 py-1 rounded " +
                            (isSelected
                              ? "bg-red-600 text-white hover:bg-red-700"
                              : "bg-blue-600 text-white hover:bg-blue-700")
                          }
                        >
                          {isSelected ? "Remove" : "Add"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Show more */}
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

            {/* If user selected anything, show total */}
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

            {/* Proceed */}
            <button
              onClick={handleProceed}
              className="w-full lg:w-[300px] px-4 py-2 bg-blue-600 text-white mt-4 font-semibold rounded hover:bg-blue-700"
            >
              Proceed
            </button>
          </div>
        )}

        {/* If no results */}
        {analysisDone && recommendedServices.length === 0 && (
          <div className="mt-6">
            <p className="text-gray-600">No relevant services found.</p>
          </div>
        )}
      </div>
    </main>
  );
}