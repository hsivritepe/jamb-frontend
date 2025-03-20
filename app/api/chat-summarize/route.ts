import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

/**
 * Create an instance of the OpenAI client using the secret key.
 * Adjust or remove if you are using a different setup.
 */
const openAiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: Request) {
  try {
    const { userInputText, topServicesList } = await request.json();

    if (!userInputText) {
      return NextResponse.json({ error: "No userInputText" }, { status: 400 });
    }
    if (!topServicesList || !Array.isArray(topServicesList)) {
      return NextResponse.json(
        { error: "No or invalid topServicesList" },
        { status: 400 }
      );
    }

    // Define the system instruction for the language model
    const promptForSystem = `
      You are a home-improvement assistant. 
      The user has described their project, and we have a set of recommended services.
      Please provide a short (1-2 sentence) recommendation to the user, focusing on solutions and steps.
    `.trim();

    // Prepare a summary of the services, possibly including their similarity scores
    let servicesBulletedList = topServicesList
      .map((service: any) => {
        const scoreText = service.similarityScore
          ? `(score: ${service.similarityScore.toFixed(3)})`
          : "(score: unknown)";
        return `- ${service.title} ${scoreText}`;
      })
      .join("\n");

    // Construct the user-facing prompt
    const promptForUser = `
      The user says: "${userInputText}"

      We found these relevant services:
      ${servicesBulletedList}

      Please provide a concise recommendation from our company's perspective,
      addressing how these services could help solve the user's issue.
    `.trim();

    // Create a chat completion request
    const response = await openAiClient.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: promptForSystem },
        { role: "user", content: promptForUser },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const rawResponseText = response.choices?.[0]?.message?.content || "";

    return NextResponse.json({ recommendation: rawResponseText });
  } catch (errorObject: any) {
    console.error("[chat-summarize] error:", errorObject);
    return NextResponse.json({ error: errorObject.message }, { status: 500 });
  }
}