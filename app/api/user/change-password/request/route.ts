import { NextRequest, NextResponse } from 'next/server';
import { requestChangePassword } from '@/server/controllers/userController';

/**
 * POST /api/user/change-password/request
 *
 * Request body:
 * {
 *   "email": "user@example.com"
 * }
 *
 * Possible responses:
 * 200 => { "success": "ok" }
 * 400 => { "error": "Bad request" }
 * 404 => { "error": "User not found" }
 * 500 => { "error": "Error while sending email code" }
 *
 * Description:
 * Requests a password reset code for the given user email.
 */
export async function POST(req: NextRequest) {
  try {
    // 1) Parse the request body
    const body = await req.json();

    // 2) Check if the request body contains an email
    if (!body?.email) {
      return NextResponse.json({ error: 'Bad request' }, { status: 400 });
    }

    const { email } = body;

    // 3) Call the logic for sending the password change code
    const result = await requestChangePassword(email);

    // If the controller returned success => 200
    if (result?.success) {
      return NextResponse.json({ success: 'ok' }, { status: 200 });
    }

    // Otherwise, handle possible errors
    switch (result?.error) {
      case 'User not found':
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      case 'Error while sending email code':
        return NextResponse.json(
          { error: 'Error while sending email code' },
          { status: 500 }
        );
      default:
        // Any other error => 400
        return NextResponse.json({ error: 'Bad request' }, { status: 400 });
    }
  } catch (error) {
    console.error('POST /api/user/change-password/request error:', error);
    // If there's a parsing error or any other unforeseen issue => 400
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}