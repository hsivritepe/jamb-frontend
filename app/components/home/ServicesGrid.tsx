'use client';

import { ServiceItem } from '@/types/services';
import { SectionBoxTitle } from '../ui/SectionBoxTitle';
import { useState } from 'react';
import Image from 'next/image';

const services: ServiceItem[] = [
    {
        id: 1,
        title: 'Electrical',
        count: 11,
        image: '/services/electrical.jpg',
        subcategories: [
            'Wiring',
            'Switches',
            'LED',
            'Installation',
            'Repairs',
            'Maintenance',
        ],
        type: 'indoor',
    },
    {
        id: 2,
        title: 'Plumbing',
        count: 17,
        image: '/services/plumbing.jpg',
        subcategories: [
            'Pipes',
            'Shower',
            'Bath',
            'Faucet',
            'Water & Emergency',
        ],
        type: 'indoor',
    },
    {
        id: 3,
        title: 'Painting',
        count: 8,
        image: '/services/painting.jpg',
        subcategories: ['Interior', 'Exterior', 'Wall Painting'],
        type: 'indoor',
    },
    {
        id: 4,
        title: 'Tiling',
        count: 12,
        image: '/services/tiling.jpg',
        subcategories: ['Floor', 'Wall', 'Bathroom', 'Kitchen'],
        type: 'indoor',
    },
    {
        id: 5,
        title: 'Flooring',
        count: 14,
        image: '/services/flooring.jpg',
        subcategories: [
            'Custom Furniture',
            'Repairs',
            'Installation',
            'Woodwork',
        ],
        type: 'indoor',
    },
    {
        id: 6,
        title: 'Carpentry',
        count: 14,
        image: '/services/carpentry.jpg',
        subcategories: [
            'Custom Furniture',
            'Repairs',
            'Installation',
            'Woodwork',
        ],
        type: 'indoor',
    },
    {
        id: 7,
        title: 'HVAC',
        count: 10,
        image: '/services/hvac.jpg',
        subcategories: [
            'Installation',
            'Repair',
            'Maintenance',
            'Air Quality',
        ],
        type: 'indoor',
    },
    {
        id: 8,
        title: 'Cleaning',
        count: 12,
        image: '/services/cleaning.jpg',
        subcategories: [
            'Deep Cleaning',
            'Regular Cleaning',
            'Move-in/out',
            'Window Cleaning',
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
                <div className="flex justify-center mb-8">
                    <div className="inline-flex rounded-lg border border-gray-200 p-1">
                        <button
                            onClick={() => setSelectedType('indoor')}
                            className={`px-4 py-2 rounded-md text-sm ${
                                selectedType === 'indoor'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600'
                            }`}
                        >
                            Indoor
                        </button>
                        <button
                            onClick={() => setSelectedType('outdoor')}
                            className={`px-4 py-2 rounded-md text-sm ${
                                selectedType === 'outdoor'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600'
                            }`}
                        >
                            Outdoor
                        </button>
                    </div>
                </div>

                {/* Primary Services Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {services
                        .filter(
                            (service) => service.type === selectedType
                        )
                        .map((service) => (
                            <div
                                key={service.id}
                                className="relative group"
                            >
                                <div className="relative overflow-hidden rounded-xl aspect-square">
                                    <Image
                                        src={service.image}
                                        alt={service.title}
                                        fill
                                        className="object-cover transition-transform group-hover:scale-110"
                                    />

                                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
                                        <h3 className="font-medium text-white text-3xl">
                                            {service.title} (
                                            {service.count})
                                        </h3>
                                    </div>

                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center p-4">
                                        <div className="text-white space-y-2">
                                            {service.subcategories.map(
                                                (sub, idx) => (
                                                    <div key={idx}>
                                                        <span className="text-sm">
                                                            {sub}
                                                        </span>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>

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
