import { NextResponse } from "next/server";
import OpenAI from "openai";
import { ALL_SERVICES } from "@/constants/services";
import fs from "fs";
import path from "path";

type ServiceEmbedding = {
  id: string;
  title: string;
  embedding: number[];
};

let loaded = false;
let allServicesData: ServiceEmbedding[] = [];

function loadEmbeddings() {
  if (loaded) return;
  const p = path.join(process.cwd(), "data", "services-with-embeddings.json");
  const raw = fs.readFileSync(p, "utf-8");
  allServicesData = JSON.parse(raw);
  loaded = true;
}

function dot(a: number[], b: number[]) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

function norm(a: number[]) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * a[i];
  return Math.sqrt(s);
}

function cosineSim(a: number[], b: number[]) {
  return dot(a, b) / (norm(a) * norm(b));
}

async function vectorSearch(text: string, openai: OpenAI): Promise<string[]> {
  const resp = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    encoding_format: "float",
  });
  const userEmbed = resp.data[0].embedding as number[];
  const scored = allServicesData.map((svc) => {
    const score = cosineSim(userEmbed, svc.embedding);
    return { id: svc.id, title: svc.title, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 40); // limit to 40
  return top.map((x) => x.id);
}

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    loadEmbeddings();

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    if (!files || !files.length) {
      return NextResponse.json({ error: "No PDF files" }, { status: 400 });
    }

    let combinedText = "";
    for (const f of files) {
      const arr = await f.arrayBuffer();
      // Real pdf-parsing is omitted
      combinedText += `PDF name: ${f.name}; mock text. `;
    }

    // Vector search to find relevant services
    const topIds = await vectorSearch(combinedText, openai);
    const topServices = ALL_SERVICES.filter((svc) => topIds.includes(svc.id));

    // Build lines with ID/title only
    const lines = topServices.map((svc) => {
      return `- id: "${svc.id}", title: "${svc.title}"`;
    }).join("\n");

    const sysPrompt = `
You are an assistant that reads PDF text and suggests up to 5 services from this subset. 
Do NOT invent new IDs. Only use these IDs if relevant:

${lines}

PDF text:
"${combinedText}"

Return JSON:
{
  "services": [
    { "id": "...", "title": "...", "description": "...", "price": 0 }
  ]
}

If no relevant service applies, return empty array. No extra text.
`.trim();

    const resp = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: sysPrompt },
      ],
      temperature: 0,
      max_tokens: 1000,
    });

    const rawText = resp.choices?.[0]?.message?.content || "";
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = { services: [] };
    }

    return NextResponse.json({
      services: parsed.services || [],
      openaiRaw: rawText,
    });
  } catch (err: any) {
    console.error("Error in /api/predict-pdf:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}