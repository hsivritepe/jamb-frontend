"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useLocation } from "@/context/LocationContext";
import { setSessionItem, removeSessionItem } from "@/utils/session";
import { ALL_SERVICES } from "@/constants/services";
import { ALL_CATEGORIES } from "@/constants/categories";

/**
 * Format a number with commas and two decimals (e.g., 1234.56 => "1,234.56").
 */
function formatWithSeparator(value: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Convert a dash-separated string into a dot-separated string.
 * e.g. "1-2-3" => "1.2.3"
 */
function dashToDot(str: string) {
  return str.replaceAll("-", ".");
}

/**
 * Component to render a service image from a given serviceId.
 * If the image fails to load, we display a fallback image.
 */
function ServiceImage({ serviceId }: { serviceId: string }) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const dotted = dashToDot(serviceId);
    const firstSeg = serviceId.split("-")[0];
    const fullUrl = `https://dev.thejamb.com/images/${firstSeg}/${dotted}.jpg`;
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

/**
 * Calls the /calculate endpoint to retrieve labor + materials cost.
 */
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
    throw new Error(`Failed to calculate price: code=${params.work_code}`);
  }
  return res.json();
}

/**
 * Normalize a string by trimming and converting it to lowercase.
 * This helps in word matching.
 */
function normalize(str: string) {
  return str.trim().toLowerCase();
}

/**
 * This function maps broad categories recognized by AI to a more
 * granular set of categories used in ALL_SERVICES.
 */
