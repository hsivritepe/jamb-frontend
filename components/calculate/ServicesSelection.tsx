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

const groupServicesByCategory = (services: EstimateService[]) => {
    return services.reduce((acc, service) => {
        const category = (service as any).category || 'Other';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(service);
        return acc;
    }, {} as Record<string, EstimateService[]>);
};

export default function ServicesSelection({
    onServiceSelect,
    selectedServices = [],
    isEmergency,
}: ServicesSelectionProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategories, setExpandedCategories] = useState<
        Set<string>
    >(new Set());

    const filteredServices = searchQuery
        ? ALL_SERVICES.filter(
              (service) =>
                  !selectedServices.some(
                      (s) => s.id === service.id
                  ) &&
                  (service.title
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                      service.description
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()))
          )
        : [];

    const groupedServices = groupServicesByCategory(filteredServices);

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

    return (
        <div className="flex-1">
            <SearchServices
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Selected Services */}
            {selectedServices.length > 0 && (
                <div className="mt-4 space-y-2">
                    <h3 className="font-medium">
                        {isEmergency
                            ? 'Selected Service'
                            : 'Selected Services'}
                    </h3>
                    <div className="space-y-2">
                        {Object.entries(
                            groupServicesByCategory(selectedServices)
                        ).map(([category, services]) => (
                            <div
                                key={category}
                                className="border rounded-lg"
                            >
                                <button
                                    onClick={() =>
                                        toggleCategory(
                                            `selected-${category}`
                                        )
                                    }
                                    className="w-full p-4 flex justify-between items-center bg-gray-100 hover:bg-gray-200"
                                >
                                    <h2 className="font-medium text-lg">
                                        {category}
                                    </h2>
                                    <ChevronDown
                                        className={`w-5 h-5 transform transition-transform ${
                                            expandedCategories.has(
                                                `selected-${category}`
                                            )
                                                ? 'rotate-180'
                                                : ''
                                        }`}
                                    />
                                </button>
                                {expandedCategories.has(
                                    `selected-${category}`
                                ) && (
                                    <div className="p-4 space-y-4">
                                        {services.map((service) => (
                                            <ServiceAccordion
                                                key={service.id}
                                                service={service}
                                                isSelected={true}
                                                onToggle={() =>
                                                    onServiceSelect?.(
                                                        service
                                                    )
                                                }
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Search Results */}
            <div className="mt-8 space-y-4">
                {filteredServices.length > 0 && (
                    <>
                        <h3 className="font-medium">
                            Search Results
                        </h3>
                        {Object.entries(groupedServices).map(
                            ([category, services]) => (
                                <div
                                    key={category}
                                    className="border rounded-lg"
                                >
                                    <button
                                        onClick={() =>
                                            toggleCategory(category)
                                        }
                                        className="w-full p-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100"
                                    >
                                        <h2 className="font-medium text-lg">
                                            {category}
                                        </h2>
                                        <ChevronDown
                                            className={`w-5 h-5 transform transition-transform ${
                                                expandedCategories.has(
                                                    category
                                                )
                                                    ? 'rotate-180'
                                                    : ''
                                            }`}
                                        />
                                    </button>
                                    {expandedCategories.has(
                                        category
                                    ) && (
                                        <div className="p-4 space-y-4">
                                            {services.map(
                                                (service) => (
                                                    <ServiceAccordion
                                                        key={
                                                            service.id
                                                        }
                                                        service={
                                                            service
                                                        }
                                                        isSelected={selectedServices.some(
                                                            (s) =>
                                                                s.id ===
                                                                service.id
                                                        )}
                                                        onToggle={() =>
                                                            onServiceSelect?.(
                                                                service
                                                            )
                                                        }
                                                    />
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
