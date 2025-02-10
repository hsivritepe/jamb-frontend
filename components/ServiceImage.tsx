"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image"; // <-- import from next/image

/**
 * Converts something like "1-1-1" => "1.1.1"
 */
function convertServiceIdToApiFormat(serviceId: string): string {
  return serviceId.replaceAll("-", ".");
}

/**
 * A reusable component that fetches the service image (image_href) via a POST request
 * to "https://dev.thejamb.com/works" (body: { category: "1.1.1" }),
 * then displays it using Next.js Image with a border and rounded corners.
 * This enables automatic image compression/optimization by Next.js.
 */
export default function ServiceImage({ serviceId }: { serviceId: string }) {
  const [imageHref, setImageHref] = useState<string | null>(null);

  useEffect(() => {
    async function loadServiceImage() {
      try {
        const code = convertServiceIdToApiFormat(serviceId);
        const fullUrl = "https://dev.thejamb.com/works";
        const res = await fetch(fullUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ category: code }),
        });
        if (!res.ok) {
          throw new Error("Failed to fetch service image info");
        }
        const data = await res.json();
        // data should be an array: [{ name, work_code, description, image_href, unit_of_measurement }, ...]
        if (Array.isArray(data) && data.length > 0 && data[0].image_href) {
          setImageHref(data[0].image_href);
        }
      } catch (err) {
        console.error("ServiceImage error:", err);
      }
    }
    loadServiceImage();
  }, [serviceId]);

  if (!imageHref) return null;

  // Return the Next.js <Image /> with a border, rounded corners, full width, and some default height or aspect ratio.
  return (
    <div className="mb-2 border rounded overflow-hidden">
      <Image
        src={imageHref}
        alt="Service"
        width={600}    // or your chosen width
        height={400}   // or your chosen height
        style={{ objectFit: "cover" }}
      />
    </div>
  );
}