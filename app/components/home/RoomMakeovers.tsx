import { Room } from '@/types/services';
import { ImageBoxGrid } from '../ui/ImageBoxGrid';
import { SectionBoxTitle } from '../ui/SectionBoxTitle';
const rooms: Room[] = [
    {
        id: 1,
        title: 'Living Room',
        image: '/images/rooms/living-room.jpg',
        url: '/services/living-room',
        subcategories: [
            'Furniture Arrangement',
            'Lighting Design',
            'Wall Treatment',
            'Entertainment Setup',
            'Window Styling',
            'Color Consultation',
            'Acoustic Treatment',
        ],
    },
    {
        id: 2,
        title: 'Kitchen',
        image: '/images/rooms/kitchen.jpg',
        url: '/services/kitchen',
        subcategories: [
            'Cabinet Installation',
            'Countertop Replacement',
            'Appliance Upgrade',
            'Island Design',
            'Backsplash Installation',
            'Lighting Setup',
            'Storage Solutions',
        ],
    },
    {
        id: 3,
        title: 'Bathroom',
        image: '/images/rooms/bathroom.jpg',
        url: '/services/bathroom',
        subcategories: [
            'Tile Installation',
            'Fixture Upgrade',
            'Vanity Replacement',
            'Lighting Design',
            'Storage Solutions',
        ],
    },
    {
        id: 4,
        title: 'Bedroom',
        image: '/images/rooms/bedroom.jpg',
        url: '/services/bedroom',
        subcategories: [
            'Closet Organization',
            'Lighting Design',
            'Wall Treatment',
            'Furniture Layout',
            'Window Treatment',
            'Color Consultation',
        ],
    },
    {
        id: 5,
        title: 'Patio Upgrading',
        image: '/images/rooms/patio.jpg',
        url: '/services/patio',
        subcategories: [
            'Deck Building',
            'Outdoor Kitchen',
            'Landscaping',
            'Lighting Installation',
            'Furniture Selection',
            'Pergola Construction',
        ],
    },
    {
        id: 6,
        title: 'Home Office',
        image: '/images/rooms/home-office.jpg',
        url: '/services/home-office',
        subcategories: [
            'Desk Setup',
            'Storage Solutions',
            'Lighting Design',
            'Cable Management',
            'Ergonomic Planning',
        ],
    },
    {
        id: 7,
        title: 'Storage',
        image: '/images/rooms/storage.jpg',
        url: '/services/storage',
        subcategories: [
            'Shelving Installation',
            'Custom Cabinets',
            'Organization System',
            'Space Planning',
            'Inventory Management',
        ],
    },
    {
        id: 8,
        title: 'Basement',
        image: '/images/rooms/basement.jpg',
        url: '/services/basement',
        subcategories: [
            'Waterproofing',
            'Flooring Installation',
            'Wall Finishing',
            'Lighting Design',
            'Entertainment Setup',
            'Climate Control',
        ],
    },
    {
        id: 9,
        title: 'Laundry Room',
        image: '/images/rooms/laundry-room.jpg',
        url: '/services/laundry-room',
        subcategories: [
            'Appliance Installation',
            'Storage Solutions',
            'Countertop Installation',
            'Sink Setup',
            'Ventilation',
        ],
    },
    {
        id: 10,
        title: 'Attic',
        image: '/images/rooms/attic.jpg',
        url: '/services/attic',
        subcategories: [
            'Insulation',
            'Ventilation',
            'Flooring',
            'Storage Solutions',
            'Lighting Installation',
            'Access Improvement',
        ],
    },
    {
        id: 11,
        title: 'Home Gym',
        image: '/images/rooms/home-gym.jpg',
        url: '/services/home-gym',
        subcategories: [
            'Equipment Layout',
            'Flooring Installation',
            'Mirror Installation',
            'Ventilation Setup',
            'Storage Solutions',
            'Sound System',
        ],
    },
    {
        id: 12,
        title: "Children's Playroom",
        image: '/images/rooms/childrens-playroom.jpg',
        url: '/services/childrens-playroom',
        subcategories: [
            'Safety Installation',
            'Storage Solutions',
            'Activity Zones',
            'Wall Art',
            'Flooring Installation',
            'Lighting Design',
        ],
    },
    {
        id: 13,
        title: 'Garage',
        image: '/images/rooms/garage.jpg',
        url: '/services/garage',
        subcategories: [
            'Storage System',
            'Workbench Setup',
            'Floor Coating',
            'Lighting Installation',
            'Organization Solutions',
            'Door Automation',
        ],
    },
    {
        id: 14,
        title: 'Smart Home',
        image: '/images/rooms/smart-home.jpg',
        url: '/services/smart-home',
        subcategories: [
            'Security System',
            'Lighting Automation',
            'Climate Control',
            'Entertainment Setup',
            'Voice Control',
            'Network Setup',
            'Device Integration',
        ],
    },
];

export default function RoomMakeovers() {
    return (
        <section className="py-16">
            <div>
                <SectionBoxTitle>
                    Whole-Room Makeovers, Done Right
                </SectionBoxTitle>

                <p className="text-gray-600 text-2xl pt-2 pb-6">
                    Comprehensive Home Renovations for Every Room
                </p>

                <ImageBoxGrid
                    items={rooms}
                    gridCols={4}
                    showCount={false}
                />
            </div>
        </section>
    );
}
