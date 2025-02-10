import { NextRequest, NextResponse } from 'next/server';
import { authenticateWithToken } from '@/server/controllers/userController';

/**
 * POST https://dev.thejamb.com/api/user/auth/token
 *
 * This endpoint allows a user to authenticate using a token. Optionally, it can
 * return the user profile if the "with_profile" flag is set to true in the request body.
 *
 * Request body:
 * {
 *   "token": "valid-user-token",
 *   "with_profile": true (optional)
 * }
 *
 * Possible responses:
 * 200 => {
 *   "success": "ok",
 *   // If with_profile = true, also includes
 *   "name": "John",
 *   "surname": "Doe",
 *   "firstLang": "English",
 *   "secondLang": "Spanish"
 * }
 * 400 => { "error": "Error while auth. Bad Request." }
 * 401 => { "error": "Unauthorized" }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, with_profile } = body || {};

    // Call the controller
    const result = await authenticateWithToken(token, with_profile);

    // Handle errors
    if (result?.error === 'Error while auth. Bad Request.') {
      return NextResponse.json({ error: 'Error while auth. Bad Request.' }, { status: 400 });
    }
    if (result?.error === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Otherwise, result should contain { success: 'ok' } (plus optional profile fields)
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('POST /api/user/auth/token error:', error);
    // If there's a parsing error or any unexpected issue, treat it as a bad request
    return NextResponse.json({ error: 'Error while auth. Bad Request.' }, { status: 400 });
  }
}