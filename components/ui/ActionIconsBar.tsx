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
 * All are active by default. If you want to disable them, add logic or more props.
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
        <span className="text-sm">Print</span>
      </button>

      {/* Share Button */}
      <button
        onClick={onShare}
        className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
      >
        <Share2 size={20} />
        <span className="text-sm">Share</span>
      </button>

      {/* Save Button */}
      <button
        onClick={onSave}
        className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
      >
        <Save size={20} />
        <span className="text-sm">Save</span>
      </button>
    </div>
  );
};

export default ActionIconsBar;