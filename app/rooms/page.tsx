'use client';

import { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import BreadCrumb from '@/components/ui/BreadCrumb';
import SearchServices from '@/components/SearchServices';
import RoomsGrid from '@/components/home/RoomMakeovers';
import { ROOMS_STEPS } from '@/constants/navigation';

export default function Rooms() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>(''); // State for search input

  return (
    <main className="min-h-screen pt-24">
      <div className="container mx-auto">
        {/* Breadcrumb for navigation */}
        <BreadCrumb items={ROOMS_STEPS} />

        {/* Search bar */}
        <div className="mt-8 mb-4">
          <SearchServices
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
            placeholder="Search for rooms..."
          />
        </div>

        {/* Displaying RoomMakeovers */}
        <RoomsGrid
          title="Select a room"
          subtitle="Specify the Required Services on the Next Page"
          searchQuery={searchQuery} // Pass search query to filter rooms
        />
      </div>
    </main>
  );
}