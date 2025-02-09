// import { db } from "@/server/db"; // Commented out because there's no local DB in use
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";

/** 
 * A generic type for returning either success or an error message.
 */
type ControllerResult = {
  success: boolean;
  error?: string; // "?" means "optional" property
};

/**
 * Create a new user in the database (stub).
 *
 * POST /user/create
 */
export async function createUser(
  email: string,
  phoneNumber: string,
  password: string
): Promise<ControllerResult> {
  if (!email || !phoneNumber || !password) {
    // No success => return an error
    return { success: false, error: "empty-body" };
  }

  /*
  // ... DB logic commented out ...
  // if user exists => return { success: false, error: "User already created" };
  // else create user => success: true
  */

  // For now, returning success = true
  return { success: true };
}

/**
 * Authenticate user (stub).
 *
 * POST /user/auth/credentials
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<{ token?: string; error?: string }> {
  // If you want a single shape, you could also do success boolean, etc. For now:
  // We'll return an object that can have token or error
  /*
  // DB logic commented out
  // if no user => return { error: "Incorrect credentials" };
  // if password mismatch => return { error: "Incorrect credentials" };
  // else => return { token: "..." };
  */

  // Stub return
  return { token: "dummy_token" };
}

/**
 * Confirm user registration with code (stub).
 *
 * POST /user/confirm
 */
export async function confirmUser(
  email: string,
  code: string
): Promise<ControllerResult> {
  // If something is invalid => success = false, return error
  // For demonstration, let's pretend it's always valid:
  return { success: true };
}

/**
 * Request password change (stub).
 *
 * POST /user/change-password/request
 */
export async function requestChangePassword(email: string): Promise<ControllerResult> {
  // If no user => { success: false, error: "User not found" };
  // If success => { success: true }
  return { success: true };
}

/**
 * Change password with code (stub).
 *
 * POST /user/change-password
 */
export async function changePassword(
  email: string,
  code: string,
  newPassword: string
): Promise<ControllerResult> {
  // If code invalid => { success: false, error: "Invalid code" };
  // else => { success: true };
  return { success: true };
}

/**
 * Resend activation code (stub).
 *
 * POST /user/resend-activation
 */
export async function resendActivationCode(email: string): Promise<ControllerResult> {
  // If no email => { success: false, error: "Email is required" };
  if (!email) {
    return { success: false, error: "Email is required" };
  }

  // If no user => { success: false, error: "User not found" };
  // else => { success: true }
  return { success: true };
}

/**
 * Update user address (stub).
 *
 * POST /user/address
 */
export async function updateUserAddress(
  token: string,
  country: string,
  address: string,
  city: string,
  state: string,
  zipcode: number
): Promise<ControllerResult> {
  // If invalid => { success: false, error: "Not valid token or request body" }
  if (!token || !country || !address || !city || !state || !zipcode) {
    return { success: false, error: "Not valid token or request body" };
  }
  return { success: true };
}

/**
 * Update user card data (stub).
 *
 * POST /user/card
 */
export async function updateUserCard(
  token: string,
  number: string,
  surname: string,
  name: string,
  expiredTo: string,
  cvv: string,
  zipcode: string
): Promise<ControllerResult> {
  if (!token || !number || !surname || !name || !expiredTo || !cvv || !zipcode) {
    return { success: false, error: "Not valid token or request body" };
  }
  return { success: true };
}

/**
 * Returns user info (stub).
 *
 * POST /user/info
 */
export async function getUserInfo(token: string): Promise<{
  data?: any;
  error?: string;
}> {
  if (!token) {
    return { error: "Bad request" };
  }
  // Otherwise return some placeholder data
  return { data: {} };
}

/**
 * Auth with token (stub).
 *
 * POST /user/auth/token
 */
export async function authenticateWithToken(
  token: string,
  withProfile?: boolean
): Promise<ControllerResult> {
  // If no token => return error
  if (!token) {
    return { success: false, error: "Bad request" };
  }

  // else => { success: true }
  return { success: true };
}

/**
 * Update user profile (stub).
 *
 * POST /user/profile
 */
export async function updateUserProfile(
  token: string,
  name: string,
  surname: string,
  firstLang: string,
  secondLang: string,
  sendingAgreed: boolean
): Promise<ControllerResult> {
  // If something missing => return { success: false, error: "Bad request" };
  if (!token) {
    return { success: false, error: "Bad request" };
  }

  // else => success
  return { success: true };
}

/**
 * Delete a user account by token (stub).
 *
 * PATCH /user/delete
 */
export async function deleteUserAccount(token: string): Promise<ControllerResult> {
  if (!token) {
    return { success: false, error: "Token is required" };
  }

  // else => { success: true, or "User not found" ... }
  return { success: true };
}