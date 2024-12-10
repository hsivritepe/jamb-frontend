import { SectionBoxSubtitle } from '../ui/SectionBoxSubtitle';
import { EstimateService } from '@/types/services';
import { useState } from 'react';

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

export default function EstimateCalculation({
    selectedServices,
}: {
    selectedServices: EstimateService[];
}) {
    const groupedServices = groupServicesByCategory(selectedServices);
    const subtotal = selectedServices.reduce(
        (sum, service) =>
            sum + service.price * (service.quantity || 1),
        0
    );
    const tax = subtotal * 0.012; // 12.00% tax
    const total = subtotal + tax;

    return (
        <div className="bg-brand-light p-6 rounded-xl">
            <SectionBoxSubtitle>Estimate</SectionBoxSubtitle>

            <div className="space-y-3">
                {Object.entries(groupedServices).map(
                    ([category, services]) => (
                        <div key={category}>
                            <div className="text-brand font-medium mb-2">
                                {category}
                            </div>
                            {services.map((service) => (
                                <div
                                    key={service.id}
                                    className="flex items-start gap-2"
                                >
                                    <span className="text-brand">
                                        •
                                    </span>
                                    <div className="flex-1 flex justify-between">
                                        <span className="text-gray-600">
                                            {service.title}
                                        </span>
                                        <span className="ml-4 flex-shrink-0">
                                            $
                                            {service.price.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>

            <div className="border-t border-gray-200 mt-4 pt-4">
                <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-4">
                    <span className="text-gray-600">
                        Sales tax (12.00%)
                    </span>
                    <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-semibold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
}
