// app/api/gcs-upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";

// 1) Read env variables
const BUCKET_NAME = process.env.GCP_BUCKET_NAME || "jamb-images";
const PROJECT_ID = process.env.GCP_PROJECT_ID || "";
const CLIENT_EMAIL = process.env.GCP_CLIENT_EMAIL || "";
const PRIVATE_KEY = (process.env.GCP_PRIVATE_KEY || "").replace(/\\n/g, "\n");

// 2) Initialize the Storage client
const storage = new Storage({
  projectId: PROJECT_ID,
  credentials: {
    client_email: CLIENT_EMAIL,
    private_key: PRIVATE_KEY,
  },
});

/**
 * POST /api/gcs-upload
 * Expects JSON body { name: string, type: string }
 * Returns { uploadUrl, publicUrl }
 *
 * We'll add extensionHeaders: { 'x-goog-acl': 'public-read' }
 * so that if the client also sends 'x-goog-acl: public-read' in the PUT,
 * the object is created with public read access.
 */
export async function POST(request: NextRequest) {
  try {
    const { name, type } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Missing 'name' in request body" },
        { status: 400 }
      );
    }

    console.log("Requested MIME type:", type);

    // 3) Get a reference to the bucket and file
    const bucket = storage.bucket(BUCKET_NAME);

    // Prepend a timestamp to avoid collisions
    const fileName = `uploads/${Date.now()}_${name}`;
    const file = bucket.file(fileName);

    // 4) Generate a signed URL for PUT
    //    The URL expires in 15 minutes (for example).
    //    We omit 'contentType' to avoid 403 if MIME changes.
    //    We add extensionHeaders for public-read ACL.
    const expiresAtMs = Date.now() + 15 * 60 * 1000;
    const [uploadUrl] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: expiresAtMs,
      // not specifying contentType
      //extensionHeaders: {"x-goog-acl": "public-read",},
    });

    // We'll assume we want the final GET URL to be:
    const publicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${fileName}`;

    // Return to the client
    return NextResponse.json({
      uploadUrl,
      publicUrl,
    });
  } catch (err: any) {
    console.error("Error in /api/gcs-upload:", err);
    return NextResponse.json(
      { error: "Failed to create signed URL" },
      { status: 500 }
    );
  }
}