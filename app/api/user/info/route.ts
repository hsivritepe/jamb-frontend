import { NextRequest, NextResponse } from 'next/server';
import { getUserInfo } from '@/server/controllers/userController';

/**
 * POST /api/user/info
 *
 * Request body:
 * {
 *   "token": "valid-user-token"
 * }
 *
 * Responses:
 * 200 => user info object
 * 400 => { "error": "Bad request" }
 * 401 => { "error": "Unauthorized" }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body || {};

    // Call the controller
    const result = await getUserInfo(token);

    if (result?.error === 'Bad request') {
      return NextResponse.json({ error: 'Bad request' }, { status: 400 });
    }
    if (result?.error === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Otherwise, no error => return user data
    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error('POST /api/user/info error:', error);
    // If there's a parsing error or something else => 400
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}