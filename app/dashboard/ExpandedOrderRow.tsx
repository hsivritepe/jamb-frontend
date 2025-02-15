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
  return (
    <tr className="bg-gray-50">
      <td colSpan={4} className="px-3 py-3 text-sm text-gray-700">
        <p><strong>ID:</strong> {order.id}</p>
        <p><strong>Order Code:</strong> {order.code}</p>
        <p><strong>User ID:</strong> {order.user_id}</p>
        <p><strong>User Token:</strong> {order.user_token}</p>
        <p><strong>Zipcode:</strong> {order.zipcode}</p>
        <p><strong>Subtotal:</strong> {order.subtotal}</p>
        <p><strong>Service Fee on Labor:</strong> {order.service_fee_on_labor}</p>
        <p><strong>Service Fee on Materials:</strong> {order.service_fee_on_materials}</p>
        <p><strong>Payment Type:</strong> {order.payment_type}</p>
        <p><strong>Payment Coefficient:</strong> {order.payment_coefficient}</p>
        <p><strong>Tax Rate:</strong> {order.tax_rate}</p>
        <p><strong>Tax Amount:</strong> {order.tax_amount}</p>

        <hr className="my-3" />

        <h3 className="font-bold mb-1">Common</h3>
        <p><strong>ID:</strong> {order.common.id}</p>
        <p><strong>Address:</strong> {order.common.address}</p>
        <p><strong>Description:</strong> {order.common.description}</p>
        <p><strong>Selected Date:</strong> {order.common.selected_date}</p>
        <p><strong>Date Coefficient:</strong> {order.common.date_coefficient}</p>

        <hr className="my-3" />

        {/* Works */}
        <h3 className="font-bold mb-2">Works</h3>
        {order.works.map((work) => (
          <div key={work.id} className="mb-4 p-3 border rounded bg-white">
            <p><strong>ID:</strong> {work.id}</p>
            <p><strong>Type:</strong> {work.type}</p>
            <p><strong>Code:</strong> {work.code}</p>
            <p><strong>Name:</strong> {work.name}</p>
            <p><strong>Photo:</strong>{" "}
              <a
                href={work.photo}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline"
              >
                View
              </a>
            </p>
            <p><strong>Description:</strong> {work.description}</p>
            <p><strong>Unit of Measurement:</strong> {work.unit_of_measurement}</p>
            <p><strong>Work Count:</strong> {work.work_count}</p>
            <p><strong>Total:</strong> {work.total}</p>

            {/* Materials inside work */}
            <h4 className="font-semibold mt-3">Materials</h4>
            {work.materials.length > 0 ? (
              work.materials.map((mat) => (
                <div key={mat.id} className="ml-4 mt-2 border-l pl-4">
                  <p><strong>ID:</strong> {mat.id}</p>
                  <p><strong>External ID:</strong> {mat.external_id}</p>
                  <p><strong>Name:</strong> {mat.name}</p>
                  <p>
                    <strong>Photo:</strong>{" "}
                    <a
                      href={mat.photo}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      View
                    </a>
                  </p>
                  <p><strong>Quantity:</strong> {mat.quantity}</p>
                  <p><strong>Cost per Unit:</strong> {mat.cost_per_unit}</p>
                  <p><strong>Cost:</strong> {mat.cost}</p>
                </div>
              ))
            ) : (
              <p className="ml-4 mt-1 italic text-gray-500">No materials</p>
            )}
          </div>
        ))}

        {/* Кнопка удаления (мобильная версия) */}
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