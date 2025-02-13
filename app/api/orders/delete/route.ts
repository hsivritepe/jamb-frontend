// app/api/orders/delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { deleteCompositeOrder } from "@/server/controllers/orderController";

/**
 * POST /api/orders/delete
 * Expects a JSON body like { token: string, order_code: string }.
 * Calls deleteCompositeOrder(...) from the controller.
 * Returns { status: "Order deleted" } if successful.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = body.token?.trim();
    const orderCode = body.order_code?.trim();

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }
    if (!orderCode) {
      return NextResponse.json(
        { error: "Order code is required" },
        { status: 400 }
      );
    }

    // Perform the delete operation
    const result = await deleteCompositeOrder(token, orderCode);

    // Return the response from the external service
    // For example: { status: "Order deleted" }
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Error in /api/orders/delete:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}