import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import type http from "http";
import formidable, { Fields, Files } from "formidable";

export const runtime = "nodejs";

// We store references globally
let model: import("@tensorflow/tfjs").LayersModel | null = null;
let tf: typeof import("@tensorflow/tfjs-node") | null = null;

/**
 * Dynamically import @tensorflow/tfjs-node so Next.js won't parse/bundle it at build time.
 * Try to load the model.json if it exists. If not, model remains null.
 */
async function loadModelIfExists() {
  if (model) return;

  try {
    // Dynamic import with type info
    tf = (await import("@tensorflow/tfjs-node")) as typeof import("@tensorflow/tfjs-node");
    const modelFile = path.join(process.cwd(), "public", "model", "model.json");

    if (!fs.existsSync(modelFile)) {
      console.warn("No model.json found. Model remains null.");
      return;
    }
    const modelPath = `file://${modelFile}`;
    model = await tf.loadLayersModel(modelPath);
    console.log("TF.js model loaded via dynamic import.");
  } catch (err) {
    console.error("Failed to load tfjs-node or model:", err);
    model = null;
    tf = null;
  }
}

export async function POST(request: NextRequest) {
  try {
    await loadModelIfExists();

    // Convert NextRequest.body to Node.js stream
    const nodeStream = request.body ? toNodeReadable(request.body) : null;
    if (!nodeStream) {
      return NextResponse.json({ error: "No request body" }, { status: 400 });
    }

    // Parse the file
    const filePath = await parseFile(nodeStream);
    if (!filePath) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const imageBuffer = fs.readFileSync(filePath);

    // If model or tf is null, return placeholder
    if (!model || !tf) {
      return NextResponse.json({
        status: "ok",
        prediction: "NoModel",
        confidence: 0,
        message: "Model not loaded or tfjs-node import failed."
      });
    }

    // Real inference
    let inputTensor = tf.node.decodeImage(imageBuffer, 3);
    inputTensor = tf.image.resizeBilinear(inputTensor, [224, 224]);
    inputTensor = inputTensor.div(tf.scalar(255));
    inputTensor = inputTensor.expandDims(0);

    // Force predictions to tf.Tensor
    const predictions = model.predict(inputTensor) as import("@tensorflow/tfjs").Tensor;

    // dataSync() => Float32Array | Int32Array | Uint8Array, but we usually treat it as Float32Array
    const typedArray = predictions.dataSync() as Float32Array;
    const dataArray = Array.from(typedArray);
    const maxIdx = dataArray.indexOf(Math.max(...dataArray));
    const confidence = dataArray[maxIdx];

    // Example classes
    const exampleClasses = ["ClassA", "ClassB", "ClassC"];
    const predictedClass = exampleClasses[maxIdx] || "Unknown";

    return NextResponse.json({
      status: "ok",
      prediction: predictedClass,
      confidence
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

/**
 * Converts a ReadableStream to a Node.js readable stream.
 */
function toNodeReadable(stream: ReadableStream<Uint8Array>) {
  const { Readable } = require("stream");
  const nodeStream = new Readable({ read() {} });

  (async () => {
    const reader = stream.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        nodeStream.push(null);
        break;
      }
      nodeStream.push(value);
    }
  })();

  return nodeStream;
}

/**
 * Uses Formidable to parse the multipart/form-data and return
 * the local file path of the uploaded file.
 */
function parseFile(nodeStream: NodeJS.ReadableStream): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const form = formidable({
      multiples: false,
      maxFileSize: 10 * 1024 * 1024,
      uploadDir: "/tmp",
      keepExtensions: true,
    });

    form.parse(nodeStream as unknown as http.IncomingMessage, (err, fields: Fields, files: Files) => {
      if (err) return reject(err);

      const fileData = files.file;
      if (!fileData) return resolve(null);

      const singleFile = Array.isArray(fileData) ? fileData[0] : fileData;
      if (!singleFile || !singleFile.filepath) return resolve(null);

      resolve(singleFile.filepath);
    });
  });
}