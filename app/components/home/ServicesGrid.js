const services = [
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
    // Add more services as needed
];

export default function ServicesGrid() {
    return (
        <section className="px-4 py-16 md:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10">
                    <h2 className="text-3xl font-bold mb-2">
                        Comprehensive Home Services
                    </h2>
                    <p className="text-gray-600">
                        at Your Fingertips
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {services.map((service) => (
                        <div
                            key={service.id}
                            className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                            {/* Service Image */}
                            <div className="relative h-48">
                                <img
                                    src={service.image}
                                    alt={service.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/20"></div>
                                <div className="absolute bottom-4 left-4 text-white">
                                    <h3 className="font-semibold text-lg">
                                        {service.title}
                                        <span className="text-sm ml-1">
                                            ({service.count})
                                        </span>
                                    </h3>
                                </div>
                            </div>

                            {/* Subcategories */}
                            <div className="p-4">
                                <ul className="space-y-2 text-sm text-gray-600">
                                    {service.subcategories.map(
                                        (subcat, index) => (
                                            <li
                                                key={index}
                                                className="hover:text-blue-600 cursor-pointer"
                                            >
                                                {subcat}
                                            </li>
                                        )
                                    )}
                                </ul>
                                <button className="text-blue-600 text-sm mt-3 hover:underline">
                                    More & categories
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
