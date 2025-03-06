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

/**
 * Структура, которую храним в progress.json
 * (ничего из старого не удаляем, только добавляем 2 поля)
 */
interface ProgressData {
  processed: Record<string, boolean>;                     // Уже обработанные itemId
  photosBySubcategory: Record<string, number>;           // Счётчик скачанных фото на subcategory

  // --- NEW FIELDS for resuming pagination ---
  /**
   * lastPageBySubcategory[subcat] = номер последней УСПЕШНО обработанной страницы.
   * При новом запуске начнём со следующей.
   */
  lastPageBySubcategory: Record<string, number>;

  /**
   * seenItemIdsBySubcategory[subcat] = массив itemId, которые уже встречались на всех предыдущих страницах
   * (нужно, чтобы не качать заново дубликаты при возобновлении)
   */
  seenItemIdsBySubcategory: Record<string, string[]>;
}

// Путь до progress.json
const progressPath = path.join(__dirname, 'progress.json');

// Если progress.json уже есть, грузим оттуда. Если нет — используем дефолтную структуру
let progressData: ProgressData = {
  processed: {},
  photosBySubcategory: {},

  // по умолчанию пустые объекты
  lastPageBySubcategory: {},
  seenItemIdsBySubcategory: {},
};

if (fs.existsSync(progressPath)) {
  const raw = fs.readFileSync(progressPath, 'utf-8');
  progressData = JSON.parse(raw);
  console.log('Loaded existing progress from progress.json');
}

// Удобная функция для сохранения
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
  timeout: 60000, // 60s
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

