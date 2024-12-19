'use client';

import { useState, useEffect } from 'react';
import { SectionBoxTitle } from '../ui/SectionBoxTitle';
import { ImageBoxGrid } from '../ui/ImageBoxGrid';
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
}: {
  title?: string;
  subtitle?: string;
}) {
  const [selectedType, setSelectedType] = useState<'indoor' | 'outdoor'>('indoor');
  const [rooms, setRooms] = useState(selectedType === 'indoor' ? indoorRooms : outdoorRooms);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

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

  // Handle section click to set the selected room
  const handleSectionClick = (sectionId: string) => {
    setSelectedRoomId(sectionId === selectedRoomId ? null : sectionId);
  };

  return (
    <section className="py-16">
      <div className="container mx-auto">
        {/* Section title */}
        <SectionBoxTitle>
          <div dangerouslySetInnerHTML={{ __html: title }} />
          <p className="text-[30px] leading-[41px] font-normal text-gray-500">{subtitle}</p>
        </SectionBoxTitle>

        {/* Toggle buttons for indoor and outdoor */}
        <div className="flex mb-8">
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
        </div>

        {/* Rooms grid */}
        <ImageBoxGrid
          items={rooms.map((room) => ({
            id: room.id,
            title: room.title,
            image: room.image,
            url: `/rooms/${room.title.toLowerCase().replace(/ /g, '_')}`,
            subcategories: room.subcategories,
            isSelected: room.id === selectedRoomId, // Add isSelected property
          }))}
          onSectionClick={handleSectionClick} // Pass section click handler
          moreText="services"
        />
      </div>
    </section>
  );
}