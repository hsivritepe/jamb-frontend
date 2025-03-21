"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocation } from "@/context/LocationContext";
import { setSessionItem, removeSessionItem } from "@/utils/session";
import ServiceCard from "@/components/ui/ServiceCard";
import { ALL_CATEGORIES } from "@/constants/categories";
import { ALL_SERVICES } from "@/constants/services";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type RecommendedService = {
  id: string;
  title: string;
  description: string;
  price: number;
  category?: string;
  unit_of_measurement?: string;
  min_quantity?: number;
  max_quantity?: number;
};

function formatWithSeparator(value: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function dashToDot(str: string) {
  return str.replaceAll("-", ".");
}

// Fetch finishing materials
async function fetchFinishingMaterials(workCode: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://dev.thejamb.com";
  const url = `${baseUrl}/work/finishing_materials`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ work_code: workCode }),
  });
  if (!res.ok) {
    throw new Error(
      `Failed to fetch finishing materials (work_code=${workCode}).`
    );
  }
  return res.json();
}

// Calculate price
async function calculatePrice(params: {
  work_code: string;
  zipcode: string;
  unit_of_measurement: string;
  square: number;
  finishing_materials: string[];
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
      finishing_materials: params.finishing_materials,
    }),
  });
  if (!res.ok) {
    throw new Error(`Failed to calculate price (code=${params.work_code}).`);
  }
  return res.json();
}

// Reset session data
function resetAllSessionData() {
  removeSessionItem("selectedServicesWithQuantity");
  removeSessionItem("services_selectedCategories");
  removeSessionItem("services_selectedSections");
}

