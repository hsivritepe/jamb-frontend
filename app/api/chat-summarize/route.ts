import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

// Create an OpenAI instance
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { userInputText, topServicesList } = await req.json();

    if (!userInputText || !Array.isArray(topServicesList)) {
      return NextResponse.json(
        { error: "No userInputText or invalid topServicesList" },
        { status: 400 }
      );
    }

    const systemPrompt = `
      You are a home-improvement marketing assistant.
      We have a user's project text, and a list of recommended services:
      Return a concise 1-3 sentence recommendation from the company's perspective,
      describing how these services help solve the user's problem.
      Return ONLY the text, no extra JSON or formatting.
    `.trim();

    // Construct a small bullet list
    const bulletList = topServicesList
      .map((s: any) => `- ${s.title} (score: ${s.similarityScore.toFixed(2)})`)
      .join("\n");

    const userPrompt = `
      The user said: "${userInputText}"
      Our recommended services:
      ${bulletList}
      Please provide a short recommendation.
    `;

    const resp = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const raw = resp.choices?.[0]?.message?.content?.trim() || "";

    return NextResponse.json({
      recommendation: raw,
    });
  } catch (err: any) {
    console.error("[chat-summarize] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}