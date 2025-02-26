"use client";

import React, { ChangeEvent } from "react";
import { ImagePlus } from "lucide-react";

interface PhotosAndDescriptionProps {
  photos: string[];
  description: string;
  onSetPhotos: React.Dispatch<React.SetStateAction<string[]>>;
  onSetDescription: React.Dispatch<React.SetStateAction<string>>;
  className?: string;
}

export default function PhotosAndDescription({
  photos,
  description,
  onSetPhotos,
  onSetDescription,
  className,
}: PhotosAndDescriptionProps) {
  /**
   * Converts selected files into base64 strings and adds them to `photos`.
   * Limits total photos to 12.
   */
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 12 || photos.length + files.length > 12) {
      alert("You can upload up to 12 photos total.");
      e.target.value = "";
      return;
    }

    const fileReaders = files.map((file) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (evt) => {
          if (!evt.target?.result) {
            return reject("No FileReader result.");
          }
          resolve(evt.target.result as string);
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(fileReaders)
      .then((base64Array) => {
        onSetPhotos((prev) => [...prev, ...base64Array]);
      })
      .catch((err) => {
        console.error("Error reading files:", err);
      });

    e.target.value = "";
  };

  /**
   * Removes a photo by index from the `photos` array.
   */
  const handleRemovePhoto = (index: number) => {
    onSetPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div
      className={`
        w-full
        bg-#F8F9FB p-0
        sm:bg-brand-light sm:p-4 sm:rounded-lg sm:border sm:border-gray-300
        overflow-hidden
        ${className || ""}
        xl:max-w-[500px] xl:ml-auto
      `}
    >
      {/* For mobile: smaller title; for desktop: original styling */}
      <h2 className="text-xl font-semibold text-gray-800 mb-3 sm:text-2xl sm:font-medium sm:mb-4 pl-2 sm:pl-0">
        Upload Photos &amp; Description
      </h2>

      <div className="flex flex-col gap-4">
        {/* Uploader Section */}
        <div className="flex flex-col gap-2">
          {/* Mobile: icon + tip. Hidden on sm (640px) and above */}
          <label
            htmlFor="photo-upload"
            className="flex items-center gap-2 text-blue-600 cursor-pointer sm:hidden pl-2 sm:pl-0"
          >
            <ImagePlus className="w-5 h-5" />
            <span className="text-sm">
              Click to add up to 12 images
            </span>
          </label>

          {/* Desktop: original large button; hidden on mobile */}
          <label
            htmlFor="photo-upload"
            className="hidden sm:block w-full px-4 py-2 text-center font-semibold sm:font-medium bg-blue-500 text-white rounded-md 
                       cursor-pointer hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Choose Files
          </label>

          <p className="text-base text-gray-500 hidden sm:block">
            You can attach up to 12 images
          </p>

          <input
            type="file"
            id="photo-upload"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Display uploaded photos */}
          <div className="mt-2 grid grid-cols-3 gap-3 sm:mt-4 sm:gap-4">
            {photos.map((photo, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={photo}
                  alt={`Uploaded preview ${idx + 1}`}
                  className="w-full h-24 object-cover rounded-md border border-gray-300"
                />
                <button
                  onClick={() => handleRemovePhoto(idx)}
                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white 
                             rounded-full w-6 h-6 flex items-center justify-center 
                             opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove photo"
                >
                  <span className="text-sm">✕</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Description field - simpler for mobile, original for desktop */}
        <div>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => onSetDescription(e.target.value)}
            placeholder="Please provide details about your issue (optional)"
            className={`
              w-full border border-gray-300 rounded-xl sm:rounded-md
              focus:outline-none focus:ring-blue-500
              text-base p-2 sm:p-4 sm:focus:ring-2
              placeholder:text-gray-600 sm:placeholder:text-gray-400
            `}
          />
        </div>
      </div>
    </div>
  );
}