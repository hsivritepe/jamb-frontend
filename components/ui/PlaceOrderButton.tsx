// jamb-frontend/components/ui/PlaceOrderButton.tsx

"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";

/**
 * Represents a single work item in the order.
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
 * Represents the props for PlaceOrderButton.
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
 * Checks if the base64 string might be in HEIC format (heic or heif).
 */
function isHeicBase64(base64Data: string): boolean {
  const match = base64Data.match(/^data:(image\/[^;]+);base64,/);
  if (!match) return false;
  const mimeType = match[1].toLowerCase();
  return mimeType.includes("heic") || mimeType.includes("heif");
}

/**
 * Converts a HEIC base64 string into a JPEG File.
 * Uses the "heic2any" package for conversion.
 */
async function convertHeicBase64ToFile(base64Data: string): Promise<File> {
  const heicFile = base64ToFile(base64Data);
  const { default: heic2any } = await import("heic2any");
  const convertedResult = await heic2any({
    blob: heicFile,
    toType: "image/jpeg",
    quality: 0.8,
  });
  const blobParts = Array.isArray(convertedResult) ? convertedResult : [convertedResult];
  return new File(blobParts, `photo_${Date.now()}.jpeg`, { type: "image/jpeg" });
}

/**
 * Converts any base64 data into a File object, inferring the extension from the MIME type.
 */
function base64ToFile(base64Data: string): File {
  const match = base64Data.match(/^data:(.*?);base64,(.*)$/);
  if (!match) {
    throw new Error("Invalid base64 format");
  }
  const mimeType = match[1];
  const base64Str = match[2];

  const byteChars = atob(base64Str);
  const byteNums = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNums[i] = byteChars.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNums);

  const extension = mimeType.split("/")[1] || "png";
  const fileName = `photo_${Date.now()}.${extension}`;
  return new File([byteArray], fileName, { type: mimeType });
}

/**
 * The PlaceOrderButton component handles:
 * 1) Checking if the user is logged in,
 * 2) Parallel uploading of photos using Promise.all,
 * 3) Creating the order (calling /api/orders/create),
 * 4) Sending a simple confirmation email (no PDF),
 * 5) Finally redirecting to /thank-you or calling onOrderSuccess.
 */
