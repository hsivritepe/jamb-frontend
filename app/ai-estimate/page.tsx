"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Redirect from /ai-estimate to /ai-estimate/photo by default.
 */
export default function AiEstimateIndexPage() {
  const router = useRouter();

  useEffect(() => {
    // Replace current URL with /ai-estimate/photo
    router.replace("/ai-estimate/photo");
  }, [router]);

  return null; // No UI shown, just immediate redirect
}