function mapRecognizedCategory(input: string): string[] {
  const c = normalize(input);

  if (c === "painting") {
    return [
      "Walls",
      "Ceilings",
      "Acoustic Ceiling",
      "Trim and Molding",
      "Doors",
      "Windows",
      "Cabinetry",
      "Concrete and Masonry",
      "Baseboard",
      "Wallpaper",
    ];
  }
  if (c === "flooring") {
    return [
      "Laminate",
      "Carpet",
      "Wood floor",
      "Engineered Wood",
      "Bamboo Flooring",
      "Vinyl Tile",
      "Vinyl Covering",
      "Solid wood",
      "Underlayment",
    ];
  }
  if (c === "lighting") {
    return ["Ceiling fan", "Light fixture", "Chandelier", "Track Lighting"];
  }
  if (c === "plumbing") {
    return [
      "Toilet",
      "Shower",
      "Bathtub",
      "Sink",
      "Faucet",
      "Water Heater",
      "Garbage Disposal",
      "Clogged Drain",
      "Pipes",
    ];
  }
  if (c === "electrical") {
    return [
      "Smoke Detector",
      "Ceiling fan",
      "Light fixture",
      "Switch",
      "Outlet",
      "Dimmer Switch",
      "Chandelier",
      "Wiring",
      "Troubleshooting",
      "Track Lighting",
    ];
  }
  if (c === "carpentry") {
    return [
      "Cabinet",
      "Trim and Molding",
      "Framing",
      "Beam and Column",
      "Foundation",
      "Doors",
      "Windows",
      "Stairs",
      "Wood Paneling",
      "Countertop",
    ];
  }
  if (c === "hvac") {
    return [
      "Air Conditioner",
      "AC",
      "Furnace",
      "Boiler",
      "Heat Pump",
      "Mini Split Air Conditioner",
      "Window AC",
      "Ventilation System",
      "Ductwork",
      "Thermostat",
      "Heater",
      "Air Quality",
      "Freestanding Stoves",
      "Fireplaces",
    ];
  }
  if (c === "cleaning") {
    return [
      "Regular Cleaning",
      "General Cleaning",
      "Specialized",
      "Windows",
      "Window Cleaning",
      "Janitorial",
      "Post-Event",
      "Emergency",
      "Biohazard",
    ];
  }
  if (c === "wall and ceiling") {
    return [
      "Drywall repair",
      "Texture drywall",
      "Acoustic Drywall",
      "Drywall Installation",
      "Venetian Plaster",
      "Ceiling Drywall",
      "Drywall Finishing",
      "Specialty Drywall",
      "Drywall Demolition",
      "Bricks",
    ];
  }
  if (c === "appliance") {
    return [
      "Refrigerator",
      "Oven",
      "Dishwasher",
      "Washer",
      "Dryer",
      "Microwave",
      "Range Hood",
      "Diagnostic",
    ];
  }
  if (c === "security") {
    return [
      "Alarm System",
      "CCTV",
      "Smart Lock",
      "Intercom System",
      "Access Control",
      "Motion Sensor",
      "Door Sensor",
      "Water Detector",
    ];
  }
  if (c === "audio-visual") {
    return [
      "Projector",
      "Screen",
      "Sound System",
      "Speaker",
      "AV Receiver",
      "Cable and Wire",
      "TV Wall",
      "Wi-Fi",
      "Sound Absorbing",
      "Troubleshooting",
    ];
  }
  if (c === "furniture") {
    return [
      "Assembly",
      // "Installation", // removed to avoid conflicts
      "Repair",
      "Cleaning",
      "Storage",
      "Upholstery",
      "Removal",
      "Commercial",
    ];
  }
  if (c === "moving") {
    return [
      "Residential Local",
      "Commercial Local",
      "Packing/Unpacking",
      "Specialty",
      "Storage Solutions",
      "Cleaning Services",
    ];
  }
  if (c === "outdoor painting") {
    return [
      "Exterior Wall",
      "Fence",
      "Deck",
      "Window Trim",
      "Doors",
      "Shutter",
      "Trim",
      "Stucco",
      "Brick",
      "Concrete",
    ];
  }
  if (c === "outdoor carpentry") {
    return [
      "Deck",
      "Fence",
      "Pergola",
      "Gazebo",
      "Outdoor Furniture",
      "Storage",
      "Playground",
      "Staircases",
      "Walkway",
      "Dock",
      "Floating dock",
      "Maintenance",
    ];
  }
  if (c === "outdoor electrical") {
    return [
      "Electrical Panel",
      "Outlet and Switch",
      "EV Chargers",
      "Pool and Spa",
      "Ceiling Fans",
      "Audio and Video",
      "Backup Power",
      "Safety Inspections",
      "Solar Panels",
      "Maintenance",
    ];
  }
  if (c === "outdoor cleaning") {
    return [
      "Deck and Patio",
      "Driveway",
      "Hot Tub",
      "House Washing",
      "Fence",
      "Gutter",
      "Roof",
      "Exterior Fixture",
      "Pool",
      "Doors and Window",
    ];
  }
  if (c === "outdoor lighting") {
    return [
      "Path Lights",
      "Deck and Patio",
      "Wall Lights",
      "Security Lighting",
      "Pool Lighting",
      "Smart Lighting",
      "Christmas Lights",
      "Maintenance",
    ];
  }
  if (c === "roofing") {
    return [
      "Leak Repair",
      "Shingle Roof",
      "Metal Roof",
      "Tile Roof",
      "Flat Roof",
      "Roof Inspection",
      "Gutter",
      "Roof Ventilation",
      "Skylight",
      "Sheathing",
    ];
  }
  if (c === "landscaping") {
    return [
      "Lawn Maintenance",
      "Lawn Seeding",
      "Tree Pruning",
      "Planting",
      "Mulching",
      "Landscape Rocks",
      "Edging",
      "Garden Beds",
      "Hedge",
      "Walkway and Path",
      "Water Features",
      "Irrigation System",
      "Drainage",
      "Greenhouses",
    ];
  }
  if (c === "outdoor appliance") {
    return [
      "Grills",
      "Outdoor Kitchen",
      "Fire Pit",
      "Fireplace",
      "Patio Heater",
      "Hot Tubs",
      "Pool",
      "Refrigeration",
      "Outdoor Cooling",
    ];
  }
  if (c === "facade") {
    return [
      "Wood Siding",
      "Vinyl Siding",
      "Brick Veneer",
      "Stone Cladding",
      "Stucco",
      "Metal Cladding",
      "Glass Facades",
      "Composite Paneling",
      "Trims and moldings",
      "Underlayment",
      "Pest Control",
      "Maintenance",
    ];
  }
  if (c === "outdoor security") {
    return [
      "CCTV",
      "Wireless Cameras",
      "Security Alarms",
      "Doorbell Cameras",
      "Biometric Access",
      "Keypad Access",
    ];
  }

  return [input];
}

