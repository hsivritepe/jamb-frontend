// finishingMaterialService.ts

import axios from 'axios';
import { FinishingMaterialPayload, ExtendedProduct } from './types'; 

/**
 * OPTIONAL: Check if finishing material with external_id is already in DB.
 * For now, it's a stub returning false. You can adapt it.
 */
async function materialExistsInDb(externalId: string): Promise<boolean> {
  // For example, you could do:
  // const resp = await axios.get(`http://dev.thejamb.com/material/check-exists?external_id=${externalId}`);
  // return resp.data.exists;
  return false;
}

/**
 * Attempt to parse quantity (pack size, coverage, gallons, etc.) from product title
 * using various regex heuristics.
 */
function guessPackageQuantityFromTitle(title: string): number {
  if (!title) return 1;
  const t = title.toLowerCase();

  // (A) e.g. "3-Pack" or "2 pack"
  // captures e.g. 3.0 or 2
  const packRegex = /\b(\d+(\.\d+)?)\s*-\s*pack|\b(\d+(\.\d+)?)\s*pack\b/;
  let m = packRegex.exec(t);
  if (m) {
    const numberPart = m[1] || m[3];
    if (numberPart) {
      const n = parseFloat(numberPart);
      if (!isNaN(n)) return n;
    }
  }

  // (B) e.g. "X-Count" => 25-count => 25
  const countRegex = /\b(\d+(\.\d+)?)\s*-\s*count|\b(\d+(\.\d+)?)\s*count\b/;
  m = countRegex.exec(t);
  if (m) {
    const numStr = m[1] || m[3];
    if (numStr) {
      const n = parseFloat(numStr);
      if (!isNaN(n)) return n;
    }
  }

  // (C) e.g. "5 gal" => 5
  const galRegex = /\b(\d+(\.\d+)?)\s*gal\b/;
  m = galRegex.exec(t);
  if (m) {
    const n = parseFloat(m[1]);
    if (!isNaN(n)) return n;
  }

  // (D) e.g. "3 ft. x 100 ft." => 300
  //   or "24 in. x 50 ft." => 2 ft * 50 ft => 100
  const dimensionRegex = /(\d+(\.\d+)?)(in|ft)\s*x\s*(\d+(\.\d+)?)(in|ft)/;
  m = dimensionRegex.exec(t);
  if (m) {
    let val1 = parseFloat(m[1]);
    const unit1 = m[3];
    let val2 = parseFloat(m[4]);
    const unit2 = m[6];
    if (!isNaN(val1) && !isNaN(val2)) {
      if (unit1 === 'in') val1 /= 12; // convert in -> ft
      if (unit2 === 'in') val2 /= 12;
      const area = val1 * val2;
      if (area > 0) return area;
    }
  }

  // (E) e.g. "12 ft." => 12
  const singleFtRegex = /(\d+(\.\d+)?)\s*ft\b/;
  m = singleFtRegex.exec(t);
  if (m) {
    const ftVal = parseFloat(m[1]);
    if (!isNaN(ftVal) && ftVal > 0) return ftVal;
  }

  // (F) e.g. "24 in" => 2
  const singleInRegex = /(\d+(\.\d+)?)\s*in\b/;
  m = singleInRegex.exec(t);
  if (m) {
    const inVal = parseFloat(m[1]);
    if (!isNaN(inVal) && inVal > 0) return inVal / 12;
  }

  // Fallback
  return 1;
}

/**
 * Helper to parse quantity_in_packaging from product data.
 *  1) If buybox_winner.unit is "each" or "box" => return 1
 *  2) If we have "specifications" => parse container size, area coverage, etc.
 *  3) If still unknown => parse product.title with guessPackageQuantityFromTitle()
 *  4) Default fallback => 1
 */
function determineQuantityInPackaging(product: ExtendedProduct): number {
  if (!product) return 1;

  // (1) Check if buybox unit is "each" or "box"
  const unitLower = product.buybox_winner?.unit?.toLowerCase() || '';
  if (['each', 'box'].includes(unitLower)) {
    return 1;
  }

  let fromSpecs: number | null = null;

  // (2) Check specifications
  if (Array.isArray(product.specifications)) {
    for (const spec of product.specifications) {
      if (!spec.name || !spec.value) continue;

      const lowerName = spec.name.toLowerCase();
      const val = spec.value;

      // e.g. "Area Coverage Per Roll: 72" => parseFloat
      if (lowerName.includes('area coverage')) {
        const numeric = parseFloat(val);
        if (!isNaN(numeric)) {
          fromSpecs = numeric;
          break;
        }
      }

      // e.g. "Container Size: 5 Gallon" => parse out 5
      if (lowerName.includes('container size')) {
        const match = val.match(/(\d+(\.\d+)?)/);
        if (match) {
          const parsed = parseFloat(match[0]);
          if (!isNaN(parsed)) {
            fromSpecs = parsed;
            break;
          }
        }
      }
    }
  }

  if (typeof fromSpecs === 'number') {
    return fromSpecs;
  }

  // (3) Parse from product.title
  const fromTitle = guessPackageQuantityFromTitle(product.title || '');
  if (fromTitle > 1) {
    return fromTitle;
  }

  // (4) Default
  return 1;
}

/**
 * Build the payload to send to /material/add-finishing-material.
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
HOW THE SEARCH FOR ALTERNATIVE (ANALOG) MATERIALS WILL WORK (recap)...

1) For each entry in `finishing_material_sections.json`,
   a) fetch the product from BigBox (supplierApi)
   b) check `product.variants` or `breadcrumbs` to find additional items
   c) optionally fetch them as well
   d) build payload, store to DB
--------------------------------------------------------------------------------
*/