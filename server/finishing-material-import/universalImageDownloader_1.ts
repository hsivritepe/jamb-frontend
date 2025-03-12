//
// universalImageDownloader_1.ts
//
// Usage (из той же директории):
//   npx ts-node --project tsconfig.server.json universalImageDownloader_1.ts
//

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';
import { Storage } from '@google-cloud/storage';

/**
 * 1) Загружаем переменные окружения
 */
dotenv.config({
  // При необходимости замените путь на свой (если .env.local лежит в другом месте)
  path: path.join(__dirname, '..', '..', '.env.local'),
});

/**
 * 2) Настраиваем GCS Bucket
 */
const BUCKET_NAME = process.env.GCP_BUCKET_NAME || 'jamb-dataset';
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL || '',
    private_key: (process.env.GCP_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  },
});

/**
 * 3) Общие константы
 */
const MAX_PHOTOS_PER_SUBCATEGORY = 1000;
const MAX_PAGES = 50; // Чтобы не парсить слишком глубоко (ограничение по страницам)

/**
 * 4) Интерфейсы: что мы храним в progress_1.json
 */
interface ProgressData {
  processed: Record<string, boolean>;                     // Уже обработанные itemId (глобально)
  photosBySubcategory: Record<string, number>;           // Счётчик скачанных фото для каждой subcategory
  lastPageBySubcategory: Record<string, number>;         // На какой странице остановились для subcategory
  seenItemIdsBySubcategory: Record<string, string[]>;    // Какие itemId уже попадались в subcategory
}

/**
 * 5) Путь к новому файлу прогресса progress_1.json
 */
const progressPath = path.join(__dirname, 'progress_1.json');

/**
 * Начальное (пустое) состояние, если progress_1.json нет
 */
let progressData: ProgressData = {
  processed: {},
  photosBySubcategory: {},
  lastPageBySubcategory: {},
  seenItemIdsBySubcategory: {},
};

/**
 * Если progress_1.json существует, загружаем его
 */
if (fs.existsSync(progressPath)) {
  const raw = fs.readFileSync(progressPath, 'utf-8');
  progressData = JSON.parse(raw);
  console.log('Loaded existing progress from progress_1.json');
}

/**
 * Удобная функция для сохранения прогресса
 */
function saveProgress() {
  fs.writeFileSync(progressPath, JSON.stringify(progressData, null, 2), 'utf-8');
  console.log('Progress saved to progress_1.json');
}

/**
 * 6) Интерфейс данных для нашего массива finishing_breadcrumbs_1.json
 */
interface SubcategoryEntry {
  subcategory: string;
  breadcrumbUrl: string;
}

/**
 * 7) Вспомогательные функции для запросов к BigBox API
 */
const BIGBOX_API_URL = 'https://api.bigboxapi.com/request';
const bigboxClient = axios.create({
  baseURL: BIGBOX_API_URL,
  timeout: 60000, // 60 секунд таймаут
});

/**
 * Возвращает BigBox API key из переменной окружения (или выбрасывает ошибку, если не найден)
 */
function getBigBoxApiKeyOrThrow(): string {
  const key = process.env.API_SUPPLIER_KEY;
  if (!key) {
    throw new Error('Missing BigBox API key. Set API_SUPPLIER_KEY in your .env.');
  }
  return key;
}

/**
 * Функция fetchItemsFromBreadcrumb загружает товары по ссылке (breadcrumbUrl)
 * с помощью BigBox API (type=category или type=search — по умолчанию category).
 */
