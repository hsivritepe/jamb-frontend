import axios from 'axios';

/**
 * Minimal interface for the BigBox "type=product" response.
 * 
 * If you prefer, you could define "specifications" here as well,
 * or keep it minimal and later cast to ExtendedProduct from types.ts.
 */
export interface ProductResponse {
  product?: {
    item_id?: string;
    title?: string;
    link?: string;
    buybox_winner?: {
      price?: number;
      currency?: string;
      unit?: string;
    };
    // If you want to define specs here, uncomment:
    // specifications?: Array<{ group_name?: string; name?: string; value?: string }>;
    // ...
  };
  // you may add request_info, request_parameters, etc. if needed
}

function getApiKeyOrThrow(): string {
  const key = process.env.API_SUPPLIER_KEY;
  if (!key) {
    throw new Error('Missing environment variable: API_SUPPLIER_KEY');
  }
  return key;
}

// Base URL for BigBox API
const BIGBOX_API_URL = 'https://api.bigboxapi.com/request';

/**
 * Fetch a product from the BigBox API (Home Depot data) by item_id
 */
export async function fetchProduct(itemId: string): Promise<ProductResponse> {
  const apiKey = getApiKeyOrThrow();

  const response = await axios.get<ProductResponse>(BIGBOX_API_URL, {
    params: {
      api_key: apiKey,
      type: 'product',
      item_id: itemId,
    },
  });

  return response.data; // Contains "product" field, etc.
}