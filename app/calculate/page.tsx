'use client';

import { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import BreadCrumb from '@/components/ui/BreadCrumb';
import ServicesGrid from '@/components/home/ServicesGrid';
import SearchServices from '@/components/SearchServices';
import { CALCULATE_STEPS } from '@/constants/navigation';

export default function Calculate() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>(''); // State for search input

  return (
    <main className="min-h-screen pt-24">
      <div className="container mx-auto">
        {/* Breadcrumb for navigation */}
        <BreadCrumb items={CALCULATE_STEPS} />

        {/* Search bar */}
        <div className="mt-8 mb-4">
          <SearchServices
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
            placeholder="Search for services..."
          />
        </div>

        {/* Displaying ServicesGrid */}
        <ServicesGrid searchQuery={searchQuery} />
      </div>
    </main>
  );
}