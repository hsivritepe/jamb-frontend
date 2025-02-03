import { NextRequest, NextResponse } from 'next/server';
import { deleteUserAccount } from '@/server/controllers/userController';

/**
 * PATCH /api/user/delete
 * 
 * Request body:
 * {
 *   "token": "user-token-123"
 * }
 *
 * Responses:
 * 200 => { "success": "User has been deleted" }
 * 400 => { "error": "Token is required" }
 * 404 => { "error": "User not found" }
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body || {};

    const result = await deleteUserAccount(token);

    if (result?.error === "Token is required") {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }
    if (result?.error === "User not found") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If no errors => success
    return NextResponse.json({ success: "User has been deleted" }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/user/delete error:", error);
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }
}