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
 * Props for PlaceOrderButton.
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
 * Checks if a base64 string might be in HEIC format.
 */
function isHeicBase64(base64Data: string): boolean {
  const match = base64Data.match(/^data:(image\/[^;]+);base64,/);
  if (!match) return false;
  const mimeType = match[1].toLowerCase();
  return mimeType.includes("heic") || mimeType.includes("heif");
}

/**
 * Converts a HEIC base64 string into a JPEG File.
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
 * Converts any base64 data into a File object, inferring extension from its MIME type.
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
 * PlaceOrderButton creates an order, uploads photos in parallel, and sends a confirmation email.
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
    // If user is not logged in, store data and redirect to /login
    if (!isUserLoggedIn()) {
      sessionStorage.setItem("tempOrderData", JSON.stringify(orderData));
      sessionStorage.setItem("tempOrderPhotos", JSON.stringify(photos));

      let nextPath = "/calculate/checkout";
      if (orderData.worksData.length > 0) {
        const firstType = orderData.worksData[0].type;
        if (firstType === "emergency") nextPath = "/emergency/checkout";
        else if (firstType === "rooms") nextPath = "/rooms/checkout";
        else if (firstType === "packages") nextPath = "/packages/checkout";
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

      // 1) Parallel photo uploads
      const uploadPromises = photos.map(async (p) => {
        if (!p.startsWith("data:")) {
          return p;
        }
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
        } catch {
          return null;
        }
      });

      const uploadResults = await Promise.all(uploadPromises);
      const uploadedPhotoUrls = uploadResults.filter((url) => url != null);

      if (uploadedPhotoUrls.length < photos.length) {
        alert("Some photos failed to upload. Order will proceed without them.");
      }

      // 2) Build works array
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

      const serviceFeeOnLabor = orderData.serviceFeeOnLabor
        ? orderData.serviceFeeOnLabor.toFixed(2)
        : "0.00";
      const serviceFeeOnMaterials = orderData.serviceFeeOnMaterials
        ? orderData.serviceFeeOnMaterials.toFixed(2)
        : "0.00";
      const paymentType = orderData.paymentType || "n/a";
      const paymentCoefficient =
        orderData.paymentCoefficient?.toFixed(2) || "1.00";

      // 3) Request body for creating an order
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

      const orderCode = resultData.order_code || "";
      const orderTotal = bodyToSend.total || "";

      sessionStorage.setItem("orderCode", orderCode);
      sessionStorage.setItem("orderTotal", orderTotal);

      // Use stored user email from login
      const storedEmail = sessionStorage.getItem("userEmail") || "info@thejamb.com";

      const confirmationPayload = {
        email: storedEmail,
        orderId: orderCode,
        total: orderTotal,
        date: orderData.selectedTime || "",
      };

      await fetch("/api/send-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(confirmationPayload),
      })
        .then(async (resp) => {
          if (!resp.ok) {
            const data = await resp.json();
            throw new Error(data.error || "Failed to send email");
          }
        })
        .catch((err) => {
          console.error("Error sending confirmation email:", err);
        });

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