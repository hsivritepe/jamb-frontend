import { NextRequest, NextResponse } from 'next/server';
import { updateUserCard } from '@/server/controllers/userController';

/**
 * POST http://dev.thejamb.com/api/user/card
 *
 * This endpoint allows a user to create or update their card details.
 * It requires the user's token and the necessary card fields.
 *
 * Request body:
 * {
 *   "token": "your-token-here",
 *   "number": "1234567812345678",
 *   "surname": "Doe",
 *   "name": "John",
 *   "expiredTo": "12/25",
 *   "cvv": "123",
 *   "zipcode": "90210"
 * }
 *
 * Possible responses:
 * 200 => { "success": "ok" }
 * 400 => { "error": "Not valid token or request body" }
 */
export async function POST(req: NextRequest) {
  try {
    // 1) Parse the JSON body
    const body = await req.json();
    const { token, number, surname, name, expiredTo, cvv, zipcode } = body || {};

    // 2) Call the controller
    const result = await updateUserCard(token, number, surname, name, expiredTo, cvv, zipcode);

    // 3) Handle errors
    if (result?.error === 'Not valid token or request body') {
      return NextResponse.json(
        { error: 'Not valid token or request body' },
        { status: 400 }
      );
    }

    // 4) If success
    return NextResponse.json({ success: 'ok' }, { status: 200 });
  } catch (error) {
    console.error('POST /api/user/card error:', error);
    // On any unexpected error or JSON parse failure => 400
    return NextResponse.json(
      { error: 'Not valid token or request body' },
      { status: 400 }
    );
  }
}