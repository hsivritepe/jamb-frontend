import { NextRequest, NextResponse } from 'next/server';
import { requestChangePassword } from '@/server/controllers/userController';

/**
 * POST /api/user/change-password/request
 *
 * Body:
 * {
 *   "email": "user@example.com"
 * }
 *
 * Possible responses:
 * 200 => { "success": "ok" }
 * 400 => { "error": "Bad request" }
 * 404 => { "error": "User not found" }
 * 500 => { "error": "Error while sending email code" }
 */
export async function POST(req: NextRequest) {
  try {
    // 1) Parse the request body
    const body = await req.json();

    // Check if the request body contains an email
    if (!body?.email) {
      return NextResponse.json(
        { error: 'Bad request' },
        { status: 400 }
      );
    }

    const { email } = body;

    // 2) Call the logic for sending the password change code
    const result = await requestChangePassword(email);

    if (result?.success) {
      // Successful operation => 200
      return NextResponse.json(
        { success: 'ok' },
        { status: 200 }
      );
    }

    // Handle possible errors
    switch (result?.error) {
      case 'User not found':
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      case 'Error while sending email code':
        return NextResponse.json(
          { error: 'Error while sending email code' },
          { status: 500 }
        );
      default:
        // Any other error => 400
        return NextResponse.json(
          { error: 'Bad request' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('POST /api/user/change-password/request error:', error);
    // If there's a parsing error or any other unforeseen error => 400
    return NextResponse.json(
      { error: 'Bad request' },
      { status: 400 }
    );
  }
}