"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Interface for the location structure
interface Location {
  city: string; // The city name
  zip: string; // The ZIP code
  country?: string; // Optional field for the country
  province?: string; // Optional field for province, used in Canadian tax logic
  state?: string; // Optional field for state, used in U.S. tax logic
}

// Interface for the LocationContext
interface LocationContextType {
  location: Location; // Current location state
  setLocation: (location: Location) => void; // Function to update the location state
}

// Create a context for location management
const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Provider component for the location context
export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State for managing the location
  const [location, setLocation] = useState<Location>({
    city: "Unknown City", // Default city value
    zip: "Unknown ZIP", // Default ZIP code
    country: "Unknown Country", // Default country value
  });

  useEffect(() => {
    // Fetch the user's location using Geolocation and Google Maps Geocoding API
    const fetchLocation = async () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords; // Extract latitude and longitude
            const apiKey = "AIzaSyA_pXZj_hNDd-U-Gsnol2OQ2GHgz8EXW64"; // Google Maps API key
            const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`; // API request URL

            try {
              const response = await fetch(url); // Fetch location data
              const data = await response.json(); // Parse JSON response
              if (data.results?.[0]) {
                const addressComponents = data.results[0].address_components; // Extract address components

                const city = addressComponents.find((comp: { types: string[] }) =>
                  comp.types.includes("locality")
                )?.long_name; // Find the city
                const zip = addressComponents.find((comp: { types: string[] }) =>
                  comp.types.includes("postal_code")
                )?.long_name; // Find the ZIP code
                const country = addressComponents.find((comp: { types: string[] }) =>
                  comp.types.includes("country")
                )?.long_name; // Find the country
                const province = addressComponents.find((comp: { types: string[] }) =>
                  comp.types.includes("administrative_area_level_1")
                )?.long_name; // Find the province/state
                const state = province; // Alias province as state for U.S. compatibility

                const newLocation: Location = {
                  city: city || "Unknown City",
                  zip: zip || "Unknown ZIP",
                  country: country || "Unknown Country",
                  province,
                  state,
                };

                setLocation(newLocation); // Update the location state
                localStorage.setItem("userLocation", JSON.stringify(newLocation)); // Save location in localStorage
              }
            } catch (error) {
              console.error("Error fetching location:", error); // Log errors
            }
          },
          (error) => {
            console.error("Geolocation error:", error); // Handle geolocation errors
          }
        );
      }
    };

    // Check for stored location in localStorage
    const storedLocation = localStorage.getItem("userLocation");
    if (storedLocation) {
      setLocation(JSON.parse(storedLocation)); // Set location from localStorage if available
    } else {
      fetchLocation(); // Fetch location if not stored
    }
  }, []);

  return (
    <LocationContext.Provider value={{ location, setLocation }}>
      {children} {/* Render children within the provider */}
    </LocationContext.Provider>
  );
};

// Custom hook for accessing the location context
export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext); // Retrieve context value
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider"); // Ensure context is used within provider
  }
  return context; // Return the context value
};