import { NextRequest, NextResponse } from 'next/server';
import { updateUserProfile } from '@/server/controllers/userController';

/**
 * PATCH /api/user/profile
 *
 * Request body:
 * {
 *   "token": "valid-user-token",
 *   "name": "John",
 *   "surname": "Doe",
 *   "firstLang": "English",
 *   "secondLang": "Spanish",
 *   "sendingAgreed": true
 * }
 *
 * Responses:
 * 200 => { "success": "ok" }
 * 400 => { "error": "Bad request" }
 * 401 => { "error": "Invalid token" }
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      token,
      name,
      surname,
      firstLang,
      secondLang,
      sendingAgreed,
    } = body || {};

    // Call your controller method
    const result = await updateUserProfile(
      token,
      name,
      surname,
      firstLang,
      secondLang,
      sendingAgreed
    );

    if (result?.error === "Bad request") {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }
    if (result?.error === "Invalid token") {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // If success => 200
    return NextResponse.json({ success: "ok" }, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/user/profile error:", err);
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}