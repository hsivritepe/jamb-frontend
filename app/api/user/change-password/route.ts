import { NextRequest, NextResponse } from "next/server";
import { changePassword } from "@/server/controllers/userController";

/**
 * POST /api/user/change-password
 *
 * Request Body:
 * {
 *   "email": "user@example.com",
 *   "code": "123456",
 *   "password": "NewPassword123"
 * }
 *
 * Possible responses:
 * 200 => { "success": "ok" }
 * 400 => { "error": "Bad request" }
 * 401 => { "error": "User not found" }
 *
 * Description: Changes the user's password using the provided code,
 * by calling changePassword from userController, which calls the external API.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code, password } = body || {};

    // Validate
    if (!email || !code || !password) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    const result = await changePassword(email, code, password);

    if (result?.success) {
      // 200 => password changed
      return NextResponse.json({ success: "ok" }, { status: 200 });
    }

    // Handle possible errors
    switch (result?.error) {
      case "User not found":
        return NextResponse.json({ error: "User not found" }, { status: 401 });
      case "Invalid code":
        return NextResponse.json({ error: "Invalid code" }, { status: 400 });
      default:
        return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }
  } catch (error) {
    console.error("POST /api/user/change-password error:", error);
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}