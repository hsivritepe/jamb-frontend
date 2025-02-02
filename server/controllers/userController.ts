import { db } from "@/server/db";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";

/**
 * Create a new user in the database.
 *
 * POST /user/create
 * Body:
 * {
 *   "email": "user@example.com",
 *   "phone_number": "+1234567890",
 *   "password": "SuperSecurePassword"
 * }
 *
 * Typical responses:
 * 200 => { "status": "ok" }
 * 400 => { "error": "User already created" } or "empty-body"
 */
export async function createUser(email: string, phoneNumber: string, password: string) {
  if (!email || !phoneNumber || !password) {
    return { error: "empty-body" };
  }

  // Check if user already exists
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "User already created" };
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Save user in DB
  await db.user.create({
    data: {
      email,
      phone: phoneNumber, // or phone_number field in your DB
      passwordHash: hashedPassword,
    },
  });

  return { success: true };
}

/**
 * Authenticate user by email and password.
 *
 * POST /user/auth/credentials
 * Body:
 * {
 *   "email": "user@example.com",
 *   "password": "SuperSecurePassword"
 * }
 *
 * Typical responses:
 * 200 => { "token": "some-generated-token" }
 * 401 => { "error": "Incorrect credentials" }
 */
export async function authenticateUser(email: string, password: string) {
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "Incorrect credentials" };
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return { error: "Incorrect credentials" };
  }

  // Generate a token (dummy example)
  const token = `token-${Date.now()}-${user.id}`;
  // Save the token in DB
  await db.user.update({
    where: { id: user.id },
    data: { authToken: token },
  });

  return { token };
}

/**
 * Confirm user registration with a code.
 *
 * POST /user/confirm
 * Body:
 * {
 *   "email": "user@example.com",
 *   "code": "123456"
 * }
 *
 * 200 => { success: true }
 * 400 => { error: "Invalid or expired code" }
 * 404 => { error: "User not found" }
 */
export async function confirmUser(email: string, code: string) {
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "User not found" };
  }
  if (!user.activationCode || user.activationCode !== code) {
    return { error: "Invalid or expired code" };
  }

  await db.user.update({
    where: { email },
    data: {
      isActive: true,
      activationCode: null,
    },
  });

  return { success: true };
}

/**
 * Request password change (forgot password).
 *
 * POST /user/change-password/request
 * Body:
 * {
 *   "email": "user@example.com"
 * }
 *
 * 200 => { success: true }
 * 404 => { error: "User not found" }
 * 500 => { error: "Error while sending email code" }
 */
export async function requestChangePassword(email: string) {
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "User not found" };
  }

  const resetToken = randomBytes(6).toString("hex").slice(0, 6); // 6-char code
  try {
    await db.user.update({
      where: { email },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });
    // Optionally send email with code (resetToken)
    return { success: true };
  } catch (err) {
    console.error("requestChangePassword:", err);
    return { error: "Error while sending email code" };
  }
}

/**
 * Change password with code.
 *
 * POST /user/change-password
 * Body:
 * {
 *   "email": "user@example.com",
 *   "code": "123456",
 *   "password": "NewPassword123"
 * }
 *
 * 200 => { success: true }
 * 400 => { error: "Bad request" } e.g. code mismatch or expired
 * 401 => { error: "User not found" }
 */
export async function changePassword(email: string, code: string, newPassword: string) {
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "User not found" };
  }

  if (!user.resetPasswordToken || user.resetPasswordToken !== code) {
    return { error: "Invalid code" };
  }

  if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
    return { error: "Code expired" };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
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
 * Resend activation code for an inactive user.
 *
 * POST /user/resend-activation
 * Body:
 * {
 *   "email": "user@example.com"
 * }
 *
 * 200 => { success: "Activation code resent" }
 * 400 => e.g. { error: "Email is required" or "Email already confirmed" }
 * 404 => { error: "User not found" }
 * 500 => { error: "Error while sending activation code" }
 */
