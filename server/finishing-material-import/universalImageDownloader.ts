// Usage:
//   npx ts-node --project tsconfig.server.json universalImageDownloader.ts

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';
import { Storage } from '@google-cloud/storage';

// ------------------------------
// 1) Load environment variables
// ------------------------------
dotenv.config({
  path: path.join(__dirname, '..', '..', '.env.local'),
});

// ------------------------------
// 2) GCS Bucket Setup
// ------------------------------
const BUCKET_NAME = process.env.GCP_BUCKET_NAME || 'jamb-dataset';
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL || '',
    private_key: (process.env.GCP_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  },
});

// ------------------------------
// 3) Progress / Limit Setup
// ------------------------------
// We'll keep a global limit of 1000 images per subcategory
const MAX_PHOTOS_PER_SUBCATEGORY = 1000;

// We'll read progress.json (same folder) for processed items
// Structure example:
// {
//   "processed": { "304698228": true, "304998497": true, ... },
//   "photosBySubcategory": { "Carpet": 123, "Carpet_Pad": 50, ... }
// }
interface ProgressData {
  processed: Record<string, boolean>;        
  photosBySubcategory: Record<string, number>;
}

const progressPath = path.join(__dirname, 'progress.json');
let progressData: ProgressData = {
  processed: {},
  photosBySubcategory: {},
};

if (fs.existsSync(progressPath)) {
  const raw = fs.readFileSync(progressPath, 'utf-8');
  progressData = JSON.parse(raw);
  console.log('Loaded existing progress from progress.json');
}

function saveProgress() {
  fs.writeFileSync(progressPath, JSON.stringify(progressData, null, 2), 'utf-8');
  console.log('Progress saved to progress.json');
}

// ------------------------------
// 4) BigBox interfaces & axios
// ------------------------------
interface SubcategoryEntry {
  subcategory: string;
  breadcrumbUrl: string;
}

interface FinishingBreadcrumbs {
  [topLevelCategory: string]: SubcategoryEntry[];
}

interface CategoryResponse {
  category_results?: Array<{
    product?: {
      item_id?: string;
    };
  }>;
  search_results?: Array<{
    product?: {
      item_id?: string;
    };
  }>;
}

interface ProductResponse {
  product?: {
    item_id?: string;
    images?: Array<{
      link: string;
      type?: string;
    }>;
  };
}

const BIGBOX_API_URL = 'https://api.bigboxapi.com/request';
const bigboxClient = axios.create({
  baseURL: BIGBOX_API_URL,
  timeout: 30000,
});

// ------------------------------
// 5) BigBox helper functions
// ------------------------------
function getBigBoxApiKeyOrThrow(): string {
  const key = process.env.API_SUPPLIER_KEY;
  if (!key) {
    throw new Error('Missing BigBox API key. Set API_SUPPLIER_KEY in your .env.');
  }
  return key;
}

async function fetchItemsFromBreadcrumb(
  hdUrl: string,
  requestType: 'category' | 'search' = 'category'
): Promise<CategoryResponse> {
  const apiKey = getBigBoxApiKeyOrThrow();
  const response = await bigboxClient.get<CategoryResponse>('', {
    params: {
      api_key: apiKey,
      type: requestType,
      url: hdUrl,
    },
  });
  return response.data;
}

async function fetchProductDetails(itemId: string): Promise<ProductResponse> {
  const apiKey = getBigBoxApiKeyOrThrow();
  const response = await bigboxClient.get<ProductResponse>('', {
    params: {
      api_key: apiKey,
      type: 'product',
      item_id: itemId,
    },
  });
  return response.data;
}

// ------------------------------
// 6) Image download & upload
// ------------------------------
async function downloadImageAsBuffer(imageUrl: string): Promise<Buffer> {
  const resp = await axios.get<ArrayBuffer>(imageUrl, { responseType: 'arraybuffer' });
  return Buffer.from(resp.data);
}

async function uploadBufferToGCS(destinationPath: string, buffer: Buffer) {
  const bucket = storage.bucket(BUCKET_NAME);
  const file = bucket.file(destinationPath);

  await file.save(buffer, {
    contentType: 'image/jpeg',
    resumable: false,
  });

  console.log(`Uploaded to gs://${BUCKET_NAME}/${destinationPath}`);
}

