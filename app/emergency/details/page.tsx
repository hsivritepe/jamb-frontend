'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import BreadCrumb from '@/components/ui/BreadCrumb';
import Button from '@/components/ui/Button';
import { SectionBoxTitle } from '@/components/ui/SectionBoxTitle';
import { EMERGENCY_STEPS } from '@/constants/navigation';

// Utility function to transform text
const capitalizeAndTransform = (text: string): string => {
  return text
    .replace(/([A-Z])/g, ' $1') // Add spaces before capital letters
    .trim() // Remove extra spaces
    .replace(/^./, (char) => char.toUpperCase()); // Capitalize the first letter
};

export default function EmergencyDetails() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse and type selectedServices
  const selectedServices: Record<string, string[]> = searchParams.get('services')
    ? JSON.parse(searchParams.get('services') as string)
    : {};

  const handleNext = () => {
    router.push('/emergency/estimate');
  };

  return (
    <main className="min-h-screen pt-24">
      <div className="container mx-auto">
        <BreadCrumb items={EMERGENCY_STEPS} />

        {/* Header and Next Button */}
        <div className="flex justify-between items-start mt-8">
          <SectionBoxTitle>Details</SectionBoxTitle>
          <Button onClick={handleNext}>Next →</Button>
        </div>

        {/* Render Selected Services */}
        <div className="flex flex-col gap-4 mt-8 w-full max-w-[550px]">
          {Object.entries(selectedServices).map(([category, services]) => {
            const categoryLabel = capitalizeAndTransform(category);

            return (
              <div
                key={category}
                className="p-4 border rounded-xl bg-white border-gray-300"
              >
                <h3 className="font-medium text-xl text-gray-800">
                  {categoryLabel}
                </h3>
                <div className="mt-4 flex flex-col gap-2">
                  {(services as string[]).map((service) => {
                    const serviceLabel = capitalizeAndTransform(service);

                    return (
                      <div
                        key={service}
                        className="flex justify-between items-center"
                      >
                        <span className="text-base text-gray-800">
                          {serviceLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}