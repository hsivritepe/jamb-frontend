"use client";

export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SectionBoxTitle } from "../ui/SectionBoxTitle";
import { ImageBoxGrid } from "../ui/ImageBoxGrid";
import Button from "@/components/ui/Button";
import { ROOMS } from "@/constants/rooms";

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const saveToSession = (key: string, value: unknown) => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(key, JSON.stringify(value));
  }
};

const loadFromSession = (key: string, defaultValue: any) => {
  if (typeof window === "undefined") return defaultValue;
  const savedValue = sessionStorage.getItem(key);
  try {
    return savedValue ? JSON.parse(savedValue) : defaultValue;
  } catch (error) {
    console.error(`Error parsing sessionStorage for key "${key}":`, error);
    return defaultValue;
  }
};

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
  subtitle = "Complete Home Renovations for Any Room or Space",
  searchQuery = "",
}: RoomsGridProps) {
  const router = useRouter();

  const [selectedType, setSelectedType] = useState<"indoor" | "outdoor">(
    loadFromSession("rooms_selectedType", "indoor")
  );
  const [selectedSections, setSelectedSections] = useState<string[]>(
    loadFromSession("rooms_selectedSections", [])
  );

  const [rooms, setRooms] = useState(
    selectedType === "indoor" ? indoorRooms : outdoorRooms
  );

  useEffect(() => {
    saveToSession("rooms_selectedType", selectedType);
  }, [selectedType]);

  useEffect(() => {
    saveToSession("rooms_selectedSections", selectedSections);
  }, [selectedSections]);

  useEffect(() => {
    const updatedRooms =
      selectedType === "indoor"
        ? indoorRooms.map((room) => ({
            ...room,
            subcategories: shuffleArray(room.subcategories),
          }))
        : outdoorRooms.map((room) => ({
            ...room,
            subcategories: shuffleArray(room.subcategories),
          }));
    setRooms(updatedRooms);
  }, [selectedType]);

  const filteredRooms = rooms.filter(
    (room) =>
      room.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.subcategories.some((sub) =>
        sub.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const handleSectionClick = (sectionId: string) => {
    setSelectedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((s) => s !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleNext = () => {
    if (selectedSections.length === 0) {
      alert("Please select at least one room before proceeding.");
      return;
    }
    router.push("/rooms/services");
  };

  return (
    <section className="py-8">
      <div className="container mx-auto">
        <SectionBoxTitle>
          <div dangerouslySetInnerHTML={{ __html: title }} />
          <p
            className={`
              font-semibold sm:font-normal text-gray-500
              text-[20px] leading-[28px]
              md:text-[30px] md:leading-[41px]
            `}
          >
            {subtitle}
          </p>
        </SectionBoxTitle>

        <div className="flex justify-between items-center mb-8">
          <div className="inline-flex rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => setSelectedType("indoor")}
              className={`px-4 py-2 rounded-md text-sm font-semibold sm:font-medium transition-colors ${
                selectedType === "indoor"
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              Indoor
            </button>
            <button
              onClick={() => setSelectedType("outdoor")}
              className={`px-4 py-2 rounded-md text-sm font-semibold sm:font-medium transition-colors ${
                selectedType === "outdoor"
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              Outdoor
            </button>
          </div>

          <Button onClick={handleNext}>Next →</Button>
        </div>

        <ImageBoxGrid
          items={filteredRooms.map((room) => ({
            id: room.id,
            title: room.title,
            image: room.image,
            url: `/rooms/${room.title.toLowerCase().replace(/ /g, "_")}`,
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