import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/server/controllers/userController';

/**
 * POST /api/user/auth/credentials
 * Body:
 * {
 *   "email": "user@example.com",
 *   "password": "SuperSecurePassword"
 * }
 *
 * Responses:
 * 200 => { "token": "your_token_here" }
 * 400 => { "error": "Error while auth. Bad Request." }
 * 401 => { "error": "Incorrect email or password" }
 */
export async function POST(req: NextRequest) {
  try {
    // 1) Parse request body
    const body = await req.json();

    if (!body || !body.email || !body.password) {
      // Missing parameters => return 400
      return NextResponse.json(
        { error: 'Error while auth. Bad Request.' },
        { status: 400 }
      );
    }

    const { email, password } = body;

    // 2) Call authenticate logic
    const result = await authenticateUser(email, password);

    if (result?.error === 'Incorrect credentials') {
      // Wrong email/password => 401
      return NextResponse.json(
        { error: 'Incorrect email or password' },
        { status: 401 }
      );
    }

    if (result?.error) {
      // Some other error => 400
      return NextResponse.json(
        { error: 'Error while auth. Bad Request.' },
        { status: 400 }
      );
    }

    // 3) If successful => return token
    return NextResponse.json(
      { token: result.token || 'dummy_token_value' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('POST /api/user/auth/credentials error:', error);
    return NextResponse.json(
      { error: 'Error while auth. Bad Request.' },
      { status: 400 }
    );
  }
}