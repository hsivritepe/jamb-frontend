"use client";

import { ChangeEvent, useState } from "react";
import { Camera } from "lucide-react";
import PhotoModal from "./PhotoModal";

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
  const [showModal, setShowModal] = useState(false);

  const handleSelectCategory = (category: string) => {
    onChange({ target: { value: category } } as ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-12 pl-2 pr-12 rounded-lg border border-gray-300
                   focus:outline-none focus:ring-2 focus:ring-blue-500
                   placeholder:text-gray-600"
      />

      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="absolute right-3 top-3 text-gray-600 hover:text-gray-800" // hide button
        title="Photo recognition"
      >
        <Camera size={24} />
      </button>

      {showModal && (
        <PhotoModal
          onClose={() => setShowModal(false)}
          onSelectCategory={handleSelectCategory}
        />
      )}
    </div>
  );
}