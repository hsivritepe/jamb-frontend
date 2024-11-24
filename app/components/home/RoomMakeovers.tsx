import { Room } from '@/types/services';

const rooms: Room[] = [
    {
        id: 1,
        title: 'Living Room',
        description:
            'Transform your living space into a modern paradise',
        image: '/rooms/living-room.jpg',
        before: '/rooms/living-room-before.jpg',
        after: '/rooms/living-room-after.jpg',
    },
    // Add other rooms...
];

export default function RoomMakeovers() {
    return (
        <section className="py-16">
            <div className="bg-white rounded-2xl p-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">
                        Room Makeovers
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        See the transformation of spaces by our
                        professional team
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {rooms.map((room) => (
                        <div
                            key={room.id}
                            className="group relative overflow-hidden rounded-xl"
                        >
                            <img
                                src={room.image}
                                alt={room.title}
                                className="w-full aspect-[4/3] object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-6 flex flex-col justify-end">
                                <h3 className="text-white text-xl font-semibold mb-2">
                                    {room.title}
                                </h3>
                                <p className="text-white/80">
                                    {room.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
