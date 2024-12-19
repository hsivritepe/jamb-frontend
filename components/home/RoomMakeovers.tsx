"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SectionBoxTitle } from "../ui/SectionBoxTitle";
import { ImageBoxGrid } from "../ui/ImageBoxGrid";
import Button from "@/components/ui/Button";
import { ROOMS } from "@/constants/rooms";

// Function to shuffle array elements randomly
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Helper functions for session storage
const saveToSession = (key: string, value: any) => {
  sessionStorage.setItem(key, JSON.stringify(value));
};

const loadFromSession = (key: string, defaultValue: any) => {
  const savedValue = sessionStorage.getItem(key);
  try {
    return savedValue ? JSON.parse(savedValue) : defaultValue;
  } catch (error) {
    console.error(`Error parsing sessionStorage for key "${key}"`, error);
    return defaultValue;
  }
};

// Prepare indoor and outdoor room data
const indoorRooms = ROOMS.indoor.map((room) => ({
  id: room.id,
  title: room.title,
  image: `/images/rooms/${room.id}.jpg`,
  subcategories: room.services.map((service) => service.title),
}));

const outdoorRooms = ROOMS.outdoor.map((room) => ({
  id: room.id,
  title: room.title,
  image: `/images/rooms/${room.id}.jpg`,
  subcategories: room.services.map((service) => service.title),
}));

interface RoomsGridProps {
  title?: string;
  subtitle?: string;
  searchQuery?: string;
}

export default function RoomsGrid({
  title = "Whole-Room Makeovers, Done Right",
  subtitle = "Comprehensive Home Renovations for Every Room",
  searchQuery = ""
}: RoomsGridProps) {
  const router = useRouter();

  // Load selectedType and selectedSections from session storage
  const [selectedType, setSelectedType] = useState<'indoor' | 'outdoor'>(
    loadFromSession("rooms_selectedType", "indoor")
  );
  const [selectedSections, setSelectedSections] = useState<string[]>(
    loadFromSession("rooms_selectedSections", [])
  );

  // Update rooms list based on selectedType
  const [rooms, setRooms] = useState(
    selectedType === 'indoor' ? indoorRooms : outdoorRooms
  );

  // Save state changes to session storage
  useEffect(() => {
    saveToSession("rooms_selectedType", selectedType);
  }, [selectedType]);

  useEffect(() => {
    saveToSession("rooms_selectedSections", selectedSections);
  }, [selectedSections]);

  // Recompute rooms when selectedType changes, shuffle subcategories
  useEffect(() => {
    const shuffledRooms =
      selectedType === 'indoor'
        ? indoorRooms.map((room) => ({
            ...room,
            subcategories: shuffleArray(room.subcategories),
          }))
        : outdoorRooms.map((room) => ({
            ...room,
            subcategories: shuffleArray(room.subcategories),
          }));
    setRooms(shuffledRooms);
  }, [selectedType]);

  // Filter rooms based on search query
  const filteredRooms = rooms.filter(
    (room) =>
      room.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.subcategories.some((sub) =>
        sub.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  // Handle selecting or deselecting a room
  const handleSectionClick = (sectionId: string) => {
    setSelectedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((s) => s !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Next button handler
  const handleNext = () => {
    if (selectedSections.length === 0) {
      alert("Please select at least one room before proceeding.");
      return;
    }
    // Sections are saved in session, so just navigate
    router.push("/rooms/details");
  };

  return (
    <section className="py-8">
      <div className="container mx-auto">
        <SectionBoxTitle>
          <div dangerouslySetInnerHTML={{ __html: title }} />
          <p className="text-[30px] leading-[41px] font-normal text-gray-500">{subtitle}</p>
        </SectionBoxTitle>

        {/* Indoor/Outdoor Toggle */}
        <div className="flex justify-between items-center mb-8">
          <div className="inline-flex rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => setSelectedType("indoor")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedType === "indoor"
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              Indoor
            </button>
            <button
              onClick={() => setSelectedType("outdoor")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedType === "outdoor"
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              Outdoor
            </button>
          </div>

          {/* Next Button */}
          <Button onClick={handleNext}>Next →</Button>
        </div>

        {/* Rooms Grid */}
        <ImageBoxGrid
          items={filteredRooms.map((room) => ({
            id: room.id,
            title: room.title,
            image: room.image,
            url: `/rooms/${room.title.toLowerCase().replace(/ /g, '_')}`,
            subcategories: room.subcategories,
            isSelected: selectedSections.includes(room.id),
          }))}
          onSectionClick={handleSectionClick}
          moreText="services"
        />
      </div>
    </section>
  );
}