import { NextRequest, NextResponse } from 'next/server';
import { updateUserAddress } from '@/server/controllers/userController';

/**
 * POST http://dev.thejamb.com/api/user/address
 *
 * This endpoint allows a user to create or update their address details.
 * It requires the user's token and the necessary address fields.
 *
 * Request body:
 * {
 *   "token": "abcd1234",
 *   "country": "USA",
 *   "address": "123 Main St",
 *   "city": "Los Angeles",
 *   "state": "California",
 *   "zipcode": 90210
 * }
 *
 * Possible responses:
 * 200 => { "success": "ok" }
 * 400 => { "error": "Not valid token or request body" }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, country, address, city, state, zipcode } = body || {};

    // Call controller function
    const result = await updateUserAddress(token, country, address, city, state, zipcode);

    // If there's an error, return 400
    if (result?.error === 'Not valid token or request body') {
      return NextResponse.json(
        { error: 'Not valid token or request body' },
        { status: 400 }
      );
    }

    // Otherwise, success
    return NextResponse.json(
      { success: 'ok' },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST /api/user/address error:', error);
    // If there's a parsing error or any other issue => 400
    return NextResponse.json(
      { error: 'Not valid token or request body' },
      { status: 400 }
    );
  }
}