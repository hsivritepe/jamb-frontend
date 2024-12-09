'use client';

import { useRouter } from 'next/navigation';
import BreadCrumb from '@/components/ui/BreadCrumb';
import Button from '@/components/ui/Button';
import { SectionBoxTitle } from '@/components/ui/SectionBoxTitle';
import { EMERGENCY_STEPS } from '@/constants/navigation';
import { Upload, X } from 'lucide-react';
import { useState } from 'react';

export default function EmergencyDetails() {
    const router = useRouter();
    const [images, setImages] = useState<File[]>([]);
    const [property, setProperty] = useState('Property name 1');
    const [pipeType, setPipeType] = useState('Copper pipes');
    const [severity, setSeverity] = useState('Medium');

    const handleImageUpload = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (e.target.files) {
            setImages((prev) => [
                ...prev,
                ...Array.from(e.target.files!),
            ]);
        }
    };

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <main className="min-h-screen pt-24">
            <div className="container mx-auto">
                <BreadCrumb items={EMERGENCY_STEPS} />
                <SectionBoxTitle className="mt-12">
                    Details
                </SectionBoxTitle>
                <p className="text-gray-600 mt-2">
                    This is to accurately calculate the cost of
                    services
                </p>

                <div className="flex gap-8 my-8">
                    <div className="w-1/2 space-y-8">
                        {/* Property Selection */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Your properties
                            </label>
                            <div className="relative">
                                <select
                                    value={property}
                                    onChange={(e) =>
                                        setProperty(e.target.value)
                                    }
                                    className="w-full p-3 border rounded-lg appearance-none bg-white"
                                >
                                    <option>Property name 1</option>
                                    <option>Property name 2</option>
                                </select>
                            </div>
                            <button className="text-blue-600 mt-2">
                                Add new
                            </button>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium mb-4">
                                Snap a picture of the problem
                            </label>
                            <div className="flex flex-wrap gap-4">
                                {images.map((image, index) => (
                                    <div
                                        key={index}
                                        className="relative"
                                    >
                                        <img
                                            src={URL.createObjectURL(
                                                image
                                            )}
                                            alt="Uploaded"
                                            className="w-32 h-32 object-cover rounded-lg"
                                        />
                                        <button
                                            onClick={() =>
                                                removeImage(index)
                                            }
                                            className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <label className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                                    <Upload className="w-6 h-6 text-gray-400" />
                                    <span className="mt-2 text-sm text-gray-500">
                                        Upload
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={handleImageUpload}
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Additionally Section */}
                        <div>
                            <h3 className="text-lg font-medium mb-4">
                                Additionally
                            </h3>
                            <div className="space-y-4">
                                {/* Pipes Type */}
                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">
                                        Pipes type
                                    </label>
                                    <select
                                        value={pipeType}
                                        onChange={(e) =>
                                            setPipeType(
                                                e.target.value
                                            )
                                        }
                                        className="w-full p-3 border rounded-lg appearance-none bg-white"
                                    >
                                        <option>Copper pipes</option>
                                        <option>PVC pipes</option>
                                        <option>Steel pipes</option>
                                    </select>
                                </div>

                                {/* Measurements */}
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm text-gray-600 mb-2">
                                            Diameter, inch
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="E.g. 3/4"
                                            className="w-full p-3 border rounded-lg"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm text-gray-600 mb-2">
                                            Length, inch
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="E.g. 2000"
                                            className="w-full p-3 border rounded-lg"
                                        />
                                    </div>
                                </div>

                                {/* Severity Slider */}
                                <div className="bg-gray-100 p-4 rounded-lg w-[300px]">
                                    <label className="block text-sm font-medium mb-4">
                                        Severity of the situation
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="range"
                                            min="0"
                                            max="2"
                                            value={
                                                severity === 'Low'
                                                    ? 0
                                                    : severity ===
                                                      'Medium'
                                                    ? 1
                                                    : 2
                                            }
                                            onChange={(e) => {
                                                const values = [
                                                    'Low',
                                                    'Medium',
                                                    'High',
                                                ];
                                                setSeverity(
                                                    values[
                                                        Number(
                                                            e.target
                                                                .value
                                                        )
                                                    ]
                                                );
                                            }}
                                            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                                        />
                                        <div className="flex justify-between text-sm text-gray-500 mt-2">
                                            <span>Low</span>
                                            <span>Medium</span>
                                            <span>High</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-[400px] flex self-start justify-end">
                        <Button
                            onClick={() =>
                                router.push('/emergency/estimate')
                            }
                        >
                            Next →
                        </Button>
                    </div>
                </div>
            </div>
        </main>
    );
}
