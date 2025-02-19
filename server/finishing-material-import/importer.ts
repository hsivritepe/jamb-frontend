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
import finishingMaterialSections from './finishing_material_sections.json';

interface FinishingMaterialSectionItem {
  id: string;
  material_external_id: string;
  material_name: string;
  work_code: string;
  section: string;  // "1", "2" ... (если нужна поддержка "1.1.1" — уберите parseInt)
}

// Превращаем .data в массив (если структура у вас такова)
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
    breadcrumbs?: Array<{ link?: string; title?: string }>;
    // и другие поля
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

// Запрашиваем один товар
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

// Запрашиваем категорию/поиск по ссылке из бредкрамба
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
// 5) "Добавление в БД" (пример)
// ---------------------------------------------------------
interface ExtendedProduct {
  item_id?: string;
  title?: string;
  main_image?: {
    link: string;
  };
  buybox_winner?: {
    price?: number;
    unit?: string;
  };
  breadcrumbs?: Array<{ link?: string; title?: string }>;
}

interface FinishingMaterialPayload {
  section: number;               // Если section может быть '1.1.1', замените на string
  external_id: string;
  name: string;                  // Название материала
  image_href: string;
  unit_of_measurement: string;
  quantity_in_packaging: number;
  cost: number;
  work_code: string;
}

// Простейшая функция: всегда возвращаем 1
function determineQuantityInPackaging(product: ExtendedProduct): number {
  return 1;
}

/**
 * Собираем FinishingMaterialPayload, но теперь для **основного** товара
 * берём `name` из `row.material_name`.
 */
function buildMainFinishingMaterialPayload(
  row: FinishingMaterialSectionItem,   // наши данные из JSON
  product: ExtendedProduct
): FinishingMaterialPayload {
  // Если "section" всегда целое — используем parseInt(row.section, 10)
  // Если нужно хранить "1.1.1", просто оставьте row.section как строку (сменив интерфейс).
  const sectionNum = parseInt(row.section, 10);

  return {
    section: sectionNum,
    external_id: row.material_external_id,
    name: row.material_name,   // <-- Берём название из .json, а не из product.title
    image_href: product.main_image?.link || '',
    unit_of_measurement: product.buybox_winner?.unit || 'each',
    quantity_in_packaging: determineQuantityInPackaging(product),
    cost: product.buybox_winner?.price || 0,
    work_code: row.work_code,  // <-- Берём код работ из .json
  };
}

/**
 * Для "breadcrumb"-товаров у нас **нет** row.material_name,
 * поэтому берём title из BigBox (или просто "Untitled").
 */
function buildBreadcrumbFinishingMaterialPayload(
  section: number,
  itemId: string,
  workCode: string,
  product: ExtendedProduct
): FinishingMaterialPayload {
  return {
    section,
    external_id: itemId,
    name: product.title || 'Untitled',
    image_href: product.main_image?.link || '',
    unit_of_measurement: product.buybox_winner?.unit || 'each',
    quantity_in_packaging: determineQuantityInPackaging(product),
    cost: product.buybox_winner?.price || 0,
    work_code: workCode,
  };
}

// Функция-обёртка, имитирующая запрос на ваш бэкенд
async function addFinishingMaterialToDb(payload: FinishingMaterialPayload): Promise<any> {
  try {
    console.log('DEBUG: Sending payload =>', payload); // <-- Чтобы увидеть, что реально уходит на сервер

    const resp = await axios.post('https://dev.thejamb.com/material/add-finishing-material', payload);
    return resp.data;
  } catch (error) {
    console.error('Error adding finishing material to DB:', error);
    throw error;
  }
}

// ---------------------------------------------------------
// 6) Обработка бредкрамба (до 10 товаров)
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
        // Тут берём title из catProd (нет row.material_name)
        const catPayload = buildBreadcrumbFinishingMaterialPayload(section, itemId, workCode, catProd);
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
// 7) Основной цикл обработки
// ---------------------------------------------------------
async function processOneMaterial(row: FinishingMaterialSectionItem) {
  console.log(`\n=== Processing main externalId=${row.material_external_id}, work_code=${row.work_code}, section=${row.section} ===`);

  // 1) Вызываем BigBox для основного товара
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

  // 2) Если нет в collectedSet => добавляем
  if (collectedSet.has(row.material_external_id)) {
    console.log(`Main itemId=${row.material_external_id} is already in DB => skip add.`);
  } else {
    // Формируем payload (берём название и work_code из row)
    const mainPayload = buildMainFinishingMaterialPayload(row, mainProd);

    try {
      const mainResult = await addFinishingMaterialToDb(mainPayload);
      console.log(`Added main itemId=${row.material_external_id}:`, mainResult);

      collectedSet.add(row.material_external_id);
      saveCollectedIds();
    } catch (err) {
      console.error(`Error adding main itemId=${row.material_external_id}`, err);
    }
  }

  // 3) Берём последний бредкрамб => до 10 товаров
  const breadcrumbs = mainProd.breadcrumbs;
  if (Array.isArray(breadcrumbs) && breadcrumbs.length > 0) {
    const lastCrumb = breadcrumbs[breadcrumbs.length - 1];
    if (lastCrumb?.link) {
      // section всё тот же (преобразуем row.section), work_code — row.work_code
      const sectionNum = parseInt(row.section, 10);
      await processBreadcrumbCategory(lastCrumb.link, row.work_code, sectionNum);
    }
  } else {
    console.log('No breadcrumbs array found or empty => skip category approach.');
  }
}

// ---------------------------------------------------------
// 8) Запуск
// ---------------------------------------------------------
async function runImport() {
  for (const row of dataArray) {
    const extId = row.material_external_id;

    // Пропускаем, если progress.json говорит, что уже обработано
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
    }
  }

  console.log('\nAll done with test run.');
}

runImport().catch(err => {
  console.error('Unhandled error in runImport:', err);
});