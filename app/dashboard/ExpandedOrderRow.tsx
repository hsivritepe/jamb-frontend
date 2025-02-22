"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Printer, Trash2 } from "lucide-react";
import ServiceTimePicker from "@/components/ui/ServiceTimePicker";
import { parse, differenceInCalendarDays } from "date-fns";

interface CompositeOrder {
  id: number;
  code: string;
  user_id: number;
  user_token: string;
  zipcode: string;
  subtotal: string;
  service_fee_on_labor: string;
  service_fee_on_materials: string;
  payment_type: string;
  payment_coefficient: string;
  tax_rate: string;
  tax_amount: string;
  date_surcharge: string;
  total: string;
  common: {
    id: number;
    address: string;
    description: string;
    selected_date: string;
    date_coefficient: string;
    photos: string[];
  };
  works: Array<{
    id: number;
    type: string;
    code: string;
    name: string;
    photo: string;
    description: string;
    unit_of_measurement: string;
    work_count: string;
    total: string;
    materials: Array<{
      id: number;
      external_id: string;
      name: string;
      photo: string;
      quantity: number;
      cost_per_unit: string;
      cost: string;
    }>;
  }>;
  daysDiff?: number | null;
}

interface ExpandedOrderRowProps {
  order: CompositeOrder;
  isPendingDelete: boolean;
  undoDelete: () => void;
  onDeleteOrder: (orderId: number, orderCode: string) => void;
  token: string;
  onRefreshOrders: () => void;
  onCloseExpanded: () => void;
}

