"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

interface CompositeOrder {
  id: number;
  code: string;
  user_id: number;
  user_token: string;
  zipcode: string;
  subtotal: string;
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
    unit_of_measurement: string;
    work_count: string;
    service_fee_on_labor: string;
    service_fee_on_materials: string;
    payment_type: string;
    payment_coefficient: string;
    total: string;
    materials: Array<{
      id: number;
      external_id: string;
      quantity: number;
      cost_per_unit: string;
      cost: string;
    }>;
  }>;
}

export default function OrdersPage() {
  const router = useRouter();

  // Token and user info
  const [token, setToken] = useState("");
  const [userName, setUserName] = useState("");
  const [hasName, setHasName] = useState(false);

  // Tab state => "saved" by default
  const [tab, setTab] = useState<"saved" | "active" | "past">("saved");

  // Orders data
  const [savedOrders, setSavedOrders] = useState<CompositeOrder[] | null>(null);
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedError, setSavedError] = useState<string | null>(null);

  // Sort state
  const [sortColumn, setSortColumn] = useState<"code" | "cost" | "date" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // "Soft-delete" logic
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);
  const deleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Expand/collapse logic
  const [expandedOrderCode, setExpandedOrderCode] = useState<string | null>(null);
  const [expandedOrderDetails, setExpandedOrderDetails] = useState<CompositeOrder | null>(null);

  // On mount, check token, user info
  useEffect(() => {
    const storedToken = sessionStorage.getItem("authToken");
    if (!storedToken) {
      router.push("/login");
      return;
    }
    setToken(storedToken);

    const storedProfile = sessionStorage.getItem("profileData");
    if (storedProfile) {
      try {
        const parsed = JSON.parse(storedProfile);
        const name = parsed?.name?.trim();
        if (name) {
          setUserName(name);
          setHasName(true);
        }
      } catch (err) {
        console.warn("Failed to parse profileData in Orders:", err);
      }
    }
  }, [router]);

  // When tab === "saved" && token => try to load from sessionStorage => if no data => fetch
  useEffect(() => {
    if (tab === "saved" && token) {
      const cached = sessionStorage.getItem("savedOrders");
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as CompositeOrder[];
          setSavedOrders(parsed);
          // Optionally, we can skip fetch if we trust this data is fresh enough
          // If you want to ALWAYS trust cache => return here
          // return;
        } catch (err) {
          console.error("Failed to parse savedOrders from sessionStorage:", err);
        }
      }
      // If we want to refresh anyway, call fetch
      // If you trust the cache fully, only do fetch if there's no cached data
      if (!cached) {
        fetchSavedOrders(token);
      }
    }
  }, [tab, token]);

  // Actually fetch from /api/orders/list
  async function fetchSavedOrders(userToken: string) {
    try {
      setSavedLoading(true);
      setSavedError(null);
      setSavedOrders(null);

      const resp = await fetch("/api/orders/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: userToken }),
      });

      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.error || "Failed to fetch saved orders");
      }

      const data = await resp.json();
      setSavedOrders(data);

      // Store in session storage for reuse
      sessionStorage.setItem("savedOrders", JSON.stringify(data));
    } catch (error: any) {
      console.error("Error fetching saved orders:", error);
      setSavedError(error.message);
    } finally {
      setSavedLoading(false);
    }
  }

  // If user expands the same code => collapse, else fetch details
  async function handleGetOrderDetails(orderCode: string) {
    if (expandedOrderCode === orderCode) {
      setExpandedOrderCode(null);
      setExpandedOrderDetails(null);
      return;
    }

    try {
      console.log("Fetching details for order code:", orderCode);

      const resp = await fetch("/api/orders/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, order_code: orderCode }),
      });

      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.error || "Failed to fetch order details");
      }

      const orderDetails = await resp.json();
      console.log("Received order details:", orderDetails);

      setExpandedOrderCode(orderCode);
      setExpandedOrderDetails(orderDetails);

    } catch (error: any) {
      console.error("Error getting order details:", error);
      alert("Error getting details: " + error.message);
    }
  }

  // Soft-delete approach
  function initiateDeleteOrder(orderId: number, orderCode: string) {
    if (pendingDelete === orderId) {
      return;
    }
    const confirmMsg = `Are you sure you want to delete order ${orderCode}? You will have 5 seconds to undo.`;
    if (!window.confirm(confirmMsg)) {
      return;
    }
    setPendingDelete(orderId);
    if (deleteTimeoutRef.current) {
      clearTimeout(deleteTimeoutRef.current);
    }
    deleteTimeoutRef.current = setTimeout(() => {
      handleDeleteOrder(orderCode);
      setPendingDelete(null);
    }, 5000);
  }

  function undoDelete() {
    if (deleteTimeoutRef.current) {
      clearTimeout(deleteTimeoutRef.current);
    }
    setPendingDelete(null);
  }

  async function handleDeleteOrder(orderCode: string) {
    try {
      console.log("Deleting order code:", orderCode);

      const resp = await fetch("/api/orders/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, order_code: orderCode }),
      });

      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.error || "Failed to delete order");
      }

      const result = await resp.json();
      console.log("Delete result:", result);
      alert(`Order ${orderCode} deleted!`);

      // Refresh => so our local data is up to date
      // or we can manually remove from savedOrders, then update sessionStorage
      await fetchSavedOrders(token);
    } catch (error: any) {
      console.error("Error deleting order:", error);
      alert("Error deleting order: " + error.message);
    }
  }

  // Sorting logic
  function handleSort(column: "code" | "cost" | "date") {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  }

  function getSortedOrders(): CompositeOrder[] {
    if (!savedOrders) return [];
    if (!sortColumn) return savedOrders;

    const arr = [...savedOrders];
    arr.sort((a, b) => {
      if (sortColumn === "code") {
        if (a.code < b.code) return sortDirection === "asc" ? -1 : 1;
        if (a.code > b.code) return sortDirection === "asc" ? 1 : -1;
        return 0;
      } else if (sortColumn === "cost") {
        const costA = parseFloat(a.subtotal) + parseFloat(a.tax_amount);
        const costB = parseFloat(b.subtotal) + parseFloat(b.tax_amount);
        if (costA < costB) return sortDirection === "asc" ? -1 : 1;
        if (costA > costB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      } else if (sortColumn === "date") {
        const dateA = a.common.selected_date;
        const dateB = b.common.selected_date;
        if (dateA < dateB) return sortDirection === "asc" ? -1 : 1;
        if (dateA > dateB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      }
      return 0;
    });

    return arr;
  }

  const greetingText = getGreeting();
  const sortedSavedOrders = getSortedOrders();
  const savedCount = savedOrders ? savedOrders.length : 0;

  return (
    <div className="pt-24 min-h-screen w-full bg-gray-50 pb-10">
      <div className="max-w-7xl mx-auto px-0 sm:px-4">
        {/* Greeting */}
        <h1 className="text-2xl sm:text-3xl font-bold mt-6 mb-2">
          {greetingText}, {hasName ? userName : "Guest"}!
        </h1>

        {/* Navigation row */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-8">
            <Link href="/profile" className="text-gray-600 hover:text-blue-600">
              Profile
            </Link>
            <Link href="/dashboard" className="text-blue-600 border-b-2 border-blue-600">
              Orders
            </Link>
            <Link href="/profile/messages" className="text-gray-600 hover:text-blue-600">
              Messages
            </Link>
            <Link href="/profile/settings" className="text-gray-600 hover:text-blue-600">
              Settings
            </Link>
          </div>
        </div>

        {/* Tabs: Saved, Active, Past */}
        <div className="flex items-center gap-4 mb-6 text-sm font-medium">
          <button
            onClick={() => setTab("saved")}
            className={`px-3 py-2 rounded 
              ${tab === "saved" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"}`}
          >
            Saved {savedCount > 0 && (
              <span className="ml-1 bg-blue-600 text-white rounded-full px-2 py-0.5 text-xs">
                {savedCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("active")}
            className={`px-3 py-2 rounded 
              ${tab === "active" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"}`}
          >
            Active
          </button>
          <button
            onClick={() => setTab("past")}
            className={`px-3 py-2 rounded 
              ${tab === "past" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"}`}
          >
            Past
          </button>
        </div>

        {/* ACTIVE tab */}
        {tab === "active" && (
          <div>
            <p className="text-gray-700">No active orders yet.</p>
          </div>
        )}

        {/* PAST tab */}
        {tab === "past" && (
          <div>
            <p className="text-gray-700">No past orders yet.</p>
          </div>
        )}

        {/* SAVED tab => table */}
        {tab === "saved" && (
          <div>
            {savedLoading && <p>Loading saved orders...</p>}
            {savedError && <p className="text-red-600">Error: {savedError}</p>}

            {!savedLoading && !savedError && savedOrders?.length === 0 && (
              <p>No saved orders yet.</p>
            )}

            {!savedLoading && !savedError && sortedSavedOrders.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full table-auto border-collapse">
                  <thead className="bg-gray-100 text-gray-700 text-sm">
                    <tr>
                      {/* Code column */}
                      <th className="py-2 px-3 text-left">
                        <button
                          className="flex items-center gap-1"
                          onClick={() => handleSort("code")}
                        >
                          Order #
                          {sortColumn === "code" && (
                            <span>
                              {sortDirection === "asc" ? "▲" : "▼"}
                            </span>
                          )}
                        </button>
                      </th>
                      {/* Cost column */}
                      <th className="py-2 px-3 text-left">
                        <button
                          className="flex items-center gap-1"
                          onClick={() => handleSort("cost")}
                        >
                          Total Price
                          {sortColumn === "cost" && (
                            <span>
                              {sortDirection === "asc" ? "▲" : "▼"}
                            </span>
                          )}
                        </button>
                      </th>
                      {/* Date column */}
                      <th className="py-2 px-3 text-left">
                        <button
                          className="flex items-center gap-1"
                          onClick={() => handleSort("date")}
                        >
                          Start Date
                          {sortColumn === "date" && (
                            <span>
                              {sortDirection === "asc" ? "▲" : "▼"}
                            </span>
                          )}
                        </button>
                      </th>
                      {/* Actions column => hidden on mobile */}
                      <th className="py-2 px-3 text-right hidden sm:table-cell">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSavedOrders.map((order) => {
                      const totalAmount = (
                        parseFloat(order.subtotal) + parseFloat(order.tax_amount)
                      ).toFixed(2);

                      const isPendingDelete = pendingDelete === order.id;
                      const isExpanded = expandedOrderCode === order.code;

                      return (
                        <React.Fragment key={order.id}>
                          <tr className="border-b text-sm text-gray-700">
                            <td className="py-2 px-3">
                              <span
                                onClick={() => handleGetOrderDetails(order.code)}
                                className="text-blue-600 font-medium cursor-pointer hover:underline"
                              >
                                {order.code}
                              </span>
                            </td>
                            <td className="py-2 px-3">${totalAmount}</td>
                            <td className="py-2 px-3">{order.common.selected_date}</td>
                            <td className="py-2 px-3 text-right hidden sm:table-cell">
                              {isPendingDelete ? (
                                <div className="text-red-600 flex items-center gap-2 justify-end">
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
                                  onClick={() => initiateDeleteOrder(order.id, order.code)}
                                  className="text-gray-500 hover:text-red-600"
                                  title="Delete order"
                                >
                                  🗑
                                </button>
                              )}
                            </td>
                          </tr>

                          {isExpanded && (
                            <tr className="bg-gray-50">
                              <td colSpan={4} className="p-4 text-sm text-gray-700">
                                <p className="mb-2">
                                  <strong>Address:</strong> {order.common.address}
                                </p>
                                <p className="mb-2">
                                  <strong>Description:</strong> {order.common.description}
                                </p>
                                <p className="mb-2">
                                  <strong>Zipcode:</strong> {order.zipcode}
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

                                {/* Mobile Delete button => block on mobile, hidden on desktop */}
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
                                      onClick={() => initiateDeleteOrder(order.id, order.code)}
                                      className="bg-red-600 text-white px-4 py-2 text-sm rounded hover:bg-red-700"
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}