import axios from 'axios';

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
    // ...
  };
  // other fields if needed
}

export interface CategoryResponse {
  // For category requests, BigBox typically returns:
  category_results?: Array<{
    position: number;
    product: {
      item_id?: string;
      title?: string;
      // ...
    };
  }>;
  // Or possibly search_results if type=search
  search_results?: Array<{
    position: number;
    product: {
      item_id?: string;
      title?: string;
      // ...
    };
  }>;
  // other fields if needed
}

function getApiKeyOrThrow(): string {
  const key = process.env.API_SUPPLIER_KEY;
  if (!key) {
    throw new Error('Missing environment variable: API_SUPPLIER_KEY');
  }
  return key;
}

const BIGBOX_API_URL = 'https://api.bigboxapi.com/request';

/**
 * Fetch a single product by item_id
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
  return response.data;
}

/**
 * Fetch a category or search result by URL from last breadcrumb
 * We'll choose 'type=category' here, but if it's actually a search link,
 * you can pass type=search or detect automatically.
 */
export async function fetchCategoryByUrl(hdUrl: string, requestType: 'category' | 'search'): Promise<CategoryResponse> {
  const apiKey = getApiKeyOrThrow();
  const response = await axios.get<CategoryResponse>(BIGBOX_API_URL, {
    params: {
      api_key: apiKey,
      type: requestType,
      url: hdUrl
    }
  });
  return response.data;
}