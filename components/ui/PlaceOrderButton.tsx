"use client";

export const dynamic = "force-dynamic";
import { useState } from "react";
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

/** Checks if a base64 string is HEIC format. */
function isHeicBase64(base64Data: string): boolean {
  const match = base64Data.match(/^data:(image\/[^;]+);base64,/);
  if (!match) return false;
  const mimeType = match[1].toLowerCase();
  return mimeType.includes("heic") || mimeType.includes("heif");
}

/** Converts a HEIC base64 image to a JPEG File. */
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

/** Converts any base64 data to a File. */
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

  const ext = mimeType.split("/")[1] || "png";
  const fileName = `photo_${Date.now()}.${ext}`;
  return new File([byteArray], fileName, { type: mimeType });
}

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
    if (!isUserLoggedIn()) {
      // Store data for later
      sessionStorage.setItem("tempOrderData", JSON.stringify(orderData));
      sessionStorage.setItem("tempOrderPhotos", JSON.stringify(photos));

      // Determine next path
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
      const token = sessionStorage.getItem("authToken");
      if (!token) {
        throw new Error("No auth token found.");
      }

      const uploadedPhotoUrls: string[] = [];
      let anyPhotoFailed = false;

      // Upload photos if needed
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

            // Get signed URL from server
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

            // Upload file to GCS
            const uploadResp = await fetch(uploadUrl, {
              method: "PUT",
              headers: { "Content-Type": compressedFile.type },
              body: compressedFile,
            });
            const gcsRespText = await uploadResp.text();
            if (!uploadResp.ok) {
              throw new Error(`GCS upload failed: ${gcsRespText}`);
            }
            uploadedPhotoUrls.push(publicUrl);
          } catch (err) {
            anyPhotoFailed = true;
            console.error("Photo upload error:", err);
          }
        } else {
          uploadedPhotoUrls.push(p);
        }
      }

      if (anyPhotoFailed) {
        alert("Some photos failed to upload. Order will proceed without them.");
      }

      // Build "works" array
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

      // Final request body
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

      const createOrderResp = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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