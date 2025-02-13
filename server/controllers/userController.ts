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

  // For now, returning success = true
  return { success: true };
}

/**
 * POST /user/auth/credentials
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<{ token?: string; error?: string }> {

  // Stub return
  return { token: "dummy_token" };
}

/**
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
 * POST /user/change-password/request
 */
export async function requestChangePassword(email: string): Promise<ControllerResult> {
  // If no user => { success: false, error: "User not found" };
  // If success => { success: true }
  return { success: true };
}

/**
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
 * PATCH /user/delete
 */
export async function deleteUserAccount(token: string): Promise<ControllerResult> {
  if (!token) {
    return { success: false, error: "Token is required" };
  }

  // else => { success: true, or "User not found" ... }
  return { success: true };
}