export async function resendActivationCode(email: string) {
  if (!email) {
    return { error: "Email is required" };
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "User not found" };
  }
  if (user.isActive) {
    return { error: "Email already confirmed" };
  }

  try {
    const newCode = randomBytes(3).toString("hex").slice(0, 6);
    await db.user.update({
      where: { email },
      data: { activationCode: newCode },
    });
    // Optionally send email with new code
    return { success: "Activation code resent" };
  } catch (err) {
    console.error("resendActivationCode error:", err);
    return { error: "Error while sending activation code" };
  }
}

/**
 * Update user address.
 *
 * POST /user/address
 * Body:
 * {
 *   "token": "abcd1234",
 *   "country": "USA",
 *   "address": "123 Main St",
 *   "city": "Los Angeles",
 *   "state": "California",
 *   "zipcode": 90210
 * }
 *
 * 200 => { success: "ok" }
 * 400 => { error: "Not valid token or request body" }
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
    return { error: "Not valid token or request body" };
  }

  const user = await db.user.findUnique({ where: { authToken: token } });
  if (!user) {
    return { error: "Not valid token or request body" };
  }

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

  return { success: "ok" };
}

/**
 * Update user card data.
 *
 * POST /user/card
 * Body:
 * {
 *   "token": "abcd1234",
 *   "number": "1234567812345678",
 *   "surname": "Doe",
 *   "name": "John",
 *   "expiredTo": "12/25",
 *   "cvv": "123",
 *   "zipcode": "90210"
 * }
 *
 * 200 => { success: "ok" }
 * 400 => { error: "Not valid token or request body" }
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
  if (!token || !number || !surname || !name || !expiredTo || !cvv || !zipcode) {
    return { error: "Not valid token or request body" };
  }

  const user = await db.user.findUnique({ where: { authToken: token } });
  if (!user) {
    return { error: "Not valid token or request body" };
  }

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

  return { success: "ok" };
}

/**
 * Returns user info, including address/card if needed.
 *
 * POST /user/info
 * Body:
 * { "token": "valid-user-token" }
 *
 * 200 => { data: { name, surname, card, address, ... } }
 * 400 => { error: "Bad request" }
 * 401 => { error: "Unauthorized" }
 */
export async function getUserInfo(token: string) {
  if (!token) {
    return { error: "Bad request" };
  }

  const user = await db.user.findUnique({ where: { authToken: token } });
  if (!user) {
    return { error: "Unauthorized" };
  }

  // Return the fields as needed
  const userInfo = {
    email: user.email,
    name: user.name || "",
    surname: user.surname || "",
    phone: user.phone || "",
    address: {
      country: user.addressCountry || "",
      address: user.addressAddress || "",
      city: user.addressCity || "",
      state: user.addressState || "",
      zipcode: user.addressZipcode || "",
    },
    card: {
      number: user.cardNumber || "",
      surname: user.cardSurname || "",
      name: user.cardName || "",
      expiredTo: user.cardExpiredTo || "",
      cvv: user.cardCVV || "",
      zipcode: user.cardZipcode || "",
    },
  };

  return { data: userInfo };
}

/**
 * Authenticate with token (optionally returning profile).
 *
 * POST /user/auth/token
 * Body:
 * {
 *   "token": "valid-user-token",
 *   "with_profile": boolean
 * }
 *
 * 200 => { success: "ok", name, surname, ... } if with_profile
 * 400 => { error: "Bad Request" }
 * 401 => { error: "Unauthorized" }
 */
export async function authenticateWithToken(token: string, withProfile?: boolean) {
  if (!token) {
    return { error: "Error while auth. Bad Request." };
  }

  const user = await db.user.findUnique({ where: { authToken: token } });
  if (!user) {
    return { error: "Unauthorized" };
  }

  if (withProfile) {
    return {
      success: "ok",
      email: user.email,
      name: user.name || "",
      surname: user.surname || "",
      phone: user.phone || "",
    };
  }

  return { success: "ok" };
}

/**
 * Example for updating some advanced user profile fields (optional).
 */
export async function updateUserProfile(token: string, name: string, surname: string) {
  if (!token || !name || !surname) {
    return { error: "Bad request" };
  }

  const user = await db.user.findUnique({ where: { authToken: token } });
  if (!user) {
    return { error: "Invalid token" };
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      name,
      surname,
    },
  });

  return { success: true };
}