// app/api/orders/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createCompositeOrder } from "@/server/controllers/orderController";

/**
 * POST /api/orders/create
 * Expects a JSON body matching CreateCompositeOrderPayload.
 * Calls createCompositeOrder(...) from the controller.
 * Returns { message, order_code } if successful.
 *
 * Possible responses:
 * 200 => { message, order_code }
 * 400 => { error: "..." }
 * 500 => { error: "..." }
 */
export async function POST(req: NextRequest) {
  try {
    // 1) Parse the incoming JSON payload
    const payload = await req.json();

    // 2) Optionally validate certain fields
    if (!payload.user_token) {
      return NextResponse.json(
        { error: "user_token is required" },
        { status: 400 }
      );
    }

    // 3) Call the controller function to create the composite order
    const result = await createCompositeOrder(payload);

    // 4) Return the successful response from the external service
    // For example, { "message": "Composite order created successfully.", "order_code": "20250212-1" }
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Error in /api/orders/create:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}