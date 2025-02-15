"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";

/**
 * A single work item in your data:
 * - We no longer do any "mapUnitOfMeasurement"
 * - 'unitOfMeasurement' is used as-is.
 */
interface WorkItem {
  type: string;
  code: string;
  unitOfMeasurement: string;   // e.g. "sq ft", "each", etc.
  quantity: number;
  laborCost: number;
  materialsCost: number;
  serviceFeeOnLabor?: number;
  serviceFeeOnMaterials?: number;
  total: number;
  paymentType?: string;             // "Monthly", "upfront", etc.
  paymentCoefficient?: number;      // e.g. 1.10
  materials?: Array<{
    external_id: string;
    quantity: number;
    costPerUnit: number;
    total: number;
  }>;
}

/**
 * PlaceOrderButtonProps:
 * - photos: array of photo strings (base64 or normal URLs)
 * - orderData: top-level data for "composite-order/create" (zipcode, address, sums, etc.)
 *   plus top-level serviceFeeOnLabor, serviceFeeOnMaterials, paymentType, paymentCoefficient
 * - onOrderSuccess?: optional callback if you have a custom success flow
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

    // newly used top-level fields
    serviceFeeOnLabor?: number;      // if undefined => "0.00"
    serviceFeeOnMaterials?: number;  // if undefined => "0.00"
    paymentType?: string;            // if undefined => "n/a"
    paymentCoefficient?: number;     // if undefined => 1
  };
  onOrderSuccess?: () => void;
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

  const ext = mimeType.split("/")[1] || "png";
  const fileName = `photo_${Date.now()}.${ext}`;
  return new File([byteArray], fileName, { type: mimeType });
}

/**
 * PlaceOrderButton:
 * 1) If user is not logged in => store temp data => go /login?next=/calculate/checkout
 * 2) If logged in => compress base64 => upload => build final JSON => POST => success => /thank-you
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
    // If not logged in => save data to session => redirect
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

      // 1) Compress / upload photos if they are base64
      const uploadedPhotoUrls: string[] = [];
      for (const p of photos) {
        if (p.startsWith("data:")) {
          const file = base64ToFile(p);
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          };
          const compressedFile = await imageCompression(file, options);

          // request a signed URL from /api/gcs-upload
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

          // upload to GCS
          const uploadResp = await fetch(uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": compressedFile.type },
            body: compressedFile,
          });
          if (!uploadResp.ok) {
            throw new Error("Photo upload to GCS failed");
          }

          uploadedPhotoUrls.push(publicUrl);
        } else {
          // if normal URL => push as is
          uploadedPhotoUrls.push(p);
        }
      }

      // 2) Build "works" array
      const works = orderData.worksData.map((w) => ({
        type: w.type,
        code: w.code,
        unit_of_measurement: w.unitOfMeasurement, // use as-is
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

        // If user didn't specify => "n/a" or "1.00"
        payment_type:
          w.paymentType && w.paymentType.trim() !== ""
            ? w.paymentType
            : "n/a",
        payment_coefficient: w.paymentCoefficient
          ? w.paymentCoefficient.toFixed(2)
          : "1.00",

        // materials array
        materials: w.materials
          ? w.materials.map((m) => ({
              external_id: m.external_id,
              quantity: m.quantity,
              cost_per_unit: m.costPerUnit.toFixed(2),
              total: m.total.toFixed(2),
            }))
          : [],
      }));

      // 3) Build top-level fees
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

      // 4) Final JSON to send
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

        // top-level service fees
        service_fee_on_labor: serviceFeeOnLabor,
        service_fee_on_materials: serviceFeeOnMaterials,
        payment_type: paymentType,
        payment_coefficient: paymentCoefficient,

        // final sums
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

      // 6) success => store code & total => /thank-you
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