import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  // Placeholder response
  return NextResponse.json({
    status: "ok",
    prediction: "NoModel",
    confidence: 0,
    message: "Placeholder route. No real model is loaded."
  });
}