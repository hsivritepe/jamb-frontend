'use client';

import { SectionBoxTitle } from '@/components/ui/SectionBoxTitle';
import SearchServices from '@/components/SearchServices';
import { useState } from 'react';

export default function HeroSection() {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <section className="pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Box - Content */}
                <div className="bg-white rounded-2xl p-8">
                    <div className="flex flex-col justify-between h-full">
                        <div>
                            <SectionBoxTitle>
                                Smart Estimates,
                                <br />
                                Stress-Free Renovations
                            </SectionBoxTitle>
                            <p className="text-gray-600 mb-8">
                            Answer a few quick questions to receive accurate quotes, and let us handle your entire project
                            </p>
                        </div>

                        <SearchServices
                            value={searchQuery}
                            onChange={(e) =>
                                setSearchQuery(e.target.value)
                            }
                        />
                    </div>
                </div>

                {/* Right Box - Image */}
                <div className="bg-white rounded-2xl overflow-hidden">
                    <img
                        src="/images/hero-service-professional.jpg"
                        alt="Professional service provider"
                        className="w-[650px] h-[500px] object-cover"
                    />
                </div>
            </div>
        </section>
    );
}
