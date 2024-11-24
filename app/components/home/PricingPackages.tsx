import { Check } from 'lucide-react';
import { PricingPlan } from '@/types/pricing';

const pricingPlans: PricingPlan[] = [
    {
        id: 1,
        name: 'Basic',
        price: 29,
        description: 'Perfect for small home maintenance',
        features: [
            { id: 1, text: '3 service requests per month' },
            { id: 2, text: 'Priority support' },
            { id: 3, text: 'Weekend availability' },
            { id: 4, text: 'Satisfaction guarantee' },
        ],
    },
    {
        id: 2,
        name: 'Pro',
        price: 49,
        description: 'Best for regular home maintenance',
        features: [
            { id: 1, text: 'Unlimited service requests' },
            { id: 2, text: '24/7 emergency support' },
            { id: 3, text: 'Same day service' },
            { id: 4, text: 'Dedicated account manager' },
        ],
        isPopular: true,
    },
    // Add other plans...
];

export default function PricingPackages() {
    return (
        <section className="py-16">
            <div className="bg-white rounded-2xl p-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Choose the perfect plan for your home
                        maintenance needs
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {pricingPlans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative p-8 border rounded-xl ${
                                plan.isPopular
                                    ? 'border-blue-500 shadow-lg'
                                    : 'border-gray-200'
                            }`}
                        >
                            {plan.isPopular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold mb-2">
                                    {plan.name}
                                </h3>
                                <div className="text-4xl font-bold mb-2">
                                    ${plan.price}
                                    <span className="text-lg text-gray-600">
                                        /month
                                    </span>
                                </div>
                                <p className="text-gray-600">
                                    {plan.description}
                                </p>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature) => (
                                    <li
                                        key={feature.id}
                                        className="flex items-center gap-3"
                                    >
                                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                        <span>{feature.text}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                                    plan.isPopular
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                }`}
                            >
                                {plan.isPopular
                                    ? 'Get Started'
                                    : 'Choose Plan'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
