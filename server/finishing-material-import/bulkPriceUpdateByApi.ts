/**
 * bulkPriceUpdateByApi.ts
 *
 * Reads a local phpMyAdmin export JSON, finds the "table" object named "material",
 * extracts its "data", then updates cost for each item in [from_id..to_id].
 *
 *  1) Parse bulkPriceUpdateRange.json => from_id..to_id, store_name, endpoint_url
 *  2) Parse material_cost.json => find {type:"table", name:"material"}.data => array of items
 *  3) For each item => fetch BigBox => POST /material/update-finishing-material-cost
 * // run npx ts-node -P tsconfig.server.json bulkPriceUpdateByApi.ts
 */

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '..', '..', '.env.local') });

interface BulkRangeConfig {
  from_id: number;
  to_id: number;
  store_name?: string;
  endpoint_url?: string;
}

interface MaterialItem {
  id: string;         // e.g. "1"
  external_id: string;// e.g. "203728679"
  name?: string;
  // ... any other fields
}

async function fetchProductFromBigBox(externalId: string, apiKey: string): Promise<any> {
  const BIGBOX_API_URL = 'https://api.bigboxapi.com/request';
  const resp = await axios.get(BIGBOX_API_URL, {
    params: {
      api_key: apiKey,
      type: 'product',
      item_id: externalId,
    },
  });
  return resp.data; // { product: {...} }
}

async function run() {
  // 1) Read bulkPriceUpdateRange.json
  const cfgPath = path.join(__dirname, 'bulkPriceUpdateRange.json');
  if (!fs.existsSync(cfgPath)) {
    console.error('Cannot find bulkPriceUpdateRange.json');
    process.exit(1);
  }
  const rawCfg = fs.readFileSync(cfgPath, 'utf8');
  const cfg = JSON.parse(rawCfg) as BulkRangeConfig;

  const fromId = cfg.from_id;
  const toId   = cfg.to_id;
  const storeName  = cfg.store_name || 'HD';
  const endpointUrl = cfg.endpoint_url || 'https://dev.thejamb.com/material/update-finishing-material-cost';

  console.log(`Will update cost for material.id in [${fromId}..${toId}] (store=${storeName})`);
  console.log(`Endpoint => ${endpointUrl}`);

  // 2) Read material_cost.json (phpMyAdmin export)
  const matPath = path.join(__dirname, 'material_cost.json');
  if (!fs.existsSync(matPath)) {
    console.error('Cannot find material_cost.json in ' + __dirname);
    process.exit(1);
  }

  const rawMat = fs.readFileSync(matPath, 'utf8');
  const allData = JSON.parse(rawMat); 
  // allData is probably an array with objects like {type:'header'}, {type:'database'}, {type:'table', name:'material', data:[...]}.

  // find the object that has the table "material"
  let tableObj: any = null;
  if (Array.isArray(allData)) {
    tableObj = allData.find((obj: any) => obj.type === 'table' && obj.name === 'material');
  }
  if (!tableObj || !Array.isArray(tableObj.data)) {
    console.error('Could not find tableObj with name="material" or .data is not an array');
    process.exit(1);
  }

  const materialData = tableObj.data as MaterialItem[];

  // 3) BigBox API Key
  const bigboxKey = process.env.API_SUPPLIER_KEY;
  if (!bigboxKey) {
    console.error('Missing API_SUPPLIER_KEY in .env');
    process.exit(1);
  }

  let updatedCount = 0;
  let skippedCount = 0;

  // 4) Loop over the relevant rows
  for (const mat of materialData) {
    const matId = parseInt(mat.id, 10);
    if (isNaN(matId)) {
      continue;
    }
    if (matId < fromId || matId > toId) {
      continue; // skip out of range
    }

    const externalId = mat.external_id;
    if (!externalId) {
      console.log(`ID=${matId}: missing external_id => skip`);
      skippedCount++;
      continue;
    }

    // fetch from BigBox
    let productData;
    try {
      const bigResp = await fetchProductFromBigBox(externalId, bigboxKey);
      productData = bigResp.product;
    } catch (err) {
      console.error(`Error fetching from BigBox for external_id=${externalId}`, err);
      skippedCount++;
      continue;
    }

    if (!productData || !productData.buybox_winner) {
      console.log(`No buybox_winner => skip ID=${matId}, extId=${externalId}`);
      skippedCount++;
      continue;
    }

    const newPrice = productData.buybox_winner.price;
    if (typeof newPrice !== 'number') {
      console.log(`Price not a valid number => skip ID=${matId}`);
      skippedCount++;
      continue;
    }

    console.log(`ID=${matId} => external_id=${externalId}, newPrice=${newPrice}`);

    // 5) POST to update-finishing-material-cost
    try {
      const resp = await axios.post(endpointUrl, {
        external_id: externalId,
        store_name: storeName,
        cost: newPrice
      });
      console.log('Update response =>', resp.data);
      updatedCount++;
    } catch (updateErr) {
      console.error(`Failed to update cost (ID=${matId}, externalId=${externalId})`, updateErr);
      skippedCount++;
    }
  }

  console.log(`\nAll done. Updated=${updatedCount}, Skipped=${skippedCount}`);
}

run().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});