export default function ExpandedOrderRow({
  order,
  isPendingDelete,
  undoDelete,
  onDeleteOrder,
  token,
  onRefreshOrders,
  onCloseExpanded,
}: ExpandedOrderRowProps) {
  const router = useRouter();
  const [currentOrder, setCurrentOrder] = useState<CompositeOrder>(order);
  const [showServiceTimePicker, setShowServiceTimePicker] = useState(false);

  // Helper to extract base labor/materials fees
  function getBaseValues() {
    const totalWorks = currentOrder.works.reduce((acc, w) => acc + parseFloat(w.total), 0);
    const totalMats = currentOrder.works.reduce((acc, w) => {
      const sumMats = w.materials.reduce((mAcc, mat) => mAcc + parseFloat(mat.cost), 0);
      return acc + sumMats;
    }, 0);
    const laborBase = totalWorks - totalMats;
    const dateSurchargeNum = parseFloat(currentOrder.date_surcharge || "0");
    const feeLabor = parseFloat(currentOrder.service_fee_on_labor || "0");
    const feeMats = parseFloat(currentOrder.service_fee_on_materials || "0");
    return { laborBase, dateSurchargeNum, feeLabor, totalMats, feeMats };
  }

  // For displaying date warnings
  function getDateLabel(): string {
    const dateStr = currentOrder.common.selected_date;
    if (!dateStr) return "";
    const orderDate = parse(dateStr, "EEE, d MMM yyyy", new Date());
    const now = new Date();
    const diff = differenceInCalendarDays(orderDate, now);
    if (diff < 0) return "Date expired. Update";
    if (diff === 0) return "Expires today. Update";
    if (diff === 1) return "Expires in 1 day. Update";
    if (diff === 2) return "Expires in 2 days. Update";
    return "";
  }

  const dateLabel = getDateLabel();
  const isSpecialDate = dateLabel !== "";

  // Apply new date-coefficient changes locally only
  function handleConfirmNewDateLocal(newDate: string, newCoef: number) {
    const oldCoef = parseFloat(currentOrder.common.date_coefficient || "1");
    const ratio = newCoef / (oldCoef || 1);

    const { laborBase, dateSurchargeNum, feeLabor, totalMats, feeMats } = getBaseValues();

    const oldLaborSum = laborBase + dateSurchargeNum + feeLabor;
    const newLaborSum = oldLaborSum * ratio;

    const shareLaborBase = laborBase / oldLaborSum || 0;
    const shareSurcharge = dateSurchargeNum / oldLaborSum || 0;
    const shareFeeLabor = feeLabor / oldLaborSum || 0;

    const newLaborBase = newLaborSum * shareLaborBase;
    const newDateSurcharge = newLaborSum * shareSurcharge;
    const newFeeLabor = newLaborSum * shareFeeLabor;

    const partialMaterials = totalMats + feeMats;
    const newLaborPart = newLaborBase + newDateSurcharge + newFeeLabor;
    const newSubtotal = newLaborPart + partialMaterials;

    const taxRateNum = parseFloat(currentOrder.tax_rate || "0");
    const newTaxAmount = (newSubtotal * taxRateNum) / 100;
    const newTotal = newSubtotal + newTaxAmount;

    const localCopy = structuredClone(currentOrder);
    localCopy.common.selected_date = newDate;
    localCopy.common.date_coefficient = newCoef.toFixed(2);
    localCopy.service_fee_on_labor = newFeeLabor.toFixed(2);
    localCopy.date_surcharge = newDateSurcharge.toFixed(2);
    localCopy.subtotal = newSubtotal.toFixed(2);
    localCopy.tax_amount = newTaxAmount.toFixed(2);
    localCopy.total = newTotal.toFixed(2);

    try {
      const parsedDate = parse(newDate, "EEE, d MMM yyyy", new Date());
      localCopy.daysDiff = differenceInCalendarDays(parsedDate, new Date());
    } catch {
      localCopy.daysDiff = null;
    }
    setCurrentOrder(localCopy);
    setShowServiceTimePicker(false);
  }

  // Send final update to server
  async function handleSubmitUpdate() {
    try {
      const payload = {
        user_token: token,
        order_code: currentOrder.code,
        common: {
          selected_date: currentOrder.common.selected_date,
          date_coefficient: currentOrder.common.date_coefficient,
        },
        works: [],
        tax_rate: currentOrder.tax_rate,
        tax_amount: currentOrder.tax_amount,
        service_fee_on_labor: currentOrder.service_fee_on_labor,
        service_fee_on_materials: currentOrder.service_fee_on_materials,
        payment_type: currentOrder.payment_type,
        payment_coefficient: currentOrder.payment_coefficient,
        date_surcharge: currentOrder.date_surcharge,
        subtotal: currentOrder.subtotal,
        total: currentOrder.total,
      };

      const updateResp = await fetch("/api/orders/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!updateResp.ok) {
        const errData = await updateResp.json();
        throw new Error(errData.error || "Failed to update order");
      }
      await updateResp.json();

      alert("Order updated!");
      onRefreshOrders();
      onCloseExpanded();
    } catch (err: any) {
      alert("Error updating order: " + err.message);
    }
  }

  let surchargeOrDiscountLabel = "";
  const dateSurchargeNum = parseFloat(currentOrder.date_surcharge || "0");
  if (dateSurchargeNum > 0) surchargeOrDiscountLabel = "Surcharge";
  else if (dateSurchargeNum < 0) surchargeOrDiscountLabel = "Discount";
  else surchargeOrDiscountLabel = "Surcharge/Discount (none)";

  const sumWorksTotals = currentOrder.works.reduce(
    (acc, w) => acc + parseFloat(w.total),
    0
  );
  const sumMaterialsCost = currentOrder.works.reduce((acc, w) => {
    const sumMats = w.materials.reduce((mAcc, mat) => mAcc + parseFloat(mat.cost), 0);
    return acc + sumMats;
  }, 0);

  const laborTotal = sumWorksTotals - sumMaterialsCost;
  const serviceFeeOnLaborNum = parseFloat(currentOrder.service_fee_on_labor || "0");
  const serviceFeeOnMaterialsNum = parseFloat(currentOrder.service_fee_on_materials || "0");
  const subtotalNum = parseFloat(currentOrder.subtotal || "0");
  const taxRateNum = parseFloat(currentOrder.tax_rate || "0");
  const taxAmountNum = parseFloat(currentOrder.tax_amount || "0");
  const totalNum = parseFloat(currentOrder.total || "0");

  return (
    <tr className="bg-gray-100">
      <td colSpan={4} className="px-2 sm:px-3 py-3 text-sm text-gray-700">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">
          Order for{" "}
          {currentOrder.works.length > 0 ? currentOrder.works[0].type : "N/A"} №
          {currentOrder.code}
        </h2>

        <p className="mb-1">
          <strong>Address:</strong> {currentOrder.common.address}
        </p>
        <p className="mb-4">
          <strong>Start Date:</strong>{" "}
          {isSpecialDate ? (
            <span
              onClick={() => setShowServiceTimePicker(true)}
              className="text-red-600 font-semibold cursor-pointer underline"
            >
              {dateLabel}
            </span>
          ) : (
            currentOrder.common.selected_date
          )}
        </p>

        {showServiceTimePicker && (
          <div className="mt-6">
            <ServiceTimePicker
              subtotal={laborTotal}
              onClose={() => setShowServiceTimePicker(false)}
              onConfirm={handleConfirmNewDateLocal}
            />
          </div>
        )}

        <h3 className="text-xl sm:text-xl font-bold mb-2">Estimate</h3>
        {currentOrder.works.map((work, idx) => {
          const matsSum = work.materials.reduce(
            (acc, mat) => acc + parseFloat(mat.cost),
            0
          );
          const singleLabor = parseFloat(work.total) - matsSum;
          const workCountVal = parseFloat(work.work_count);

          return (
            <div key={work.id} className="mb-8">
              <p className="text-lg sm:xl font-bold mb-2">
                {idx + 1}. {work.name}
              </p>

              <div className="sm:flex sm:items-start sm:gap-4">
                {work.photo && (
                  <div className="mb-2 sm:mb-0 sm:w-64">
                    <img
                      src={work.photo}
                      alt={work.name}
                      className="w-full h-auto object-cover border rounded"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <p className="mb-2">{work.description}</p>
                  <p className="mb-2 text-sm font-bold">
                    <strong>Quantity:</strong>{" "}
                    {workCountVal.toLocaleString("en-US", {
                      minimumFractionDigits: 0,
                    })}{" "}
                    {work.unit_of_measurement}
                  </p>
                  <p className="mb-2">
                    <strong>Labor:</strong>{" "}
                    {singleLabor.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="mb-2">
                    <strong>Materials, tools & equipment:</strong>{" "}
                    {matsSum.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              {work.materials.length > 0 && (
                <div className="overflow-auto border rounded my-3">
                  <table className="min-w-full text-left text-sm bg-white">
                    <thead className="border-b">
                      <tr>
                        <th className="px-2 py-1 font-bold">Name</th>
                        <th className="px-2 py-1 font-bold">Qty</th>
                        <th className="px-2 py-1 font-bold">Price</th>
                        <th className="px-2 py-1 font-bold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {work.materials.map((mat) => (
                        <tr key={mat.id} className="border-b">
                          <td className="px-2 py-1 align-top">
                            {mat.name}
                            {mat.photo && (
                              <div className="my-1">
                                <img
                                  src={mat.photo}
                                  alt={mat.name}
                                  className="w-32 h-32 object-cover rounded"
                                />
                              </div>
                            )}
                          </td>
                          <td className="px-2 py-1 align-top">
                            {mat.quantity.toLocaleString("en-US", {
                              minimumFractionDigits: 0,
                            })}
                          </td>
                          <td className="px-2 py-1 align-top">
                            {parseFloat(mat.cost_per_unit).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td className="px-2 py-1 align-top">
                            {parseFloat(mat.cost).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}

        <div className="mb-2 space-y-1">
          <p>
            <strong>Labor Total:</strong>{" "}
            {laborTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p>
            <strong>Materials, tools & equipment:</strong>{" "}
            {sumMaterialsCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p>
            <strong>{surchargeOrDiscountLabel}:</strong>{" "}
            {dateSurchargeNum.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p>
            <strong>Service Fee on Labor:</strong>{" "}
            {serviceFeeOnLaborNum.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p>
            <strong>Delivery & Processing Fee:</strong>{" "}
            {serviceFeeOnMaterialsNum.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="p-3 bg-white rounded space-y-1 border">
          <p>
            <strong>Subtotal:</strong>{" "}
            {subtotalNum.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p>
            <strong>
              Taxes ({taxRateNum.toLocaleString("en-US", { minimumFractionDigits: 2 })}%):
            </strong>{" "}
            {taxAmountNum.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-2 font-bold text-lg sm:text-xl">
            <strong>Total:</strong> ${totalNum.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>

        {currentOrder.common.description && (
          <p className="italic mb-2 mt-4">
            Description: {currentOrder.common.description}
          </p>
        )}
        {currentOrder.common.photos && currentOrder.common.photos.length > 0 && (
          <div>
            <p className="font-semibold">Attached Photos:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
              {currentOrder.common.photos.map((photoUrl) => (
                <div key={photoUrl}>
                  <img
                    src={photoUrl}
                    alt="Order photo"
                    className="border rounded w-full h-32 sm:h-64 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Desktop buttons */}
        <div className="mt-6 hidden sm:flex items-center gap-3 justify-end">
          <button
            onClick={handleSubmitUpdate}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-400 text-gray-700 rounded hover:bg-gray-50"
            title="Update order on server"
          >
            Update
          </button>

          <button
            onClick={() => router.push(`/dashboard/print/${currentOrder.code}`)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-400 text-gray-700 rounded hover:bg-gray-50"
            title="Print order"
          >
            <Printer size={16} />
            <span>Print</span>
          </button>

          {isPendingDelete ? (
            <div className="text-red-600 flex items-center gap-2">
              <span>Deleting...</span>
              <button onClick={undoDelete} className="underline text-blue-600 text-xs">
                Undo
              </button>
            </div>
          ) : (
            <button
              onClick={() => onDeleteOrder(currentOrder.id, currentOrder.code)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-red-500 text-red-600 rounded hover:bg-red-50"
              title="Delete order"
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          )}
        </div>

        {/* Mobile buttons */}
        <div className="mt-6 flex sm:hidden items-center gap-3">
          <button
            onClick={handleSubmitUpdate}
            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-400 text-gray-700 text-sm rounded hover:bg-gray-50"
          >
            Update
          </button>

          <button
            onClick={() => router.push(`/dashboard/print/${currentOrder.code}`)}
            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-400 text-gray-700 text-sm rounded hover:bg-gray-50"
            title="Print order"
          >
            <Printer size={16} />
            <span>Print</span>
          </button>

          {isPendingDelete ? (
            <div className="text-red-600 flex items-center gap-2">
              <span>Deleting...</span>
              <button onClick={undoDelete} className="underline text-blue-600 text-xs">
                Undo
              </button>
            </div>
          ) : (
            <button
              onClick={() => onDeleteOrder(currentOrder.id, currentOrder.code)}
              className="inline-flex items-center gap-2 px-3 py-2 border border-red-500 text-red-600 text-sm rounded hover:bg-red-50"
              title="Delete order"
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}