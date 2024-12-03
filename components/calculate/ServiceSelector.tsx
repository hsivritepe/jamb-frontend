'use client';

import { useState } from 'react';
import OptionBox from '@/components/ui/OptionBox';
import Button from '@/components/ui/Button';

export interface ServiceOption {
    id: string;
    title: string;
    description: string;
}

interface ServiceSelectorProps {
    options: ServiceOption[];
    defaultSelected?: string;
    onSelect?: (id: string) => void;
    onNext?: (selectedId: string) => void;
}

export default function ServiceSelector({
    options,
    defaultSelected,
    onSelect,
    onNext,
}: ServiceSelectorProps) {
    const [selectedOption, setSelectedOption] = useState<string>(
        defaultSelected || options[0]?.id || ''
    );

    const handleSelect = (id: string) => {
        setSelectedOption(id);
        onSelect?.(id);
    };

    const handleNext = () => {
        onNext?.(selectedOption);
    };

    return (
        <>
            <div
                className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
                role="radiogroup"
                aria-label="Service Options"
            >
                {options.map((option) => (
                    <OptionBox
                        key={option.id}
                        {...option}
                        isSelected={selectedOption === option.id}
                        onSelect={handleSelect}
                    />
                ))}
            </div>

            <div className="mt-8 flex justify-end">
                <Button className="px-12" onClick={handleNext}>
                    Next →
                </Button>
            </div>
        </>
    );
}
