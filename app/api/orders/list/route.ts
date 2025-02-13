import { NextRequest, NextResponse } from "next/server";
import { listSavedOrders } from "@/server/controllers/orderController";

/**
 * POST /api/orders/list
 * Expects a JSON body with { token: string }.
 * Calls the external service (listSavedOrders) to retrieve saved orders
 * and returns them as JSON.
 */
export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const token = body.token?.trim();

    // If no token is provided, return a 400 error
    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    // Call our controller function to get the orders
    const orders = await listSavedOrders(token);

    // Return orders as JSON (status 200)
    return NextResponse.json(orders, { status: 200 });
  } catch (error: any) {
    // If there's an error, log it and return a 500 (or another appropriate status code)
    console.error("Error in /api/orders/list:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}