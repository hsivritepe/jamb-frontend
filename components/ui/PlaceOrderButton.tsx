"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";


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
 * Detect whether a base64 string is a HEIC image.
 */
function isHeicBase64(base64Data: string): boolean {
  const match = base64Data.match(/^data:(image\/[^;]+);base64,/);
  if (!match) return false;
  const mimeType = match[1].toLowerCase();
  return mimeType.includes("heic") || mimeType.includes("heif");
}

/**
 * Converts a HEIC base64 => File (JPEG).
 */
async function convertHeicBase64ToFile(base64Data: string): Promise<File> {
  const heicFile = base64ToFile(base64Data);

  const { default: heic2any } = await import("heic2any");
  const converted = await heic2any({
    blob: heicFile,
    toType: "image/jpeg",
    quality: 0.8,
  });
  const blobParts = Array.isArray(converted) ? converted : [converted];
  return new File(blobParts, `photo_${Date.now()}.jpeg`, { type: "image/jpeg" });
}

/**
 * Converts any base64 => File.
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

  const ext = mimeType.split("/")[1] || "png";
  const fileName = `photo_${Date.now()}.${ext}`;
  return new File([byteArray], fileName, { type: mimeType });
}

/**
 * PlaceOrderButton:
 * 1) If user is not logged in => store data => redirect to /login?next=...
 *    (the "next" parameter is chosen based on the first "worksData[i].type")
 * 2) If user is logged in => compress images => upload => build final JSON => POST => success => /thank-you
 */
export default function PlaceOrderButton({
  photos,
  orderData,
  onOrderSuccess,
}: PlaceOrderButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function isUserLoggedIn(): boolean {
    return !!sessionStorage.getItem("authToken");
  }

  async function handlePlaceOrder() {
    // 1) Check if user is logged in
    if (!isUserLoggedIn()) {
      // Save temp data in session (so it can be recovered after login)
      sessionStorage.setItem("tempOrderData", JSON.stringify(orderData));
      sessionStorage.setItem("tempOrderPhotos", JSON.stringify(photos));

      // Determine nextPath by analyzing worksData[0].type
      let nextPath = "/calculate/checkout"; // default
      if (orderData.worksData.length > 0) {
        const firstType = orderData.worksData[0].type;
        if (firstType === "emergency") {
          nextPath = "/emergency/checkout";
        } else if (firstType === "rooms") {
          nextPath = "/rooms/checkout";
        } else if (firstType === "packages") {
          nextPath = "/packages/checkout";
        } else if (firstType === "services") {
          nextPath = "/calculate/checkout";
        }
        // add more else-if if needed
      }

      // Then push to login with the chosen next path
      router.push(`/login?next=${encodeURIComponent(nextPath)}`);
      return;
    }

    // 2) If user is already logged in => proceed with order creation
    setLoading(true);
    try {
      const token = sessionStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authToken found. Please log in again.");
      }

      const uploadedPhotoUrls: string[] = [];
      let anyPhotoFailed = false;

      // Upload each photo if it's base64
      for (const p of photos) {
        if (p.startsWith("data:")) {
          try {
            let file: File;
            if (isHeicBase64(p)) {
              file = await convertHeicBase64ToFile(p);
            } else {
              file = base64ToFile(p);
            }

            const options = {
              maxSizeMB: 1,
              maxWidthOrHeight: 1920,
              useWebWorker: true,
            };
            const compressedFile = await imageCompression(file, options);

            // Get a GCS "signed URL" from your server
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

            // Upload the file to GCS
            const uploadResp = await fetch(uploadUrl, {
              method: "PUT",
              headers: {
                "Content-Type": compressedFile.type,
              },
              body: compressedFile,
            });
            const gcsResponseText = await uploadResp.text();
            if (!uploadResp.ok) {
              throw new Error(`Photo upload to GCS failed: ${gcsResponseText}`);
            }

            // Keep track of the final public URL
            uploadedPhotoUrls.push(publicUrl);
          } catch (photoErr) {
            anyPhotoFailed = true;
            console.error("Photo upload failed:", photoErr);
          }
        } else {
          // Already a normal URL, just push it
          uploadedPhotoUrls.push(p);
        }
      }

      if (anyPhotoFailed) {
        alert(
          "Some photos failed to upload, but the order will still be placed without those images."
        );
      }

      // Build the "works" array for the JSON POST
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
          w.paymentType && w.paymentType.trim() !== "" ? w.paymentType : "n/a",
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

      // Additional numeric data
      const serviceFeeOnLabor = orderData.serviceFeeOnLabor
        ? orderData.serviceFeeOnLabor.toFixed(2)
        : "0.00";
      const serviceFeeOnMaterials = orderData.serviceFeeOnMaterials
        ? orderData.serviceFeeOnMaterials.toFixed(2)
        : "0.00";

      // Payment type is optional at top level; you can still pass "n/a" if you want
      const paymentType = "n/a";
      const paymentCoefficient = orderData.paymentCoefficient
        ? orderData.paymentCoefficient.toFixed(2)
        : "1.00";

      // Final JSON body
      const bodyToSend = {
        zipcode: orderData.zipcode,
        user_token: token,
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

      // POST /api/orders/create
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

      // Store order code & total so /thank-you can display them
      const orderCode = resultData.order_code || "";
      const orderTotal = bodyToSend.total || "";
      sessionStorage.setItem("orderCode", orderCode);
      sessionStorage.setItem("orderTotal", orderTotal);

      // If onOrderSuccess was provided, call it. Otherwise, go to thank-you.
      if (onOrderSuccess) {
        onOrderSuccess();
      } else {
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