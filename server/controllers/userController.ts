import { db } from '@/server/db';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

/**
 * Create a new user in the database.
 *
 * ROUTE EXAMPLE (POST http://dev.thejamb.com/api/user/register):
 * Request body:
 * {
 *   "email": "user@example.com",
 *   "phone": "+1234567890",
 *   "password": "SuperSecurePassword"
 * }
 *
 * Typical responses:
 * 200 => { "success": true }
 * 400 => { "error": "User already exists" }
 *
 * ---
 * LOGIC:
 * 1) Checks if the user already exists by email.
 * 2) Hashes the password.
 * 3) Saves the user in the database.
 */
export async function createUser(email: string, phone: number, password: string) {
  // 1) Basic validation (in case it's not done in the route)
  if (!email || !phone || !password) {
    return { error: 'empty-body' }; // You can code a special error for "body is empty"
  }

  // 2) Check if the user already exists
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { error: 'User already created' };
  }

  // 3) Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 4) Save the new user in the database
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
 * ROUTE EXAMPLE (POST http://dev.thejamb.com/api/user/auth/credentials):
 * Request body:
 * {
 *   "email": "user@example.com",
 *   "password": "SuperSecurePassword"
 * }
 *
 * Possible responses:
 * 200 => { "token": "some-token-value" }
 * 400 => { "error": "Bad request" }
 * 401 => { "error": "Incorrect email or password" }
 *
 * ---
 * LOGIC:
 * 1) Finds the user by email.
 * 2) Compares the provided password with the stored hash.
 * 3) Generates and returns a token if credentials are valid.
 *    (In this example, the token might be stored in the user table as `authToken`.)
 */
export async function authenticateUser(email: string, password: string) {
  // 1) Find the user by email
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return { error: 'Incorrect credentials' };
  }

  // 2) Compare the password
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return { error: 'Incorrect credentials' };
  }

  // 3) Generate a token (dummy example - replace with real JWT or session logic)
  const token = `token-${Date.now()}-${user.id}`;

  // Optionally store this token in DB so we can find the user by token later
  await db.user.update({
    where: { id: user.id },
    data: { authToken: token },
  });

  return { token };
}

/**
 * Confirm user registration using an activation code.
 *
 * ROUTE EXAMPLE (POST http://dev.thejamb.com/api/user/confirm):
 * Request body:
 * {
 *   "email": "user@example.com",
 *   "code": "123456"
 * }
 *
 * Possible responses:
 * 200 => { "success": "User activated successfully" }
 * 400 => { "error": "Invalid or expired code" }
 * 404 => { "error": "User not found" }
 *
 * ---
 * LOGIC:
 * 1) Finds the user by email.
 * 2) Checks if the provided code matches the user's activationCode field.
 * 3) Marks the user as activated if valid.
 */
export async function confirmUser(email: string, code: string) {
  // 1) Find the user by email
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return { error: 'User not found' };
  }

  // 2) Check if the code matches
  if (!user.activationCode || user.activationCode !== code) {
    return { error: 'Invalid or expired code' };
  }

  // 3) Mark the user as activated
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
 * Request password change.
 *
 * ROUTE EXAMPLE (POST http://dev.thejamb.com/api/user/change-password/request):
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
 * ---
 * LOGIC:
 * 1) Finds the user by email.
 * 2) If not found => returns { error: 'User not found' }.
 * 3) Generates a reset token and expiry time.
 * 4) Stores them in the database (e.g. 1 hour expiration).
 * 5) (Optionally) sends an email to the user with the reset token/link.
 */
