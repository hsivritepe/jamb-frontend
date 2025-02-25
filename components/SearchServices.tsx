"use client";

import { ChangeEvent } from "react";

// Props
interface SearchServicesProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

// Component
export default function SearchServices({
  value,
  onChange,
  placeholder = "Search...",
}: SearchServicesProps) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-12 px-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600"
      />
    </div>
  );
}