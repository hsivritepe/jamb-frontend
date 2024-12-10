'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BreadCrumb from '@/components/ui/BreadCrumb';
import ServicesSelection from '@/components/calculate/ServicesSelection';
import { EMERGENCY_STEPS } from '@/constants/navigation';
import Button from '@/components/ui/Button';
import { EstimateService } from '@/types/services';
import { SectionBoxTitle } from '@/components/ui/SectionBoxTitle';

export default function EmergencyServices() {
    const router = useRouter();
    const [selectedService, setSelectedService] =
        useState<EstimateService | null>(null);

    const handleServiceSelect = (service: EstimateService) => {
        if (selectedService?.id === service.id) {
            setSelectedService(null);
        } else {
            setSelectedService(service);
        }
    };

    return (
        <main className="min-h-screen pt-24">
            <div className="container mx-auto">
                <BreadCrumb items={EMERGENCY_STEPS} />
                <SectionBoxTitle className="mt-12">
                    Let's quickly find the help you need
                </SectionBoxTitle>
                <div className="flex gap-8 mt-8">
                    <ServicesSelection
                        selectedServices={
                            selectedService ? [selectedService] : []
                        }
                        onServiceSelect={handleServiceSelect}
                        isEmergency
                    />
                    <div className="w-[400px] flex self-start justify-end">
                        <Button
                            onClick={() =>
                                router.push('/emergency/details')
                            }
                            disabled={!selectedService}
                        >
                            Next →
                        </Button>
                    </div>
                </div>
            </div>
        </main>
    );
}
