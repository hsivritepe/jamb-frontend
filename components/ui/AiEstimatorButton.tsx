"use client";

import Link from "next/link";
import { Wand } from "lucide-react";

/**
 * A reusable button that links to /ai-estimate,
 * styled with brand-like classes.
 */
export default function AiEstimatorButton() {
  return (
    <div className="w-full md:w-auto py-6">
      <Link
        href="/ai-estimate"
        className="
          w-full 
          md:w-[400px] 
          flex 
          items-center 
          justify-center 
          gap-2 
          border-2 
          border-blue-600 
          bg-brand-light
          text-blue-600 
          font-semibold 
          px-6 
          py-3 
          rounded-lg 
          hover:bg-blue-50
          transition-colors
        "
      >
        <Wand className="w-5 h-5" />
        Create Instant Estimate with AI
      </Link>
    </div>
  );
}