'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BreadCrumb from '@/components/ui/BreadCrumb';
import ServicesSelection from '@/components/calculate/ServicesSelection';
import { CALCULATE_STEPS } from '@/constants/navigation';
import Button from '@/components/ui/Button';
import { EstimateService } from '@/types/services';

export default function Services() {
    const router = useRouter();
    const [selectedServices, setSelectedServices] = useState<
        EstimateService[]
    >([]);

    const handleServiceSelect = (service: EstimateService) => {
        setSelectedServices((prev) => [...prev, service]);
    };

    return (
        <main className="min-h-screen pt-24">
            <div className="container mx-auto">
                <BreadCrumb items={CALCULATE_STEPS} />
                <div className="flex gap-8 mt-12">
                    <ServicesSelection
                        selectedServices={selectedServices}
                        onServiceSelect={handleServiceSelect}
                    />
                    <div className="flex-1 flex justify-end">
                        <Button
                            onClick={() =>
                                router.push('/calculate/details')
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
