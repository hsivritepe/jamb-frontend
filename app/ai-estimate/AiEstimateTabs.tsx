"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** 
 * Helper to check if pathname starts with "/ai-estimate/<route>" 
 */
function isActive(pathname: string, route: string) {
  return pathname.startsWith(`/ai-estimate/${route}`);
}

export default function AiEstimateTabs() {
  const pathname = usePathname() || "";

  return (
    <div className="border-b flex gap-6 font-semibold sm:font-medium text-gray-700">
      <Link
        href="/ai-estimate/photo"
        className={`pb-2 ${
          isActive(pathname, "photo") ? "border-b-2 border-blue-600 text-blue-600" : ""
        }`}
      >
        Photo
      </Link>

      <Link
        href="/ai-estimate/text"
        className={`pb-2 ${
          isActive(pathname, "text") ? "border-b-2 border-blue-600 text-blue-600" : ""
        }`}
      >
        Text
      </Link>

      <Link
        href="/ai-estimate/chat"
        className={`pb-2 ${
          isActive(pathname, "chat") ? "border-b-2 border-blue-600 text-blue-600" : ""
        }`}
      >
        Chat
      </Link>

      <Link
        href="/ai-estimate/pdf"
        className={`pb-2 ${
          isActive(pathname, "pdf") ? "border-b-2 border-blue-600 text-blue-600" : ""
        }`}
      >
        PDF
      </Link>

      <Link
        href="/ai-estimate/emergency"
        className={`pb-2 ${
          isActive(pathname, "emergency") ? "border-b-2 border-red-600 text-red-600" : ""
        }`}
      >
        Emergency
      </Link>
    </div>
  );
}