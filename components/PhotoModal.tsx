"use client";

import React, { ChangeEvent, useState, MouseEvent } from "react";
import { X } from "lucide-react";
import imageCompression from "browser-image-compression";

async function convertHeicFileToJpeg(file: File, quality = 0.6): Promise<File> {
  const { default: heic2any } = await import("heic2any");
  const converted = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality,
  });
  const blobs = Array.isArray(converted) ? converted : [converted];
  const jpegBlob = blobs[0] as Blob;
  return new File([jpegBlob], file.name.replace(/\.(heic|heif)$/i, ".jpg"), {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

function normalizeCategory(cat: string): string {
  if (cat.toLowerCase().endsWith("s")) {
    return cat.slice(0, -1);
  }
  return cat;
}

function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

interface PhotoModalProps {
  onClose: () => void;
  onSelectCategory: (cat: string) => void;
}

export default function PhotoModal({ onClose, onSelectCategory }: PhotoModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [categories, setCategories] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [recommendation, setRecommendation] = useState("");

  const handleOuterClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;
    if (files.length + selectedFiles.length > 1) {
      alert("You can upload up to 1 photo total.");
      e.target.value = "";
      return;
    }

    const newFiles: File[] = [];
    for (const rawFile of selectedFiles) {
      try {
        const lowerName = rawFile.name.toLowerCase();
        const isHeic =
          lowerName.endsWith(".heic") ||
          lowerName.endsWith(".heif") ||
          rawFile.type.includes("heic") ||
          rawFile.type.includes("heif");

        let convertedFile = rawFile;
        if (isHeic) {
          convertedFile = await convertHeicFileToJpeg(rawFile, 0.6);
        }

        const options = {
          maxWidthOrHeight: 1024,
          maxSizeMB: 0.3,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(convertedFile, options);
        newFiles.push(compressedFile);
      } catch (err: any) {
        setError(err.message || "File conversion/compression error");
      }
    }

    setFiles((prev) => [...prev, ...newFiles]);
    e.target.value = "";
    setCategories([]);
    setDescription("");
    setRecommendation("");
    setSubmitted(false);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setCategories([]);
    setDescription("");
    setRecommendation("");
    setSubmitted(false);
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      alert("No photo to send!");
      return;
    }
    setError(null);
    setLoading(true);
    setCategories([]);
    setDescription("");
    setRecommendation("");

    try {
      const formData = new FormData();
      formData.append("file", files[0], files[0].name);

      const response = await fetch("/api/predict", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      setCategories(data.categories || []);
      setDescription(data.description || "");
      setRecommendation(data.recommendation || "");
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Upload error");
    } finally {
      setLoading(false);
    }
  };

  const handlePredictionClick = async (cat: string) => {
    const finalCat = normalizeCategory(cat);
    onSelectCategory(finalCat);

    if (files[0]) {
      try {
        const formData = new FormData();
        formData.append("file", files[0]);
        formData.append("category", finalCat);

        const res = await fetch("/api/upload-gcs", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          throw new Error(`GCS upload failed with status ${res.status}`);
        }
      } catch (err) {
        setError((err as Error).message);
      }
    }

    onClose();
  };

  const handleNone = () => {
    onClose();
  };

  const getButtonLabel = () => {
    if (loading) return "Analyzing...";
    if (submitted) return "See results below";
    return "Send / Recognize";
  };

  const isButtonDisabled = () => {
    if (files.length === 0) return true;
    if (loading) return true;
    if (submitted) return true;
    return false;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
      onClick={handleOuterClick}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          relative bg-white sm:rounded-lg shadow-lg
          w-full 
          h-screen
          sm:h-auto
          sm:max-w-sm 
          sm:max-h-[90%]
          overflow-auto p-4
        "
      >
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Image Recognition
        </h2>

        <p className="text-sm text-gray-500 mb-2">
          Please attach 1 photo
        </p>

        <label
          htmlFor="photo-picker"
          className="block w-full text-center py-2 bg-blue-600 text-white
                     rounded-md font-medium cursor-pointer hover:bg-blue-700"
        >
          Choose Photo
        </label>
        <input
          type="file"
          id="photo-picker"
          accept="image/*,.heic,.heif"
          onChange={handleFileChange}
          className="hidden"
        />

        {error && <div className="text-red-500 mt-2 text-sm">{error}</div>}

        <div className="mt-4 grid grid-cols-1 gap-3">
          {files.map((file, idx) => {
            const previewUrl = createPreviewUrl(file);
            return (
              <div key={idx} className="relative group">
                <img
                  src={previewUrl}
                  alt={`Uploaded #${idx + 1}`}
                  className="w-full h-auto object-cover rounded-md border border-gray-300"
                />
                <button
                  onClick={() => handleRemoveFile(idx)}
                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600
                             text-white rounded-full w-6 h-6 flex items-center justify-center
                             opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove file"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isButtonDisabled()}
          className="mt-4 w-full py-2 bg-green-600 text-white rounded-md font-medium
                     hover:bg-green-700 disabled:bg-gray-400"
        >
          {getButtonLabel()}
        </button>

        {submitted && (categories.length > 0 || description || recommendation) && (
          <div className="mt-4 flex flex-col gap-2 border-t pt-3">
            <h3 className="text-sm font-semibold">Possible Categories:</h3>
            {categories.map((cat, i) => (
              <button
                key={i}
                onClick={() => handlePredictionClick(cat)}
                className="text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded"
              >
                {cat}
              </button>
            ))}

            <h3 className="text-sm font-semibold mt-2">Description:</h3>
            <p className="text-gray-800 text-sm">{description}</p>

            {recommendation && (
              <>
                <h3 className="text-sm font-semibold mt-2">Recommendation:</h3>
                <p className="text-gray-800 text-sm">{recommendation}</p>
              </>
            )}

            <button
              onClick={handleNone}
              className="w-full py-2 mt-3 bg-gray-300 hover:bg-gray-400 rounded-md font-medium"
            >
              None
            </button>
          </div>
        )}
      </div>
    </div>
  );
}