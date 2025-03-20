import { NextResponse } from "next/server";
import OpenAI from "openai";
import { SERVICE_CATEGORIES } from "@/constants/services";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const ALL_CATEGORIES = Object.values(SERVICE_CATEGORIES);

export async function POST(req: Request) {
  console.log("[/api/predict-text] route triggered");
  try {
    const { text } = await req.json();
    console.log("[/api/predict-text] user text:", text);

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "No valid text provided" },
        { status: 400 }
      );
    }

    const systemPrompt = `
      You are a home-improvement service assistant.
      Output valid JSON with the structure:
        {
          "categories": [],
          "quantities": {},
          "description": "",
          "recommendation": ""
        }
      1) "categories": up to 5 from this list: ${ALL_CATEGORIES.join(", ")}
      2) "quantities": approximate numbers if user text mentions area or piece count
      3) "description": short summary in one sentence
      4) "recommendation": from the point of view of the service company. 
         E.g. "We recommend these services from our platform... Then user can pick them below."
      Return ONLY JSON, nothing else.

      Note: If user says "Install air conditioner" or "AC", you might pick "HVAC".
            If user says "window cleaning", you might pick "cleaning".
            Avoid returning "Installation" or "Window Cleaning" as categories,
            because they are not in the official list. Use "hvac" or "cleaning" etc. instead.
    `.trim();

    const userPrompt = `User says: "${text}"`;

    console.log("[/api/predict-text] sending prompt to OpenAI...");

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 500,
      temperature: 0.0,
      top_p: 1,
    });

    const rawText = response.choices?.[0]?.message?.content?.trim() || "";
    console.log("[/api/predict-text] rawText from model:", rawText);

    let result = {
      categories: [] as string[],
      quantities: {} as Record<string, number>,
      description: "",
      recommendation: "",
    };

    try {
      const parsed = JSON.parse(rawText);
      if (parsed && typeof parsed === "object") {
        result = {
          categories: Array.isArray(parsed.categories)
            ? parsed.categories
            : [],
          quantities: parsed.quantities || {},
          description: parsed.description || "",
          recommendation: parsed.recommendation || "",
        };
      }
    } catch (err) {
      console.warn(
        "[/api/predict-text] could not parse JSON from model. rawText:",
        rawText
      );
    }

    return NextResponse.json({
      ...result,
      openaiRaw: rawText,
    });
  } catch (err: any) {
    console.error("[/api/predict-text] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}