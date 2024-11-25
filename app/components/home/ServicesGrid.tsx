'use client';

import { ServiceItem } from '@/types/services';
import { SectionBoxTitle } from '../ui/SectionBoxTitle';
import { useState } from 'react';
import { ImageBoxGrid } from '../ui/ImageBoxGrid';

const services: ServiceItem[] = [
    {
        id: 1,
        title: 'Electrical',
        image: '/images/services/electrical.jpg',
        url: '/services/electrical',
        subcategories: [
            'Wiring & Rewiring',
            'Switches & Outlets',
            'LED Lighting',
            'Fixture Installation',
            'Emergency Repairs',
            'Circuit Breakers',
        ],
        type: 'indoor',
    },
    {
        id: 2,
        title: 'Plumbing',
        image: '/images/services/plumbing.jpg',
        url: '/services/plumbing',
        subcategories: [
            'Pipe Installation',
            'Leak Detection',
            'Shower & Bath',
            'Emergency Services',
        ],
        type: 'outdoor',
    },
    {
        id: 3,
        title: 'Painting',
        image: '/images/services/painting.jpg',
        url: '/services/painting',
        subcategories: [
            'Interior Painting',
            'Exterior Painting',
            'Wall Preparation',
            'Wallpaper Removal',
            'Color Consultation',
            'Trim & Detail Work',
            'Cabinet Painting',
        ],
        type: 'indoor',
    },
    {
        id: 4,
        title: 'Tiling',
        image: '/images/services/tiling.jpg',
        url: '/services/tiling',
        subcategories: [
            'Floor Tiling',
            'Wall Tiling',
            'Bathroom Tiling',
            'Kitchen Backsplash',
            'Tile Repair',
        ],
        type: 'outdoor',
    },
    {
        id: 5,
        title: 'Flooring',
        image: '/images/services/flooring.jpg',
        url: '/services/flooring',
        subcategories: [
            'Hardwood Installation',
            'Laminate Flooring',
            'Vinyl & LVT',
            'Carpet Installation',
            'Floor Repairs',
            'Refinishing',
            'Subfloor Repair',
            'Floor Leveling',
        ],
        type: 'indoor',
    },
    {
        id: 6,
        title: 'Carpentry',
        image: '/images/services/carpentry.jpg',
        url: '/services/carpentry',
        subcategories: [
            'Custom Furniture',
            'Cabinet Making',
            'Door Installation',
            'Trim & Molding',
        ],
        type: 'indoor',
    },
    {
        id: 7,
        title: 'HVAC',
        image: '/images/services/hvac.jpg',
        url: '/services/hvac',
        subcategories: [
            'AC Installation',
            'Heating Repair',
            'Maintenance',
            'Air Quality Testing',
            'Duct Cleaning',
            'Thermostat Install',
            'Emergency Service',
            'System Inspection',
        ],
        type: 'indoor',
    },
    {
        id: 8,
        title: 'Cleaning',
        image: '/images/services/cleaning.jpg',
        url: '/services/cleaning',
        subcategories: [
            'Deep Cleaning',
            'Regular Maintenance',
            'Move-in/out Clean',
            'Window Cleaning',
            'Carpet Cleaning',
            'Post-Construction',
        ],
        type: 'indoor',
    },
];

export default function ServicesGrid() {
    const [selectedType, setSelectedType] = useState('indoor');

    return (
        <section className="py-16">
            <div>
                <SectionBoxTitle>
                    Comprehensive Home Services
                    <br />
                    at Your Fingertips
                </SectionBoxTitle>

                {/* Indoor/Outdoor Selector */}
                <div className="flex mb-8">
                    <div className="inline-flex rounded-lg border bg-brand-light border-gray-200 p-1">
                        <button
                            onClick={() => setSelectedType('indoor')}
                            className={`px-4 py-2 rounded-md text-md ${
                                selectedType === 'indoor'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-brand'
                            }`}
                        >
                            Indoor
                        </button>
                        <button
                            onClick={() => setSelectedType('outdoor')}
                            className={`px-4 py-2 rounded-md text-md ${
                                selectedType === 'outdoor'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-brand'
                            }`}
                        >
                            Outdoor
                        </button>
                    </div>
                </div>

                {/* Primary Services Grid */}
                <ImageBoxGrid
                    items={services.filter(
                        (service) => service.type === selectedType
                    )}
                    gridCols={4}
                    showCount={true}
                />

                {/* Secondary Services Grid */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {[
                        'Wall and Ceiling',
                        'Security',
                        'Furniture',
                        'Appliance',
                        'Auto',
                        'Moving',
                        'Smart Home',
                        'Pest Control',
                        'Window Treatment',
                        'Home Inspection',
                    ].map((service, index) => (
                        <div
                            key={index}
                            className="p-4 hover:border-blue-500 cursor-pointer"
                        >
                            <h3 className="font-medium text-gray-900">
                                {service}
                            </h3>
                            {[
                                'Carpet',
                                'Carpet Pad',
                                'Vinyl tile',
                                'Vinyl covering',
                                'Laminate',
                            ].map((subservice, subindex) => (
                                <div key={subindex}>
                                    <span className="text-sm text-gray-500">
                                        {subservice}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
