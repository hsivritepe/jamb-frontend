"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";

interface PlaceOrderButtonProps {
  // Photos can be stored as base64 or File[]
  photos: string[];
  // Any other data related to the order (address, description, total, etc.)
  orderData: {
    address: string;
    description: string;
    finalTotal: number;
    // ... anything else needed to create the order
  };
  // Optional callback function to run after the order is successfully created
  onOrderSuccess?: () => void;
}

/**
 * Reusable "Place Order" button:
 * 1) Checks user authorization
 * 2) Uploads (and optionally compresses) photos to GCS
 * 3) Creates an order in the database (through your API)
 */
export default function PlaceOrderButton({
  photos,
  orderData,
  onOrderSuccess,
}: PlaceOrderButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // A simple example of checking if the user is logged in:
  // looks for a JWT token in localStorage (or any other auth logic you have)
  function isUserLoggedIn(): boolean {
    const token = localStorage.getItem("accessToken");
    return !!token; // true if token exists, false otherwise
  }

  async function handlePlaceOrder() {
    if (!isUserLoggedIn()) {
      // If the user is not logged in, redirect to the login page
      router.push("/login");
      return;
    }

    setLoading(true);

    try {
      // 1) Optionally: compress/optimize images
      //    If images are stored as base64, first convert base64 => Blob/File.
      //    If you already have File[], you can do compressedFile = imageCompression(file, options).
      const compressedFiles: File[] = [];

      for (const base64 of photos) {
        // Example: convert base64 to Blob/File if needed
        const file = base64ToFile(base64);
        // Compress the file
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        const compressed = await imageCompression(file, options);
        compressedFiles.push(compressed);
      }

      // 2) Upload each photo to GCS and collect the array of public URLs
      const uploadedUrls: string[] = [];
      for (const file of compressedFiles) {
        // 2a) Request a signed URL from the backend
        const res = await fetch("/api/gcs-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: file.name,
            type: file.type,
          }),
        });
        if (!res.ok) {
          throw new Error("Error getting signed URL");
        }
        const { uploadUrl, publicUrl } = await res.json();

        // 2b) Upload the file directly to GCS using the signed URL
        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!uploadRes.ok) {
          throw new Error("Upload to GCS failed");
        }

        // 2c) Store the publicUrl in the array
        uploadedUrls.push(publicUrl);
      }

      // 3) Create the order (e.g. POST /api/orders)
      //    Pass all necessary fields: address, description, total, array of photo URLs, etc.
      const createOrderRes = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({
          ...orderData,
          photoUrls: uploadedUrls,
        }),
      });

      if (!createOrderRes.ok) {
        // Optionally parse JSON for an error message
        const errData = await createOrderRes.json();
        throw new Error(errData.message || "Error creating order");
      }

      // If the order is created, either call onOrderSuccess or do your own redirect
      if (onOrderSuccess) {
        onOrderSuccess();
      } else {
        alert("Order created successfully!");
        // For example, redirect to a confirmation page
        router.push("/orders/thank-you");
      }
    } catch (error: any) {
      console.error(error);
      alert("Error placing order: " + error.message);
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
      {loading ? "Placing order..." : "Place your order"}
    </button>
  );
}

/**
 * Example function to convert a base64 string into a File.
 * If you already have File[], you can skip this step.
 */
function base64ToFile(base64Data: string): File {
  // Parse the dataURL header
  const matches = base64Data.match(/^data:(.*?);base64,(.*)$/);
  if (!matches) {
    throw new Error("Invalid base64 string");
  }
  const mimeType = matches[1];
  const base64String = matches[2];

  const byteCharacters = atob(base64String);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);

  // Generate a file name
  const fileName = `photo_${Date.now()}.${mimeType.split("/")[1] || "png"}`;
  return new File([byteArray], fileName, { type: mimeType });
}