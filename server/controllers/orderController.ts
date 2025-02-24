export interface CompositeOrder {
  id: number;
  code: string;
  user_id: number;
  user_token: string;
  zipcode: string;
  subtotal: string;
  service_fee_on_labor: string;
  service_fee_on_materials: string;
  payment_type: string;
  payment_coefficient: string;
  tax_rate: string;
  tax_amount: string;
  date_surcharge: string;
  total: string;
  common: {
    id: number;
    address: string;
    photos: string[];
    description: string;
    selected_date: string;
    date_coefficient: string;
  };
  works: Array<{
    id: number;
    type: string;
    code: string;
    name: string;
    photo: string;                  
    description: string;            
    unit_of_measurement: string;
    work_count: string;
    total: string;
    materials: Array<{
      id: number;
      external_id: string;
      name: string;                 
      photo: string;                
      quantity: number;
      cost_per_unit: string;
      cost: string;
    }>;
  }>;
}

/**
 * listSavedOrders(token: string):
 * Sends a POST request to https://dev.thejamb.com/composite-order/list,
 * providing the user's token in the request body.
 * Returns an array of CompositeOrder or throws an error if the response indicates a failure.
 */
export async function listSavedOrders(token: string): Promise<CompositeOrder[]> {
  const endpointUrl = "https://dev.thejamb.com/composite-order/list";

  const response = await fetch(endpointUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    if (response.status === 400) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Token required (400)");
    }
    if (response.status === 404) {
      const errorData = await response.json();
      const errorMessage = Array.isArray(errorData.errors)
        ? errorData.errors.join(", ")
        : "User not found";
      throw new Error(errorMessage || "Not found (404)");
    }
    if (response.status === 500) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Internal server error (500)");
    }
    throw new Error(`Request failed with status ${response.status}`);
  }

  const responseData = await response.json();
  return responseData as CompositeOrder[];
}

/**
 * getCompositeOrder(token: string, orderCode: string):
 * Sends a POST request to https://dev.thejamb.com/composite-order/get,
 * including the user's token and the order_code in the request body.
 * Returns a single CompositeOrder object or throws an error if the response fails.
 */
export async function getCompositeOrder(token: string, orderCode: string): Promise<CompositeOrder> {
  const endpointUrl = "https://dev.thejamb.com/composite-order/get";

  const response = await fetch(endpointUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token,
      order_code: orderCode,
    }),
  });

  if (!response.ok) {
    if (response.status === 400) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Token or order code required (400)");
    }
    if (response.status === 404) {
      const errorData = await response.json();
      const errorMessage = Array.isArray(errorData.errors)
        ? errorData.errors.join(", ")
        : "User or order not found";
      throw new Error(errorMessage || "Not found (404)");
    }
    if (response.status === 500) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Internal server error (500)");
    }
    throw new Error(`Request failed with status ${response.status}`);
  }

  const responseData = await response.json();
  return responseData as CompositeOrder;
}

/**
 * deleteCompositeOrder(token: string, orderCode: string):
 * Sends a POST request to https://dev.thejamb.com/composite-order/delete,
 * including the user's token and order_code. If successful, returns
 * an object like { status: "Order deleted" }. Otherwise, throws an error.
 */
export async function deleteCompositeOrder(
  token: string,
  orderCode: string
): Promise<{ status: string }> {
  const endpointUrl = "https://dev.thejamb.com/composite-order/delete";

  const response = await fetch(endpointUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token,
      order_code: orderCode,
    }),
  });

  if (!response.ok) {
    if (response.status === 400) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Token or order code required (400)");
    }
    if (response.status === 404) {
      const errorData = await response.json();
      const errorMessage = Array.isArray(errorData.errors)
        ? errorData.errors.join(", ")
        : "User or order not found";
      throw new Error(errorMessage || "Not found (404)");
    }
    if (response.status === 500) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Internal server error (500)");
    }
    throw new Error(`Request failed with status ${response.status}`);
  }

  const responseData = await response.json();
  return responseData as { status: string };
}

/**
 * This interface defines the payload structure for creating a new composite order
 * via /composite-order/create. It should align with the API requirements.
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
 * with a JSON body containing user_token, common, works, and related fields.
 * Returns an object { message, order_code } if successful,
 * or throws an error based on the status code.
 */
export async function createCompositeOrder(
  orderData: CreateCompositeOrderPayload
): Promise<{ message: string; order_code: string }> {
  const endpointUrl = "https://dev.thejamb.com/composite-order/create";

  const response = await fetch(endpointUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    if (response.status === 400) {
      const errorData = await response.json();
      if (Array.isArray(errorData.errors)) {
        throw new Error(errorData.errors.join(", "));
      }
      throw new Error(errorData.errors || "Bad request (400)");
    }
    if (response.status === 500) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Internal server error (500)");
    }
    throw new Error(`Request failed with status ${response.status}`);
  }

  // Expected 200 response: { "message": "Composite order created successfully.", "order_code": "..." }
  const responseData = await response.json();
  return responseData as { message: string; order_code: string };
}

/**
 * This interface defines the payload structure for updating a composite order
 * via /composite-order/update. It should match the API requirements.
 */
export interface UpdateCompositeOrderPayload {
  user_token: string;
  order_code: string;
  common: {
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
    total: string;
    materials: Array<{
      external_id: string;
      quantity: number;
      cost_per_unit: string;
      total: string;
    }>;
  }>;
  tax_rate: string;
  tax_amount: string;
  service_fee_on_labor: string;
  service_fee_on_materials: string;
  payment_type: string;
  payment_coefficient: string;
  date_surcharge: string;
  subtotal: string;
  total: string;
}

/**
 * updateCompositeOrder(orderData: UpdateCompositeOrderPayload):
 * Sends a POST request to https://dev.thejamb.com/composite-order/update
 * with a JSON body containing user_token, order_code, and other fields.
 * If the request is successful (HTTP 200), returns an object { message: string }.
 * Otherwise, throws an error with the appropriate message.
 */
export async function updateCompositeOrder(
  orderData: UpdateCompositeOrderPayload
): Promise<{ message: string }> {
  const endpointUrl = "https://dev.thejamb.com/composite-order/update";

  const response = await fetch(endpointUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    if (response.status === 400) {
      const errorData = await response.json();
      // Example: { "errors": ["User not found", "Invalid work data"] }
      if (Array.isArray(errorData.errors)) {
        throw new Error(errorData.errors.join(", "));
      }
      throw new Error(errorData.errors || "Bad request (400)");
    }
    if (response.status === 500) {
      // Example: { "error": "Internal server error" }
      const errorData = await response.json();
      throw new Error(errorData.error || "Internal server error (500)");
    }
    throw new Error(`Request failed with status ${response.status}`);
  }

  // Expected 200 response: { "message": "Composite order updated successfully." }
  const responseData = await response.json();
  return responseData as { message: string };
}