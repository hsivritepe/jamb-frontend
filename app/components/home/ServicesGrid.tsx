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
        count: 11,
        image: '/services/plumbing.jpg',
        subcategories: [],
    },
    // Add other services...
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service) => (
                        <a
                            key={service.id}
                            href={service.href}
                            className="group p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-shadow"
                        >
                            <img
                                src={service.icon}
                                alt={service.title}
                                className="w-12 h-12 mb-4"
                            />
                            <h3 className="text-xl font-semibold mb-2">
                                {service.title}
                            </h3>
                            <p className="text-gray-600">
                                {service.description}
                            </p>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
