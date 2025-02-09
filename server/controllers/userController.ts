// import { db } from "@/server/db"; // Commented out because there's no local DB in use
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

  // NOTE: The following code is commented out since we no longer use a local DB:
  /*
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
      phone: phoneNumber,
      passwordHash: hashedPassword,
    },
  });
  */

  // For now, just return a success object (or do a fetch to your external API)
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
  // NOTE: Commenting out local DB logic:
  /*
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "Incorrect credentials" };
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return { error: "Incorrect credentials" };
  }

  // Generate a dummy token
  const token = `token-${Date.now()}-${user.id}`;
  await db.user.update({
    where: { id: user.id },
    data: { authToken: token },
  });

  return { token };
  */

  // Placeholder response:
  return { token: "dummy_token" };
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
  /*
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
  */

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
  /*
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "User not found" };
  }

  const resetToken = randomBytes(6).toString("hex").slice(0, 6);
  try {
    await db.user.update({
      where: { email },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
    return { success: true };
  } catch (err) {
    console.error("requestChangePassword:", err);
    return { error: "Error while sending email code" };
  }
  */

  return { success: true };
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
 * 400 => { error: "Bad request" }
 * 401 => { error: "User not found" }
 */
export async function changePassword(email: string, code: string, newPassword: string) {
  /*
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
  */

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

  /*
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
    return { success: "Activation code resent" };
  } catch (err) {
    console.error("resendActivationCode error:", err);
    return { error: "Error while sending activation code" };
  }
  */

  return { success: "Activation code resent" };
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

  /*
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
  */

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

  /*
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
  */

  return { success: "ok" };
}

/**
 * Returns user info, including address/card if needed.
 *
 * POST /user/info
 * Body:
 * { "token": "valid-user-token" }
 *
 * 200 => { data: { name, surname, phone, firstLang, secondLang, sendingAgreed, card, address, ... } }
 * 400 => { error: "Bad request" }
 * 401 => { error: "Unauthorized" }
 */
export async function getUserInfo(token: string) {
  if (!token) {
    return { error: "Bad request" };
  }

  /*
  const user = await db.user.findUnique({ where: { authToken: token } });
  if (!user) {
    return { error: "Unauthorized" };
  }

  const userInfo = {
    name: user.name || "",
    surname: user.surname || "",
    phone: user.phone || "",
    firstLang: user.firstLang || "",
    secondLang: user.secondLang || "",
    sendingAgreed: user.sendingAgreed || false,
    card: {
      number: user.cardNumber || "",
      surname: user.cardSurname || "",
      name: user.cardName || "",
      expired_to: user.cardExpiredTo || "",
      cvv: user.cardCVV || "",
      zipcode: user.cardZipcode || "",
    },
    address: {
      country: user.addressCountry || "",
      address: user.addressAddress || "",
      zipcode: user.addressZipcode || "",
      city: user.addressCity || "",
      state: user.addressState || "",
    },
  };

  return { data: userInfo };
  */

  // Placeholder response
  return { data: {} };
}

/**
 * (Optional) Auth with token
 */
export async function authenticateWithToken(token: string, withProfile?: boolean) {
  /*
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
  */
  return { success: "ok" };
}

/**
 * New: Update user profile with name, surname, firstLang, secondLang, sendingAgreed
 */
export async function updateUserProfile(
  token: string,
  name: string,
  surname: string,
  firstLang: string,
  secondLang: string,
  sendingAgreed: boolean
) {
  /*
  if (!token) {
    return { error: "Bad request" };
  }

  const user = await db.user.findUnique({ where: { authToken: token } });
  if (!user) {
    return { error: "Invalid token" };
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      name: name || "",
      surname: surname || "",
      firstLang: firstLang || "",
      secondLang: secondLang || "",
      sendingAgreed: sendingAgreed ?? false,
    },
  });
  */

  return { success: true };
}

/**
 * Delete a user account by token.
 *
 * PATCH /user/delete
 * Body:
 * {
 *   "token": "user-token-123"
 * }
 *
 * Typical responses:
 * 200 => { "success": "User has been deleted" }
 * 400 => { "error": "Token is required" }
 * 404 => { "error": "User not found" }
 */
export async function deleteUserAccount(token: string) {
  /*
  if (!token) {
    return { error: "Token is required" };
  }

  const user = await db.user.findUnique({ where: { authToken: token } });
  if (!user) {
    return { error: "User not found" };
  }

  await db.user.delete({
    where: { id: user.id },
  });

  return { success: "User has been deleted" };
  */
  return { success: "User has been deleted" };
}