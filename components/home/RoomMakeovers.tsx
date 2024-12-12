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

// Prepare indoor room data
const indoorRooms = ROOMS.indoor.map((room) => ({
  title: room.title,
  image: `/images/rooms/${room.id}.jpg`, // Generate the image path dynamically
  subcategories: room.services.map((service) => service.title), // Extract service titles
}));

// Prepare outdoor room data
const outdoorRooms = ROOMS.outdoor.map((room) => ({
  title: room.title,
  image: `/images/rooms/${room.id}.jpg`, // Generate the image path dynamically
  subcategories: room.services.map((service) => service.title), // Extract service titles
}));

export default function RoomsGrid({
  title = 'Whole-Room Makeovers, Done Right',
  subtitle = 'Comprehensive Home Renovations for Every Room',
}: {
  title?: string;
  subtitle?: string;
}) {
  // State to toggle between indoor and outdoor types
  const [selectedType, setSelectedType] = useState<'indoor' | 'outdoor'>('indoor');
  const [rooms, setRooms] = useState(selectedType === 'indoor' ? indoorRooms : outdoorRooms);

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

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
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
            id: room.title,
            title: room.title,
            image: room.image,
            url: `/rooms/${room.title.toLowerCase().replace(/ /g, '_')}`, // Generate URL dynamically
            subcategories: room.subcategories, // Pass subcategories
          }))}
          moreText="services" // Customize "more" text for this component
        />
      </div>
    </section>
  );
}