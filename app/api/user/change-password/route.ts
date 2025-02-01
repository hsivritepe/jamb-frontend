import { NextRequest, NextResponse } from 'next/server';
import { changePassword } from '@/server/controllers/userController';

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
 * Description: Changes the user's password using the provided code.
 */
export async function POST(req: NextRequest) {
  try {
    // 1) Parse the request body
    const body = await req.json();

    const { email, code, password } = body || {};

    // 2) Validate request body
    if (!email || !code || !password) {
      return NextResponse.json(
        { error: 'Bad request' },
        { status: 400 }
      );
    }

    // 3) Call the function that handles password change
    const result = await changePassword(email, code, password);

    // Suppose `changePassword` returns:
    // { success: true } or
    // { error: 'User not found' } or 
    // { error: 'Invalid code' } etc.

    if (result?.success) {
      // Password changed => 200
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
          { status: 401 }
        );
      default:
        // Any other error => 400
        return NextResponse.json(
          { error: 'Bad request' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('POST /api/user/change-password error:', error);
    // If there's a parsing error or anything unexpected => 400
    return NextResponse.json(
      { error: 'Bad request' },
      { status: 400 }
    );
  }
}