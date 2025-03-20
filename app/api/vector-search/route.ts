import { NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

let loaded = false;
let allServicesData: Array<{
  id: string;
  title: string;
  embedding: number[];
}> = [];

function loadServices() {
  if (loaded) return;
  const filePath = path.join(process.cwd(), "data", "services-with-embeddings.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  allServicesData = JSON.parse(raw);
  loaded = true;
  console.log(`[vector-search] Loaded ${allServicesData.length} embeddings.`);
}

function dot(a: number[], b: number[]) {
  let s = 0;
  for (let i = 0; i < a.length; i++) {
    s += a[i] * b[i];
  }
  return s;
}
function norm(a: number[]) {
  let s = 0;
  for (let i = 0; i < a.length; i++) {
    s += a[i] * a[i];
  }
  return Math.sqrt(s);
}
function cosineSimilarity(a: number[], b: number[]) {
  return dot(a, b) / (norm(a) * norm(b));
}

export const runtime = "nodejs";

export async function POST(req: Request) {
  loadServices();

  try {
    const { userText } = await req.json();
    if (!userText || typeof userText !== "string") {
      return NextResponse.json({ error: "No userText or invalid" }, { status: 400 });
    }

    const embeddingResp = await openai.embeddings.create({
      model: "text-embedding-3-small", // или large
      input: userText,
      encoding_format: "float",
    });
    const userEmbedding = embeddingResp.data[0].embedding as number[];

    const scored = allServicesData.map((svc) => {
      const score = cosineSimilarity(userEmbedding, svc.embedding);
      return {
        id: svc.id,
        title: svc.title,
        score,
      };
    });

    scored.sort((a, b) => b.score - a.score);
    const top10 = scored.slice(0, 10);

    return NextResponse.json({ results: top10 });
  } catch (err: any) {
    console.error("[vector-search] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}