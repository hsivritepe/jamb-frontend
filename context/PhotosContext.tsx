"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import localForage from "localforage";

/**
 * Define the shape of our PhotosContext,
 * which will store an array of photo base64 strings and a setter function.
 */
interface PhotosContextValue {
  photos: string[];
  setPhotos: React.Dispatch<React.SetStateAction<string[]>>;
}

/**
 * Create the PhotosContext with a default value.
 * These default values are only used if no provider is found in the component tree.
 */
const PhotosContext = createContext<PhotosContextValue>({
  photos: [],
  setPhotos: () => {},
});

/**
 * The PhotosProvider component wraps our entire application (or a part of it),
 * providing the `photos` state and `setPhotos` function to all children via context.
 */
export function PhotosProvider({ children }: { children: React.ReactNode }) {
  const [photos, setPhotos] = useState<string[]>([]);

  /**
   * On initial render, read any previously stored photos from localForage.
   * This ensures that if the user refreshes the page, the photos state is preserved.
   */
  useEffect(() => {
    localForage.getItem<string[]>("photos").then((stored) => {
      if (stored && Array.isArray(stored)) {
        setPhotos(stored);
      }
    });
  }, []);

  /**
   * Whenever `photos` changes, save the updated array to localForage.
   * This keeps our photos synced in IndexedDB so they persist across page reloads.
   */
  useEffect(() => {
    localForage.setItem("photos", photos).catch((err) => {
      console.error("Failed to save photos to localForage:", err);
    });
  }, [photos]);

  return (
    <PhotosContext.Provider value={{ photos, setPhotos }}>
      {children}
    </PhotosContext.Provider>
  );
}

/**
 * A custom hook to consume the PhotosContext.
 * This hook allows components to read the current `photos` array and
 * use the `setPhotos` function without needing to manually use `useContext`.
 */
export function usePhotos() {
  return useContext(PhotosContext);
}