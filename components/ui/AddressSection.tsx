"use client";

import React, { ChangeEvent } from "react";

interface AddressSectionProps {
  address: string;
  onAddressChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onUseMyLocation: () => void;
  className?: string; 
}

/**
 * A reusable AddressSection block. 
 */
export default function AddressSection({
  address,
  onAddressChange,
  onUseMyLocation,
  className,
}: AddressSectionProps) {
  return (
    <div
      className={`max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden mb-6 ${
        className ? className : ""
      }`}
    >
      <h2 className="text-2xl font-medium text-gray-800 mb-4">
        We Need Your Address
      </h2>

      <div className="flex flex-col gap-4">
        <input
          type="text"
          value={address}
          onChange={onAddressChange}
          onFocus={(e) => (e.target.placeholder = "")}
          onBlur={(e) => (e.target.placeholder = "Enter your address")}
          placeholder="Enter your address"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={onUseMyLocation}
          className="text-blue-600 text-left"
        >
          Use my location
        </button>
      </div>
    </div>
  );
}