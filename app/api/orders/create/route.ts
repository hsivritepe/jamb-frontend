// app/api/orders/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createCompositeOrder } from "@/server/controllers/orderController";

/**
 * POST /api/orders/create
 * Expects a JSON body matching CreateCompositeOrderPayload.
 * Calls createCompositeOrder(...) from the controller.
 * Returns { message, order_code } if successful.
 */
export async function POST(req: NextRequest) {
  try {
    // Parse the incoming JSON payload
    const payload = await req.json();

    // Optionally, we can validate certain fields
    if (!payload.user_token) {
      return NextResponse.json(
        { error: "user_token is required" },
        { status: 400 }
      );
    }

    // Call the controller function to create the composite order
    const result = await createCompositeOrder(payload);

    // Return the successful response from the external service
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Error in /api/orders/create:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}