"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Printer } from "lucide-react"; // optional icon if you want to show a print button somewhere
import { DisclaimerBlock } from "@/components/ui/DisclaimerBlock";
import { ALL_SERVICES } from "@/constants/services";
import { ALL_CATEGORIES } from "@/constants/categories";

/**
 * Interface describing a single material inside a work item.
 */
interface OrderMaterial {
  id: number;
  name: string;
  cost: string;            // total cost for these materials
  cost_per_unit: string;   // cost per 1 unit
  quantity: number;
  photo?: string;
}

/**
 * Interface describing a single work item in the order.
 */
interface OrderWork {
  id: number;
  code: string;        
  name: string;
  total: string;
  photo?: string;
  description?: string;
  materials: OrderMaterial[];
}

/**
 * Interface describing the top-level CompositeOrder from the server.
 */
interface CompositeOrder {
  id: number;
  code: string;  // the overall order code
  user_id: number;
  subtotal: string;
  tax_amount: string;
  service_fee_on_labor: string;
  service_fee_on_materials: string;
  common: {
    address: string;
    description: string;
    selected_date: string;
    date_coefficient: string;
    photos: string[]; 
  };
  works: OrderWork[];
}

/**
 * Format a numeric value with commas and exactly two decimals, e.g. 1234.5 => "1,234.50"
 */
function formatWithSeparator(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Converts a numeric dollar amount into spelled-out English text (simplified).
 */
function numberToWordsUSD(amount: number): string {
  const onesMap: Record<number, string> = {
    0: "zero",
    1: "one",
    2: "two",
    3: "three",
    4: "four",
    5: "five",
    6: "six",
    7: "seven",
    8: "eight",
    9: "nine",
    10: "ten",
    11: "eleven",
    12: "twelve",
    13: "thirteen",
    14: "fourteen",
    15: "fifteen",
    16: "sixteen",
    17: "seventeen",
    18: "eighteen",
    19: "nineteen",
    20: "twenty",
    30: "thirty",
    40: "forty",
    50: "fifty",
    60: "sixty",
    70: "seventy",
    80: "eighty",
    90: "ninety",
  };

  function twoDigits(num: number): string {
    if (num <= 20) return onesMap[num] || "";
    const tens = Math.floor(num / 10) * 10;
    const ones = num % 10;
    if (ones === 0) return onesMap[tens];
    return `${onesMap[tens]}-${onesMap[ones]}`;
  }

  function threeDigits(num: number): string {
    const hundreds = Math.floor(num / 100);
    const remainder = num % 100;
    let out = "";
    if (hundreds > 0) {
      out += `${onesMap[hundreds]} hundred`;
      if (remainder > 0) out += " ";
    }
    if (remainder > 0) {
      if (remainder < 100) out += twoDigits(remainder);
    }
    if (!out) return "zero";
    return out;
  }

  let integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - integerPart) * 100);
  if (integerPart === 0) integerPart = 0;

  let spelled = "";
  const units = ["", "thousand", "million", "billion"];
  let idx = 0;
  while (integerPart > 0 && idx < units.length) {
    const chunk = integerPart % 1000;
    integerPart = Math.floor(integerPart / 1000);
    if (chunk > 0) {
      const chunkStr = threeDigits(chunk);
      const label = units[idx] ? ` ${units[idx]}` : "";
      spelled = chunkStr + label + (spelled ? ` ${spelled}` : "");
    }
    idx++;
  }
  if (!spelled) spelled = "zero";

  const decimalString = decimalPart < 10 ? `0${decimalPart}` : String(decimalPart);
  return `${spelled} and ${decimalString}/100 dollars`;
}

/**
 * If the server code is "4.1.2" with dots, we replace them with '-' => "4-1-2"
 * Then we extract the first two parts => "4-1" as the category ID.
 */
function extractCategoryId(workCode: string): string {
  const normalized = workCode.replace(/\./g, "-");
  const parts = normalized.split("-");
  if (parts.length >= 2) {
    return `${parts[0]}-${parts[1]}`;
  }
  return normalized || "unknown";
}

/**
 * Find a category object in ALL_CATEGORIES by ID, or null if not found.
 */
function findCategoryObj(categoryId: string) {
  return ALL_CATEGORIES.find((c) => c.id === categoryId) || null;
}

/**
 * Optionally find a service object in ALL_SERVICES by full code (e.g. "4-1-2") if needed.
 */
