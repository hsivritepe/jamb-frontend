'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SectionBoxTitle } from '../ui/SectionBoxTitle';
import { ImageBoxGrid } from '../ui/ImageBoxGrid';
import Button from '@/components/ui/Button';
import { ROOMS } from '@/constants/rooms';

// Function to shuffle array elements randomly
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

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

export default function RoomsGrid({
  title = 'Whole-Room Makeovers, Done Right',
  subtitle = 'Comprehensive Home Renovations for Every Room',
  searchQuery,
}: {
  title?: string;
  subtitle?: string;
  searchQuery?: string;
}) {
  const [selectedType, setSelectedType] = useState<'indoor' | 'outdoor'>('indoor');
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [rooms, setRooms] = useState(selectedType === 'indoor' ? indoorRooms : outdoorRooms);
  const router = useRouter();

  // Update the rooms based on the selected type and shuffle the subcategories
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
      room.title.toLowerCase().includes(searchQuery?.toLowerCase() || '') ||
      room.subcategories.some((sub) =>
        sub.toLowerCase().includes(searchQuery?.toLowerCase() || '')
      )
  );

  // Handle section click to add/remove a room section
  const handleSectionClick = (sectionId: string) => {
    setSelectedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((s) => s !== sectionId) // Remove if already selected
        : [...prev, sectionId] // Add if not selected
    );
  };

  // Handle Next button click to navigate to details page
  const handleNext = () => {
    if (selectedSections.length === 0) {
      alert('Please select at least one room section before proceeding.');
      return;
    }
    router.push(`/rooms/details?sections=${encodeURIComponent(selectedSections.join(','))}`);
  };

  return (
    <section className="py-8">
      <div className="container mx-auto">
        {/* Section title */}
        <SectionBoxTitle>
          <div dangerouslySetInnerHTML={{ __html: title }} />
          <p className="text-[30px] leading-[41px] font-normal text-gray-500">{subtitle}</p>
        </SectionBoxTitle>

        {/* Toggle buttons for indoor and outdoor */}
        <div className="flex justify-between items-center mb-8">
          <div className="inline-flex rounded-lg border border-gray-200 p-1">
            {/* Button for indoor */}
            <button
              onClick={() => setSelectedType('indoor')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedType === 'indoor'
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              Indoor
            </button>

            {/* Button for outdoor */}
            <button
              onClick={() => setSelectedType('outdoor')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedType === 'outdoor'
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              Outdoor
            </button>
          </div>

          {/* Next Button */}
          <Button onClick={handleNext}>Next →</Button>
        </div>

        {/* Rooms grid */}
        <ImageBoxGrid
          items={filteredRooms.map((room) => ({
            id: room.id,
            title: room.title,
            image: room.image,
            url: `/rooms/${room.title.toLowerCase().replace(/ /g, '_')}`,
            subcategories: room.subcategories,
            isSelected: selectedSections.includes(room.id), // Highlight selected sections
          }))}
          onSectionClick={handleSectionClick} // Pass click handler
          moreText="services"
        />
      </div>
    </section>
  );
}