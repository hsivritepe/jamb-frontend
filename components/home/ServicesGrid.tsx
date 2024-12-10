'use client';

import { useState } from 'react';
import { SectionBoxTitle } from '../ui/SectionBoxTitle';
import { ImageBoxGrid } from '../ui/ImageBoxGrid';
import {
  INDOOR_SERVICE_SECTIONS,
  OUTDOOR_SERVICE_SECTIONS,
  ALL_CATEGORIES,
} from '@/constants/categories';

// Extract services by type
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
  title = 'Select a Service',
}: {
  title?: string;
}) {
  const [selectedType, setSelectedType] = useState<'indoor' | 'outdoor'>('indoor');

  const services = selectedType === 'indoor' ? indoorServices : outdoorServices;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <SectionBoxTitle>
          <div dangerouslySetInnerHTML={{ __html: title }} />
        </SectionBoxTitle>

        {/* Indoor/Outdoor Toggle */}
        <div className="flex mb-8">
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
        </div>

        {/* Services Grid */}
        <ImageBoxGrid
          items={services.map((service) => ({
            id: service.title,
            title: service.title,
            image: service.image,
            url: `/services/${service.title.toLowerCase().replace(/ /g, '_')}`,
            subcategories: service.subcategories,
          }))}
        />
      </div>
    </section>
  );
}