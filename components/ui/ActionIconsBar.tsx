"use client";

import React, { FC } from "react";
import { Printer, Share2, Save } from "lucide-react";

interface SingleActionButtonProps {
  onPrint?: () => void;
}

/**
 * A single button showing three icons (Printer, Share, Save),
 * with a hover effect and optional print action.
 */
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
      <span className="hidden sm:inline text-sm">Print</span>
    </button>
  );
};

export default SingleActionButton;