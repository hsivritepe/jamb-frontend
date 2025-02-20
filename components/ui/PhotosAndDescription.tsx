"use client";

import React, { ChangeEvent } from "react";

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
   * Resets input to allow re-selecting the same file if needed.
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
        w-full xl:max-w-[500px] xl:ml-auto
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

        {/* Description field */}
        <div>
          <textarea
            rows={5}
            value={description}
            onChange={(e) => onSetDescription(e.target.value)}
            placeholder="Please provide details about your issue (optional)..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md 
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}