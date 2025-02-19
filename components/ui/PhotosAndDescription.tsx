"use client";

import React, { ChangeEvent } from "react";

/**
 * PhotosAndDescriptionProps:
 * - photos: array of strings that will store base64-encoded images
 * - description: user-provided text
 * - onSetPhotos: state updater function for the photos array
 * - onSetDescription: state updater for the description text
 * - className (optional): additional CSS classes
 */
interface PhotosAndDescriptionProps {
  photos: string[];
  description: string;
  onSetPhotos: React.Dispatch<React.SetStateAction<string[]>>;
  onSetDescription: React.Dispatch<React.SetStateAction<string>>;
  className?: string;
}

/**
 * PhotosAndDescription:
 * This component allows users to pick image files, which are then read as
 * base64-encoded strings using FileReader.readAsDataURL. The resulting base64
 * strings (e.g. "data:image/jpeg;base64,...") are added to `photos`.
 *
 * The `PlaceOrderButton` checks for `p.startsWith("data:")` to identify
 * base64 images and upload them to Google Cloud Storage.
 */
export default function PhotosAndDescription({
  photos,
  description,
  onSetPhotos,
  onSetDescription,
  className,
}: PhotosAndDescriptionProps) {
  /**
   * handleFileChange:
   * When the user selects files, we convert each file into a base64 string
   * and update the `photos` array. We do not use blob: URLs here to ensure
   * that our `PlaceOrderButton` can detect base64 images for compression/upload.
   */
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // Limit to 12 total images
    if (files.length > 12 || photos.length + files.length > 12) {
      alert("You can upload up to 12 photos total.");
      e.target.value = "";
      return;
    }

    // Convert each selected file to a base64 data URL
    const readers = files.map((file) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (!ev.target?.result) {
            return reject("No result from FileReader");
          }
          // result is something like "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA..."
          resolve(ev.target.result as string);
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });
    });

    // Wait until all files have been read, then add them to our photos array
    Promise.all(readers)
      .then((base64Strings) => {
        onSetPhotos((prev) => [...prev, ...base64Strings]);
      })
      .catch((err) => {
        console.error("Error reading files:", err);
      });

    // Clear the file input, so the user can select the same file again if needed
    e.target.value = "";
  };

  /**
   * handleRemovePhoto:
   * Removes a photo (by index) from the array of photos.
   */
  const handleRemovePhoto = (index: number) => {
    onSetPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div
      className={`
        w-full
        xl:max-w-[500px] xl:ml-auto
        bg-brand-light p-4 rounded-lg border border-gray-300 overflow-hidden
        ${className || ""}
      `}
    >
      <h2 className="text-2xl font-semibold sm:font-medium text-gray-800 mb-4">
        Upload Photos &amp; Description
      </h2>

      <div className="flex flex-col gap-4">
        {/* Photo Uploader */}
        <div>
          <label
            htmlFor="photo-upload"
            className="block w-full px-4 py-2 text-center font-semibold sm:font-medium bg-blue-500 text-white rounded-md 
                       cursor-pointer hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
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

        {/* Description textarea */}
        <div>
          <textarea
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