import { Check } from 'lucide-react';

const packages = [
    {
        id: 1,
        name: 'Basic package',
        description:
            'Perfect for basic home repairs and maintenance tasks',
        price: '80.00',
        period: '/month',
        features: ['Painting', 'Cleaning', 'Tiling'],
        popular: false,
    },
    {
        id: 2,
        name: 'Enhanced package',
        description:
            'Every plan includes basic features plus premium services',
        price: '140.00',
        period: '/month',
        features: [
            'Plumbing',
            'Electrical',
            'Carpentry',
            'HVAC Repair',
        ],
        popular: false,
    },
    {
        id: 3,
        name: 'All-inclusive package',
        description:
            'Complete home renovation and maintenance solution',
        price: '200.00',
        period: '/month',
        features: [
            'All Basic Features',
            'All Enhanced Features',
            'Priority Support',
            '24/7 Emergency',
        ],
        popular: true,
    },
];

export default function PricingPackages() {
    return (
        <section className="px-4 py-16 md:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold mb-12 text-center">
                    Tailored Service Packages for Every Home Solution
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {packages.map((pkg) => (
                        <div
                            key={pkg.id}
                            className={`relative rounded-2xl p-8 ${
                                pkg.popular
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white'
                            }`}
                        >
                            {pkg.popular && (
                                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-medium">
                                    Most Popular
                                </span>
                            )}

                            <div className="mb-6">
                                <h3 className="text-xl font-bold mb-2">
                                    {pkg.name}
                                </h3>
                                <p
                                    className={
                                        pkg.popular
                                            ? 'text-blue-100'
                                            : 'text-gray-600'
                                    }
                                >
                                    {pkg.description}
                                </p>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-baseline">
                                    <span className="text-3xl font-bold">
                                        $
                                    </span>
                                    <span className="text-4xl font-bold">
                                        {pkg.price}
                                    </span>
                                    <span
                                        className={`ml-2 ${
                                            pkg.popular
                                                ? 'text-blue-100'
                                                : 'text-gray-600'
                                        }`}
                                    >
                                        {pkg.period}
                                    </span>
                                </div>
                            </div>

                            <ul className="mb-8 space-y-4">
                                {pkg.features.map(
                                    (feature, index) => (
                                        <li
                                            key={index}
                                            className="flex items-center gap-3"
                                        >
                                            <Check className="w-5 h-5 flex-shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    )
                                )}
                            </ul>

                            <button
                                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                                    pkg.popular
                                        ? 'bg-white text-blue-600 hover:bg-gray-100'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                                Read more
                            </button>
                        </div>
                    ))}
                </div>

                {/* Custom Package Option */}
                <div className="mt-12 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h3 className="text-xl font-bold mb-2">
                                Configure your own package
                            </h3>
                            <p className="text-gray-300">
                                Mix and match any of the services you
                                need
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-2xl font-bold">
                                From $140.00
                            </span>
                            <button className="bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                                Read more
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
