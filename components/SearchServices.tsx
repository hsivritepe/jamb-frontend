'use client';

import { ChangeEvent } from 'react';

// Props definition for the SearchServices component
interface SearchServicesProps {
    value: string; // Current value of the input field
    onChange: (e: ChangeEvent<HTMLInputElement>) => void; // Callback for handling input changes
    placeholder?: string; // Placeholder text for the input field
}

// Search input component
export default function SearchServices({
    value,
    onChange,
    placeholder = 'Search...',
}: SearchServicesProps) {
    return (
        <div className="relative">
            <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full h-12 px-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-blue-600"
            />
        </div>
    );
}