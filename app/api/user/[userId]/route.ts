// app/api/user/[userId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { confirmUser } from '@/server/controllers/userController';

/**
 * POST /api/user/confirm
 * Body:
 * {
 *   "email": "user@example.com",
 *   "code": "123456"
 * }
 *
 * Responses:
 * 200 => { "success": "User activated successfully" }
 * 400 => { "error": "Invalid or expired code" }
 * 404 => { "error": "User not found" }
 */
export async function POST(req: NextRequest) {
  try {
    // 1) Parse request body
    const body = await req.json();

    if (!body || !body.email || !body.code) {
      // Missing parameters => can also return 400
      return NextResponse.json(
        { error: 'Invalid or expired code' },
        { status: 400 }
      );
    }

    const { email, code } = body;

    // 2) Attempt to confirm user
    const result = await confirmUser(email, code);

    if (result?.error === 'User not found') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (result?.error === 'Invalid or expired code') {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    // 3) If everything is ok
    return NextResponse.json(
      { success: 'User activated successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('POST /api/user/confirm error:', error);
    return NextResponse.json(
      { error: 'Invalid or expired code' },
      { status: 400 }
    );
  }
}