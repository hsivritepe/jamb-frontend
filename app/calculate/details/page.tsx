'use client';

import { useRouter } from 'next/navigation';
import BreadCrumb from '@/components/ui/BreadCrumb';
import { SectionBoxTitle } from '@/components/ui/SectionBoxTitle';
import { CALCULATE_STEPS } from '@/constants/navigation';
import Button from '@/components/ui/Button';
import { SectionBoxSubtitle } from '@/components/ui/SectionBoxSubtitle';

export default function Details() {
    const router = useRouter();

    const handleNext = () => {
        // Here you'll handle form submission later
        console.log('Details selection and submission');
        router.push('/calculate/estimate');
    };

    return (
        <main className="min-h-screen pt-24">
            <div className="container mx-auto">
                <BreadCrumb items={CALCULATE_STEPS} />
            </div>

            <div className="container mx-auto py-12">
                <div className="flex justify-between items-start">
                    <div className="max-w-2xl">
                        <SectionBoxTitle>Details</SectionBoxTitle>
                        <p className="text-gray-600 mt-2 mb-8">
                            This is to accurately calculate the cost
                            of services
                        </p>

                        <form className="space-y-12">
                            <div>
                                <SectionBoxSubtitle>
                                    Address info
                                </SectionBoxSubtitle>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Country
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="United States"
                                            className="w-full p-3 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            ZIP code
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="E.g. 78218"
                                            className="w-full p-3 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <SectionBoxSubtitle>
                                    Property details
                                </SectionBoxSubtitle>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Floors
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="E.g. 2"
                                            className="w-full p-3 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Bedrooms
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="E.g. 2"
                                            className="w-full p-3 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Bathrooms
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="E.g. 2"
                                            className="w-full p-3 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Year of construction
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="E.g. 2021"
                                        className="w-full p-3 border border-gray-200 rounded-lg"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Total property area
                                        </label>
                                        <div className="flex">
                                            <input
                                                type="text"
                                                placeholder="0.35"
                                                className="flex-1 p-3 border border-gray-200 rounded-l-lg"
                                            />
                                            <span className="inline-flex items-center px-4 bg-gray-50 border border-l-0 border-gray-200 rounded-r-lg text-gray-500">
                                                acres
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Total house area
                                        </label>
                                        <div className="flex">
                                            <input
                                                type="text"
                                                placeholder="1,340"
                                                className="flex-1 p-3 border border-gray-200 rounded-l-lg"
                                            />
                                            <span className="inline-flex items-center px-4 bg-gray-50 border border-l-0 border-gray-200 rounded-r-lg text-gray-500">
                                                sq. ft
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    <Button onClick={handleNext}>Next →</Button>
                </div>
            </div>
        </main>
    );
}
