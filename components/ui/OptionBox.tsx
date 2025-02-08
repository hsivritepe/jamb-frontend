'use client';

import { Circle } from 'lucide-react';

interface OptionBoxProps {
    id: string;
    title: string;
    description: string;
    isSelected?: boolean;
    onSelect: (id: string) => void;
}

export default function OptionBox({
    id,
    title,
    description,
    isSelected = false,
    onSelect,
}: OptionBoxProps) {
    return (
        <div
            onClick={() => onSelect(id)}
            className={`p-12 rounded-2xl cursor-pointer transition-all ${
                isSelected
                    ? 'bg-brand-light'
                    : 'bg-gray-100 hover:border-gray-300'
            }`}
            role="radio"
            aria-checked={isSelected}
        >
            <div className="flex items-start gap-6">
                <Circle
                    className={`w-24 h-8 mt-0 ${
                        isSelected
                            ? 'stroke-2 text-brand fill-brand'
                            : 'text-gray-300'
                    }`}
                />
                <div>
                    <h3 className="text-2xl font-semibold text-gray-900">
                        {title}
                    </h3>
                    <p className="mt-4 text-gray-500 leading-relaxed">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
}
