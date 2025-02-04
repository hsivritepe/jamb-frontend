// finishingMaterialService.ts

// 1) Import axios here:
import axios from 'axios';

import { FinishingMaterialPayload, ExtendedProduct } from './types'; 
// Optional: import { ProductResponse } from './supplierApi';

/**
 * OPTIONAL: Check if finishing material with external_id is already in DB.
 * For now, it's a stub returning false. You can adapt it.
 */
async function materialExistsInDb(externalId: string): Promise<boolean> {
  // For example, you'd do:
  // const resp = await axios.get(`http://dev.thejamb.com/material/check-exists?external_id=${externalId}`);
  // return resp.data.exists;
  return false;
}

/**
 * Helper to parse quantity_in_packaging from product data:
 *  - If buybox_winner.unit is "each" or "box" => return 1
 *  - Otherwise check `specifications` for "Container Size", "Area Coverage", etc.
 *  - Default 1
 */
function determineQuantityInPackaging(product: ExtendedProduct): number {
  if (!product) return 1;

  // 1) If the buybox unit is "each" or "box", assume 1
  const unitLower = product.buybox_winner?.unit?.toLowerCase() || '';
  if (['each', 'box'].includes(unitLower)) {
    return 1;
  }

  // 2) If we have "specifications"
  if (Array.isArray(product.specifications)) {
    for (const spec of product.specifications) {
      if (!spec.name || !spec.value) continue;

      const lowerName = spec.name.toLowerCase();
      const val = spec.value;

      // E.g. "Area Coverage Per Roll (sq. ft. for each roll)" => parseFloat
      if (lowerName.includes('area coverage')) {
        const numeric = parseFloat(val);
        if (!isNaN(numeric)) return numeric;
      }

      // E.g. "Container Size": "5 Gallon" => parse out 5
      if (lowerName.includes('container size')) {
        const match = val.match(/(\d+(\.\d+)?)/);
        if (match) {
          const parsed = parseFloat(match[0]);
          if (!isNaN(parsed)) return parsed;
        }
      }
    }
  }

  // 3) Default
  return 1;
}

/**
 * Build the payload to send to /material/add-finishing-material.
 * 
 * `product` is expected to be an ExtendedProduct (so we can handle specs).
 * If your supplierApi's ProductResponse doesn't define specs, 
 * cast `productResponse.product as ExtendedProduct` before passing it here.
 */
export function buildFinishingMaterialPayload(
  section: number,
  externalId: string,
  workCode: string,
  product: ExtendedProduct
): FinishingMaterialPayload {
  if (!product) {
    throw new Error('Missing product data');
  }

  return {
    section,
    external_id: externalId,
    name: product.title || 'No Title',
    image_href: product.main_image?.link || '',
    unit_of_measurement: product.buybox_winner?.unit || 'each',
    quantity_in_packaging: determineQuantityInPackaging(product),
    cost: product.buybox_winner?.price || 0,
    work_code: workCode,
  };
}

/**
 * POST finishing material to your DB: 
 * http://dev.thejamb.com/material/add-finishing-material
 */
export async function addFinishingMaterialToDb(payload: FinishingMaterialPayload) {
  // (optional) check if it already exists
  const alreadyExists = await materialExistsInDb(payload.external_id);
  if (alreadyExists) {
    console.log(`Material with external_id=${payload.external_id} is in DB, skipping.`);
    return null;
  }

  try {
    const resp = await axios.post(
      'http://dev.thejamb.com/material/add-finishing-material',
      payload
    );
    return resp.data;
  } catch (error) {
    console.error('Error adding finishing material:', error);
    throw error;
  }
}

/* 
--------------------------------------------------------------------------------
HOW THE SEARCH FOR ALTERNATIVE (ANALOG) MATERIALS WILL WORK (recap from above)...

1) For each entry in `finishing_material_sections.json`,
   a) fetch the product from BigBox (supplierApi)
   b) check `product.variants` or `breadcrumbs` to find additional items
   c) optionally fetch them as well
   d) build payload, store to DB
--------------------------------------------------------------------------------
*/