export async function requestChangePassword(email: string) {
  // 1) Check if the user exists
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return { error: 'User not found' };
  }

  // 2) Generate a random reset token
  const resetToken = randomBytes(32).toString('hex');

  try {
    // 3) Save the token and expiry time in the database (1 hour from now)
    await db.user.update({
      where: { email },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    // 4) (Optionally) send an email with the reset token or link
    return { success: true };
  } catch (err) {
    console.error('Error while requesting password change:', err);
    return { error: 'Error while sending email code' };
  }
}

/**
 * Change the user's password using a valid reset code.
 *
 * ROUTE EXAMPLE (POST http://dev.thejamb.com/api/user/change-password):
 * Request body:
 * {
 *   "email": "user@example.com",
 *   "code": "123456",
 *   "password": "NewPassword123"
 * }
 *
 * Possible responses:
 * 200 => { "success": "ok" }
 * 400 => { "error": "Bad request" }
 * 401 => { "error": "User not found" } (or invalid credentials)
 *
 * ---
 * LOGIC:
 * 1) Finds the user by email.
 * 2) Verifies the reset code (token) against the stored value.
 * 3) Checks if the code is expired.
 * 4) Hashes and updates the password in the database, clearing the reset token.
 */
export async function changePassword(email: string, code: string, newPassword: string) {
  // 1) Find the user by email
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return { error: 'User not found' };
  }

  // 2) Check if the code matches
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

/**
 * Update user profile data.
 *
 * ROUTE EXAMPLE (POST http://dev.thejamb.com/api/user/profile):
 * Request body:
 * {
 *   "token": "valid-user-token",
 *   "name": "John",
 *   "surname": "Doe",
 *   "firstLang": "English",
 *   "secondLang": "Spanish",
 *   "sendingAgreed": true
 * }
 *
 * Possible responses:
 * 200 => { "success": "ok" }
 * 400 => { "error": "Bad request" }
 * 401 => { "error": "Invalid token" }
 *
 * ---
 * LOGIC:
 * 1) Validate input: check for token, name, surname, etc.
 * 2) Find the user by token.
 * 3) If not found => return { error: 'Invalid token' }.
 * 4) Update user's fields.
 * 5) Return { success: true } on success.
 */
export async function updateUserProfile(
  token: string,
  name: string,
  surname: string,
  firstLang: string,
  secondLang: string,
  sendingAgreed: boolean
) {
  if (!token) {
    return { error: 'Bad request' };
  }

  if (!name || !surname || !firstLang || !secondLang) {
    return { error: 'Bad request' };
  }

  // Find the user by authToken
  const user = await db.user.findUnique({ where: { authToken: token } });
  if (!user) {
    return { error: 'Invalid token' };
  }

  // Update the fields
  await db.user.update({
    where: { id: user.id },
    data: {
      name,
      surname,
      firstLang,
      secondLang,
      sendingAgreed,
    },
  });

  return { success: true };
}

/**
 * Get user info (card and address, plus basic fields).
 *
 * ROUTE EXAMPLE (POST http://dev.thejamb.com/api/user/info):
 * Request body:
 * {
 *   "token": "valid-user-token"
 * }
 *
 * Possible responses:
 * 200 => { ...user fields... }
 * 400 => { "error": "Bad request" }
 * 401 => { "error": "Unauthorized" }
 *
 * ---
 * LOGIC:
 * 1) Validate that token is provided.
 * 2) Find the user by token.
 * 3) If not found => return { error: 'Unauthorized' }.
 * 4) Return user data with card, address, etc.
 */
export async function getUserInfo(token: string) {
  if (!token) {
    return { error: 'Bad request' };
  }

  const user = await db.user.findUnique({ where: { authToken: token } });
  if (!user) {
    return { error: 'Unauthorized' };
  }

  const userInfo = {
    name: user.name || '',
    surname: user.surname || '',
    firstLang: user.firstLang || '',
    secondLang: user.secondLang || '',
    card: {
      number: user.cardNumber || '',
      surname: user.cardSurname || '',
      name: user.cardName || '',
      expired_to: user.cardExpiredTo || '',
      cvv: user.cardCVV || '',
      zipcode: user.cardZipcode || '',
    },
    address: {
      country: user.addressCountry || '',
      address: user.addressAddress || '',
      zipcode: user.addressZipcode || '',
      city: user.addressCity || '',
      state: user.addressState || '',
    }
  };

  return { data: userInfo };
}

/**
 * Authenticate with an existing token.
 *
 * ROUTE EXAMPLE (POST http://dev.thejamb.com/api/user/auth/token):
 * Request body:
 * {
 *   "token": "valid-user-token",
 *   "with_profile": true (optional, boolean)
 * }
 *
 * Possible responses:
 * 200 => {
 *    "success": "ok",
 *    "name": "...",
 *    "surname": "...",
 *    "firstLang": "...",
 *    "secondLang": "..."
 * }
 * 400 => { "error": "Error while auth. Bad Request." }
 * 401 => { "error": "Unauthorized" }
 *
 * ---
 * LOGIC:
 * 1) Validate that token is provided.
 * 2) Find the user by token.
 * 3) If user not found => return { error: 'Unauthorized' }.
 * 4) If withProfile = true => return profile fields along with "success": "ok"
 * 5) Otherwise => return { success: "ok" }
 */
export async function authenticateWithToken(token: string, withProfile?: boolean) {
  if (!token) {
    return { error: 'Error while auth. Bad Request.' };
  }

  const user = await db.user.findUnique({ where: { authToken: token } });
  if (!user) {
    return { error: 'Unauthorized' };
  }

  if (withProfile) {
    return {
      success: 'ok',
      name: user.name || '',
      surname: user.surname || '',
      firstLang: user.firstLang || '',
      secondLang: user.secondLang || '',
    };
  }

  return { success: 'ok' };
}

/**
 * Resend activation code for a user who is not yet confirmed.
 *
 * ROUTE EXAMPLE (POST http://dev.thejamb.com/api/user/resend-activation):
 * Request body:
 * {
 *   "email": "user@example.com"
 * }
 *
 * Possible responses:
 * 200 => { "success": "Activation code resent" }
 * 400 => { "error": "Email is required" } or "Email already confirmed"
 * 404 => { "error": "User not found" }
 *
 * ---
 * LOGIC:
 * 1) Check if the email is provided.
 * 2) Find the user by email.
 * 3) If not found => return { error: 'User not found' }.
 * 4) If user is already active => return { error: 'Email already confirmed' }.
 * 5) Generate a new activation code (or reuse the old one).
 * 6) (Optionally) send an email with the new code.
 * 7) Return { success: 'Activation code resent' } on success.
 */
export async function resendActivationCode(email: string) {
  if (!email) {
    return { error: 'Email is required' };
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return { error: 'User not found' };
  }

  if (user.isActive) {
    return { error: 'Email already confirmed' };
  }

  try {
    const newCode = randomBytes(3).toString('hex').slice(0, 6); // e.g. 6-character code
    await db.user.update({
      where: { email },
      data: {
        activationCode: newCode,
      },
    });

    // (Optionally) send an email with the new code here
    // e.g., sendEmail(user.email, newCode)

    return { success: 'Activation code resent' };
  } catch (err) {
    console.error('Error while resending activation code:', err);
    return { error: 'Error while sending activation code' };
  }
}

/**
 * Update or create the user's address data.
 *
 * ROUTE EXAMPLE (POST http://dev.thejamb.com/api/user/address):
 * Request body:
 * {
 *   "token": "abcd1234",
 *   "country": "USA",
 *   "address": "123 Main St",
 *   "city": "Los Angeles",
 *   "state": "California",
 *   "zipcode": 90210
 * }
 *
 * Possible responses:
 * 200 => { "success": "ok" }
 * 400 => { "error": "Not valid token or request body" }
 *
 * ---
 * LOGIC:
 * 1) Validate that the token and address fields are provided.
 * 2) Find the user by the token.
 * 3) If not found => return { error: 'Not valid token or request body' }.
 * 4) Update the user's address fields in the database.
 * 5) Return { success: 'ok' } on success.
 */
export async function updateUserAddress(
  token: string,
  country: string,
  address: string,
  city: string,
  state: string,
  zipcode: number
) {
  if (!token || !country || !address || !city || !state || !zipcode) {
    return { error: 'Not valid token or request body' };
  }

  // Find the user by token
  const user = await db.user.findUnique({ where: { authToken: token } });
  if (!user) {
    return { error: 'Not valid token or request body' };
  }

  // Update the address fields
  // If your schema expects `zipcode` as string, convert it: String(zipcode)
  await db.user.update({
    where: { id: user.id },
    data: {
      addressCountry: country,
      addressAddress: address,
      addressCity: city,
      addressState: state,
      addressZipcode: String(zipcode),
    },
  });

  return { success: 'ok' };
}


/**
 * Update or create the user's card data.
 *
 * ROUTE EXAMPLE (POST http://dev.thejamb.com/api/user/card):
 * Request body:
 * {
 *   "token": "your-token-here",
 *   "number": "1234567812345678",
 *   "surname": "Doe",
 *   "name": "John",
 *   "expiredTo": "12/25",
 *   "cvv": "123",
 *   "zipcode": "90210"
 * }
 *
 * Possible responses:
 * 200 => { "success": "ok" }
 * 400 => { "error": "Not valid token or request body" }
 *
 * ---
 * LOGIC:
 * 1) Validate that the token and card fields are provided.
 * 2) Find the user by token.
 * 3) If not found => return { error: 'Not valid token or request body' }.
 * 4) Update the user’s card fields in the database.
 * 5) Return { success: 'ok' } on success.
 */
export async function updateUserCard(
  token: string,
  number: string,
  surname: string,
  name: string,
  expiredTo: string,
  cvv: string,
  zipcode: string
) {
  // 1) Check if all required fields are present
  if (!token || !number || !surname || !name || !expiredTo || !cvv || !zipcode) {
    return { error: 'Not valid token or request body' };
  }

  // 2) Find the user by token
  const user = await db.user.findUnique({ where: { authToken: token } });
  if (!user) {
    return { error: 'Not valid token or request body' };
  }

  // 3) Update the card fields
  // Adjust field names as per your DB schema
  await db.user.update({
    where: { id: user.id },
    data: {
      cardNumber: number,
      cardSurname: surname,
      cardName: name,
      cardExpiredTo: expiredTo,
      cardCVV: cvv,
      cardZipcode: zipcode,
    },
  });

  // 4) Return success
  return { success: 'ok' };
}