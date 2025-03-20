/**
 * scripts/generate-embeddings.ts
 *
 * Запуск:
 *   OPENAI_API_KEY=sk-xxx npx ts-node scripts/generate-embeddings.ts
 * или укажите OPENAI_API_KEY в .env и добавьте npm-скрипт.
 */

import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { ALL_SERVICES } from "@/constants/services"; // !! путь скорректируйте под вашу структуру

// Подтяните ключ из process.env
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Имя итогового файла
const OUTPUT_FILE = "services-with-embeddings.json";

/**
 * Основная функция
 */
async function main() {
  console.log(`Loaded ${ALL_SERVICES.length} services from ALL_SERVICES.\n`);

  // Будем складывать результат
  const outputData: Array<{
    id: string;
    title: string;
    embedding: number[];
  }> = [];

  // Перебираем ваши реальные сервисы
  for (let i = 0; i < ALL_SERVICES.length; i++) {
    const svc = ALL_SERVICES[i];
    const { id, title } = svc;

    // Логируем прогресс
    console.log(`[${i + 1}/${ALL_SERVICES.length}] Generating embedding for: "${title}" (id=${id})`);

    try {
      // Вызываем OpenAI Embeddings
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small", // или другой доступный
        input: title,
        encoding_format: "float",
      });

      // Получаем вектор
      const vector = response.data[0].embedding as number[];

      // Добавляем в массив
      outputData.push({
        id,
        title,
        embedding: vector,
      });
    } catch (err) {
      console.error(`Error generating embedding for id=${id}, title="${title}":`, err);
      // можете либо break, либо continue, либо throw
      // for demo, пропустим этот сервис
      continue;
    }

    // Небольшая пауза (150–300 мс), чтобы не словить rate-limit
    await new Promise((r) => setTimeout(r, 200));
  }

  // Записываем в файл
  const outPath = path.join(process.cwd(), "data", OUTPUT_FILE);
  fs.writeFileSync(outPath, JSON.stringify(outputData, null, 2), "utf8");
  console.log(`\nDone! Saved ${outputData.length} embeddings to: ${outPath}`);
}

// Запуск
main().catch((err) => {
  console.error("Error in generate-embeddings script:", err);
  process.exit(1);
});