// ------------------------------
// 7) Main logic
// ------------------------------
async function runUniversalImageDownload() {
  // A) Read finishing_breadcrumbs.json
  const jsonPath = path.join(__dirname, 'finishing_breadcrumbs.json');
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`finishing_breadcrumbs.json not found at: ${jsonPath}`);
  }
  const raw = fs.readFileSync(jsonPath, 'utf-8');
  const finishingData: FinishingBreadcrumbs = JSON.parse(raw);

  // B) For each top-level category
  const topLevelCategories = Object.keys(finishingData);

  for (const topLevelCategory of topLevelCategories) {
    const subcategories = finishingData[topLevelCategory];
    console.log(`\n===== Processing top-level category: "${topLevelCategory}" =====\n`);

    // C) For each subcategory
    for (const entry of subcategories) {
      const { subcategory, breadcrumbUrl } = entry;

      // If the breadcrumbUrl is empty, skip
      if (!breadcrumbUrl) {
        console.warn(`Skipping subcategory "${subcategory}" because breadcrumbUrl is empty.`);
        continue;
      }

      // Check how many images we already have for this subcategory
      const alreadyCount = progressData.photosBySubcategory[subcategory] || 0;
      if (alreadyCount >= MAX_PHOTOS_PER_SUBCATEGORY) {
        console.log(`Subcategory="${subcategory}" already has ${alreadyCount} images. Skipping...`);
        continue;
      }

      console.log(`\n--> Subcategory: "${subcategory}", URL: ${breadcrumbUrl}`);

      // D) Fetch items from BigBox
      try {
        const categoryResp = await fetchItemsFromBreadcrumb(breadcrumbUrl, 'category');
        let results = categoryResp.category_results || categoryResp.search_results || [];

        console.log(`Found ${results.length} items for subcategory="${subcategory}"`);

        // E) Iterate items
        let itemIndex = 0;
        for (const r of results) {
          itemIndex++;
          const itemId = r.product?.item_id;
          if (!itemId) continue;

          // If we already processed this item, skip
          if (progressData.processed[itemId]) {
            console.log(`   [${itemIndex}/${results.length}] itemId=${itemId} already processed. Skipping.`);
            continue;
          }

          // If subcategory is at limit, break
          const currentPhotoCount = progressData.photosBySubcategory[subcategory] || 0;
          if (currentPhotoCount >= MAX_PHOTOS_PER_SUBCATEGORY) {
            console.log(`Reached 1000 images in subcategory="${subcategory}". Moving on...`);
            break;
          }

          console.log(`   [${itemIndex}/${results.length}] itemId = ${itemId}`);

          try {
            // F) Fetch product details
            const productResp = await fetchProductDetails(itemId);
            const product = productResp.product;
            if (!product) {
              console.warn(`No product info for itemId=${itemId}. Skipping...`);
              continue;
            }

            // Filter images to "primary" or "image_left_view"
            const images = product.images || [];
            let selectedImages = images.filter(img =>
              img.type === 'primary' || img.type === 'image_left_view'
            );

            const subcatCountSoFar = progressData.photosBySubcategory[subcategory] || 0;
            const canTake = MAX_PHOTOS_PER_SUBCATEGORY - subcatCountSoFar;
            if (canTake <= 0) {
              console.log(`Subcategory="${subcategory}" is at or above 1000 images. Stopping...`);
              break;
            }
            if (selectedImages.length > canTake) {
              selectedImages = selectedImages.slice(0, canTake);
            }

            if (selectedImages.length === 0) {
              console.warn(`No matching images for itemId=${itemId}. Skipping...`);
              continue;
            }

            // G) Download & upload each selected image
            let imgIndex = 0;
            for (const img of selectedImages) {
              if (!img.link) continue;
              imgIndex++;

              try {
                const imageBuffer = await downloadImageAsBuffer(img.link);

                // GCS path
                const folderPath = `${topLevelCategory}/${subcategory}`;
                const fileName = `${itemId}-${imgIndex}.jpg`;
                const destinationPath = `${folderPath}/${fileName}`;

                // Upload only to GCS
                await uploadBufferToGCS(destinationPath, imageBuffer);

                // Update photo count
                progressData.photosBySubcategory[subcategory] =
                  (progressData.photosBySubcategory[subcategory] || 0) + 1;
                saveProgress();

                // If we reached 1000 for this subcategory, break
                const newCount = progressData.photosBySubcategory[subcategory];
                if (newCount >= MAX_PHOTOS_PER_SUBCATEGORY) {
                  console.log(`Reached 1000 images in subcategory="${subcategory}" after itemId=${itemId}.`);
                  break;
                }
              } catch (imgErr) {
                console.error(`Error downloading/uploading image #${imgIndex} for itemId=${itemId}`, imgErr);
              }
            }

            // Mark this item as processed
            progressData.processed[itemId] = true;
            saveProgress();

            // If subcategory hit 1000 mid-item
            if ((progressData.photosBySubcategory[subcategory] || 0) >= MAX_PHOTOS_PER_SUBCATEGORY) {
              console.log(`Hit 1000-limit in subcategory="${subcategory}". Stopping item loop.`);
              break;
            }
          } catch (prodErr) {
            console.error(`Error fetching product details for itemId=${itemId}`, prodErr);
          }
        } // end items
      } catch (catErr) {
        console.error(`Error fetching subcategory="${subcategory}"`, catErr);
      }
    }
  }

  console.log('\nAll done!');
}

// Execute main
runUniversalImageDownload().catch(err => {
  console.error('Unhandled error in runUniversalImageDownload:', err);
});