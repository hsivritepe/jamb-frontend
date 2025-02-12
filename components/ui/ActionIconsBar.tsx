"use client";

import React, { FC } from "react";
import { Printer, Share2, Save } from "lucide-react";

/**
 * Single button showing three icons (Printer, Share, Save),
 * darkening the background on hover.
 */
interface SingleActionButtonProps {
  onPrint?: () => void; // Only calls this one function on click
}

const SingleActionButton: FC<SingleActionButtonProps> = ({ onPrint }) => {
  return (
    <button
      onClick={onPrint}
      className="
        flex items-center gap-2
        border border-gray-300
        rounded-lg px-4 py-2
        text-gray-700 hover:text-gray-900
        hover:bg-gray-100
        transition-colors duration-200
      "
    >
      <Printer size={20} />
      <Share2 size={20} />
      <Save size={20} />

      {/* Hidden text label on small screens */}
      <span className="hidden sm:inline text-sm">Print</span>
    </button>
  );
};

export default SingleActionButton;