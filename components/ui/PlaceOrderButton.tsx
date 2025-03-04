"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";

/**
 * Interface representing a single material item inside a WorkItem.
 */
interface MaterialSpec {
  external_id: string;
  quantity: number;
  costPerUnit: number;
  total: number;
  name: string;
}

/**
 * Interface representing a single WorkItem in the order.
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
  materials?: MaterialSpec[];
}

/**
 * Interface for the props of PlaceOrderButton.
 */
interface PlaceOrderButtonProps {
  photos: string[]; // array of base64 or hosted URLs
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
 * Checks if the base64 string might be in HEIC format.
 */
function isHeicBase64(base64Data: string): boolean {
  const match = base64Data.match(/^data:(image\/[^;]+);base64,/);
  if (!match) return false;
  const mimeType = match[1].toLowerCase();
  return mimeType.includes("heic") || mimeType.includes("heif");
}

/**
 * Converts a HEIC base64 string into a JPEG File using heic2any.
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
 * This component handles:
 * 1) Checking user auth
 * 2) Uploading photos in parallel
 * 3) Creating the order in your backend (/api/orders/create)
 * 4) Sending a PDF confirmation email via /api/send-confirmation
 * 5) Redirecting to /thank-you or calling onOrderSuccess
 */
export default function PlaceOrderButton({
  photos,
  orderData,
  onOrderSuccess,
}: PlaceOrderButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  /**
   * Checks sessionStorage for authToken to confirm if user is logged in.
   */
  function isUserLoggedIn(): boolean {
    return !!sessionStorage.getItem("authToken");
  }

  /**
   * The main handler for placing the order.
   */
  async function handlePlaceOrder() {
    // If user not logged in, we save data in session and redirect to /login
    if (!isUserLoggedIn()) {
      sessionStorage.setItem("tempOrderData", JSON.stringify(orderData));
      sessionStorage.setItem("tempOrderPhotos", JSON.stringify(photos));

      // Decide which path to go after login
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
      // 1) Get auth token
      const authToken = sessionStorage.getItem("authToken");
      if (!authToken) {
        throw new Error("No auth token found.");
      }

      // 2) Parallel photo uploads
      const uploadPromises = photos.map(async (base64OrUrl) => {
        // If it's already a hosted URL, no upload needed
        if (!base64OrUrl.startsWith("data:")) {
          return base64OrUrl;
        }

        // Otherwise, convert from base64 -> file
        try {
          let file: File;
          if (isHeicBase64(base64OrUrl)) {
            file = await convertHeicBase64ToFile(base64OrUrl);
          } else {
            file = base64ToFile(base64OrUrl);
          }
          // Compress the file using browser-image-compression
          const compressionOptions = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          };
          const compressedFile = await imageCompression(file, compressionOptions);

          // Get signed URL from /api/gcs-upload
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
        } catch (err) {
          console.error("Photo upload error:", err);
          // If error, return null or skip
          return null;
        }
      });

      const uploadResults = await Promise.all(uploadPromises);
      const uploadedPhotoUrls = uploadResults.filter((url) => url != null) as string[];

      if (uploadedPhotoUrls.length < photos.length) {
        alert("Some photos failed to upload. Order will proceed without them.");
      }

      // 3) Build the "works" array for /api/orders/create
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
        payment_type: w.paymentType || "n/a",
        payment_coefficient: w.paymentCoefficient
          ? w.paymentCoefficient.toFixed(2)
          : "1.00",
        materials: w.materials
          ? w.materials.map((mat) => ({
              external_id: mat.external_id,
              quantity: mat.quantity,
              cost_per_unit: mat.costPerUnit.toFixed(2),
              total: mat.total.toFixed(2),
            }))
          : [],
      }));

      const serviceFeeOnLabor = orderData.serviceFeeOnLabor
        ? orderData.serviceFeeOnLabor.toFixed(2)
        : "0.00";
      const serviceFeeOnMaterials = orderData.serviceFeeOnMaterials
        ? orderData.serviceFeeOnMaterials.toFixed(2)
        : "0.00";

      // 4) Body for creating the order
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
        payment_type: orderData.paymentType || "n/a",
        payment_coefficient:
          orderData.paymentCoefficient?.toFixed(2) || "1.00",
        subtotal: orderData.sumBeforeTax.toFixed(2),
        total: orderData.finalTotal.toFixed(2),
      };

      // 5) Create the order via /api/orders/create
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

      // Save some info in sessionStorage
      sessionStorage.setItem("orderCode", orderCode);
      sessionStorage.setItem("orderTotal", orderTotal);

      // 6) Build the full data for PDF-based confirmation
      // We'll gather everything for the /api/send-confirmation route
      const userEmail = sessionStorage.getItem("userEmail") || "info@thejamb.com";

      // Convert numbers to strings for the PDF route
      const laborSubtotalStr = orderData.laborSubtotal.toFixed(2);
      const materialsSubtotalStr = (
        orderData.sumBeforeTax - orderData.laborSubtotal -
        (orderData.serviceFeeOnLabor ?? 0)
      ).toFixed(2); 
      // Or compute as needed
      const sumBeforeTaxStr = orderData.sumBeforeTax.toFixed(2);
      const finalTotalStr = orderData.finalTotal.toFixed(2);
      const taxAmountStr = orderData.taxAmount.toFixed(2);
      const timeCoefficientStr = orderData.timeCoefficient.toFixed(2);
      const sFeeLabor = (orderData.serviceFeeOnLabor ?? 0).toFixed(2);
      const sFeeMaterials = (orderData.serviceFeeOnMaterials ?? 0).toFixed(2);

      // Convert works data for the PDF
      const worksForPdf = orderData.worksData.map((w) => ({
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
        payment_type: w.paymentType ?? "n/a",
        payment_coefficient: w.paymentCoefficient
          ? w.paymentCoefficient.toFixed(2)
          : "1.00",
        materials: w.materials?.map((mat) => ({
          external_id: mat.external_id,
          name: mat.name || "",
          quantity: mat.quantity,
          cost_per_unit: mat.costPerUnit.toFixed(2),
          total: mat.total.toFixed(2),
        })) || [],
      }));

      // Build the final object for PDF route
      const pdfConfirmationBody = {
        email: userEmail,
        orderId: orderCode,
        address: orderData.address,
        description: orderData.description,
        selectedDate: orderData.selectedTime,
        laborSubtotal: laborSubtotalStr,
        materialsSubtotal: materialsSubtotalStr,
        sumBeforeTax: sumBeforeTaxStr,
        finalTotal: finalTotalStr,
        taxAmount: taxAmountStr,
        timeCoefficient: timeCoefficientStr,
        serviceFeeOnLabor: sFeeLabor,
        serviceFeeOnMaterials: sFeeMaterials,
        works: worksForPdf,
        photos: uploadedPhotoUrls, 
      };

      // 7) Call /api/send-confirmation to generate and email PDF
      await fetch("/api/send-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pdfConfirmationBody),
      })
        .then(async (resp) => {
          if (!resp.ok) {
            const errData = await resp.json();
            throw new Error(errData.error || "Failed to send PDF email");
          }
        })
        .catch((err) => {
          console.error("Error sending confirmation email with PDF:", err);
        });

      // 8) Done, go to /thank-you or call onOrderSuccess
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