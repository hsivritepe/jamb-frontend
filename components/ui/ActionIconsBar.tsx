"use client";

import React, { FC } from "react";
import { Printer, Share2, Save } from "lucide-react";

interface ActionIconsBarProps {
  onPrint?: () => void;   // callback for Print
  onShare?: () => void;   // callback for Share
  onSave?: () => void;    // callback for Save
}

/**
 * A reusable action bar with three icon buttons: Print, Share, Save.
 * On smaller screens (<sm), we show only icons. 
 * From sm and above, we also show text labels.
 */
const ActionIconsBar: FC<ActionIconsBarProps> = ({
  onPrint,
  onShare,
  onSave,
}) => {
  return (
    <div className="flex items-center gap-4">
      {/* Print Button */}
      <button
        onClick={onPrint}
        className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
      >
        <Printer size={20} />
        {/* Text label hidden below sm */}
        <span className="hidden sm:inline text-sm">Print</span>
      </button>

      {/* Share Button */}
      <button
        onClick={onShare}
        className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
      >
        <Share2 size={20} />
        <span className="hidden sm:inline text-sm">Share</span>
      </button>

      {/* Save Button */}
      <button
        onClick={onSave}
        className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
      >
        <Save size={20} />
        <span className="hidden sm:inline text-sm">Save</span>
      </button>
    </div>
  );
};

export default ActionIconsBar;