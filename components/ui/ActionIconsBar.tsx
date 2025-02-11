"use client";

import React, { FC } from "react";
import { Printer, Share2, Save } from "lucide-react";

/**
 * Single button showing three icons (Printer, Share, Save)
 */
interface SingleActionButtonProps {
  onPrint?: () => void; // we only call this one
}

const SingleActionButton: FC<SingleActionButtonProps> = ({ onPrint }) => {
  return (
    <button
      onClick={onPrint}
      className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:text-gray-900"
    >
      {/* Icons displayed side by side */}
      <Printer size={20} />
      <Share2 size={20} />
      <Save size={20} />
      
      {/* Text label (hidden on small screens) */}
      <span className="hidden sm:inline text-sm">Print</span>
    </button>
  );
};

export default SingleActionButton;