import { NextRequest, NextResponse } from "next/server";
import { updateCompositeOrder } from "@/server/controllers/orderController";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Here we assume 'body' matches the structure of UpdateCompositeOrderPayload
    // You could add more validation logic if needed.
    const result = await updateCompositeOrder(body);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    // In case of errors, capture the message and respond accordingly
    const message = error?.message || "Unknown error";
    // You can fine-tune the status code based on the error content.
    return NextResponse.json({ error: message }, { status: 400 });
  }
}