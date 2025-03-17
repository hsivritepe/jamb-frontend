// app/api/upload-gcs/route.ts
import { NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";
import sharp from "sharp";

/**
 * Read env variables for GCP credentials and bucket
 */
const bucketName = process.env.GCP_BUCKET_NAME || "jamb-client-images";
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL,
    private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
});

export const runtime = "nodejs";

/**
 * This endpoint receives:
 * - `file` (the chosen image)
 * - `category` (the user's chosen category)
 * Then saves the image into GCS under "category/<timestamp>.jpg"
 */
export async function POST(req: Request) {
  try {
    // 1) Parse the incoming FormData
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = formData.get("category") as string | null;

    if (!file || !category) {
      return NextResponse.json({ error: "Missing file or category" }, { status: 400 });
    }

    // 2) Convert File → Buffer
    const arrayBuffer = await file.arrayBuffer();
    let buffer = Buffer.from(arrayBuffer);

    // (Optional) If you want to reconvert or compress here with Sharp, do so:
    buffer = await sharp(buffer)
      .resize({ width: 1024, height: 1024, fit: "inside" })
      .jpeg({ quality: 70 })
      .toBuffer();

    // 3) Build a file path in GCS
    // GCS doesn't really have folders, but using "<category>/..." is a common approach
    const timestamp = Date.now();
    const extension = ".jpg"; 
    const fileName = `${category}/${timestamp}${extension}`;

    // 4) Upload to GCS
    const bucket = storage.bucket(bucketName);
    const gcsFile = bucket.file(fileName);

    await gcsFile.save(buffer, {
      contentType: "image/jpeg", // or file.type if you want
    });

    console.log(`Uploaded to gs://${bucketName}/${fileName}`);

    return NextResponse.json({
      success: true,
      message: `File saved to GCS under ${fileName}`,
    });
  } catch (err: any) {
    console.error("Error uploading to GCS:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}