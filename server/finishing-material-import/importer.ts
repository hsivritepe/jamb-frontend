/**
 * importer.ts
 *
 * Шаги:
 *  1) Прочитать finishing_material_sections.json
 *  2) Для каждого товара (по external_id):
 *     - Всегда вызвать BigBox API для fetchProduct(item.external_id).
 *     - Если external_id не в collectedItemIds.json, добавить основной товар в базу.
 *     - Посмотреть последний breadcrumb (если есть) => получить до 10 товаров => добавить в базу, если их нет в collectedItemIds.json.
 *  3) Использовать progress.json, чтобы пропускать уже успешно обработанные строки.
 *  4) Использовать collectedItemIds.json, чтобы не добавлять один и тот же item_id повторно.
 *  5) Остановиться, нажав Ctrl + C.
 *  6) Начать заново — удалив или обновив progress.json / collectedItemIds.json.
 *  7) Команда запуска: npx ts-node -P tsconfig.server.json importer.ts
 */

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '..', '..', '.env.local') });

// ---------------------------------------------------------
// 1) finishing_material_sections.json
// ---------------------------------------------------------
import finishingMaterialSections from './finishing_material_sections.json'; // или require(...), если удобнее

interface FinishingMaterialSectionItem {
  id: string;
  material_external_id: string;
  material_name: string;
  work_code: string;
  section: string;
}

// Превращаем .data в массив, если структура у вас такова
const dataArray: FinishingMaterialSectionItem[] = finishingMaterialSections.data || [];

// ---------------------------------------------------------
// 2) progress.json (чтобы не обрабатывать повторно те же строки)
// ---------------------------------------------------------
const PROGRESS_FILE_PATH = path.join(__dirname, 'progress.json');
let progressData: { processed: Record<string, boolean> } = { processed: {} };

if (fs.existsSync(PROGRESS_FILE_PATH)) {
  const raw = fs.readFileSync(PROGRESS_FILE_PATH, 'utf-8');
  progressData = JSON.parse(raw);
}

function saveProgress() {
  fs.writeFileSync(PROGRESS_FILE_PATH, JSON.stringify(progressData, null, 2));
  console.log('Progress saved.');
}

// ---------------------------------------------------------
// 3) collectedItemIds.json (чтобы не добавлять один и тот же item_id дважды)
// ---------------------------------------------------------
const COLLECTED_FILE_PATH = path.join(__dirname, 'collectedItemIds.json');
let collectedIds: string[] = [];
if (fs.existsSync(COLLECTED_FILE_PATH)) {
  collectedIds = JSON.parse(fs.readFileSync(COLLECTED_FILE_PATH, 'utf-8'));
}
const collectedSet = new Set(collectedIds);

function saveCollectedIds() {
  const arr = Array.from(collectedSet);
  fs.writeFileSync(COLLECTED_FILE_PATH, JSON.stringify(arr, null, 2));
  console.log('collectedItemIds saved.');
}

// ---------------------------------------------------------
// 4) BigBox API
// ---------------------------------------------------------
const BIGBOX_API_URL = 'https://api.bigboxapi.com/request';

function getApiKeyOrThrow(): string {
  const key = process.env.API_SUPPLIER_KEY;
  if (!key) {
    throw new Error('Missing environment variable: API_SUPPLIER_KEY');
  }
  return key;
}

// Минимальные интерфейсы
interface ProductResponse {
  product?: {
    item_id?: string;
    title?: string;
    link?: string;
    buybox_winner?: {
      price?: number;
      currency?: string;
      unit?: string;
    };
    // и другие поля (specifications, breadcrumbs и т.д.)
  };
}
interface CategoryResultItem {
  position: number;
  product: {
    item_id?: string;
    title?: string;
  };
}
interface CategoryResponse {
  category_results?: CategoryResultItem[];
  search_results?: CategoryResultItem[];
}

async function fetchProduct(itemId: string): Promise<ProductResponse> {
  const apiKey = getApiKeyOrThrow();
  const response = await axios.get<ProductResponse>(BIGBOX_API_URL, {
    params: {
      api_key: apiKey,
      type: 'product',
      item_id: itemId
    }
  });
  return response.data;
}

/**
 * В зависимости от URL, можно вызвать type='category' или 'search'.
 * Здесь просто делаем 'category' для примера.
 */
