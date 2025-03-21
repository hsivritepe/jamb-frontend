import { NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { ALL_SERVICES } from "@/constants/services";

let loaded = false;
let allServicesData: Array<{
  id: string;
  title: string;
  embedding: number[];
}> = [];

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export const runtime = "nodejs";

function loadServices() {
  if (loaded) return;
  const filePath = path.join(process.cwd(), "data", "services-with-embeddings.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  allServicesData = JSON.parse(raw);
  loaded = true;
  console.log(`[ai-chat] Loaded ${allServicesData.length} embeddings.`);
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

interface ScoredService {
  id: string;
  title: string;
  score: number;
}

async function vectorSearch(userText: string): Promise<ScoredService[]> {
  const embeddingResp = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: userText,
    encoding_format: "float",
  });
  const userEmbedding = embeddingResp.data[0].embedding as number[];

  const scored = allServicesData.map((svc) => {
    const score = cosineSimilarity(userEmbedding, svc.embedding);
    return { id: svc.id, title: svc.title, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 8);
}

// Use ALL_SERVICES to find real data for each ID
function getFullServiceData(svcId: string) {
  const found = ALL_SERVICES.find((x) => x.id === svcId);
  if (!found) return null;
  const price = (found as any).price ?? 0;
  return {
    id: found.id,
    title: found.title,
    description: found.description || "",
    price,
  };
}

export async function POST(req: Request) {
  try {
    loadServices();

    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Missing or invalid messages" }, { status: 400 });
    }

    const userMessages = messages.filter((m: any) => m.role === "user");
    const lastUserMsg = userMessages.length
      ? userMessages[userMessages.length - 1].content
      : "";

    let topServices: ScoredService[] = [];
    if (lastUserMsg.trim().length > 0) {
      topServices = await vectorSearch(lastUserMsg);
    }

    // Build lines with real info
    const lines: string[] = [];
    for (const svc of topServices) {
      const realData = getFullServiceData(svc.id);
      if (realData) {
        lines.push(
          `- id: "${realData.id}", title: "${realData.title}", description: "${realData.description}", price: ${realData.price}`
        );
      }
    }
    if (lines.length === 0) {
      lines.push("No relevant services found for the user's query.");
    }

    // Strict system instructions
    const systemPrompt = `
You are a home improvement assistant for Jamb. 
Below is a list of real services. 
You must ONLY use these exact IDs and titles if relevant. 
DO NOT invent new names or IDs. 
If you recommend a service, do not reveal the block in normal text. 
Append the block at the end:

<<<SERVICES>>>
{
  "services": [
    {
      "id": "...",
      "title": "...",
      "description": "...",
      "price": 0
    }
  ]
}
<<<END>>>

Services:
${lines.join("\n")}

If no relevant service applies, say so. 
Be concise. 
    `.trim();

    const fullMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages,
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: fullMessages,
      max_tokens: 600,
      // Force minimal creativity
      temperature: 0,
    });

    const output = response.choices?.[0]?.message?.content || "";
    return NextResponse.json({
      role: "assistant",
      content: output.trim(),
    });
  } catch (err: any) {
    console.error("[ai-chat] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}