/**
 * Expand recognized categories into synonyms, then filter ALL_SERVICES
 * for matching categories only.
 */
function findServicesFromSynonyms(recCats: string[]) {
  const expanded: string[] = [];
  for (const c of recCats) {
    const arr = mapRecognizedCategory(c);
    expanded.push(...arr);
  }
  const catSet = new Set(expanded.map(normalize));
  return ALL_SERVICES.filter((svc) =>
    catSet.has(normalize(svc.category || ""))
  );
}

/**
 * Very naive text overlap to compute "relevance" of a service to a user's text.
 */
function computeRelevance(svc: (typeof ALL_SERVICES)[number], userText: string) {
  const textWords = normalize(userText).split(/\s+/);
  const bigStr = `${normalize(svc.title)} ${normalize(svc.description || "")}`;
  let score = 0;
  for (const w of textWords) {
    if (w.length < 3) continue;
    if (bigStr.includes(w)) score++;
  }
  return score;
}

export default function AiEstimateTextPage() {
  const router = useRouter();
  const { location } = useLocation();

  const [userText, setUserText] = useState("");
  const [analysisDone, setAnalysisDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [recognizedCategories, setRecognizedCategories] = useState<string[]>([]);
  const [quantitiesMap, setQuantitiesMap] = useState<Record<string, number>>({});
  const [analysisDescription, setAnalysisDescription] = useState("");
  const [recommendation, setRecommendation] = useState("");

  const [recommendedServices, setRecommendedServices] =
    useState<typeof ALL_SERVICES>([]);
  const [selectedServices, setSelectedServices] = useState<Record<string, boolean>>(
    {}
  );
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [manualInputs, setManualInputs] = useState<Record<string, string | null>>(
    {}
  );
  const [costs, setCosts] = useState<Record<string, number>>({});

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
      if (!/^\d{5}$/.test(zip)) {
        return;
      }

      const newCosts: Record<string, number> = {};
      for (const svc of recommendedServices) {
        const q = quantities[svc.id] ?? svc.min_quantity ?? 1;
        const dotId = dashToDot(svc.id);
        try {
          const resp = await calculatePrice({
            work_code: dotId,
            zipcode: zip,
            unit_of_measurement: svc.unit_of_measurement,
            square: q,
          });
          const labor = parseFloat(resp.work_cost || "0");
          const mat = parseFloat(resp.material_cost || "0");
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

    setRecognizedCategories([]);
    setQuantitiesMap({});
    setAnalysisDescription("");
    setRecommendation("");
    setRecommendedServices([]);
    setSelectedServices({});
    setQuantities({});
    setManualInputs({});
    setCosts({});
    setAnalysisDone(false);

    resetAllSessionData();
    setLoading(true);

    try {
      const resp = await fetch("/api/predict-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userText }),
      });
      if (!resp.ok) {
        throw new Error(`Predict text error: ${resp.status}`);
      }
      const data = await resp.json();

      const cats = data.categories || [];
      setRecognizedCategories(cats);
      setQuantitiesMap(data.quantities || {});
      setAnalysisDescription(data.description || "");
      setRecommendation(data.recommendation || "");

      let allMatchedServices: typeof ALL_SERVICES = [];

      for (const singleCat of cats) {
        let catServices = findServicesFromSynonyms([singleCat]);
        let scored = catServices.map((svc) => {
          const baseScore = 10;
          const textScore = computeRelevance(svc, userText);
          const totalScore = baseScore + textScore;
          return { svc, score: totalScore };
        });
        scored = scored.filter((x) => x.score >= 10);
        scored.sort((a, b) => b.score - a.score);
        scored = scored.slice(0, 5);
        allMatchedServices.push(...scored.map((x) => x.svc));
      }

      const uniqueMatched: typeof ALL_SERVICES = [];
      const usedIds = new Set<string>();
      for (const svc of allMatchedServices) {
        if (!usedIds.has(svc.id)) {
          usedIds.add(svc.id);
          uniqueMatched.push(svc);
        }
      }

      setRecommendedServices(uniqueMatched);

      const selMap: Record<string, boolean> = {};
      const qtyMap: Record<string, number> = {};
      for (const s of uniqueMatched) {
        selMap[s.id] = false;
        qtyMap[s.id] = s.min_quantity ?? 1;
      }
      setSelectedServices(selMap);
      setQuantities(qtyMap);

      setAnalysisDone(true);
    } catch (err: any) {
      setError(err.message || "Error analyzing text");
    } finally {
      setLoading(false);
    }
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

      return {
        ...old,
        [svcId]: unit === "each" ? Math.round(val) : val,
      };
    });
  }

  function handleQuantityChange(
    svcId: string,
    val: string,
    unit: string,
    minQ: number
  ) {
    setManualInputs((old) => ({ ...old, [svcId]: val }));

    let num = parseFloat(val.replace(/,/g, "")) || 0;
    if (num < minQ) num = minQ;

    const found = recommendedServices.find((x) => x.id === svcId);
    if (!found) return;
    const maxQ = found.max_quantity ?? 9999;
    if (num > maxQ) num = maxQ;

    setQuantities((old) => ({
      ...old,
      [svcId]: unit === "each" ? Math.round(num) : num,
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
      alert("No services selected. Please pick at least one service.");
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

  const [visibleCount, setVisibleCount] = useState(8);
  function showMore() {
    setVisibleCount((old) => old + 8);
  }
  const currentServices = recommendedServices.slice(0, visibleCount);

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
    <main className="min-h-screen">
      <div className="container mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          AI Text Estimate
        </h1>
        <p className="text-gray-600 mb-4">
          Describe your home project and we’ll suggest relevant services,
          sorted by relevance.
        </p>

        <div className="mb-4">
          <textarea
            rows={5}
            value={userText}
            onChange={(e) => setUserText(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none"
            placeholder="E.g. 'Paint my living room walls, remove old carpet, install laminate, also add a new ceiling fan...'"
          />
        </div>

        <div className="mb-4">
          {!analysisDone && !loading && (
            <button
              onClick={handleAnalyze}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Analyze
            </button>
          )}
          {loading && (
            <button
              disabled
              className="px-4 py-2 bg-gray-300 text-gray-600 rounded cursor-not-allowed"
            >
              Analyzing...
            </button>
          )}
          {analysisDone && !loading && (
            <button
              disabled
              className="px-4 py-2 bg-gray-300 text-gray-600 rounded cursor-not-allowed"
            >
              Analysis complete
            </button>
          )}
        </div>

        {analysisDone && (
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
                          onClick={() => handleClickInput(svc.id)}
                          onBlur={() => handleBlurInput(svc.id)}
                          onChange={(e) =>
                            handleQuantityChange(
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
                        <span className="font-bold text-gray-800">
                          ${formatWithSeparator(costVal)}
                        </span>
                        <button
                          onClick={() => toggleSelected(svc.id)}
                          className={
                            `text-sm font-semibold px-3 py-1 rounded ` +
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

            {visibleCount < recommendedServices.length && (
              <div className="mt-4">
                <button
                  onClick={showMore}
                  className="w-full lg:w-[300px] bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-base font-semibold text-gray-700"
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
              </div>
            )}

            <button
              onClick={handleProceed}
              className="w-full lg:w-[300px] px-4 py-2 bg-blue-600 text-white mt-2 font-semibold rounded hover:bg-blue-700"
            >
              Proceed
            </button>
          </div>
        )}
      </div>
    </main>
  );
}