interface CategoryResponse {
  category_results?: Array<{ product?: { item_id?: string } }>;
  search_results?: Array<{ product?: { item_id?: string } }>;
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

/**
 * Функция fetchProductDetails загружает детали конкретного товара по itemId
 */
interface ProductResponse {
  product?: {
    item_id?: string;
    images?: Array<{
      link: string;
      type?: string;
    }>;
  };
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

/**
 * 8) Загрузка изображения как Buffer, чтобы затем положить в GCS
 */
async function downloadImageAsBuffer(imageUrl: string): Promise<Buffer> {
  const resp = await axios.get<ArrayBuffer>(imageUrl, { responseType: 'arraybuffer' });
  return Buffer.from(resp.data);
}

/**
 * 9) Загрузка buffer в GCS
 */
async function uploadBufferToGCS(destinationPath: string, buffer: Buffer) {
  const bucket = storage.bucket(BUCKET_NAME);
  const file = bucket.file(destinationPath);

  await file.save(buffer, {
    contentType: 'image/jpeg',
    resumable: false,
  });

  console.log(`Uploaded to gs://${BUCKET_NAME}/${destinationPath}`);
}

/**
 * 10) Построение URL для перехода на следующую страницу (HomeDepot: Nao=OFFSET)
 */
function buildNextPageUrlNao(baseUrl: string, page: number, itemsPerPage = 24): string {
  const offset = itemsPerPage * (page - 1);
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}Nao=${offset}`;
}

/**
 * 11) Основная функция
 */
async function runUniversalImageDownload() {
  // A) Читаем массив subcategory из finishing_breadcrumbs_1.json
  const jsonPath = path.join(__dirname, 'finishing_breadcrumbs_1.json');
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`finishing_breadcrumbs_1.json not found at: ${jsonPath}`);
  }
  const raw = fs.readFileSync(jsonPath, 'utf-8');
  const finishingData: SubcategoryEntry[] = JSON.parse(raw);

  // Можно завести "фиктивную" верхнюю категорию,
  // чтобы при загрузке в GCS создавать папку вида: finishing_materials_1/Subcategory/...
  const topLevelCategory = 'finishing_materials_1';

  // B) Итерируемся по подкатегориям
  for (const entry of finishingData) {
    const { subcategory, breadcrumbUrl } = entry;

    // Пропустим, если пустой URL
    if (!breadcrumbUrl) {
      console.warn(`Skipping subcategory="${subcategory}" because breadcrumbUrl is empty.`);
      continue;
    }

    // Проверяем сколько уже накачали для этой subcategory
    const alreadyCount = progressData.photosBySubcategory[subcategory] || 0;
    if (alreadyCount >= MAX_PHOTOS_PER_SUBCATEGORY) {
      console.log(`Subcategory="${subcategory}" already has ${alreadyCount} images. Skipping...`);
      continue;
    }

    console.log(`\n=== Subcategory: "${subcategory}" => ${breadcrumbUrl} ===\n`);

    try {
      // 1) С какой страницы начинаем?
      const lastProcessedPage = progressData.lastPageBySubcategory[subcategory] || 0;
      let currentPage = lastProcessedPage === 0 ? 1 : lastProcessedPage + 1;

      // 2) Восстанавливаем уже виденные itemId (чтобы не скачивать дубликаты)
      const existingSeenArr = progressData.seenItemIdsBySubcategory[subcategory] || [];
      const seenItemIds = new Set<string>(existingSeenArr);

      // C) Цикл по страницам (ограничим MAX_PAGES)
      while (true) {
        // Проверка лимита картинок
        if ((progressData.photosBySubcategory[subcategory] || 0) >= MAX_PHOTOS_PER_SUBCATEGORY) {
          console.log(`Reached ${MAX_PHOTOS_PER_SUBCATEGORY} images in subcategory="${subcategory}". Stop pagination.`);
          break;
        }

        // Проверка лимита страниц
        if (currentPage > MAX_PAGES) {
          console.log(`Reached ${MAX_PAGES} pages for "${subcategory}". Stopping pagination.`);
          break;
        }

        // Формируем URL
        let pageUrl: string;
        if (currentPage === 1) {
          pageUrl = breadcrumbUrl;
        } else {
          pageUrl = buildNextPageUrlNao(breadcrumbUrl, currentPage, 24);
        }

        console.log(`Fetching page=${currentPage} => ${pageUrl}`);

        // Пробуем загрузить товары (с ретраями)
        let pageResults: Array<{ product?: { item_id?: string } }> = [];
        const maxRetries = 3;
        let success = false;

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
          console.log(`Could not fetch page ${currentPage} after ${maxRetries} attempts. Stopping for "${subcategory}".`);
          break;
        }

        if (pageResults.length === 0) {
          console.log(`No more items found on page ${currentPage} for subcategory="${subcategory}". Stop pagination.`);
          break;
        }

        console.log(`Found ${pageResults.length} items on page ${currentPage}. Processing...`);

        // Обработка товаров на этой странице
        await processPageItems(pageResults, topLevelCategory, subcategory, seenItemIds);

        // Сохраняем прогресс по странице
        progressData.lastPageBySubcategory[subcategory] = currentPage;
        progressData.seenItemIdsBySubcategory[subcategory] = Array.from(seenItemIds);
        saveProgress();

        // Возможно, мы уже достигли 1000 картинок во время обработки
        if ((progressData.photosBySubcategory[subcategory] || 0) >= MAX_PHOTOS_PER_SUBCATEGORY) {
          break;
        }

        currentPage++;
      }
    } catch (catErr) {
      console.error(`Error fetching subcategory="${subcategory}"`, catErr);
    }
  }

  console.log('\nAll done!');
}

/**
 * processPageItems - обрабатывает товары одной страницы
 * @param pageItems - список товаров с поля category_results или search_results
 * @param topLevelCategory - строка, чтобы формировать путь в GCS
 * @param subcategory - строка, чтобы формировать путь и счётчик
 * @param seenItemIds - Set, где отмечаем itemId, чтобы не повторяться
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
    if (!itemId) {
      console.log(`[PAGE] itemIndex=${itemIndex} => No itemId, skipping.`);
      continue;
    }

    // Если мы уже видели этот itemId в рамках subcategory
    if (seenItemIds.has(itemId)) {
      console.log(`[PAGE] itemIndex=${itemIndex}, itemId=${itemId} => Already seen, skipping.`);
      continue;
    }

    // Добавляем в set, чтобы не обрабатывать ещё раз
    seenItemIds.add(itemId);

    // Проверяем, не обрабатывался ли этот itemId глобально (в processed)
    if (progressData.processed[itemId]) {
      console.log(`[PAGE] itemIndex=${itemIndex}, itemId=${itemId} => Already processed (global), skipping.`);
      continue;
    }

    // Проверяем лимит картинок
    const currentPhotoCount = progressData.photosBySubcategory[subcategory] || 0;
    if (currentPhotoCount >= MAX_PHOTOS_PER_SUBCATEGORY) {
      console.log(`Reached ${MAX_PHOTOS_PER_SUBCATEGORY} images in subcategory="${subcategory}". Exiting processPageItems.`);
      return;
    }

    console.log(`[PAGE] itemIndex=${itemIndex}, itemId=${itemId} => Fetch product details...`);

    try {
      const productResp = await fetchProductDetails(itemId);
      const product = productResp.product;
      if (!product) {
        console.warn(`No product info for itemId=${itemId}. Skipping...`);
        continue;
      }

      const images = product.images || [];
      // В примере мы скачиваем только фото type='primary' или 'image_left_view'
      let selectedImages = images.filter((img) => img.type === 'primary' || img.type === 'image_left_view');

      // Смотрим, сколько ещё можно взять
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

      // Скачиваем и загружаем выбранные картинки
      let imgIndex = 0;
      for (const img of selectedImages) {
        if (!img.link) continue;
        imgIndex++;

        try {
          const imageBuffer = await downloadImageAsBuffer(img.link);

          // Формируем путь в GCS
          const folderPath = `${topLevelCategory}/${subcategory}`;
          const fileName = `${itemId}-${imgIndex}.jpg`;
          const destinationPath = `${folderPath}/${fileName}`;

          // Загружаем в GCS
          await uploadBufferToGCS(destinationPath, imageBuffer);

          // Увеличиваем счётчик
          progressData.photosBySubcategory[subcategory] =
            (progressData.photosBySubcategory[subcategory] || 0) + 1;
          saveProgress();

          const newCount = progressData.photosBySubcategory[subcategory];
          if (newCount >= MAX_PHOTOS_PER_SUBCATEGORY) {
            console.log(`Reached ${MAX_PHOTOS_PER_SUBCATEGORY} images in subcategory="${subcategory}" (itemId=${itemId}).`);
            break;
          }
        } catch (imgErr) {
          console.error(`Error downloading/uploading image #${imgIndex} for itemId=${itemId}`, imgErr);
        }
      }

      // Помечаем, что itemId полностью обработан (глобально)
      progressData.processed[itemId] = true;
      saveProgress();

      // Если по ходу достигли лимита
      if ((progressData.photosBySubcategory[subcategory] || 0) >= MAX_PHOTOS_PER_SUBCATEGORY) {
        console.log(`Hit 1000-limit in subcategory="${subcategory}". Stop item loop.`);
        return;
      }
    } catch (prodErr) {
      console.error(`Error fetching product details for itemId=${itemId}`, prodErr);
    }
  }
}

/**
 * 12) Запускаем
 */
runUniversalImageDownload().catch((err) => {
  console.error('Unhandled error in runUniversalImageDownload:', err);
});