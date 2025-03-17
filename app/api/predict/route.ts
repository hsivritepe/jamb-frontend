import { NextResponse } from "next/server";
import OpenAI from "openai";
import sharp from "sharp";
import { SERVICE_CATEGORIES } from "@/constants/services";


export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const ALL_CATEGORIES = Object.values(SERVICE_CATEGORIES);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    let buffer = Buffer.from(arrayBuffer);

    if (file.type.includes("heic") || file.type.includes("heif")) {
      buffer = await sharp(buffer).jpeg({ quality: 80 }).toBuffer();
    }

    buffer = await sharp(buffer)
      .resize({ width: 512, height: 512, fit: "inside" })
      .jpeg({ quality: 50 })
      .toBuffer();
    const base64Image = buffer.toString("base64");
    const messages: any = [
      {
        role: "system",
        content: [
          {
            type: "text",
            text: `
              You are an assistant that classifies images into a set of service categories:
              ${ALL_CATEGORIES.join(", ")}.

              1) Return up to 3 categories from the list in "categories" array.
              2) Provide a short "description" describing what is visible in the photo.
              3) Provide a "recommendation" if there's an obvious issue or next steps. Otherwise, empty string.

              The output MUST be valid JSON with the exact structure:
              {
                "categories": [...],
                "description": "...",
                "recommendation": "..."
              }
            `.trim(),
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Here is an image. Please classify it according to the system instructions.",
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/${file.type};base64,${base64Image}`,
              detail: "low",
            },
          },
        ],
      },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 300,
      temperature: 0,
    });

    const rawText = response.choices?.[0]?.message?.content?.trim() || "";

    let result = {
      categories: [] as string[],
      description: "",
      recommendation: "",
    };
    try {
      result = JSON.parse(rawText);
    } catch {
      console.warn("Could not parse JSON from model:", rawText);
    }

    return NextResponse.json({
      categories: result.categories,
      description: result.description,
      recommendation: result.recommendation,
      openaiRaw: rawText,
    });
  } catch (err: any) {
    console.error("Error in /api/predict:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}