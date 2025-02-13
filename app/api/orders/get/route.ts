// app/api/orders/get/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCompositeOrder } from "@/server/controllers/orderController";

/**
 * POST /api/orders/get
 * Expects a JSON body like { token: string, order_code: string }.
 * Calls the external service (getCompositeOrder) to retrieve details
 * for a specific composite order.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = body.token?.trim();
    const orderCode = body.order_code?.trim();

    // Basic validation
    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }
    if (!orderCode) {
      return NextResponse.json({ error: "Order code is required" }, { status: 400 });
    }

    // Call the controller function
    const order = await getCompositeOrder(token, orderCode);

    // Return the single order object
    return NextResponse.json(order, { status: 200 });
  } catch (error: any) {
    console.error("Error in /api/orders/get:", error);
    // You could handle different error messages or statuses if needed
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}