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
  console.log(`[ai-emergency] Loaded ${allServicesData.length} embeddings.`);
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

    const systemPrompt = `
You are Jamb’s Emergency Home Improvement Assistant.
The user has an urgent home-related problem.

1) Ask brief clarifying questions if necessary, but do not repeat the same question.
2) Provide immediate steps to ensure safety or minimize damage (be concise).
3) Mention relevant services from the list below only by their title. Do not use words like "Service:", "Description:", or "Price:" in your main text.
4) You may express empathy once at most (e.g., "I understand this can be stressful."). Avoid repeating phrases like "I'm sorry to hear that."
5) You can suggest an inspection if it’s relevant to diagnosing or preventing further damage.
6) In your main text, do not repeat the same recommendation more than once. If the user has already been given certain steps, do not restate them in full unless clarifying new information.
7) At the very end of your response, output a JSON block with any recommended services in this format:

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

If no relevant service applies, say so and do not generate an empty JSON block.

Below is the list of real services you can reference:
${lines.join("\n")}
`.trim();

    const fullMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages,
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: fullMessages,
      max_tokens: 600,
      temperature: 0,
    });

    const output = response.choices?.[0]?.message?.content || "";
    return NextResponse.json({
      role: "assistant",
      content: output.trim(),
    });
  } catch (err: any) {
    console.error("[ai-emergency] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}