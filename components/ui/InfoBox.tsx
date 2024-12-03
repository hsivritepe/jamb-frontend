'use client';

import React from 'react';
import Image from 'next/image';
import { SectionBoxSubtitle } from './SectionBoxSubtitle';
import { Zap } from 'lucide-react';

interface InfoBoxProps {
    image: string;
    title: string;
    description: string;
    highlights: string[];
    layout?: 'vertical' | 'horizontal';
    className?: string;
}

export default function InfoBox({
    image,
    title,
    description,
    highlights,
    layout = 'vertical',
    className = '',
}: InfoBoxProps) {
    const AdvantageHeader = () => (
        <div className="text-blue-600 font-medium mb-2 flex items-center gap-2">
            <Zap size={16} className="stroke-2" />
            Advantage
        </div>
    );

    if (layout === 'vertical') {
        return (
            <div
                className={`bg-gray-200 p-4 rounded-xl overflow-hidden h-full flex flex-col ${className}`}
            >
                <div className="relative aspect-[4/3] w-full">
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-cover rounded-lg"
                    />
                </div>
                <div className="flex flex-col flex-1 justify-between">
                    <div className="p-4">
                        <SectionBoxSubtitle className="pt-4">
                            {title}
                        </SectionBoxSubtitle>
                        <p className="text-gray-600 mt-4 pr-4">
                            {description}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                        <AdvantageHeader />
                        <p className="text-gray-600">{highlights}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`flex p-4 bg-gray-200 rounded-xl overflow-hidden h-full ${className}`}
        >
            <div className="w-1/2">
                <div className="relative h-full">
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-cover rounded-lg"
                    />
                </div>
            </div>
            <div className="w-1/2 pt-4 pl-8 flex flex-col h-full justify-between">
                <div>
                    <div className="text-2xl font-semibold text-gray-900">
                        {title}
                    </div>
                    <div className="text-gray-600 mt-4">
                        {description}
                    </div>
                </div>
                <div className="bg-white rounded-lg p-4 mt-12">
                    <AdvantageHeader />
                    <p className="text-gray-600">{highlights}</p>
                </div>
            </div>
        </div>
    );
}
