import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/server/controllers/userController';

/**
 * POST https://dev.thejamb.com/user/create
 *
 * Request body:
 * {
 *   "email": "1234567@gmail.com",
 *   "phone": 16048906786,
 *   "password": "volvoxc90"
 * }
 *
 * Possible responses:
 * 200 => { "status": "ok" }
 *
 * 400 => 
 * {
 *   "type": "https://tools.ietf.org/html/rfc2616#section-10",
 *   "title": "An error occurred",
 *   "status": 400,
 *   "detail": "Request body is empty.",
 *   "class": "Symfony\\Component\\HttpKernel\\Exception\\BadRequestHttpException"
 *   // or
 *   "error": "User already created"
 * }
 *
 * Description:
 * Creates a new user with the provided email, phone, and password.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, phone, password } = body || {};

    // 1) Call the controller logic
    const result = await createUser(email, phone, password);

    // 2) If the controller returned an error
    if (result?.error) {
      // If it's because of empty body (missing fields)
      if (result.error === 'empty-body') {
        return NextResponse.json(
          {
            type: 'https://tools.ietf.org/html/rfc2616#section-10',
            title: 'An error occurred',
            status: 400,
            detail: 'Request body is empty.',
            class: 'Symfony\\Component\\HttpKernel\\Exception\\BadRequestHttpException',
            trace: [
              // Optionally, you can mimic the trace object from your example
              // Or omit it for simplicity
            ],
          },
          { status: 400 }
        );
      }

      // If it's because user is already created or any other error
      return NextResponse.json(
        {
          error: result.error, // e.g. "User already created"
        },
        { status: 400 }
      );
    }

    // 3) If success => return 200
    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error) {
    console.error('POST /user/create error:', error);
    // If there's a parsing error or something else => 400
    return NextResponse.json(
      {
        type: 'https://tools.ietf.org/html/rfc2616#section-10',
        title: 'An error occurred',
        status: 400,
        detail: 'Request body is empty.',
        class: 'Symfony\\Component\\HttpKernel\\Exception\\BadRequestHttpException',
        trace: [],
      },
      { status: 400 }
    );
  }
}