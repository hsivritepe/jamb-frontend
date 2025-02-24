/**
 * bulkPriceUpdateByApi.ts
 *
 * This script iterates over a range of material_id from "bulkPriceUpdateRange.json",
 * does the following for each:
 *   1) Find external_id in "material"
 *   2) Fetch latest price from BigBox (using API_SUPPLIER_KEY from env)
 *   3) POST to existing endpoint /material/update-finishing-material-cost with { external_id, cost }
 *
 * Usage:
 *   npx ts-node -P tsconfig.server.json bulkPriceUpdateByApi.ts
 */

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables from .env.local (optional; depends on your structure)
dotenv.config({ path: path.join(__dirname, '..', '..', '.env.local') });

interface BulkRangeConfig {
  from_id: number;
  to_id: number;
  store_name?: string;
  endpoint_url?: string;
}

async function fetchProductFromBigBox(externalId: string, apiKey: string): Promise<any> {
  const BIGBOX_API_URL = 'https://api.bigboxapi.com/request';
  return axios.get(BIGBOX_API_URL, {
    params: {
      api_key: apiKey,
      type: 'product',
      item_id: externalId,
    },
  }).then(resp => resp.data);
}

async function run() {
  // 1) Read minimal config from JSON
  const cfgPath = path.join(__dirname, 'bulkPriceUpdateRange.json');
  if (!fs.existsSync(cfgPath)) {
    console.error(`Cannot find "bulkPriceUpdateRange.json" in ${__dirname}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(cfgPath, 'utf8');
  const cfg = JSON.parse(raw) as BulkRangeConfig;

  const fromId = cfg.from_id;
  const toId   = cfg.to_id;
  const storeName  = cfg.store_name || 'HD';
  const endpointUrl = cfg.endpoint_url || 'https://dev.thejamb.com/material/update-finishing-material-cost';

  // 2) Load DB creds & BigBox key from ENV
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbUser = process.env.DB_USER || 'root';
  const dbPass = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_DATABASE || 'jamb';

  const bigboxKey = process.env.API_SUPPLIER_KEY;
  if (!bigboxKey) {
    console.error('Missing API_SUPPLIER_KEY in environment');
    process.exit(1);
  }

  console.log(`Will process material_id in [${fromId}..${toId}] with store="${storeName}"`);
  console.log(`DB connection: host=${dbHost}, user=${dbUser}, database=${dbName}`);
  console.log(`Endpoint: ${endpointUrl}`);

  // 3) Connect to DB
  const conn = await mysql.createConnection({
    host: dbHost,
    user: dbUser,
    password: dbPass,
    database: dbName
  });

  let updatedCount = 0;
  let skippedCount = 0;

  // 4) Loop over the range
  for (let matId = fromId; matId <= toId; matId++) {
    // a) find external_id
    const [rows] = await conn.execute(
      'SELECT external_id FROM material WHERE id = ? LIMIT 1',
      [matId]
    ) as any[];

    if (!rows || rows.length === 0) {
      console.warn(`material_id=${matId} not found in "material", skipping`);
      skippedCount++;
      continue;
    }

    const externalId = rows[0].external_id;
    if (!externalId) {
      console.warn(`material_id=${matId} => external_id is NULL, skipping`);
      skippedCount++;
      continue;
    }

    // b) fetch from BigBox => get price
    let productData;
    try {
      const productResp = await fetchProductFromBigBox(externalId, bigboxKey);
      productData = productResp.product;
    } catch (err) {
      console.error(`Failed BigBox for externalId=${externalId}`, err);
      skippedCount++;
      continue;
    }

    if (!productData || !productData.buybox_winner) {
      console.warn(`No buybox_winner for externalId=${externalId}, skip`);
      skippedCount++;
      continue;
    }

    const newPrice = productData.buybox_winner.price;
    if (typeof newPrice !== 'number') {
      console.warn(`Price is not a valid number for externalId=${externalId}`);
      skippedCount++;
      continue;
    }

    console.log(`material_id=${matId}, externalId=${externalId}, newPrice=${newPrice}`);

    // c) call your existing endpoint with { external_id, store_name, cost }
    try {
      const updateResp = await axios.post(endpointUrl, {
        external_id: externalId,
        store_name: storeName,
        cost: newPrice
      });
      console.log('Update response:', updateResp.data);
      updatedCount++;
    } catch (err) {
      console.error(`Failed to update cost for externalId=${externalId}`, err);
      skippedCount++;
    }
  }

  await conn.end();
  console.log(`\nDone. Updated: ${updatedCount}, Skipped: ${skippedCount}\n`);
}

run().catch(err => {
  console.error('Unhandled error in run:', err);
  process.exit(1);
});