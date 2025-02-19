"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Printer, Trash2 } from "lucide-react";

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
}

/**
 * - onDeleteOrder expects (orderId: number, orderCode: string)
 * - isPendingDelete is a boolean the parent decides (if parent's pendingDelete === order.id).
 */
interface ExpandedOrderRowProps {
  order: CompositeOrder;
  isPendingDelete: boolean;
  undoDelete: () => void;
  onDeleteOrder: (orderId: number, orderCode: string) => void;
}

/**
 * This component renders the expanded details of a single order.
 * It also includes "Print" and "Delete" buttons (both desktop and mobile).
 */
export default function ExpandedOrderRow({
  order,
  isPendingDelete,
  undoDelete,
  onDeleteOrder,
}: ExpandedOrderRowProps) {
  const router = useRouter();

  // 1) Calculate labor total
  const sumWorksTotals = order.works.reduce((acc, w) => acc + parseFloat(w.total), 0);
  const sumMaterialsCost = order.works.reduce((acc, w) => {
    const sumMats = w.materials.reduce((mAcc, mat) => mAcc + parseFloat(mat.cost), 0);
    return acc + sumMats;
  }, 0);

  const laborTotal = sumWorksTotals - sumMaterialsCost;
  const dateSurchargeNum = parseFloat(order.date_surcharge || "0");

  let surchargeOrDiscountLabel = "";
  if (dateSurchargeNum > 0) {
    surchargeOrDiscountLabel = "Surcharge";
  } else if (dateSurchargeNum < 0) {
    surchargeOrDiscountLabel = "Discount";
  } else {
    surchargeOrDiscountLabel = "Surcharge/Discount (none)";
  }

  // Fees, subtotal, taxes, and total from the API
  const serviceFeeOnLabor = parseFloat(order.service_fee_on_labor || "0");
  const serviceFeeOnMaterials = parseFloat(order.service_fee_on_materials || "0");
  const subtotalNum = parseFloat(order.subtotal || "0");
  const taxRateNum = parseFloat(order.tax_rate || "0");
  const taxAmountNum = parseFloat(order.tax_amount || "0");
  const totalNum = parseFloat(order.total || "0");

  return (
    <tr className="bg-gray-100">
      <td colSpan={4} className="px-2 sm:px-3 py-3 text-sm text-gray-700">
        {/** Header */}
        <h2 className="text-xl sm:text-2xl font-bold mb-2">
          Order for selected {order.works.length > 0 ? order.works[0].type : "N/A"} №{order.code}
        </h2>

        {/* Address + Selected Date */}
        <p className="mb-1">
          <strong>Address:</strong> {order.common.address}
        </p>
        <p className="mb-4">
          <strong>Start Date:</strong> {order.common.selected_date}
        </p>

        {/** ESTIMATE (per-work items) */}
        <h3 className="text-xl sm:text-xl font-bold mb-2">Estimate</h3>
        {order.works.map((work, idx) => {
          const sumWorkMaterials = work.materials.reduce(
            (acc, mat) => acc + parseFloat(mat.cost),
            0
          );
          const singleWorkLabor = parseFloat(work.total) - sumWorkMaterials;

          // Convert the quantity from string to float for display
          const workCountVal = parseFloat(work.work_count);

          return (
            <div key={work.id} className="mb-8">
              {/* Work # + Name */}
              <p className="text-lg sm:xl font-bold mb-2">
                {idx + 1}. {work.name}
              </p>

              {/* Desktop flex layout: photo left, details right */}
              <div className="sm:flex sm:items-start sm:gap-4">
                {work.photo && (
                  <div className="mb-2 sm:mb-0 sm:w-64">
                    <img
                      src={work.photo}
                      alt={work.name || "Work photo"}
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
                    {singleWorkLabor.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  <p className="mb-2">
                    <strong>Materials, tools & equipment: </strong>{" "}
                    {sumWorkMaterials.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>

              {/* Materials Table */}
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

        {/** COST SUMMARY FOR THE WHOLE ORDER */}
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
            {dateSurchargeNum.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </p>
          <p>
            <strong>Service Fee on Labor:</strong>{" "}
            {serviceFeeOnLabor.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p>
            <strong>Delivery & Processing Fee:</strong>{" "}
            {serviceFeeOnMaterials.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Subtotal/Taxes/Total */}
        <div className="p-3 bg-white rounded space-y-1 border">
          <p>
            <strong>Subtotal:</strong>{" "}
            {subtotalNum.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </p>
          <p>
            <strong>
              Taxes ({taxRateNum.toLocaleString("en-US", { minimumFractionDigits: 2 })}%):
            </strong>{" "}
            {taxAmountNum.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </p>
          <p className="mt-2 font-bold text-lg sm:text-xl">
            <strong>Total:</strong> $
            {totalNum.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>

        {/** Additional block: common.description, common.photos, etc. */}
        <div className="mt-4">
          {order.common.description && (
            <p className="italic mb-2">
              Description: {order.common.description}
            </p>
          )}

          {order.common.photos && order.common.photos.length > 0 && (
            <div>
              <p className="font-semibold">Attached Photos:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                {order.common.photos.map((photoUrl) => (
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
        </div>

        {/**
         * DESKTOP (hidden on mobile): Print + Delete buttons
         */}
        <div className="mt-6 hidden sm:flex items-center gap-3 justify-end">
          {/* Print button (desktop) */}
          <button
            onClick={() => router.push(`/dashboard/print/${order.code}`)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            title="Print order"
          >
            <Printer size={16} />
            <span>Print</span>
          </button>

          {/* Delete logic (desktop) */}
          {isPendingDelete ? (
            <div className="text-red-600 flex items-center gap-2">
              <span>Deleting...</span>
              <button onClick={undoDelete} className="underline text-blue-600 text-xs">
                Undo
              </button>
            </div>
          ) : (
            <button
              onClick={() => onDeleteOrder(order.id, order.code)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              title="Delete order"
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          )}
        </div>

        {/**
         * MOBILE ONLY => block sm:hidden => Print + Delete
         */}
        <div className="mt-6 flex sm:hidden items-center gap-3">
          {/* Print button (mobile) */}
          <button
            onClick={() => router.push(`/dashboard/print/${order.code}`)}
            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            title="Print order"
          >
            <Printer size={16} />
            <span>Print</span>
          </button>

          {/* Delete logic (mobile) */}
          {isPendingDelete ? (
            <div className="text-red-600 flex items-center gap-2">
              <span>Deleting...</span>
              <button onClick={undoDelete} className="underline text-blue-600 text-xs">
                Undo
              </button>
            </div>
          ) : (
            <button
              onClick={() => onDeleteOrder(order.id, order.code)}
              className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
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