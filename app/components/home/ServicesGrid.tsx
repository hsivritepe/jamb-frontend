import { ServiceItem } from '@/types/services';

const services: ServiceItem[] = [
    {
        id: 1,
        title: 'Electrical',
        count: 11,
        image: '/services/electrical.jpg',
        subcategories: ['Wiring', 'Switches', 'LED', 'Installation'],
    },
    {
        id: 2,
        title: 'Plumbing',
        count: 17,
        image: '/services/plumbing.jpg',
        subcategories: [
            'Pipes',
            'Shower',
            'Bath',
            'Faucet',
            'Water & Emergency',
        ],
    },
    {
        id: 3,
        title: 'Painting',
        count: 8,
        image: '/services/painting.jpg',
        subcategories: ['Interior', 'Exterior', 'Wall Painting'],
    },
    {
        id: 4,
        title: 'Tiling',
        count: 12,
        image: '/services/tiling.jpg',
        subcategories: ['Floor', 'Wall', 'Bathroom', 'Kitchen'],
    },
];

export default function ServicesGrid() {
    return (
        <section className="py-16">
            <div className="bg-white rounded-2xl p-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">
                        Our Services
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Discover our range of professional home
                        services designed to meet all your needs
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {services.map((service) => (
                        <div
                            key={service.id}
                            className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="aspect-[4/3] relative">
                                <img
                                    src={service.image}
                                    alt={service.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-lg font-semibold">
                                        {service.title}
                                    </h3>
                                    <span className="text-sm text-gray-500">
                                        {service.count} services
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {service.subcategories.map(
                                        (sub, index) => (
                                            <span
                                                key={index}
                                                className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full"
                                            >
                                                {sub}
                                            </span>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
