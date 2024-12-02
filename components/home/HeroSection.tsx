'use client';
import { useState, ChangeEvent } from 'react';
import { Search } from 'lucide-react';
import { SectionBoxTitle } from '@/components/ui/SectionBoxTitle';

export default function HeroSection() {
    const [searchQuery, setSearchQuery] = useState<string>('');

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

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
                                A smarter, faster, guided route to
                                renovate successful projects,
                                <br />
                                with the right fit for your unique
                                project.
                            </p>
                        </div>

                        <div className="relative">
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    placeholder="Explore 995 Services"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    className="w-full h-[60px] pl-5 pr-6 rounded-xl border border-brand-light focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-base placeholder-brand bg-brand-light"
                                />
                                <Search className="absolute right-6 h-5 w-5 text-blue-600" />
                            </div>
                        </div>
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
