'use client';

import { useRouter } from 'next/navigation';
import BreadCrumb from '@/components/ui/BreadCrumb';
import ServiceSelector from '@/components/calculate/ServiceSelector';
import type { ServiceOption } from '@/components/calculate/ServiceSelector';
import { EMERGENCY_STEPS } from '@/constants/navigation';
import Button from '@/components/ui/Button';
const serviceOptions: ServiceOption[] = [
    {
        id: 'one-off',
        title: 'One-off Services',
        description:
            'Select from our range of one-time services for quick and efficient home repairs. Ideal for immediate maintenance needs',
    },
    {
        id: 'rooms',
        title: 'Rooms',
        description:
            'Upgrade any room or exterior with our complete renovation services. From design to execution, we ensure a transformative experience',
    },
    {
        id: 'packages',
        title: 'Packages',
        description:
            'Opt for our monthly subscription packages for continuous home maintenance. Customize your plan to meet your specific needs',
    },
];

export default function Emergency() {
    const router = useRouter();

    const handleNext = () => {
        router.push('/emergency/services');
    };

    return (
        <main className="min-h-screen pt-24">
            <div className="container mx-auto mb-16">
                <BreadCrumb items={EMERGENCY_STEPS} />
                <div className="max-w-2xl mx-auto mt-16">
                    {/* Icon/Image Section */}
                    <div className="text-center mb-8">
                        <img
                            src="/images/about-emergency.png"
                            alt="Emergency Service"
                            className="mx-auto w-64"
                        />
                    </div>

                    {/* Text Content */}
                    <h1 className="text-3xl font-semibold mb-8 text-center">
                        Fast assistance for urgent home issues
                    </h1>

                    {/* Checklist */}
                    <div className="space-y-4 max-w-md mx-auto mb-12">
                        <div className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            <p>Select a service category</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            <p>
                                Describe your emergency with a photo
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            <p>
                                Get an instant estimate and time frame
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            <p>Customize details</p>
                        </div>
                    </div>

                    {/* Next Button */}
                    <div className="text-center">
                        <Button onClick={handleNext}>Next →</Button>
                    </div>
                </div>
            </div>
        </main>
    );
}
