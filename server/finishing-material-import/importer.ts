/**
 * importer.ts
 *
 * Comments in English only:
 *  - This script reads finishing_material_sections.json
 *  - For each material (by external_id) it requests BigBox API (type=product)
 *  - Adds to the database (via addFinishingMaterialToDb) if it's not in the DB yet
 *  - Also processes up to 10 variants (other `item_id` values)
 *  - Uses a local file progress.json so we don't restart from the beginning
 *  - To stop the script, press Ctrl + C
 *  - To restart the script: npx ts-node -P tsconfig.server.json importer.ts
 */

import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '..', '..', '.env.local') });

import { fetchProduct } from './supplierApi';
import { buildFinishingMaterialPayload, addFinishingMaterialToDb } from './finishingMaterialService';
import { ExtendedProduct } from './types';

// 1) Read the main JSON with materials
import finishingMaterialSections from './finishing_material_sections.json';

// 2) Interfaces for items in finishing_material_sections
interface FinishingMaterialSectionItem {
  id: string;
  material_external_id: string;
  material_name: string;
  work_code: string;
  section: string;
}

// Extract the data part from the JSON file
const dataArray: FinishingMaterialSectionItem[] = finishingMaterialSections.data;

// 3) Create a file/object to track progress so we can resume from where we left off
//    progress.json might look like: { "processed": { "203728679": true, ... } }
const PROGRESS_FILE_PATH = path.join(__dirname, 'progress.json');
let progressData: { processed: Record<string, boolean> } = { processed: {} };

// Read progress from file, if it exists
if (fs.existsSync(PROGRESS_FILE_PATH)) {
  const raw = fs.readFileSync(PROGRESS_FILE_PATH, 'utf-8');
  progressData = JSON.parse(raw);
}

// Helper to save progress after each item
function saveProgress() {
  fs.writeFileSync(PROGRESS_FILE_PATH, JSON.stringify(progressData, null, 2));
  console.log('Progress saved.');
}

/**
 * Process one main material from finishing_material_sections
 * 1) Fetch product from BigBox
 * 2) Add main product to DB (if new)
 * 3) For each variant, fetch, add if new
 */
async function processOneMaterial(item: FinishingMaterialSectionItem) {
  console.log(`\n=== Processing main externalId=${item.material_external_id} work_code=${item.work_code} section=${item.section} ===`);

  // 1) Fetch main product
  const mainResponse = await fetchProduct(item.material_external_id);
  const mainProduct = mainResponse.product as ExtendedProduct;
  if (!mainProduct) {
    console.warn(`No product info for externalId=${item.material_external_id}. Skipping...`);
    return;
  }

  // 2) Build payload for the main product
  const mainPayload = buildFinishingMaterialPayload(
    parseInt(item.section, 10),
    item.material_external_id,
    item.work_code,
    mainProduct
  );

  // 3) Add to DB
  try {
    const mainResult = await addFinishingMaterialToDb(mainPayload);
    console.log(`Main product [${item.material_external_id}] added result:`, mainResult);
  } catch (err) {
    console.error(`Error while adding main externalId=${item.material_external_id}`, err);
  }

  // 4) If "variants" exist, process them
  // BigBox response might have e.g. (mainProduct as any).variants
  const variants = (mainProduct as any).variants;
  if (Array.isArray(variants)) {
    const upTo10 = variants.slice(0, 10); // limit to 10
    for (const variant of upTo10) {
      if (!variant.item_id) {
        console.warn('Variant missing item_id, skipping...');
        continue;
      }
      console.log(`   > Processing variant item_id=${variant.item_id} ...`);

      // fetch variant
      const variantResp = await fetchProduct(variant.item_id);
      const variantProduct = variantResp.product as ExtendedProduct;
      if (!variantProduct) {
        console.warn(`No product info for variant item_id=${variant.item_id}, skipping...`);
        continue;
      }

      // build payload (reuse the same work_code, section from the main item or define your own logic)
      const variantPayload = buildFinishingMaterialPayload(
        parseInt(item.section, 10),
        variant.item_id,
        item.work_code,
        variantProduct
      );
      // add to DB
      try {
        const variantResult = await addFinishingMaterialToDb(variantPayload);
        console.log(`   > Variant [${variant.item_id}] result:`, variantResult);
      } catch (err) {
        console.error(`Error while adding variant item_id=${variant.item_id}`, err);
      }
    }
  } else {
    console.log('No variants found in mainProduct.variants, skipping...');
  }
}

/**
 * Main orchestrator: loop over each item in finishing_material_sections.json
 * + skip items already processed (according to progressData)
 */
async function runImport() {
  for (const item of dataArray) {
    const extId = item.material_external_id;
    // check progress
    if (progressData.processed[extId]) {
      console.log(`Skipping externalId=${extId}, already processed previously.`);
      continue;
    }

    try {
      // process the item
      await processOneMaterial(item);

      // mark as processed
      progressData.processed[extId] = true;
      saveProgress();

    } catch (err) {
      console.error(`Error while processing externalId=${extId}`, err);
      // If you want to STOP on error, you can do:
      // break;
      // Or if you want to skip and continue next, just do nothing
    }
  }
  console.log('\nAll done with test run.');
}

runImport().catch(err => {
  console.error('Unhandled error in runImport:', err);
});