import { NextRequest, NextResponse } from 'next/server';
import { confirmUser } from '@/server/controllers/userController';

/**
 * POST /api/user/confirm
 *
 * Body:
 * {
 *   "email": "user@example.com",
 *   "code": "123456"
 * }
 *
 * Possible responses:
 * 200 => { "success": "User activated successfully" }
 * 400 => { "error": "Invalid or expired code" }
 * 404 => { "error": "User not found" }
 */
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { email, code } = body || {};

    if (!email || !code) {
      // Missing parameters => 400
      return NextResponse.json(
        { error: 'Invalid or missing parameters' },
        { status: 400 }
      );
    }

    // Call the confirmUser logic
    // Returns { success: boolean; error?: string }
    const result = await confirmUser(email, code);

    // If success === true => user activated
    if (result.success) {
      return NextResponse.json(
        { success: 'User activated successfully' },
        { status: 200 }
      );
    }

    // Otherwise, we have an error
    switch (result.error) {
      case 'User not found':
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      case 'Invalid or expired code':
        return NextResponse.json(
          { error: 'Invalid or expired code' },
          { status: 400 }
        );
      default:
        return NextResponse.json(
          { error: 'Invalid or expired code' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('POST /api/user/confirm error:', error);
    // If there's a parsing error or unexpected issue => 400
    return NextResponse.json(
      { error: 'Invalid or expired code' },
      { status: 400 }
    );
  }
}