"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Define the structure for the Location object
interface Location {
  city: string;       // e.g. "San Francisco"
  zip: string;        // e.g. "94103"
  country?: string;   // e.g. "United States"
  province?: string;  // e.g. "California" (long name)
  state?: string;     // e.g. "CA" (short name)
}

interface LocationContextType {
  location: Location;
  setLocation: (location: Location) => void;
}

// Create context
const LocationContext = createContext<LocationContextType | undefined>(undefined);

/**
 * Attempts to parse "city" from the Google address_components array.
 */
function getCityFromComponents(components: any[]): string {
  let cityObj = components.find((comp: any) => comp.types.includes("locality"));
  if (cityObj?.long_name) return cityObj.long_name;

  cityObj = components.find((comp: any) =>
    comp.types.includes("administrative_area_level_2")
  );
  if (cityObj?.long_name) return cityObj.long_name;

  cityObj = components.find((comp: any) =>
    comp.types.includes("administrative_area_level_3")
  );
  if (cityObj?.long_name) return cityObj.long_name;

  cityObj = components.find((comp: any) => comp.types.includes("sublocality"));
  if (cityObj?.long_name) return cityObj.long_name;

  return "Unknown City";
}

/**
 * Attempts to parse "zip" (postal_code) from the Google address_components array.
 */
function getZipFromComponents(components: any[]): string {
  const zipObj = components.find((comp: any) => comp.types.includes("postal_code"));
  return zipObj?.long_name || "Unknown ZIP";
}

/**
 * Attempts to parse "country" from the Google address_components array.
 */
function getCountryFromComponents(components: any[]): string {
  const countryObj = components.find((comp: any) => comp.types.includes("country"));
  return countryObj?.long_name || "Unknown Country";
}

/**
 * Attempts to parse the *long* name of the state (administrative_area_level_1).
 * e.g. "California", "New York", etc.
 */
function getStateFullNameFromComponents(components: any[]): string {
  const provinceObj = components.find((comp: any) =>
    comp.types.includes("administrative_area_level_1")
  );
  return provinceObj?.long_name || "Unknown State";
}

/**
 * Attempts to parse the *short* name of the state (administrative_area_level_1).
 * e.g. "CA", "NY", "TX", etc.
 */
function getStateShortNameFromComponents(components: any[]): string {
  const provinceObj = components.find((comp: any) =>
    comp.types.includes("administrative_area_level_1")
  );
  // short_name => "CA"
  return provinceObj?.short_name || "Unknown";
}

/**
 * Provider that fetches geolocation on mount (if user grants permission),
 * calls Google’s Geocoding API, and extracts city/zip/country + state (long_name + short_name).
 */
export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [location, setLocation] = useState<Location>({
    city: "City",
    zip: "ZIP",
    country: "Country",
  });

  // Function to do the geolocation + reverse geocoding
  const fetchLocation = async () => {
    if (!("geolocation" in navigator)) {
      console.error("Geolocation is not supported in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
          console.error("Google Maps API key missing. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.");
          return;
        }

        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
        try {
          const res = await fetch(url);
          const data = await res.json();

          console.log("Geocoding API response:", data); // <--- For debugging

          if (data.results && data.results.length > 0) {
            // Typically use data.results[0]
            const comps = data.results[0].address_components;

            const city = getCityFromComponents(comps);
            const zip = getZipFromComponents(comps);
            const country = getCountryFromComponents(comps);
            const provinceLongName = getStateFullNameFromComponents(comps); // e.g. "California"
            const provinceShortName = getStateShortNameFromComponents(comps); // e.g. "CA"

            const newLocation: Location = {
              city,
              zip,
              country,
              province: provinceLongName,
              state: provinceShortName, // short code or alias
            };

            // Update
            setLocation(newLocation);
            // store in localStorage if you want to cache across page reloads
            localStorage.setItem("userLocation", JSON.stringify(newLocation));
          } else {
            console.warn("No results found in geocode data.");
          }
        } catch (err) {
          console.error("Error during reverse geocoding request:", err);
        }
      },
      (error) => {
        console.error("Error obtaining geolocation:", error);
      }
    );
  };

  useEffect(() => {
    // Check if we already have something in localStorage (optional)
    const storedLocation = localStorage.getItem("userLocation");
    if (storedLocation) {
      try {
        const parsed = JSON.parse(storedLocation);
        setLocation(parsed);
        // If you want a “fresh” location each time, you could still call fetchLocation() below
        // fetchLocation();
      } catch (error) {
        console.error("Error parsing userLocation from localStorage:", error);
        // fallback to fetch
        fetchLocation();
      }
    } else {
      // No stored location, so do a fresh geolocation
      fetchLocation();
    }
  }, []);

  return (
    <LocationContext.Provider value={{ location, setLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

/** Hook to consume the context. */
export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};