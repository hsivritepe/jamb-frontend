"use client";

import React, { ChangeEvent } from "react";

interface AddressSectionProps {
  address: string;
  onAddressChange: (e: ChangeEvent<HTMLInputElement>) => void;
  zip: string;
  onZipChange: (e: ChangeEvent<HTMLInputElement>) => void;
  stateName: string;
  onStateChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onUseMyLocation: () => void;
  className?: string;
}

export default function AddressSection({
  address,
  onAddressChange,
  zip,
  onZipChange,
  stateName,
  onStateChange,
  onUseMyLocation,
  className,
}: AddressSectionProps) {
  return (
    <div
      className={`
        w-full
        xl:max-w-[500px] xl:ml-auto
        bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden mb-6
        ${className || ""}
      `}
    >
      <h2 className="text-2xl font-semibold sm:font-medium text-gray-800 mb-4">
        We Need Your Address
      </h2>

      <div className="flex flex-col gap-4">
        {/* Address */}
        <input
          type="text"
          value={address}
          onChange={onAddressChange}
          placeholder="Enter your address"
          className="w-full px-4 py-2 border border-gray-300 rounded-md 
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* State */}
        <input
          type="text"
          value={stateName}
          onChange={onStateChange}
          placeholder="Enter your state"
          className="w-full px-4 py-2 border border-gray-300 rounded-md 
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* ZIP */}
        <input
          type="text"
          value={zip}
          onChange={onZipChange}
          placeholder="Enter your ZIP"
          className="w-full px-4 py-2 border border-gray-300 rounded-md 
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button onClick={onUseMyLocation} className="text-blue-600 text-left mt-2 font-semibold sm:font-medium">
          Use my location
        </button>
      </div>
    </div>
  );
}