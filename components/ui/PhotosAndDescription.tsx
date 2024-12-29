"use client";

import React, { ChangeEvent } from "react";

interface PhotosAndDescriptionProps {
  photos: string[];
  description: string;
  onSetPhotos: React.Dispatch<React.SetStateAction<string[]>>;
  onSetDescription: React.Dispatch<React.SetStateAction<string>>;
  className?: string; 
}

/**
 * A reusable PhotosAndDescription block. 
 * 
 * It displays:
 *  - A "Choose Files" button to upload multiple images
 *  - A grid of previews with a remove button on each
 *  - A textarea for user-provided details
 */
export default function PhotosAndDescription({
  photos,
  description,
  onSetPhotos,
  onSetDescription,
  className,
}: PhotosAndDescriptionProps) {
  // Handler for file input
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // Restrict total number of photos to 12
    if (files.length > 12 || photos.length + files.length > 12) {
      alert("You can upload up to 12 photos total.");
      e.target.value = "";
      return;
    }
    const fileUrls = files.map((file) => URL.createObjectURL(file));
    onSetPhotos((prev) => [...prev, ...fileUrls]);
  };

  // Handler for removing a single photo from the array
  const handleRemovePhoto = (index: number) => {
    onSetPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div
      className={`max-w-[500px] ml-auto bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden ${
        className ? className : ""
      }`}
    >
      <h2 className="text-2xl font-medium text-gray-800 mb-4">
        Upload Photos &amp; Description
      </h2>

      <div className="flex flex-col gap-4">
        {/* Photo Uploader */}
        <div>
          <label
            htmlFor="photo-upload"
            className="block w-full px-4 py-2 text-center bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Choose Files
          </label>
          <input
            type="file"
            id="photo-upload"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          <p className="text-sm text-gray-500 mt-1">
            Maximum 12 images. Supported formats: JPG, PNG.
          </p>

          {/* Preview of uploaded photos */}
          <div className="mt-4 grid grid-cols-3 gap-4">
            {photos.map((photo, index) => (
              <div key={index} className="relative group">
                <img
                  src={photo}
                  alt={`Uploaded preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded-md border border-gray-300"
                />
                <button
                  onClick={() => handleRemovePhoto(index)}
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

        {/* Textarea for additional details */}
        <div>
          <textarea
            id="details"
            rows={5}
            value={description}
            onChange={(e) => onSetDescription(e.target.value)}
            placeholder="Please provide more details about your issue (optional)..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md 
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}