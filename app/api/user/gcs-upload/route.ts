// app/api/gcs-upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";

export async function POST(req: NextRequest) {
  try {
    // 1) Extract file data (JSON) from the request body
    //    name: the original file name
    //    type: the MIME type (image/jpeg, image/png, etc.)
    const { name, type } = await req.json();

    // 2) Initialize Google Cloud Storage
    const storage = new Storage({
      projectId: process.env.GCP_PROJECT_ID,
      credentials: {
        client_email: process.env.GCP_CLIENT_EMAIL,
        private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
    });

    // 3) Get a reference to our bucket
    const bucketName = process.env.GCP_BUCKET_NAME!;
    const bucket = storage.bucket(bucketName);

    // (optional) Specify a subfolder (prefix)
    const folderName = "uploads";
    // Generate the final file name (so it won't overwrite existing files)
    const fileName = `${folderName}/${Date.now()}-${name}`;

    // 4) Create a file object in the bucket
    const file = bucket.file(fileName);

    // 5) Generate a signed URL for writing (action: 'write')
    //    give ~15 minutes to complete the upload
    const [uploadUrl] = await file.getSignedUrl({
      action: "write",
      version: "v4",
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType: type, // expected content type
    });

    // 6) Generate a public URL for viewing (assuming the bucket/objects are publicly accessible)
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;

    // 7) Return the data to the client
    return NextResponse.json({ uploadUrl, publicUrl });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return new NextResponse("Error generating signed URL", { status: 500 });
  }
}