export default function PlaceOrderButton({
  photos,
  orderData,
  onOrderSuccess,
}: PlaceOrderButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  /**
   * Checks if the user is currently logged in by seeing if there's an authToken in sessionStorage.
   */
  function isUserLoggedIn(): boolean {
    return !!sessionStorage.getItem("authToken");
  }

  /**
   * Main handler triggered when clicking on the "Save your order" button.
   */
  async function handlePlaceOrder() {
    // If user is not logged in, store data in session and redirect to /login
    if (!isUserLoggedIn()) {
      sessionStorage.setItem("tempOrderData", JSON.stringify(orderData));
      sessionStorage.setItem("tempOrderPhotos", JSON.stringify(photos));

      // Determine where to redirect after login
      let nextPath = "/calculate/checkout";
      if (orderData.worksData.length > 0) {
        const firstType = orderData.worksData[0].type;
        if (firstType === "emergency") {
          nextPath = "/emergency/checkout";
        } else if (firstType === "rooms") {
          nextPath = "/rooms/checkout";
        } else if (firstType === "packages") {
          nextPath = "/packages/checkout";
        }
      }

      router.push(`/login?next=${encodeURIComponent(nextPath)}`);
      return;
    }

    setLoading(true);
    try {
      const authToken = sessionStorage.getItem("authToken");
      if (!authToken) {
        throw new Error("No auth token found.");
      }

      /**
       * 1) Parallel uploading of photos using Promise.all.
       *    This speeds up the total photo upload time if we have multiple images.
       */
      console.log("[DEBUG] Starting parallel photo uploads.");

      const uploadPromises = photos.map(async (p) => {
        // If photo is already a URL (not base64), just return it
        if (!p.startsWith("data:")) {
          return p;
        }
        // Otherwise, process base64 image
        try {
          let file: File;
          if (isHeicBase64(p)) {
            file = await convertHeicBase64ToFile(p);
          } else {
            file = base64ToFile(p);
          }
          const compressionOptions = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          };
          const compressedFile = await imageCompression(file, compressionOptions);

          // Get signed URL for GCS
          const signedUrlResp = await fetch("/api/gcs-upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: compressedFile.name,
              type: compressedFile.type,
            }),
          });
          if (!signedUrlResp.ok) {
            throw new Error("Failed to get signed URL");
          }
          const { uploadUrl, publicUrl } = await signedUrlResp.json();

          // Upload to GCS
          const uploadResp = await fetch(uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": compressedFile.type },
            body: compressedFile,
          });
          const gcsRespText = await uploadResp.text();
          if (!uploadResp.ok) {
            throw new Error(`GCS upload failed: ${gcsRespText}`);
          }
          return publicUrl;
        } catch (error) {
          console.error("Photo upload error:", error);
          return null;
        }
      });

      // Wait for all uploads to complete
      const uploadResults = await Promise.all(uploadPromises);
      const uploadedPhotoUrls = uploadResults.filter((url) => url != null);

      if (uploadedPhotoUrls.length < photos.length) {
        alert("Some photos failed to upload. Order will proceed without them.");
      }

      /**
       * 2) Build the "works" array from orderData. This part depends on your existing structure.
       */
      console.log("[DEBUG] Building works array.");

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
        payment_type: w.paymentType?.trim() || "n/a",
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

      // Additional fields that might be needed
      const serviceFeeOnLabor = orderData.serviceFeeOnLabor
        ? orderData.serviceFeeOnLabor.toFixed(2)
        : "0.00";
      const serviceFeeOnMaterials = orderData.serviceFeeOnMaterials
        ? orderData.serviceFeeOnMaterials.toFixed(2)
        : "0.00";
      const paymentType = orderData.paymentType || "n/a";
      const paymentCoefficient =
        orderData.paymentCoefficient?.toFixed(2) || "1.00";

      /**
       * 3) Prepare the body to send to /api/orders/create.
       *    This contains all the user_token, photos, works, and so on.
       */
      const bodyToSend = {
        zipcode: orderData.zipcode,
        user_token: authToken,
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

      console.log("[DEBUG] Creating order with bodyToSend:", bodyToSend);

      /**
       * 4) Call /api/orders/create to actually create the order in your backend.
       */
      const createOrderResp = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(bodyToSend),
      });

      if (!createOrderResp.ok) {
        let errMsg = "";
        try {
          const maybeJson = await createOrderResp.json();
          errMsg = maybeJson.error || JSON.stringify(maybeJson);
        } catch {
          errMsg = await createOrderResp.text();
        }
        throw new Error(errMsg || `Error: ${createOrderResp.status}`);
      }

      const resultData = await createOrderResp.json();
      console.log("[DEBUG] /api/orders/create response:", resultData);

      // Extract the order code from the server response
      const orderCode = resultData.order_code || "";
      const orderTotal = bodyToSend.total || "";

      // Store in sessionStorage for future use
      sessionStorage.setItem("orderCode", orderCode);
      sessionStorage.setItem("orderTotal", orderTotal);

      /**
       * 5) Send a simple confirmation email (without PDF) via /api/send-confirmation.
       *    The server might not return user email, so we might default to "info@thejamb.com".
       */
      const userEmail = resultData.email || "info@thejamb.com";
      console.log("[DEBUG] userEmail from server:", userEmail);
      console.log("[DEBUG] orderCode:", orderCode, "orderTotal:", orderTotal);
      console.log("[DEBUG] selectedTime:", orderData.selectedTime);

      const payload = {
        email: userEmail,
        orderId: orderCode,
        total: orderTotal,
        date: orderData.selectedTime || "",
      };

      console.log("[DEBUG] About to POST /api/send-confirmation with:", payload);

      await fetch("/api/send-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(async (resp) => {
          const data = await resp.json();
          if (!resp.ok) {
            throw new Error(data.error || "Failed to send email");
          }
          console.log("[DEBUG] Email sent response:", data.message);
        })
        .catch((err) => {
          console.error("Error sending confirmation email:", err);
        });

      /**
       * 6) Finally, either call onOrderSuccess or redirect to /thank-you.
       */
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