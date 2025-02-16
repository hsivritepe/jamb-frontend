"use client";

import React from "react";

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

interface ExpandedOrderRowProps {
  order: CompositeOrder;
  isPendingDelete: boolean;
  undoDelete: () => void;
  onDeleteOrder: (orderId: number, orderCode: string) => void;
}

export default function ExpandedOrderRow({
  order,
  isPendingDelete,
  undoDelete,
  onDeleteOrder,
}: ExpandedOrderRowProps) {
  /************************************************
   * 1) Calculate overall labor/materials for entire order
   ************************************************/
  const sumWorksTotals = order.works.reduce((acc, w) => acc + parseFloat(w.total), 0);
  const sumMaterialsCost = order.works.reduce((acc, w) => {
    const sumMats = w.materials.reduce((mAcc, mat) => mAcc + parseFloat(mat.cost), 0);
    return acc + sumMats;
  }, 0);

  // Overall labor total for the entire order
  const laborTotal = sumWorksTotals - sumMaterialsCost;

  // Surcharge/Discount logic
  const dateCoefficient = parseFloat(order.common.date_coefficient) || 1;
  const surchargeOrDiscountValue = laborTotal * dateCoefficient - laborTotal;
  let surchargeOrDiscountLabel = "";
  if (dateCoefficient > 1) {
    surchargeOrDiscountLabel = "Surcharge";
  } else if (dateCoefficient < 1) {
    surchargeOrDiscountLabel = "Discount";
  } else {
    surchargeOrDiscountLabel = "Surcharge/Discount (none)";
  }

  // Fees, subtotal, taxes, total
  const serviceFeeOnLabor = parseFloat(order.service_fee_on_labor || "0");
  const serviceFeeOnMaterials = parseFloat(order.service_fee_on_materials || "0");
  const subtotalNum = parseFloat(order.subtotal || "0");
  const taxRateNum = parseFloat(order.tax_rate || "0");
  const taxAmountNum = parseFloat(order.tax_amount || "0");
  const totalPrice = subtotalNum + taxAmountNum;

  return (
    <tr className="bg-gray-50">
      <td colSpan={4} className="px-1 sm:px-3 py-3 text-sm text-gray-700">
        {/** Header */}
        <h2 className="text-base sm:text-lg font-bold mb-2">
          Order for selected {order.works.length > 0 ? order.works[0].type : "N/A"} №{order.code}
        </h2>

        {/* Address + Selected Date */}
        <p className="mb-1">
          <strong>Address:</strong> {order.common.address}
        </p>
        <p className="mb-4">
          <strong>Start Date:</strong> {order.common.selected_date}
        </p>

        {/** ESTIMATE (works loop) */}
        <h3 className="text-base sm:text-lg font-bold mb-2">Estimate</h3>
        {order.works.map((work, idx) => {
          // For each work, compute per-work labor cost and materials cost
          const sumWorkMaterials = work.materials.reduce((acc, mat) => acc + parseFloat(mat.cost), 0);
          const singleWorkLabor = parseFloat(work.total) - sumWorkMaterials;

          return (
            <div key={work.id} className="mb-6">
              {/* Work # + Name */}
              <p className="text-sm sm:text-base font-semibold mb-2">
                {idx + 1}. {work.name}
              </p>

              {/*
                Desktop: show photo left, text right (flex)
                Mobile: stack vertically
              */}
              <div className="sm:flex sm:items-start sm:gap-4">
                {/* Left: Photo (if any) */}
                {work.photo && (
                  <div className="mb-2 sm:mb-0 sm:w-64">
                    <img
                      src={work.photo}
                      alt={work.name || "Work photo"}
                      className="w-full h-auto object-cover border rounded"
                    />
                  </div>
                )}

                {/* Right: Description, quantity, singleWorkLabor, materials cost */}
                <div className="flex-1">
                  <p className="mb-2">{work.description}</p>
                  <p className="mb-2 text-sm font-bold">
                    <strong>Quantity:</strong> {work.work_count} {work.unit_of_measurement}
                  </p>
                  <p className="mb-2">
                    <strong>Labor Price:</strong> {singleWorkLabor.toFixed(2)}
                  </p>
                  <p className="mb-2">
                    <strong>Materials Cost:</strong> {sumWorkMaterials.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Materials Table */}
              {work.materials.length > 0 && (
                <div className="overflow-auto border rounded my-3">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="px-2 py-1 font-semibold">Name</th>
                        <th className="px-2 py-1 font-semibold">Qty</th>
                        <th className="px-2 py-1 font-semibold">Price</th>
                        <th className="px-2 py-1 font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {work.materials.map((mat) => (
                        <tr key={mat.id} className="border-b">
                          <td className="px-2 py-1 align-top">
                            {/* If a material has a photo, show it above the name */}
                            {mat.photo && (
                              <div className="mb-1">
                                <img
                                  src={mat.photo}
                                  alt={mat.name}
                                  className="w-32 h-32 object-cover border rounded"
                                />
                              </div>
                            )}
                            {mat.name}
                          </td>
                          <td className="px-2 py-1 align-top">{mat.quantity}</td>
                          <td className="px-2 py-1 align-top">
                            ${parseFloat(mat.cost_per_unit).toFixed(2)}
                          </td>
                          <td className="px-2 py-1 align-top">
                            ${parseFloat(mat.cost).toFixed(2)}
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
            <strong>Labor Total:</strong> {laborTotal.toFixed(2)}
          </p>
          <p>
            <strong>Materials, tools & equipment:</strong> {sumMaterialsCost.toFixed(2)}
          </p>
          <p>
            <strong>{surchargeOrDiscountLabel}:</strong> {surchargeOrDiscountValue.toFixed(2)}
          </p>
          <p>
            <strong>Service Fee on Labor:</strong> {serviceFeeOnLabor.toFixed(2)}
          </p>
          <p>
            <strong>Service Fee on Materials:</strong> {serviceFeeOnMaterials.toFixed(2)}
          </p>
        </div>

        {/* Subtotal/Taxes/Total in a highlighted box */}
        <div className="p-3 bg-gray-100 rounded space-y-1">
          <p>
            <strong>Subtotal:</strong>{" "}
            {subtotalNum.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </p>
          <p>
            <strong>Taxes ({taxRateNum.toFixed(2)}%):</strong> $
            {taxAmountNum.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </p>
          <p className="mt-2 font-bold text-lg sm:text-xl">
            <strong>Total:</strong>{" "}
            US$
            {totalPrice.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>

        {/** BOTTOM BLOCK: COMMON DATA */}
        <div className="mt-4">
          {order.common.description && (
            <p className="italic mb-2">Description: {order.common.description}</p>
          )}

          {order.common.photos && order.common.photos.length > 0 && (
            <div>
              <p className="font-semibold">Common Photos:</p>
              <ul className="list-disc ml-5 mt-1">
                {order.common.photos.map((photoUrl) => (
                  <li key={photoUrl}>
                    <a
                      href={photoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      {photoUrl}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/** MOBILE-ONLY DELETE BUTTON */}
        <div className="mt-6 block sm:hidden">
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
              className="bg-red-600 text-white px-4 py-2 text-sm rounded hover:bg-red-700"
            >
              Delete
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}