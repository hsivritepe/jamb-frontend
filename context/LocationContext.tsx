"use client";

// Import necessary React hooks and utilities
import React, { createContext, useContext, useState, useEffect } from "react";

// Define the structure for the Location object
interface Location {
  city: string; // Name of the city
  zip: string; // Postal/ZIP code
  country?: string; // Optional: Country name
  province?: string; // Optional: Province or state
  state?: string; // Optional: State (used for US states)
}

// Define the structure for the LocationContext
interface LocationContextType {
  location: Location; // The current location object
  setLocation: (location: Location) => void; // Function to update the location
}

// Create a Context to manage location data, initialized as undefined
const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

// LocationProvider component to manage and provide location data
export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // State to store the current location
  const [location, setLocation] = useState<Location>({
    city: "City",
    zip: "ZIP",
    country: "Country",
  });

  // Function to fetch the user's location using the browser's Geolocation API
  const fetchLocation = async (): Promise<void> => {
    // Check if the browser supports Geolocation
    if ("geolocation" in navigator) {
      // Get the user's current position
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords; // Extract latitude and longitude
          const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY; // Fetch the Google Maps API key from environment variables

          // Ensure the API key is set
          if (!apiKey) {
            console.error(
              "Google Maps API key is missing. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local"
            );
            return;
          }

          try {
            // Construct the Google Maps Geocoding API request URL
            const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
            const response = await fetch(url); // Fetch data from the API
            const data = await response.json(); // Parse the JSON response

            // If the API returns valid location data
            if (data.results?.[0]) {
              const addressComponents = data.results[0].address_components;

              // Extract city, ZIP code, country, and province/state from the address components
              const city = addressComponents.find((comp: { types: string[] }) =>
                comp.types.includes("locality")
              )?.long_name;

              const zip = addressComponents.find((comp: { types: string[] }) =>
                comp.types.includes("postal_code")
              )?.long_name;

              const country = addressComponents.find((comp: { types: string[] }) =>
                comp.types.includes("country")
              )?.long_name;

              const province = addressComponents.find((comp: { types: string[] }) =>
                comp.types.includes("administrative_area_level_1")
              )?.long_name;

              const state = province; // Match for consistency with US states

              // Create a new location object with the extracted data
              const newLocation: Location = {
                city: city || "Unknown City",
                zip: zip || "Unknown ZIP",
                country: country || "Unknown Country",
                province,
                state,
              };

              // Update the location state and store it in localStorage
              setLocation(newLocation);
              localStorage.setItem("userLocation", JSON.stringify(newLocation));
            }
          } catch (error) {
            // Log any errors during the fetch process
            console.error("Error fetching location:", error);
          }
        },
        (error) => {
          // Handle errors from the Geolocation API
          console.error("Geolocation error:", error);
        }
      );
    }
  };

  // useEffect to load location data when the component mounts
  useEffect(() => {
    const storedLocation = localStorage.getItem("userLocation"); // Check if location is stored in localStorage

    if (storedLocation) {
      // If a location is stored, parse and set it
      setLocation(JSON.parse(storedLocation));
    } else {
      // Otherwise, fetch the user's current location
      fetchLocation();
    }
  }, []);

  // Provide the location and setLocation function to child components
  return (
    <LocationContext.Provider value={{ location, setLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

// Custom hook to use the LocationContext
export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext); // Access the LocationContext

  // Throw an error if the hook is used outside the LocationProvider
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }

  return context; // Return the context value
};