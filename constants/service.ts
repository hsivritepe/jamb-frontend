export const SERVICE_CATEGORIES = {
    PLUMBING: 'Plumbing',
    FLOORING: 'Flooring',
    PAINTING: 'Painting',
    HEATING: 'Heating',
    LIGHTING: 'Lighting',
    ELECTRICAL: 'Electrical',
    LOCKS: 'Locks Opening',
    WINDOWS_DOORS: 'Windows and Doors',
    CLEANING: 'Cleaning',
    HVAC: 'HVAC',
    STRUCTURAL: 'Structural',
    APPLIANCE: 'Appliance Repair',
    GAS: 'Gas Services',
} as const;

export const ALL_SERVICES = [
    {
        id: '1gang-switch',
        title: '1-Gang Switch Installation',
        description:
            'Install a single-gang switch for controlling lights or appliances in compact spaces with professional precision.',
        price: 85,
        category: SERVICE_CATEGORIES.ELECTRICAL,
    },
    {
        id: '1gang-toggle',
        title: '1-Gang Toggle Switch Installation',
        description:
            'Install single toggle switches for streamlined and easy control of lights or devices in any room.',
        price: 75,
        category: SERVICE_CATEGORIES.ELECTRICAL,
    },
    {
        id: 'half-pipe-repair',
        title: '1/2" Pipe Emergency Repair',
        description:
            'Perform emergency repairs on 1/2-inch pipes to address urgent plumbing issues and minimize disruption.',
        price: 150,
        category: SERVICE_CATEGORIES.PLUMBING,
    },
    {
        id: '12-inch-concrete-pile',
        title: '12-Inch Concrete Pile Installation',
        description:
            'Install 12-inch concrete piles for deep foundation support in challenging soil conditions.',
        price: 200,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: '15-amp-outlet',
        title: '15 Amp Outlet Installation',
        description:
            'Add or upgrade 15-amp outlets for everyday electrical devices, ensuring safety and functionality.',
        price: 100,
        category: SERVICE_CATEGORIES.ELECTRICAL,
    },
    {
        id: '16-foot-garage-door',
        title: '16 Foot Garage Door Installation',
        description:
            'Install 16-foot garage doors to accommodate larger vehicles and enhance convenience.',
        price: 300,
        category: SERVICE_CATEGORIES.LOCKS,
    },
    {
        id: '2-gang-switch',
        title: '2-Gang Switch Installation',
        description:
            'Efficiently control multiple devices with the installation of a dual-gang switch tailored to your needs.',
        price: 150,
        category: SERVICE_CATEGORIES.ELECTRICAL,
    },
    {
        id: '2-gang-toggle',
        title: '2-Gang Toggle Switch Installation',
        description:
            'Install double toggle switches for a compact solution to controlling multiple light or device circuits.',
        price: 120,
        category: SERVICE_CATEGORIES.ELECTRICAL,
    },
    {
        id: '3-gang-switch',
        title: '3-Gang Switch Installation',
        description:
            'Install triple-gang switches to manage several fixtures or devices from one convenient location.',
        price: 200,
        category: SERVICE_CATEGORIES.ELECTRICAL,
    },
    {
        id: '3-gang-toggle',
        title: '3-Gang Toggle Switch Installation',
        description:
            'Install triple toggle switches to enhance functionality and provide efficient control of multiple circuits.',
        price: 180,
        category: SERVICE_CATEGORIES.ELECTRICAL,
    },
    {
        id: 'three-four-pipe-repair',
        title: '3/4" Pipe Emergency Repair',
        description:
            'Perform emergency repairs on 3/4-inch pipes to quickly restore functionality and prevent water damage.',
        price: 120,
        category: SERVICE_CATEGORIES.PLUMBING,
    },
    {
        id: '30-amp-outlet',
        title: '30 Amp Outlet Installation',
        description:
            'Install 30-amp outlets designed for higher energy requirements, perfect for heavy-duty equipment or specialized appliances.',
        price: 150,
        category: SERVICE_CATEGORIES.ELECTRICAL,
    },
    {
        id: '4-inch-non-bearing-wall',
        title: '4-Inch Non-Bearing Wall Installation',
        description:
            'Install 4-inch non-bearing walls to create new spaces or partitions without altering structural integrity.',
        price: 100,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: '50-amp-outlet',
        title: '50 Amp Outlet Installation',
        description:
            'Install 50-amp outlets for powering RVs, industrial equipment, or other high-capacity needs with safety and reliability.',
        price: 200,
        category: SERVICE_CATEGORIES.ELECTRICAL,
    },
    {
        id: '6-inch-load-bearing-wall',
        title: '6-Inch Load-Bearing Wall Installation',
        description:
            'Install 6-inch load-bearing walls to provide structural support and define spaces.',
        price: 150,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: '6-inch-suspended-concrete-slab',
        title: '6-Inch Suspended Concrete Slab Installation',
        description:
            'Install 6-inch suspended concrete slabs for strong and stable flooring or roofing solutions.',
        price: 180,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: '8-9-foot-garage-door',
        title: '8-9 Foot Garage Door Installation',
        description:
            'Install 8-9 foot garage doors for secure, durable, and functional vehicle access.',
        price: 350,
        category: SERVICE_CATEGORIES.LOCKS,
    },
    {
        id: 'alcove-bathtub',
        title: 'Alcove Bathtub Installation',
        description:
            'Install alcove bathtubs, ideal for smaller spaces, combining functionality with timeless style.',
        price: 250,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'bamboo-flooring',
        title: 'Bamboo Flooring Installation',
        description:
            'Install bamboo flooring for an eco-friendly, durable, and elegant finish.',
        price: 120,
        category: SERVICE_CATEGORIES.FLOORING,
    },
    {
        id: 'bamboo-flooring-removal',
        title: 'Bamboo Flooring Removal',
        description:
            'Remove bamboo flooring to prepare for a new flooring installation or redesign.',
        price: 100,
        category: SERVICE_CATEGORIES.FLOORING,
    },
    {
        id: 'barn-door',
        title: 'Barn Door Installation',
        description:
            'Install barn doors to add rustic charm and space-saving functionality to your interiors.',
        price: 200,
        category: SERVICE_CATEGORIES.WINDOWS_DOORS,
    },
    {
        id: 'baseboard',
        title: 'Baseboard Installation',
        description:
            'Install baseboards with precision for a polished and professional finish.',
        price: 100,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'baseboard-painting',
        title: 'Baseboard Painting',
        description:
            'Paint baseboards with precision to refresh and brighten the look of your room.',
        price: 80,
        category: SERVICE_CATEGORIES.PAINTING,
    },
    {
        id: 'baseboard-removal',
        title: 'Baseboard Removal',
        description:
            'Remove baseboards carefully to prepare walls and floors for updates or repairs.',
        price: 120,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'baseboard-staining-finishing',
        title: 'Baseboard Staining and Finishing',
        description:
            'Stain and finish baseboards to enhance their natural beauty and provide long-lasting protection.',
        price: 150,
        category: SERVICE_CATEGORIES.PAINTING,
    },
    {
        id: 'bathroom-accessories',
        title: 'Bathroom Accessories Installation',
        description:
            'Install bathroom accessories such as towel bars, shelves, and hooks for a polished and organized space.',
        price: 100,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'bathroom-demolition-removal',
        title: 'Bathroom Demolition and Removal',
        description:
            'Perform bathroom demolition and removal to clear the area for a complete remodel.',
        price: 200,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'bathroom-mirror',
        title: 'Bathroom Mirror Installation',
        description:
            'Install bathroom mirrors with precision, enhancing both functionality and decor.',
        price: 120,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'bathroom-wall-painting-color',
        title: 'Bathroom Wall Painting (Color)',
        description:
            "Paint bathroom walls in your chosen color to personalize and elevate your bathroom's design.",
        price: 150,
        category: SERVICE_CATEGORIES.PAINTING,
    },
    {
        id: 'bathroom-wall-painting-white',
        title: 'Bathroom Wall Painting (White)',
        description:
            'Paint bathroom walls in white for a bright, classic look that enhances the sense of cleanliness.',
        price: 130,
        category: SERVICE_CATEGORIES.PAINTING,
    },
    {
        id: 'battery-operated-smoke-detector',
        title: 'Battery-Operated Smoke Detector Installation',
        description:
            'Ensure your safety with quick and professional installation of battery-operated smoke detectors, providing reliable fire detection for your home or business.',
        price: 100,
        category: SERVICE_CATEGORIES.ELECTRICAL,
    },
    {
        id: 'beam',
        title: 'Beam Installation',
        description:
            'Install beams to provide critical structural support for ceilings, roofs, or floors.',
        price: 150,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'bidet-sprayer',
        title: 'Bidet Sprayer Installation',
        description:
            'Install bidet sprayers for an eco-friendly and hygienic alternative to traditional methods.',
        price: 120,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'block-sealing',
        title: 'Block Sealing',
        description:
            'Seal blocks to protect against water damage and improve structural durability.',
        price: 100,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'border',
        title: 'Border Installation',
        description:
            'Install borders to accent walls and create a defined, polished look for your space.',
        price: 120,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'brick-mold',
        title: 'Brick Mold Installation',
        description:
            'Install brick mold to provide a finished look and weatherproofing for exterior doors or windows.',
        price: 150,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'building-foundation-excavation',
        title: 'Building Foundation Excavation',
        description:
            'Excavate foundations for new construction, ensuring proper depth and stability.',
        price: 300,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'cabinet-drawer-front',
        title: 'Cabinet Drawer Front Installation',
        description:
            'Install cabinet drawer fronts to refresh the look and usability of your cabinetry.',
        price: 100,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'cabinetry-restoration-repair',
        title: 'Cabinetry Restoration and Repair',
        description:
            'Restore and repair cabinetry to extend its lifespan and improve aesthetics.',
        price: 180,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'carpet',
        title: 'Carpet Installation',
        description:
            'Install carpets to enhance comfort and add a cozy atmosphere to your space.',
        price: 120,
        category: SERVICE_CATEGORIES.FLOORING,
    },
    {
        id: 'carpet-pad',
        title: 'Carpet Pad Installation',
        description:
            'Install carpet pads for added comfort and to extend the life of your carpets.',
        price: 80,
        category: SERVICE_CATEGORIES.FLOORING,
    },
    {
        id: 'carpet-pad-removal',
        title: 'Carpet Pad Removal',
        description:
            'Remove carpet pads to prepare for new installations or floor repairs.',
        price: 100,
        category: SERVICE_CATEGORIES.FLOORING,
    },
    {
        id: 'carpet-removal',
        title: 'Carpet Removal',
        description:
            'Remove carpets safely and efficiently to prepare for new flooring or renovations.',
        price: 150,
        category: SERVICE_CATEGORIES.FLOORING,
    },
    {
        id: 'carpet-tile',
        title: 'Carpet Tile Installation',
        description:
            'Install carpet tiles for a modular, easy-to-maintain, and stylish flooring solution.',
        price: 120,
        category: SERVICE_CATEGORIES.FLOORING,
    },
    {
        id: 'casing',
        title: 'Casing Installation',
        description:
            'Install casings around doors or windows for a clean and decorative edge.',
        price: 100,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'ceiling-fan-removal',
        title: 'Ceiling Fan Removal',
        description:
            'Professionally remove ceiling fans with care to protect your space and prepare for updates or repairs.',
        price: 120,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'ceiling-fan-replacement',
        title: 'Ceiling Fan Replacement',
        description:
            'Replace old or malfunctioning ceiling fans with a new, energy-efficient model to enhance comfort and style in any room.',
        price: 150,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'ceiling-painting-seal-prime-paint',
        title: 'Ceiling Painting: Seal, Prime, and Paint',
        description:
            'Seal, prime, and paint ceilings for a flawless finish that brightens and rejuvenates any room.',
        price: 180,
        category: SERVICE_CATEGORIES.PAINTING,
    },
    {
        id: 'ceiling-structure',
        title: 'Ceiling Structure Installation',
        description:
            'Install ceiling structures to provide the framework for drywall or other ceiling finishes.',
        price: 200,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'cement-board',
        title: 'Cement Board Installation',
        description:
            'Install cement boards to provide a stable and water-resistant base for tile installations.',
        price: 120,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'ceramic-tile-customization',
        title: 'Ceramic Tile Customization',
        description:
            'Customize ceramic tiles with patterns or designs to create unique and personalized spaces.',
        price: 150,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'ceramic-tile',
        title: 'Ceramic Tile Installation',
        description:
            'Install ceramic tiles with precision to achieve a durable and visually appealing finish.',
        price: 120,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'ceramic-tile-regrouting',
        title: 'Ceramic Tile Regrouting',
        description:
            'Regrout ceramic tiles to refresh their appearance and improve water resistance.',
        price: 100,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'ceramic-tile-removal',
        title: 'Ceramic Tile Removal',
        description:
            'Remove ceramic tiles safely to prepare surfaces for new installations or repairs.',
        price: 150,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'ceramic-tile-repair',
        title: 'Ceramic Tile Repair',
        description:
            'Repair damaged ceramic tiles to restore functionality and aesthetics to your flooring or walls.',
        price: 120,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'chandelier-detach-reset-more-than-6-lights',
        title: 'Chandelier Detach and Reset (more than 6 lights)',
        description:
            'Detach and reset larger chandeliers with more than 6 lights, ensuring careful handling and secure reinstallation.',
        price: 200,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'chandelier-detach-reset-up-to-6-lights',
        title: 'Chandelier Detach and Reset (up to 6 lights)',
        description:
            'Safely detach and reset chandeliers with up to 6 lights for maintenance, cleaning, or repositioning.',
        price: 180,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'chandelier',
        title: 'Chandelier Installation',
        description:
            'Add elegance to any room with expertly installed chandeliers, from simple designs to intricate crystal fixtures.',
        price: 250,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'chimney-veneer',
        title: 'Chimney Veneer Installation',
        description:
            "Install chimney veneers for a refreshed, modern appearance that complements your home's design.",
        price: 150,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'chimney-veneer-removal',
        title: 'Chimney Veneer Removal',
        description:
            'Remove chimney veneers carefully to prepare for repairs, upgrades, or a new finish.',
        price: 120,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'circuit-breaker-fuse-troubleshooting',
        title: 'Circuit Breaker and Fuse Troubleshooting',
        description:
            'Diagnose and resolve issues with circuit breakers or fuses to restore power safely and efficiently.',
        price: 100,
        category: SERVICE_CATEGORIES.ELECTRICAL,
    },
    {
        id: 'clog-clearing',
        title: 'Clog Clearing',
        description:
            'Clear clogs quickly and effectively to restore proper drainage in sinks, tubs, or toilets.',
        price: 80,
        category: SERVICE_CATEGORIES.PLUMBING,
    },
    {
        id: 'color-door-painting-one-side',
        title: 'Color Door Painting (One Side)',
        description:
            "Paint one side of doors in your chosen color to make a statement or match your room's decor.",
        price: 100,
        category: SERVICE_CATEGORIES.PAINTING,
    },
    {
        id: 'color-door-painting-two-sides-jamb-trim',
        title: 'Color Door Painting (Two Sides, Jamb, and Trim)',
        description:
            'Paint both sides of doors, including jambs and trim, in your chosen color for a comprehensive update.',
        price: 150,
        category: SERVICE_CATEGORIES.PAINTING,
    },
    {
        id: 'color-trim-molding-painting-two-coats',
        title: 'Color Trim and Molding Painting (Two Coats)',
        description:
            'Apply two coats of color paint to trim and molding for a bold, sophisticated, and durable finish.',
        price: 120,
        category: SERVICE_CATEGORIES.PAINTING,
    },
    {
        id: 'color-wall-painting-two-coats',
        title: 'Color Wall Painting (Two Coats)',
        description:
            'Apply two coats of color paint for a rich and long-lasting finish on your interior walls.',
        price: 150,
        category: SERVICE_CATEGORIES.PAINTING,
    },
    {
        id: 'color-window-painting-one-side',
        title: 'Color Window Painting (One Side)',
        description:
            'Paint one side of windows in your chosen color to enhance the character of your space.',
        price: 100,
        category: SERVICE_CATEGORIES.PAINTING,
    },
    {
        id: 'color-window-painting-two-sides-jamb-trim',
        title: 'Color Window Painting (Two Sides, Jamb, and Trim)',
        description:
            'Paint both sides of windows, including jambs and trim, in your chosen color for a customized appearance.',
        price: 150,
        category: SERVICE_CATEGORIES.PAINTING,
    },
    {
        id: 'column',
        title: 'Column Installation',
        description:
            'Install columns to provide structural support or add architectural elegance to your space.',
        price: 180,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'concrete-masonry-painting-two-coats',
        title: 'Concrete and Masonry Painting (Two Coats)',
        description:
            'Apply two coats of paint to concrete or masonry surfaces for durable protection and enhanced aesthetics.',
        price: 120,
        category: SERVICE_CATEGORIES.PAINTING,
    },
    {
        id: 'concrete-masonry-wall-painting',
        title: 'Concrete and Masonry Wall Painting',
        description:
            'Paint concrete and masonry walls with durable finishes, protecting and beautifying hard surfaces.',
        price: 150,
        category: SERVICE_CATEGORIES.PAINTING,
    },
    {
        id: 'concrete-column',
        title: 'Concrete Column Installation',
        description:
            'Install concrete columns to provide vertical support in buildings or other structures.',
        price: 200,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'concrete-patching-up-to-14-sq-ft',
        title: 'Concrete Patching (up to 14 sq. ft.)',
        description:
            'Patch concrete surfaces up to 14 square feet to repair cracks or damage effectively.',
        price: 100,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'concrete-step',
        title: 'Concrete Step Installation',
        description:
            'Install concrete steps to provide safe, durable, and aesthetically pleasing access.',
        price: 120,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'concrete-wall',
        title: 'Concrete Wall Installation',
        description:
            'Install concrete walls for durable, long-lasting, and versatile structural solutions.',
        price: 250,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'countdown-timer',
        title: 'Countdown Timer Installation',
        description:
            'Install countdown timers for lights or devices, offering programmable energy savings and added convenience.',
        price: 100,
        category: SERVICE_CATEGORIES.ELECTRICAL,
    },
    {
        id: 'countertop-tile',
        title: 'Countertop Tile Installation',
        description:
            'Install countertop tiles for a durable and stylish surface in kitchens or bathrooms.',
        price: 150,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'crown-molding',
        title: 'Crown Molding Installation',
        description:
            'Install crown molding to add elegance and a refined touch to any room.',
        price: 120,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'crystal-chandelier',
        title: 'Crystal Chandelier Installation',
        description:
            'Install crystal chandeliers for a luxurious and stunning centerpiece in your living or dining area.',
        price: 300,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'curved-wall-radius',
        title: 'Curved Wall (Radius) Installation',
        description:
            'Install curved walls to add unique architectural interest to your interior or exterior spaces.',
        price: 180,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'cut-for-sink-opening-natural-marble',
        title: 'Cut for Sink Opening in Natural Marble',
        description:
            'Cut precise sink openings in natural marble for seamless integration with countertops.',
        price: 100,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'dimmer-switch',
        title: 'Dimmer Switch Installation',
        description:
            'Install dimmer switches to allow precise control over lighting intensity, enhancing ambiance and energy savings.',
        price: 120,
        category: SERVICE_CATEGORIES.ELECTRICAL,
    },
    {
        id: 'ditra-heat-heating-cables',
        title: 'Ditra-Heat Heating Cables Installation',
        description:
            'Install Ditra-Heat heating cables for efficient and customizable underfloor heating solutions.',
        price: 150,
        category: SERVICE_CATEGORIES.HEATING,
    },
    {
        id: 'door-staining-finishing-one-side-jamb-trim',
        title: 'Door Staining and Finishing (One Side, Jamb, and Trim)',
        description:
            'Stain and finish one side of doors, along with jambs and trim, for a natural and refined appearance.',
        price: 100,
        category: SERVICE_CATEGORIES.PAINTING,
    },
    {
        id: 'door-staining-finishing-two-sides-jamb-trim',
        title: 'Door Staining and Finishing (Two Sides, Jamb, and Trim)',
        description:
            'Stain and finish both sides of doors, including jambs and trim, for a cohesive and luxurious touch.',
        price: 150,
        category: SERVICE_CATEGORIES.PAINTING,
    },
    {
        id: 'double-basin-sink',
        title: 'Double Basin Sink Installation',
        description:
            'Install double basin sinks to provide versatility and efficiency in your kitchen.',
        price: 200,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'double-sink',
        title: 'Double Sink Installation',
        description:
            'Install double sinks to maximize space and usability in bathrooms or kitchens.',
        price: 180,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'drain-line-camera-inspection',
        title: 'Drain Line Camera Inspection',
        description:
            'Use drain line cameras to inspect pipes for clogs, leaks, or damage, ensuring accurate diagnostics.',
        price: 120,
        category: SERVICE_CATEGORIES.PLUMBING,
    },
    {
        id: 'drywall-repair-up-to-4-sq-ft',
        title: 'Drywall Repair (Up to 4 Square Feet)',
        description:
            'Patch and repair drywall to restore walls to their original, smooth finish.',
        price: 100,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'electric-bidet-seat',
        title: 'Electric Bidet Seat Installation',
        description:
            'Install electric bidet seats to upgrade your bathroom with modern, hygienic features.',
        price: 150,
        category: SERVICE_CATEGORIES.ELECTRICAL,
    },
    {
        id: 'electric-tankless-water-heater',
        title: 'Electric Tankless Water Heater Installation',
        description:
            'Install electric tankless water heaters to provide on-demand hot water while saving space and energy.',
        price: 200,
        category: SERVICE_CATEGORIES.HEATING,
    },
    {
        id: 'electric-water-heater',
        title: 'Electric Water Heater Installation',
        description:
            'Install electric water heaters to provide consistent hot water with energy-efficient operation.',
        price: 180,
        category: SERVICE_CATEGORIES.HEATING,
    },
    {
        id: 'engineered-strand-lumber',
        title: 'Engineered Strand Lumber Installation',
        description:
            'Install engineered strand lumber for strong, durable, and environmentally friendly framing solutions.',
        price: 250,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'engineered-wood-floating-floor',
        title: 'Engineered Wood Floating Floor Installation',
        description:
            'Install engineered wood flooring using a floating method for quick and efficient installation.',
        price: 150,
        category: SERVICE_CATEGORIES.FLOORING,
    },
    {
        id: 'engineered-wood-glue-down-floor',
        title: 'Engineered Wood Glue-Down Floor Installation',
        description:
            'Install engineered wood flooring with glue-down techniques for a durable and stable finish.',
        price: 180,
        category: SERVICE_CATEGORIES.FLOORING,
    },
    {
        id: 'engineered-wood-removal',
        title: 'Engineered Wood Removal',
        description:
            'Remove engineered wood flooring safely and efficiently to prepare for updates or repairs.',
        price: 120,
        category: SERVICE_CATEGORIES.FLOORING,
    },
    {
        id: 'exterior-door',
        title: 'Exterior Door Installation',
        description:
            'Install exterior doors to improve security, insulation, and curb appeal.',
        price: 200,
        category: SERVICE_CATEGORIES.WINDOWS_DOORS,
    },
    {
        id: 'fabric-wallpaper',
        title: 'Fabric Wallpaper Installation',
        description:
            'Install fabric wallpaper for a sophisticated and textured look that elevates your space.',
        price: 150,
        category: SERVICE_CATEGORIES.PAINTING,
    },
    {
        id: 'faucet-replacement',
        title: 'Faucet Replacement',
        description:
            'Upgrade your kitchen or bathroom with a modern faucet installed with care and precision.',
        price: 120,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'faulty-wiring-connection-troubleshooting',
        title: 'Faulty Wiring and Connection Troubleshooting',
        description:
            'Identify and repair faulty wiring or loose connections, restoring electrical safety and performance.',
        price: 100,
        category: SERVICE_CATEGORIES.ELECTRICAL,
    },
    {
        id: 'fire-alarm-detector',
        title: 'Fire Alarm Detector Installation',
        description:
            'Install reliable fire alarm systems to ensure maximum safety for your property.',
        price: 150,
        category: SERVICE_CATEGORIES.ELECTRICAL,
    },
    {
        id: 'fireplace-hearth-tile',
        title: 'Fireplace Hearth Tile Installation',
        description:
            'Install fireplace hearth tiles to enhance both the safety and style of your fireplace.',
        price: 180,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'fixed-track-lighting',
        title: 'Fixed Track Lighting Installation',
        description:
            'Install fixed track lighting for a sleek and contemporary lighting option that blends function and style.',
        price: 120,
        category: SERVICE_CATEGORIES.LIGHTING,
    },
    {
        id: 'flange-wax-ring-replacement',
        title: 'Flange and Wax Ring Replacement',
        description:
            'Replace toilet flanges and wax rings to prevent leaks and maintain a secure, watertight seal.',
        price: 100,
        category: SERVICE_CATEGORIES.PLUMBING,
    },
    {
        id: 'flat-pack-furniture-assembly-small-medium-items',
        title: 'Flat-Pack Furniture Assembly (Small and Medium Items)',
        description:
            'Assemble flat-pack furniture accurately and efficiently, saving you time and effort.',
        price: 120,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'floor-heating-mat',
        title: 'Floor Heating Mat Installation',
        description:
            'Install floor heating mats to add warmth and comfort to your tile or stone floors.',
        price: 150,
        category: SERVICE_CATEGORIES.HEATING,
    },
    {
        id: 'floor-outlet',
        title: 'Floor Outlet Installation',
        description:
            'Install floor outlets for discreet and convenient power access in open-plan spaces or specialized areas.',
        price: 120,
        category: SERVICE_CATEGORIES.ELECTRICAL,
    },
    {
        id: 'floor-tile',
        title: 'Floor Tile Installation',
        description:
            'Install floor tiles for a durable, easy-to-maintain, and visually striking surface.',
        price: 180,
        category: SERVICE_CATEGORIES.FLOORING,
    },
    {
        id: 'floor-laundry-pan-drain-rough-in-plumbing',
        title: 'Floor/Laundry Pan Drain Rough-In Plumbing',
        description:
            'Install or repair floor and laundry pan drains for reliable and efficient water drainage.',
        price: 150,
        category: SERVICE_CATEGORIES.PLUMBING,
    },
    {
        id: 'flush-mechanism',
        title: 'Flush Mechanism Repair',
        description:
            'Repair flush mechanisms to restore efficient operation and resolve any leaks or malfunctions.',
        price: 100,
        category: SERVICE_CATEGORIES.PLUMBING,
    },
    {
        id: 'foundation-backfilling',
        title: 'Foundation Backfilling',
        description:
            'Perform foundation backfilling to support and stabilize structures after excavation.',
        price: 200,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'framing-removal-structure',
        title: 'Framing Removal from Structure',
        description:
            'Remove framing from structures to prepare for renovations or demolitions.',
        price: 150,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'freestanding-bathtub-faucet',
        title: 'Freestanding Bathtub and Faucet Installation',
        description:
            'Install freestanding bathtubs and matching faucets for a luxurious and eye-catching bathroom upgrade.',
        price: 250,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'full-height-cabinet-detachment-resetting',
        title: 'Full Height Cabinet Detachment and Resetting',
        description:
            'Detach and reset full-height cabinets to accommodate renovations or adjustments.',
        price: 180,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'full-height-cabinet-removal',
        title: 'Full Height Cabinet Removal',
        description:
            'Remove full-height cabinets safely to prepare for new installations or redesigns.',
        price: 150,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'full-height-cabinet-seal-paint',
        title: 'Full Height Cabinet Seal and Paint',
        description:
            'Seal and paint full-height cabinets to protect them and give your space a refreshed, updated look.',
        price: 180,
        category: SERVICE_CATEGORIES.PAINTING,
    },
    {
        id: 'full-height-cabinet-strip-refinish-faces-only',
        title: 'Full Height Cabinet Strip and Refinish (Faces Only)',
        description:
            'Strip and refinish the faces of full-height cabinets to restore their beauty and durability.',
        price: 150,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'full-height-cabinet-painting',
        title: 'Full-height Cabinet Painting',
        description:
            'Paint full-height cabinets to match your design style and breathe new life into your space.',
        price: 180,
        category: SERVICE_CATEGORIES.PAINTING,
    },
    {
        id: 'garage-door',
        title: 'Garage Door Repair',
        description:
            'Repair garage doors to restore proper operation and ensure safety and security.',
        price: 150,
        category: SERVICE_CATEGORIES.LOCKS,
    },
    {
        id: 'garage-storage',
        title: 'Garage Storage Installation',
        description:
            'Optimize your garage with customized storage solutions for tools, equipment, and more.',
        price: 200,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'garbage-disposal',
        title: 'Garbage Disposal Installation',
        description:
            'Install garbage disposals for a convenient and eco-friendly way to manage kitchen waste.',
        price: 120,
        category: SERVICE_CATEGORIES.PLUMBING,
    },
    {
        id: 'garbage-disposal-removal',
        title: 'Garbage Disposal Removal',
        description:
            'Remove garbage disposals safely to prepare for replacements or repairs.',
        price: 100,
        category: SERVICE_CATEGORIES.PLUMBING,
    },
    {
        id: 'gas-water-heater',
        title: 'Gas Water Heater Installation',
        description:
            'Install gas water heaters for efficient and reliable hot water supply in your home.',
        price: 180,
        category: SERVICE_CATEGORIES.HEATING,
    },
    {
        id: 'glass-mosaic',
        title: 'Glass Mosaic Installation',
        description:
            'Install glass mosaics to add a modern, reflective, and colorful accent to your space.',
        price: 150,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'hardwired-smoke-detector',
        title: 'Hardwired Smoke Detector Installation',
        description:
            'Install hardwired smoke detectors for uninterrupted protection with backup batteries for added security, expertly wired into your building’s electrical system.',
        price: 200,
        category: SERVICE_CATEGORIES.ELECTRICAL,
    },
    {
        id: 'helical-post',
        title: 'Helical Post Installation',
        description:
            'Install helical posts to provide foundation support with minimal disruption to the site.',
        price: 180,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'humidity-sensor',
        title: 'Humidity Sensor Installation',
        description:
            'Control excess moisture with humidity sensors, helping to prevent mold growth and maintain indoor comfort.',
        price: 120,
        category: SERVICE_CATEGORIES.HEATING,
    },
    {
        id: 'interior-door',
        title: 'Interior Door Installation',
        description:
            'Install interior doors to enhance privacy, functionality, and style within your space.',
        price: 150,
        category: SERVICE_CATEGORIES.WINDOWS_DOORS,
    },
    {
        id: 'interior-door-removal',
        title: 'Interior Door Removal',
        description:
            'Remove interior doors safely to prepare for new installations or repairs.',
        price: 120,
        category: SERVICE_CATEGORIES.WINDOWS_DOORS,
    },
    {
        id: 'kitchen-faucet',
        title: 'Kitchen Faucet Installation',
        description:
            'Install kitchen faucets to enhance functionality and style in your cooking and cleaning areas.',
        price: 180,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'laminate-flooring',
        title: 'Laminate Flooring Installation',
        description:
            'Install laminate flooring for a budget-friendly, durable, and stylish surface.',
        price: 120,
        category: SERVICE_CATEGORIES.FLOORING,
    },
    {
        id: 'laminate-flooring-removal',
        title: 'Laminate Flooring Removal',
        description:
            'Remove laminate flooring carefully to prepare for new installations or renovations.',
        price: 100,
        category: SERVICE_CATEGORIES.FLOORING,
    },
    {
        id: 'leveling-cement',
        title: 'Leveling with Cement',
        description:
            'Level surfaces with cement to create a stable and even foundation for construction or installations.',
        price: 150,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'light-fixture',
        title: 'Light Fixture Installation',
        description:
            'Install beautiful and functional light fixtures to illuminate your space with precision and care.',
        price: 180,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'light-fixture-removal',
        title: 'Light Fixture Removal',
        description:
            'Safely remove light fixtures to make way for new designs, repairs, or upgrades while ensuring proper electrical disconnection.',
        price: 120,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'lighting-fixture-troubleshooting',
        title: 'Lighting and Fixture Troubleshooting',
        description:
            'Diagnose and fix issues with lighting fixtures, restoring proper function and enhancing illumination.',
        price: 100,
        category: SERVICE_CATEGORIES.ELECTRICAL,
    },
    {
        id: 'lower-upper-cabinet-painting',
        title: 'Lower/Upper Cabinet Painting',
        description:
            'Paint lower or upper cabinets with precision for a professional finish that enhances your room.',
        price: 150,
        category: SERVICE_CATEGORIES.PAINTING,
    },
    {
        id: 'lower-upper-cabinet-seal-paint',
        title: 'Lower/Upper Cabinet Seal and Paint',
        description:
            'Seal and paint lower or upper cabinets for added protection and a modernized appearance.',
        price: 180,
        category: SERVICE_CATEGORIES.PAINTING,
    },
    {
        id: 'lower-upper-cabinet-strip-refinish-faces-only',
        title: 'Lower/Upper Cabinet Strip and Refinish (Faces Only)',
        description:
            'Strip and refinish the faces of lower or upper cabinets to rejuvenate your kitchen or bathroom.',
        price: 150,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'manual-diaphragm-flush-valve',
        title: 'Manual Diaphragm Flush Valve Replacement',
        description:
            'Replace manual diaphragm flush valves for reliable, long-lasting performance in commercial or residential toilets.',
        price: 120,
        category: SERVICE_CATEGORIES.PLUMBING,
    },
    {
        id: 'marble-mosaic',
        title: 'Marble Mosaic Installation',
        description:
            'Install marble mosaics for a sophisticated and timeless decorative touch.',
        price: 180,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'masonry-fireplace-chimney-removal',
        title: 'Masonry Fireplace & Chimney Removal',
        description:
            'Remove masonry fireplaces and chimneys safely to prepare for new installations or redesigns.',
        price: 200,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'mold-removal-wall-protection',
        title: 'Mold Removal and Wall Protection',
        description:
            'Remove mold and protect walls with treatments that prevent future growth and damage.',
        price: 150,
        category: SERVICE_CATEGORIES.CLEANING,
    },
    {
        id: 'mortar-bed-preparation-tile-floors',
        title: 'Mortar Bed Preparation for Tile Floors',
        description:
            'Prepare mortar beds for tile floors to ensure a solid and durable base for the installation.',
        price: 120,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'mortar-bed-preparation-tile-walls',
        title: 'Mortar Bed Preparation for Tile Walls',
        description:
            'Prepare mortar beds for tile walls, providing a reliable and even surface for installations.',
        price: 150,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'mortar-bed-removal',
        title: 'Mortar Bed Removal',
        description:
            'Remove old mortar beds to prepare for updated flooring or repairs.',
        price: 100,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'mosaic-removal',
        title: 'Mosaic Removal',
        description:
            'Remove mosaics safely to prepare surfaces for new installations or redesigns.',
        price: 120,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'motion-sensor',
        title: 'Motion Sensor Installation',
        description:
            'Increase energy efficiency and convenience with motion sensor installations for hands-free lighting or device activation.',
        price: 150,
        category: SERVICE_CATEGORIES.ELECTRICAL,
    },
    {
        id: 'natural-stone-countertop',
        title: 'Natural Stone Countertop Installation',
        description:
            'Install natural stone countertops for a luxurious and durable addition to kitchens or bathrooms.',
        price: 250,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'natural-stone-mosaic',
        title: 'Natural Stone Mosaic Installation',
        description:
            'Install natural stone mosaics to create intricate and elegant designs on walls or floors.',
        price: 200,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'natural-stone-removal',
        title: 'Natural Stone Removal',
        description:
            'Remove natural stone tiles with care to protect the surrounding surfaces during renovations.',
        price: 180,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'natural-stone-sill',
        title: 'Natural Stone Sill Installation',
        description:
            'Install natural stone sills to enhance the look and functionality of windows or thresholds.',
        price: 150,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'natural-stone-threshold',
        title: 'Natural Stone Threshold Installation',
        description:
            'Install natural stone thresholds for a polished and durable transition between rooms.',
        price: 120,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'natural-stone-tile',
        title: 'Natural Stone Tile Installation',
        description:
            'Install natural stone tiles for a timeless and durable surface in your home or office.',
        price: 180,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'old-sink-removal',
        title: 'Old Sink Removal',
        description:
            'Safely remove old sinks to prepare the area for a new installation or remodel.',
        price: 100,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'old-water-heater-removal',
        title: 'Old Water Heater Removal',
        description:
            'Safely remove old water heaters for proper disposal and preparation for a new unit.',
        price: 120,
        category: SERVICE_CATEGORIES.HEATING,
    },
    {
        id: 'one-coat-refresh-ceiling-painting',
        title: 'One Coat Refresh Ceiling Painting',
        description:
            "Apply a single coat of paint to refresh ceilings, enhancing the room's overall cleanliness and brightness.",
        price: 150,
        category: SERVICE_CATEGORIES.PAINTING,
    },
    {
        id: 'outlet-switch-malfunction-troubleshooting',
        title: 'Outlet and Switch Malfunction Troubleshooting',
        description:
            'Repair malfunctioning outlets and switches to ensure safe and reliable power access throughout your home or business.',
        price: 100,
        category: SERVICE_CATEGORIES.ELECTRICAL,
    },
    {
        id: 'paintable-wallpaper',
        title: 'Paintable Wallpaper Installation',
        description:
            'Install paintable wallpaper to add subtle texture, allowing for a customized painted finish.',
        price: 120,
        category: SERVICE_CATEGORIES.PAINTING,
    },
    {
        id: 'parquet-flooring-removal',
        title: 'Parquet Flooring Removal',
        description:
            'Remove parquet flooring carefully to prepare for a new, modern flooring solution.',
        price: 100,
        category: SERVICE_CATEGORIES.FLOORING,
    },
    {
        id: 'patio-door',
        title: 'Patio Door Installation',
        description:
            'Install patio doors for seamless indoor-outdoor transitions and enhanced natural light.',
        price: 200,
        category: SERVICE_CATEGORIES.WINDOWS_DOORS,
    },
    {
        id: 'pedestal-sink-faucet',
        title: 'Pedestal Sink Faucet Installation',
        description:
            'Install faucets for pedestal sinks, combining functionality with a seamless aesthetic.',
        price: 150,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'pedestal-sink',
        title: 'Pedestal Sink Installation',
        description:
            'Install pedestal sinks to add a classic touch while saving space in compact bathrooms.',
        price: 120,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'pex-rough-in-plumbing-per-fixture',
        title: 'PEX Rough-In Plumbing per Fixture',
        description:
            'Perform PEX rough-in plumbing for fixtures, ensuring flexible and durable water supply lines.',
        price: 180,
        category: SERVICE_CATEGORIES.PLUMBING,
    },
    {
        id: 'phone-tv-speaker-outlet',
        title: 'Phone, TV, or Speaker Outlet Installation',
        description:
            'Install outlets for phone, TV, or speakers, ensuring seamless connections for entertainment and communication systems.',
        price: 150,
        category: SERVICE_CATEGORIES.ELECTRICAL,
    },
    {
        id: 'piano',
        title: 'Piano Move',
        description:
            'Safely and carefully move pianos to protect your valuable instrument during relocation.',
        price: 300,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'plywood-underlayment',
        title: 'Plywood Underlayment Installation',
        description:
            'Install plywood underlayment to provide a stable and durable base for your flooring.',
        price: 120,
        category: SERVICE_CATEGORIES.FLOORING,
    },
    {
        id: 'plywood-underlayment-removal',
        title: 'Plywood Underlayment Removal',
        description:
            'Remove plywood underlayment to prepare for new flooring or renovations.',
        price: 100,
        category: SERVICE_CATEGORIES.FLOORING,
    },
    {
        id: 'pocket-door',
        title: 'Pocket Door Installation',
        description:
            'Install pocket doors to maximize usable space with a sleek and modern design.',
        price: 180,
        category: SERVICE_CATEGORIES.WINDOWS_DOORS,
    },
    {
        id: 'popcorn-ceiling',
        title: 'Popcorn Ceiling Installation',
        description:
            'Install popcorn ceilings for a textured look that adds acoustic benefits and retro charm.',
        price: 120,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'popcorn-ceiling-removal',
        title: 'Popcorn Ceiling Removal',
        description:
            'Remove popcorn ceilings to create a modern, smooth surface ready for painting or other finishes.',
        price: 100,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'porcelain-mosaic',
        title: 'Porcelain Mosaic Installation',
        description:
            'Install porcelain mosaics for a durable and stylish decorative surface.',
        price: 150,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'porcelain-tile-customization',
        title: 'Porcelain Tile Customization',
        description:
            'Customize porcelain tiles to suit your style and add unique character to your space.',
        price: 180,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'porcelain-tile',
        title: 'Porcelain Tile Installation',
        description:
            'Install porcelain tiles for a durable, elegant, and low-maintenance surface.',
        price: 150,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'porcelain-tile-regrouting',
        title: 'Porcelain Tile Regrouting',
        description:
            'Regrout porcelain tiles to restore their integrity and refresh their look.',
        price: 120,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'porcelain-tile-removal',
        title: 'Porcelain Tile Removal',
        description:
            'Remove porcelain tiles carefully to prepare for new installations or renovations.',
        price: 150,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'porcelain-tile-repair',
        title: 'Porcelain Tile Repair',
        description:
            'Repair damaged porcelain tiles to restore their original appearance and usability.',
        price: 120,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'pre-finished-solid-wood-floor-repair',
        title: 'Pre-Finished Solid Wood Floor Repair',
        description:
            'Repair pre-finished solid wood floors to restore their original appearance and usability.',
        price: 100,
        category: SERVICE_CATEGORIES.FLOORING,
    },
    {
        id: 'pre-finished-solid-wood-flooring-removal',
        title: 'Pre-Finished Solid Wood Flooring Removal',
        description:
            'Remove pre-finished solid wood flooring to prepare for new installations or repairs.',
        price: 120,
        category: SERVICE_CATEGORIES.FLOORING,
    },
    {
        id: 'pre-finished-solid-wood-installation',
        title: 'Pre-Finished Solid Wood Installation',
        description:
            'Install pre-finished solid wood flooring for a timeless, durable, and ready-to-use option.',
        price: 150,
        category: SERVICE_CATEGORIES.FLOORING,
    },
    {
        id: 'rafter-structure',
        title: 'Rafter Structure Installation',
        description:
            'Install rafters for roof support, ensuring structural integrity and proper alignment.',
        price: 200,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'recessed-light',
        title: 'Recessed Light Installation',
        description:
            'Achieve a sleek, modern look with recessed lighting expertly installed for optimal illumination.',
        price: 180,
        category: SERVICE_CATEGORIES.LIGHTING,
    },
    {
        id: 'rectangular-tub-shower-combo',
        title: 'Rectangular Tub/Shower Combo Installation',
        description:
            'Install rectangular tub and shower combos, combining functionality with stylish design for your bathroom.',
        price: 250,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'refrigerator',
        title: 'Refrigerator Removal',
        description:
            'Safely remove old refrigerators for disposal or replacement, ensuring eco-friendly handling.',
        price: 150,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'self-adhesive-vinyl-tile',
        title: 'Self-Adhesive Vinyl Tile Installation',
        description:
            'Install self-adhesive vinyl tiles for a quick and hassle-free flooring upgrade.',
        price: 120,
        category: SERVICE_CATEGORIES.FLOORING,
    },
    {
        id: 'shower-base',
        title: 'Shower Base Replacement',
        description:
            'Replace worn or damaged shower bases with durable, waterproof solutions for a refreshed bathroom.',
        price: 180,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'shower-walls',
        title: 'Shower Walls Replacement',
        description:
            'Install new shower walls to enhance durability and elevate the aesthetics of your bathroom.',
        price: 200,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'single-hole-faucet',
        title: 'Single Hole Faucet Installation',
        description:
            'Install single-hole faucets for a modern, space-saving design with efficient water flow.',
        price: 150,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'single-sink',
        title: 'Single Sink Installation',
        description:
            'Install single sinks with precision for functionality and a polished bathroom appearance.',
        price: 120,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'sisal-wallpaper',
        title: 'Sisal Wallpaper Installation',
        description:
            'Install sisal wallpaper to introduce natural textures and a unique aesthetic to your walls.',
        price: 100,
        category: SERVICE_CATEGORIES.PAINTING,
    },
    {
        id: 'sliding-bathtub-door',
        title: 'Sliding Bathtub Door Installation',
        description:
            'Install sliding bathtub doors to maximize space and provide a modern, functional bathroom solution.',
        price: 200,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'sliding-closet-door',
        title: 'Sliding Closet Door Installation',
        description:
            'Install sliding closet doors for efficient access and a clean, streamlined look.',
        price: 180,
        category: SERVICE_CATEGORIES.WINDOWS_DOORS,
    },
    {
        id: 'sliding-shower-door',
        title: 'Sliding Shower Door Installation',
        description:
            'Install sliding shower doors for a sleek, space-saving solution that offers easy access and modern appeal.',
        price: 200,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'smart-toilet-bidet',
        title: 'Smart Toilet Bidet Installation',
        description:
            'Install smart toilet bidets for enhanced hygiene, comfort, and smart home integration.',
        price: 180,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'smoke-detector-detach-reset',
        title: 'Smoke Detector Detach and Reset',
        description:
            'Safely detach and reset your smoke detector to address issues or prepare for maintenance without compromising your safety.',
        price: 150,
        category: SERVICE_CATEGORIES.ELECTRICAL,
    },
    {
        id: 'solid-surface-countertop',
        title: 'Solid Surface Countertop Installation',
        description:
            'Install solid surface countertops for a sleek and seamless finish in any room.',
        price: 200,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'stairs-carpet',
        title: 'Stairs Carpet Installation',
        description:
            'Install stair carpets to improve safety, reduce noise, and add visual appeal.',
        price: 150,
        category: SERVICE_CATEGORIES.FLOORING,
    },
    {
        id: 'switch-replacement',
        title: 'Switch Replacement',
        description:
            'Upgrade or replace electrical switches for improved performance and aesthetics in your home or office.',
        price: 120,
        category: SERVICE_CATEGORIES.ELECTRICAL,
    },
    {
        id: 'tank-flapper',
        title: 'Tank Flapper Replacement',
        description:
            'Replace tank flappers to ensure proper flushing and prevent water wastage in your toilet.',
        price: 100,
        category: SERVICE_CATEGORIES.PLUMBING,
    },
    {
        id: 'tile-stone-repair',
        title: 'Tile and Stone Repair',
        description:
            'Repair damaged tiles or stone surfaces to restore their original appearance and functionality.',
        price: 120,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'tile-backsplash',
        title: 'Tile Backsplash Installation',
        description:
            'Install tile backsplashes to protect walls and enhance the look of your kitchen or bathroom.',
        price: 150,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'tile-flooring-regrouting',
        title: 'Tile Floor Regrouting',
        description:
            'Regrout tile floors to refresh their appearance and improve water resistance.',
        price: 120,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'toilet-supply',
        title: 'Toilet Supply and Installation',
        description:
            'Install new toilets or replace old ones for improved efficiency, comfort, and style.',
        price: 180,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'track-lighting-kit',
        title: 'Track Lighting Kit Installation',
        description:
            'Install track lighting kits to create versatile and customizable lighting solutions for homes or offices.',
        price: 150,
        category: SERVICE_CATEGORIES.LIGHTING,
    },
    {
        id: 'trim-molding-staining-finishing',
        title: 'Trim and Molding Staining and Finishing',
        description:
            'Stain and finish trim and molding to enhance their natural beauty and protect the wood surfaces.',
        price: 120,
        category: SERVICE_CATEGORIES.PAINTING,
    },
    {
        id: 'tub-surrounds',
        title: 'Tub Surrounds Installation',
        description:
            'Install tub surrounds to protect your walls and enhance the overall look of your bathtub area.',
        price: 150,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'uncoupling-mat-tile-installation',
        title: 'Uncoupling Mat for Tile Installation',
        description:
            'Install uncoupling mats to protect tiles from cracking and improve the longevity of your flooring.',
        price: 120,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'undermount-kitchen-sink',
        title: 'Undermount Kitchen Sink Installation',
        description:
            'Install undermount kitchen sinks for a sleek, professional appearance and easy cleaning.',
        price: 180,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'undermount-sink-faucet',
        title: 'Undermount Sink Faucet Installation',
        description:
            'Install undermount sink faucets to ensure proper alignment and leak-free connections.',
        price: 150,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'undermount-sink',
        title: 'Undermount Sink Installation',
        description:
            'Install undermount sinks for a clean, seamless appearance in your bathroom or kitchen.',
        price: 120,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'upper-wall-lower-base-cabinet',
        title: 'Upper (Wall) or Lower (Base) Cabinet Installation',
        description:
            'Install upper or lower cabinets with accuracy, enhancing functionality and storage space.',
        price: 180,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'urinal',
        title: 'Urinal Installation',
        description:
            'Install urinals for commercial or specialized bathroom setups with professional precision.',
        price: 200,
        category: SERVICE_CATEGORIES.PLUMBING,
    },
    {
        id: 'vanity-top',
        title: 'Vanity Top Removal',
        description:
            'Remove vanity tops to prepare for new installations or bathroom redesigns.',
        price: 150,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'veneer-chimney',
        title: 'Veneer and Chimney Cleaning',
        description:
            'Clean veneers and chimneys to maintain their appearance and improve efficiency.',
        price: 120,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'vessel-sink-faucet',
        title: 'Vessel Sink Faucet Installation',
        description:
            'Install vessel sink faucets to complement the design and functionality of your bathroom sink.',
        price: 180,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'vessel-sink',
        title: 'Vessel Sink Installation',
        description:
            'Install vessel sinks for a contemporary and stylish addition to your bathroom design.',
        price: 200,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'vinyl-covering',
        title: 'Vinyl Covering Installation',
        description:
            'Install vinyl coverings for a durable, water-resistant, and stylish surface.',
        price: 150,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'vinyl-covering-removal',
        title: 'Vinyl Covering Removal',
        description:
            'Remove vinyl coverings to prepare walls or floors for new finishes.',
        price: 120,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'vinyl-plank',
        title: 'Vinyl Plank Installation',
        description:
            'Transform your space with durable and stylish vinyl plank flooring, installed with precision.',
        price: 180,
        category: SERVICE_CATEGORIES.FLOORING,
    },
    {
        id: 'vinyl-plank-installation',
        title: 'Vinyl Plank Installation',
        description:
            'Install vinyl planks for a modern, durable, and easy-to-maintain flooring option.',
        price: 150,
        category: SERVICE_CATEGORIES.FLOORING,
    },
    {
        id: 'vinyl-stair-tread',
        title: 'Vinyl Stair Tread Installation',
        description:
            'Install vinyl stair treads for safety and a polished appearance on staircases.',
        price: 120,
        category: SERVICE_CATEGORIES.FLOORING,
    },
    {
        id: 'vinyl-tile',
        title: 'Vinyl Tile Installation',
        description:
            'Install vinyl tiles for a cost-effective, durable, and attractive flooring solution.',
        price: 180,
        category: SERVICE_CATEGORIES.FLOORING,
    },
    {
        id: 'vinyl-tile-removal',
        title: 'Vinyl Tile Removal',
        description:
            'Remove vinyl tiles carefully to prepare for new flooring installations.',
        price: 150,
        category: SERVICE_CATEGORIES.FLOORING,
    },
    {
        id: 'wall-mount-sink',
        title: 'Wall Mount Sink Installation',
        description:
            'Install wall-mounted sinks for a minimalist and modern look, ideal for small bathrooms or unique designs.',
        price: 120,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'wall-mounted-potfiller',
        title: 'Wall Mounted Potfiller Installation',
        description:
            'Install wall-mounted pot fillers to add convenience and luxury to your kitchen workspace.',
        price: 150,
        category: SERVICE_CATEGORIES.APPLIANCE,
    },
    {
        id: 'wall-painting-refresh-one-coat',
        title: 'Wall Painting Refresh (One Coat)',
        description:
            'Refresh walls with a single coat of paint, giving your space a renewed and vibrant appearance.',
        price: 120,
        category: SERVICE_CATEGORIES.PAINTING,
    },
    {
        id: 'wall-sconce',
        title: 'Wall Sconce Installation',
        description:
            'Enhance ambiance with professionally installed wall sconces, perfect for both decorative and practical lighting.',
        price: 150,
        category: SERVICE_CATEGORIES.LIGHTING,
    },
    {
        id: 'wall-staining-finishing',
        title: 'Wall Staining and Finishing',
        description:
            'Stain and finish walls to highlight natural textures while providing a polished, professional look.',
        price: 120,
        category: SERVICE_CATEGORIES.PAINTING,
    },
    {
        id: 'wall-veneer-panels',
        title: 'Wall Veneer Panels Installation',
        description:
            'Install wall veneer panels to add texture and style to your walls with a professional finish.',
        price: 180,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'wallpaper',
        title: 'Wallpaper Installation',
        description:
            'Install wallpaper to add color, texture, and character to your room with a flawless finish.',
        price: 150,
        category: SERVICE_CATEGORIES.PAINTING,
    },
    {
        id: 'wallpaper-removal',
        title: 'Wallpaper Removal',
        description:
            'Efficiently remove old wallpaper to prepare your walls for a fresh new look.',
        price: 120,
        category: SERVICE_CATEGORIES.PAINTING,
    },
    {
        id: 'waterproofing-tile-shower-101-120-sf',
        title: 'Waterproofing and Tile Shower Installation (101 to 120 SF)',
        description:
            'Install waterproofing and tiles in larger showers, up to 120 square feet, ensuring long-lasting results.',
        price: 200,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'waterproofing-tile-shower-61-100-sf',
        title: 'Waterproofing and Tile Shower Installation (61 to 100 SF)',
        description:
            'Install waterproofing and tiles in showers sized 61 to 100 square feet for enhanced protection and style.',
        price: 180,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'waterproofing-tile-shower-up-to-60-sf',
        title: 'Waterproofing and Tile Shower Installation (up to 60 SF)',
        description:
            'Install waterproofing and tiles in showers up to 60 square feet for a durable and leak-free finish.',
        price: 150,
        category: SERVICE_CATEGORIES.STRUCTURAL,
    },
    {
        id: 'white-door-painting-one-side',
        title: 'White Door Painting (One Side)',
        description:
            'Paint one side of doors in white to refresh and clean their appearance, adding elegance to the room.',
        price: 100,
        category: SERVICE_CATEGORIES.PAINTING,
    },
    {
        id: 'white-door-painting-two-sides-jamb-trim',
        title: 'White Door Painting (Two Sides, Jamb, and Trim)',
        description:
            'Paint both sides of doors, including jambs and trim, in white for a consistent and polished look.',
        price: 150,
        category: SERVICE_CATEGORIES.PAINTING,
    },
    {
        id: 'white-trim-molding-painting-one-coat-refresh',
        title: 'White Trim and Molding Painting (One Coat Refresh)',
        description:
            'Apply one coat of white paint to trim and molding to refresh and brighten edges and accents.',
        price: 120,
        category: SERVICE_CATEGORIES.PAINTING,
    },
    {
        id: 'white-wall-painting-two-coats',
        title: 'White Wall Painting (Two Coats)',
        description:
            'Apply two coats of white paint to walls for a clean, fresh, and uniform look.',
        price: 150,
        category: SERVICE_CATEGORIES.PAINTING,
    },
    {
        id: 'white-window-painting-one-side',
        title: 'White Window Painting (One Side)',
        description:
            'Paint one side of windows in white for a refreshed and brightened look that complements any decor.',
        price: 100,
        category: SERVICE_CATEGORIES.PAINTING,
    },
    {
        id: 'white-window-painting-two-sides-jamb-trim',
        title: 'White Window Painting (Two Sides, Jamb, and Trim)',
        description:
            'Paint both sides of windows, including jambs and trim, in white for a complete and uniform finish.',
        price: 150,
        category: SERVICE_CATEGORIES.PAINTING,
    },
    {
        id: 'wi-fi-dimmer-google-alexa-homekit',
        title: 'Wi-Fi Dimmer Installation (Google, Alexa, HomeKit)',
        description:
            'Seamlessly control your lighting with smart Wi-Fi dimmers compatible with popular voice assistants.',
        price: 120,
        category: SERVICE_CATEGORIES.ELECTRICAL,
    },
    {
        id: 'wi-fi-motion-sensor-dimmer',
        title: 'Wi-Fi Motion Sensor Dimmer Installation',
        description:
            'Install Wi-Fi motion sensor dimmers to combine smart lighting with automated control, perfect for modern homes or offices.',
        price: 150,
        category: SERVICE_CATEGORIES.ELECTRICAL,
    },
    {
        id: 'window-staining-finishing-one-side-jamb-trim',
        title: 'Window Staining and Finishing (One Side, Jamb, and Trim)',
        description:
            'Stain and finish one side of windows, along with jambs and trim, for a natural and elegant touch.',
        price: 100,
        category: SERVICE_CATEGORIES.PAINTING,
    },
    {
        id: 'window-staining-finishing-two-sides-jamb-trim',
        title: 'Window Staining and Finishing (Two Sides, Jamb, and Trim)',
        description:
            'Stain and finish both sides of windows, including jambs and trim, for a sophisticated and cohesive look.',
        price: 150,
        category: SERVICE_CATEGORIES.PAINTING,
    },
    {
        id: 'wiring-installation-no-conduits',
        title: 'Wiring Installation (no conduits)',
        description:
            'Install wiring without conduits for a clean and streamlined appearance where visible protection is not required.',
        price: 120,
        category: SERVICE_CATEGORIES.ELECTRICAL,
    },
    {
        id: 'wiring-metal-conduit',
        title: 'Wiring with Metal Conduit Installation',
        description:
            'Install wiring with metal conduits to provide robust protection for electrical systems in industrial or high-risk settings.',
        price: 150,
        category: SERVICE_CATEGORIES.ELECTRICAL,
    },
    {
        id: 'wiring-pvc-conduit',
        title: 'Wiring with PVC Conduit Installation',
        description:
            'Protect electrical wiring with durable PVC conduits, ensuring long-term safety and compliance.',
        price: 180,
        category: SERVICE_CATEGORIES.ELECTRICAL,
    },
    {
        id: 'wood-floor-sanding-staining-finishing',
        title: 'Wood Floor Sanding, Staining, and Finishing',
        description:
            'Sand, stain, and finish wood floors to restore their natural beauty and durability.',
        price: 200,
        category: SERVICE_CATEGORIES.FLOORING,
    },
] as const;
