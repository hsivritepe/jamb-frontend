"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";

/**
 * WorkItem: describes a single work object in your "worksData".
 * Adjust fields to match your actual "composite-order/create" schema.
 */
interface WorkItem {
  type: string;               // e.g. "services"
  code: string;               // e.g. "1.1.1"
  unitOfMeasurement: string;  // e.g. "each", "sq ft", "lin ft"
  quantity: number;           // e.g. 1
  laborCost: number;          // e.g. 100.00
  materialsCost: number;      // e.g. 10.00
  serviceFeeOnLabor?: number;     // e.g. 10.00
  serviceFeeOnMaterials?: number; // e.g. 5.00
  total: number;                  // e.g. 110.00
  paymentType?: string;           // e.g. "Monthly" or "upfront"
  paymentCoefficient?: number;    // e.g. 1.10
  materials?: Array<{
    external_id: string;
    quantity: number;
    costPerUnit: number;
    total: number;
  }>;
}

/**
 * The props for PlaceOrderButton:
 */
interface PlaceOrderButtonProps {
  /**
   * Array of photos:
   * - If base64 => we compress & upload to GCS,
   * - If already a URL => we include as-is.
   */
  photos: string[];

  /**
   * Data required by the server for "composite-order/create".
   * For instance: zipcode, address, selectedTime, timeCoefficient, sums, and an array of works.
   */
  orderData: {
    zipcode: string;
    address: string;
    description: string;
    selectedTime: string;      // e.g. "02/16/2025 (morning)"
    timeCoefficient: number;   // e.g. 1.40
    laborSubtotal: number;
    sumBeforeTax: number;
    finalTotal: number;
    taxRate: number;
    taxAmount: number;
    worksData: WorkItem[];
  };

  /**
   * Optional callback on successful order creation.
   */
  onOrderSuccess?: () => void;
}

/**
 * A helper function to map local "unitOfMeasurement" to the API's valid choices.
 * Adjust the mapping logic as needed to match your backend's enumerations.
 */
function mapUnitOfMeasurement(localUnit: string): string {
  // Suppose your server only accepts: "each", "sq_ft", "lin_ft"
  // We'll do a simple switch or if-else. You can expand as needed.
  switch (localUnit.toLowerCase()) {
    case "sq ft":
    case "sq_ft":
    case "sq. ft":
      return "sq_ft";    // the server expects "sq_ft"
    case "lin ft":
    case "lin_ft":
    case "linear ft":
    case "linear_feet":
      return "lin_ft";   // the server expects "lin_ft"
    case "each":
    default:
      return "each";     // fallback or default
  }
}

/**
 * PlaceOrderButton:
 * 1) Checks login (sessionStorage "authToken"),
 * 2) Compresses base64 photos & uploads them to GCS (if needed),
 * 3) Builds JSON for /api/orders/create => "composite-order/create",
 * 4) Sends POST,
 * 5) Handles success or error,
 * 6) Optionally clears session data & redirects to "/thank-you".
 */
export default function PlaceOrderButton({
  photos,
  orderData,
  onOrderSuccess,
}: PlaceOrderButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  /**
   * Simple login check: read "authToken" from sessionStorage.
   */
  function isUserLoggedIn(): boolean {
    const token = sessionStorage.getItem("authToken");
    return !!token;
  }

  /**
   * Convert base64 => File, then compress => upload => or if a normal URL => skip.
   * Then create the order by calling /api/orders/create with the final JSON.
   */
  async function handlePlaceOrder() {
    // 1) If not logged in => go to /login
    if (!isUserLoggedIn()) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      // Retrieve token
      const token = sessionStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authToken found. Please log in again.");
      }

      // 2) Process photos => base64 => compress => upload
      const uploadedPhotoUrls: string[] = [];
      for (const photoStr of photos) {
        if (photoStr.startsWith("data:")) {
          // It's base64
          const file = base64ToFile(photoStr);
          // Compress
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          };
          const compressedFile = await imageCompression(file, options);

          // Request signed URL from our local route
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

          // Upload to GCS
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
          // Already a normal URL => just use as-is
          uploadedPhotoUrls.push(photoStr);
        }
      }

      // 3) Build "works" array for "composite-order/create"
      const works = orderData.worksData.map((w) => ({
        type: w.type,
        code: w.code,
        // we map local "unitOfMeasurement" => the server's accepted unit
        unit_of_measurement: mapUnitOfMeasurement(w.unitOfMeasurement),
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
        payment_type: w.paymentType && w.paymentType.trim() !== ""
          ? w.paymentType
          : "upfront",
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

      // 4) Construct the payload (the final JSON).
      // Make sure the fields match your "composite-order/create" specs:
      const bodyToSend = {
        zipcode: orderData.zipcode,
        user_token: token,
        common: {
          address: orderData.address,
          photos: uploadedPhotoUrls,
          description: orderData.description,
          // selected_date => "02/16/2025 (morning)" or "MM/DD/YYYY"
          selected_date: orderData.selectedTime,
          date_coefficient: orderData.timeCoefficient.toFixed(2),
        },
        works,
        tax_rate: orderData.taxRate.toFixed(2),
        tax_amount: orderData.taxAmount.toFixed(2),
        // date_surcharge => laborSubtotal * (timeCoefficient - 1)
        date_surcharge: (
          orderData.laborSubtotal *
          (orderData.timeCoefficient - 1)
        ).toFixed(2),
        // Example fields if your server requires them:
        service_fee_on_labor: "10.00",
        service_fee_on_materials: "5.00",
        payment_type: "Monthly", // or "upfront"
        payment_coefficient: "1.10",
        subtotal: orderData.sumBeforeTax.toFixed(2),
        total: orderData.finalTotal.toFixed(2),
      };

      console.log("Sending final JSON to /api/orders/create:", bodyToSend);

      // 5) POST to /api/orders/create (which then calls "composite-order/create").
      const createOrderResp = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyToSend),
      });

      if (!createOrderResp.ok) {
        // parse error from server
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

      // 6) On success => either call onOrderSuccess or do default
      if (onOrderSuccess) {
        onOrderSuccess();
      } else {
        alert("Order saved successfully!");
        // For example, store resultData.order_code and resultData.total in sessionStorage
        sessionStorage.setItem("orderCode", resultData.order_code || "");
        sessionStorage.setItem("orderTotal", bodyToSend.total || "");

        // Then navigate to /thank-you
        router.push("/thank-you");
      }

    } catch (error: any) {
      console.error("Error placing order:", error);
      alert("Error placing order: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Render the button with loading state.
   */
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

/**
 * base64ToFile:
 * Helper that converts a base64 data string => File object.
 * If you already have actual Files, you can skip this logic.
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