async function fetchCategoryByUrl(hdUrl: string, requestType: 'category' | 'search'): Promise<CategoryResponse> {
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

// ---------------------------------------------------------
// 5) Функции "добавления в БД" (пример)
// ---------------------------------------------------------

interface ExtendedProduct {
  item_id?: string;
  title?: string;
  buybox_winner?: {
    price?: number;
    unit?: string;
  };
  main_image?: {
    link: string;
  };
  specifications?: Array<{
    name?: string;
    value?: string;
    group_name?: string;
  }>;
  // и прочие поля по желанию
}

interface FinishingMaterialPayload {
  section: number;
  external_id: string;
  name: string;
  image_href: string;
  unit_of_measurement: string;
  quantity_in_packaging: number;
  cost: number;
  work_code: string;
}

/** Для примера предполагаем, что упаковка всегда "1". */
function determineQuantityInPackaging(product: ExtendedProduct): number {
  return 1;
}

/** Собираем данные для POST на сервер /material/add-finishing-material */
function buildFinishingMaterialPayload(
  section: number,
  externalId: string,
  workCode: string,
  product: ExtendedProduct
): FinishingMaterialPayload {
  const name = product.title || 'Untitled';
  const image = product.main_image?.link || '';
  const cost = product.buybox_winner?.price || 0;
  const unitOfMeasurement = product.buybox_winner?.unit || 'each';
  const quantity = determineQuantityInPackaging(product);

  return {
    section,
    external_id: externalId,
    name,
    image_href: image,
    unit_of_measurement: unitOfMeasurement,
    quantity_in_packaging: quantity,
    cost,
    work_code: workCode
  };
}

/** Имитируем отправку POST-запроса на backend */
async function addFinishingMaterialToDb(payload: FinishingMaterialPayload): Promise<any> {
  try {
    const resp = await axios.post('http://dev.thejamb.com/material/add-finishing-material', payload);
    return resp.data;
  } catch (error) {
    console.error('Error adding finishing material to DB:', error);
    throw error;
  }
}

// ---------------------------------------------------------
// 6) Обработка последнего бредкрамба => до 10 товаров
// ---------------------------------------------------------
async function processBreadcrumbCategory(breadcrumbUrl: string, workCode: string, section: number) {
  console.log(`\n[Breadcrumb] Attempting to fetch: ${breadcrumbUrl}`);
  let catResp: CategoryResponse;
  try {
    catResp = await fetchCategoryByUrl(breadcrumbUrl, 'category');
  } catch (err) {
    console.error('[Breadcrumb] Error fetching category by URL:', err);
    return;
  }

  let items: CategoryResultItem[] = [];
  if (Array.isArray(catResp.category_results)) {
    items = catResp.category_results;
  } else if (Array.isArray(catResp.search_results)) {
    items = catResp.search_results;
  } else {
    console.log('[Breadcrumb] No category_results or search_results found. Skipping.');
    return;
  }

  const upTo10 = items.slice(0, 10);
  for (const catItem of upTo10) {
    const itemId = catItem.product?.item_id;
    if (!itemId) {
      console.warn('[Breadcrumb] Missing item_id, skipping...');
      continue;
    }
    console.log(`[Breadcrumb] Found itemId=${itemId}, will fetchProduct...`);

    try {
      const catProdResp = await fetchProduct(itemId);
      const catProd = catProdResp.product as ExtendedProduct;
      if (!catProd) {
        console.warn(`[Breadcrumb] No product info for itemId=${itemId}. Skipping...`);
        continue;
      }

      if (collectedSet.has(itemId)) {
        console.log(`[Breadcrumb] itemId=${itemId} is already in collectedSet => skip add.`);
      } else {
        const catPayload = buildFinishingMaterialPayload(section, itemId, workCode, catProd);
        const catResult = await addFinishingMaterialToDb(catPayload);
        console.log(`[Breadcrumb] itemId=${itemId} => added:`, catResult);

        collectedSet.add(itemId);
        saveCollectedIds();
      }
    } catch (err) {
      console.error(`[Breadcrumb] Error fetching/adding itemId=${itemId}`, err);
    }
  }
}

// ---------------------------------------------------------
// 7) Основной процесс для каждой строки finishing_material_sections
// ---------------------------------------------------------
async function processOneMaterial(row: FinishingMaterialSectionItem) {
  console.log(`\n=== Processing main externalId=${row.material_external_id}, work_code=${row.work_code}, section=${row.section} ===`);

  // 1) Запрашиваем BigBox для основного товара
  let mainResp: ProductResponse;
  try {
    mainResp = await fetchProduct(row.material_external_id);
  } catch (err) {
    console.error(`Failed to fetch externalId=${row.material_external_id}:`, err);
    return;
  }

  const mainProd = mainResp.product as ExtendedProduct;
  if (!mainProd) {
    console.warn(`No product info for externalId=${row.material_external_id}. Skipping entire row.`);
    return;
  }

  // 2) Если нет в collectedSet => добавляем в БД
  if (collectedSet.has(row.material_external_id)) {
    console.log(`Main itemId=${row.material_external_id} is already in DB => skip add.`);
  } else {
    const mainPayload = buildFinishingMaterialPayload(
      parseInt(row.section, 10),
      row.material_external_id,
      row.work_code,
      mainProd
    );
    try {
      const mainResult = await addFinishingMaterialToDb(mainPayload);
      console.log(`Added main itemId=${row.material_external_id}:`, mainResult);

      collectedSet.add(row.material_external_id);
      saveCollectedIds();
    } catch (err) {
      console.error(`Error adding main itemId=${row.material_external_id}`, err);
    }
  }

  // 3) Берём последний breadcrumb => получаем до 10 товаров => добавляем (если их нет в collectedSet)
  const breadcrumbs = (mainProd as any).breadcrumbs;
  if (Array.isArray(breadcrumbs) && breadcrumbs.length > 0) {
    const lastCrumb = breadcrumbs[breadcrumbs.length - 1];
    if (lastCrumb?.link) {
      await processBreadcrumbCategory(lastCrumb.link, row.work_code, parseInt(row.section, 10));
    }
  } else {
    console.log('No breadcrumbs array found or empty => skip category approach.');
  }
}

// ---------------------------------------------------------
// 8) Запуск основного цикла
// ---------------------------------------------------------
async function runImport() {
  for (const row of dataArray) {
    const extId = row.material_external_id;

    // Пропускаем, если уже обработано
    if (progressData.processed[extId]) {
      console.log(`Skipping externalId=${extId} => progress.json says processed.`);
      continue;
    }

    try {
      await processOneMaterial(row);

      // Отмечаем, что строка обработана
      progressData.processed[extId] = true;
      saveProgress();
    } catch (err) {
      console.error(`Error processing extId=${extId}`, err);
      // Можно сделать break или continue, в зависимости от логики
    }
  }

  console.log('\nAll done with test run.');
}

runImport().catch(err => {
  console.error('Unhandled error in runImport:', err);
});