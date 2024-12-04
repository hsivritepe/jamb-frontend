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

export default function Estimate() {
    const [selectedServices, setSelectedServices] = useState<
        EstimateService[]
    >([]);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

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

    const handleServiceToggle = (service: EstimateService) => {
        if (selectedServices.find((s) => s.id === service.id)) {
            setSelectedServices(
                selectedServices.filter((s) => s.id !== service.id)
            );
        } else {
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
                                    {selectedServices.map(
                                        (service) => (
                                            <ServiceAccordion
                                                key={service.id}
                                                service={service}
                                                isSelected={true}
                                                onToggle={() =>
                                                    handleServiceToggle(
                                                        service
                                                    )
                                                }
                                            />
                                        )
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Search Results */}
                        <div className="mt-8 space-y-4">
                            {filteredServices.map((service) => (
                                <ServiceAccordion
                                    key={service.id}
                                    service={service}
                                    isSelected={selectedServices.some(
                                        (s) => s.id === service.id
                                    )}
                                    onToggle={() =>
                                        handleServiceToggle({
                                            ...service,
                                            categoryId: 1,
                                        })
                                    }
                                />
                            ))}
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