export default function AiEstimateChatPage() {
  const router = useRouter();
  const { location } = useLocation();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  const [recommendedServices, setRecommendedServices] = useState<RecommendedService[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [manualInputs, setManualInputs] = useState<Record<string, string | null>>({});
  const [costs, setCosts] = useState<Record<string, number>>({});
  const [selectedServices, setSelectedServices] = useState<Record<string, boolean>>({});

  const [finishingMaterialsMap, setFinishingMaterialsMap] = useState<Record<string, any>>({});
  const [finishingMaterialSelections, setFinishingMaterialSelections] = useState<Record<string, string[]>>({});

  // Removes AI services block from text
  function stripServicesBlock(text: string) {
    const startTag = "<<<SERVICES>>>";
    const endTag = "<<<END>>>";
    const startIdx = text.indexOf(startTag);
    const endIdx = text.indexOf(endTag);
    if (startIdx === -1 || endIdx === -1) return text;
    return text.slice(0, startIdx).trim();
  }

  // Extracts the AI services block as JSON
  function extractServicesBlock(text: string): string | null {
    const startTag = "<<<SERVICES>>>";
    const endTag = "<<<END>>>";
    const startIdx = text.indexOf(startTag);
    const endIdx = text.indexOf(endTag);
    if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) return null;
    return text.slice(startIdx + startTag.length, endIdx).trim();
  }

  async function handleSend() {
    if (!inputText.trim()) return;

    const updatedMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: inputText.trim() },
    ];
    setMessages(updatedMessages);
    setInputText("");

    try {
      setLoading(true);
      const resp = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      if (!resp.ok) {
        throw new Error(`Request failed with status ${resp.status}`);
      }

      const data = await resp.json();
      const assistantText = data.content || "";

      const displayedText = stripServicesBlock(assistantText);
      setMessages((prev) => [...prev, { role: "assistant", content: displayedText }]);

      const servicesBlock = extractServicesBlock(assistantText);
      if (servicesBlock) {
        try {
          // Reset session data before loading new services
          resetAllSessionData();

          const parsed = JSON.parse(servicesBlock);
          if (parsed.services && Array.isArray(parsed.services)) {
            initRecommendedServices(parsed.services);
          }
        } catch (err) {
          console.error("Failed to parse services block:", err);
        }
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setLoading(false);
    }
  }

  // Merge AI services with local data so we get correct unit_of_measurement, min/max, etc.
  function initRecommendedServices(services: RecommendedService[]) {
    const merged = services.map((svc) => {
      const found = ALL_SERVICES.find((x) => x.id === svc.id);
      if (found) {
        return {
          ...svc,
          unit_of_measurement: found.unit_of_measurement ?? svc.unit_of_measurement,
          min_quantity: found.min_quantity ?? svc.min_quantity ?? 1,
          max_quantity: found.max_quantity ?? svc.max_quantity ?? 9999,
        };
      }
      // Fallback if not found
      return {
        ...svc,
        unit_of_measurement: svc.unit_of_measurement || "each",
        min_quantity: svc.min_quantity ?? 1,
        max_quantity: svc.max_quantity ?? 9999,
      };
    });

    setRecommendedServices(merged);
    setFinishingMaterialsMap({});
    setFinishingMaterialSelections({});
    setCosts({});

    const qMap: Record<string, number> = {};
    const selMap: Record<string, boolean> = {};
    for (const svc of merged) {
      qMap[svc.id] = svc.min_quantity ?? 1;
      selMap[svc.id] = false;
    }
    setQuantities(qMap);
    setSelectedServices(selMap);
    setManualInputs({});
  }

  // Fetch finishing materials for each recommended service
  useEffect(() => {
    async function loadFinishingData() {
      if (!recommendedServices.length) return;

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

      // Default finishing selections
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

      if (changed) {
        setFinishingMaterialsMap(copyMap);
      }
      if (picksChanged) {
        setFinishingMaterialSelections(copySelections);
      }
    }
    loadFinishingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recommendedServices]);

  // Recalculate costs
  useEffect(() => {
    async function recalcAll() {
      if (!recommendedServices.length) {
        setCosts({});
        return;
      }
      const zip = location.zip || "";
      if (!/^\d{5}$/.test(zip)) return;

      const newCosts: Record<string, number> = {};
      for (const svc of recommendedServices) {
        const qty = quantities[svc.id] ?? 1;
        const dotId = dashToDot(svc.id);
        const finMats = finishingMaterialSelections[svc.id] || [];
        const unit = svc.unit_of_measurement || "each";

        try {
          const calcResult = await calculatePrice({
            work_code: dotId,
            zipcode: zip,
            unit_of_measurement: unit,
            square: qty,
            finishing_materials: finMats,
          });
          const labor = parseFloat(calcResult.work_cost || "0");
          const materials = parseFloat(calcResult.material_cost || "0");
          newCosts[svc.id] = labor + materials;
        } catch (err) {
          console.error("Error in calculatePrice:", err);
          newCosts[svc.id] = 0;
        }
      }
      setCosts(newCosts);
    }
    recalcAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recommendedServices, quantities, finishingMaterialSelections, location]);

  // Quantity minus
  function handleMinusClick(serviceId: string) {
    const svc = recommendedServices.find((x) => x.id === serviceId);
    if (!svc) return;
    const minQ = svc.min_quantity ?? 1;
    const maxQ = svc.max_quantity ?? 9999;

    setQuantities((old) => {
      const val = old[serviceId] ?? minQ;
      let newVal = val - 1;
      if (newVal < minQ) newVal = minQ;
      if (newVal > maxQ) newVal = maxQ;
      return {
        ...old,
        [serviceId]:
          svc.unit_of_measurement === "each" ? Math.round(newVal) : newVal,
      };
    });
    setManualInputs((prev) => ({ ...prev, [serviceId]: null }));
  }

  // Quantity plus
  function handlePlusClick(serviceId: string) {
    const svc = recommendedServices.find((x) => x.id === serviceId);
    if (!svc) return;
    const minQ = svc.min_quantity ?? 1;
    const maxQ = svc.max_quantity ?? 9999;

    setQuantities((old) => {
      const val = old[serviceId] ?? minQ;
      let newVal = val + 1;
      if (newVal < minQ) newVal = minQ;
      if (newVal > maxQ) newVal = maxQ;
      return {
        ...old,
        [serviceId]:
          svc.unit_of_measurement === "each" ? Math.round(newVal) : newVal,
      };
    });
    setManualInputs((prev) => ({ ...prev, [serviceId]: null }));
  }

  // Manual quantity input
  function handleChangeQuantity(serviceId: string, value: string) {
    const svc = recommendedServices.find((x) => x.id === serviceId);
    if (!svc) return;
    const minQ = svc.min_quantity ?? 1;
    const maxQ = svc.max_quantity ?? 9999;

    setManualInputs((prev) => ({ ...prev, [serviceId]: value }));
    let numVal = parseFloat(value.replace(/,/g, "")) || 0;
    if (numVal < minQ) numVal = minQ;
    if (numVal > maxQ) numVal = maxQ;

    setQuantities((old) => ({
      ...old,
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

  // On proceed => store data + location in session, navigate
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
      svcMap[s.id] = quantities[s.id] ?? (s.min_quantity ?? 1);

      // Extract category/section from service id
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

    removeSessionItem("selectedServicesWithQuantity");
    setSessionItem("selectedServicesWithQuantity", svcMap);
    setSessionItem("services_selectedCategories", Array.from(catSet));
    setSessionItem("services_selectedSections", Array.from(secSet));

    // Save location
    if (location.city) setSessionItem("address", location.city);
    if (location.state) setSessionItem("stateName", location.state);
    if (location.zip) setSessionItem("zip", location.zip);
    const combinedAddress = [location.city, location.state, location.zip]
      .filter(Boolean)
      .join(", ");
    if (combinedAddress) {
      setSessionItem("fullAddress", combinedAddress);
    }

    router.push("/calculate/details");
  }

  return (
    <main className="min-h-screen">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        Chat with JambAI Assistant
      </h1>
      <p className="text-gray-600 mb-4">
        Ask about any home improvement project, and we'll suggest relevant services with prices.
      </p>

      {/* Chat window */}
      <div className="bg-white border rounded p-4 mb-4 min-h-[300px] max-h-[500px] overflow-auto">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-3 p-2 rounded ${
              msg.role === "user"
                ? "bg-blue-50 text-blue-900"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            <strong>{msg.role === "user" ? "You" : "Jamb"}:</strong>{" "}
            {msg.content}
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-gray-400">No messages yet. Ask something!</div>
        )}
      </div>

      {/* Input + send button */}
      <div className="flex gap-2">
        <textarea
          className="flex-1 p-2 border rounded"
          rows={2}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>

      {/* Recommended services */}
      {recommendedServices.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Recommended Services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedServices.map((svc) => {
              const costVal = costs[svc.id] ?? 0;
              const qty = quantities[svc.id] ?? (svc.min_quantity ?? 1);
              const typedVal = manualInputs[svc.id];
              const isSelected = !!selectedServices[svc.id];

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
            onClick={handleProceed}
            className="mt-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
          >
            Proceed
          </button>
        </div>
      )}
    </main>
  );
}