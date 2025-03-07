"use client";

import { ChangeEvent, useState } from "react";
import { Camera } from "lucide-react";
import PhotoClassifier from "@/components/PhotoClassifier";

interface SearchServicesProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export default function SearchServices({
  value,
  onChange,
  placeholder = "Search...",
}: SearchServicesProps) {
  // State to toggle the PhotoClassifier
  const [showClassifier, setShowClassifier] = useState(false);

  return (
    <div className="relative">
      {/* The main search input */}
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-12 px-2 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600"
      />

      {/* Camera button, positioned on the right side of the input */}
      <button
        type="button"
        onClick={() => setShowClassifier(true)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        title="Open Photo Classifier"
      >
        <Camera size={20} />
      </button>

      {/* Conditionally render PhotoClassifier (could be a modal or inline) */}
      {showClassifier && (
        <div className="absolute top-14 left-0 bg-white p-4 z-10 shadow-lg border rounded-md w-full">
          {/* If we want to close the classifier, we'd pass an onClose prop to PhotoClassifier */}
          <PhotoClassifier />

          <button
            onClick={() => setShowClassifier(false)}
            className="text-sm text-gray-500 mt-2 underline"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}