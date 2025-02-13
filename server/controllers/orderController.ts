// jamb-frontend/server/controllers/orderController.ts

/**
 * This interface represents the shape of a "composite order"
 * as returned by the external services (list, get, etc.).
 */
export interface CompositeOrder {
  id: number;
  code: string;
  user_id: number;
  user_token: string;
  zipcode: string;
  subtotal: string;
  tax_rate: string;
  tax_amount: string;
  common: {
    id: number;
    address: string;
    description: string;
    selected_date: string;
    date_coefficient: string;
  };
  works: Array<{
    id: number;
    type: string;
    code: string;
    unit_of_measurement: string;
    work_count: string;
    service_fee_on_labor: string;
    service_fee_on_materials: string;
    payment_type: string;
    payment_coefficient: string;
    total: string;
    materials: Array<{
      id: number;
      external_id: string;
      quantity: number;
      cost_per_unit: string;
      cost: string;
    }>;
  }>;
}

/**
 * listSavedOrders(token: string):
 * Sends a POST request to https://dev.thejamb.com/composite-order/list
 * including the user's token in the request body.
 * Returns an array of CompositeOrder or throws an error if the response is not OK.
 */
export async function listSavedOrders(token: string): Promise<CompositeOrder[]> {
  const url = "https://dev.thejamb.com/composite-order/list";

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  if (!resp.ok) {
    if (resp.status === 400) {
      const errData = await resp.json();
      throw new Error(errData.error || "Token required (400)");
    }
    if (resp.status === 404) {
      const errData = await resp.json();
      const message = Array.isArray(errData.errors)
        ? errData.errors.join(", ")
        : "User not found";
      throw new Error(message || "Not found (404)");
    }
    if (resp.status === 500) {
      const errData = await resp.json();
      throw new Error(errData.error || "Internal server error (500)");
    }
    throw new Error(`Request failed with status ${resp.status}`);
  }

  const data = await resp.json();
  return data as CompositeOrder[];
}

/**
 * getCompositeOrder(token: string, orderCode: string):
 * Sends a POST request to https://dev.thejamb.com/composite-order/get
 * including the user's token and the order_code in the request body.
 * Returns a single CompositeOrder object or throws an error if the response is not OK.
 */
export async function getCompositeOrder(token: string, orderCode: string): Promise<CompositeOrder> {
  const url = "https://dev.thejamb.com/composite-order/get";

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token,
      order_code: orderCode,
    }),
  });

  if (!resp.ok) {
    if (resp.status === 400) {
      const errData = await resp.json();
      throw new Error(errData.error || "Token or order code required (400)");
    }
    if (resp.status === 404) {
      const errData = await resp.json();
      const message = Array.isArray(errData.errors)
        ? errData.errors.join(", ")
        : "User or order not found";
      throw new Error(message || "Not found (404)");
    }
    if (resp.status === 500) {
      const errData = await resp.json();
      throw new Error(errData.error || "Internal server error (500)");
    }
    throw new Error(`Request failed with status ${resp.status}`);
  }

  const data = await resp.json();
  return data as CompositeOrder;
}

/**
 * deleteCompositeOrder(token: string, orderCode: string):
 * Sends a POST request to https://dev.thejamb.com/composite-order/delete
 * including the user's token and the order_code in the request body.
 * If successful, returns an object like { status: "Order deleted" }.
 * Otherwise, throws an error according to the status code.
 */
export async function deleteCompositeOrder(
  token: string,
  orderCode: string
): Promise<{ status: string }> {
  const url = "https://dev.thejamb.com/composite-order/delete";

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token,
      order_code: orderCode,
    }),
  });

  if (!resp.ok) {
    if (resp.status === 400) {
      const errData = await resp.json();
      throw new Error(errData.error || "Token or order code required (400)");
    }
    if (resp.status === 404) {
      const errData = await resp.json();
      const message = Array.isArray(errData.errors)
        ? errData.errors.join(", ")
        : "User or order not found";
      throw new Error(message || "Not found (404)");
    }
    if (resp.status === 500) {
      const errData = await resp.json();
      throw new Error(errData.error || "Internal server error (500)");
    }
    throw new Error(`Request failed with status ${resp.status}`);
  }

  const data = await resp.json();
  return data as { status: string };
}

/**
 * This interface defines the payload structure for creating a new composite order
 * via /composite-order/create. It should match the API requirements.
 */
export interface CreateCompositeOrderPayload {
  zipcode: string;
  user_token: string;
  common: {
    address: string;
    photos: string[];
    description: string;
    selected_date: string;
    date_coefficient: string;
  };
  works: Array<{
    type: string;
    code: string;
    unit_of_measurement: string;
    work_count: string;
    labor_cost: string;
    materials_cost: string;
    service_fee_on_labor: string;
    service_fee_on_materials: string;
    total: string;
    payment_type: string;
    payment_coefficient: string;
    materials: Array<{
      external_id: string;
      quantity: number;
      cost_per_unit: string;
      total: string;
    }>;
  }>;
  state_sales_taxes: string;
  average_local_sales_taxes: string;
  tax_rate: string;
  tax_amount: string;
  date_surcharge: string;
  subtotal: string;
  total: string;
}

/**
 * createCompositeOrder(orderData: CreateCompositeOrderPayload):
 * Sends a POST request to https://dev.thejamb.com/composite-order/create
 * with a JSON body that includes user_token, common, works, and related fields.
 * Returns an object with { message, order_code } if successful,
 * otherwise throws an error based on the status code.
 */
export async function createCompositeOrder(
  orderData: CreateCompositeOrderPayload
): Promise<{ message: string; order_code: string }> {
  const url = "https://dev.thejamb.com/composite-order/create";

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });

  if (!resp.ok) {
    if (resp.status === 400) {
      const errData = await resp.json();
      // Example: { "errors": ["User not found", "Invalid work data"] }
      // We combine them into a single error message if it's an array:
      if (Array.isArray(errData.errors)) {
        throw new Error(errData.errors.join(", "));
      }
      // Or if there's a single error
      throw new Error(errData.errors || "Bad request (400)");
    }
    if (resp.status === 500) {
      const errData = await resp.json();
      throw new Error(errData.error || "Internal server error (500)");
    }
    throw new Error(`Request failed with status ${resp.status}`);
  }

  // If 200, we expect { "message": "...", "order_code": "..." }
  const data = await resp.json();
  return data as { message: string; order_code: string };
}