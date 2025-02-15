"use client";

import React from "react";

/**
 * Based on your CompositeOrder interface, define a type or import it here.
 * We'll assume it's imported or repeated below for brevity.
 */
interface CompositeOrder {
  id: number;
  code: string;
  zipcode: string;
  tax_rate: string;
  common: {
    address: string;
    description: string;
    selected_date: string;
  };
  works: Array<{
    id: number;
    code: string;
    total: string;
    materials: Array<{
      id: number;
    }>;
  }>;
}

/**
 * The props your ExpandedOrderRow needs.
 */
interface ExpandedOrderRowProps {
  /**
   * The fully-fetched order details from /api/orders/get (or from your saved list).
   */
  order: CompositeOrder;

  /**
   * Boolean indicating whether this order is currently pending deletion (soft-delete).
   */
  isPendingDelete: boolean;

  /**
   * Handler to call if the user wants to "undo" a pending delete.
   */
  undoDelete: () => void;

  /**
   * Handler to actually initiate or finalize the delete. Typically calls `initiateDeleteOrder` or `handleDeleteOrder`.
   */
  onDeleteOrder: (orderId: number, orderCode: string) => void;
}

/**
 * A separate component that renders all the "expanded details" for a single order.
 */
export default function ExpandedOrderRow({
  order,
  isPendingDelete,
  undoDelete,
  onDeleteOrder,
}: ExpandedOrderRowProps) {
  return (
    <tr className="bg-gray-50">
      <td colSpan={4} className="p-4 text-sm text-gray-700">
        <p className="mb-2">
          <strong>Address:</strong> {order.common.address}
        </p>
        <p className="mb-2">
          <strong>Description:</strong> {order.common.description}
        </p>
        <p className="mb-2">
          <strong>ZIP:</strong> {order.zipcode}
        </p>
        <p className="mb-2">
          <strong>Tax rate:</strong> {order.tax_rate}%
        </p>
        <p>
          <strong>Works:</strong>
        </p>
        <ul className="list-disc ml-5">
          {order.works.map((w) => (
            <li key={w.id} className="mb-1">
              <strong>Code:</strong> {w.code} &nbsp;
              <strong>Total:</strong> {w.total} &nbsp;
              <span>(Materials: {w.materials.length})</span>
            </li>
          ))}
        </ul>

        {/* Mobile-only Delete button */}
        <div className="mt-4 block sm:hidden">
          {isPendingDelete ? (
            <div className="text-red-600 flex items-center gap-2">
              <span>Deleting...</span>
              <button
                onClick={undoDelete}
                className="underline text-blue-600 text-xs"
              >
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