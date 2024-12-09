'use client';

import { useRouter } from 'next/navigation';
import BreadCrumb from '@/components/ui/BreadCrumb';
import { EMERGENCY_STEPS } from '@/constants/navigation';
import { SectionBoxTitle } from '@/components/ui/SectionBoxTitle';
import { SectionBoxSubtitle } from '@/components/ui/SectionBoxSubtitle';
import Image from 'next/image';
export default function EmergencyEstimate() {
    const router = useRouter();

    return (
        <main className="min-h-screen pt-24">
            <div className="container mx-auto">
                <BreadCrumb items={EMERGENCY_STEPS} />
            </div>

            <div className="container mx-auto py-12">
                <div className="flex gap-12">
                    {/* Left Column - Steps */}
                    <div className="flex-1">
                        <SectionBoxTitle>
                            Immediate Steps for Burst Pipe Repair
                        </SectionBoxTitle>

                        <div className="mt-8 space-y-8 bg-gray-100 p-6 rounded-xl">
                            <div className="space-y-2">
                                <h3 className="text-lg font-medium">
                                    1. Burst pipes
                                </h3>
                                <p className="text-gray-600">
                                    First, quickly turn off the main
                                    water supply to your home. This
                                    valve is usually located near the
                                    water meter or where the main
                                    water line enters your house.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-lg font-medium">
                                    2. Drain the Faucets
                                </h3>
                                <p className="text-gray-600">
                                    After the water is off, open all
                                    faucets connected to the burst
                                    pipe to drain the remaining water.
                                    Don't forget to flush toilets to
                                    clear the water from the system
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-lg font-medium">
                                    3. Turn Off Electrical Appliances
                                </h3>
                                <p className="text-gray-600">
                                    If water from the burst pipe is
                                    near any electrical appliances or
                                    outlets, switch off the power at
                                    the breaker box to avoid
                                    electrical hazards
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-lg font-medium">
                                    4. Collect the Water
                                </h3>
                                <p className="text-gray-600">
                                    Use buckets, pots, or any large
                                    containers to collect dripping
                                    water. Lay towels around the
                                    affected area to absorb spills and
                                    minimize water damage
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-lg font-medium">
                                    5. Document the Damage
                                </h3>
                                <p className="text-gray-600">
                                    After the water is off, open all
                                    faucets connected to the burst
                                    pipe to drain the remaining water.
                                    Don't forget to flush toilets to
                                    clear the water from the system
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-lg font-medium">
                                    6. Stay Calm and Safe
                                </h3>
                                <p className="text-gray-600">
                                    Try to stay calm. Avoid using any
                                    electrical devices or appliances
                                    until the problem has been
                                    resolved and the area is declared
                                    safe
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-lg font-medium">
                                    7. Wait for Help
                                </h3>
                                <p className="text-gray-600">
                                    A plumbing specialist is on the
                                    way and will handle the repair.
                                    These steps have mitigated the
                                    damage and made the area safer for
                                    the specialist to work efficiently
                                    upon arrival
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Estimate */}
                    <div className="w-[400px] ">
                        <div className="bg-brand-light p-6 rounded-xl">
                            <div>
                                <SectionBoxSubtitle>
                                    Estimate
                                </SectionBoxSubtitle>
                                <div className="flex items-center gap-2 text-gray-500 mt-1">
                                    <span>Emergency</span>
                                    <span>•</span>
                                    <span>Plumbing</span>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-start gap-2 mt-4">
                                    <span className="text-brand">
                                        •
                                    </span>
                                    <div>
                                        <h3 className="font-medium">
                                            Burst pipes repair
                                        </h3>
                                        <div className="text-sm text-gray-500 mt-1">
                                            <span>Copper pipes</span>
                                            <span> • </span>
                                            <span>
                                                Diameter 0.1 meters
                                            </span>
                                            <span> • </span>
                                            <span>
                                                Length 3 meters
                                            </span>
                                        </div>
                                        <div className="mt-2 flex gap-2">
                                            <Image
                                                src="/images/burst-pipe-1.jpg"
                                                alt="Estimate"
                                                width={75}
                                                height={50}
                                            />
                                            <Image
                                                src="/images/burst-pipe-2.jpg"
                                                alt="Estimate"
                                                width={75}
                                                height={50}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">
                                        Subtotal
                                    </span>
                                    <span>$400.00</span>
                                </div>
                                <div className="flex justify-between mb-4">
                                    <span className="text-gray-600">
                                        Sales tax (8.25%)
                                    </span>
                                    <span>$49.50</span>
                                </div>
                                <div className="flex justify-between text-xl font-semibold">
                                    <span>Total</span>
                                    <span>From $649.50</span>
                                </div>
                            </div>

                            <div className="mt-6 space-y-4">
                                <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium">
                                    Add to order &nbsp;→
                                </button>
                                <button className="w-full text-brand border border-brand py-3 rounded-lg font-medium">
                                    Add more services &nbsp;→
                                </button>

                                <div className="flex items-start gap-2 text-sm bg-gray-100 p-2 rounded-lg text-gray-800">
                                    <div className="w-4 h-4 rounded-full bg-gray-300 flex-shrink-0 mt-0.5" />
                                    <p>
                                        You will be able to customize
                                        the details for each service
                                        in the next step
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
