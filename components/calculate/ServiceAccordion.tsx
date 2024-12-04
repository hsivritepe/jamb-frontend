'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Switch } from '@/components/ui/Switch';

interface ServiceAccordionProps {
    service: {
        id: string;
        title: string;
        description: string;
        price: number;
    };
    isSelected: boolean;
    onToggle: () => void;
}

export default function ServiceAccordion({
    service,
    isSelected,
    onToggle,
}: ServiceAccordionProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between p-4">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 flex-1 text-left"
                >
                    <span className="text-lg font-medium">
                        {service.title}
                    </span>
                    {isOpen ? (
                        <ChevronUp className="w-5 h-5" />
                    ) : (
                        <ChevronDown className="w-5 h-5" />
                    )}
                </button>
                <Switch
                    checked={isSelected}
                    onCheckedChange={onToggle}
                />
            </div>

            {isOpen && (
                <div className="px-4 pb-4 text-gray-600">
                    {service.description}
                </div>
            )}
        </div>
    );
}
