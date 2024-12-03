'use client';

import { useRouter } from 'next/navigation';
import BreadCrumb from '@/components/ui/BreadCrumb';
import ServiceSelector from '@/components/calculate/ServiceSelector';
import type { ServiceOption } from '@/components/calculate/ServiceSelector';

const breadcrumbItems = [
    { label: 'Home', href: '/calculate' },
    { label: 'Services', href: '/calculate/services' },
    { label: 'Details', href: '/calculate/details' },
    { label: 'Estimate', href: '/calculate/estimate' },
    { label: 'Login', href: '/login' },
];

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

export default function Calculate() {
    const router = useRouter();

    const handleNext = (selectedId: string) => {
        router.push(`/calculate/services?type=${selectedId}`);
    };

    return (
        <main className="min-h-screen pt-24">
            <div className="container mx-auto px-4">
                <BreadCrumb items={breadcrumbItems} />
                <ServiceSelector
                    options={serviceOptions}
                    defaultSelected="one-off"
                    onNext={handleNext}
                />
            </div>
        </main>
    );
}
