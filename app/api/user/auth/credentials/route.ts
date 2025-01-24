import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db'; 
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

/* ====================== */
/* ===== CONTROLLER ===== */
/* ====================== */

/**
 * Create a new user in the database.
 * 
 * 1) Checks if the user already exists by email.
 * 2) Hashes the password.
 * 3) Saves the user in the database.
 * 
 * @param email User's email address
 * @param phone User's phone number
 * @param password Plain-text password to be hashed and stored
 * @returns { success: true } if created successfully, or an error object
 */
export async function createUser(email: string, phone: string, password: string) {
  // 1) Check if user already exists
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { error: 'User already exists' };
  }

  // 2) Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3) Save user in the database
  await db.user.create({
    data: {
      email,
      phone,
      passwordHash: hashedPassword,
      // ...other fields if needed
    },
  });

  return { success: true };
}

/**
 * Authenticate a user with email and password.
 * 
 * 1) Finds the user by email.
 * 2) Compares the provided password with the stored hash.
 * 3) Generates and returns a token if credentials are valid.
 * 
 * @param email User's email address
 * @param password User's plain-text password
 * @returns { token: string } if authenticated, or { error: 'Incorrect credentials' } otherwise
 */
export async function authenticateUser(email: string, password: string) {
  // 1) Find user by email
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return { error: 'Incorrect credentials' };
  }

  // 2) Compare password
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return { error: 'Incorrect credentials' };
  }

  // 3) Generate token (dummy example - replace with real JWT or session)
  const token = `token-${Date.now()}-${user.id}`;
  return { token };
}

/**
 * Confirm user registration using an activation code.
 * 
 * 1) Finds the user by email.
 * 2) Checks if the provided code matches the user's activationCode field.
 * 3) Marks the user as activated if valid.
 * 
 * @param email User's email address
 * @param code Activation code
 * @returns { success: true } if activated, or an error object otherwise
 */
export async function confirmUser(email: string, code: string) {
  // 1) Find user by email
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return { error: 'User not found' };
  }

  // 2) Check if the code matches
  if (!user.activationCode || user.activationCode !== code) {
    return { error: 'Invalid or expired code' };
  }

  // 3) Mark user as activated
  await db.user.update({
    where: { email },
    data: {
      isActive: true,
      activationCode: null,
      // ...other fields if needed
    },
  });

  return { success: true };
}

/**
 * Request password change:
 * 
 * 1) Finds the user by email.
 * 2) If not found => returns { error: 'User not found' }.
 * 3) Generates a reset token and expiry time.
 * 4) Stores them in the database.
 * 5) (Optionally) Sends an email to the user with the reset token/link.
 * 
 * @param email User's email address
 * @returns { success: true } if the token was generated and saved, or an error object otherwise
 */
export async function requestChangePassword(email: string) {
  // 1) Check if the user exists
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return { error: 'User not found' };
  }

  // 2) Generate a random token
  const resetToken = randomBytes(32).toString('hex');

  try {
    // 3) Save the token and expiry time in the database (e.g., 1 hour from now)
    await db.user.update({
      where: { email },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    // 4) In a real setup, you would send an email containing `resetToken` or a reset link
    // If sending fails => throw an error or return { error: 'Error while sending email code' }

    return { success: true };
  } catch (err) {
    console.error('Error while requesting password change:', err);
    return { error: 'Error while sending email code' };
  }
}

/**
 * Change the user's password with a valid reset code.
 * 
 * 1) Finds the user by email.
 * 2) Verifies the reset code (token) against the stored value.
 * 3) Checks if the code is expired.
 * 4) Hashes and updates the password in the database, clearing the reset token.
 * 
 * @param email User's email address
 * @param code The reset code/token stored in the database
 * @param newPassword The new plain-text password
 * @returns { success: true } if password is changed, or an error object otherwise
 */
export async function changePassword(email: string, code: string, newPassword: string) {
  // 1) Find the user by email
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return { error: 'User not found' };
  }

  // 2) Check if the stored token matches
  if (!user.resetPasswordToken || user.resetPasswordToken !== code) {
    return { error: 'Invalid code' };
  }

  // 3) Check if the token is expired
  if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
    return { error: 'Code expired' };
  }

  // 4) Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // 5) Update the user's password and clear the reset token
  await db.user.update({
    where: { email },
    data: {
      passwordHash: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  });

  return { success: true };
}

/* ====================== */
/* ====== ROUTING ====== */
/* ====================== */

/**
 * POST /api/user/auth/credentials
 *
 * Request Body:
 * {
 *   "email": "user@example.com",
 *   "password": "SuperSecurePassword"
 * }
 *
 * Possible responses:
 * 200 => { "token": "your_token_here" }
 * 400 => { "error": "Error while auth. Bad Request." }
 * 401 => { "error": "Incorrect email or password" }
 *
 * Description: Authenticates the user using email and password, returning an access token.
 */
export async function POST(req: NextRequest) {
  try {
    // 1) Parse request body
    const body = await req.json();

    if (!body?.email || !body?.password) {
      // Missing parameters => 400
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
      // Any other error => 400
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
  } catch (error) {
    console.error('POST /api/user/auth/credentials error:', error);
    // Unexpected error => 400
    return NextResponse.json(
      { error: 'Error while auth. Bad Request.' },
      { status: 400 }
    );
  }
}