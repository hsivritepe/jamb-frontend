const rooms = [
    {
        id: 1,
        title: 'Bathroom',
        image: '/rooms/bathroom.jpg',
    },
    {
        id: 2,
        title: 'Kitchen',
        image: '/rooms/kitchen.jpg',
    },
    {
        id: 3,
        title: 'Living room',
        image: '/rooms/living-room.jpg',
    },
    {
        id: 4,
        title: 'Bedroom',
        image: '/rooms/bedroom.jpg',
    },
    {
        id: 5,
        title: 'Patio/Gardening',
        image: '/rooms/patio.jpg',
    },
    {
        id: 6,
        title: 'Home Office',
        image: '/rooms/home-office.jpg',
    },
    {
        id: 7,
        title: 'Storage room',
        image: '/rooms/storage.jpg',
    },
    {
        id: 8,
        title: 'Basement',
        image: '/rooms/basement.jpg',
    },
    // Add more rooms as needed
];

export default function RoomMakeovers() {
    return (
        <section className="px-4 py-16 md:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10">
                    <h2 className="text-3xl font-bold mb-2">
                        Whole-Room Makeovers, Done Right
                    </h2>
                    <p className="text-gray-600">
                        Comprehensive Home Renovations for Every Room
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {rooms.map((room) => (
                        <div
                            key={room.id}
                            className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer"
                        >
                            {/* Room Image */}
                            <img
                                src={room.image}
                                alt={room.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                            {/* Room Title */}
                            <div className="absolute bottom-4 left-4 text-white">
                                <h3 className="font-semibold text-lg">
                                    {room.title}
                                </h3>
                            </div>

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <button className="px-6 py-2 bg-white text-black rounded-full font-medium transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
