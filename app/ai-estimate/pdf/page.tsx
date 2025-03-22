"use client";
import React, { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useLocation } from "@/context/LocationContext";
import { setSessionItem, removeSessionItem } from "@/utils/session";
import { ALL_SERVICES } from "@/constants/services";
import { ALL_CATEGORIES } from "@/constants/categories";
import ServiceCard from "@/components/ui/ServiceCard";

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "https://dev.thejamb.com";
}

async function fetchFinishingMaterials(workCode: string) {
  const url = `${getApiBaseUrl()}/work/finishing_materials`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ work_code: workCode }),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch finishing materials (work_code=${workCode}).`);
  }
  return res.json();
}

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
  finishing_materials: string[];
}) {
  const url = `${getApiBaseUrl()}/calculate`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error(`Failed to calculate price (code=${params.work_code}).`);
  }
  return res.json();
}

// Resets session data
function resetAllSessionData() {
  removeSessionItem("selectedServicesWithQuantity");
  removeSessionItem("services_selectedCategories");
  removeSessionItem("services_selectedSections");
}

export default function AiEstimatePdfPage() {
  const router = useRouter();
  const { location } = useLocation();

  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [analysisDone, setAnalysisDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recommended services
  const [recommendedServices, setRecommendedServices] = useState<typeof ALL_SERVICES>([]);
  const [selectedServices, setSelectedServices] = useState<Record<string, boolean>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [manualInputs, setManualInputs] = useState<Record<string, string | null>>({});
  const [costs, setCosts] = useState<Record<string, number>>({});

  // Finishing materials
  const [finishingMaterialsMap, setFinishingMaterialsMap] = useState<Record<string, any>>({});
  const [finishingMaterialSelections, setFinishingMaterialSelections] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (error) {
      alert(error);
      setError(null);
    }
  }, [error]);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []);
    e.target.value = "";
    if (!selected.length) return;

    if (pdfFiles.length + selected.length > 4) {
      setError("You can upload up to 4 PDF files.");
      return;
    }

    if (analysisDone) {
      // Reset if user picks new files after done
      setPdfFiles([]);
      setRecommendedServices([]);
      setSelectedServices({});
      setQuantities({});
      setCosts({});
      setAnalysisDone(false);
    }

    // Filter only PDFs
    const filtered = selected.filter((file) => file.type === "application/pdf");
    if (filtered.length < selected.length) {
      setError("Some uploaded files are not PDF and were skipped.");
    }

    setPdfFiles((prev) => [...prev, ...filtered]);
  }

  function removeFile(idx: number) {
    setPdfFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  // Merge services from AI with local data
  function mergeServices(services: any[]) {
    return services.map((svc) => {
      const found = ALL_SERVICES.find((x) => x.id === svc.id);
      if (found) {
        return {
          ...found,
          ...svc, // in case AI provides description changes
          unit_of_measurement: found.unit_of_measurement || "each",
          min_quantity: found.min_quantity ?? 1,
          max_quantity: found.max_quantity ?? 9999,
        };
      }
      // fallback if not found
      return {
        ...svc,
        unit_of_measurement: svc.unit_of_measurement || "each",
        min_quantity: svc.min_quantity ?? 1,
        max_quantity: svc.max_quantity ?? 9999,
      };
    });
  }

  async function handleAnalyze() {
    if (!pdfFiles.length) {
      setError("Please upload at least 1 PDF file.");
      return;
    }

    resetAllSessionData();
    setLoading(true);
    setAnalysisDone(false);
    setRecommendedServices([]);
    setSelectedServices({});
    setQuantities({});
    setCosts({});

    try {
      const fd = new FormData();
      pdfFiles.forEach((f) => fd.append("files", f));

      const resp = await fetch("/api/predict-pdf", { method: "POST", body: fd });
      if (!resp.ok) {
        throw new Error(`Predict error: ${resp.status}`);
      }
      const data = await resp.json();
      const services = data.services || [];

      // Convert AI services to match local
      const merged = mergeServices(services);
      setRecommendedServices(merged);

      // Init default quantities and selections
      const initQty: Record<string, number> = {};
      const initSel: Record<string, boolean> = {};
      merged.forEach((svc) => {
        initQty[svc.id] = svc.min_quantity ?? 1;
        initSel[svc.id] = false;
      });
      setQuantities(initQty);
      setSelectedServices(initSel);

      setAnalysisDone(true);
    } catch (err: any) {
      setError(err.message || "Error analyzing PDFs");
    } finally {
      setLoading(false);
    }
  }

  // Fetch finishing materials
  useEffect(() => {
    async function loadFinishingMaterials() {
      const copyMap = { ...finishingMaterialsMap };
      const copySelections = { ...finishingMaterialSelections };
      let changed = false;
      let picksChanged = false;

      for (const svc of recommendedServices) {
        if (!copyMap[svc.id]) {
          try {
            const dot = dashToDot(svc.id);
            const data = await fetchFinishingMaterials(dot);
            copyMap[svc.id] = data;
            changed = true;
          } catch (err) {
            console.error("Error fetching finishing materials:", svc.id, err);
          }
        }
      }

      for (const svc of recommendedServices) {
        if (!copyMap[svc.id]) continue;
        if (!copySelections[svc.id]) {
          const fmData = copyMap[svc.id];
          const sections = fmData?.sections || {};
          const picks: string[] = [];
          for (const arr of Object.values(sections)) {
            if (Array.isArray(arr) && arr.length > 0) {
              picks.push(arr[0].external_id);
            }
          }
          copySelections[svc.id] = picks;
          picksChanged = true;
        }
      }

      if (changed) setFinishingMaterialsMap(copyMap);
      if (picksChanged) setFinishingMaterialSelections(copySelections);
    }

    if (recommendedServices.length > 0) {
      loadFinishingMaterials();
    }
  }, [recommendedServices]);

  // Recalculate cost
  useEffect(() => {
    async function recalcAll() {
      if (!recommendedServices.length) {
        setCosts({});
        return;
      }
      const zip = location.zip || "";
      // If no 5-digit zip => skip
      if (!/^\d{5}$/.test(zip)) return;

      const newCosts: Record<string, number> = {};
      for (const svc of recommendedServices) {
        const q = quantities[svc.id] ?? svc.min_quantity ?? 1;
        const dotId = dashToDot(svc.id);
        const finMats = finishingMaterialSelections[svc.id] || [];

        try {
          const calcResult = await calculatePrice({
            work_code: dotId,
            zipcode: zip,
            unit_of_measurement: svc.unit_of_measurement || "each",
            square: q,
            finishing_materials: finMats,
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
  }, [recommendedServices, quantities, location, finishingMaterialSelections]);

  // Handlers for +/- and quantity text
  function handleMinusClick(serviceId: string) {
    const svc = recommendedServices.find((x) => x.id === serviceId);
    if (!svc) return;
    const minQ = svc.min_quantity ?? 1;
    const maxQ = svc.max_quantity ?? 9999;

    setQuantities((prev) => {
      const val = prev[serviceId] ?? minQ;
      let newVal = val - 1;
      if (newVal < minQ) newVal = minQ;
      if (newVal > maxQ) newVal = maxQ;
      return {
        ...prev,
        [serviceId]:
          svc.unit_of_measurement === "each" ? Math.round(newVal) : newVal,
      };
    });
    setManualInputs((prev) => ({ ...prev, [serviceId]: null }));
  }

  function handlePlusClick(serviceId: string) {
    const svc = recommendedServices.find((x) => x.id === serviceId);
    if (!svc) return;
    const minQ = svc.min_quantity ?? 1;
    const maxQ = svc.max_quantity ?? 9999;

    setQuantities((prev) => {
      const val = prev[serviceId] ?? minQ;
      let newVal = val + 1;
      if (newVal < minQ) newVal = minQ;
      if (newVal > maxQ) newVal = maxQ;
      return {
        ...prev,
        [serviceId]:
          svc.unit_of_measurement === "each" ? Math.round(newVal) : newVal,
      };
    });
    setManualInputs((prev) => ({ ...prev, [serviceId]: null }));
  }

  function handleChangeQuantity(serviceId: string, value: string) {
    const svc = recommendedServices.find((x) => x.id === serviceId);
    if (!svc) return;
    const minQ = svc.min_quantity ?? 1;
    const maxQ = svc.max_quantity ?? 9999;

    setManualInputs((prev) => ({ ...prev, [serviceId]: value }));
    let numVal = parseFloat(value.replace(/,/g, "")) || 0;
    if (numVal < minQ) numVal = minQ;
    if (numVal > maxQ) numVal = maxQ;

    setQuantities((prev) => ({
      ...prev,
      [serviceId]:
        svc.unit_of_measurement === "each" ? Math.round(numVal) : numVal,
    }));
  }

  function handleFocusQuantity(serviceId: string) {
    setManualInputs((prev) => ({ ...prev, [serviceId]: "" }));
  }

  function handleBlurQuantity(serviceId: string) {
    if (manualInputs[serviceId] === "") {
      setManualInputs((prev) => ({ ...prev, [serviceId]: null }));
    }
  }

  function handleToggleSelect(serviceId: string) {
    setSelectedServices((prev) => ({ ...prev, [serviceId]: !prev[serviceId] }));
  }

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

  function handleContinue() {
    const chosen = recommendedServices.filter((svc) => selectedServices[svc.id]);
    if (!chosen.length) {
      alert("No services selected. Please pick at least one service.");
      return;
    }
    const svcMap: Record<string, number> = {};
    const catSet = new Set<string>();
    const sectionSet = new Set<string>();

    for (const s of chosen) {
      svcMap[s.id] = quantities[s.id] ?? (s.min_quantity ?? 1);
      const parts = s.id.split("-");
      if (parts.length >= 2) {
        const catId = parts.slice(0, 2).join("-");
        catSet.add(catId);
        const catObj = ALL_CATEGORIES.find((xx) => xx.id === catId);
        if (catObj) {
          sectionSet.add(catObj.section);
        }
      }
    }

    // Save location
    if (location.city) setSessionItem("address", location.city);
    if (location.state) setSessionItem("stateName", location.state);
    if (location.zip) setSessionItem("zip", location.zip);
    const combined = [location.city, location.state, location.zip].filter(Boolean).join(", ");
    if (combined) {
      setSessionItem("fullAddress", combined);
    }

    removeSessionItem("selectedServicesWithQuantity");
    setSessionItem("selectedServicesWithQuantity", svcMap);
    setSessionItem("services_selectedCategories", Array.from(catSet));
    setSessionItem("services_selectedSections", Array.from(sectionSet));
    router.push("/calculate/details");
  }

  return (
    <main className="min-h-screen">
      <div className="container mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          PDF Documents
        </h1>
        <p className="text-gray-600 mb-4">
          Upload up to 4 PDF documents (plans, specs, or textual descriptions) for analysis.
        </p>

        {/* File input */}
        <div className="mb-4">
          <label
            htmlFor="pdf-input"
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
              ? "New PDF recognition"
              : pdfFiles.length === 0
              ? "Choose up to 4 PDFs"
              : "Add more PDFs"}
          </label>
          <input
            type="file"
            id="pdf-input"
            multiple
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />

          {pdfFiles.length > 0 && (
            <div className="my-3 flex flex-col gap-2">
              {pdfFiles.map((file, idx) => (
                <div key={idx} className="flex items-center">
                  <span className="mr-2 text-gray-800 text-sm">
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                  <button
                    onClick={() => removeFile(idx)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Analyze */}
        <div className="my-3">
          {!analysisDone && !loading && pdfFiles.length > 0 && (
            <button
              onClick={handleAnalyze}
              className="w-full lg:w-[300px] bg-blue-600 text-white px-4 py-2 my-2 rounded hover:bg-blue-700"
            >
              Analyze PDF(s)
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

        {/* Show recommended services */}
        {recommendedServices.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-medium text-gray-800 mb-3">
              Recommended Services
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommendedServices.map((svc) => {
                const qty = quantities[svc.id] ?? svc.min_quantity ?? 1;
                const costVal = costs[svc.id] ?? 0;
                const isSelected = !!selectedServices[svc.id];
                const typedVal = manualInputs[svc.id];

                return (
                  <ServiceCard
                    key={svc.id}
                    service={svc}
                    quantity={qty}
                    typedValue={typedVal}
                    cost={costVal}
                    isSelected={isSelected}
                    formatWithSeparator={formatWithSeparator}
                    onMinusClick={handleMinusClick}
                    onPlusClick={handlePlusClick}
                    onChangeQuantity={handleChangeQuantity}
                    onFocusQuantity={handleFocusQuantity}
                    onBlurQuantity={handleBlurQuantity}
                    onToggleSelect={handleToggleSelect}
                  />
                );
              })}
            </div>

            {selectedCount > 0 && (
              <div className="mt-4 text-gray-700 text-base font-semibold">
                You selected {selectedCount} service(s), total cost:{" "}
                <span className="text-red-600">
                  ${formatWithSeparator(selectedTotal)}
                </span>
            </div>
            )}

            <button
              onClick={handleContinue}
              className="mt-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
            >
              Proceed
            </button>
          </div>
        )}
      </div>
    </main>
  );
}