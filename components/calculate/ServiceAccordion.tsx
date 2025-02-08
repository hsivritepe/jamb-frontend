'use client';

import { Switch } from '@/components/ui/Switch';
import { EstimateService } from '@/types/services';

interface ServiceAccordionProps {
    service: EstimateService;
    isSelected: boolean;
    onToggle: () => void;
}

export default function ServiceAccordion({
    service,
    isSelected,
    onToggle,
}: ServiceAccordionProps) {
    return (
        <div className="border-b border-gray-200 rounded-lg">
            <div className="flex items-center justify-between p-2">
                <span className="text-md font-medium">
                    {service.title}
                </span>
                <Switch
                    checked={isSelected}
                    onCheckedChange={onToggle}
                />
            </div>
        </div>
    );
}
