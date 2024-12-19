'use client';

import { useRouter } from 'next/navigation';
import BreadCrumb from '@/components/ui/BreadCrumb';
import ServicesGrid from '@/components/home/ServicesGrid';
import { CALCULATE_STEPS } from '@/constants/navigation';

export default function Calculate() {
  const router = useRouter();

  return (
    <main className="min-h-screen pt-24">
      <div className="container mx-auto">
        {/* Breadcrumb for navigation */}
        <BreadCrumb items={CALCULATE_STEPS} />

        {/* Displaying ServicesGrid */}
        <ServicesGrid title="Select a Service" />
      </div>
    </main>
  );
}