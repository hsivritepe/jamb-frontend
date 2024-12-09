'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BreadCrumb from '@/components/ui/BreadCrumb';
import { CALCULATE_STEPS } from '@/constants/navigation';
import { SectionBoxTitle } from '@/components/ui/SectionBoxTitle';
import SearchServices from '@/components/SearchServices';
import ServiceAccordion from '@/components/calculate/ServiceAccordion';
import EstimateCalculation from '@/components/calculate/EstimateCalculation';
import { EstimateService } from '@/types/services';
import { ALL_SERVICES } from '@/constants/service';
import { ChevronDown } from 'lucide-react';

// Helper function to group services by category
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

export default function Estimate() {
    const [selectedServices, setSelectedServices] = useState<
        EstimateService[]
    >([]);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();
    const [expandedCategories, setExpandedCategories] = useState<
        Set<string>
    >(() => {
        const initialCategories = new Set<string>();
        selectedServices.forEach((service) => {
            initialCategories.add(service.category);
            initialCategories.add(`selected-${service.category}`);
        });
        return initialCategories;
    });

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

    const handleServiceToggle = (service: EstimateService) => {
        if (selectedServices.find((s) => s.id === service.id)) {
            setSelectedServices(
                selectedServices.filter((s) => s.id !== service.id)
            );
        } else {
            setExpandedCategories(
                (prev) =>
                    new Set(
                        Array.from(prev).concat([
                            service.category,
                            `selected-${service.category}`,
                        ])
                    )
            );
            setSelectedServices([...selectedServices, service]);
        }
    };

    return (
        <main className="min-h-screen pt-24">
            <div className="container mx-auto">
                <BreadCrumb items={CALCULATE_STEPS} />
            </div>

            <div className="container mx-auto py-12">
                <div className="flex gap-12">
                    {/* Left Column */}
                    <div className="flex-1">
                        <SectionBoxTitle>Services</SectionBoxTitle>
                        <p className="text-gray-600 mt-2 mb-8">
                            This is to accurately calculate the cost
                            of services
                        </p>

                        <SearchServices
                            value={searchQuery}
                            onChange={(e) =>
                                setSearchQuery(e.target.value)
                            }
                        />

                        {/* Selected Services */}
                        {selectedServices.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <h3 className="font-medium">
                                    Selected Services
                                </h3>
                                <div className="space-y-2">
                                    {Object.entries(
                                        groupServicesByCategory(
                                            selectedServices
                                        )
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
                                                <h2 className="font-mediumtext-lg">
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
                                                    {services.map(
                                                        (service) => (
                                                            <ServiceAccordion
                                                                key={
                                                                    service.id
                                                                }
                                                                service={
                                                                    service
                                                                }
                                                                isSelected={
                                                                    true
                                                                }
                                                                onToggle={() =>
                                                                    handleServiceToggle(
                                                                        service
                                                                    )
                                                                }
                                                            />
                                                        )
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Search Results */}
                        <div className="mt-12 space-y-4">
                            {filteredServices.length > 0 && (
                                <>
                                    <h3 className="font-medium">
                                        Search Results
                                    </h3>
                                    {Object.entries(
                                        groupedServices
                                    ).map(([category, services]) => (
                                        <div
                                            key={category}
                                            className="border rounded-lg"
                                        >
                                            <button
                                                onClick={() =>
                                                    toggleCategory(
                                                        category
                                                    )
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
                                                                    (
                                                                        s
                                                                    ) =>
                                                                        s.id ===
                                                                        service.id
                                                                )}
                                                                onToggle={() =>
                                                                    handleServiceToggle(
                                                                        {
                                                                            ...service,
                                                                            categoryId: 1,
                                                                        }
                                                                    )
                                                                }
                                                            />
                                                        )
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Estimate Calculation */}
                    <div className="w-[400px]">
                        <EstimateCalculation
                            selectedServices={selectedServices}
                        />

                        <div className="mt-6 space-y-4">
                            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium">
                                Get estimate itemization →
                            </button>
                            <button className="w-full text-brand border border-brand py-3 rounded-lg font-medium">
                                Add more services →
                            </button>

                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <div className="w-4 h-4 rounded-full bg-gray-100 flex-shrink-0" />
                                <p>
                                    You will be able to customize the
                                    details for each service in the
                                    next step
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
