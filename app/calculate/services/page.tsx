'use client';

import BreadCrumb from '@/components/ui/BreadCrumb';
import { CALCULATE_STEPS } from '@/constants/navigation';
import ServicesGrid from '@/components/home/ServicesGrid';
import SearchServices from '@/components/SearchServices';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Services() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const handleNext = () => {
        // Here you'll handle form submission later
        console.log('Handle service selection and submission');
        router.push('/calculate/details');
    };

    return (
        <main className="min-h-screen pt-24">
            <div className="container mx-auto">
                <BreadCrumb items={CALCULATE_STEPS} />
            </div>

            <div className="container mx-auto pt-12">
                <div className="flex gap-8">
                    <div className="flex-1">
                        <SearchServices
                            value={searchQuery}
                            onChange={(e) =>
                                setSearchQuery(e.target.value)
                            }
                        />
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