// ------------------------------------------------
// Build next-page URL with Nao (offset-based)
// ------------------------------------------------
function buildNextPageUrlNao(baseUrl: string, page: number, itemsPerPage = 24): string {
  const offset = itemsPerPage * (page - 1);
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}Nao=${offset}`;
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

      try {
        // -----------------------------------------------------
        // 1) Определяем, с какой страницы начинаем
        // Если в progress.json уже что-то есть, начинаем со (lastPage + 1),
        // иначе — с 1-й
        // -----------------------------------------------------
        const lastProcessedPage = progressData.lastPageBySubcategory[subcategory] || 0;
        let currentPage = lastProcessedPage === 0 ? 1 : lastProcessedPage + 1;

        // Инициализируем (или восстанавливаем) Set `seenItemIds`
        // Если там уже что-то было, берем из progress.json
        const existingSeenArr = progressData.seenItemIdsBySubcategory[subcategory] || [];
        const seenItemIds = new Set<string>(existingSeenArr);

        // -----------------------------------------------------
        // Будем ограничивать общее число страниц
        // -----------------------------------------------------
        const MAX_PAGES = 50; // или любое другое число, чтобы не ходить бесконечно

        // Цикл, пока не достигнем MAX_PAGES или 1000 фото
        while (true) {
          // Если субкатегория уже добрала 1000 картинок
          if ((progressData.photosBySubcategory[subcategory] || 0) >= MAX_PHOTOS_PER_SUBCATEGORY) {
            console.log(`Reached 1000 images in subcategory="${subcategory}". Stop pagination.`);
            break;
          }

          // Если вышли за пределы MAX_PAGES
          if (currentPage > MAX_PAGES) {
            console.log(`Reached ${MAX_PAGES} pages for "${subcategory}". Stopping pagination.`);
            break;
          }

          // Сформируем ссылку. Если currentPage=1, берём исходный breadcrumbUrl (без ?Nao=)
          let pageUrl: string;
          if (currentPage === 1) {
            pageUrl = breadcrumbUrl;
          } else {
            // всё что выше 1, используем buildNextPageUrlNao
            pageUrl = buildNextPageUrlNao(breadcrumbUrl, currentPage, 24);
          }

          console.log(`\nFetching page ${currentPage} for subcategory="${subcategory}" => URL: ${pageUrl}`);

          // Попробуем загрузить товары на странице
          let pageResults: Array<{ product?: { item_id?: string } }> = [];
          let success = false;
          const maxRetries = 3;

          for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
              const resp = await fetchItemsFromBreadcrumb(pageUrl, 'category');
              pageResults = resp.category_results || resp.search_results || [];
              success = true;
              break;
            } catch (err: any) {
              if (err.code === 'ECONNABORTED') {
                console.warn(`Timeout on page ${currentPage}, attempt ${attempt}, subcat="${subcategory}". Retrying...`);
              } else {
                console.error(`Error on page ${currentPage}, attempt ${attempt}`, err);
              }
            }
          }

          if (!success) {
            console.log(
              `Could not fetch page ${currentPage} after ${maxRetries} attempts. Stopping pagination for "${subcategory}".`
            );
            break;
          }

          // Если товаров 0 => похоже, страниц больше нет
          if (pageResults.length === 0) {
            console.log(`No more items found on page ${currentPage}. Stopping pagination for "${subcategory}".`);
            break;
          }

          console.log(`Found ${pageResults.length} items on page ${currentPage}.`);

          // ----------------------------------------------
          // 2) "На лету" обрабатываем товары этой страницы
          // ----------------------------------------------
          await processPageItems(pageResults, topLevelCategory, subcategory, seenItemIds);

          // После обработки текущей страницы:
          // - Сохраним currentPage как "lastPageBySubcategory[subcat]"
          progressData.lastPageBySubcategory[subcategory] = currentPage;
          // - Обновим массив seenItemIdsBySubcategory[subcat]
          progressData.seenItemIdsBySubcategory[subcategory] = Array.from(seenItemIds);
          saveProgress();

          // Если по ходу достигли 1000 — прекращаем сразу
          if ((progressData.photosBySubcategory[subcategory] || 0) >= MAX_PHOTOS_PER_SUBCATEGORY) {
            console.log(`Reached 1000 images in subcategory="${subcategory}" mid-pagination. Break now.`);
            break;
          }

          // Переходим к следующей странице
          currentPage++;
        }

      } catch (catErr) {
        console.error(`Error fetching subcategory="${subcategory}"`, catErr);
      }
    }
  }

  console.log('\nAll done!');
}

/**
 * processPageItems - обрабатывает "товары" конкретной страницы (скачивает картинки)
 * @param pageItems
 * @param topLevelCategory
 * @param subcategory
 * @param seenItemIds - Set всех itemId, которые мы уже видели в рамках этой subcategory
 */
async function processPageItems(
  pageItems: Array<{ product?: { item_id?: string } }>,
  topLevelCategory: string,
  subcategory: string,
  seenItemIds: Set<string>,
) {
  let itemIndex = 0;

  for (const r of pageItems) {
    itemIndex++;
    const itemId = r.product?.item_id;
    if (!itemId) continue;

    // Проверка: вдруг этот itemId уже встречался
    if (seenItemIds.has(itemId)) {
      // Дубликат, пропустим
      console.log(`[PAGE] itemIndex=${itemIndex}, itemId=${itemId} is already in seenItemIds. Skipping.`);
      continue;
    }

    // Добавляем его в set, чтобы не взять повторно на следующей странице
    seenItemIds.add(itemId);

    // Если мы уже обработали этот itemId (т.е. скачали картинки) раньше
    if (progressData.processed[itemId]) {
      console.log(`[PAGE] itemIndex=${itemIndex} itemId=${itemId} already processed. Skipping.`);
      continue;
    }

    // Если subcategory уже на 1000
    const currentPhotoCount = progressData.photosBySubcategory[subcategory] || 0;
    if (currentPhotoCount >= MAX_PHOTOS_PER_SUBCATEGORY) {
      console.log(`Reached 1000 images in subcategory="${subcategory}". Exiting processPageItems.`);
      return;
    }

    console.log(`[PAGE] itemIndex=${itemIndex}, itemId=${itemId}`);

    try {
      // Fetch product details
      const productResp = await fetchProductDetails(itemId);
      const product = productResp.product;
      if (!product) {
        console.warn(`No product info for itemId=${itemId}. Skipping...`);
        continue;
      }

      const images = product.images || [];
      // Выбираем "primary" или "image_left_view"
      let selectedImages = images.filter((img) => img.type === 'primary' || img.type === 'image_left_view');

      const subcatCountSoFar = progressData.photosBySubcategory[subcategory] || 0;
      const canTake = MAX_PHOTOS_PER_SUBCATEGORY - subcatCountSoFar;
      if (canTake <= 0) {
        console.log(`Subcategory="${subcategory}" is at or above 1000 images. Stopping...`);
        return;
      }
      if (selectedImages.length > canTake) {
        selectedImages = selectedImages.slice(0, canTake);
      }

      if (selectedImages.length === 0) {
        console.warn(`No matching images for itemId=${itemId}. Skipping...`);
        continue;
      }

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

          const newCount = progressData.photosBySubcategory[subcategory];
          if (newCount >= MAX_PHOTOS_PER_SUBCATEGORY) {
            console.log(`Reached 1000 images in subcategory="${subcategory}" after itemId=${itemId}.`);
            break;
          }
        } catch (imgErr) {
          console.error(`Error downloading/uploading image #${imgIndex} for itemId=${itemId}`, imgErr);
        }
      }

      // Mark item as processed
      progressData.processed[itemId] = true;
      saveProgress();

      // Если по ходу загрузки достигли 1000
      if ((progressData.photosBySubcategory[subcategory] || 0) >= MAX_PHOTOS_PER_SUBCATEGORY) {
        console.log(`Hit 1000-limit in subcategory="${subcategory}". Stopping item loop.`);
        return; // выходим из processPageItems
      }
    } catch (prodErr) {
      console.error(`Error fetching product details for itemId=${itemId}`, prodErr);
    }
  }
}

// Запуск
runUniversalImageDownload().catch((err) => {
  console.error('Unhandled error in runUniversalImageDownload:', err);
});