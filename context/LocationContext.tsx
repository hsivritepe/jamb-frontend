"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface Location {
  city: string;
  zip: string;
  country?: string;
  province?: string;
  state?: string;
}

interface LocationContextType {
  location: Location;
  setLocation: (location: Location) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<Location>({
    city: "City",
    zip: "ZIP",
    country: "Country",
  });

  const fetchLocation = async (): Promise<void> => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

          if (!apiKey) {
            console.error(
              "Google Maps API key is missing. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local"
            );
            return;
          }

          try {
            const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.results?.[0]) {
              const addressComponents = data.results[0].address_components;

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

              const newLocation: Location = {
                city: city || "Unknown City",
                zip: zip || "Unknown ZIP",
                country: country || "Unknown Country",
                province,
                state,
              };

              setLocation(newLocation);
              localStorage.setItem("userLocation", JSON.stringify(newLocation));
            }
          } catch (error) {
            console.error("Error fetching location:", error);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }
  };

  useEffect(() => {
    const storedLocation = localStorage.getItem("userLocation");

    if (storedLocation) {
      setLocation(JSON.parse(storedLocation));
    } else {
      fetchLocation();
    }
  }, []);

  return (
    <LocationContext.Provider value={{ location, setLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);

  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }

  return context;
};