"use client";

export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/**
 * Defines the structure of each CompositeOrder for client usage.
 * This matches the structure in orderController.ts
 */
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

/**
 * OrdersPage:
 * Renders a page with three tabs (Active, Saved, Past).
 * When the user selects "Saved", it sends a POST request to /api/orders/list
 * with the user's auth token to fetch saved orders.
 */
export default function OrdersPage() {
  const router = useRouter();

  // We store the token and user name for personalization
  const [token, setToken] = useState("");
  const [userName, setUserName] = useState("");
  const [hasName, setHasName] = useState(false);

  // Tab state: "active", "saved", or "past"
  const [tab, setTab] = useState<"active" | "saved" | "past">("active");

  // State to handle saved orders
  const [savedOrders, setSavedOrders] = useState<CompositeOrder[] | null>(null);
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedError, setSavedError] = useState<string | null>(null);

  // On mount, check for authToken. If it doesn't exist, redirect to login.
  // Also, attempt to retrieve profileData to greet the user by name.
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

  // When the user switches to the "saved" tab (and we have a token), fetch the saved orders.
  useEffect(() => {
    if (tab === "saved" && token) {
      fetchSavedOrders(token);
    }
  }, [tab, token]);

  // Fetch saved orders from /api/orders/list
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
      setSavedOrders(data); // data should be an array of CompositeOrder
    } catch (error: any) {
      console.error("Error fetching saved orders:", error);
      setSavedError(error.message);
    } finally {
      setSavedLoading(false);
    }
  }

  /**
   * handleGetOrderDetails:
   * Example placeholder function to request /api/orders/get
   * passing token + order_code. You can implement it according to your needs.
   */
  async function handleGetOrderDetails(orderCode: string) {
    try {
      console.log("Fetching details for order code:", orderCode);

      // Example:
      const resp = await fetch("/api/orders/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          order_code: orderCode,
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.error || "Failed to fetch order details");
      }

      const orderDetails = await resp.json();
      console.log("Received order details:", orderDetails);

      // You can navigate to a details page or open a modal, etc.
      // For instance:
      // router.push(`/orders/${orderCode}/details`);

    } catch (error: any) {
      console.error("Error getting order details:", error);
      alert("Error getting details: " + error.message);
    }
  }

  /**
   * handleDeleteOrder:
   * Example placeholder to request /api/orders/delete
   * passing token + order_code. Then you can refresh the list or show a message.
   */
  async function handleDeleteOrder(orderCode: string) {
    try {
      console.log("Deleting order code:", orderCode);

      const resp = await fetch("/api/orders/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          order_code: orderCode,
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.error || "Failed to delete order");
      }

      const result = await resp.json();
      console.log("Delete result:", result);
      alert(`Order ${orderCode} deleted!`);

      // Refresh the list after deletion
      fetchSavedOrders(token);
    } catch (error: any) {
      console.error("Error deleting order:", error);
      alert("Error deleting order: " + error.message);
    }
  }

  const greetingText = getGreeting();

  return (
    <div className="pt-24 min-h-screen w-full bg-gray-50 pb-10">
      <div className="max-w-7xl mx-auto px-0 sm:px-4">
        {/* Greeting heading */}
        <h1 className="text-2xl sm:text-3xl font-bold mt-6 mb-2">
          {greetingText}, {hasName ? userName : "Guest"}!
        </h1>

        {/* Navigation row - example links */}
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

        {/* Tabs: active, saved, past */}
        <div className="flex items-center gap-4 mb-6 text-sm font-medium">
          <button
            onClick={() => setTab("active")}
            className={`px-3 py-2 rounded 
              ${tab === "active" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"}`}
          >
            Active
          </button>
          <button
            onClick={() => setTab("saved")}
            className={`px-3 py-2 rounded 
              ${tab === "saved" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"}`}
          >
            Saved
          </button>
          <button
            onClick={() => setTab("past")}
            className={`px-3 py-2 rounded 
              ${tab === "past" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"}`}
          >
            Past
          </button>
        </div>

        {/* ACTIVE tab content */}
        {tab === "active" && (
          <div>
            <p className="text-gray-700">No active orders yet.</p>
          </div>
        )}

        {/* SAVED tab content */}
        {tab === "saved" && (
          <div>
            {savedLoading && <p>Loading saved orders...</p>}
            {savedError && (
              <p className="text-red-600">Error: {savedError}</p>
            )}
            {!savedLoading && !savedError && savedOrders?.length === 0 && (
              <p>No saved orders yet.</p>
            )}
            {!savedLoading && !savedError && savedOrders && savedOrders.length > 0 && (
              <div className="divide-y divide-gray-200">
                {savedOrders.map((order) => {
                  // Calculate sum of subtotal + tax_amount
                  const totalAmount = (
                    parseFloat(order.subtotal) + parseFloat(order.tax_amount)
                  ).toFixed(2);

                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between py-3"
                    >
                      {/* Left side: code, total, date */}
                      <div className="text-sm text-gray-700">
                        <span className="font-semibold text-gray-800">
                          {order.code}
                        </span>{" "}
                        | ${totalAmount} | {order.common.selected_date}
                      </div>

                      {/* Right side: two buttons (Details, Delete) */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleGetOrderDetails(order.code)}
                          className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.code)}
                          className="bg-red-600 text-white px-3 py-1 text-sm rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PAST tab content */}
        {tab === "past" && (
          <div>
            <p className="text-gray-700">No past orders yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}