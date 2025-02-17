"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";

/**
 * A single work item in your data.
 */
interface WorkItem {
  type: string;
  code: string;
  unitOfMeasurement: string;
  quantity: number;
  laborCost: number;
  materialsCost: number;
  serviceFeeOnLabor?: number;
  serviceFeeOnMaterials?: number;
  total: number;
  paymentType?: string;
  paymentCoefficient?: number;
  materials?: Array<{
    external_id: string;
    quantity: number;
    costPerUnit: number;
    total: number;
  }>;
}

/**
 * PlaceOrderButtonProps:
 * - photos: array of strings (base64 or normal URLs).
 * - orderData: top-level data for "composite-order/create".
 * - onOrderSuccess?: optional callback if you want a custom flow after success.
 */
interface PlaceOrderButtonProps {
  photos: string[];
  orderData: {
    zipcode: string;
    address: string;
    description: string;
    selectedTime: string;
    timeCoefficient: number;
    laborSubtotal: number;
    sumBeforeTax: number;
    finalTotal: number;
    taxRate: number;
    taxAmount: number;
    worksData: WorkItem[];
    serviceFeeOnLabor?: number;
    serviceFeeOnMaterials?: number;
    paymentType?: string;
    paymentCoefficient?: number;
  };
  onOrderSuccess?: () => void;
}

/**
 * Detect whether a base64 string is a HEIC image (e.g. 'data:image/heic...' or 'data:image/heif...').
 */
function isHeicBase64(base64Data: string): boolean {
  const match = base64Data.match(/^data:(image\/[^;]+);base64,/);
  if (!match) return false;
  const mimeType = match[1].toLowerCase();
  return mimeType.includes("heic") || mimeType.includes("heif");
}

/**
 * Converts a HEIC base64 string => File with image/jpeg.
 * This dynamically imports `heic2any` inside.
 */
async function convertHeicBase64ToFile(base64Data: string): Promise<File> {
  // First, reuse base64ToFile to get a "File" with type 'image/heic'
  const heicFile = base64ToFile(base64Data);

  // Then convert to JPEG via heic2any (dynamic import)
  const { default: heic2any } = await import("heic2any");

  const converted = await heic2any({
    blob: heicFile,
    toType: "image/jpeg",
    quality: 0.8, // adjust if needed
  });
  const blobParts = Array.isArray(converted) ? converted : [converted];
  return new File(blobParts, `photo_${Date.now()}.jpeg`, { type: "image/jpeg" });
}

/**
 * Converts a base64-encoded string => File object (synchronously).
 */
function base64ToFile(base64Data: string): File {
  const match = base64Data.match(/^data:(.*?);base64,(.*)$/);
  if (!match) {
    throw new Error("Invalid base64 string format");
  }
  const mimeType = match[1];
  const base64Str = match[2];

  const byteChars = atob(base64Str);
  const byteNums = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNums[i] = byteChars.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNums);

  // Derive the extension from mimeType if present, else default to png
  const ext = mimeType.split("/")[1] || "png";
  const fileName = `photo_${Date.now()}.${ext}`;
  return new File([byteArray], fileName, { type: mimeType });
}

/**
 * PlaceOrderButton:
 * 1) If user is not logged in => store temp data => redirect to /login
 * 2) If logged in => compress images => upload => build final JSON => POST => success => /thank-you
 */