function findServiceObj(serviceId: string) {
  return ALL_SERVICES.find((svc) => svc.id === serviceId) || null;
}

/**
 * The main PrintOrderPage that fetches a real existing order from /api/orders/get
 * and displays a print layout with sections & categories, replicating your previous styles.
 * After user closes or finishes printing, we do router.back().
 */
export default function PrintOrderPage() {
  const router = useRouter();
  const params = useParams();

  const [order, setOrder] = useState<CompositeOrder | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount => fetch order from server
  useEffect(() => {
    const code = params?.orderCode;
    if (!code) {
      alert("No order code provided.");
      router.push("/dashboard");
      return;
    }

    const token = sessionStorage.getItem("authToken");
    if (!token) {
      alert("No auth token found. Redirecting to login...");
      router.push("/login");
      return;
    }

    async function fetchOrder() {
      try {
        setLoading(true);
        const resp = await fetch("/api/orders/get", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, order_code: code }),
        });
        if (!resp.ok) {
          const errData = await resp.json();
          throw new Error(errData.error || "Failed to fetch order details");
        }
        const data = (await resp.json()) as CompositeOrder;
        setOrder(data);
      } catch (err: any) {
        alert(err.message || "Error fetching order");
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [params, router]);

  /**
   * We handle auto-print, plus a "go back" after printing is closed (onafterprint).
   */
  useEffect(() => {
    if (!loading && order) {
      const oldTitle = document.title;
      document.title = `JAMB-Order-${order.code}`;

      // Trigger print after short delay
      const printTimer = setTimeout(() => window.print(), 600);

      // After user finishes/abandons printing => router.back()
      const handleAfterPrint = () => {
        router.back();
      };
      window.onafterprint = handleAfterPrint;

      // Cleanup on unmount
      return () => {
        document.title = oldTitle;
        clearTimeout(printTimer);
        window.onafterprint = null;
      };
    }
  }, [loading, order, router]);

  if (loading) {
    return <div className="p-4">Loading order...</div>;
  }
  if (!order) {
    return <div className="p-4">No order found.</div>;
  }

  // Let's parse top-level amounts
  const subtotalNum = parseFloat(order.subtotal) || 0;
  const taxAmountNum = parseFloat(order.tax_amount) || 0;
  const finalTotal = subtotalNum + taxAmountNum;
  const serviceFeeLabor = parseFloat(order.service_fee_on_labor || "0");
  const serviceFeeMaterials = parseFloat(order.service_fee_on_materials || "0");
  const dateCoeff = parseFloat(order.common.date_coefficient) || 1;

  interface CategoryEntry {
    categoryName: string;
    works: OrderWork[];
  }
  const sectionMap = new Map<string, CategoryEntry[]>();

  let laborSubtotal = 0;
  let materialsSubtotal = 0;

  const materialsSpecMap: Record<string, { name: string; totalQty: number; totalCost: number }> = {};

  order.works.forEach((w) => {
    const catId = extractCategoryId(w.code); 
    const catObj = findCategoryObj(catId);

    const sectionName = catObj?.section ?? "Unknown Section";
    const categoryName = catObj?.title ?? `Unknown Category (${catId})`;

    let matCost = 0;
    w.materials.forEach((m) => {
      const c = parseFloat(m.cost) || 0;
      matCost += c;

      if (!materialsSpecMap[m.name]) {
        materialsSpecMap[m.name] = { name: m.name, totalQty: 0, totalCost: 0 };
      }
      materialsSpecMap[m.name].totalQty += m.quantity;
      materialsSpecMap[m.name].totalCost += c;
    });

    const totalCost = parseFloat(w.total) || 0;
    const laborCost = totalCost - matCost;
    laborSubtotal += laborCost;
    materialsSubtotal += matCost;

    let catEntries = sectionMap.get(sectionName);
    if (!catEntries) {
      catEntries = [];
      sectionMap.set(sectionName, catEntries);
    }
    let catEntry = catEntries.find((ce) => ce.categoryName === categoryName);
    if (!catEntry) {
      catEntry = { categoryName, works: [] };
      catEntries.push(catEntry);
    }
    catEntry.works.push(w);
  });

  const finalLabor = laborSubtotal * dateCoeff;
  const sumBeforeTax = finalLabor + materialsSubtotal + serviceFeeLabor + serviceFeeMaterials;
  const materialsSpecArray = Object.values(materialsSpecMap);
  const totalMaterialsCost = materialsSpecArray.reduce((acc, x) => acc + x.totalCost, 0);

  const spelledOutTotal = numberToWordsUSD(finalTotal);

  return (
    <div className="p-4 my-2 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 bg-transparent">
        <img src="/images/logo.png" alt="JAMB Logo" className="h-10 w-auto" />
      </div>
      <hr className="border-gray-300 mb-4 bg-white" />

      <div className="flex justify-between items-center mb-4 mt-12 bg-transparent">
        <div>
          <h1 className="text-2xl font-bold">Order #{order.code}</h1>
        </div>
      </div>

      <p className="mb-2 text-gray-700">
        <strong>Date of Service:</strong> {order.common.selected_date}
      </p>
      <p className="mb-2 text-gray-700">
        <strong>Address:</strong> {order.common.address}
      </p>
      <p className="mb-4 text-gray-700">
        <strong>Description:</strong> {order.common.description || "No details provided"}
      </p>

      {/* Photos */}
      {order.common.photos?.length > 0 && (
        <section className="mb-6">
          <h3 className="font-semibold text-xl mb-2">Uploaded Photos</h3>
          {order.common.photos.length === 1 ? (
            <div className="flex w-full justify-center">
              <div className="w-1/2 overflow-hidden border border-gray-300">
                <img
                  src={order.common.photos[0]}
                  alt="Uploaded Photo"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
              {order.common.photos.map((photoUrl, idx) => (
                <div key={idx} className="overflow-hidden border border-gray-300">
                  <img
                    src={photoUrl}
                    alt={`Photo ${idx + 1}`}
                    className="w-full h-32 object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <div className="mb-8">
        <DisclaimerBlock />
      </div>

      {/* 1) SUMMARY */}
      <section className="page-break mt-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          1) Summary
        </h2>
        <p className="text-sm mb-4 text-gray-600">
          This table provides a simple overview of each selected service and total cost.
        </p>

        <table className="w-full table-auto border text-sm" style={{ borderColor: "#999" }}>
          <thead>
            <tr className="border-b bg-transparent" style={{ borderColor: "#999" }}>
              <th className="px-3 py-2 border-r text-center" style={{ width: "3rem", borderColor: "#999" }}>
                #
              </th>
              <th className="px-3 py-2 border-r text-left" style={{ borderColor: "#999" }}>
                Service
              </th>
              <th className="px-3 py-2 text-center" style={{ width: "6rem" }}>
                Total Cost
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from(sectionMap.entries()).map(([sectionName, catEntries], i) => {
              const sectionIndex = i + 1;
              return (
                <React.Fragment key={sectionName}>
                  <tr style={{ borderBottom: "1px solid #999" }}>
                    <td colSpan={3} className="px-3 py-2 font-medium">
                      {sectionIndex}. {sectionName}
                    </td>
                  </tr>
                  {catEntries.map((catEntry, j) => {
                    const catIndex = j + 1;
                    return (
                      <React.Fragment key={catEntry.categoryName}>
                        <tr>
                          <td
                            colSpan={3}
                            className="px-5 py-2"
                            style={{ borderBottom: "1px solid #ccc" }}
                          >
                            {sectionIndex}.{catIndex}. {catEntry.categoryName}
                          </td>
                        </tr>
                        {catEntry.works.map((w, k2) => {
                          const wIndex = k2 + 1;
                          const costVal = parseFloat(w.total) || 0;
                          return (
                            <tr key={w.id} style={{ borderBottom: "1px solid #ccc" }}>
                              <td className="px-3 py-2 border-r text-center" style={{ borderColor: "#ccc" }}>
                                {sectionIndex}.{catIndex}.{wIndex}
                              </td>
                              <td className="px-3 py-2 border-r" style={{ borderColor: "#ccc" }}>
                                {w.name}
                              </td>
                              <td className="px-3 py-2 text-center">
                                ${formatWithSeparator(costVal)}
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {/* Summary totals */}
        <div className="border-t pt-4 mt-6 text-sm">
          <div className="flex justify-between mb-1">
            <span>Labor total:</span>
            <span>${formatWithSeparator(laborSubtotal)}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Materials, tools & equipment:</span>
            <span>${formatWithSeparator(materialsSubtotal)}</span>
          </div>
          {dateCoeff !== 1 && (
            <div className="flex justify-between mb-1">
              <span>{dateCoeff > 1 ? "Surcharge" : "Discount"} (date selection)</span>
              <span>
                {dateCoeff > 1 ? "+" : "-"}$
                {formatWithSeparator(Math.abs(finalLabor - laborSubtotal))}
              </span>
            </div>
          )}
          <div className="flex justify-between mb-1">
            <span>Service Fee (Labor):</span>
            <span>${formatWithSeparator(serviceFeeLabor)}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Service Fee (Materials):</span>
            <span>${formatWithSeparator(serviceFeeMaterials)}</span>
          </div>
          <div className="flex justify-between font-semibold mb-1">
            <span>Subtotal:</span>
            <span>${formatWithSeparator(subtotalNum)}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Tax:</span>
            <span>${formatWithSeparator(taxAmountNum)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold mt-2">
            <span>Total:</span>
            <span>${formatWithSeparator(finalTotal)}</span>
          </div>
          <p className="text-right text-sm text-gray-600">
            {spelledOutTotal}
          </p>
        </div>
      </section>

      {/* 2) COST BREAKDOWN */}
      <section className="page-break mt-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          2) Cost Breakdown
        </h2>
        <p className="text-sm mb-4 text-gray-600">
          Detailed breakdown of each service's labor and materials cost.
        </p>

        {Array.from(sectionMap.entries()).map(([sectionName, catEntries], i) => {
          const sectionIndex = i + 1;
          return (
            <div key={sectionName} className="avoid-break mb-6">
              <h3 className="text-lg font-bold mb-2 text-gray-800">
                {sectionIndex}. {sectionName}
              </h3>
              {catEntries.map((catEntry, j) => {
                const catIndex = j + 1;
                return (
                  <div key={catEntry.categoryName} className="ml-4 mb-4 avoid-break">
                    <h4 className="text-base font-semibold mb-2 text-gray-700">
                      {sectionIndex}.{catIndex}. {catEntry.categoryName}
                    </h4>
                    {catEntry.works.map((w, k2) => {
                      const wIndex = k2 + 1;
                      const totalCost = parseFloat(w.total) || 0;
                      let matCost = 0;
                      w.materials.forEach((m) => {
                        matCost += parseFloat(m.cost) || 0;
                      });
                      const laborCost = totalCost - matCost;

                      return (
                        <div key={w.id} className="mb-4 avoid-break">
                          <h5 className="text-sm font-semibold flex justify-between text-gray-700">
                            <span>
                              {sectionIndex}.{catIndex}.{wIndex}. {w.name}
                            </span>
                          </h5>
                          {w.description && (
                            <p className="text-sm my-1 text-gray-600">{w.description}</p>
                          )}
                          <p className="text-sm flex justify-between text-gray-700 mb-1">
                            <span className="font-semibold">Total cost</span>
                            <span className="font-semibold mr-4">
                              ${formatWithSeparator(totalCost)}
                            </span>
                          </p>
                          <div
                            className="mt-2 p-3 border border-gray-300 rounded text-sm bg-gray-50"
                            style={{ color: "#444" }}
                          >
                            <div className="flex justify-between mb-1">
                              <span className="font-semibold">Labor</span>
                              <span className="font-semibold">
                                ${formatWithSeparator(laborCost)}
                              </span>
                            </div>
                            <div className="flex justify-between mb-3">
                              <span className="font-semibold">Materials, Tools & Equipment</span>
                              <span className="font-semibold">
                                ${formatWithSeparator(matCost)}
                              </span>
                            </div>

                            {w.materials.length > 0 && (
                              <div className="mt-2">
                                <table className="table-auto w-full text-left text-gray-700">
                                  <thead>
                                    <tr className="border-b">
                                      <th className="py-1 px-1">Name</th>
                                      <th className="py-1 px-1 text-right">Price</th>
                                      <th className="py-1 px-1 text-center">Qty</th>
                                      <th className="py-1 px-1 text-right">Subtotal</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {w.materials.map((m, idx2) => {
                                      const cpu = parseFloat(m.cost_per_unit) || 0;
                                      const sub = parseFloat(m.cost) || 0;
                                      return (
                                        <tr key={m.id} className="border-b">
                                          <td className="py-2 px-1">{m.name}</td>
                                          <td className="py-2 px-1 text-right">
                                            ${formatWithSeparator(cpu)}
                                          </td>
                                          <td className="py-2 px-1 text-center">
                                            {m.quantity}
                                          </td>
                                          <td className="py-2 px-1 text-right">
                                            ${formatWithSeparator(sub)}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </section>

      {/* 3) SPECIFICATIONS */}
      <section className="page-break mt-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          3) Specifications
        </h2>
        <p className="text-sm mb-4 text-gray-600">
          Additional breakdown of labor by section, overall materials, date coefficient, etc.
        </p>

        {/* A) Labor by Section */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-2 text-gray-800">
            A) Labor by Section
          </h3>
          <table className="w-full table-auto border text-sm mb-3" style={{ borderColor: "#999" }}>
            <thead>
              <tr>
                <th className="px-3 py-2 border" style={{ textAlign: "left", borderColor: "#999" }}>
                  Section
                </th>
                <th className="px-3 py-2 border" style={{ textAlign: "right", borderColor: "#999" }}>
                  Labor
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from(sectionMap.entries()).map(([sectionName, catEntries]) => {
                let sectionLaborSum = 0;
                catEntries.forEach((ce) => {
                  ce.works.forEach((w) => {
                    const tot = parseFloat(w.total) || 0;
                    let mat = 0;
                    w.materials.forEach((m) => {
                      mat += parseFloat(m.cost) || 0;
                    });
                    sectionLaborSum += (tot - mat);
                  });
                });
                if (sectionLaborSum === 0) return null;

                return (
                  <tr key={sectionName} className="border-b" style={{ borderColor: "#ccc" }}>
                    <td className="px-3 py-2 border" style={{ borderColor: "#ccc" }}>
                      {sectionName}
                    </td>
                    <td className="px-3 py-2 border text-right" style={{ borderColor: "#ccc" }}>
                      ${formatWithSeparator(sectionLaborSum)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="text-sm text-gray-700">
            <div className="flex justify-end">
              <span className="mr-6">Labor Sum:</span>
              <span>${formatWithSeparator(laborSubtotal)}</span>
            </div>
            {dateCoeff !== 1 && (
              <div className="flex justify-end mt-1">
                <span className="mr-6">
                  {dateCoeff > 1 ? "Surcharge" : "Discount"}:
                </span>
                <span>
                  {dateCoeff > 1 ? "+" : "-"}$
                  {formatWithSeparator(Math.abs(finalLabor - laborSubtotal))}
                </span>
              </div>
            )}
            <div className="flex justify-end font-semibold mt-1">
              <span className="mr-6">Total Labor:</span>
              <span>${formatWithSeparator(finalLabor)}</span>
            </div>
          </div>
        </div>

        {/* B) Overall Materials */}
        <div>
          <h3 className="text-lg font-bold mb-2 text-gray-800">
            B) Overall Materials, Tools & Equipment
          </h3>
          {materialsSpecArray.length === 0 ? (
            <p className="text-sm text-gray-600">No materials in this order.</p>
          ) : (
            <div>
              <table className="w-full table-auto border text-sm" style={{ borderColor: "#999" }}>
                <thead>
                  <tr style={{ background: "transparent" }}>
                    <th className="px-3 py-2 border" style={{ textAlign: "left", borderColor: "#999" }}>
                      Material Name
                    </th>
                    <th className="px-3 py-2 border" style={{ textAlign: "center", borderColor: "#999" }}>
                      Qty
                    </th>
                    <th className="px-3 py-2 border" style={{ textAlign: "center", borderColor: "#999" }}>
                      Price
                    </th>
                    <th className="px-3 py-2 border" style={{ textAlign: "center", borderColor: "#999" }}>
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {materialsSpecArray.map((m) => {
                    const unitPrice = m.totalQty > 0 ? m.totalCost / m.totalQty : 0;
                    return (
                      <tr key={m.name} className="border-b" style={{ borderColor: "#ccc" }}>
                        <td className="px-3 py-2 border-r" style={{ borderColor: "#ccc" }}>
                          {m.name}
                        </td>
                        <td className="px-3 py-2 border-r text-center" style={{ borderColor: "#ccc" }}>
                          {m.totalQty}
                        </td>
                        <td className="px-3 py-2 border-r text-center" style={{ borderColor: "#ccc" }}>
                          ${formatWithSeparator(unitPrice)}
                        </td>
                        <td className="px-3 py-2 text-center">
                          ${formatWithSeparator(m.totalCost)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="flex justify-end mt-2 text-sm font-semibold text-gray-700">
                <span className="mr-6">Total Materials:</span>
                <span>${formatWithSeparator(totalMaterialsCost)}</span>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}