"use client";
import React, { useState, useEffect } from "react";

type ServiceType = {
  id: string;
  title: string;
  category?: string;
  description?: string;
  unit_of_measurement?: string;
  min_quantity?: number;
  max_quantity?: number;
};

// Helper to convert "1-2-3" to "1.2.3".
function dashToDot(str: string) {
  return str.replaceAll("-", ".");
}

function ServiceImage({ serviceId }: { serviceId: string }) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const dottedId = dashToDot(serviceId);
    const firstSeg = serviceId.split("-")[0];
    const fullUrl = `https://dev.thejamb.com/images/${firstSeg}/${dottedId}.jpg`;
    setImgSrc(fullUrl);
  }, [serviceId]);

  if (!imgSrc) return null;

  if (failed) {
    return (
      <img
        src="/images/fallback-service.jpg"
        alt="Fallback"
        className="object-cover w-full h-full"
      />
    );
  }

  return (
    <img
      src={imgSrc}
      alt={serviceId}
      className="object-cover w-full h-full"
      onError={() => setFailed(true)}
    />
  );
}

type ServiceCardProps = {
  service: ServiceType;
  quantity: number;
  typedValue: string | null;
  cost: number;
  isSelected: boolean;
  formatWithSeparator: (val: number) => string;
  onMinusClick: (serviceId: string) => void;
  onPlusClick: (serviceId: string) => void;
  onChangeQuantity: (serviceId: string, value: string) => void;
  onFocusQuantity: (serviceId: string) => void;
  onBlurQuantity: (serviceId: string) => void;
  onToggleSelect: (serviceId: string) => void;
};

export default function ServiceCard({
  service,
  quantity,
  typedValue,
  cost,
  isSelected,
  formatWithSeparator,
  onMinusClick,
  onPlusClick,
  onChangeQuantity,
  onFocusQuantity,
  onBlurQuantity,
  onToggleSelect,
}: ServiceCardProps) {
  const displayVal =
    typedValue !== null && typedValue !== undefined
      ? typedValue
      : String(quantity);

  const borderClass = isSelected ? "border border-blue-500" : "border border-gray-300";

  return (
    <div className={`border ${borderClass} rounded-md bg-white shadow-sm flex flex-col`}>
      {/* Top block for image - no padding, increased height, gradient fade at bottom */}
      <div className="relative h-40 w-full overflow-hidden rounded">
        <ServiceImage serviceId={service.id} />
        {/* Gradient overlay for fade-out */}
        <div className="pointer-events-none absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white to-transparent" />
      </div>

      {/* Content block with padding */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-md font-semibold text-gray-800">{service.title}</h3>
        <p className="text-xs text-gray-500">{service.category}</p>

        <div className="mt-auto">
          <div className="flex items-center gap-1 mt-2 mb-2">
            <button
              onClick={() => onMinusClick(service.id)}
              className="w-8 h-8 bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg rounded"
            >
              −
            </button>
            <input
              type="text"
              value={displayVal}
              onClick={() => onFocusQuantity(service.id)}
              onBlur={() => onBlurQuantity(service.id)}
              onChange={(e) => onChangeQuantity(service.id, e.target.value)}
              className="w-16 text-center px-1 py-1 border rounded text-sm"
            />
            <button
              onClick={() => onPlusClick(service.id)}
              className="w-8 h-8 bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg rounded"
            >
              +
            </button>
            <span className="text-sm text-gray-600 ml-1">
              {service.unit_of_measurement || "each"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-800">
              ${formatWithSeparator(cost)}
            </span>
            <button
              onClick={() => onToggleSelect(service.id)}
              className={
                "text-sm font-semibold px-3 py-1 rounded " +
                (isSelected
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-blue-600 text-white hover:bg-blue-700")
              }
            >
              {isSelected ? "Remove" : "Add"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}