export default function PlaceOrderButton({
  photos,
  orderData,
  onOrderSuccess,
}: PlaceOrderButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  /**
   * Checks if there's an "authToken" in sessionStorage.
   * If not, user is not considered logged in.
   */
  function isUserLoggedIn(): boolean {
    return !!sessionStorage.getItem("authToken");
  }

  /**
   * Main handler for placing the order.
   */
  async function handlePlaceOrder() {
    // If not logged in => store data => /login
    if (!isUserLoggedIn()) {
      sessionStorage.setItem("tempOrderData", JSON.stringify(orderData));
      sessionStorage.setItem("tempOrderPhotos", JSON.stringify(photos));
      router.push("/login?next=/calculate/checkout");
      return;
    }

    setLoading(true);
    try {
      const token = sessionStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authToken found. Please log in again.");
      }

      const uploadedPhotoUrls: string[] = [];
      let anyPhotoFailed = false; // track if any upload fails

      // Process each photo
      for (const p of photos) {
        // If starts with "data:", it's a base64-encoded image
        if (p.startsWith("data:")) {
          try {
            let file: File;

            // 1) Check if it's HEIC
            if (isHeicBase64(p)) {
              console.log("Detected HEIC base64 => converting to JPEG...");
              file = await convertHeicBase64ToFile(p);
              console.log("HEIC converted =>", file);
            } else {
              // otherwise, regular base64 => File
              file = base64ToFile(p);
            }

            // 2) Compress the file using "browser-image-compression"
            const options = {
              maxSizeMB: 1,
              maxWidthOrHeight: 1920,
              useWebWorker: true,
            };
            const compressedFile = await imageCompression(file, options);

            console.log("Compressed file =>", {
              name: compressedFile.name,
              type: compressedFile.type,
              size: compressedFile.size,
            });

            // 3) Request signed URL from /api/gcs-upload
            const signedUrlResp = await fetch("/api/gcs-upload", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: compressedFile.name,
                type: compressedFile.type,
              }),
            });

            if (!signedUrlResp.ok) {
              throw new Error("Failed to get signed URL from /api/gcs-upload");
            }
            const { uploadUrl, publicUrl } = await signedUrlResp.json();
            console.log("Signed URL =>", uploadUrl);

            // 4) Upload to GCS via PUT
            const uploadResp = await fetch(uploadUrl, {
              method: "PUT",
              headers: {
                "Content-Type": compressedFile.type,
              },
              body: compressedFile,
            });

            // 5) Read GCS response text in case of error
            const gcsResponseText = await uploadResp.text();
            console.log("PUT upload response status:", uploadResp.status);
            console.log("GCS response body =>", gcsResponseText);

            if (!uploadResp.ok) {
              throw new Error(`Photo upload to GCS failed: ${gcsResponseText}`);
            }

            // If upload succeeded, push the final URL
            uploadedPhotoUrls.push(publicUrl);
          } catch (photoErr) {
            anyPhotoFailed = true;
            console.error("Photo upload failed, skipping this image:", photoErr);
          }
        } else {
          // If not base64 => likely a URL from session => just reuse
          uploadedPhotoUrls.push(p);
        }
      }

      // If some photos failed, optionally notify user but proceed
      if (anyPhotoFailed) {
        alert(
          "Some photos failed to upload, but the order will still be placed without those images."
        );
      }

      // 3) Build "works" array for the order
      const works = orderData.worksData.map((w) => ({
        type: w.type,
        code: w.code,
        unit_of_measurement: w.unitOfMeasurement,
        work_count: String(w.quantity),
        labor_cost: w.laborCost.toFixed(2),
        materials_cost: w.materialsCost.toFixed(2),
        service_fee_on_labor: w.serviceFeeOnLabor
          ? w.serviceFeeOnLabor.toFixed(2)
          : "0.00",
        service_fee_on_materials: w.serviceFeeOnMaterials
          ? w.serviceFeeOnMaterials.toFixed(2)
          : "0.00",
        total: w.total.toFixed(2),
        payment_type:
          w.paymentType && w.paymentType.trim() !== ""
            ? w.paymentType
            : "n/a",
        payment_coefficient: w.paymentCoefficient
          ? w.paymentCoefficient.toFixed(2)
          : "1.00",
        materials: w.materials
          ? w.materials.map((m) => ({
              external_id: m.external_id,
              quantity: m.quantity,
              cost_per_unit: m.costPerUnit.toFixed(2),
              total: m.total.toFixed(2),
            }))
          : [],
      }));

      // 4) Build the final JSON to send to /api/orders/create
      const serviceFeeOnLabor = orderData.serviceFeeOnLabor
        ? orderData.serviceFeeOnLabor.toFixed(2)
        : "0.00";
      const serviceFeeOnMaterials = orderData.serviceFeeOnMaterials
        ? orderData.serviceFeeOnMaterials.toFixed(2)
        : "0.00";

      const paymentType =
        orderData.paymentType && orderData.paymentType.trim() !== ""
          ? orderData.paymentType
          : "n/a";
      const paymentCoefficient = orderData.paymentCoefficient
        ? orderData.paymentCoefficient.toFixed(2)
        : "1.00";

      const bodyToSend = {
        zipcode: orderData.zipcode,
        user_token: sessionStorage.getItem("authToken"), // or token
        common: {
          address: orderData.address,
          photos: uploadedPhotoUrls,
          description: orderData.description,
          selected_date: orderData.selectedTime,
          date_coefficient: orderData.timeCoefficient.toFixed(2),
        },
        works,
        tax_rate: orderData.taxRate.toFixed(2),
        tax_amount: orderData.taxAmount.toFixed(2),
        date_surcharge: (
          orderData.laborSubtotal * (orderData.timeCoefficient - 1)
        ).toFixed(2),
        service_fee_on_labor: serviceFeeOnLabor,
        service_fee_on_materials: serviceFeeOnMaterials,
        payment_type: paymentType,
        payment_coefficient: paymentCoefficient,
        subtotal: orderData.sumBeforeTax.toFixed(2),
        total: orderData.finalTotal.toFixed(2),
      };

      console.log("Sending final JSON to /api/orders/create:", bodyToSend);

      // 5) POST to /api/orders/create
      const createOrderResp = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyToSend),
      });

      if (!createOrderResp.ok) {
        let errorMessage = "";
        try {
          const maybeJson = await createOrderResp.json();
          errorMessage = maybeJson.error || JSON.stringify(maybeJson);
        } catch {
          const text = await createOrderResp.text();
          errorMessage = text;
        }
        throw new Error(errorMessage || `Error: ${createOrderResp.status}`);
      }

      const resultData = await createOrderResp.json();
      console.log("Order saved successfully:", resultData);

      // 6) success => optionally call onOrderSuccess or do a default flow
      if (onOrderSuccess) {
        onOrderSuccess();
      } else {
        alert("Order saved successfully!");
        sessionStorage.setItem("orderCode", resultData.order_code || "");
        sessionStorage.setItem("orderTotal", bodyToSend.total || "");
        router.push("/thank-you");
      }
    } catch (err: any) {
      console.error("Error placing order:", err);
      alert("Error placing order: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handlePlaceOrder}
      disabled={loading}
      className="bg-yellow-400 hover:bg-yellow-500 text-black py-3 px-6
                 rounded-md font-semibold text-lg shadow-sm transition-colors duration-200
                 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? "Saving order..." : "Save your order"}
    </button>
  );
}