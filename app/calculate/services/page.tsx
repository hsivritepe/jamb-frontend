'use client';

import BreadCrumb from '@/components/ui/BreadCrumb';
import { CALCULATE_STEPS } from '@/constants/navigation';
import ServicesGrid from '@/components/home/ServicesGrid';
import SearchServices from '@/components/SearchServices';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function Services() {
    const router = useRouter();

    const handleNext = () => {
        // Here you'll handle form submission later
        console.log('Handle service selection and submission');
        router.push('/calculate/details');
    };

    return (
        <main className="min-h-screen pt-24">
            <div className="container mx-auto px-4">
                <BreadCrumb items={CALCULATE_STEPS} />
            </div>

            <div className="container mx-auto pt-12">
                <div className="flex gap-8">
                    <div className="flex-1">
                        <SearchServices />
                    </div>
                    <div className="flex-1 flex justify-end">
                        <Button onClick={handleNext}>Next →</Button>
                    </div>
                </div>
                <ServicesGrid title="" />
            </div>
        </main>
    );
}
