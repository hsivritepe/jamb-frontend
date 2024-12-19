'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SectionBoxTitle } from '../ui/SectionBoxTitle';
import { ImageBoxGrid } from '../ui/ImageBoxGrid';
import Button from '@/components/ui/Button';
import {
  INDOOR_SERVICE_SECTIONS,
  OUTDOOR_SERVICE_SECTIONS,
  ALL_CATEGORIES,
} from '@/constants/categories';

const indoorServices = Object.values(INDOOR_SERVICE_SECTIONS).map((section) => ({
  title: section,
  image: `/images/services/${section.toLowerCase().replace(/ /g, '_')}.jpg`,
  subcategories: ALL_CATEGORIES.filter((cat) => cat.section === section).map(
    (cat) => cat.title
  ),
}));

const outdoorServices = Object.values(OUTDOOR_SERVICE_SECTIONS).map((section) => ({
  title: section,
  image: `/images/services/${section.toLowerCase().replace(/ /g, '_')}.jpg`,
  subcategories: ALL_CATEGORIES.filter((cat) => cat.section === section).map(
    (cat) => cat.title
  ),
}));

export default function ServicesGrid({
  title = '',
}: {
  title?: string;
}) {
  const [selectedType, setSelectedType] = useState<'indoor' | 'outdoor'>('indoor');
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const router = useRouter();

  const services = selectedType === 'indoor' ? indoorServices : outdoorServices;

  const handleSectionClick = (section: string) => {
    setSelectedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section) // Remove if already selected
        : [...prev, section] // Add if not selected
    );
  };

  const handleNext = () => {
    if (selectedSections.length === 0) {
      alert('Please select at least one service section before proceeding.');
      return;
    }
    router.push(`/calculate/services?sections=${encodeURIComponent(selectedSections.join(','))}`);
  };

  return (
    <section className="py-8">
      <div className="container mx-auto">
        <SectionBoxTitle>
          <div dangerouslySetInnerHTML={{ __html: title }} />
        </SectionBoxTitle>

        {/* Indoor/Outdoor Toggle */}
        <div className="flex justify-between items-center mb-8">
          <div className="inline-flex rounded-lg border border-gray-200 p-1">
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

        {/* Services Grid */}
        <ImageBoxGrid
          items={services.map((service) => ({
            id: service.title,
            title: service.title,
            image: service.image,
            url: '#', // Placeholder for now
            subcategories: service.subcategories,
            isSelected: selectedSections.includes(service.title), // Pass selected state
          }))}
          onSectionClick={handleSectionClick} // Pass click handler
        />
      </div>
    </section>
  );
}