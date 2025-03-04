"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ExpandedOrderRow from "./ExpandedOrderRow";
import { Printer, Trash2 } from "lucide-react";
import { parse, differenceInCalendarDays } from "date-fns";

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

export default function OrdersPage() {
  const router = useRouter();

  const [greetingText, setGreetingText] = useState("");
  const [token, setToken] = useState("");
  const [userName, setUserName] = useState("");
  const [hasName, setHasName] = useState(false);

  const [tab, setTab] = useState<"saved" | "active" | "past">("saved");
  const [savedOrders, setSavedOrders] = useState<CompositeOrder[] | null>(null);
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedError, setSavedError] = useState<string | null>(null);

  const [sortColumn, setSortColumn] = useState<"code" | "cost" | "date" | null>(
    null
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);
  const deleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [expandedOrderCode, setExpandedOrderCode] = useState<string | null>(
    null
  );
  const [expandedOrderDetails, setExpandedOrderDetails] =
    useState<CompositeOrder | null>(null);

  useEffect(() => {
    setGreetingText(getGreeting());
  }, []);

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
      } catch {}
    }
  }, [router]);

  useEffect(() => {
    if (tab === "saved" && token) {
      const cached = sessionStorage.getItem("savedOrders");
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as CompositeOrder[];
          const withDiffs = attachDaysDiff(parsed);
          setSavedOrders(withDiffs);
        } catch {}
      }
      fetchSavedOrders(token);
    }
  }, [tab, token]);

  function attachDaysDiff(orders: CompositeOrder[]): CompositeOrder[] {
    const now = new Date();
    return orders.map((o) => {
      if (!o.common.selected_date) {
        return { ...o, daysDiff: null };
      }
      try {
        const parsedDate = parse(o.common.selected_date, "EEE, d MMM yyyy", now);
        const diff = differenceInCalendarDays(parsedDate, now);
        return { ...o, daysDiff: diff };
      } catch {
        return { ...o, daysDiff: null };
      }
    });
  }

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
      const withDiffs = attachDaysDiff(data);
      setSavedOrders(withDiffs);
      sessionStorage.setItem("savedOrders", JSON.stringify(data));
    } catch (error: any) {
      setSavedError(error.message);
    } finally {
      setSavedLoading(false);
    }
  }

  /** Allows child to refresh the list. */
  function handleRefreshOrders() {
    if (token) fetchSavedOrders(token);
  }

  /** Allows child to close the expanded row. */
  function handleCloseExpanded() {
    setExpandedOrderCode(null);
    setExpandedOrderDetails(null);
  }

  async function handleGetOrderDetails(orderCode: string) {
    if (expandedOrderCode === orderCode) {
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
      const orderDetails: CompositeOrder = await resp.json();
      if (orderDetails.common.selected_date) {
        try {
          const parsedDate = parse(
            orderDetails.common.selected_date,
            "EEE, d MMM yyyy",
            new Date()
          );
          orderDetails.daysDiff = differenceInCalendarDays(
            parsedDate,
            new Date()
          );
        } catch {
          orderDetails.daysDiff = null;
        }
      }
      setExpandedOrderCode(orderCode);
      setExpandedOrderDetails(orderDetails);
    } catch (error: any) {
      alert("Error getting details: " + error.message);
    }
  }

  function initiateDeleteOrder(orderId: number, orderCode: string) {
    if (pendingDelete === orderId) return;
    const confirmMsg = `Are you sure you want to delete order ${orderCode}? You will have 5 seconds to undo.`;
    if (!window.confirm(confirmMsg)) return;
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
      await fetchSavedOrders(token);
    } catch (error: any) {
      alert("Error deleting order: " + error.message);
    }
  }

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
        const costA = parseFloat(a.total);
        const costB = parseFloat(b.total);
        return sortDirection === "asc" ? costA - costB : costB - costA;
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

  function renderDateCell(order: CompositeOrder) {
    if (!order.common.selected_date) return "No date";
    if (order.daysDiff == null) return order.common.selected_date;

    if (order.daysDiff < 0) {
      return <span className="text-red-600">Date expired</span>;
    }
    if (order.daysDiff === 0) {
      return <span className="text-red-600">Expires today</span>;
    }
    if (order.daysDiff === 1) {
      return <span className="text-red-600">Expires in 1 day</span>;
    }
    if (order.daysDiff === 2) {
      return <span className="text-red-600">Expires in 2 days</span>;
    }
    return order.common.selected_date;
  }

  const sortedSavedOrders = getSortedOrders();
  const savedCount = savedOrders ? savedOrders.length : 0;

  return (
    <div className="pt-24 min-h-screen w-full bg-gray-50 pb-10">
      <div className="max-w-7xl mx-auto px-0 sm:px-4">
        <h1 className="text-2xl sm:text-3xl font-bold mt-6 mb-2">
          {greetingText}, {hasName ? userName : "Guest"}!
        </h1>

        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-8">
            <Link href="/profile" className="text-gray-600 hover:text-blue-600">
              Profile
            </Link>
            <Link
              href="/dashboard"
              className="text-blue-600 border-b-2 border-blue-600"
            >
              Orders
            </Link>
            <Link
              href="/profile/messages"
              className="text-gray-600 hover:text-blue-600"
            >
              Messages
            </Link>
            <Link
              href="/profile/settings"
              className="text-gray-600 hover:text-blue-600"
            >
              Settings
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6 text-sm font-medium">
          <button
            onClick={() => setTab("saved")}
            className={`px-3 py-2 rounded font-semibold ${
              tab === "saved"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-100"
            }`}
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
            className={`px-3 py-2 rounded font-semibold ${
              tab === "active"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setTab("past")}
            className={`px-3 py-2 rounded font-semibold ${
              tab === "past"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Past
          </button>
        </div>

        {tab === "active" && <p className="text-gray-700">No active orders yet.</p>}
        {tab === "past" && <p className="text-gray-700">No past orders yet.</p>}

        {tab === "saved" && (
          <div>
            {savedLoading && <p>Loading saved orders...</p>}
            {savedError && <p className="text-red-600">Error: {savedError}</p>}
            {!savedLoading && !savedError && savedOrders?.length === 0 && (
              <p>No saved orders yet.</p>
            )}
            {!savedLoading && !savedError && sortedSavedOrders.length > 0 && (
              <div className="overflow-x-auto">
                <table className="table-fixed w-full border-collapse">
                  <thead className="bg-gray-100 text-gray-700 text-sm">
                    <tr>
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
                      <th className="hidden sm:table-cell w-1/4 py-2 px-3 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSavedOrders.map((order) => {
                      const totalNum = parseFloat(order.total);
                      const totalFormatted = totalNum.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      });
                      const isPendingDelete = pendingDelete === order.id;
                      const isExpanded = expandedOrderCode === order.code;

                      return (
                        <React.Fragment key={order.id}>
                          <tr className="border-b text-sm text-gray-700">
                            <td className="w-1/3 py-2 px-2 sm:w-1/4 sm:px-3">
                              <span
                                onClick={() => handleGetOrderDetails(order.code)}
                                className={
                                  isExpanded
                                    ? "text-red-600 font-semibold cursor-pointer underline"
                                    : "text-blue-600 font-semibold cursor-pointer hover:underline"
                                }
                              >
                                {order.code}
                              </span>
                            </td>
                            <td className="w-1/3 py-2 px-0 sm:w-1/4 sm:px-3">
                              {totalFormatted}
                            </td>
                            <td className="w-1/3 py-2 px-0 sm:w-1/4 sm:px-3">
                              {renderDateCell(order)}
                            </td>
                            <td className="hidden sm:table-cell w-1/4 py-2 px-3 text-right">
                              <button
                                onClick={() =>
                                  router.push(`/dashboard/print/${order.code}`)
                                }
                                className="text-gray-500 hover:text-blue-600 mr-3"
                                title="Print order"
                              >
                                <Printer size={16} />
                              </button>
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
                                  onClick={() =>
                                    initiateDeleteOrder(order.id, order.code)
                                  }
                                  className="text-gray-500 hover:text-red-600"
                                  title="Delete order"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </td>
                          </tr>

                          {/* ВАЖНО: теперь сам <tr className="bg-gray-100"> объявлен здесь */}
                          {isExpanded && expandedOrderDetails && (
                            <tr className="bg-gray-100">
                              <td colSpan={4} className="p-0">
                                <ExpandedOrderRow
                                  order={expandedOrderDetails}
                                  isPendingDelete={isPendingDelete}
                                  undoDelete={undoDelete}
                                  onDeleteOrder={(id, code) =>
                                    initiateDeleteOrder(id, code)
                                  }
                                  token={token}
                                  onRefreshOrders={handleRefreshOrders}
                                  // callback to close
                                  onCloseExpanded={handleCloseExpanded}
                                />
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