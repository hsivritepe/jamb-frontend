import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

// Create an OpenAI instance with your key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/**
 * This route is called by the front-end to "understand" user text.
 */
export async function POST(req: Request) {
  try {
    const { userText } = await req.json();
    if (!userText || typeof userText !== "string") {
      return NextResponse.json({ error: "No userText or invalid" }, { status: 400 });
    }

    const systemPrompt = `
      You are a home-improvement service assistant.
      The user provided a text describing their project.
      Output valid JSON with EXACT keys:
        {
          "description": "",
          "tasks": [],
          "quantities": {},
          "notes": ""
        }

      - "description": short summary (1 sentence)
      - "tasks": array of broad tasks. e.g. ["Paint walls", "Install laminate", "Remove carpet"]
      - "quantities": approximate # if user text has any numeric mention
      - "notes": a short additional note or empty string.
      Return ONLY JSON.
    `.trim();

    const userPrompt = `User says: "${userText}"`;

    // GPT call
    const resp = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0,
      max_tokens: 400,
    });

    const rawText = resp.choices?.[0]?.message?.content?.trim() || "";
    let result = {
      description: "",
      tasks: [] as string[],
      quantities: {} as Record<string, number>,
      notes: "",
    };

    try {
      result = JSON.parse(rawText);
    } catch {
      console.warn("[ai-extract-intent] Could not parse JSON from GPT:", rawText);
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[ai-extract-intent] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}