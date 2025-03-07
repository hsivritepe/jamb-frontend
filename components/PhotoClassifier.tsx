"use client";

import React, { useState } from "react";

export default function PhotoClassifier() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string>("");

  // Change this to "/api/predict-inference" later when you want real inference
  const PREDICT_URL = "/api/predict-placeholder"; 

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(PREDICT_URL, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.error) {
        setResult(`Error: ${data.error}`);
      } else {
        setResult(`Prediction: ${data.prediction}, Confidence: ${data.confidence}`);
      }
    } catch (err) {
      console.error(err);
      setResult("An error occurred during prediction");
    }
  };

  return (
    <div className="p-4 border border-gray-300 rounded-md bg-white">
      <h3 className="font-semibold mb-2">Photo Classifier</h3>
      <input type="file" accept="image/*" onChange={handleFileChange} className="mb-2" />
      <button
        onClick={handleUpload}
        disabled={!file}
        className="bg-blue-500 text-white px-3 py-1 rounded-md"
      >
        Classify
      </button>
      {result && <p className="mt-2">{result}</p>}
    </div>
  );
}