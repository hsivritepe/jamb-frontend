import { NextRequest, NextResponse } from 'next/server';
import { resendActivationCode } from '@/server/controllers/userController';

/**
 * POST http://dev.thejamb.com/api/user/resend-activation
 *
 * This endpoint allows a user to request a resend of the activation code.
 * It requires the user's email and checks if the user exists and is not yet confirmed.
 *
 * Request body:
 * {
 *   "email": "user@example.com"
 * }
 *
 * Possible responses:
 * 200 => { "success": "Activation code resent" }
 * 400 => { "error": "Email is required" } or { "error": "Email already confirmed" }
 * 404 => { "error": "User not found" }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body || {};

    // Call the controller logic
    const result = await resendActivationCode(email);

    // Handle errors
    if (result?.error === 'Email is required') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    if (result?.error === 'User not found') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    if (result?.error === 'Email already confirmed') {
      return NextResponse.json({ error: 'Email already confirmed' }, { status: 400 });
    }
    if (result?.error === 'Error while sending activation code') {
      // If you want a different status code for email-sending errors,
      // you could return 500 or 400. Let's assume 500 for this example.
      return NextResponse.json({ error: 'Error while sending activation code' }, { status: 500 });
    }

    // If success:
    if (result?.success) {
      return NextResponse.json({ success: 'Activation code resent' }, { status: 200 });
    }

    // Otherwise, default fallback => 400
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  } catch (error) {
    console.error('POST /api/user/resend-activation error:', error);
    // If there's a parsing error or unexpected issue => 400
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }
}