'use client';

import { useState } from 'react';
import SearchServices from '@/components/SearchServices';
import ServiceAccordion from './ServiceAccordion';
import { ALL_SERVICES } from '@/constants/service';
import { EstimateService } from '@/types/services';
import { ChevronDown } from 'lucide-react';

interface ServicesSelectionProps {
    onServiceSelect?: (service: EstimateService) => void;
    selectedServices?: EstimateService[];
    isEmergency?: boolean;
}

// Helper function to group services by category
const groupServicesByCategory = (services: EstimateService[]) => {
    return services.reduce((acc, service) => {
        const category = service.category || 'Other';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(service);
        return acc;
    }, {} as Record<string, EstimateService[]>);
};

// Component to manage service selection and display grouped categories
export default function ServicesSelection({
    onServiceSelect,
    selectedServices = [],
    isEmergency,
}: ServicesSelectionProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
        new Set()
    );

    const handleServiceSelect = (service: EstimateService) => {
        if (onServiceSelect) {
            setExpandedCategories(
                (prev) =>
                    new Set(
                        Array.from(prev).concat([
                            `selected-${service.category}`,
                            service.category,
                        ])
                    )
            );
            onServiceSelect(service);
        }
    };

    const toggleCategory = (category: string) => {
        setExpandedCategories((prev) => {
            const next = new Set(prev);
            if (next.has(category)) {
                next.delete(category);
            } else {
                next.add(category);
            }
            return next;
        });
    };

    const filteredServices = searchQuery
        ? ALL_SERVICES.filter(
              (service) =>
                  !selectedServices.some((s) => s.id === service.id) &&
                  (service.title
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                      service.description
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()))
          )
        : [];

    const groupedServices = groupServicesByCategory(filteredServices);

    return (
        <div className="flex-1">
            {/* Search bar for filtering services */}
            <SearchServices
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Selected Services */}
            {selectedServices.length > 0 && (
                <div className="mt-4 space-y-2">
                    <h3 className="font-medium">
                        {isEmergency ? 'Selected Service' : 'Selected Services'}
                    </h3>
                    <div className="space-y-2">
                        {Object.entries(
                            groupServicesByCategory(selectedServices)
                        ).map(([category, services]) => (
                            <div key={category} className="border rounded-lg">
                                <div className="w-full p-4 flex justify-between items-center bg-gray-100">
                                    <h2 className="font-medium text-lg">{category}</h2>
                                </div>
                                <div className="p-4 space-y-4">
                                    {services.map((service) => (
                                        <ServiceAccordion
                                            key={service.id}
                                            service={service}
                                            isSelected={true}
                                            onToggle={() => handleServiceSelect(service)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Display services grouped by category */}
            <div className="mt-8 space-y-4">
                {Object.entries(groupedServices).map(([category, services]) => (
                    <div key={category} className="border rounded-lg">
                        <button
                            onClick={() => toggleCategory(category)}
                            className="w-full p-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100"
                        >
                            <h2 className="font-medium text-lg">{category}</h2>
                            <ChevronDown
                                className={`w-5 h-5 transform transition-transform ${
                                    expandedCategories.has(category) ? 'rotate-180' : ''
                                }`}
                            />
                        </button>
                        {expandedCategories.has(category) && (
                            <div className="p-4 space-y-4">
                                {services.map((service) => (
                                    <ServiceAccordion
                                        key={service.id}
                                        service={service}
                                        isSelected={selectedServices.some((s) => s.id === service.id)}
                                        onToggle={() => handleServiceSelect(service)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}