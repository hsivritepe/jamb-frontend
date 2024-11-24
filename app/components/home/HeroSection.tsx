'use client';
import { useState, ChangeEvent } from 'react';
import { Search } from 'lucide-react';

export default function HeroSection() {
    const [searchQuery, setSearchQuery] = useState<string>('');

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    return (
        <section className="mt-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Box - Content */}
                <div className="bg-white rounded-2xl p-8">
                    <div className="flex flex-col justify-center h-full">
                        <h1 className="text-[48px] font-semibold leading-[65.57px] text-left mb-3">
                            Smart Estimates,
                            <br />
                            Stress-Free Renovations
                        </h1>

                        <p className="text-gray-600 mb-8">
                            A smarter, faster, guided route to
                            renovate successful projects,
                            <br />
                            with the right fit for your unique
                            project.
                        </p>

                        <div className="relative">
                            <div className="relative flex items-center">
                                <Search className="absolute left-6 h-5 w-5 text-blue-600" />
                                <input
                                    type="text"
                                    placeholder="Explore 995 Services"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    className="w-full h-[60px] pl-14 pr-6 rounded-full border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-base placeholder-gray-900"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Box - Image */}
                <div className="bg-white rounded-2xl overflow-hidden">
                    <img
                        src="/hero-service-professional.jpg"
                        alt="Professional service provider"
                        className="w-[650px] h-[500px] object-cover"
                    />
                </div>
            </div>
        </section>
    );
}
