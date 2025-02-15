"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ExpandedOrderRow from "./ExpandedOrderRow";

/**
 * Returns a greeting based on the current hour.
 */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/**
 * Updated interface matching your server's response.
 */
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

export default function OrdersPage() {
  const router = useRouter();

  // Greeting text (computed once on mount)
  const [greetingText, setGreetingText] = useState("");

  // Token & user info from sessionStorage
  const [token, setToken] = useState("");
  const [userName, setUserName] = useState("");
  const [hasName, setHasName] = useState(false);

  // Current tab => "saved" by default
  const [tab, setTab] = useState<"saved" | "active" | "past">("saved");

  // Orders and UI states for "saved" tab
  const [savedOrders, setSavedOrders] = useState<CompositeOrder[] | null>(null);
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedError, setSavedError] = useState<string | null>(null);

  // Sorting
  const [sortColumn, setSortColumn] = useState<"code" | "cost" | "date" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Soft-delete behavior
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);
  const deleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Expand/collapse logic
  const [expandedOrderCode, setExpandedOrderCode] = useState<string | null>(null);
  const [expandedOrderDetails, setExpandedOrderDetails] = useState<CompositeOrder | null>(null);

  /**
   * Compute the greeting text on first mount.
   */
  useEffect(() => {
    const msg = getGreeting();
    setGreetingText(msg);
  }, []);

  /**
   * On mount, check for an auth token in sessionStorage; if missing => go to /login.
   * Also parse user profile (if found) to get the user's name.
   */
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
        console.warn("Failed to parse profileData:", err);
      }
    }
  }, [router]);

  /**
   * If user selects "saved" tab and we have a token:
   * 1) Load any cached orders from sessionStorage
   * 2) Always fetch fresh data from the server
   */
  useEffect(() => {
    if (tab === "saved" && token) {
      const cached = sessionStorage.getItem("savedOrders");
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as CompositeOrder[];
          setSavedOrders(parsed);
        } catch (err) {
          console.error("Failed to parse savedOrders:", err);
        }
      }
      // Always fetch new data
      fetchSavedOrders(token);
    }
  }, [tab, token]);

  /**
   * Fetch the list of saved orders from /api/orders/list.
   */
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
      sessionStorage.setItem("savedOrders", JSON.stringify(data));
    } catch (error: any) {
      console.error("Error fetching saved orders:", error);
      setSavedError(error.message);
    } finally {
      setSavedLoading(false);
    }
  }

  /**
   * Expand/collapse order details:
   * - If already expanded, collapse
   * - Else fetch from /api/orders/get and expand
   */
  async function handleGetOrderDetails(orderCode: string) {
    if (expandedOrderCode === orderCode) {
      // collapse
      setExpandedOrderCode(null);
      setExpandedOrderDetails(null);
      return;
    }

    try {
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
      setExpandedOrderCode(orderCode);
      setExpandedOrderDetails(orderDetails);
    } catch (error: any) {
      console.error("Error getting order details:", error);
      alert("Error getting details: " + error.message);
    }
  }

  /**
   * Initiate a soft-delete with a 5-second undo window.
   */
  function initiateDeleteOrder(orderId: number, orderCode: string) {
    if (pendingDelete === orderId) return;

    const confirmMsg = `Are you sure you want to delete order ${orderCode}? You will have 5 seconds to undo.`;
    if (!window.confirm(confirmMsg)) return;

    setPendingDelete(orderId);

    // Clear any previous timer
    if (deleteTimeoutRef.current) {
      clearTimeout(deleteTimeoutRef.current);
    }
    // Start new timer => 5s => finalize delete
    deleteTimeoutRef.current = setTimeout(() => {
      handleDeleteOrder(orderCode);
      setPendingDelete(null);
    }, 5000);
  }

  /**
   * Undo the pending soft-delete if done within 5 seconds.
   */
  function undoDelete() {
    if (deleteTimeoutRef.current) {
      clearTimeout(deleteTimeoutRef.current);
    }
    setPendingDelete(null);
  }

  /**
   * Actually delete the order by calling /api/orders/delete, then refresh.
   */
  async function handleDeleteOrder(orderCode: string) {
    try {
      const resp = await fetch("/api/orders/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, order_code: orderCode }),
      });

      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.error || "Failed to delete order");
      }

      await resp.json();
      alert(`Order ${orderCode} deleted!`);
      fetchSavedOrders(token);
    } catch (error: any) {
      console.error("Error deleting order:", error);
      alert("Error deleting order: " + error.message);
    }
  }

  /**
   * Handle sorting. If user clicks the same column again, toggle asc/desc.
   */
  function handleSort(column: "code" | "cost" | "date") {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  }

  /**
   * Returns the sorted list of orders.
   */
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
        return sortDirection === "asc" ? costA - costB : costB - costA;
      } else if (sortColumn === "date") {
        // compare date strings
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

  // Final sorted list for rendering
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
            Saved{" "}
            {savedCount > 0 && (
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

        {/* SAVED tab => show table of saved orders */}
        {tab === "saved" && (
          <div>
            {savedLoading && <p>Loading saved orders...</p>}
            {savedError && <p className="text-red-600">Error: {savedError}</p>}

            {!savedLoading && !savedError && savedOrders?.length === 0 && (
              <p>No saved orders yet.</p>
            )}

            {!savedLoading && !savedError && sortedSavedOrders.length > 0 && (
              <div className="overflow-x-auto">
                {/*
                  Use table-fixed so widths come from <th>.
                  We'll show 3 equal columns on mobile, each w-1/3 with px-0,
                  and 4 columns on sm+ screens, each w-1/4 with px-3.
                */}
                <table className="table-fixed w-full border-collapse">
                  <thead className="bg-gray-100 text-gray-700 text-sm">
                    <tr>
                      {/* 1st column: Order # */}
                      <th className="w-1/3 py-2 px-2 text-left sm:w-1/4 sm:px-3">
                        <button
                          className="flex items-center gap-1"
                          onClick={() => handleSort("code")}
                        >
                          Order #
                          {sortColumn === "code" && (
                            <span>{sortDirection === "asc" ? "▲" : "▼"}</span>
                          )}
                        </button>
                      </th>

                      {/* 2nd column: Total Price */}
                      <th className="w-1/3 py-2 px-0 text-left sm:w-1/4 sm:px-3">
                        <button
                          className="flex items-center gap-1"
                          onClick={() => handleSort("cost")}
                        >
                          Total Price
                          {sortColumn === "cost" && (
                            <span>{sortDirection === "asc" ? "▲" : "▼"}</span>
                          )}
                        </button>
                      </th>

                      {/* 3rd column: Start Date */}
                      <th className="w-1/3 py-2 px-0 text-left sm:w-1/4 sm:px-3">
                        <button
                          className="flex items-center gap-1"
                          onClick={() => handleSort("date")}
                        >
                          Start Date
                          {sortColumn === "date" && (
                            <span>{sortDirection === "asc" ? "▲" : "▼"}</span>
                          )}
                        </button>
                      </th>

                      {/*
                        4th column: Actions (hidden on mobile; visible on sm+).
                        We set w-1/4 here so on desktop we have 4 equal columns.
                      */}
                      <th className="hidden sm:table-cell w-1/4 py-2 px-3 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSavedOrders.map((order) => {
                      // Calculate total cost
                      const totalNum = parseFloat(order.subtotal) + parseFloat(order.tax_amount);
                      const totalFormatted = totalNum.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      });

                      const isPendingDelete = pendingDelete === order.id;
                      const isExpanded = expandedOrderCode === order.code;

                      return (
                        <React.Fragment key={order.id}>
                          <tr className="border-b text-sm text-gray-700">
                            {/*
                              1st column: Order #
                              On mobile => w-1/3 px-0
                              On desktop => w-1/4 px-3
                            */}
                            <td className="w-1/3 py-2 px-0 sm:w-1/4 sm:px-3">
                              <span
                                onClick={() => handleGetOrderDetails(order.code)}
                                className={
                                  isExpanded
                                    ? "text-blue-600 font-medium cursor-pointer underline"
                                    : "text-blue-600 font-medium cursor-pointer hover:underline"
                                }
                              >
                                {order.code}
                              </span>
                            </td>

                            {/* 2nd column: Total Price */}
                            <td className="w-1/3 py-2 px-0 sm:w-1/4 sm:px-3">
                              {totalFormatted}
                            </td>

                            {/* 3rd column: Start Date */}
                            <td className="w-1/3 py-2 px-0 sm:w-1/4 sm:px-3">
                              {order.common.selected_date}
                            </td>

                            {/*
                              4th column: Actions (only visible on sm+).
                            */}
                            <td className="hidden sm:table-cell w-1/4 py-2 px-3 text-right">
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

                          {/* Expanded details row + optional divider */}
                          {isExpanded && expandedOrderDetails && (
                            <>
                              <ExpandedOrderRow
                                order={expandedOrderDetails}
                                isPendingDelete={isPendingDelete}
                                undoDelete={undoDelete}
                                onDeleteOrder={(id, code) => initiateDeleteOrder(id, code)}
                              />
                              <tr>
                                {/* Use colSpan=4 to span all columns (including hidden one) */}
                                <td colSpan={4} className="border-b"></td>
                              </tr>
                            </>
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